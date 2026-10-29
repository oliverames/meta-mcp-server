import { describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPageTools } from "../tools/pages.js";
import { MetaApiClient } from "../services/api.js";
import { formatDate } from "../services/utils.js";

// formatDate renders in the local timezone; pin it so the date assertions
// below don't flip to the previous day on hosts west of UTC-8.
process.env.TZ = "UTC";

type RegisteredTool = {
  name: string;
  callback: (args: Record<string, unknown>) => Promise<any>;
};

describe("formatDate", () => {
  it("formats ISO date-time strings unchanged", () => {
    expect(formatDate("2026-10-30T08:00:00+0000")).toMatch(/Oct 30, 2026/);
  });

  it("treats Unix seconds as seconds, not milliseconds", () => {
    // 1793347200 seconds = Oct 30, 2026 — as milliseconds it would be Jan 21, 1970
    expect(formatDate(1793347200)).toMatch(/Oct 30, 2026/);
    expect(formatDate(1793347200)).not.toMatch(/1970/);
  });

  it("treats all-digit strings as Unix seconds", () => {
    expect(formatDate("1793347200")).toMatch(/Oct 30, 2026/);
  });

  it("passes through millisecond-sized numbers unchanged", () => {
    expect(formatDate(1793347200000)).toMatch(/Oct 30, 2026/);
  });

  it("returns N/A for missing input", () => {
    expect(formatDate()).toBe("N/A");
    expect(formatDate("")).toBe("N/A");
  });
});

describe("meta_get_scheduled_posts", () => {
  it("renders scheduled_publish_time (Unix seconds) as a real date", async () => {
    const registrations: RegisteredTool[] = [];
    const server = {
      registerTool(name: string, _config: unknown, callback: RegisteredTool["callback"]) {
        registrations.push({ name, callback });
      },
    } as unknown as McpServer;
    const client = {
      requirePageToken: vi.fn().mockReturnValue("page-token"),
      getWithToken: vi.fn().mockResolvedValue({
        data: [
          {
            id: "page-1_post-9",
            message: "scheduled hello",
            created_time: "2026-10-30T08:00:00+0000",
            scheduled_publish_time: 1793347200,
            is_published: false,
          },
        ],
      }),
    } as unknown as MetaApiClient;

    registerPageTools(server, client);

    const tool = registrations.find(({ name }) => name === "meta_get_scheduled_posts");
    expect(tool).toBeDefined();

    const result = await tool!.callback({ page_id: "page-1", response_format: "markdown" });
    const text = result.content[0].text as string;

    expect(text).toContain("Oct 30, 2026");
    expect(text).not.toContain("1970");
  });
});
