import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, truncate, truncateField, formatNumber, formatDate, buildPaginationNote, ResponseFormatSchema } from "../services/utils.js";
import { IG_ACCOUNT_FIELDS, IG_MEDIA_FIELDS } from "../constants.js";
import {
  InstagramAccount,
  InstagramMedia,
  InstagramComment,
  MetaPaginatedResponse,
} from "../types.js";

export function registerInstagramTools(server: McpServer, client: MetaApiClient): void {
  // ─── List Instagram Accounts ──────────────────────────────────────────────
  server.registerTool(
    "meta_list_instagram_accounts",
    {
      title: "List Instagram Business Accounts",
      description: `Lists all Instagram professional accounts linked to the user's Facebook Pages.

Requires: meta_list_pages must be called first.

Returns: Instagram account IDs, usernames, follower counts. The account ID is needed for all other Instagram tools.`,
      inputSchema: z
        .object({
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
    async ({ response_format }) => {
      try {
        // Use nested field expansion to fetch IG details in a single API call (avoids N+1)
        const pagesData = await client.get<{
          data: Array<{
            id: string;
            name: string;
            access_token?: string;
            instagram_business_account?: InstagramAccount;
          }>;
        }>("/me/accounts", {
          fields: `id,name,access_token,instagram_business_account{${IG_ACCOUNT_FIELDS}}`,
        });

        const accounts: Array<InstagramAccount & { page_name: string; page_id: string }> = [];

        for (const page of pagesData.data) {
          if (page.access_token) client.cachePageToken(page.id, page.access_token);
          if (!page.instagram_business_account?.id) continue;
          accounts.push({ ...page.instagram_business_account, page_name: page.name, page_id: page.id });
        }

        if (!accounts.length) {
          return {
            content: [
              {
                type: "text",
                text: "No Instagram business accounts found linked to your Facebook Pages.",
              },
            ],
          };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(accounts, null, 2) }] };
        }

        const lines = [`# Instagram Business Accounts (${accounts.length})`, ""];
        for (const acc of accounts) {
          lines.push(`## @${acc.username ?? acc.name ?? "Unknown"} (\`${acc.id}\`)`);
          lines.push(`- **Page**: ${acc.page_name} (\`${acc.page_id}\`)`);
          lines.push(`- **Followers**: ${formatNumber(acc.followers_count)}`);
          lines.push(`- **Following**: ${formatNumber(acc.follows_count)}`);
          lines.push(`- **Posts**: ${formatNumber(acc.media_count)}`);
          if (acc.biography) lines.push(`- **Bio**: ${acc.biography}`);
          if (acc.website) lines.push(`- **Website**: ${acc.website}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Instagram Media ──────────────────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_media",
    {
      title: "Get Instagram Media",
      description: `Lists media (posts, reels, stories) from an Instagram professional account.

Args:
  - ig_account_id (string): Instagram account ID (from meta_list_instagram_accounts)
  - limit (number): Max items to return (1–100, default 20)
  - after (string, optional): Pagination cursor`,
      inputSchema: z
        .object({
          ig_account_id: z.string().describe("Instagram account ID"),
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
    async ({ ig_account_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = { fields: IG_MEDIA_FIELDS, limit };
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<InstagramMedia>>(
          `/${ig_account_id}/media`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No media found for this Instagram account." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Instagram Media (${data.data.length} shown)`, ""];
        for (const media of data.data) {
          const type = media.media_product_type ?? media.media_type;
          lines.push(`## ${type} \`${media.id}\``);
          lines.push(`- **Posted**: ${formatDate(media.timestamp)}`);
          if (media.caption) lines.push(`- **Caption**: ${truncateField(media.caption, 150)}`);
          lines.push(`- **Likes**: ${formatNumber(media.like_count)} | **Comments**: ${formatNumber(media.comments_count)}`);
          if (media.permalink) lines.push(`- **Link**: ${media.permalink}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "media") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Instagram Photo ──────────────────────────────────────────────
  server.registerTool(
    "meta_publish_instagram_photo",
    {
      title: "Publish Instagram Photo",
      description: `Publishes a single image post to an Instagram professional account.

Two-step process: creates a media container then publishes it.

Args:
  - ig_account_id (string): Instagram account ID
  - image_url (string): Public URL of the JPEG image to post (must be publicly accessible)
  - caption (string, optional): Post caption (supports hashtags and @mentions)
  - alt_text (string, optional): Alt text for accessibility (screen readers)
  - location_id (string, optional): Facebook Place ID to tag location

Returns: Media ID of the published post.

Limitations:
  - JPEG only (no PNG, GIF, HEIC)
  - Max 100 posts per 24 hours
  - Image must be hosted on a public server`,
      inputSchema: z
        .object({
          ig_account_id: z.string().describe("Instagram account ID"),
          image_url: z.string().url().describe("Public URL of the JPEG image"),
          caption: z.string().optional().describe("Post caption"),
          alt_text: z.string().optional().describe("Alt text for accessibility"),
          location_id: z.string().optional().describe("Facebook Place ID"),
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
    async ({ ig_account_id, image_url, caption, alt_text, location_id, response_format }) => {
      try {
        // Step 1: Create container
        const containerFields: Record<string, unknown> = { image_url };
        if (caption) containerFields.caption = caption;
        if (alt_text) containerFields.alt_text = alt_text;
        if (location_id) containerFields.location_id = location_id;

        const container = await client.post<{ id: string }>(
          `/${ig_account_id}/media`,
          containerFields
        );

        // Step 2: Publish
        const result = await client.post<{ id: string }>(`/${ig_account_id}/media_publish`, {
          creation_id: container.id,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: [
                "Photo published to Instagram successfully.",
                "",
                `- **Media ID**: \`${result.id}\``,
                `- **Container ID**: \`${container.id}\``,
              ].join("\n"),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Instagram Reel ───────────────────────────────────────────────
  server.registerTool(
    "meta_publish_instagram_reel",
    {
      title: "Publish Instagram Reel",
      description: `Publishes a video reel to an Instagram professional account.

Args:
  - ig_account_id (string): Instagram account ID
  - video_url (string): Public URL of the video file (MP4 recommended)
  - caption (string, optional): Reel caption
  - share_to_feed (boolean, optional): Also share to feed. Default true.

Returns: Media ID of the published reel.

Notes:
  - Video must be on a publicly accessible server
  - Check container status before publishing — video processing can take time
  - Use meta_get_instagram_container_status to check readiness`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          video_url: z.string().url().describe("Public URL of the video"),
          caption: z.string().optional(),
          share_to_feed: z.boolean().default(true),
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
    async ({ ig_account_id, video_url, caption, share_to_feed, response_format }) => {
      try {
        const containerFields: Record<string, unknown> = {
          media_type: "REELS",
          video_url,
          share_to_feed,
        };
        if (caption) containerFields.caption = caption;

        const container = await client.post<{ id: string }>(
          `/${ig_account_id}/media`,
          containerFields
        );

        // Poll status (video needs processing time)
        const statusCode = await client.pollContainerStatus(container.id, "instagram");

        if (statusCode !== "FINISHED") {
          return {
            content: [
              {
                type: "text",
                text: [
                  `Container created (\`${container.id}\`) but video processing status: ${statusCode}.`,
                  "",
                  "If status is FINISHED, publish with:",
                  `\`meta_publish_instagram_container\` with container_id: \`${container.id}\``,
                ].join("\n"),
              },
            ],
          };
        }

        const result = await client.post<{ id: string }>(`/${ig_account_id}/media_publish`, {
          creation_id: container.id,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Reel published successfully.\n\n- **Media ID**: \`${result.id}\``,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Instagram Story ──────────────────────────────────────────────
  server.registerTool(
    "meta_publish_instagram_story",
    {
      title: "Publish Instagram Story",
      description: `Publishes an image or video story to an Instagram professional account.

Args:
  - ig_account_id (string): Instagram account ID
  - media_url (string): Public URL of the image or video
  - media_type (string): 'IMAGE' or 'VIDEO'

Returns: Media ID of the published story.`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          media_url: z.string().url().describe("Public URL of image or video"),
          media_type: z.enum(["IMAGE", "VIDEO"]).describe("Type of story media"),
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
    async ({ ig_account_id, media_url, media_type, response_format }) => {
      try {
        const containerFields: Record<string, unknown> = {
          media_type: "STORIES",
          ...(media_type === "IMAGE" ? { image_url: media_url } : { video_url: media_url }),
        };

        const container = await client.post<{ id: string }>(
          `/${ig_account_id}/media`,
          containerFields
        );

        // Video stories need processing time
        if (media_type === "VIDEO") {
          const statusCode = await client.pollContainerStatus(container.id, "instagram");
          if (statusCode !== "FINISHED") {
            return {
              content: [{
                type: "text",
                text: `Container created (\`${container.id}\`) but video processing status: ${statusCode}.\n\nUse \`meta_publish_instagram_container\` to publish when ready.`,
              }],
            };
          }
        }

        const result = await client.post<{ id: string }>(`/${ig_account_id}/media_publish`, {
          creation_id: container.id,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Story published successfully.\n\n- **Media ID**: \`${result.id}\``,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Instagram Carousel ───────────────────────────────────────────
  server.registerTool(
    "meta_publish_instagram_carousel",
    {
      title: "Publish Instagram Carousel Post",
      description: `Publishes a carousel post (2–10 images/videos) to Instagram.

Three-step process:
1. Creates individual media containers for each item
2. Creates a carousel container referencing them
3. Publishes the carousel

Args:
  - ig_account_id (string): Instagram account ID
  - items (array): Array of up to 10 items, each with:
      - url (string): Public image URL (JPEG) or video URL
      - type (string): 'IMAGE' or 'VIDEO'
  - caption (string, optional): Carousel caption

Returns: Media ID of the published carousel.`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          items: z
            .array(
              z.object({
                url: z.string().url(),
                type: z.enum(["IMAGE", "VIDEO"]),
              })
            )
            .min(2)
            .max(10)
            .describe("Media items for carousel (2–10)"),
          caption: z.string().optional(),
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
    async ({ ig_account_id, items, caption, response_format }) => {
      try {
        // Step 1: Create all item containers in parallel
        const results = await Promise.allSettled(
          items.map(async (item) => {
            const fields: Record<string, unknown> = {
              is_carousel_item: "true",
              ...(item.type === "IMAGE" ? { image_url: item.url } : { video_url: item.url, media_type: "VIDEO" }),
            };
            return { ...(await client.post<{ id: string }>(`/${ig_account_id}/media`, fields)), type: item.type as string };
          })
        );
        const rejected = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
        if (rejected.length) {
          const created = results
            .filter((r): r is PromiseFulfilledResult<{ id: string; type: string }> => r.status === "fulfilled")
            .map((r) => r.value.id);
          return {
            content: [{
              type: "text",
              text: `Failed to create ${rejected.length} carousel item container(s). ` +
                (created.length ? `Already created: ${created.map((id) => `\`${id}\``).join(", ")}. ` : "") +
                `Errors: ${rejected.map((r) => (r.reason as Error)?.message ?? String(r.reason)).join("; ")}`,
            }],
            isError: true,
          };
        }
        const containers = (results as PromiseFulfilledResult<{ id: string; type: string }>[]).map((r) => r.value);

        // Step 1b: Poll all video containers in parallel
        const videoContainers = containers.filter((c) => c.type === "VIDEO");
        if (videoContainers.length) {
          const statuses = await Promise.all(
            videoContainers.map((c) => client.pollContainerStatus(c.id, "instagram"))
          );
          const failed = videoContainers
            .map((c, i) => ({ ...c, status: statuses[i] }))
            .filter((c) => c.status !== "FINISHED");
          if (failed.length) {
            return {
              content: [{
                type: "text",
                text: `Video container(s) ${failed.map((c) => `\`${c.id}\` (${c.status})`).join(", ")} did not finish processing. Cannot assemble carousel until all videos are FINISHED.`,
              }],
            };
          }
        }
        const containerIds = containers.map((c) => c.id);

        // Step 2: Create carousel container
        const carouselFields: Record<string, unknown> = {
          media_type: "CAROUSEL",
          children: containerIds.join(","),
        };
        if (caption) carouselFields.caption = caption;

        const carousel = await client.post<{ id: string }>(
          `/${ig_account_id}/media`,
          carouselFields
        );

        // Step 3: Publish
        const result = await client.post<{ id: string }>(`/${ig_account_id}/media_publish`, {
          creation_id: carousel.id,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: [
                `Carousel published successfully (${items.length} items).`,
                "",
                `- **Media ID**: \`${result.id}\``,
                `- **Item containers**: ${containerIds.map((id) => `\`${id}\``).join(", ")}`,
              ].join("\n"),
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Check Instagram Publishing Limit ────────────────────────────────────
  server.registerTool(
    "meta_check_instagram_publishing_limit",
    {
      title: "Check Instagram Publishing Rate Limit",
      description: `Checks how many of the 100 API-published posts per 24-hour limit have been used.

Args:
  - ig_account_id (string): Instagram account ID

Returns: Current usage and quota remaining.`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ig_account_id, response_format }) => {
      try {
        const data = await client.get<{ data: Array<{ quota_usage: number; config: { quota_total: number; quota_duration: number } }> }>(
          `/${ig_account_id}/content_publishing_limit`,
          { fields: "quota_usage,config" }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const limit = data.data?.[0];
        if (!limit) {
          return { content: [{ type: "text", text: "No publishing limit data available." }] };
        }

        const remaining = (limit.config?.quota_total ?? 100) - limit.quota_usage;
        return {
          content: [{
            type: "text",
            text: `# Instagram Publishing Limit\n\n- **Used**: ${limit.quota_usage} / ${limit.config?.quota_total ?? 100}\n- **Remaining**: ${remaining}\n- **Window**: ${Math.round((limit.config?.quota_duration ?? 86400) / 3600)} hours`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Instagram Account Insights ──────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_account_insights",
    {
      title: "Get Instagram Account Insights",
      description: `Gets performance insights for an Instagram professional account.

Args:
  - ig_account_id (string): Instagram account ID
  - metrics (string[]): Metrics to retrieve. Options:
      impressions, reach, profile_views, website_clicks,
      follower_count, email_contacts, phone_call_clicks,
      text_message_clicks, get_directions_clicks
  - period (string): 'day', 'week', 'days_28', 'month'
  - since (string, optional): Start date YYYY-MM-DD
  - until (string, optional): End date YYYY-MM-DD`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          metrics: z
            .array(z.string())
            .default(["impressions", "reach", "profile_views", "follower_count"])
            .describe("Metric names"),
          period: z.enum(["day", "week", "days_28", "month"]).default("day"),
          since: z.string().optional(),
          until: z.string().optional(),
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
    async ({ ig_account_id, metrics, period, since, until, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          metric: metrics.join(","),
          period,
        };
        if (since) params.since = since;
        if (until) params.until = until;

        const data = await client.get<{ data: unknown[] }>(`/${ig_account_id}/insights`, params);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Instagram Account Insights`, `**Period**: ${period}`, ""];
        for (const item of data.data as Array<{
          name: string;
          title: string;
          period: string;
          values: Array<{ value: number; end_time: string }>;
        }>) {
          lines.push(`## ${item.title ?? item.name}`);
          if (item.values?.length) {
            for (const v of item.values.slice(-7)) {
              lines.push(`- ${formatDate(v.end_time)}: **${formatNumber(v.value)}**`);
            }
          }
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "metrics") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Instagram Media Insights ─────────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_media_insights",
    {
      title: "Get Instagram Media Insights",
      description: `Gets performance metrics for a specific Instagram media object.

Args:
  - media_id (string): Instagram media ID (from meta_get_instagram_media)
  - metrics (string[]): Metrics to retrieve. Options vary by media type:
      For images/carousels: impressions, reach, engagement, saved, likes, comments
      For reels: plays, reach, likes, comments, shares, saved, total_interactions
      For stories: impressions, reach, exits, replies, taps_forward, taps_back`,
      inputSchema: z
        .object({
          media_id: z.string().describe("Instagram media ID"),
          metrics: z
            .array(z.string())
            .default(["impressions", "reach", "engagement", "saved"])
            .describe("Metric names"),
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
    async ({ media_id, metrics, response_format }) => {
      try {
        const data = await client.get<{ data: unknown[] }>(`/${media_id}/insights`, {
          metric: metrics.join(","),
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Media Insights: \`${media_id}\``, ""];
        for (const item of data.data as Array<{
          name: string;
          title: string;
          period: string;
          values: Array<{ value: number }>;
        }>) {
          const val = item.values?.[0]?.value ?? "N/A";
          lines.push(`- **${item.title ?? item.name}**: ${formatNumber(val)}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Instagram Comments ───────────────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_comments",
    {
      title: "Get Instagram Comments",
      description: `Gets comments on an Instagram media object.

Args:
  - media_id (string): Instagram media ID
  - limit (number): Max comments to return (1–100, default 20)`,
      inputSchema: z
        .object({
          media_id: z.string(),
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
    async ({ media_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,text,username,timestamp,from",
          limit,
        };
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<InstagramComment>>(
          `/${media_id}/comments`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No comments on this media." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Comments on \`${media_id}\` (${data.data.length})`, ""];
        for (const c of data.data) {
          lines.push(`**@${c.username ?? c.from?.username ?? "unknown"}** (${formatDate(c.timestamp)})`);
          lines.push(`> ${c.text}`);
          lines.push(`_ID: \`${c.id}\`_`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "comments") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Reply to Comment ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_reply_instagram_comment",
    {
      title: "Reply to Instagram Comment",
      description: `Replies to a comment on an Instagram media object.

Args:
  - media_id (string): Instagram media ID (not the comment ID)
  - message (string): Reply text
  - comment_id (string, optional): If replying to a specific comment

Returns: Comment ID of the reply.`,
      inputSchema: z
        .object({
          media_id: z.string().describe("Instagram media ID"),
          message: z.string().min(1).describe("Reply text"),
          comment_id: z
            .string()
            .optional()
            .describe("Comment ID to reply to (for threaded replies)"),
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
    async ({ media_id, message, comment_id, response_format }) => {
      try {
        const fields: Record<string, unknown> = { message };
        if (comment_id) fields.reply_to_id = comment_id;

        const result = await client.post<{ id: string }>(
          `/${media_id}/comments`,
          fields
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Comment posted successfully.\n\n- **Comment ID**: \`${result.id}\``,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Search Instagram Hashtags ───────────────────────────────────────────
  server.registerTool(
    "meta_search_instagram_hashtag",
    {
      title: "Search Instagram Hashtag",
      description: `Searches for a hashtag and gets its ID, then retrieves top or recent media.

Two-step process: first looks up the hashtag ID, then fetches media.

Args:
  - ig_account_id (string): Instagram account ID (required for auth context)
  - hashtag (string): Hashtag to search (without #)
  - edge (string): 'top_media' or 'recent_media' (default: top_media)
  - limit (number): Max results (1–50, default 20)

Note: Limited to 30 unique hashtag searches per 7 days per IG account.`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          hashtag: z.string().min(1).describe("Hashtag without # symbol"),
          edge: z.enum(["top_media", "recent_media"]).default("top_media"),
          limit: z.number().int().min(1).max(50).default(20),
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
    async ({ ig_account_id, hashtag, edge, limit, response_format }) => {
      try {
        // Step 1: Look up hashtag ID
        const hashtagResult = await client.get<{ data: Array<{ id: string }> }>(
          "/ig_hashtag_search",
          { user_id: ig_account_id, q: hashtag }
        );

        if (!hashtagResult.data?.length) {
          return { content: [{ type: "text", text: `Hashtag #${hashtag} not found.` }] };
        }

        const hashtagId = hashtagResult.data[0].id;

        // Step 2: Get media
        const data = await client.get<MetaPaginatedResponse<InstagramMedia>>(
          `/${hashtagId}/${edge}`,
          { user_id: ig_account_id, fields: IG_MEDIA_FIELDS, limit }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: `No ${edge} found for #${hashtag}.` }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify({ hashtag_id: hashtagId, ...data }, null, 2) }] };
        }

        const lines = [`# #${hashtag} — ${edge === "top_media" ? "Top" : "Recent"} Media (${data.data.length})`, `**Hashtag ID**: \`${hashtagId}\``, ""];
        for (const media of data.data) {
          lines.push(`## ${media.media_type} \`${media.id}\``);
          if (media.caption) lines.push(`> ${truncateField(media.caption, 150)}`);
          if (media.like_count !== undefined) lines.push(`- **Likes**: ${formatNumber(media.like_count)} | **Comments**: ${formatNumber(media.comments_count)}`);
          if (media.permalink) lines.push(`- ${media.permalink}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "hashtag media") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Instagram User (Business Discovery) ──────────────────────────
  server.registerTool(
    "meta_get_instagram_user",
    {
      title: "Get Instagram User Info",
      description: `Gets public profile info for any Instagram business/creator account by username.

Uses the Business Discovery API — no follow/connection required.

Args:
  - ig_account_id (string): Your Instagram account ID (for auth)
  - username (string): Instagram username to look up (without @)

Returns: Bio, follower/following counts, media count, profile picture, and recent media.`,
      inputSchema: z
        .object({
          ig_account_id: z.string().describe("Your Instagram account ID"),
          username: z.string().min(1).describe("Username to look up (without @)"),
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
    async ({ ig_account_id, username, response_format }) => {
      try {
        // Business Discovery API syntax: business_discovery.username(TARGET){requested_fields}
        // Per Meta docs: GET /{ig-user-id}?fields=business_discovery.username(bluebottle){followers_count,...}
        const bdFields = `id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website,media.limit(5){${IG_MEDIA_FIELDS}}`;
        const data = await client.get<{
          business_discovery: InstagramAccount & {
            media?: { data: InstagramMedia[] };
          };
        }>(`/${ig_account_id}`, {
          fields: `business_discovery.username(${username}){${bdFields}}`,
        });

        const user = data.business_discovery;
        if (!user) {
          return { content: [{ type: "text", text: `User @${username} not found or not a business/creator account.` }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(user, null, 2) }] };
        }

        const lines = [
          `# @${user.username ?? username}`,
          "",
          `- **Name**: ${user.name ?? "N/A"}`,
          `- **Followers**: ${formatNumber(user.followers_count)}`,
          `- **Following**: ${formatNumber(user.follows_count)}`,
          `- **Posts**: ${formatNumber(user.media_count)}`,
          user.biography ? `- **Bio**: ${user.biography}` : "",
          user.website ? `- **Website**: ${user.website}` : "",
        ].filter(Boolean);

        if (user.media?.data?.length) {
          lines.push("", "## Recent Posts");
          for (const m of user.media.data) {
            lines.push(`- \`${m.id}\` ${m.media_type} — ${truncateField(m.caption, 80) || "No caption"}${m.permalink ? ` (${m.permalink})` : ""}`);
          }
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Instagram Stories ──────────────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_stories",
    {
      title: "Get Instagram Stories",
      description: `Gets currently active stories for an Instagram professional account.

Args:
  - ig_account_id (string): Instagram account ID

Returns: List of active story media objects. Stories expire after 24 hours.`,
      inputSchema: z
        .object({
          ig_account_id: z.string().describe("Instagram account ID"),
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
    async ({ ig_account_id, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<InstagramMedia>>(
          `/${ig_account_id}/stories`,
          { fields: IG_MEDIA_FIELDS }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No active stories found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Active Stories (${data.data.length})`, ""];
        for (const media of data.data) {
          lines.push(`## ${media.media_type} \`${media.id}\``);
          if (media.timestamp) lines.push(`- **Posted**: ${formatDate(media.timestamp)}`);
          if (media.permalink) lines.push(`- **Link**: ${media.permalink}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Instagram Media ────────────────────────────────────────────
  server.registerTool(
    "meta_delete_instagram_media",
    {
      title: "Delete Instagram Media",
      description: `Deletes an Instagram media object (post, reel, story). This is permanent.

Args:
  - media_id (string): Instagram media ID to delete`,
      inputSchema: z
        .object({
          media_id: z.string().describe("Instagram media ID"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ media_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${media_id}`);
        return {
          content: [
            {
              type: "text",
              text: result.success
                ? `Media \`${media_id}\` deleted.`
                : `Failed to delete media \`${media_id}\`.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Toggle Instagram Comments ─────────────────────────────────────────
  server.registerTool(
    "meta_toggle_instagram_comments",
    {
      title: "Toggle Instagram Comments",
      description: `Enables or disables comments on an Instagram media object.

Args:
  - media_id (string): Instagram media ID
  - enabled (boolean): true to enable comments, false to disable`,
      inputSchema: z
        .object({
          media_id: z.string().describe("Instagram media ID"),
          enabled: z.boolean().describe("Enable (true) or disable (false) comments"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ media_id, enabled }) => {
      try {
        await client.post(`/${media_id}`, { comment_enabled: enabled });
        return {
          content: [
            {
              type: "text",
              text: `Comments ${enabled ? "enabled" : "disabled"} on media \`${media_id}\`.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Comment ───────────────────────────────────────────────────────
  server.registerTool(
    "meta_delete_instagram_comment",
    {
      title: "Delete Instagram Comment",
      description: `Deletes a comment on an Instagram media object. This is permanent.

Args:
  - comment_id (string): The comment ID to delete`,
      inputSchema: z
        .object({
          comment_id: z.string().describe("Comment ID to delete"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ comment_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${comment_id}`);
        return {
          content: [
            {
              type: "text",
              text: result.success
                ? `Comment \`${comment_id}\` deleted.`
                : `Failed to delete comment \`${comment_id}\`.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Comment Replies ───────────────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_comment_replies",
    {
      title: "Get Instagram Comment Replies",
      description: `Gets replies to a specific Instagram comment.

Args:
  - comment_id (string): Parent comment ID
  - limit (number): Max replies (1–50, default 20)`,
      inputSchema: z
        .object({
          comment_id: z.string(),
          limit: z.number().int().min(1).max(50).default(20),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ comment_id, limit, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<InstagramComment>>(
          `/${comment_id}/replies`,
          { fields: "id,text,username,timestamp,from", limit }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No replies on this comment." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Replies to \`${comment_id}\` (${data.data.length})`, ""];
        for (const r of data.data) {
          lines.push(`**@${r.username ?? r.from?.username ?? "unknown"}** (${formatDate(r.timestamp)})`);
          lines.push(`> ${r.text}`);
          lines.push(`_ID: \`${r.id}\`_`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "replies") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Media Children (Carousel Items) ───────────────────────────────
  server.registerTool(
    "meta_get_instagram_media_children",
    {
      title: "Get Instagram Carousel Items",
      description: `Gets individual media items in a carousel/album post.

Args:
  - media_id (string): Carousel media ID`,
      inputSchema: z
        .object({
          media_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ media_id, response_format }) => {
      try {
        const data = await client.get<{ data: InstagramMedia[] }>(
          `/${media_id}/children`,
          { fields: IG_MEDIA_FIELDS }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No children found (not a carousel?)." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Carousel Items for \`${media_id}\` (${data.data.length})`, ""];
        for (const child of data.data) {
          lines.push(`## ${child.media_type} \`${child.id}\``);
          if (child.media_url) lines.push(`- **URL**: ${child.media_url}`);
          if (child.timestamp) lines.push(`- **Created**: ${formatDate(child.timestamp)}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Check Container Status ────────────────────────────────────────────
  server.registerTool(
    "meta_check_instagram_container",
    {
      title: "Check Instagram Container Status",
      description: `Checks the publishing status of an Instagram media container (used for reels/videos that need processing).

Args:
  - container_id (string): Container ID from a publish step

Returns: status_code — IN_PROGRESS, FINISHED, ERROR, EXPIRED.`,
      inputSchema: z
        .object({
          container_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ container_id, response_format }) => {
      try {
        const data = await client.get<{ id: string; status_code: string; status?: string }>(`/${container_id}`, {
          fields: "id,status_code,status",
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const code = data.status_code ?? "UNKNOWN";
        const lines = [`Container \`${container_id}\`: **${code}**`];
        if (code === "ERROR" && data.status) {
          lines.push(`\nError details: ${data.status}`);
        }
        if (code === "FINISHED") {
          lines.push(`\nReady to publish with \`meta_publish_instagram_container\`.`);
        }
        if (code === "IN_PROGRESS") {
          lines.push(`\nStill processing. Check again in a few seconds.`);
        }
        return { content: [{ type: "text", text: lines.join("") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Mentioned Media ───────────────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_mentioned_media",
    {
      title: "Get Instagram Mentions",
      description: `Gets media where the Instagram account was @mentioned in a caption or comment.

Args:
  - ig_account_id (string): Instagram account ID
  - limit (number): Max results (default 20)

Requires instagram_manage_comments permission.`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          limit: z.number().int().min(1).max(100).default(20),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ig_account_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: IG_MEDIA_FIELDS,
          limit,
        };
        if (after) params.after = after;

        const data = await client.get<MetaPaginatedResponse<InstagramMedia>>(
          `/${ig_account_id}/tags`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No mentioned media found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Mentioned Media (${data.data.length})`, ""];
        for (const media of data.data) {
          lines.push(`## ${media.media_type} \`${media.id}\``);
          if (media.caption) lines.push(`> ${truncateField(media.caption, 150)}`);
          if (media.permalink) lines.push(`- ${media.permalink}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "mentions") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Recently Searched Hashtags ────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_recent_hashtags",
    {
      title: "Get Recently Searched Hashtags",
      description: `Gets hashtags recently searched by the Instagram account.

Args:
  - ig_account_id (string): Instagram account ID

Note: Limited to 30 unique hashtag searches per 7 days. This returns the recent searches.`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ig_account_id, response_format }) => {
      try {
        const data = await client.get<{ data: Array<{ id: string; name: string }> }>(
          `/${ig_account_id}/recently_searched_hashtags`,
          {}
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No recently searched hashtags." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Recently Searched Hashtags`, ""];
        for (const h of data.data) {
          lines.push(`- #${h.name} (\`${h.id}\`)`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Instagram Live Media ──────────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_live_media",
    {
      title: "Get Instagram Live Media",
      description: `Gets live video broadcasts from an Instagram account.

Args:
  - ig_account_id (string): Instagram account ID`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ig_account_id, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<InstagramMedia>>(
          `/${ig_account_id}/live_media`,
          { fields: IG_MEDIA_FIELDS }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No live media found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Live Media (${data.data.length})`, ""];
        for (const media of data.data) {
          lines.push(`## \`${media.id}\``);
          if (media.timestamp) lines.push(`- **Time**: ${formatDate(media.timestamp)}`);
          if (media.permalink) lines.push(`- **Link**: ${media.permalink}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Product Tags ──────────────────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_product_tags",
    {
      title: "Get Instagram Product Tags",
      description: `Gets product tags on an Instagram media object. Requires Instagram Shopping.

Args:
  - media_id (string): Instagram media ID`,
      inputSchema: z
        .object({
          media_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ media_id, response_format }) => {
      try {
        const data = await client.get<{ data: Array<{ product_id: string; merchant_id?: string; name?: string; image_url?: string; review_status?: string }> }>(
          `/${media_id}/product_tags`,
          {}
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No product tags on this media." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Product Tags on \`${media_id}\``, ""];
        for (const tag of data.data) {
          lines.push(`- **${tag.name ?? "Unknown"}** (\`${tag.product_id}\`)${tag.review_status ? ` — ${tag.review_status}` : ""}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Pre-created Container ─────────────────────────────────────
  server.registerTool(
    "meta_publish_instagram_container",
    {
      title: "Publish Instagram Container",
      description: `Publishes a pre-created Instagram media container. Use after checking container status is FINISHED.

Useful for reels/videos where container creation and publishing are done in separate steps.

Args:
  - ig_account_id (string): Instagram account ID
  - container_id (string): Container ID (from a previous create step)`,
      inputSchema: z
        .object({
          ig_account_id: z.string(),
          container_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ ig_account_id, container_id, response_format }) => {
      try {
        const result = await client.post<{ id: string }>(`/${ig_account_id}/media_publish`, {
          creation_id: container_id,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Published.\n\n- **Media ID**: \`${result.id}\`` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Single Instagram Media ────────────────────────────────────────
  server.registerTool(
    "meta_get_instagram_single_media",
    {
      title: "Get Single Instagram Media Details",
      description: `Gets detailed information about a specific Instagram media object.

Args:
  - media_id (string): Instagram media ID`,
      inputSchema: z
        .object({
          media_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ media_id, response_format }) => {
      try {
        const data = await client.get<InstagramMedia>(`/${media_id}`, {
          fields: IG_MEDIA_FIELDS,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [
          `# Instagram Media \`${data.id}\``,
          "",
          `- **Type**: ${data.media_product_type ?? data.media_type}`,
          data.caption ? `- **Caption**: ${data.caption}` : "",
          data.timestamp ? `- **Posted**: ${formatDate(data.timestamp)}` : "",
          data.like_count !== undefined ? `- **Likes**: ${formatNumber(data.like_count)}` : "",
          data.comments_count !== undefined ? `- **Comments**: ${formatNumber(data.comments_count)}` : "",
          data.permalink ? `- **Link**: ${data.permalink}` : "",
          data.media_url ? `- **Media URL**: ${data.media_url}` : "",
        ].filter(Boolean);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
