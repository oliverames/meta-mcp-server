import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, truncate, formatNumber, ResponseFormatSchema } from "../services/utils.js";
import { INSIGHT_FIELDS } from "../constants.js";
import { InsightData, MetaPaginatedResponse } from "../types.js";

const DatePresetSchema = z
  .enum([
    "today",
    "yesterday",
    "this_week_sun_today",
    "this_week_mon_today",
    "last_week_sun_sat",
    "last_week_mon_sun",
    "last_7d",
    "last_14d",
    "last_28d",
    "last_30d",
    "last_90d",
    "this_month",
    "last_month",
    "this_quarter",
    "last_3d",
  ])
  .default("last_30d")
  .describe("Date range preset");

const BreakdownSchema = z
  .array(
    z.enum([
      "age",
      "gender",
      "country",
      "region",
      "device_platform",
      "publisher_platform",
      "impression_device",
      "placement",
    ])
  )
  .optional()
  .describe("Breakdown dimensions for segmented data");

function formatInsightsMarkdown(
  data: InsightData[],
  level: string,
  datePreset: string,
  breakdown?: string[]
): string {
  const lines = [
    `# ${level} Insights`,
    `**Period**: ${datePreset}`,
    breakdown?.length ? `**Breakdown**: ${breakdown.join(", ")}` : "",
    "",
  ].filter(Boolean);

  for (const row of data) {
    const label = [
      row.campaign_name ?? row.adset_name ?? row.ad_name ?? row.account_name ?? "",
      row.campaign_id ?? row.adset_id ?? row.ad_id ?? row.account_id ?? "",
    ]
      .filter(Boolean)
      .join(" — ");

    if (label) lines.push(`## ${label}`);
    lines.push(`- **Period**: ${row.date_start} → ${row.date_stop}`);
    if (row.impressions) lines.push(`- **Impressions**: ${formatNumber(row.impressions)}`);
    if (row.reach) lines.push(`- **Reach**: ${formatNumber(row.reach)}`);
    if (row.clicks) lines.push(`- **Clicks**: ${formatNumber(row.clicks)}`);
    if (row.unique_clicks) lines.push(`- **Unique Clicks**: ${formatNumber(row.unique_clicks)}`);
    // Insights API returns spend/cpm/cpc as dollar strings (not cents)
    if (row.spend) lines.push(`- **Spend**: $${parseFloat(row.spend).toFixed(2)}`);
    if (row.cpm) lines.push(`- **CPM**: $${parseFloat(row.cpm).toFixed(2)}`);
    if (row.cpc) lines.push(`- **CPC**: $${parseFloat(row.cpc).toFixed(2)}`);
    // CTR is returned as a percentage (e.g., "2.5" = 2.5%)
    if (row.ctr) lines.push(`- **CTR**: ${parseFloat(row.ctr).toFixed(2)}%`);
    if (row.frequency) lines.push(`- **Frequency**: ${parseFloat(row.frequency).toFixed(2)}`);
    if (row.actions?.length) {
      lines.push(`- **Actions**:`);
      for (const action of row.actions.slice(0, 10)) {
        lines.push(`  - ${action.action_type}: ${formatNumber(action.value)}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function registerInsightsTools(server: McpServer, client: MetaApiClient): void {
  // ─── Account Insights ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_account_insights",
    {
      title: "Get Ad Account Insights",
      description: `Gets performance insights for a Meta ad account.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)
  - date_preset (string): Date range preset (default: last_30d)
  - since (string, optional): Custom start date YYYY-MM-DD (overrides date_preset)
  - until (string, optional): Custom end date YYYY-MM-DD
  - breakdowns (string[], optional): Segment by age, gender, country, device_platform, placement, etc.

Returns spend, impressions, reach, clicks, CTR, CPM, CPC, and conversion actions.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          date_preset: DatePresetSchema,
          since: z.string().optional().describe("Start date YYYY-MM-DD"),
          until: z.string().optional().describe("End date YYYY-MM-DD"),
          breakdowns: BreakdownSchema,
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
    async ({ ad_account_id, date_preset, since, until, breakdowns, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: INSIGHT_FIELDS + ",account_id,account_name",
          level: "account",
        };
        if (since && until) {
          params.time_range = { since, until };
        } else {
          params.date_preset = date_preset;
        }
        if (breakdowns?.length) params.breakdowns = breakdowns.join(",");

        const data = await client.get<MetaPaginatedResponse<InsightData>>(
          `/${ad_account_id}/insights`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No insights data found for the specified period." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: truncate(
                formatInsightsMarkdown(data.data, "Account", date_preset, breakdowns),
                "insights"
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Campaign Insights ────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_campaign_insights",
    {
      title: "Get Campaign Insights",
      description: `Gets performance insights for campaigns in a Meta ad account.

Args:
  - ad_account_id (string): Ad account ID
  - campaign_id (string, optional): Specific campaign ID (omit for all campaigns)
  - date_preset (string): Date range preset (default: last_30d)
  - since (string, optional): Custom start date YYYY-MM-DD
  - until (string, optional): Custom end date YYYY-MM-DD
  - breakdowns (string[], optional): Segment by age, gender, country, device_platform, etc.

Returns per-campaign spend, impressions, clicks, CTR, and actions.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          campaign_id: z.string().optional().describe("Specific campaign (omit for all)"),
          date_preset: DatePresetSchema,
          since: z.string().optional(),
          until: z.string().optional(),
          breakdowns: BreakdownSchema,
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
    async ({ ad_account_id, campaign_id, date_preset, since, until, breakdowns, response_format }) => {
      try {
        const parentId = campaign_id ?? ad_account_id;
        const params: Record<string, unknown> = {
          fields: INSIGHT_FIELDS + ",campaign_id,campaign_name",
          level: "campaign",
        };
        if (since && until) {
          params.time_range = { since, until };
        } else {
          params.date_preset = date_preset;
        }
        if (breakdowns?.length) params.breakdowns = breakdowns.join(",");

        const data = await client.get<MetaPaginatedResponse<InsightData>>(
          `/${parentId}/insights`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No campaign insights found for the specified period." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: truncate(
                formatInsightsMarkdown(data.data, "Campaign", date_preset, breakdowns),
                "campaign insights"
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Ad Set Insights ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_adset_insights",
    {
      title: "Get Ad Set Insights",
      description: `Gets performance insights for ad sets.

Args:
  - ad_account_id (string): Ad account ID (use for all ad sets)
  - adset_id (string, optional): Specific ad set ID
  - campaign_id (string, optional): All ad sets in a campaign
  - date_preset (string): Date range preset (default: last_30d)
  - since / until (string, optional): Custom date range YYYY-MM-DD
  - breakdowns (string[], optional): age, gender, country, device_platform, etc.

Provide ad_account_id or campaign_id or adset_id.`,
      inputSchema: z
        .object({
          ad_account_id: z.string().optional(),
          adset_id: z.string().optional(),
          campaign_id: z.string().optional(),
          date_preset: DatePresetSchema,
          since: z.string().optional(),
          until: z.string().optional(),
          breakdowns: BreakdownSchema,
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
    async ({ ad_account_id, adset_id, campaign_id, date_preset, since, until, breakdowns, response_format }) => {
      try {
        const parentId = adset_id ?? campaign_id ?? ad_account_id;
        if (!parentId) {
          return {
            content: [{ type: "text", text: "Error: Provide adset_id, campaign_id, or ad_account_id." }], isError: true,
          };
        }

        const params: Record<string, unknown> = {
          fields: INSIGHT_FIELDS + ",adset_id,adset_name,campaign_id,campaign_name",
          level: "adset",
        };
        if (since && until) {
          params.time_range = { since, until };
        } else {
          params.date_preset = date_preset;
        }
        if (breakdowns?.length) params.breakdowns = breakdowns.join(",");

        const data = await client.get<MetaPaginatedResponse<InsightData>>(
          `/${parentId}/insights`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ad set insights found for the specified period." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: truncate(
                formatInsightsMarkdown(data.data, "Ad Set", date_preset, breakdowns),
                "ad set insights"
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Ad Insights ──────────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_ad_insights",
    {
      title: "Get Ad Insights",
      description: `Gets performance insights at the individual ad level.

Args:
  - ad_account_id (string, optional): All ads in account
  - campaign_id (string, optional): All ads in campaign
  - adset_id (string, optional): All ads in ad set
  - ad_id (string, optional): Specific ad
  - date_preset (string): Date range preset (default: last_30d)
  - since / until (string, optional): Custom date range YYYY-MM-DD
  - breakdowns (string[], optional): age, gender, country, device_platform, etc.

Provide one of: ad_id, adset_id, campaign_id, or ad_account_id.`,
      inputSchema: z
        .object({
          ad_account_id: z.string().optional(),
          campaign_id: z.string().optional(),
          adset_id: z.string().optional(),
          ad_id: z.string().optional(),
          date_preset: DatePresetSchema,
          since: z.string().optional(),
          until: z.string().optional(),
          breakdowns: BreakdownSchema,
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
    async ({ ad_account_id, campaign_id, adset_id, ad_id, date_preset, since, until, breakdowns, response_format }) => {
      try {
        const parentId = ad_id ?? adset_id ?? campaign_id ?? ad_account_id;
        if (!parentId) {
          return {
            content: [{ type: "text", text: "Error: Provide ad_id, adset_id, campaign_id, or ad_account_id." }], isError: true,
          };
        }

        const params: Record<string, unknown> = {
          fields: INSIGHT_FIELDS + ",ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name",
          level: "ad",
        };
        if (since && until) {
          params.time_range = { since, until };
        } else {
          params.date_preset = date_preset;
        }
        if (breakdowns?.length) params.breakdowns = breakdowns.join(",");

        const data = await client.get<MetaPaginatedResponse<InsightData>>(
          `/${parentId}/insights`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ad-level insights found for the specified period." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: truncate(
                formatInsightsMarkdown(data.data, "Ad", date_preset, breakdowns),
                "ad insights"
              ),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
