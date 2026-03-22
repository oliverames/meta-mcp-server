import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, formatDate, ResponseFormatSchema } from "../services/utils.js";
import { GRAPH_API_VERSION } from "../constants.js";

export function registerUtilityTools(server: McpServer, client: MetaApiClient): void {
  // ─── Token Info / Debug ────────────────────────────────────────────────
  server.registerTool(
    "meta_debug_token",
    {
      title: "Debug Access Token",
      description: `Inspects the current Meta access token to show its type, expiry, permissions, and associated app/user.

Useful for diagnosing "permission denied" errors or checking when a token expires.

No arguments needed — inspects the META_ACCESS_TOKEN configured in your MCP env.`,
      inputSchema: z
        .object({
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ response_format }) => {
      try {
        const data = await client.get<{
          data: {
            app_id: string;
            type: string;
            application: string;
            data_access_expires_at: number;
            expires_at: number;
            is_valid: boolean;
            issued_at?: number;
            scopes: string[];
            user_id?: string;
            profile_id?: string;
            granular_scopes?: Array<{ scope: string; target_ids?: string[] }>;
          };
        }>("/debug_token", {
          input_token: client.getUserToken(),
        });

        const info = data.data;

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
        }

        const expiresAt = info.expires_at
          ? info.expires_at === 0
            ? "Never (long-lived system user token)"
            : formatDate(new Date(info.expires_at * 1000).toISOString())
          : "Unknown";

        const dataAccessExpires = info.data_access_expires_at
          ? formatDate(new Date(info.data_access_expires_at * 1000).toISOString())
          : "Unknown";

        const lines = [
          `# Token Info`,
          "",
          `- **Valid**: ${info.is_valid ? "Yes" : "**NO — token is invalid or expired!**"}`,
          `- **Type**: ${info.type}`,
          `- **App**: ${info.application} (\`${info.app_id}\`)`,
          info.user_id ? `- **User ID**: \`${info.user_id}\`` : "",
          info.profile_id ? `- **Profile ID**: \`${info.profile_id}\`` : "",
          `- **Expires**: ${expiresAt}`,
          `- **Data Access Expires**: ${dataAccessExpires}`,
          "",
          `## Permissions (${info.scopes?.length ?? 0})`,
          "",
          ...(info.scopes?.map((s) => `- \`${s}\``) ?? ["_No scopes_"]),
        ].filter(Boolean);

        if (!info.is_valid) {
          lines.push(
            "",
            "## Action Required",
            "Your token is invalid. Generate a new one at:",
            "https://developers.facebook.com/tools/explorer/"
          );
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Server Health Check ───────────────────────────────────────────────
  server.registerTool(
    "meta_health_check",
    {
      title: "Meta MCP Health Check",
      description: `Checks the health of the Meta MCP server: token status, cached tokens, API connectivity.

Returns: Token validity, number of cached page tokens, Threads token status, and API reachability.`,
      inputSchema: z
        .object({
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ response_format }) => {
      try {
        const checks: Record<string, string> = {};

        // Check if Meta token is configured
        const hasToken = !!client.getUserToken();
        checks["META_ACCESS_TOKEN"] = hasToken ? "Configured" : "NOT SET — add to MCP env config";

        // Check if Threads token is configured
        checks["THREADS_ACCESS_TOKEN"] = client.hasThreadsToken() ? "Configured" : "Not set (optional)";

        // Check cached page tokens
        checks["Cached page tokens"] = `${client.getPageTokenCount()} pages`;

        // Check API connectivity
        if (hasToken) {
          try {
            await client.get<{ id: string }>("/me", { fields: "id" });
            checks["Graph API"] = "Connected";
          } catch {
            checks["Graph API"] = "ERROR — token may be invalid or expired";
          }
        } else {
          checks["Graph API"] = "Skipped (no token)";
        }

        if (client.hasThreadsToken()) {
          try {
            await client.threadsGet<{ id: string }>("/me", { fields: "id" });
            checks["Threads API"] = "Connected";
          } catch {
            checks["Threads API"] = "ERROR — Threads token may be invalid";
          }
        } else {
          checks["Threads API"] = "Skipped (no token)";
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(checks, null, 2) }] };
        }

        const lines = [
          `# Meta MCP Health Check`,
          "",
          ...Object.entries(checks).map(([k, v]) =>
            `- **${k}**: ${v.startsWith("ERROR") || v.startsWith("NOT SET") ? `⚠️ ${v}` : `✅ ${v}`}`
          ),
          "",
          `_Graph API: ${GRAPH_API_VERSION}_`,
        ];

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Search Places ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_search_places",
    {
      title: "Search Facebook Places",
      description: `Searches for Facebook Places (locations) by name or coordinates.

Use this to get a location_id for tagging posts, Instagram photos, or Threads.

Args:
  - q (string, optional): Search query (e.g., "Central Park", "Starbucks NYC")
  - center (string, optional): Latitude,longitude center point (e.g., "40.7829,-73.9654")
  - distance (number, optional): Search radius in meters (default: 1000, max: 50000)
  - limit (number): Max results (1–100, default 20)
  - categories (string[], optional): Filter by category — e.g., ["FOOD_BEVERAGE", "HOTEL_LODGING", "SHOPPING_RETAIL"]

Returns: Place IDs, names, addresses, and coordinates.

Note: Provide at least q or center. Both can be combined for location-aware name search.`,
      inputSchema: z
        .object({
          q: z.string().optional().describe("Search query"),
          center: z.string().optional().describe("Lat,lng (e.g., '40.7829,-73.9654')"),
          distance: z.number().int().min(1).max(50000).default(1000).describe("Search radius in meters"),
          limit: z.number().int().min(1).max(100).default(20),
          categories: z.array(z.string()).optional().describe("Category filters"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ q, center, distance, limit, categories, response_format }) => {
      try {
        if (!q && !center) {
          return { content: [{ type: "text", text: "Error: Provide at least 'q' (search query) or 'center' (lat,lng)." }], isError: true };
        }

        const params: Record<string, unknown> = {
          type: "place",
          fields: "id,name,location,category_list,checkins,overall_star_rating",
          limit,
        };
        if (q) params.q = q;
        if (center) {
          params.center = center;
          params.distance = distance;
        }
        if (categories?.length) params.categories = JSON.stringify(categories);

        const data = await client.get<{ data: Array<{
          id: string;
          name: string;
          location?: { city?: string; state?: string; country?: string; street?: string; zip?: string; latitude?: number; longitude?: number };
          category_list?: Array<{ id: string; name: string }>;
          checkins?: number;
          overall_star_rating?: number;
        }> }>("/search", params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No places found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
        }

        const lines = [`# Places (${data.data.length})`, ""];
        for (const place of data.data) {
          const loc = place.location;
          const addr = loc ? [loc.street, loc.city, loc.state, loc.country].filter(Boolean).join(", ") : "";
          lines.push(`## ${place.name} (\`${place.id}\`)`);
          if (addr) lines.push(`- **Address**: ${addr}`);
          if (loc?.latitude) lines.push(`- **Coords**: ${loc.latitude}, ${loc.longitude}`);
          if (place.category_list?.length) lines.push(`- **Categories**: ${place.category_list.map(c => c.name).join(", ")}`);
          if (place.checkins) lines.push(`- **Checkins**: ${place.checkins}`);
          if (place.overall_star_rating) lines.push(`- **Rating**: ${place.overall_star_rating}/5`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
