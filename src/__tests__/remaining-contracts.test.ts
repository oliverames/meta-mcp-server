import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import axios, { AxiosError } from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaApiClient } from "../services/api.js";
import { registerAdsTools } from "../tools/ads.js";
import { registerPageTools } from "../tools/pages.js";
import { registerInstagramTools } from "../tools/instagram.js";
import { registerUtilityTools } from "../tools/utility.js";

describe("remaining documented contracts", () => {
  const tools = new Map<string, any>();
  const get = vi.fn(); const getWithToken = vi.fn();
  beforeEach(() => {
    tools.clear(); get.mockReset().mockResolvedValue({ data: [] }); getWithToken.mockReset();
    const server = { registerTool(name: string, config: any, run: any) { tools.set(name, { config, run }); } } as unknown as McpServer;
    const client = { get, getWithToken, requirePageToken: () => "page-token" } as unknown as MetaApiClient;
    registerAdsTools(server, client); registerPageTools(server, client); registerInstagramTools(server, client); registerUtilityTools(server, client);
  });
  const call = (name: string, args: any) => { const t = tools.get(name); return t.run(t.config.inputSchema.parse(args)); };
  it("requests supported saved audience bounds and renders them", async () => {
    get.mockResolvedValue({ data: [{ id: "a", name: "Audience", approximate_count_lower_bound: 0, approximate_count_upper_bound: 20 }] });
    const result = await call("meta_list_saved_audiences", { ad_account_id: "act_1" });
    expect(get.mock.calls[0][1].fields.split(",")).not.toContain("approximate_count");
    expect(get.mock.calls[0][1].fields).toContain("approximate_count_lower_bound");
    expect(result.content[0].text).toContain("0–20");
  });
  it.each(["device_os", "device_type", "browser_type", "event_processing_results"])("accepts documented Pixel aggregation %s", async aggregation => {
    await call("meta_get_pixel_stats", { pixel_id: "p", aggregation });
    expect(get).toHaveBeenCalledWith("/p/stats", { aggregation });
  });
  it("rejects the unsupported Pixel device aggregation", () => {
    expect(() => tools.get("meta_get_pixel_stats").config.inputSchema.parse({ pixel_id: "p", aggregation: "device" })).toThrow();
  });
  it.each(["top_media", "recent_media"])("restricts hashtag %s fields without changing lookup", async edge => {
    get.mockResolvedValueOnce({ data: [{ id: "h" }] }).mockResolvedValueOnce({ data: [] });
    await call("meta_search_instagram_hashtag", { ig_account_id: "ig", hashtag: "test", edge });
    expect(get.mock.calls[0]).toEqual(["/ig_hashtag_search", { user_id: "ig", q: "test" }]);
    expect(get.mock.calls[1][1].fields).not.toContain("media_product_type");
    expect(get.mock.calls[1][1].fields).not.toContain("thumbnail_url");
  });
  it("does not request unsupported parent fields for carousel children", async () => {
    await call("meta_get_instagram_media_children", { media_id: "m" });
    const fields = get.mock.calls[0][1].fields.split(",");
    for (const name of ["permalink", "caption", "like_count", "comments_count"]) expect(fields).not.toContain(name);
    expect(fields).toContain("media_url");
  });
  it.each(["page_fans_city", "page_fans_country", "page_fans_gender_age", "page_fans_locale"])("explains retirement of %s without a doomed API call", async metric => {
    const result = await call("meta_get_page_fan_demographics", { page_id: "p", metric });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("retired");
    expect(getWithToken).not.toHaveBeenCalled();
  });
  it("reads Messenger profile envelope and renders greeting and nested ice breakers", async () => {
    getWithToken.mockResolvedValue({ data: [{ greeting: [{ locale: "default", text: "Hello" }], ice_breakers: [{ locale: "default", call_to_actions: [{ question: "Hours?", payload: "HOURS" }] }] }] });
    const result = await call("meta_get_page_automated_responses", { page_id: "p" });
    expect(getWithToken).toHaveBeenCalledWith("/p/messenger_profile", "page-token", { fields: "greeting,ice_breakers" });
    expect(result.content[0].text).toContain("Hello");
    expect(result.content[0].text).toContain("Hours?");
    expect(result.content[0].text).not.toContain("undefined");
  });
  it("filters promotion eligibility from the documented feed and preserves paging", async () => {
    getWithToken.mockResolvedValue({ data: [{ id: "yes", is_eligible_for_promotion: true }, { id: "no", is_eligible_for_promotion: false }, { id: "unknown" }], paging: { cursors: { after: "next" }, next: "url" } });
    const result = await call("meta_get_promotable_posts", { page_id: "p", response_format: "json" });
    expect(getWithToken.mock.calls[0][0]).toBe("/p/feed");
    expect(getWithToken.mock.calls[0][2]).not.toHaveProperty("is_eligible_for_promotion");
    expect(JSON.parse(result.content[0].text)).toEqual({ data: [{ id: "yes", is_eligible_for_promotion: true }], paging: { cursors: { after: "next" }, next: "url" } });
  });
  it("does not advertise retired Places search", () => { expect(tools.has("meta_search_places")).toBe(false); });
});

