import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaApiClient } from "../services/api.js";
import { registerInsightsTools } from "../tools/insights.js";
import { registerPageTools } from "../tools/pages.js";
import { registerInstagramTools } from "../tools/instagram.js";

describe("insight request and response contracts", () => {
  const registered = new Map<string, { schema: { parse: (args: unknown) => unknown }; run: (args: any) => Promise<any> }>();
  const get = vi.fn();
  const getWithToken = vi.fn();
  beforeEach(() => {
    registered.clear();
    get.mockReset().mockResolvedValue({ data: [] });
    getWithToken.mockReset().mockResolvedValue({ data: [] });
    const server = { registerTool(name: string, config: any, run: any) { registered.set(name, { schema: config.inputSchema, run }); } } as unknown as McpServer;
    const client = { get, getWithToken, requirePageToken: () => "fixture-token" } as unknown as MetaApiClient;
    registerInsightsTools(server, client);
    registerPageTools(server, client);
    registerInstagramTools(server, client);
  });
  function call(name: string, args: unknown) {
    const tool = registered.get(name)!;
    return tool.run(tool.schema.parse(args));
  }
  it.each([
    ["account", { ad_account_id: "act_1" }, "act_1"],
    ["campaign", { ad_account_id: "act_1", campaign_id: "campaign1" }, "campaign1"],
    ["adset", { adset_id: "adset1" }, "adset1"],
    ["ad", { ad_id: "ad1" }, "ad1"],
  ])("uses supported shared ads fields at %s level", async (level, args, id) => {
    await call(`meta_get_${level}_insights`, args);
    expect(get).toHaveBeenCalledWith(`/${id}/insights`, expect.objectContaining({ level }));
    const fields = get.mock.calls[0][1].fields.split(",");
    expect(fields).not.toContain("unique_impressions");
    expect(fields).toContain("reach");
  });
  it.each([
    ["page", { page_id: "page1" }, "page_media_view,page_total_media_view_unique,page_actions_post_reactions_total,page_video_views"],
    ["post", { page_id: "page1", post_id: "page1_post1" }, "post_media_view,post_total_media_view_unique,post_reactions_by_type_total"],
  ])("uses documented %s defaults and preserves overrides", async (kind, args, metric) => {
    getWithToken.mockResolvedValue({ data: [{ name: "views", title: "Views", values: [{ value: 42, end_time: "2026-09-24T00:00:00Z" }] }] });
    const result = await call(`meta_get_${kind}_insights`, args);
    expect(getWithToken.mock.calls[0][2]).toMatchObject({ metric });
    if (kind === "page") expect(getWithToken.mock.calls[0][2].period).toBe("day");
    expect(result.content[0].text).toContain("42");
    await call(`meta_get_${kind}_insights`, { ...args, metrics: ["custom_metric"] });
    expect(getWithToken.mock.calls[1][2].metric).toBe("custom_metric");
  });
  it("defaults IG to totals and displays zero and breakdowns", async () => {
    get.mockResolvedValue({ data: [{ name: "likes", total_value: { value: 0, breakdowns: [{ dimension_keys: ["media_product_type"], results: [{ dimension_values: ["REELS"], value: 12 }] }] } }] });
    const result = await call("meta_get_instagram_account_insights", { ig_account_id: "ig1" });
    expect(get.mock.calls[0][1]).toMatchObject({ metric_type: "total_value", period: "day" });
    expect(result.content[0].text).toContain("**0**");
    expect(result.content[0].text).toContain("REELS");
    expect(result.content[0].text).toContain("12");
  });
  it("passes explicit IG time series and preserves output", async () => {
    get.mockResolvedValue({ data: [{ name: "reach", values: [{ value: 17, end_time: "2026-09-24T00:00:00Z" }] }] });
    const result = await call("meta_get_instagram_account_insights", { ig_account_id: "ig1", metrics: ["reach"], metric_type: "time_series", since: "2026-09-01" });
    expect(get.mock.calls[0][1]).toMatchObject({ metric: "reach", metric_type: "time_series", since: "2026-09-01" });
    expect(result.content[0].text).toContain("17");
  });
  it("keeps raw IG totals in JSON output", async () => {
    const data = { data: [{ name: "likes", total_value: { value: 9 } }] };
    get.mockResolvedValue(data);
    const result = await call("meta_get_instagram_account_insights", { ig_account_id: "ig1", metric_type: "total_value", response_format: "json" });
    expect(JSON.parse(result.content[0].text)).toEqual(data);
  });
  it("does not expand thumbnails on page videos", async () => {
    await call("meta_get_page_videos", { page_id: "page1" });
    expect(getWithToken.mock.calls[0][2].fields).not.toContain("thumbnails");
  });
});
