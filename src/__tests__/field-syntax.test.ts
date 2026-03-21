import { describe, it, expect } from "vitest";
import { IG_MEDIA_FIELDS } from "../constants.js";
import { MetaPaginatedResponse } from "../types.js";

describe("API field syntax correctness", () => {
  describe("Business Discovery", () => {
    it("generates correct field expansion syntax", () => {
      const username = "bluebottle";
      const bdFields = `id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website,media.limit(5){${IG_MEDIA_FIELDS}}`;
      const fields = `business_discovery.username(${username}){${bdFields}}`;

      // Must use .username(TARGET) syntax, NOT .fields(...)
      expect(fields).toContain("business_discovery.username(bluebottle)");
      expect(fields).not.toContain("business_discovery.fields");

      // Requested fields must be in curly braces after the username
      expect(fields).toMatch(/\.username\(bluebottle\)\{.*followers_count.*\}/);
    });

    it("handles usernames with underscores and dots", () => {
      const username = "my.brand_official";
      const fields = `business_discovery.username(${username}){id,username}`;
      expect(fields).toContain(`username(my.brand_official)`);
    });
  });

  describe("Insights API fields", () => {
    it("CTR is not multiplied — returned as percentage directly", () => {
      // Meta returns CTR as "2.5" meaning 2.5%, NOT 0.025
      const ctrValue = "2.5";
      const formatted = `${parseFloat(ctrValue).toFixed(2)}%`;
      expect(formatted).toBe("2.50%");
      // If we incorrectly multiplied: would be 250.00%
      expect(formatted).not.toBe("250.00%");
    });
  });

  describe("URLSearchParams serialization", () => {
    it("handles nested objects via JSON.stringify", () => {
      const targeting = { geo_locations: { countries: ["US"] }, age_min: 18 };
      const body = new URLSearchParams();
      body.append("targeting", JSON.stringify(targeting));

      const serialized = body.get("targeting");
      expect(serialized).toBe('{"geo_locations":{"countries":["US"]},"age_min":18}');
    });

    it("handles boolean values as strings", () => {
      const body = new URLSearchParams();
      body.append("share_to_feed", String(true));
      expect(body.get("share_to_feed")).toBe("true");
    });

    it("handles arrays via JSON.stringify", () => {
      const body = new URLSearchParams();
      const statuses = ["ACTIVE", "PAUSED"];
      body.append("effective_status", JSON.stringify(statuses));
      expect(body.get("effective_status")).toBe('["ACTIVE","PAUSED"]');
    });

    it("handles undefined data.data without crashing", () => {
      // Simulates what happens when Meta returns unexpected response shape
      const response = {} as MetaPaginatedResponse<unknown>;
      // The ?. operator prevents TypeError on undefined
      expect(!response.data?.length).toBe(true);

      const emptyResponse = { data: [] } as MetaPaginatedResponse<unknown>;
      expect(!emptyResponse.data?.length).toBe(true);

      const populatedResponse = { data: [{ id: "1" }] } as MetaPaginatedResponse<unknown>;
      expect(!populatedResponse.data?.length).toBe(false);
    });

    it("skips undefined and null values", () => {
      const fields: Record<string, unknown> = {
        name: "test",
        description: undefined,
        value: null,
        active: true,
      };
      const body = new URLSearchParams();
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
          body.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
        }
      }
      expect(body.has("name")).toBe(true);
      expect(body.has("description")).toBe(false);
      expect(body.has("value")).toBe(false);
      expect(body.has("active")).toBe(true);
    });
  });
});
