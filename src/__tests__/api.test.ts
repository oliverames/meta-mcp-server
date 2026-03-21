import { describe, it, expect } from "vitest";
import { MetaApiClient } from "../services/api.js";
import { handleApiError, errorResult, formatCurrency, formatBudget, formatDate, formatNumber, truncate, buildPaginationNote } from "../services/utils.js";
import { AxiosError } from "axios";
import { CHARACTER_LIMIT, GRAPH_API_BASE, THREADS_API_BASE } from "../constants.js";

describe("MetaApiClient", () => {
  describe("token validation", () => {
    it("throws helpful error when META_ACCESS_TOKEN is empty", async () => {
      const client = new MetaApiClient("");
      await expect(client.get("/me")).rejects.toThrow("META_ACCESS_TOKEN is not configured");
    });

    it("throws helpful error when META_ACCESS_TOKEN is empty on post", async () => {
      const client = new MetaApiClient("");
      await expect(client.post("/me/feed", { message: "test" })).rejects.toThrow("META_ACCESS_TOKEN is not configured");
    });

    it("throws helpful error when META_ACCESS_TOKEN is empty on delete", async () => {
      const client = new MetaApiClient("");
      await expect(client.delete("/12345")).rejects.toThrow("META_ACCESS_TOKEN is not configured");
    });

    it("throws helpful error when META_ACCESS_TOKEN is empty on delete with params", async () => {
      const client = new MetaApiClient("");
      await expect(client.delete("/12345/blocked", undefined, { uid: "67890" })).rejects.toThrow("META_ACCESS_TOKEN is not configured");
    });

    it("does not throw when token is provided", () => {
      const client = new MetaApiClient("valid_token");
      expect(() => client.requireUserToken()).not.toThrow();
    });
  });

  describe("threads token validation", () => {
    it("throws helpful error when THREADS_ACCESS_TOKEN is missing", () => {
      const client = new MetaApiClient("token");
      expect(() => client.requireThreadsToken()).toThrow("THREADS_ACCESS_TOKEN");
    });

    it("returns token when configured", () => {
      const client = new MetaApiClient("token", "threads_token");
      expect(client.requireThreadsToken()).toBe("threads_token");
    });

    it("hasThreadsToken returns correct boolean", () => {
      expect(new MetaApiClient("t").hasThreadsToken()).toBe(false);
      expect(new MetaApiClient("t", "tt").hasThreadsToken()).toBe(true);
    });
  });

  describe("page token caching", () => {
    it("caches and retrieves page tokens", () => {
      const client = new MetaApiClient("token");
      client.cachePageToken("page1", "page_token_1");
      expect(client.getPageToken("page1")).toBe("page_token_1");
      expect(client.requirePageToken("page1")).toBe("page_token_1");
    });

    it("throws on missing page token with helpful message", () => {
      const client = new MetaApiClient("token");
      expect(() => client.requirePageToken("unknown")).toThrow("Call meta_list_pages first");
    });

    it("tracks page token count", () => {
      const client = new MetaApiClient("token");
      expect(client.getPageTokenCount()).toBe(0);
      client.cachePageToken("p1", "t1");
      client.cachePageToken("p2", "t2");
      expect(client.getPageTokenCount()).toBe(2);
    });
  });

  describe("authentication error flow", () => {
    it("missing token error flows through handleApiError with setup instructions", () => {
      const client = new MetaApiClient("");
      try {
        client.requireUserToken();
      } catch (e) {
        const message = handleApiError(e);
        expect(message).toContain("META_ACCESS_TOKEN");
        expect(message).toContain("MCP server config");
        expect(message).toContain("developers.facebook.com/tools/explorer");
      }
    });

    it("missing threads token error flows through handleApiError", () => {
      const client = new MetaApiClient("token");
      try {
        client.requireThreadsToken();
      } catch (e) {
        const message = handleApiError(e);
        expect(message).toContain("THREADS_ACCESS_TOKEN");
      }
    });

    it("missing page token error mentions meta_list_pages", () => {
      const client = new MetaApiClient("token");
      try {
        client.requirePageToken("12345");
      } catch (e) {
        const message = handleApiError(e);
        expect(message).toContain("meta_list_pages");
      }
    });
  });
});

describe("constants", () => {
  it("GRAPH_API_BASE uses https", () => {
    expect(GRAPH_API_BASE).toMatch(/^https:\/\/graph\.facebook\.com\/v\d+\.\d+$/);
  });

  it("THREADS_API_BASE uses https", () => {
    expect(THREADS_API_BASE).toMatch(/^https:\/\/graph\.threads\.net\/v\d+\.\d+$/);
  });
});

