import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, truncate, truncateField, formatNumber, formatDate, formatBudget, buildPaginationNote, ResponseFormatSchema } from "../services/utils.js";
import { AD_ACCOUNT_FIELDS, CAMPAIGN_FIELDS, ADSET_FIELDS, AD_FIELDS, CREATIVE_FIELDS } from "../constants.js";
import { AdAccount, Campaign, AdSet, Ad, AdCreative, MetaPaginatedResponse } from "../types.js";

export function registerAdsTools(server: McpServer, client: MetaApiClient): void {
  // ─── List Ad Accounts ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_ad_accounts",
    {
      title: "List Meta Ad Accounts",
      description: `Lists all Meta ad accounts accessible to the authenticated user.

Returns ad account IDs (prefixed with act_), names, currency, status, and spend info.

Call this first to get ad account IDs needed for campaign and insights tools.`,
      inputSchema: z
        .object({ response_format: ResponseFormatSchema })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<AdAccount>>("/me/adaccounts", {
          fields: AD_ACCOUNT_FIELDS,
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ad accounts found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        const lines = [`# Meta Ad Accounts (${data.data.length})`, ""];
        for (const acct of data.data) {
          lines.push(`## ${acct.name ?? "Unnamed"} (\`${acct.id}\`)`);
          lines.push(`- **Account ID**: \`${acct.account_id ?? acct.id}\``);
          lines.push(`- **Status**: ${acct.account_status}`);
          lines.push(`- **Currency**: ${acct.currency ?? "N/A"}`);
          lines.push(`- **Timezone**: ${acct.timezone_name ?? "N/A"}`);
          if (acct.amount_spent) lines.push(`- **Total Spent**: ${formatNumber(acct.amount_spent)} ${acct.currency ?? ""} (in cents)`);
          if (acct.balance) lines.push(`- **Balance**: ${formatNumber(acct.balance)} ${acct.currency ?? ""} (in cents)`);
          if (acct.business) lines.push(`- **Business**: ${acct.business.name} (\`${acct.business.id}\`)`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "ad accounts") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Campaigns ───────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_campaigns",
    {
      title: "List Campaigns",
      description: `Lists campaigns for a Meta ad account.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)
  - status_filter (string[], optional): Filter by status: ACTIVE, PAUSED, ARCHIVED, DELETED
  - limit (number): Max results (1–100, default 20)
  - after (string, optional): Pagination cursor

Returns campaign names, objectives, status, and budget info.`,
      inputSchema: z
        .object({
          ad_account_id: z.string().describe("Ad account ID (e.g., act_123456789)"),
          status_filter: z
            .array(z.enum(["ACTIVE", "PAUSED", "ARCHIVED", "DELETED"]))
            .optional()
            .describe("Filter by effective status"),
          limit: z.number().int().min(1).max(100).default(20),
          after: z.string().optional().describe("Pagination cursor"),
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
    async ({ ad_account_id, status_filter, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = { fields: CAMPAIGN_FIELDS, limit };
        if (status_filter?.length) params.effective_status = JSON.stringify(status_filter);
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<Campaign>>(
          `/${ad_account_id}/campaigns`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No campaigns found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Campaigns for \`${ad_account_id}\` (${data.data.length} shown)`, ""];
        for (const c of data.data) {
          lines.push(`## ${c.name} (\`${c.id}\`)`);
          lines.push(`- **Objective**: ${c.objective ?? "N/A"}`);
          lines.push(`- **Status**: ${c.effective_status ?? c.status}`);
          if (c.daily_budget || c.lifetime_budget) {
            lines.push(`- **Budget**: ${formatBudget(c.daily_budget, c.lifetime_budget)}`);
          }
          if (c.budget_remaining) lines.push(`- **Remaining**: ${formatNumber(c.budget_remaining)} cents`);
          if (c.start_time) lines.push(`- **Start**: ${formatDate(c.start_time)}`);
          if (c.stop_time) lines.push(`- **End**: ${formatDate(c.stop_time)}`);
          lines.push(`- **Created**: ${formatDate(c.created_time)}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "campaigns") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Campaign ─────────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_campaign",
    {
      title: "Get Campaign Details",
      description: `Gets detailed information about a specific campaign.

Args:
  - campaign_id (string): Campaign ID`,
      inputSchema: z
        .object({
          campaign_id: z.string().describe("Campaign ID"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ campaign_id, response_format }) => {
      try {
        const c = await client.get<Campaign>(`/${campaign_id}`, { fields: CAMPAIGN_FIELDS });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(c, null, 2) }] };
        }

        const lines = [
          `# Campaign: ${c.name}`,
          "",
          `- **ID**: \`${c.id}\``,
          `- **Objective**: ${c.objective ?? "N/A"}`,
          `- **Status**: ${c.effective_status ?? c.status}`,
          c.daily_budget || c.lifetime_budget
            ? `- **Budget**: ${formatBudget(c.daily_budget, c.lifetime_budget)}`
            : "",
          c.budget_remaining ? `- **Remaining**: ${formatNumber(c.budget_remaining)} cents` : "",
          c.start_time ? `- **Start**: ${formatDate(c.start_time)}` : "",
          c.stop_time ? `- **End**: ${formatDate(c.stop_time)}` : "",
          `- **Created**: ${formatDate(c.created_time)}`,
          `- **Updated**: ${formatDate(c.updated_time)}`,
        ]
          .filter(Boolean)
          .join("\n");
        return { content: [{ type: "text", text: lines }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Campaign ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_create_campaign",
    {
      title: "Create Campaign",
      description: `Creates a new campaign in a Meta ad account.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)
  - name (string): Campaign name
  - objective (string): Campaign objective. Common values:
      OUTCOME_AWARENESS, OUTCOME_TRAFFIC, OUTCOME_ENGAGEMENT,
      OUTCOME_LEADS, OUTCOME_APP_PROMOTION, OUTCOME_SALES
  - status (string): ACTIVE or PAUSED (default PAUSED)
  - daily_budget (number, optional): Daily budget in account currency cents
  - lifetime_budget (number, optional): Lifetime budget in cents (requires stop_time)
  - stop_time (string, optional): ISO 8601 end date (required for lifetime budget)
  - special_ad_categories (string[], optional): Required for housing, employment, credit ads

Note: For OUTCOME_SALES objective, Advantage+ Shopping campaigns are available. These use Meta's AI to optimize targeting and placements automatically. Create a standard campaign first, then use meta_migrate_campaign_to_advantage_plus to convert it.

Returns the new campaign ID.`,
      inputSchema: z
        .object({
          ad_account_id: z.string().describe("Ad account ID (e.g., act_123456789)"),
          name: z.string().min(1).describe("Campaign name"),
          objective: z
            .enum([
              "OUTCOME_AWARENESS",
              "OUTCOME_TRAFFIC",
              "OUTCOME_ENGAGEMENT",
              "OUTCOME_LEADS",
              "OUTCOME_APP_PROMOTION",
              "OUTCOME_SALES",
            ])
            .describe("Campaign objective"),
          status: z.enum(["ACTIVE", "PAUSED"]).default("PAUSED"),
          daily_budget: z.number().int().positive().optional().describe("Daily budget in cents"),
          lifetime_budget: z.number().int().positive().optional().describe("Lifetime budget in cents"),
          stop_time: z.string().optional().describe("End datetime ISO 8601 (required with lifetime_budget)"),
          special_ad_categories: z
            .array(z.enum(["HOUSING", "EMPLOYMENT", "CREDIT", "ISSUES_ELECTIONS_POLITICS", "NONE"]))
            .default(["NONE"])
            .describe("Special ad category compliance"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ ad_account_id, name, objective, status, daily_budget, lifetime_budget, stop_time, special_ad_categories, response_format }) => {
      try {
        const fields: Record<string, unknown> = {
          name,
          objective,
          status,
          special_ad_categories,
        };
        if (daily_budget) fields.daily_budget = daily_budget;
        if (lifetime_budget) fields.lifetime_budget = lifetime_budget;
        if (stop_time) fields.stop_time = stop_time;

        const result = await client.post<{ id: string }>(
          `/${ad_account_id}/campaigns`,
          fields
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Campaign created successfully.\n\n- **Campaign ID**: \`${result.id}\`\n- **Name**: ${name}\n- **Objective**: ${objective}\n- **Status**: ${status}`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Update Campaign ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_update_campaign",
    {
      title: "Update Campaign",
      description: `Updates an existing campaign. Only provided fields are changed.

Can also migrate a campaign to Advantage+ Shopping by setting migrate_to_advantage_plus to true.

Args:
  - campaign_id (string): Campaign ID to update
  - name (string, optional): New campaign name
  - status (string, optional): ACTIVE, PAUSED, or ARCHIVED
  - daily_budget (number, optional): New daily budget in cents
  - lifetime_budget (number, optional): New lifetime budget in cents
  - migrate_to_advantage_plus (boolean, optional): Migrate this campaign to Advantage+ Shopping (keeps original campaign ID)`,
      inputSchema: z
        .object({
          campaign_id: z.string().describe("Campaign ID"),
          name: z.string().optional(),
          status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
          daily_budget: z.number().int().positive().optional(),
          lifetime_budget: z.number().int().positive().optional(),
          migrate_to_advantage_plus: z.boolean().optional().describe("Migrate this campaign to Advantage+ Shopping (keeps original campaign ID)"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ campaign_id, name, status, daily_budget, lifetime_budget, migrate_to_advantage_plus, response_format }) => {
      try {
        const fields: Record<string, unknown> = {};
        if (name) fields.name = name;
        if (status) fields.status = status;
        if (daily_budget) fields.daily_budget = daily_budget;
        if (lifetime_budget) fields.lifetime_budget = lifetime_budget;
        if (migrate_to_advantage_plus !== undefined) fields.migrate_to_advantage_plus = migrate_to_advantage_plus;

        const result = await client.post<{ success: boolean }>(`/${campaign_id}`, fields);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Campaign \`${campaign_id}\` updated successfully.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Campaign ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_delete_campaign",
    {
      title: "Delete Campaign",
      description: `Deletes (archives) a campaign. This cannot be undone.

Args:
  - campaign_id (string): Campaign ID to delete`,
      inputSchema: z
        .object({
          campaign_id: z.string().describe("Campaign ID"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ campaign_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${campaign_id}`);
        return {
          content: [
            {
              type: "text",
              text: result.success
                ? `Campaign \`${campaign_id}\` deleted successfully.`
                : `Failed to delete campaign \`${campaign_id}\`.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Migrate Campaign to Advantage+ ──────────────────────────────────────
  server.registerTool(
    "meta_migrate_campaign_to_advantage_plus",
    {
      title: "Migrate Campaign to Advantage+",
      description: `Migrates an existing campaign to Advantage+ Shopping (formerly ASC).

Advantage+ Shopping campaigns use Meta's AI to automatically optimize targeting, placements, and creative delivery for online sales. After migration, Meta handles audience selection and budget allocation across placements for better ROAS.

The campaign keeps its original ID — this is an in-place conversion, not a new campaign.

Args:
  - campaign_id (string): Campaign ID to migrate
  - ad_account_id (string): Ad account ID (e.g., act_123456789)`,
      inputSchema: z
        .object({
          campaign_id: z.string().describe("Campaign ID to migrate"),
          ad_account_id: z.string().describe("Ad account ID (e.g., act_123456789)"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ campaign_id, ad_account_id, response_format }) => {
      try {
        const result = await client.post<{ success: boolean }>(`/${campaign_id}`, {
          migrate_to_advantage_plus: true,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify({ success: true, campaign_id, ad_account_id }, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Campaign \`${campaign_id}\` migrated to Advantage+ Shopping successfully.\n\n- **Campaign ID**: \`${campaign_id}\` (unchanged)\n- **Ad Account**: \`${ad_account_id}\`\n\nThe campaign now uses Meta's AI for automated targeting, placements, and creative optimization.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Ad Sets ─────────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_adsets",
    {
      title: "List Ad Sets",
      description: `Lists ad sets for a campaign or ad account.

Args:
  - campaign_id (string, optional): Filter by campaign ID
  - ad_account_id (string, optional): Ad account ID (use if not filtering by campaign)
  - status_filter (string[], optional): ACTIVE, PAUSED, ARCHIVED, DELETED
  - limit (number): Max results (default 20)
  - after (string, optional): Pagination cursor

Provide either campaign_id or ad_account_id.`,
      inputSchema: z
        .object({
          campaign_id: z.string().optional().describe("Filter by campaign ID"),
          ad_account_id: z.string().optional().describe("Ad account ID (if no campaign filter)"),
          status_filter: z
            .array(z.enum(["ACTIVE", "PAUSED", "ARCHIVED", "DELETED"]))
            .optional(),
          limit: z.number().int().min(1).max(100).default(20),
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
    async ({ campaign_id, ad_account_id, status_filter, limit, after, response_format }) => {
      try {
        const parentId = campaign_id ?? ad_account_id;
        if (!parentId) {
          return {
            content: [{ type: "text", text: "Error: Provide either campaign_id or ad_account_id." }], isError: true,
          };
        }

        const params: Record<string, unknown> = { fields: ADSET_FIELDS, limit };
        if (status_filter?.length) params.effective_status = JSON.stringify(status_filter);
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<AdSet>>(
          `/${parentId}/adsets`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ad sets found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Ad Sets (${data.data.length} shown)`, ""];
        for (const s of data.data) {
          lines.push(`## ${s.name} (\`${s.id}\`)`);
          lines.push(`- **Campaign**: \`${s.campaign_id}\``);
          lines.push(`- **Status**: ${s.effective_status ?? s.status}`);
          lines.push(`- **Budget**: ${formatBudget(s.daily_budget, s.lifetime_budget)}`);
          lines.push(`- **Optimization Goal**: ${s.optimization_goal ?? "N/A"}`);
          lines.push(`- **Billing Event**: ${s.billing_event ?? "N/A"}`);
          if (s.start_time) lines.push(`- **Start**: ${formatDate(s.start_time)}`);
          if (s.end_time) lines.push(`- **End**: ${formatDate(s.end_time)}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "ad sets") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Ad Set ─────────────────────────────────────────────────────────
  server.registerTool(
    "meta_create_adset",
    {
      title: "Create Ad Set",
      description: `Creates a new ad set within a campaign.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)
  - campaign_id (string): Parent campaign ID
  - name (string): Ad set name
  - daily_budget (number, optional): Daily budget in cents
  - lifetime_budget (number, optional): Lifetime budget in cents (requires end_time)
  - billing_event (string): How you're charged: IMPRESSIONS, LINK_CLICKS, etc.
  - optimization_goal (string): What to optimize for: REACH, LINK_CLICKS, CONVERSIONS, etc.
  - targeting (object): Targeting spec JSON. Example: {"geo_locations": {"countries": ["US"]}, "age_min": 18, "age_max": 65}
  - start_time (string, optional): ISO 8601 start time
  - end_time (string, optional): ISO 8601 end time (required with lifetime_budget)
  - status (string): ACTIVE or PAUSED (default PAUSED)
  - placement_soft_opt_out (string[], optional): Placements to soft opt-out (up to 5% spend may still go to these). Only for Sales/Leads objectives.

Returns the new ad set ID.`,
      inputSchema: z
        .object({
          ad_account_id: z.string().describe("Ad account ID"),
          campaign_id: z.string().describe("Parent campaign ID"),
          name: z.string().min(1),
          daily_budget: z.number().int().positive().optional(),
          lifetime_budget: z.number().int().positive().optional(),
          billing_event: z
            .enum(["IMPRESSIONS", "LINK_CLICKS", "POST_ENGAGEMENT", "PAGE_LIKES", "APP_INSTALLS", "VIDEO_VIEWS"])
            .describe("Billing event type"),
          optimization_goal: z
            .enum([
              "REACH",
              "LINK_CLICKS",
              "CONVERSIONS",
              "LANDING_PAGE_VIEWS",
              "APP_INSTALLS",
              "VIDEO_VIEWS",
              "LEAD_GENERATION",
              "ENGAGED_USERS",
              "PAGE_LIKES",
            ])
            .describe("Optimization goal"),
          targeting: z
            .record(z.unknown())
            .describe("Targeting spec object (geo_locations, age, interests, etc.)"),
          start_time: z.string().optional(),
          end_time: z.string().optional(),
          status: z.enum(["ACTIVE", "PAUSED"]).default("PAUSED"),
          placement_soft_opt_out: z.array(z.string()).optional().describe("Placements to soft opt-out (up to 5% spend may still go to these for better performance). Only for Sales/Leads objectives."),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ ad_account_id, campaign_id, name, daily_budget, lifetime_budget, billing_event, optimization_goal, targeting, start_time, end_time, status, placement_soft_opt_out, response_format }) => {
      try {
        const fields: Record<string, unknown> = {
          campaign_id,
          name,
          billing_event,
          optimization_goal,
          targeting,
          status,
        };
        if (daily_budget) fields.daily_budget = daily_budget;
        if (lifetime_budget) fields.lifetime_budget = lifetime_budget;
        if (start_time) fields.start_time = start_time;
        if (end_time) fields.end_time = end_time;
        if (placement_soft_opt_out) fields.placement_soft_opt_out = placement_soft_opt_out;

        const result = await client.post<{ id: string }>(
          `/${ad_account_id}/adsets`,
          fields
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Ad set created successfully.\n\n- **Ad Set ID**: \`${result.id}\`\n- **Name**: ${name}\n- **Status**: ${status}`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Update Ad Set ────────────────────────────────────────────────────────
  server.registerTool(
    "meta_update_adset",
    {
      title: "Update Ad Set",
      description: `Updates an existing ad set. Only provided fields are changed.

Args:
  - adset_id (string): Ad set ID to update
  - name (string, optional): New name
  - status (string, optional): ACTIVE, PAUSED, or ARCHIVED
  - daily_budget (number, optional): New daily budget in cents
  - end_time (string, optional): New end time ISO 8601
  - placement_soft_opt_out (string[], optional): Placements to soft opt-out (up to 5% spend may still go to these). Only for Sales/Leads objectives.`,
      inputSchema: z
        .object({
          adset_id: z.string(),
          name: z.string().optional(),
          status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
          daily_budget: z.number().int().positive().optional(),
          end_time: z.string().optional(),
          placement_soft_opt_out: z.array(z.string()).optional().describe("Placements to soft opt-out (up to 5% spend may still go to these for better performance). Only for Sales/Leads objectives."),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ adset_id, name, status, daily_budget, end_time, placement_soft_opt_out, response_format }) => {
      try {
        const fields: Record<string, unknown> = {};
        if (name) fields.name = name;
        if (status) fields.status = status;
        if (daily_budget) fields.daily_budget = daily_budget;
        if (end_time) fields.end_time = end_time;
        if (placement_soft_opt_out) fields.placement_soft_opt_out = placement_soft_opt_out;

        await client.post(`/${adset_id}`, fields);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify({ success: true, id: adset_id }, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Ad set \`${adset_id}\` updated successfully.` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Ads ─────────────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_ads",
    {
      title: "List Ads",
      description: `Lists ads for an ad set, campaign, or ad account.

Args:
  - adset_id (string, optional): Filter by ad set
  - campaign_id (string, optional): Filter by campaign
  - ad_account_id (string, optional): List all ads in account
  - status_filter (string[], optional): ACTIVE, PAUSED, ARCHIVED, DELETED
  - limit (number): Max results (default 20)
  - after (string, optional): Pagination cursor

Provide one of adset_id, campaign_id, or ad_account_id.`,
      inputSchema: z
        .object({
          adset_id: z.string().optional(),
          campaign_id: z.string().optional(),
          ad_account_id: z.string().optional(),
          status_filter: z
            .array(z.enum(["ACTIVE", "PAUSED", "ARCHIVED", "DELETED"]))
            .optional(),
          limit: z.number().int().min(1).max(100).default(20),
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
    async ({ adset_id, campaign_id, ad_account_id, status_filter, limit, after, response_format }) => {
      try {
        const parentId = adset_id ?? campaign_id ?? ad_account_id;
        if (!parentId) {
          return {
            content: [{ type: "text", text: "Error: Provide adset_id, campaign_id, or ad_account_id." }], isError: true,
          };
        }

        const params: Record<string, unknown> = { fields: AD_FIELDS, limit };
        if (status_filter?.length) params.effective_status = JSON.stringify(status_filter);
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<Ad>>(`/${parentId}/ads`, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ads found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Ads (${data.data.length} shown)`, ""];
        for (const ad of data.data) {
          lines.push(`## ${ad.name} (\`${ad.id}\`)`);
          lines.push(`- **Ad Set**: \`${ad.adset_id}\``);
          lines.push(`- **Campaign**: \`${ad.campaign_id}\``);
          lines.push(`- **Status**: ${ad.effective_status ?? ad.status}`);
          if (ad.creative) lines.push(`- **Creative ID**: \`${ad.creative.id}\``);
          if (ad.preview_shareable_link) lines.push(`- **Preview**: ${ad.preview_shareable_link}`);
          lines.push(`- **Created**: ${formatDate(ad.created_time)}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "ads") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Ad ─────────────────────────────────────────────────────────────
  server.registerTool(
    "meta_create_ad",
    {
      title: "Create Ad",
      description: `Creates a new ad within an ad set.

Args:
  - ad_account_id (string): Ad account ID
  - adset_id (string): Parent ad set ID
  - name (string): Ad name
  - creative_id (string): Ad creative ID (from meta_list_ad_creatives or meta_create_ad_creative)
  - status (string): ACTIVE or PAUSED (default PAUSED)

Returns the new ad ID.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          adset_id: z.string(),
          name: z.string().min(1),
          creative_id: z.string().describe("Ad creative ID"),
          status: z.enum(["ACTIVE", "PAUSED"]).default("PAUSED"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ ad_account_id, adset_id, name, creative_id, status, response_format }) => {
      try {
        const result = await client.post<{ id: string }>(`/${ad_account_id}/ads`, {
          adset_id,
          name,
          creative: { creative_id },
          status,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Ad created successfully.\n\n- **Ad ID**: \`${result.id}\`\n- **Name**: ${name}\n- **Status**: ${status}`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Update Ad ────────────────────────────────────────────────────────────
  server.registerTool(
    "meta_update_ad",
    {
      title: "Update Ad",
      description: `Updates an existing ad's status or name.

Args:
  - ad_id (string): Ad ID
  - name (string, optional): New name
  - status (string, optional): ACTIVE, PAUSED, or ARCHIVED`,
      inputSchema: z
        .object({
          ad_id: z.string(),
          name: z.string().optional(),
          status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ ad_id, name, status, response_format }) => {
      try {
        const fields: Record<string, unknown> = {};
        if (name) fields.name = name;
        if (status) fields.status = status;

        await client.post(`/${ad_id}`, fields);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify({ success: true, id: ad_id }, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Ad \`${ad_id}\` updated successfully.` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Ad Creatives ────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_ad_creatives",
    {
      title: "List Ad Creatives",
      description: `Lists ad creatives for an ad account.

Args:
  - ad_account_id (string): Ad account ID
  - limit (number): Max results (default 20)
  - after (string, optional): Pagination cursor

Returns creative IDs, names, and associated page post IDs.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          limit: z.number().int().min(1).max(100).default(20),
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
    async ({ ad_account_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = { fields: CREATIVE_FIELDS, limit };
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<AdCreative>>(
          `/${ad_account_id}/adcreatives`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No creatives found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Ad Creatives (${data.data.length} shown)`, ""];
        for (const cr of data.data) {
          lines.push(`## ${cr.name ?? "Unnamed"} (\`${cr.id}\`)`);
          if (cr.title) lines.push(`- **Title**: ${cr.title}`);
          if (cr.body) lines.push(`- **Body**: ${truncateField(cr.body, 150)}`);
          if (cr.object_type) lines.push(`- **Type**: ${cr.object_type}`);
          if (cr.object_story_id) lines.push(`- **Post ID**: \`${cr.object_story_id}\``);
          if (cr.image_url) lines.push(`- **Image**: ${cr.image_url}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "creatives") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Ad Creative ───────────────────────────────────────────────────
  server.registerTool(
    "meta_create_ad_creative",
    {
      title: "Create Ad Creative",
      description: `Creates an ad creative from an existing Facebook Page post.

Args:
  - ad_account_id (string): Ad account ID
  - name (string): Creative name
  - page_id (string): Facebook Page ID that owns the post
  - object_story_id (string, optional): Use an existing published post as creative (format: {page_id}_{post_id})
  - title (string, optional): Ad headline
  - body (string, optional): Ad body text
  - image_url (string, optional): Image URL for the creative
  - link_url (string, optional): Destination URL

Returns the new creative ID.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          name: z.string().min(1),
          page_id: z.string().describe("Facebook Page ID"),
          object_story_id: z.string().optional().describe("Existing post ID as {page_id}_{post_id}"),
          title: z.string().optional(),
          body: z.string().optional(),
          image_url: z.string().url().optional(),
          link_url: z.string().url().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ ad_account_id, name, page_id, object_story_id, title, body, image_url, link_url, response_format }) => {
      try {
        const fields: Record<string, unknown> = { name };

        if (object_story_id) {
          fields.object_story_id = object_story_id;
        } else {
          // Build object_story_spec for new creative
          const linkData: Record<string, unknown> = {};
          if (title) linkData.name = title;
          if (body) linkData.description = body;
          if (image_url) linkData.picture = image_url;
          if (link_url) linkData.link = link_url;

          fields.object_story_spec = {
            page_id,
            link_data: linkData,
          };
        }

        const result = await client.post<{ id: string }>(
          `/${ad_account_id}/adcreatives`,
          fields
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Ad creative created successfully.\n\n- **Creative ID**: \`${result.id}\`\n- **Name**: ${name}`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Ad Preview ────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_ad_preview",
    {
      title: "Get Ad Preview",
      description: `Generates a preview URL for an ad or creative.

Args:
  - ad_id (string, optional): Existing ad ID
  - creative_id (string, optional): Creative ID to preview
  - ad_format (string): Preview format — DESKTOP_FEED_STANDARD, MOBILE_FEED_STANDARD, INSTAGRAM_STANDARD, INSTAGRAM_STORY, RIGHT_COLUMN_STANDARD

Provide either ad_id or creative_id.`,
      inputSchema: z
        .object({
          ad_id: z.string().optional(),
          creative_id: z.string().optional(),
          ad_format: z
            .enum([
              "DESKTOP_FEED_STANDARD",
              "MOBILE_FEED_STANDARD",
              "INSTAGRAM_STANDARD",
              "INSTAGRAM_STORY",
              "RIGHT_COLUMN_STANDARD",
              "MARKETPLACE_MOBILE",
              "AUDIENCE_NETWORK_OUTSTREAM_VIDEO",
            ])
            .default("MOBILE_FEED_STANDARD"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ ad_id, creative_id, ad_format, response_format }) => {
      try {
        const targetId = ad_id ?? creative_id;
        if (!targetId) {
          return { content: [{ type: "text", text: "Error: Provide ad_id or creative_id." }], isError: true };
        }

        const data = await client.get<{ data: Array<{ body: string }> }>(
          `/${targetId}/previews`,
          { ad_format }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const preview = data.data?.[0]?.body ?? "No preview available.";
        return { content: [{ type: "text", text: `# Ad Preview (${ad_format})\n\n${preview}` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Ad ─────────────────────────────────────────────────────────
  server.registerTool(
    "meta_delete_ad",
    {
      title: "Delete Ad",
      description: `Deletes an ad permanently.

Args:
  - ad_id (string): Ad ID to delete`,
      inputSchema: z
        .object({
          ad_id: z.string(),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ ad_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${ad_id}`);
        return {
          content: [{
            type: "text",
            text: result.success ? `Ad \`${ad_id}\` deleted.` : `Failed to delete ad \`${ad_id}\`.`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Ad Set ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_delete_adset",
    {
      title: "Delete Ad Set",
      description: `Deletes an ad set permanently.

Args:
  - adset_id (string): Ad set ID to delete`,
      inputSchema: z
        .object({
          adset_id: z.string(),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ adset_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${adset_id}`);
        return {
          content: [{
            type: "text",
            text: result.success ? `Ad set \`${adset_id}\` deleted.` : `Failed to delete ad set \`${adset_id}\`.`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Ad Account Users ──────────────────────────────────────────────
  server.registerTool(
    "meta_get_ad_account_users",
    {
      title: "Get Ad Account Users",
      description: `Lists users who have access to an ad account with their roles.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ ad_account_id, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<{
          id: string;
          name: string;
          role: number;
          permissions: string[];
        }>>(`/${ad_account_id}/users`, {
          fields: "id,name,role,permissions",
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No users found for this ad account." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const roleMap: Record<number, string> = { 1001: "Admin", 1002: "Advertiser", 1003: "Analyst" };
        const lines = [`# Ad Account Users (${data.data.length})`, ""];
        for (const user of data.data) {
          lines.push(`- **${user.name}** (\`${user.id}\`) — ${roleMap[user.role] ?? `Role ${user.role}`}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Upload Ad Image ───────────────────────────────────────────────────
  server.registerTool(
    "meta_upload_ad_image",
    {
      title: "Upload Ad Image",
      description: `Uploads an image to an ad account's image library for use in creatives.

Args:
  - ad_account_id (string): Ad account ID
  - url (string): Public URL of the image to upload
  - name (string, optional): Name for the uploaded image

Returns: Image hash (used when creating ad creatives).`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          url: z.string().url().describe("Public image URL"),
          name: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ ad_account_id, url, name, response_format }) => {
      try {
        const fields: Record<string, unknown> = { url };
        if (name) fields.name = name;

        const result = await client.post<{ images: Record<string, { hash: string; url: string }> }>(
          `/${ad_account_id}/adimages`,
          fields
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        const images = Object.values(result.images ?? {});
        const img = images[0];
        return {
          content: [{
            type: "text",
            text: img
              ? `Image uploaded.\n\n- **Hash**: \`${img.hash}\`\n- **URL**: ${img.url}`
              : "Image upload response received but no hash returned.",
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Targeting Search: Interests ───────────────────────────────────────
  server.registerTool(
    "meta_search_targeting_interests",
    {
      title: "Search Targeting Interests",
      description: `Searches for interest-based targeting options for ad sets.

Args:
  - q (string): Search query (e.g., "yoga", "cooking")
  - limit (number): Max results (default 50)

Returns: Interest IDs and names to use in ad set targeting.`,
      inputSchema: z
        .object({
          q: z.string().min(1).describe("Interest search query"),
          limit: z.number().int().min(1).max(100).default(50),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ q, limit, response_format }) => {
      try {
        const data = await client.get<{ data: Array<{ id: string; name: string; audience_size_lower_bound?: number; audience_size_upper_bound?: number; path?: string[]; topic?: string }> }>(
          "/search",
          { type: "adinterest", q, limit }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: `No interests found for "${q}".` }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        const lines = [`# Targeting Interests: "${q}" (${data.data.length})`, ""];
        for (const i of data.data) {
          const size = i.audience_size_lower_bound ? `~${formatNumber(i.audience_size_lower_bound)}–${formatNumber(i.audience_size_upper_bound)}` : "N/A";
          lines.push(`- **${i.name}** (\`${i.id}\`) — Audience: ${size}${i.path?.length ? ` | Path: ${i.path.join(" > ")}` : ""}`);
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "interests") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Targeting Search: Geolocations ────────────────────────────────────
  server.registerTool(
    "meta_search_targeting_geolocations",
    {
      title: "Search Targeting Geolocations",
      description: `Searches for geographic targeting options (countries, regions, cities, zip codes).

Args:
  - q (string): Location search query (e.g., "New York", "United Kingdom")
  - type (string): Location type — country, region, city, zip, geo_market, electoral_district
  - limit (number): Max results (default 25)

Returns: Location keys to use in ad set targeting.`,
      inputSchema: z
        .object({
          q: z.string().min(1),
          type: z.enum(["country", "region", "city", "zip", "geo_market", "electoral_district"]).default("city"),
          limit: z.number().int().min(1).max(100).default(25),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ q, type, limit, response_format }) => {
      try {
        const data = await client.get<{ data: Array<{ key: string; name: string; type: string; country_code?: string; region?: string; supports_city?: boolean; supports_region?: boolean }> }>(
          "/search",
          { type: "adgeolocation", q, location_types: `["${type}"]`, limit }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: `No geolocations found for "${q}".` }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        const lines = [`# Geolocations: "${q}" (${data.data.length})`, ""];
        for (const loc of data.data) {
          lines.push(`- **${loc.name}** (key: \`${loc.key}\`, type: ${loc.type})${loc.country_code ? ` — ${loc.country_code}` : ""}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Targeting Search: Demographics ────────────────────────────────────
  server.registerTool(
    "meta_search_targeting_demographics",
    {
      title: "Search Targeting Demographics",
      description: `Searches for demographic targeting options (job titles, employers, education).

Args:
  - q (string): Search query
  - type (string): adworkposition (job titles), adworkemployer (employers), adeducationschool (schools), adeducationmajor (majors)`,
      inputSchema: z
        .object({
          q: z.string().min(1),
          type: z.enum(["adworkposition", "adworkemployer", "adeducationschool", "adeducationmajor"]),
          limit: z.number().int().min(1).max(100).default(25),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ q, type, limit, response_format }) => {
      try {
        const data = await client.get<{ data: Array<{ id: string; name: string }> }>(
          "/search",
          { type, q, limit }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: `No results found for "${q}" (${type}).` }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        const lines = [`# ${type}: "${q}" (${data.data.length})`, ""];
        for (const item of data.data) {
          lines.push(`- **${item.name}** (\`${item.id}\`)`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Reach Estimate ────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_reach_estimate",
    {
      title: "Get Reach Estimate",
      description: `Estimates the potential reach for a targeting specification.

Args:
  - ad_account_id (string): Ad account ID
  - targeting_spec (object): Targeting specification (same format as ad set targeting)
  - optimization_goal (string, optional): e.g., REACH, LINK_CLICKS, IMPRESSIONS

Returns: Estimated daily reach and audience size.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          targeting_spec: z.record(z.unknown()).describe("Targeting spec object"),
          optimization_goal: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, targeting_spec, optimization_goal, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          targeting_spec: JSON.stringify(targeting_spec),
        };
        if (optimization_goal) params.optimization_goal = optimization_goal;

        const data = await client.get<{ data: { users_lower_bound: number; users_upper_bound: number; estimate_dau?: number; estimate_mau?: number; estimate_ready?: boolean } }>(
          `/${ad_account_id}/reachestimate`,
          params
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const d = data.data;
        const lines = [
          `# Reach Estimate`,
          "",
          `- **Audience Size**: ${formatNumber(d.users_lower_bound)}–${formatNumber(d.users_upper_bound)}`,
          d.estimate_dau ? `- **Daily Active Users**: ~${formatNumber(d.estimate_dau)}` : "",
          d.estimate_mau ? `- **Monthly Active Users**: ~${formatNumber(d.estimate_mau)}` : "",
        ].filter(Boolean);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delivery Estimate ─────────────────────────────────────────────────
  server.registerTool(
    "meta_get_delivery_estimate",
    {
      title: "Get Delivery Estimate",
      description: `Gets delivery estimate for an existing ad set.

Args:
  - adset_id (string): Ad set ID

Returns: Estimated daily outcomes (reach, impressions, actions) and bid suggestion.`,
      inputSchema: z
        .object({
          adset_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ adset_id, response_format }) => {
      try {
        const data = await client.get<{ data: unknown[] }>(
          `/${adset_id}/delivery_estimate`,
          { fields: "daily_outcomes_curve,estimate_dau,estimate_mau,bid_estimate" }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        return { content: [{ type: "text", text: `# Delivery Estimate for \`${adset_id}\`\n\n${JSON.stringify(data.data, null, 2)}` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Ad Account Pixels ────────────────────────────────────────────
  server.registerTool(
    "meta_list_pixels",
    {
      title: "List Ad Account Pixels",
      description: `Lists all Meta Pixels for an ad account.

Args:
  - ad_account_id (string): Ad account ID`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ ad_account_id, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<{
          id: string; name: string; last_fired_time?: string; is_unavailable?: boolean; creation_time?: string;
        }>>(`/${ad_account_id}/adspixels`, {
          fields: "id,name,last_fired_time,is_unavailable,creation_time",
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No pixels found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Meta Pixels (${data.data.length})`, ""];
        for (const px of data.data) {
          lines.push(`## ${px.name} (\`${px.id}\`)`);
          if (px.last_fired_time) lines.push(`- **Last fired**: ${formatDate(px.last_fired_time)}`);
          if (px.creation_time) lines.push(`- **Created**: ${formatDate(px.creation_time)}`);
          lines.push(`- **Status**: ${px.is_unavailable ? "Unavailable" : "Active"}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Pixel ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_create_pixel",
    {
      title: "Create Meta Pixel",
      description: `Creates a new Meta Pixel for conversion tracking.

Args:
  - ad_account_id (string): Ad account ID
  - name (string): Pixel name`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          name: z.string().min(1),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, name, response_format }) => {
      try {
        const result = await client.post<{ id: string }>(`/${ad_account_id}/adspixels`, { name });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Pixel created.\n\n- **Pixel ID**: \`${result.id}\`\n- **Name**: ${name}` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Pixel Details ──────────────────────────────────────────────────
  server.registerTool(
    "meta_get_pixel",
    {
      title: "Get Meta Pixel Details",
      description: `Gets details for a single Meta Pixel.

Args:
  - pixel_id (string): Pixel ID
  - response_format (optional): "json" or "text"`,
      inputSchema: z
        .object({
          pixel_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ pixel_id, response_format }) => {
      try {
        const data = await client.get<{
          id: string; name: string; code?: string; creation_time?: string;
          is_created_by_business?: boolean; first_party_cookie_status?: string;
          automatic_matching_fields?: string[]; data_use_setting?: string; last_fired_time?: string;
        }>(`/${pixel_id}`, {
          fields: "id,name,code,creation_time,is_created_by_business,first_party_cookie_status,automatic_matching_fields,data_use_setting,last_fired_time",
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Pixel: ${data.name} (\`${data.id}\`)`, ""];
        if (data.creation_time) lines.push(`- **Created**: ${formatDate(data.creation_time)}`);
        if (data.last_fired_time) lines.push(`- **Last fired**: ${formatDate(data.last_fired_time)}`);
        if (data.is_created_by_business !== undefined) lines.push(`- **Created by business**: ${data.is_created_by_business}`);
        if (data.first_party_cookie_status) lines.push(`- **First-party cookie**: ${data.first_party_cookie_status}`);
        if (data.data_use_setting) lines.push(`- **Data use setting**: ${data.data_use_setting}`);
        if (data.automatic_matching_fields?.length) lines.push(`- **Auto-matching fields**: ${data.automatic_matching_fields.join(", ")}`);
        if (data.code) lines.push("", "### Pixel Code", "```html", truncateField(data.code, 2000), "```");
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Pixel Stats ──────────────────────────────────────────────────
  server.registerTool(
    "meta_get_pixel_stats",
    {
      title: "Get Meta Pixel Stats",
      description: `Gets event volume stats for a pixel (critical for verifying pixel is firing).

Args:
  - pixel_id (string): Pixel ID
  - start_time (string, optional): ISO date for start of range
  - end_time (string, optional): ISO date for end of range
  - aggregation (string, optional): "event" (default) or "device"
  - event (string, optional): Filter to specific event like "Purchase"`,
      inputSchema: z
        .object({
          pixel_id: z.string(),
          start_time: z.string().optional(),
          end_time: z.string().optional(),
          aggregation: z.enum(["event", "device"]).default("event"),
          event: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ pixel_id, start_time, end_time, aggregation, event, response_format }) => {
      try {
        const params: Record<string, string> = { aggregation };
        if (start_time) params.start_time = start_time;
        if (end_time) params.end_time = end_time;
        if (event) params.event = event;

        const data = await client.get<{ data: { timestamp?: string; count?: number; event?: string }[] }>(
          `/${pixel_id}/stats`, params
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No stats found for this pixel." }] };
        }

        const lines = [`# Pixel Stats (\`${pixel_id}\`)`, "", `| Timestamp | Event | Count |`, `|-----------|-------|-------|`];
        for (const row of data.data) {
          lines.push(`| ${row.timestamp ? formatDate(row.timestamp) : "—"} | ${row.event ?? "—"} | ${row.count ?? 0} |`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Update Pixel ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_update_pixel",
    {
      title: "Update Meta Pixel",
      description: `Updates pixel settings.

Args:
  - pixel_id (string): Pixel ID
  - name (string, optional): New pixel name
  - first_party_cookie_status (string, optional): "EMPTY", "FIRST_PARTY_COOKIE_ENABLED", or "FIRST_PARTY_COOKIE_DISABLED"
  - automatic_matching_fields (string[], optional): e.g. ["em","ph","fn","ln","ct","st","zp","country","db","ge","external_id"]
  - data_use_setting (string, optional): "EMPTY" or "DATA_USE_SETTING_LDU"`,
      inputSchema: z
        .object({
          pixel_id: z.string(),
          name: z.string().optional(),
          first_party_cookie_status: z.enum(["EMPTY", "FIRST_PARTY_COOKIE_ENABLED", "FIRST_PARTY_COOKIE_DISABLED"]).optional(),
          automatic_matching_fields: z.array(z.string()).optional(),
          data_use_setting: z.enum(["EMPTY", "DATA_USE_SETTING_LDU"]).optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ pixel_id, name, first_party_cookie_status, automatic_matching_fields, data_use_setting, response_format }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.name = name;
        if (first_party_cookie_status !== undefined) body.first_party_cookie_status = first_party_cookie_status;
        if (automatic_matching_fields !== undefined) body.automatic_matching_fields = automatic_matching_fields;
        if (data_use_setting !== undefined) body.data_use_setting = data_use_setting;

        const result = await client.post<{ success: boolean }>(`/${pixel_id}`, body);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Pixel \`${pixel_id}\` updated successfully.` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Pixel ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_delete_pixel",
    {
      title: "Delete Meta Pixel",
      description: `Deletes a Meta Pixel.

Args:
  - pixel_id (string): Pixel ID to delete`,
      inputSchema: z
        .object({
          pixel_id: z.string(),
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    async ({ pixel_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${pixel_id}`);
        return { content: [{ type: "text", text: result.success ? `Pixel \`${pixel_id}\` deleted.` : `Delete returned: ${JSON.stringify(result)}` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Share Pixel ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_share_pixel",
    {
      title: "Share Meta Pixel",
      description: `Shares a pixel with another ad account.

Args:
  - pixel_id (string): Pixel ID
  - ad_account_id (string): Target ad account ID
  - business_id (string): Business ID`,
      inputSchema: z
        .object({
          pixel_id: z.string(),
          ad_account_id: z.string(),
          business_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ pixel_id, ad_account_id, business_id, response_format }) => {
      try {
        const result = await client.post<{ success: boolean }>(`/${pixel_id}/shared_accounts`, {
          account_id: ad_account_id,
          business: business_id,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Pixel \`${pixel_id}\` shared with ad account \`${ad_account_id}\`.` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Pixel Events ─────────────────────────────────────────────────
  server.registerTool(
    "meta_get_pixel_events",
    {
      title: "Get Pixel Events",
      description: `Gets recent events received by a pixel (for debugging).

Args:
  - pixel_id (string): Pixel ID`,
      inputSchema: z
        .object({
          pixel_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ pixel_id, response_format }) => {
      try {
        const data = await client.get<{ data: { event_name?: string; count?: number; error_count?: number; error_message?: string }[] }>(
          `/${pixel_id}/test_events`, {}
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No recent events found for this pixel." }] };
        }

        const lines = [`# Recent Pixel Events (\`${pixel_id}\`)`, "", `| Event | Count | Errors | Error Message |`, `|-------|-------|--------|---------------|`];
        for (const evt of data.data) {
          lines.push(`| ${evt.event_name ?? "—"} | ${evt.count ?? 0} | ${evt.error_count ?? 0} | ${truncateField(evt.error_message, 100) ?? "—"} |`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Custom Conversions ───────────────────────────────────────────
  server.registerTool(
    "meta_list_custom_conversions",
    {
      title: "List Custom Conversions",
      description: `Lists custom conversions for an ad account.

Args:
  - ad_account_id (string): Ad account ID`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ ad_account_id, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<{
          id: string; name: string; pixel?: { id: string }; custom_event_type?: string; rule?: string; creation_time?: string;
        }>>(`/${ad_account_id}/customconversions`, {
          fields: "id,name,pixel,custom_event_type,rule,creation_time",
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No custom conversions found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Custom Conversions (${data.data.length})`, ""];
        for (const cc of data.data) {
          lines.push(`## ${cc.name} (\`${cc.id}\`)`);
          if (cc.custom_event_type) lines.push(`- **Event type**: ${cc.custom_event_type}`);
          if (cc.pixel?.id) lines.push(`- **Pixel**: \`${cc.pixel.id}\``);
          if (cc.creation_time) lines.push(`- **Created**: ${formatDate(cc.creation_time)}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Custom Conversion ──────────────────────────────────────────
  server.registerTool(
    "meta_create_custom_conversion",
    {
      title: "Create Custom Conversion",
      description: `Creates a custom conversion for tracking specific actions.

Args:
  - ad_account_id (string): Ad account ID
  - name (string): Conversion name
  - pixel_id (string): Pixel ID to associate with
  - custom_event_type (string): Event type — CONTENT_VIEW, SEARCH, ADD_TO_CART, ADD_TO_WISHLIST, INITIATED_CHECKOUT, ADD_PAYMENT_INFO, PURCHASE, LEAD, COMPLETE_REGISTRATION, OTHER
  - rule (string): URL rule as JSON (e.g., {"url":{"i_contains":"thank-you"}})`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          name: z.string().min(1),
          pixel_id: z.string(),
          custom_event_type: z.enum(["CONTENT_VIEW", "SEARCH", "ADD_TO_CART", "ADD_TO_WISHLIST", "INITIATED_CHECKOUT", "ADD_PAYMENT_INFO", "PURCHASE", "LEAD", "COMPLETE_REGISTRATION", "OTHER"]),
          rule: z.string().describe("URL rule as JSON string"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, name, pixel_id, custom_event_type, rule, response_format }) => {
      try {
        const result = await client.post<{ id: string }>(`/${ad_account_id}/customconversions`, {
          name, pixel_id, custom_event_type, rule,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Custom conversion created.\n\n- **ID**: \`${result.id}\`\n- **Name**: ${name}\n- **Event**: ${custom_event_type}` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Saved Audiences ──────────────────────────────────────────────
  server.registerTool(
    "meta_list_saved_audiences",
    {
      title: "List Saved Audiences",
      description: `Lists saved audiences (targeting presets) for an ad account.

Args:
  - ad_account_id (string): Ad account ID`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          limit: z.number().int().min(1).max(100).default(25),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,name,targeting,approximate_count",
          limit,
        };
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<{
          id: string; name: string; approximate_count?: number; targeting?: Record<string, unknown>;
        }>>(`/${ad_account_id}/saved_audiences`, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No saved audiences found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Saved Audiences (${data.data.length})`, ""];
        for (const aud of data.data) {
          lines.push(`- **${aud.name}** (\`${aud.id}\`)${aud.approximate_count ? ` — ~${formatNumber(aud.approximate_count)} people` : ""}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Ad Rules ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_ad_rules",
    {
      title: "List Automated Ad Rules",
      description: `Lists automated rules for an ad account.

Args:
  - ad_account_id (string): Ad account ID`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ ad_account_id, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<{
          id: string; name: string; status: string; evaluation_spec?: Record<string, unknown>; execution_spec?: Record<string, unknown>;
        }>>(`/${ad_account_id}/adrules_library`, {
          fields: "id,name,status,evaluation_spec,execution_spec",
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ad rules found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Automated Ad Rules (${data.data.length})`, ""];
        for (const rule of data.data) {
          lines.push(`- **${rule.name}** (\`${rule.id}\`) — Status: ${rule.status}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Ad Labels ────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_ad_labels",
    {
      title: "List Ad Labels",
      description: `Lists ad labels for an ad account. Labels help organize campaigns, ad sets, and ads.

Args:
  - ad_account_id (string): Ad account ID`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ ad_account_id, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<{
          id: string; name: string; created_time?: string;
        }>>(`/${ad_account_id}/adlabels`, {
          fields: "id,name,created_time",
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ad labels found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Ad Labels (${data.data.length})`, ""];
        for (const label of data.data) {
          lines.push(`- **${label.name}** (\`${label.id}\`)${label.created_time ? ` — Created: ${formatDate(label.created_time)}` : ""}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Ad Label ───────────────────────────────────────────────────
  server.registerTool(
    "meta_create_ad_label",
    {
      title: "Create Ad Label",
      description: `Creates a label for organizing ads, ad sets, or campaigns.

Args:
  - ad_account_id (string): Ad account ID
  - name (string): Label name`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          name: z.string().min(1),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, name, response_format }) => {
      try {
        const result = await client.post<{ id: string }>(`/${ad_account_id}/adlabels`, { name });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Label created.\n\n- **ID**: \`${result.id}\`\n- **Name**: ${name}` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Ad Videos ────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_ad_videos",
    {
      title: "List Ad Videos",
      description: `Lists videos in an ad account's video library.

Args:
  - ad_account_id (string): Ad account ID
  - limit (number): Max results (default 20)`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          limit: z.number().int().min(1).max(100).default(20),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,title,length,created_time,updated_time,thumbnails,permalink_url",
          limit,
        };
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<{
          id: string; title?: string; length?: number; created_time?: string; permalink_url?: string;
        }>>(`/${ad_account_id}/advideos`, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ad videos found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Ad Videos (${data.data.length})`, ""];
        for (const v of data.data) {
          lines.push(`- **${v.title ?? "Untitled"}** (\`${v.id}\`)${v.length ? ` — ${Math.round(v.length)}s` : ""}${v.created_time ? ` | ${formatDate(v.created_time)}` : ""}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Upload Ad Video ───────────────────────────────────────────────────
  server.registerTool(
    "meta_upload_ad_video",
    {
      title: "Upload Ad Video",
      description: `Uploads a video to an ad account's video library for use in creatives.

Args:
  - ad_account_id (string): Ad account ID
  - file_url (string): Public URL of video file
  - title (string, optional): Video title
  - description (string, optional): Video description`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          file_url: z.string().url(),
          title: z.string().optional(),
          description: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, file_url, title, description, response_format }) => {
      try {
        const fields: Record<string, unknown> = { file_url };
        if (title) fields.title = title;
        if (description) fields.description = description;

        const result = await client.post<{ id: string }>(`/${ad_account_id}/advideos`, fields);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Video uploaded.\n\n- **Video ID**: \`${result.id}\`` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Ad Account Activity Log ───────────────────────────────────────
  server.registerTool(
    "meta_get_ad_account_activity",
    {
      title: "Get Ad Account Activity Log",
      description: `Gets the activity/change log for an ad account.

Args:
  - ad_account_id (string): Ad account ID
  - limit (number): Max results (default 25)
  - since (string, optional): Start date YYYY-MM-DD
  - until (string, optional): End date YYYY-MM-DD`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          limit: z.number().int().min(1).max(100).default(25),
          since: z.string().optional(),
          until: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, limit, since, until, response_format }) => {
      try {
        const params: Record<string, unknown> = { limit };
        if (since) params.since = since;
        if (until) params.until = until;

        const data = await client.get<MetaPaginatedResponse<{
          event_type: string;
          event_time: string;
          actor_id?: string;
          actor_name?: string;
          object_id?: string;
          object_name?: string;
          extra_data?: string;
        }>>(`/${ad_account_id}/activities`, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No activity found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Ad Account Activity (${data.data.length})`, ""];
        for (const act of data.data) {
          lines.push(`- **${act.event_type}** by ${act.actor_name ?? act.actor_id ?? "unknown"} (${formatDate(act.event_time)})${act.object_name ? ` — ${act.object_name}` : ""}`);
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "activities") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Ad Account Details ────────────────────────────────────────────
  server.registerTool(
    "meta_get_ad_account",
    {
      title: "Get Ad Account Details",
      description: `Gets detailed information about a specific ad account.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ ad_account_id, response_format }) => {
      try {
        const data = await client.get<AdAccount>(`/${ad_account_id}`, {
          fields: AD_ACCOUNT_FIELDS,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const statusMap: Record<number, string> = { 1: "Active", 2: "Disabled", 3: "Unsettled", 7: "Pending Review", 8: "Pending Closure", 9: "In Grace Period", 100: "Closed", 101: "Any Active", 201: "Any Closed" };
        const lines = [
          `# ${data.name ?? "Ad Account"}`,
          "",
          `- **ID**: \`${data.id}\``,
          `- **Account ID**: ${data.account_id}`,
          `- **Status**: ${statusMap[data.account_status ?? 0] ?? `Unknown (${data.account_status})`}`,
          `- **Currency**: ${data.currency}`,
          `- **Timezone**: ${data.timezone_name}`,
          data.amount_spent ? `- **Total Spent**: ${formatBudget(data.amount_spent, undefined, data.currency)}` : "",
          data.balance ? `- **Balance**: ${formatBudget(data.balance, undefined, data.currency)}` : "",
          data.spend_cap ? `- **Spend Cap**: ${formatBudget(data.spend_cap, undefined, data.currency)}` : "",
          data.business ? `- **Business**: ${data.business.name} (\`${data.business.id}\`)` : "",
        ].filter(Boolean);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Single Ad Set ─────────────────────────────────────────────────
  server.registerTool(
    "meta_get_adset",
    {
      title: "Get Ad Set Details",
      description: `Gets detailed information about a specific ad set.

Args:
  - adset_id (string): Ad set ID`,
      inputSchema: z
        .object({
          adset_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ adset_id, response_format }) => {
      try {
        const data = await client.get<AdSet>(`/${adset_id}`, { fields: ADSET_FIELDS });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [
          `# Ad Set: ${data.name}`,
          "",
          `- **ID**: \`${data.id}\``,
          `- **Campaign**: \`${data.campaign_id}\``,
          `- **Status**: ${data.effective_status ?? data.status}`,
          `- **Budget**: ${formatBudget(data.daily_budget, data.lifetime_budget)}`,
          data.billing_event ? `- **Billing**: ${data.billing_event}` : "",
          data.optimization_goal ? `- **Optimization**: ${data.optimization_goal}` : "",
          data.start_time ? `- **Start**: ${formatDate(data.start_time)}` : "",
          data.end_time ? `- **End**: ${formatDate(data.end_time)}` : "",
          data.targeting ? `- **Targeting**: ${truncateField(JSON.stringify(data.targeting), 200)}` : "",
        ].filter(Boolean);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Single Ad ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_ad",
    {
      title: "Get Ad Details",
      description: `Gets detailed information about a specific ad.

Args:
  - ad_id (string): Ad ID`,
      inputSchema: z
        .object({
          ad_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ ad_id, response_format }) => {
      try {
        const data = await client.get<Ad>(`/${ad_id}`, { fields: AD_FIELDS });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [
          `# Ad: ${data.name}`,
          "",
          `- **ID**: \`${data.id}\``,
          `- **Ad Set**: \`${data.adset_id}\``,
          `- **Campaign**: \`${data.campaign_id}\``,
          `- **Status**: ${data.effective_status ?? data.status}`,
          data.creative?.id ? `- **Creative**: \`${data.creative.id}\`` : "",
          data.preview_shareable_link ? `- **Preview**: ${data.preview_shareable_link}` : "",
          data.created_time ? `- **Created**: ${formatDate(data.created_time)}` : "",
        ].filter(Boolean);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Single Creative ───────────────────────────────────────────────
  server.registerTool(
    "meta_get_ad_creative",
    {
      title: "Get Ad Creative Details",
      description: `Gets detailed information about a specific ad creative.

Args:
  - creative_id (string): Creative ID`,
      inputSchema: z
        .object({
          creative_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ creative_id, response_format }) => {
      try {
        const data = await client.get<AdCreative>(`/${creative_id}`, { fields: CREATIVE_FIELDS });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [
          `# Creative: ${data.name ?? "Unnamed"}`,
          "",
          `- **ID**: \`${data.id}\``,
          data.title ? `- **Title**: ${data.title}` : "",
          data.body ? `- **Body**: ${data.body}` : "",
          data.image_url ? `- **Image**: ${data.image_url}` : "",
          data.object_story_id ? `- **Story ID**: \`${data.object_story_id}\`` : "",
          data.object_type ? `- **Type**: ${data.object_type}` : "",
          data.status ? `- **Status**: ${data.status}` : "",
        ].filter(Boolean);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Ad Rule ────────────────────────────────────────────────────
  server.registerTool(
    "meta_create_ad_rule",
    {
      title: "Create Automated Ad Rule",
      description: `Creates an automated rule for managing ads, ad sets, or campaigns.

Args:
  - ad_account_id (string): Ad account ID
  - name (string): Rule name
  - evaluation_spec (object): Conditions that trigger the rule (e.g., {"evaluation_type":"TRIGGER","trigger":{"type":"STATS_CHANGE","field":"cost_per_result","value":"5.00","operator":"GREATER_THAN"}})
  - execution_spec (object): Actions to take (e.g., {"execution_type":"PAUSE"})
  - schedule_spec (object, optional): When to evaluate (e.g., {"schedule_type":"DAILY"})`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          name: z.string().min(1),
          evaluation_spec: z.record(z.unknown()),
          execution_spec: z.record(z.unknown()),
          schedule_spec: z.record(z.unknown()).optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, name, evaluation_spec, execution_spec, schedule_spec, response_format }) => {
      try {
        const fields: Record<string, unknown> = { name, evaluation_spec, execution_spec };
        if (schedule_spec) fields.schedule_spec = schedule_spec;

        const result = await client.post<{ id: string }>(`/${ad_account_id}/adrules_library`, fields);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Ad rule created.\n\n- **Rule ID**: \`${result.id}\`\n- **Name**: ${name}` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Ad Rule ────────────────────────────────────────────────────
  server.registerTool(
    "meta_delete_ad_rule",
    {
      title: "Delete Automated Ad Rule",
      description: `Deletes an automated ad rule.

Args:
  - rule_id (string): Ad rule ID`,
      inputSchema: z
        .object({ rule_id: z.string() })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    async ({ rule_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${rule_id}`);
        return {
          content: [{ type: "text", text: result.success ? `Rule \`${rule_id}\` deleted.` : `Failed to delete rule.` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Ad Images ────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_ad_images",
    {
      title: "List Ad Images",
      description: `Lists images in an ad account's image library.

Args:
  - ad_account_id (string): Ad account ID
  - limit (number): Max results (default 25)`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          limit: z.number().int().min(1).max(100).default(25),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,hash,name,url,width,height,created_time",
          limit,
        };
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<{
          id: string; hash: string; name?: string; url?: string; width?: number; height?: number; created_time?: string;
        }>>(`/${ad_account_id}/adimages`, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ad images found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Ad Images (${data.data.length})`, ""];
        for (const img of data.data) {
          lines.push(`- **${img.name ?? "Unnamed"}** (hash: \`${img.hash}\`)${img.width ? ` — ${img.width}x${img.height}` : ""}${img.created_time ? ` | ${formatDate(img.created_time)}` : ""}`);
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "images") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Browse Targeting Categories ───────────────────────────────────────
  server.registerTool(
    "meta_browse_targeting_categories",
    {
      title: "Browse Targeting Categories",
      description: `Browses all available targeting category types for ad targeting.

Args:
  - type (string): Category type — adTargetingCategory, adcountry, adlocale, adlanguage`,
      inputSchema: z
        .object({
          type: z.enum(["adTargetingCategory", "adcountry", "adlocale"]).default("adTargetingCategory"),
          class: z.enum(["interests", "behaviors", "demographics", "life_events", "industries", "income", "family_statuses", "user_device", "user_os"]).optional().describe("Sub-class filter (for adTargetingCategory)"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ type, class: subclass, response_format }) => {
      try {
        const params: Record<string, unknown> = { type };
        if (subclass) params.class = subclass;

        const data = await client.get<{ data: Array<{ id: string; name: string; type?: string; path?: string[]; audience_size?: number; description?: string }> }>(
          "/search",
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No targeting categories found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        const lines = [`# Targeting Categories: ${type}${subclass ? ` (${subclass})` : ""} (${data.data.length})`, ""];
        for (const cat of data.data.slice(0, 50)) {
          lines.push(`- **${cat.name}** (\`${cat.id}\`)${cat.path?.length ? ` — ${cat.path.join(" > ")}` : ""}${cat.audience_size ? ` | ~${formatNumber(cat.audience_size)}` : ""}`);
        }
        if (data.data.length > 50) lines.push(`\n_...and ${data.data.length - 50} more_`);
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "categories") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Saved Audience ─────────────────────────────────────────────
  server.registerTool(
    "meta_create_saved_audience",
    {
      title: "Create Saved Audience",
      description: `Creates a saved audience (reusable targeting preset) for an ad account.

Args:
  - ad_account_id (string): Ad account ID
  - name (string): Audience name
  - targeting (object): Targeting spec object`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          name: z.string().min(1),
          targeting: z.record(z.unknown()).describe("Targeting specification"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ad_account_id, name, targeting, response_format }) => {
      try {
        const result = await client.post<{ id: string }>(`/${ad_account_id}/saved_audiences`, { name, targeting });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Saved audience created.\n\n- **ID**: \`${result.id}\`\n- **Name**: ${name}` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Saved Audience ─────────────────────────────────────────────
  server.registerTool(
    "meta_delete_saved_audience",
    {
      title: "Delete Saved Audience",
      description: `Deletes a saved audience.

Args:
  - audience_id (string): Saved audience ID`,
      inputSchema: z
        .object({ audience_id: z.string() })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    async ({ audience_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${audience_id}`);
        return {
          content: [{ type: "text", text: result.success ? `Saved audience \`${audience_id}\` deleted.` : "Failed to delete." }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Business Assets ─────────────────────────────────────────────────
  server.registerTool(
    "meta_list_business_assets",
    {
      title: "List Business Manager Assets",
      description: `Lists assets (pages, ad accounts, Instagram accounts, pixels) for a Business Manager.

Args:
  - business_id: Business Manager ID
  - asset_type: "owned_pages", "owned_ad_accounts", "owned_instagram_accounts", "owned_pixels"
  - limit (optional, default 25): Max results

Returns asset details including IDs, names, and type-specific metadata.`,
      inputSchema: z
        .object({
          business_id: z.string().describe("Business Manager ID"),
          asset_type: z.enum(["owned_pages", "owned_ad_accounts", "owned_instagram_accounts", "owned_pixels"]).describe("Type of assets to list"),
          limit: z.number().int().min(1).max(100).default(25),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ business_id, asset_type, limit, response_format }) => {
      try {
        const fieldsByType: Record<string, string> = {
          owned_pages: "id,name,category,fan_count",
          owned_ad_accounts: "id,name,account_status,currency",
          owned_instagram_accounts: "id,username,name,followers_count",
          owned_pixels: "id,name,creation_time",
        };

        const data = await client.get<MetaPaginatedResponse<Record<string, unknown>>>(
          `/${business_id}/${asset_type}`,
          { fields: fieldsByType[asset_type], limit }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: `No ${asset_type.replace("owned_", "")} found.` }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        const label = asset_type.replace("owned_", "").replace(/_/g, " ");
        const lines = [`# Business ${label} (${data.data.length})`, ""];
        for (const item of data.data) {
          const name = (item.name ?? item.username ?? "Unnamed") as string;
          lines.push(`## ${name} (\`${item.id}\`)`);
          if (asset_type === "owned_pages") {
            lines.push(`- **Category**: ${item.category ?? "N/A"}`);
            if (item.fan_count != null) lines.push(`- **Fans**: ${formatNumber(item.fan_count as string)}`);
          } else if (asset_type === "owned_ad_accounts") {
            lines.push(`- **Status**: ${item.account_status}`);
            lines.push(`- **Currency**: ${item.currency ?? "N/A"}`);
          } else if (asset_type === "owned_instagram_accounts") {
            if (item.username) lines.push(`- **Username**: @${item.username}`);
            if (item.followers_count != null) lines.push(`- **Followers**: ${formatNumber(item.followers_count as string)}`);
          } else if (asset_type === "owned_pixels") {
            if (item.creation_time) lines.push(`- **Created**: ${formatDate(item.creation_time as string)}`);
          }
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), label) }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create A/B Test (Ad Study) ───────────────────────────────────────────
  server.registerTool(
    "meta_create_ad_study",
    {
      title: "Create A/B Test (Ad Study)",
      description: `Creates an A/B test (ad study) to compare campaigns or ad sets.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)
  - name (string): Study name
  - description (string, optional): Study description
  - start_time (string): ISO 8601 start time
  - end_time (string): ISO 8601 end time
  - type (enum): SPLIT_TEST or HOLDOUT
  - cells (array): Test cells, each with name, treatment_percentage, and optional campaign_ids/adset_ids
  - confidence_level (number, default 95): Statistical confidence level (e.g., 90, 95, 99)

Returns: The created study ID.`,
      inputSchema: z
        .object({
          ad_account_id: z.string().describe("Ad account ID (e.g., act_123456789)"),
          name: z.string().min(1).describe("Study name"),
          description: z.string().optional().describe("Study description"),
          start_time: z.string().describe("ISO 8601 start time"),
          end_time: z.string().describe("ISO 8601 end time"),
          type: z.enum(["SPLIT_TEST", "HOLDOUT"]).describe("Study type"),
          cells: z
            .array(
              z.object({
                name: z.string().describe("Cell name"),
                treatment_percentage: z.number().min(1).max(100).describe("Traffic percentage for this cell"),
                campaign_ids: z.array(z.string()).optional().describe("Campaign IDs in this cell"),
                adset_ids: z.array(z.string()).optional().describe("Ad set IDs in this cell"),
              })
            )
            .min(2)
            .describe("Test cells (minimum 2)"),
          confidence_level: z.number().default(95).describe("Statistical confidence level"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ ad_account_id, name, description, start_time, end_time, type, cells, confidence_level, response_format }) => {
      try {
        const payload: Record<string, unknown> = {
          name,
          start_time,
          end_time,
          type,
          cells: cells.map((cell) => {
            const c: Record<string, unknown> = {
              name: cell.name,
              treatment_percentage: cell.treatment_percentage,
            };
            if (cell.campaign_ids?.length) c.campaigns = cell.campaign_ids;
            if (cell.adset_ids?.length) c.adsets = cell.adset_ids;
            return c;
          }),
          confidence_level,
        };
        if (description) payload.description = description;

        const result = await client.post<{ id: string }>(
          `/${ad_account_id}/ad_studies`,
          payload
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `A/B test created successfully.\n\n- **Study ID**: \`${result.id}\`\n- **Name**: ${name}\n- **Type**: ${type}\n- **Cells**: ${cells.length}`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List A/B Tests (Ad Studies) ──────────────────────────────────────────
  server.registerTool(
    "meta_get_ad_studies",
    {
      title: "List A/B Tests (Ad Studies)",
      description: `Lists A/B tests (ad studies) for a Meta ad account.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)
  - limit (number): Max results (1–50, default 10)

Returns: List of studies with name, type, status, dates, and results.`,
      inputSchema: z
        .object({
          ad_account_id: z.string().describe("Ad account ID (e.g., act_123456789)"),
          limit: z.number().int().min(1).max(50).default(10),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ ad_account_id, limit, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<Record<string, unknown>>>(
          `/${ad_account_id}/ad_studies`,
          {
            fields: "id,name,description,start_time,end_time,type,results,cells",
            limit,
          }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No A/B tests found for this ad account." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        const lines = [`# A/B Tests (${data.data.length})`, ""];
        for (const study of data.data) {
          lines.push(`## ${study.name ?? "Unnamed"} (\`${study.id}\`)`);
          if (study.type) lines.push(`- **Type**: ${study.type}`);
          if (study.description) lines.push(`- **Description**: ${truncateField(study.description as string, 200)}`);
          if (study.start_time) lines.push(`- **Start**: ${formatDate(study.start_time as string)}`);
          if (study.end_time) lines.push(`- **End**: ${formatDate(study.end_time as string)}`);
          if (study.cells && Array.isArray(study.cells)) {
            lines.push(`- **Cells**: ${(study.cells as Array<Record<string, unknown>>).length}`);
          }
          if (study.results) lines.push(`- **Results**: ${JSON.stringify(study.results)}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "A/B tests") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get A/B Test Results ─────────────────────────────────────────────────
  server.registerTool(
    "meta_get_ad_study_results",
    {
      title: "Get A/B Test Results",
      description: `Gets detailed results of a specific A/B test (ad study).

Args:
  - study_id (string): The ad study ID

Returns: Study details including winner, confidence level, and per-cell metrics.`,
      inputSchema: z
        .object({
          study_id: z.string().describe("Ad study ID"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ study_id, response_format }) => {
      try {
        const data = await client.get<Record<string, unknown>>(
          `/${study_id}`,
          {
            fields: "id,name,type,start_time,end_time,results,cells,confidence_level",
          }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [
          `# A/B Test Results: ${data.name ?? study_id}`,
          "",
        ];
        if (data.type) lines.push(`- **Type**: ${data.type}`);
        if (data.confidence_level) lines.push(`- **Confidence Level**: ${data.confidence_level}%`);
        if (data.start_time) lines.push(`- **Start**: ${formatDate(data.start_time as string)}`);
        if (data.end_time) lines.push(`- **End**: ${formatDate(data.end_time as string)}`);
        lines.push("");

        if (data.results) {
          lines.push(`## Results`);
          const results = data.results as Record<string, unknown>;
          if (results.winner) lines.push(`- **Winner**: ${JSON.stringify(results.winner)}`);
          lines.push(`- **Raw**: ${JSON.stringify(results)}`);
          lines.push("");
        }

        if (data.cells && Array.isArray(data.cells)) {
          lines.push(`## Cells`);
          for (const cell of data.cells as Array<Record<string, unknown>>) {
            lines.push(`### ${cell.name ?? "Unnamed Cell"}`);
            if (cell.treatment_percentage != null) lines.push(`- **Traffic**: ${cell.treatment_percentage}%`);
            if (cell.campaigns) lines.push(`- **Campaigns**: ${JSON.stringify(cell.campaigns)}`);
            if (cell.adsets) lines.push(`- **Ad Sets**: ${JSON.stringify(cell.adsets)}`);
            lines.push("");
          }
        }

        return { content: [{ type: "text", text: truncate(lines.join("\n"), "A/B test results") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Lead Gen Forms ──────────────────────────────────────────────
  server.registerTool(
    "meta_list_leadgen_forms",
    {
      title: "List Lead Gen Forms",
      description: `Lists lead generation forms for a Facebook Page.

Lead forms are used with OUTCOME_LEADS campaigns to collect user information.

Requires: meta_list_pages must be called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (1–100, default 20)

Returns form IDs, names, status, and creation times.`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          limit: z.number().int().min(1).max(100).default(20),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ page_id, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: "id,name,status,created_time,leads_count,locale,questions",
          limit,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string;
          name: string;
          status: string;
          created_time?: string;
          leads_count?: number;
          locale?: string;
          questions?: Array<{ key: string; label: string; type: string }>;
        }>>(`/${page_id}/leadgen_forms`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No lead gen forms found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Lead Gen Forms (${data.data.length})`, ""];
        for (const form of data.data) {
          lines.push(`## ${form.name} (\`${form.id}\`)`);
          lines.push(`- **Status**: ${form.status}`);
          if (form.leads_count !== undefined) lines.push(`- **Leads**: ${formatNumber(form.leads_count)}`);
          if (form.locale) lines.push(`- **Locale**: ${form.locale}`);
          if (form.created_time) lines.push(`- **Created**: ${formatDate(form.created_time)}`);
          if (form.questions?.length) {
            lines.push(`- **Questions**: ${form.questions.map(q => q.label || q.key).join(", ")}`);
          }
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "lead gen forms") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Lead Gen Form Leads ────────────────────────────────────────────
  server.registerTool(
    "meta_get_leadgen_leads",
    {
      title: "Get Leads from Form",
      description: `Gets submitted leads from a lead generation form.

Requires: meta_list_pages must be called first to load page tokens.

Args:
  - form_id (string): Lead gen form ID (from meta_list_leadgen_forms)
  - page_id (string): Page ID (for authentication)
  - limit (number): Max results (1–100, default 25)
  - after (string, optional): Pagination cursor

Returns lead data including field values, creation time, and ad info.`,
      inputSchema: z
        .object({
          form_id: z.string().describe("Lead gen form ID"),
          page_id: z.string().describe("Page ID (for token)"),
          limit: z.number().int().min(1).max(100).default(25),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ form_id, page_id, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: "id,created_time,field_data,ad_id,ad_name,campaign_id,campaign_name,adset_id,adset_name",
          limit,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string;
          created_time: string;
          field_data: Array<{ name: string; values: string[] }>;
          ad_id?: string;
          ad_name?: string;
          campaign_id?: string;
          campaign_name?: string;
          adset_id?: string;
          adset_name?: string;
        }>>(`/${form_id}/leads`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No leads found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Leads (${data.data.length})`, ""];
        for (const lead of data.data) {
          lines.push(`## Lead \`${lead.id}\` (${formatDate(lead.created_time)})`);
          for (const field of lead.field_data) {
            lines.push(`- **${field.name}**: ${field.values.join(", ")}`);
          }
          if (lead.campaign_name) lines.push(`- _Campaign: ${lead.campaign_name}_`);
          if (lead.ad_name) lines.push(`- _Ad: ${lead.ad_name}_`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "leads") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Ad Rule ─────────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_ad_rule",
    {
      title: "Get Ad Rule Details",
      description: `Gets details for a specific automated ad rule.

Args:
  - rule_id (string): Ad rule ID`,
      inputSchema: z
        .object({
          rule_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ rule_id, response_format }) => {
      try {
        const data = await client.get<{
          id: string;
          name: string;
          status: string;
          evaluation_spec?: Record<string, unknown>;
          execution_spec?: Record<string, unknown>;
          schedule_spec?: Record<string, unknown>;
          created_time?: string;
          updated_time?: string;
        }>(`/${rule_id}`, {
          fields: "id,name,status,evaluation_spec,execution_spec,schedule_spec,created_time,updated_time",
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [
          `# Rule: ${data.name}`,
          "",
          `- **ID**: \`${data.id}\``,
          `- **Status**: ${data.status}`,
          data.evaluation_spec ? `- **Evaluation**: ${JSON.stringify(data.evaluation_spec, null, 2)}` : "",
          data.execution_spec ? `- **Action**: ${JSON.stringify(data.execution_spec, null, 2)}` : "",
          data.schedule_spec ? `- **Schedule**: ${JSON.stringify(data.schedule_spec, null, 2)}` : "",
          data.created_time ? `- **Created**: ${formatDate(data.created_time)}` : "",
          data.updated_time ? `- **Updated**: ${formatDate(data.updated_time)}` : "",
        ].filter(Boolean);

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Minimum Budgets ──────────────────────────────────────────────
  server.registerTool(
    "meta_get_minimum_budgets",
    {
      title: "Get Minimum Ad Budgets",
      description: `Gets the minimum daily and lifetime budgets for an ad account by currency and bid strategy.

Essential to check before creating ad sets — using a budget below the minimum causes API errors.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)

Returns: Minimum budget requirements per bid strategy.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ ad_account_id, response_format }) => {
      try {
        const data = await client.get<{ data: Array<{
          currency: string;
          min_daily_budget_imp: number;
          min_daily_budget_low_freq: number;
          min_daily_budget_high_freq: number;
        }> }>(`/${ad_account_id}/minimum_budgets`, {});

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No minimum budget data available." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Minimum Budgets for \`${ad_account_id}\``, ""];
        for (const row of data.data) {
          lines.push(`## ${row.currency}`);
          lines.push(`- **Impressions**: ${formatNumber(row.min_daily_budget_imp)} cents/day`);
          lines.push(`- **Low Frequency Events**: ${formatNumber(row.min_daily_budget_low_freq)} cents/day`);
          lines.push(`- **High Frequency Events**: ${formatNumber(row.min_daily_budget_high_freq)} cents/day`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Offline Event Sets ──────────────────────────────────────────
  server.registerTool(
    "meta_list_offline_event_sets",
    {
      title: "List Offline Event Sets",
      description: `Lists offline conversion event sets for an ad account.

Offline event sets track conversions that happen outside of digital channels (in-store purchases, phone orders, etc.).

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)
  - limit (number): Max results (1–100, default 25)
  - after (string, optional): Pagination cursor

Returns: Event set IDs, names, and configuration.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          limit: z.number().int().min(1).max(100).default(25),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ ad_account_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,name,description,is_auto_assigned,event_stats,last_fired_time",
          limit,
        };
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<{
          id: string;
          name: string;
          description?: string;
          is_auto_assigned?: boolean;
          event_stats?: string;
          last_fired_time?: string;
        }>>(`/${ad_account_id}/offline_conversion_data_sets`, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No offline event sets found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Offline Event Sets (${data.data.length})`, ""];
        for (const es of data.data) {
          lines.push(`## ${es.name} (\`${es.id}\`)`);
          if (es.description) lines.push(`- **Description**: ${es.description}`);
          if (es.last_fired_time) lines.push(`- **Last Event**: ${formatDate(es.last_fired_time)}`);
          if (es.is_auto_assigned !== undefined) lines.push(`- **Auto-assigned**: ${es.is_auto_assigned}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Send Offline Conversion Event ───────────────────────────────────
  server.registerTool(
    "meta_send_offline_event",
    {
      title: "Send Offline Conversion Event",
      description: `Sends an offline conversion event to a Meta offline event set.

Used for tracking in-store purchases, phone orders, or other offline conversions.

Args:
  - event_set_id (string): Offline event set ID (from meta_list_offline_event_sets)
  - event_name (string): Event name (e.g., "Purchase", "Lead")
  - event_time (number): Unix timestamp of the conversion
  - user_data (object): Customer match data — at least one of: email, phone, fn (first name), ln (last name), ct (city), st (state), zip, country, external_id. All PII must be SHA256 hashed.
  - custom_data (object, optional): { currency, value, content_name, order_id }
  - upload_tag (string, optional): Tag for grouping uploads

Returns: Number of events received.`,
      inputSchema: z
        .object({
          event_set_id: z.string().describe("Offline event set ID"),
          event_name: z.string().describe("Event name (e.g., 'Purchase')"),
          event_time: z.number().describe("Unix timestamp"),
          user_data: z.record(z.string()).describe("Customer match data (hashed PII)"),
          custom_data: z.object({
            currency: z.string().optional(),
            value: z.number().optional(),
            content_name: z.string().optional(),
            order_id: z.string().optional(),
          }).optional(),
          upload_tag: z.string().optional().describe("Tag for grouping uploads"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async ({ event_set_id, event_name, event_time, user_data, custom_data, upload_tag, response_format }) => {
      try {
        const event: Record<string, unknown> = {
          match_keys: user_data,
          event_name,
          event_time,
        };
        if (custom_data?.currency) event.currency = custom_data.currency;
        if (custom_data?.value !== undefined) event.value = custom_data.value;
        if (custom_data?.content_name) event.content_name = custom_data.content_name;
        if (custom_data?.order_id) event.order_id = custom_data.order_id;

        const payload: Record<string, unknown> = {
          data: [event],
        };
        if (upload_tag) payload.upload_tag = upload_tag;

        const result = await client.post<{ num_processed_entries: number; entries_processed?: number }>(
          `/${event_set_id}/events`,
          payload
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Offline event sent.\n\n- **Events Processed**: ${result.num_processed_entries ?? result.entries_processed ?? "unknown"}\n- **Event Name**: ${event_name}\n- **Event Set**: \`${event_set_id}\``,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
