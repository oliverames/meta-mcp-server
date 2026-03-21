import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, truncate, formatNumber, formatDate, buildPaginationNote, ResponseFormatSchema } from "../services/utils.js";
import { AUDIENCE_FIELDS } from "../constants.js";
import { CustomAudience, MetaPaginatedResponse } from "../types.js";

export function registerAudiencesTools(server: McpServer, client: MetaApiClient): void {
  // ─── List Custom Audiences ─────────────────────────────────────────────────
  server.registerTool(
    "meta_list_custom_audiences",
    {
      title: "List Custom Audiences",
      description: `Lists custom audiences in a Meta ad account.

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)
  - limit (number): Max results (1–100, default 20)
  - after (string, optional): Pagination cursor

Returns audience names, types, size estimates, and delivery status.`,
      inputSchema: z
        .object({
          ad_account_id: z.string().describe("Ad account ID (e.g., act_123456789)"),
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
        const params: Record<string, unknown> = { fields: AUDIENCE_FIELDS, limit };
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<CustomAudience>>(
          `/${ad_account_id}/customaudiences`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No custom audiences found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Custom Audiences (${data.data.length} shown)`, ""];
        for (const aud of data.data) {
          lines.push(`## ${aud.name} (\`${aud.id}\`)`);
          lines.push(`- **Type**: ${aud.subtype}`);
          if (aud.description) lines.push(`- **Description**: ${aud.description}`);
          const sizeLow = aud.approximate_count_lower_bound;
          const sizeHigh = aud.approximate_count_upper_bound;
          if (sizeLow !== undefined) {
            lines.push(`- **Size**: ~${formatNumber(sizeLow)}–${formatNumber(sizeHigh ?? sizeLow)}`);
          }
          if (aud.delivery_status) {
            lines.push(`- **Delivery Status**: ${aud.delivery_status.description} (code ${aud.delivery_status.code})`);
          }
          if (aud.time_created) {
            lines.push(`- **Created**: ${formatDate(new Date(aud.time_created * 1000).toISOString())}`);
          }
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "audiences") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Custom Audience ──────────────────────────────────────────────────
  server.registerTool(
    "meta_get_custom_audience",
    {
      title: "Get Custom Audience",
      description: `Gets details about a specific custom audience.

Args:
  - audience_id (string): Custom audience ID`,
      inputSchema: z
        .object({
          audience_id: z.string().describe("Custom audience ID"),
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
    async ({ audience_id, response_format }) => {
      try {
        const aud = await client.get<CustomAudience>(`/${audience_id}`, {
          fields: AUDIENCE_FIELDS,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(aud, null, 2) }] };
        }

        const lines = [
          `# Audience: ${aud.name}`,
          "",
          `- **ID**: \`${aud.id}\``,
          `- **Type**: ${aud.subtype}`,
          aud.description ? `- **Description**: ${aud.description}` : "",
          aud.approximate_count_lower_bound !== undefined
            ? `- **Size**: ~${formatNumber(aud.approximate_count_lower_bound)}–${formatNumber(aud.approximate_count_upper_bound ?? aud.approximate_count_lower_bound)}`
            : "",
          aud.delivery_status
            ? `- **Delivery**: ${aud.delivery_status.description}`
            : "",
          aud.operation_status
            ? `- **Operation**: ${aud.operation_status.description}`
            : "",
          aud.time_created
            ? `- **Created**: ${formatDate(new Date(aud.time_created * 1000).toISOString())}`
            : "",
        ]
          .filter(Boolean)
          .join("\n");

        return { content: [{ type: "text", text: lines }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Custom Audience ───────────────────────────────────────────────
  server.registerTool(
    "meta_create_custom_audience",
    {
      title: "Create Custom Audience",
      description: `Creates a new custom audience in a Meta ad account.

Supported types:
  - CUSTOM: Website visitors (requires Pixel), app activity, or customer list
  - ENGAGEMENT: People who engaged with your content
  - VIDEO: People who watched your videos

Args:
  - ad_account_id (string): Ad account ID (e.g., act_123456789)
  - name (string): Audience name
  - subtype (string): CUSTOM, ENGAGEMENT, VIDEO, WEBSITE, or APP
  - description (string, optional): Audience description
  - customer_file_source (string, optional): For CUSTOM type — USER_PROVIDED_ONLY, PARTNER_PROVIDED_ONLY, BOTH_USER_AND_PARTNER_PROVIDED
  - retention_days (number, optional): Days to retain audience members (1–180)

Returns the new audience ID.

Note: Populating the audience with users is a separate step requiring the Audiences API to upload hashed data or configure a rule.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          name: z.string().min(1),
          subtype: z
            .enum(["CUSTOM", "ENGAGEMENT", "VIDEO", "WEBSITE", "APP"])
            .describe("Audience type"),
          description: z.string().optional(),
          customer_file_source: z
            .enum(["USER_PROVIDED_ONLY", "PARTNER_PROVIDED_ONLY", "BOTH_USER_AND_PARTNER_PROVIDED"])
            .optional()
            .describe("Required for CUSTOM type"),
          retention_days: z
            .number()
            .int()
            .min(1)
            .max(180)
            .optional()
            .describe("Retention window in days"),
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
    async ({ ad_account_id, name, subtype, description, customer_file_source, retention_days, response_format }) => {
      try {
        const fields: Record<string, unknown> = { name, subtype };
        if (description) fields.description = description;
        if (customer_file_source) fields.customer_file_source = customer_file_source;
        if (retention_days) fields.retention_days = retention_days;

        const result = await client.post<{ id: string }>(
          `/${ad_account_id}/customaudiences`,
          fields
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Custom audience created successfully.\n\n- **Audience ID**: \`${result.id}\`\n- **Name**: ${name}\n- **Type**: ${subtype}`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Lookalike Audience ─────────────────────────────────────────────
  server.registerTool(
    "meta_create_lookalike_audience",
    {
      title: "Create Lookalike Audience",
      description: `Creates a lookalike audience based on an existing custom audience or page.

Args:
  - ad_account_id (string): Ad account ID
  - name (string): Audience name
  - origin_audience_id (string): Source custom audience ID to base the lookalike on
  - country (string): ISO 3166-1 alpha-2 country code (e.g., "US", "GB")
  - ratio (number): Lookalike size as fraction of country population (0.01–0.20, i.e. 1%–20%)

Returns the new lookalike audience ID.`,
      inputSchema: z
        .object({
          ad_account_id: z.string(),
          name: z.string().min(1),
          origin_audience_id: z.string().describe("Source custom audience ID"),
          country: z.string().length(2).describe("ISO country code (e.g., US)"),
          ratio: z
            .number()
            .min(0.01)
            .max(0.2)
            .describe("Audience size ratio (0.01–0.20)"),
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
    async ({ ad_account_id, name, origin_audience_id, country, ratio, response_format }) => {
      try {
        const result = await client.post<{ id: string }>(
          `/${ad_account_id}/customaudiences`,
          {
            name,
            subtype: "LOOKALIKE",
            origin_audience_id,
            lookalike_spec: {
              type: "similarity",
              ratio,
              country,
            },
          }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Lookalike audience created successfully.\n\n- **Audience ID**: \`${result.id}\`\n- **Name**: ${name}\n- **Based on**: \`${origin_audience_id}\`\n- **Country**: ${country}\n- **Size**: ${(ratio * 100).toFixed(0)}% of population`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Custom Audience ───────────────────────────────────────────────
  server.registerTool(
    "meta_delete_custom_audience",
    {
      title: "Delete Custom Audience",
      description: `Deletes a custom audience permanently. This cannot be undone.

Args:
  - audience_id (string): Custom audience ID to delete`,
      inputSchema: z
        .object({
          audience_id: z.string().describe("Custom audience ID"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ audience_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${audience_id}`);
        return {
          content: [
            {
              type: "text",
              text: result.success
                ? `Audience \`${audience_id}\` deleted successfully.`
                : `Failed to delete audience \`${audience_id}\`.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
