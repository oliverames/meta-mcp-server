import { describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPageTools } from "../tools/pages.js";
import { MetaApiClient } from "../services/api.js";

type RegisteredTool = {
  name: string;
  callback: (args: Record<string, unknown>) => Promise<any>;
};

describe("Facebook Page comment tools", () => {
  it("posts a new top-level comment to the post comments edge", async () => {
    const registrations: RegisteredTool[] = [];
    const server = {
      registerTool(name: string, _config: unknown, callback: RegisteredTool["callback"]) {
        registrations.push({ name, callback });
      },
    } as unknown as McpServer;
    const client = {
      requirePageToken: vi.fn().mockReturnValue("page-token"),
      post: vi.fn().mockResolvedValue({ id: "comment-123" }),
    } as unknown as MetaApiClient;

    registerPageTools(server, client);

    const tool = registrations.find(({ name }) => name === "meta_create_post_comment");
    expect(tool).toBeDefined();

    const result = await tool!.callback({
      post_id: "page-123_post-456",
      page_id: "page-123",
      message: "A sourced creator comment",
      response_format: "markdown",
    });

    expect(client.requirePageToken).toHaveBeenCalledWith("page-123");
    expect(client.post).toHaveBeenCalledWith(
      "/page-123_post-456/comments",
      { message: "A sourced creator comment" },
      "page-token"
    );
    expect(result.content[0].text).toContain("Comment posted successfully.");
    expect(result.content[0].text).toContain("comment-123");
  });

  it("returns the raw API response when JSON is requested", async () => {
    const registrations: RegisteredTool[] = [];
    const server = {
      registerTool(name: string, _config: unknown, callback: RegisteredTool["callback"]) {
        registrations.push({ name, callback });
      },
    } as unknown as McpServer;
    const client = {
      requirePageToken: vi.fn().mockReturnValue("page-token"),
      post: vi.fn().mockResolvedValue({ id: "comment-789" }),
    } as unknown as MetaApiClient;

    registerPageTools(server, client);

    const tool = registrations.find(({ name }) => name === "meta_create_post_comment");
    const result = await tool!.callback({
      post_id: "page-123_post-456",
      page_id: "page-123",
      message: "A JSON creator comment",
      response_format: "json",
    });

    expect(JSON.parse(result.content[0].text)).toEqual({ id: "comment-789" });
  });
});