describe("handleApiError", () => {
  it("provides actionable guidance for expired token (code 190)", () => {
    const error = new AxiosError("Request failed");
    (error as any).response = {
      status: 400,
      data: {
        error: {
          code: 190,
          error_subcode: 463,
          message: "Error validating access token",
        },
      },
    };
    const result = handleApiError(error);
    expect(result).toContain("190");
    expect(result).toContain("463");
    expect(result).toContain("invalid or expired");
    expect(result).toContain("developers.facebook.com/tools/explorer");
  });

  it("provides actionable guidance for missing permission (code 10)", () => {
    const error = new AxiosError("Request failed");
    (error as any).response = {
      status: 400,
      data: {
        error: {
          code: 10,
          message: "Permission not granted",
        },
      },
    };
    const result = handleApiError(error);
    expect(result).toContain("Missing permission");
    expect(result).toContain("developers.facebook.com/tools/explorer");
  });

  it("handles 401 without Meta error body", () => {
    const error = new AxiosError("Unauthorized");
    (error as any).response = { status: 401, data: {} };
    expect(handleApiError(error)).toContain("Unauthorized");
  });

  it("handles 429 rate limit", () => {
    const error = new AxiosError("Too many");
    (error as any).response = { status: 429, data: {} };
    expect(handleApiError(error)).toContain("Rate limit");
  });

  it("handles timeout", () => {
    const error = new AxiosError("Timeout");
    error.code = "ECONNABORTED";
    expect(handleApiError(error)).toContain("timed out");
  });

  it("handles network error", () => {
    const error = new AxiosError("Network");
    error.code = "ENOTFOUND";
    expect(handleApiError(error)).toContain("Cannot reach");
  });

  it("handles plain Error", () => {
    expect(handleApiError(new Error("Something broke"))).toBe("Error: Something broke");
  });

  it("handles unknown error", () => {
    expect(handleApiError("string error")).toBe("Error: Unexpected error occurred.");
  });
});

describe("errorResult", () => {
  it("returns MCP-compliant error with isError flag", () => {
    const result = errorResult(new Error("test error"));
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("test error");
  });

  it("works with AxiosError", () => {
    const error = new AxiosError("Timeout");
    error.code = "ECONNABORTED";
    const result = errorResult(error);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("timed out");
  });
});

describe("utility functions", () => {
  describe("formatCurrency", () => {
    it("formats cents to dollars", () => {
      expect(formatCurrency("10000")).toBe("100.00 USD");
      expect(formatCurrency("50")).toBe("0.50 USD");
    });

    it("handles custom currency", () => {
      expect(formatCurrency("10000", "EUR")).toBe("100.00 EUR");
    });

    it("returns N/A for undefined", () => {
      expect(formatCurrency(undefined)).toBe("N/A");
    });
  });

  describe("formatBudget", () => {
    it("formats daily budget", () => {
      expect(formatBudget("5000")).toContain("/day");
    });

    it("formats lifetime budget", () => {
      expect(formatBudget(undefined, "100000")).toContain("lifetime");
    });

    it("returns N/A when neither", () => {
      expect(formatBudget()).toBe("N/A");
    });
  });

  describe("formatDate", () => {
    it("formats ISO date string", () => {
      const result = formatDate("2024-01-15T10:30:00Z");
      expect(result).toContain("2024");
      expect(result).toContain("Jan");
    });

    it("returns N/A for undefined", () => {
      expect(formatDate()).toBe("N/A");
    });
  });

  describe("formatNumber", () => {
    it("formats numbers with locale separators", () => {
      expect(formatNumber(1000)).toContain("1");
      expect(formatNumber("5000000")).toContain("5");
    });

    it("returns N/A for undefined", () => {
      expect(formatNumber(undefined)).toBe("N/A");
    });

    it("handles NaN gracefully", () => {
      expect(formatNumber("not_a_number")).toBe("not_a_number");
    });
  });

  describe("truncate", () => {
    it("returns text unchanged if under limit", () => {
      expect(truncate("short text")).toBe("short text");
    });

    it("truncates and adds notice for long text", () => {
      const long = "x".repeat(CHARACTER_LIMIT + 100);
      const result = truncate(long, "items");
      expect(result.length).toBeGreaterThan(CHARACTER_LIMIT);
      expect(result).toContain("truncated");
      expect(result).toContain("items");
    });
  });

  describe("buildPaginationNote", () => {
    it("builds note with cursor", () => {
      const note = buildPaginationNote(20, "abc123");
      expect(note).toContain("abc123");
      expect(note).toContain("20");
    });

    it("returns empty without cursor", () => {
      expect(buildPaginationNote(20)).toBe("");
    });
  });
});
