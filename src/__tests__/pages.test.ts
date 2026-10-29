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

describe("Facebook Page cover photo contract", () => {
  function coverTool() {
    const registrations: RegisteredTool[] = [];
    const post = vi.fn();
    const server = {
      registerTool(name: string, _config: unknown, callback: RegisteredTool["callback"]) {
        registrations.push({ name, callback });
      },
    } as unknown as McpServer;
    const client = {
      requirePageToken: vi.fn().mockReturnValue("page-token"),
      post,
    } as unknown as MetaApiClient;
    registerPageTools(server, client);
    return { post, callback: registrations.find(({ name }) => name === "meta_update_page_cover")!.callback };
  }

  it("sends an existing photo ID as scalar cover with top-level options", async () => {
    const { post, callback } = coverTool();
    post.mockResolvedValue({ success: true });
    const result = await callback({ page_id: "123", photo_id: "456", offset_y: 25, no_feed_story: false, response_format: "json" });
    expect(post).toHaveBeenCalledExactlyOnceWith("/123", { cover: "456", offset_y: 25, no_feed_story: false }, "page-token");
    expect(JSON.parse(result.content[0].text)).toEqual({ success: true });
  });

  it("uploads a URL as an unpublished photo before selecting its ID", async () => {
    const { post, callback } = coverTool();
    post.mockResolvedValueOnce({ id: "789" }).mockResolvedValueOnce({ success: true });
    await callback({ page_id: "123", cover_url: "https://example.com/cover.jpg", response_format: "markdown" });
    expect(post).toHaveBeenNthCalledWith(1, "/123/photos", { url: "https://example.com/cover.jpg", published: false }, "page-token");
    expect(post).toHaveBeenNthCalledWith(2, "/123", { cover: "789" }, "page-token");
    expect(post).toHaveBeenCalledTimes(2);
  });

  it("stops when the unpublished photo upload fails", async () => {
    const { post, callback } = coverTool();
    post.mockRejectedValue(new Error("Upload failed"));
    const result = await callback({ page_id: "123", cover_url: "https://example.com/cover.jpg", response_format: "json" });
    expect(result.isError).toBe(true);
    expect(post).toHaveBeenCalledExactlyOnceWith("/123/photos", { url: "https://example.com/cover.jpg", published: false }, "page-token");
  });

  it("rejects missing cover input without making an API request", async () => {
    const { post, callback } = coverTool();
    const result = await callback({ page_id: "123", response_format: "json" });
    expect(result.isError).toBe(true);
    expect(post).not.toHaveBeenCalled();
  });
});

describe("Facebook Page story contract", () => {
  function storyTool() {
    const registrations: RegisteredTool[] = [];
    const post = vi.fn();
    const postUploadUrl = vi.fn().mockResolvedValue({ success: true });
    const server = {
      registerTool(name: string, _config: unknown, callback: RegisteredTool["callback"]) {
        registrations.push({ name, callback });
      },
    } as unknown as McpServer;
    const client = {
      requirePageToken: vi.fn().mockReturnValue("page-token"),
      post,
      postUploadUrl,
    } as unknown as MetaApiClient;
    registerPageTools(server, client);
    return { post, postUploadUrl, callback: registrations.find(({ name }) => name === "meta_publish_page_story")!.callback };
  }

  it("uploads an unpublished photo before publishing a photo story", async () => {
    const { post, callback } = storyTool();
    post.mockResolvedValueOnce({ id: "photo-1" }).mockResolvedValueOnce({ success: true });
    const result = await callback({ page_id: "123", media_url: "https://example.com/s.jpg", media_type: "photo", response_format: "markdown" });
    expect(post).toHaveBeenNthCalledWith(1, "/123/photos", { url: "https://example.com/s.jpg", published: false }, "page-token");
    expect(post).toHaveBeenNthCalledWith(2, "/123/photo_stories", { photo_id: "photo-1" }, "page-token");
    expect(post).toHaveBeenCalledTimes(2);
    expect(result.content[0].text).toContain("Story published.");
  });

  it("runs the three-phase resumable upload for a video story", async () => {
    const { post, postUploadUrl, callback } = storyTool();
    post
      .mockResolvedValueOnce({ video_id: "vid-9", upload_url: "https://rupload.facebook.com/x" })
      .mockResolvedValueOnce({ success: true, post_id: "story-9" });
    const result = await callback({ page_id: "123", media_url: "https://example.com/v.mp4", media_type: "video", response_format: "json" });
    expect(post).toHaveBeenNthCalledWith(1, "/123/video_stories", { upload_phase: "start" }, "page-token");
    expect(postUploadUrl).toHaveBeenCalledWith("https://rupload.facebook.com/x", "https://example.com/v.mp4", "page-token");
    expect(post).toHaveBeenNthCalledWith(2, "/123/video_stories", { upload_phase: "finish", video_id: "vid-9" }, "page-token");
    expect(JSON.parse(result.content[0].text)).toEqual({ success: true, post_id: "story-9" });
  });

  it("does not hit the stories edge when the media upload fails", async () => {
    const { post, callback } = storyTool();
    post.mockRejectedValue(new Error("Upload failed"));
    const result = await callback({ page_id: "123", media_url: "https://example.com/s.jpg", media_type: "photo", response_format: "json" });
    expect(result.isError).toBe(true);
    expect(post).toHaveBeenCalledExactlyOnceWith("/123/photos", { url: "https://example.com/s.jpg", published: false }, "page-token");
  });
});