function tokenError(code = 190, error_subcode = 2069032) {
  return new AxiosError("expired", undefined, undefined, undefined, { data: { error: { code, error_subcode } }, status: 400, statusText: "Bad Request", headers: {}, config: {} as any });
}
describe("bounded page-token refresh", () => {
  afterEach(() => vi.restoreAllMocks());
  it("refreshes the matching Page then retries a GET once", async () => {
    const client = new MetaApiClient("user"); client.cachePageToken("page1", "stale");
    const get = vi.spyOn(axios, "get").mockRejectedValueOnce(tokenError()).mockResolvedValueOnce({ data: { data: [{ id: "page1", access_token: "fresh" }] } }).mockResolvedValueOnce({ data: { ok: true } });
    expect(await client.getWithToken("/post/reactions", "stale", { limit: 5 })).toEqual({ ok: true });
    expect(get.mock.calls[1][0]).toMatch(/\/me\/accounts$/);
    expect(get.mock.calls[2][1]?.params).toMatchObject({ access_token: "fresh", limit: 5 });
    expect(client.getPageToken("page1")).toBe("fresh");
  });
  it.each([[190, 1], [10, 2069032]])("does not retry unrelated error %s/%s", async (code, subcode) => {
    const client = new MetaApiClient("user"); client.cachePageToken("p", "stale");
    const error = tokenError(code, subcode); const get = vi.spyOn(axios, "get").mockRejectedValue(error);
    await expect(client.getWithToken("/p/feed", "stale")).rejects.toBe(error); expect(get).toHaveBeenCalledTimes(1);
  });
  it("never retries twice when a refreshed token still fails", async () => {
    const client = new MetaApiClient("user"); client.cachePageToken("p", "stale");
    const error = tokenError(); const get = vi.spyOn(axios, "get").mockRejectedValueOnce(error).mockResolvedValueOnce({ data: { data: [{ id: "p", access_token: "fresh" }] } }).mockRejectedValueOnce(error);
    await expect(client.getWithToken("/p/feed", "stale")).rejects.toBe(error); expect(get).toHaveBeenCalledTimes(3);
  });
  it("does not refresh tokens with no unique cached Page owner", async () => {
    const client = new MetaApiClient("user"); client.cachePageToken("p1", "same"); client.cachePageToken("p2", "same");
    const error = tokenError(); const get = vi.spyOn(axios, "get").mockRejectedValue(error);
    await expect(client.getWithToken("/post/reactions", "same")).rejects.toBe(error); expect(get).toHaveBeenCalledTimes(1);
  });
  it("uses account cursors without following arbitrary next URLs", async () => {
    const client = new MetaApiClient("user"); client.cachePageToken("p", "stale");
    const get = vi.spyOn(axios, "get").mockRejectedValueOnce(tokenError())
      .mockResolvedValueOnce({ data: { data: [], paging: { next: "https://untrusted.invalid", cursors: { after: "next" } } } })
      .mockResolvedValueOnce({ data: { data: [{ id: "p", access_token: "fresh" }] } })
      .mockResolvedValueOnce({ data: { ok: true } });
    await client.getWithToken("/p/feed", "stale");
    expect(get.mock.calls[2][0]).toMatch(/graph.facebook.com.*\/me\/accounts$/);
    expect(get.mock.calls[2][1]?.params.after).toBe("next");
  });
  it("surfaces missing grants without replacing the cache or retrying the Page", async () => {
    const client = new MetaApiClient("user"); client.cachePageToken("p", "stale");
    const get = vi.spyOn(axios, "get").mockRejectedValueOnce(tokenError()).mockResolvedValueOnce({ data: { data: [] } });
    await expect(client.getWithToken("/p/feed", "stale")).rejects.toThrow("Could not refresh access");
    expect(client.getPageToken("p")).toBe("stale"); expect(get).toHaveBeenCalledTimes(2);
  });
  it("coalesces concurrent refreshes for the same Page", async () => {
    const client = new MetaApiClient("user"); client.cachePageToken("p", "stale");
    const get = vi.spyOn(axios, "get").mockRejectedValueOnce(tokenError()).mockRejectedValueOnce(tokenError())
      .mockResolvedValueOnce({ data: { data: [{ id: "p", access_token: "fresh" }] } })
      .mockResolvedValue({ data: { ok: true } });
    await Promise.all([client.getWithToken("/p/feed", "stale"), client.getWithToken("/p/posts", "stale")]);
    expect(get.mock.calls.filter(([url]) => String(url).endsWith("/me/accounts"))).toHaveLength(1);
    expect(get).toHaveBeenCalledTimes(5);
  });
  it("does not refresh or replay writes", async () => {
    const client = new MetaApiClient("user"); client.cachePageToken("p", "stale");
    const error = tokenError(); const post = vi.spyOn(axios, "post").mockRejectedValue(error); const get = vi.spyOn(axios, "get");
    await expect(client.post("/p/feed", {}, "stale")).rejects.toBe(error); expect(post).toHaveBeenCalledTimes(1); expect(get).not.toHaveBeenCalled();
  });
});
