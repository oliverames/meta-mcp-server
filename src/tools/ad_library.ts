import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, truncate, truncateField, formatDate, buildPaginationNote, ResponseFormatSchema } from "../services/utils.js";
import { AD_LIBRARY_FIELDS } from "../constants.js";
import { AdLibraryEntry, MetaPaginatedResponse } from "../types.js";

export function registerAdLibraryTools(server: McpServer, client: MetaApiClient): void {
  server.registerTool(
    "meta_search_ad_library",
    {
      title: "Search Meta Ad Library",
      description: `Searches the Meta Ad Library for ads from any advertiser. This is a transparency tool — no ad account access needed.

Args:
  - ad_reached_countries (string[]): Required. ISO country codes where ads were shown (e.g., ["US", "GB"])
  - search_terms (string, optional): Keywords to search ad text
  - search_page_ids (string[], optional): Specific Page IDs to search
  - ad_type (string): ALL, POLITICAL_AND_ISSUE_ADS, HOUSING_ADS, EMPLOYMENT_ADS, CREDIT_ADS (default: ALL)
  - ad_active_status (string): ALL, ACTIVE, INACTIVE (default: ALL)
  - ad_delivery_date_min (string, optional): Min delivery date YYYY-MM-DD
  - ad_delivery_date_max (string, optional): Max delivery date YYYY-MM-DD
  - limit (number): Max results (1–100, default 25)
  - after (string, optional): Pagination cursor

Returns: Ad creatives, spend ranges, impressions, demographics, and targeting info.

Note: Requires a valid access token but does NOT require ad account ownership.`,
      inputSchema: z
        .object({
          ad_reached_countries: z
            .array(z.string().length(2))
            .min(1)
            .describe("ISO country codes (e.g., [\"US\"])"),
          search_terms: z.string().optional().describe("Keywords to search"),
          search_page_ids: z.array(z.string()).optional().describe("Page IDs to filter by"),
          ad_type: z
            .enum(["ALL", "POLITICAL_AND_ISSUE_ADS", "HOUSING_ADS", "EMPLOYMENT_ADS", "CREDIT_ADS"])
            .default("ALL"),
          ad_active_status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL"),
          ad_delivery_date_min: z.string().optional().describe("Min delivery date YYYY-MM-DD"),
          ad_delivery_date_max: z.string().optional().describe("Max delivery date YYYY-MM-DD"),
          limit: z.number().int().min(1).max(100).default(25),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({
      ad_reached_countries,
      search_terms,
      search_page_ids,
      ad_type,
      ad_active_status,
      ad_delivery_date_min,
      ad_delivery_date_max,
      limit,
      after,
      response_format,
    }) => {
      try {
        const params: Record<string, unknown> = {
          fields: AD_LIBRARY_FIELDS,
          ad_reached_countries: JSON.stringify(ad_reached_countries),
          ad_type,
          ad_active_status,
          limit,
        };
        if (search_terms) params.search_terms = search_terms;
        if (search_page_ids?.length) params.search_page_ids = JSON.stringify(search_page_ids);
        if (ad_delivery_date_min) params.ad_delivery_date_min = ad_delivery_date_min;
        if (ad_delivery_date_max) params.ad_delivery_date_max = ad_delivery_date_max;
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<AdLibraryEntry>>(
          "/ads_archive",
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ads found matching your criteria." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Ad Library Results (${data.data.length} shown)`, ""];

        for (const ad of data.data) {
          lines.push(`## ${ad.page_name ?? "Unknown Page"} — \`${ad.id}\``);
          if (ad.ad_delivery_start_time) lines.push(`- **Started**: ${formatDate(ad.ad_delivery_start_time)}`);
          if (ad.ad_delivery_stop_time) lines.push(`- **Stopped**: ${formatDate(ad.ad_delivery_stop_time)}`);
          if (ad.ad_creative_bodies?.length) {
            lines.push(`- **Ad text**: ${truncateField(ad.ad_creative_bodies[0], 200)}`);
          }
          if (ad.ad_creative_link_titles?.length) {
            lines.push(`- **Link title**: ${ad.ad_creative_link_titles[0]}`);
          }
          if (ad.spend) {
            lines.push(`- **Spend**: ${ad.currency ?? ""}${ad.spend.lower_bound ?? "?"}–${ad.spend.upper_bound ?? "?"}`);
          }
          if (ad.impressions) {
            lines.push(`- **Impressions**: ${ad.impressions.lower_bound ?? "?"}–${ad.impressions.upper_bound ?? "?"}`);
          }
          if (ad.publisher_platforms?.length) {
            lines.push(`- **Platforms**: ${ad.publisher_platforms.join(", ")}`);
          }
          if (ad.ad_snapshot_url) lines.push(`- **Snapshot**: ${ad.ad_snapshot_url}`);
          lines.push("");
        }

        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "ads") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
