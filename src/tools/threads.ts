import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, truncate, truncateField, formatNumber, formatDate, buildPaginationNote, ResponseFormatSchema } from "../services/utils.js";
import { THREADS_PROFILE_FIELDS, THREADS_MEDIA_FIELDS } from "../constants.js";
import { ThreadsProfile, ThreadsMedia, ThreadsReply, MetaPaginatedResponse } from "../types.js";

export function registerThreadsTools(server: McpServer, client: MetaApiClient): void {
  // ─── Get Threads Profile ──────────────────────────────────────────────────
  server.registerTool(
    "threads_get_profile",
    {
      title: "Get Threads Profile",
      description: `Gets the authenticated user's Threads profile.

Returns: User ID, username, name, bio, and profile picture URL.

Requires: THREADS_ACCESS_TOKEN env var.`,
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
        const profile = await client.threadsGet<ThreadsProfile>("/me", {
          fields: THREADS_PROFILE_FIELDS,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(profile, null, 2) }] };
        }

        const lines = [
          `# Threads Profile`,
          "",
          `- **Username**: @${profile.username ?? "unknown"}`,
          `- **Name**: ${profile.name ?? "N/A"}`,
          `- **ID**: \`${profile.id}\``,
          profile.threads_biography ? `- **Bio**: ${profile.threads_biography}` : "",
        ].filter(Boolean);

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Threads Posts ────────────────────────────────────────────────────
  server.registerTool(
    "threads_get_posts",
    {
      title: "Get Threads Posts",
      description: `Lists the authenticated user's Threads posts.

Args:
  - threads_user_id (string): Threads user ID (from threads_get_profile)
  - limit (number): Max results (1–100, default 20)
  - since (string, optional): Start date YYYY-MM-DD
  - until (string, optional): End date YYYY-MM-DD
  - after (string, optional): Pagination cursor`,
      inputSchema: z
        .object({
          threads_user_id: z.string().describe("Threads user ID"),
          limit: z.number().int().min(1).max(100).default(20),
          since: z.string().optional(),
          until: z.string().optional(),
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
    async ({ threads_user_id, limit, since, until, after, response_format }) => {
      try {
        const params: Record<string, unknown> = { fields: THREADS_MEDIA_FIELDS, limit };
        if (since) params.since = since;
        if (until) params.until = until;
        if (after) params.after = after;

        const data = await client.threadsGet<MetaPaginatedResponse<ThreadsMedia>>(
          `/${threads_user_id}/threads`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No threads posts found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Threads Posts (${data.data.length} shown)`, ""];
        for (const post of data.data) {
          lines.push(`## ${post.media_type ?? "TEXT"} \`${post.id}\``);
          if (post.text) lines.push(`> ${truncateField(post.text, 200)}`);
          if (post.timestamp) lines.push(`- **Posted**: ${formatDate(post.timestamp)}`);
          if (post.permalink) lines.push(`- **Link**: ${post.permalink}`);
          if (post.is_quote_post) lines.push(`- **Quote post**`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "threads") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Text Thread ──────────────────────────────────────────────────
  server.registerTool(
    "threads_publish_text",
    {
      title: "Publish Text Thread",
      description: `Publishes a text-only post to Threads.

Two-step flow: creates a container, then publishes it.

Args:
  - threads_user_id (string): Threads user ID
  - text (string): Post text (up to 500 characters)
  - reply_to_id (string, optional): Thread ID to reply to
  - quote_post_id (string, optional): Thread ID to quote

Returns: Media ID of the published thread.`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          text: z.string().min(1).max(500).describe("Post text"),
          reply_to_id: z.string().optional().describe("Thread ID to reply to"),
          quote_post_id: z.string().optional().describe("Thread ID to quote"),
          reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply to this post"),
          location_id: z.string().optional().describe("Location ID to tag (from Facebook Places search)"),
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
    async ({ threads_user_id, text, reply_to_id, quote_post_id, reply_control, location_id, response_format }) => {
      try {
        const fields: Record<string, unknown> = { media_type: "TEXT", text };
        if (reply_to_id) fields.reply_to_id = reply_to_id;
        if (quote_post_id) fields.quote_post_id = quote_post_id;
        if (reply_control) fields.reply_control = reply_control;
        if (location_id) fields.location_id = location_id;

        const container = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads`,
          fields
        );

        const result = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads_publish`,
          { creation_id: container.id }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{ type: "text", text: `Thread published.\n\n- **Media ID**: \`${result.id}\`` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Image Thread ─────────────────────────────────────────────────
  server.registerTool(
    "threads_publish_image",
    {
      title: "Publish Image Thread",
      description: `Publishes an image post to Threads.

Args:
  - threads_user_id (string): Threads user ID
  - image_url (string): Public URL of the image (JPEG or PNG)
  - text (string, optional): Caption text`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          image_url: z.string().url().describe("Public image URL"),
          text: z.string().optional().describe("Caption text"),
          reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply to this post"),
          location_id: z.string().optional().describe("Location ID to tag (from Facebook Places search)"),
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
    async ({ threads_user_id, image_url, text, reply_control, location_id, response_format }) => {
      try {
        const fields: Record<string, unknown> = { media_type: "IMAGE", image_url };
        if (text) fields.text = text;
        if (reply_control) fields.reply_control = reply_control;
        if (location_id) fields.location_id = location_id;

        const container = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads`,
          fields
        );

        const result = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads_publish`,
          { creation_id: container.id }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{ type: "text", text: `Image thread published.\n\n- **Media ID**: \`${result.id}\`` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Video Thread ─────────────────────────────────────────────────
  server.registerTool(
    "threads_publish_video",
    {
      title: "Publish Video Thread",
      description: `Publishes a video post to Threads.

Args:
  - threads_user_id (string): Threads user ID
  - video_url (string): Public URL of the video (MP4)
  - text (string, optional): Caption text

Note: Video processing may take time. Polls for up to 60 seconds.`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          video_url: z.string().url().describe("Public video URL"),
          text: z.string().optional(),
          reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply to this post"),
          location_id: z.string().optional().describe("Location ID to tag (from Facebook Places search)"),
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
    async ({ threads_user_id, video_url, text, reply_control, location_id, response_format }) => {
      try {
        const fields: Record<string, unknown> = { media_type: "VIDEO", video_url };
        if (text) fields.text = text;
        if (reply_control) fields.reply_control = reply_control;
        if (location_id) fields.location_id = location_id;

        const container = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads`,
          fields
        );

        // Poll for video processing
        const statusCode = await client.pollContainerStatus(container.id, "threads");

        if (statusCode !== "FINISHED") {
          return {
            content: [{
              type: "text",
              text: `Container created (\`${container.id}\`) but video status: ${statusCode}. Wait and retry — video processing can take up to 60 seconds.`,
            }],
          };
        }

        const result = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads_publish`,
          { creation_id: container.id }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{ type: "text", text: `Video thread published.\n\n- **Media ID**: \`${result.id}\`` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Carousel Thread ──────────────────────────────────────────────
  server.registerTool(
    "threads_publish_carousel",
    {
      title: "Publish Carousel Thread",
      description: `Publishes a carousel post (2–20 images/videos) to Threads.

Three-step flow:
1. Create individual item containers
2. Create carousel container referencing them
3. Publish

Args:
  - threads_user_id (string): Threads user ID
  - items (array): 2–20 items, each with url (string) and type ('IMAGE' or 'VIDEO')
  - text (string, optional): Caption text`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          items: z
            .array(
              z.object({
                url: z.string().url(),
                type: z.enum(["IMAGE", "VIDEO"]),
              })
            )
            .min(2)
            .max(20),
          text: z.string().optional(),
          reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply to this post"),
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
    async ({ threads_user_id, items, text, reply_control, response_format }) => {
      try {
        // Step 1: Create all item containers in parallel
        const results = await Promise.allSettled(
          items.map(async (item) => {
            const fields: Record<string, unknown> = {
              media_type: item.type,
              is_carousel_item: true,
              ...(item.type === "IMAGE" ? { image_url: item.url } : { video_url: item.url }),
            };
            return { ...(await client.threadsPost<{ id: string }>(`/${threads_user_id}/threads`, fields)), type: item.type as string };
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
            videoContainers.map((c) => client.pollContainerStatus(c.id, "threads"))
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
        if (text) carouselFields.text = text;
        if (reply_control) carouselFields.reply_control = reply_control;

        const carousel = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads`,
          carouselFields
        );

        // Step 3: Publish
        const result = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads_publish`,
          { creation_id: carousel.id }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Carousel thread published (${items.length} items).\n\n- **Media ID**: \`${result.id}\``,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Thread ────────────────────────────────────────────────────────
  server.registerTool(
    "threads_delete_post",
    {
      title: "Delete Thread",
      description: `Deletes a Threads post permanently.

Args:
  - media_id (string): Threads media ID to delete`,
      inputSchema: z
        .object({
          media_id: z.string().describe("Threads media ID"),
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
        const result = await client.threadsDelete<{ success: boolean }>(`/${media_id}`);
        return {
          content: [{
            type: "text",
            text: result.success
              ? `Thread \`${media_id}\` deleted.`
              : `Failed to delete thread \`${media_id}\`.`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Thread Replies ───────────────────────────────────────────────────
  server.registerTool(
    "threads_get_replies",
    {
      title: "Get Thread Replies",
      description: `Gets replies to a Threads post.

Args:
  - media_id (string): Threads media ID
  - reverse (boolean, optional): Reverse chronological order (default false)`,
      inputSchema: z
        .object({
          media_id: z.string(),
          reverse: z.boolean().default(false),
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
    async ({ media_id, reverse, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,text,username,timestamp,media_type,hide_status",
          reverse,
        };

        const data = await client.threadsGet<MetaPaginatedResponse<ThreadsReply>>(
          `/${media_id}/replies`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No replies on this thread." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Replies to \`${media_id}\` (${data.data.length})`, ""];
        for (const reply of data.data) {
          lines.push(`**@${reply.username ?? "unknown"}** (${formatDate(reply.timestamp)})`);
          if (reply.text) lines.push(`> ${reply.text}`);
          if (reply.hide_status === "HIDDEN") lines.push(`_[hidden]_`);
          lines.push(`_ID: \`${reply.id}\`_`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "replies") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Hide/Unhide Thread Reply ─────────────────────────────────────────────
  server.registerTool(
    "threads_hide_reply",
    {
      title: "Hide/Unhide Thread Reply",
      description: `Hides or unhides a reply on a Threads post.

Args:
  - reply_id (string): Reply media ID
  - hide (boolean): true to hide, false to unhide`,
      inputSchema: z
        .object({
          reply_id: z.string(),
          hide: z.boolean().describe("true to hide, false to unhide"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ reply_id, hide }) => {
      try {
        await client.threadsPost(`/${reply_id}/manage_reply`, { hide });
        return {
          content: [{
            type: "text",
            text: `Reply \`${reply_id}\` ${hide ? "hidden" : "unhidden"}.`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Thread Post Insights ─────────────────────────────────────────────
  server.registerTool(
    "threads_get_post_insights",
    {
      title: "Get Thread Post Insights",
      description: `Gets performance metrics for a specific Threads post.

Args:
  - media_id (string): Threads media ID
  - metrics (string[]): Metrics to retrieve. Options: views, likes, replies, reposts, quotes, shares, reach, saved

Returns: Metric values for the post.`,
      inputSchema: z
        .object({
          media_id: z.string(),
          metrics: z
            .array(z.string())
            .default(["views", "likes", "replies", "reposts", "quotes"])
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
        const data = await client.threadsGet<{ data: Array<{ name: string; values: Array<{ value: number }> }> }>(
          `/${media_id}/insights`,
          { metric: metrics.join(",") }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Thread Insights: \`${media_id}\``, ""];
        for (const item of data.data) {
          const val = item.values?.[0]?.value ?? "N/A";
          lines.push(`- **${item.name}**: ${formatNumber(val)}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Threads User Insights ────────────────────────────────────────────
  server.registerTool(
    "threads_get_user_insights",
    {
      title: "Get Threads User Insights",
      description: `Gets account-level metrics for the authenticated Threads user.

Args:
  - threads_user_id (string): Threads user ID
  - metrics (string[]): Options:
      Time-series: views, likes, replies, reposts, quotes, followers_count, reach
      Demographics: follower_demographics (breakdown by age, country, city, gender — requires 100+ followers)
  - since (string, optional): Start date YYYY-MM-DD (required for time-series metrics)
  - until (string, optional): End date YYYY-MM-DD
  - breakdown (string, optional): For follower_demographics: 'age', 'country', 'city', 'gender'`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          metrics: z
            .array(z.string())
            .default(["views", "likes", "replies", "reposts", "quotes", "followers_count", "reach"]),
          since: z.string().optional(),
          until: z.string().optional(),
          breakdown: z.enum(["age", "country", "city", "gender"]).optional().describe("For follower_demographics metric only"),
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
    async ({ threads_user_id, metrics, since, until, breakdown, response_format }) => {
      try {
        const params: Record<string, unknown> = { metric: metrics.join(",") };
        if (since) params.since = since;
        if (until) params.until = until;
        if (breakdown) params.breakdown = breakdown;

        const data = await client.threadsGet<{ data: Array<{ name: string; title?: string; total_value?: { value: number }; values?: Array<{ value: unknown }> }> }>(
          `/${threads_user_id}/threads_insights`,
          params
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Threads User Insights`, ""];
        for (const item of data.data) {
          const val = item.total_value?.value ?? item.values?.[0]?.value ?? "N/A";
          lines.push(`- **${item.title ?? item.name}**: ${typeof val === "number" ? formatNumber(val) : JSON.stringify(val)}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Check Threads Publishing Limit ───────────────────────────────────────
  server.registerTool(
    "threads_check_rate_limits",
    {
      title: "Check Threads Publishing Limits",
      description: `Checks the current publishing rate limit usage for Threads.

Args:
  - threads_user_id (string): Threads user ID

Returns: Current usage and limit quota (250 posts per 24 hours).`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
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
    async ({ threads_user_id, response_format }) => {
      try {
        const data = await client.threadsGet<{ data: Array<{ quota_usage: number; config: { quota_total: number; quota_duration: number }; reply_quota_usage: number; reply_config: { quota_total: number; quota_duration: number } }> }>(
          `/${threads_user_id}/threads_publishing_limit`,
          { fields: "quota_usage,config,reply_quota_usage,reply_config" }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const limit = data.data[0];
        if (!limit) {
          return { content: [{ type: "text", text: "No rate limit data available." }] };
        }

        const lines = [
          `# Threads Publishing Limits`,
          "",
          `- **Posts used**: ${limit.quota_usage} / ${limit.config?.quota_total ?? 250}`,
          `- **Replies used**: ${limit.reply_quota_usage ?? "N/A"} / ${limit.reply_config?.quota_total ?? 1000}`,
        ];
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Single Thread ─────────────────────────────────────────────────
  server.registerTool(
    "threads_get_post",
    {
      title: "Get Single Thread Post",
      description: `Gets details for a single Threads post by ID.

Args:
  - media_id (string): Threads media ID`,
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
        const post = await client.threadsGet<ThreadsMedia>(`/${media_id}`, {
          fields: THREADS_MEDIA_FIELDS,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(post, null, 2) }] };
        }

        const lines = [
          `# Thread \`${post.id}\``,
          "",
          post.username ? `- **Author**: @${post.username}` : "",
          post.text ? `- **Text**: ${post.text}` : "",
          post.media_type ? `- **Type**: ${post.media_type}` : "",
          post.timestamp ? `- **Posted**: ${formatDate(post.timestamp)}` : "",
          post.permalink ? `- **Link**: ${post.permalink}` : "",
          post.is_quote_post ? "- **Quote post**" : "",
        ].filter(Boolean);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Conversation Tree ─────────────────────────────────────────────
  server.registerTool(
    "threads_get_conversation",
    {
      title: "Get Threads Conversation",
      description: `Gets the full conversation tree (all replies at all levels) for a Threads post.

Args:
  - media_id (string): Root thread media ID
  - reverse (boolean, optional): Reverse chronological order`,
      inputSchema: z
        .object({
          media_id: z.string(),
          reverse: z.boolean().default(false),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ media_id, reverse, response_format }) => {
      try {
        const data = await client.threadsGet<MetaPaginatedResponse<ThreadsReply>>(
          `/${media_id}/conversation`,
          { fields: "id,text,username,timestamp,media_type,hide_status", reverse }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No conversation found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Conversation for \`${media_id}\` (${data.data.length} posts)`, ""];
        for (const reply of data.data) {
          lines.push(`**@${reply.username ?? "unknown"}** (${formatDate(reply.timestamp)})`);
          if (reply.text) lines.push(`> ${reply.text}`);
          if (reply.hide_status === "HIDDEN") lines.push(`_[hidden]_`);
          lines.push(`_\`${reply.id}\`_`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "conversation") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Threads Mentions ──────────────────────────────────────────────
  server.registerTool(
    "threads_get_mentions",
    {
      title: "Get Threads Mentions",
      description: `Gets posts where the authenticated user was @mentioned.

Args:
  - threads_user_id (string): Threads user ID`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ threads_user_id, response_format }) => {
      try {
        const data = await client.threadsGet<MetaPaginatedResponse<ThreadsMedia>>(
          `/${threads_user_id}/mentions`,
          { fields: THREADS_MEDIA_FIELDS }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No mentions found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Threads Mentions (${data.data.length})`, ""];
        for (const post of data.data) {
          lines.push(`**@${post.username ?? "unknown"}** (${formatDate(post.timestamp)})`);
          if (post.text) lines.push(`> ${truncateField(post.text, 200)}`);
          if (post.permalink) lines.push(`- ${post.permalink}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "mentions") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Media Children ────────────────────────────────────────────────
  server.registerTool(
    "threads_get_media_children",
    {
      title: "Get Threads Carousel Items",
      description: `Gets individual items in a Threads carousel post.

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
        const data = await client.threadsGet<{ data: ThreadsMedia[] }>(
          `/${media_id}/children`,
          { fields: THREADS_MEDIA_FIELDS }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No children found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Carousel Items (${data.data.length})`, ""];
        for (const child of data.data) {
          lines.push(`- \`${child.id}\` — ${child.media_type ?? "UNKNOWN"}${child.media_url ? ` | ${child.media_url}` : ""}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Repost Thread ─────────────────────────────────────────────────────
  server.registerTool(
    "threads_repost",
    {
      title: "Repost a Thread",
      description: `Reposts (shares) an existing thread to your profile.

Args:
  - threads_user_id (string): Your Threads user ID
  - media_id (string): Thread media ID to repost`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          media_id: z.string().describe("Thread ID to repost"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ threads_user_id, media_id, response_format }) => {
      try {
        const result = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/reposts`,
          { media_id }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Reposted.\n\n- **Repost ID**: \`${result.id}\`` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Threads Keyword Search ────────────────────────────────────────────
  server.registerTool(
    "threads_search",
    {
      title: "Search Threads by Keyword",
      description: `Searches Threads posts by keyword.

Args:
  - threads_user_id (string): Threads user ID (for auth context)
  - q (string): Search query
  - limit (number): Max results (default 20)

Note: Results are limited to the authenticated user's content and public threads.`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          q: z.string().min(1).describe("Search query"),
          limit: z.number().int().min(1).max(50).default(20),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ threads_user_id, q, limit, response_format }) => {
      try {
        const data = await client.threadsGet<MetaPaginatedResponse<ThreadsMedia>>(
          `/${threads_user_id}/threads_search`,
          { fields: THREADS_MEDIA_FIELDS, limit, q }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: `No threads found for "${q}".` }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Threads Search: "${q}" (${data.data.length})`, ""];
        for (const post of data.data) {
          lines.push(`## \`${post.id}\``);
          if (post.text) lines.push(`> ${truncateField(post.text, 200)}`);
          if (post.timestamp) lines.push(`- ${formatDate(post.timestamp)}`);
          if (post.permalink) lines.push(`- ${post.permalink}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "search results") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish GIF Thread ────────────────────────────────────────────────
  server.registerTool(
    "threads_publish_gif",
    {
      title: "Publish GIF Thread",
      description: `Publishes a GIF post to Threads using a GIPHY URL.

Two-step flow: creates a container, then publishes it.

Args:
  - threads_user_id (string): Threads user ID
  - gif_url (string): GIPHY URL of the GIF
  - text (string, optional): Caption text
  - reply_to_id (string, optional): Thread ID to reply to
  - reply_control (enum, optional): Who can reply — everyone, accounts_you_follow, or mentioned_only

Returns: Media ID of the published thread.`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          gif_url: z.string().url().describe("GIPHY URL of the GIF"),
          text: z.string().optional().describe("Caption text"),
          reply_to_id: z.string().optional().describe("Thread ID to reply to"),
          reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply to this post"),
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
    async ({ threads_user_id, gif_url, text, reply_to_id, reply_control, response_format }) => {
      try {
        const fields: Record<string, unknown> = { media_type: "IMAGE", image_url: gif_url };
        if (text) fields.text = text;
        if (reply_to_id) fields.reply_to_id = reply_to_id;
        if (reply_control) fields.reply_control = reply_control;

        const container = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads`,
          fields
        );

        const result = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads_publish`,
          { creation_id: container.id }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{ type: "text", text: `GIF thread published.\n\n- **Media ID**: \`${result.id}\`` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Link Thread ───────────────────────────────────────────────
  server.registerTool(
    "threads_publish_link",
    {
      title: "Publish Link Thread",
      description: `Publishes a thread post with a link attachment.

Args:
  - threads_user_id (string): Threads user ID
  - text (string): Post text containing the URL
  - link_attachment (string): URL to attach as a link preview`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          text: z.string().min(1),
          link_attachment: z.string().url().describe("URL for link preview"),
          reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply to this post"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ threads_user_id, text, link_attachment, reply_control, response_format }) => {
      try {
        const fields: Record<string, unknown> = { media_type: "TEXT", text, link_attachment };
        if (reply_control) fields.reply_control = reply_control;

        const container = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads`,
          fields
        );

        const result = await client.threadsPost<{ id: string }>(
          `/${threads_user_id}/threads_publish`,
          { creation_id: container.id }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Link thread published.\n\n- **Media ID**: \`${result.id}\`` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Threads Followers ──────────────────────────────────────────────
  server.registerTool(
    "threads_get_followers",
    {
      title: "Get Threads Followers",
      description: `Lists followers of the authenticated Threads user.

Args:
  - threads_user_id (string): Threads user ID
  - limit (number): Max results (1–100, default 25)
  - after (string, optional): Pagination cursor

Returns: User IDs, usernames, and profile picture URLs of followers.

Note: Requires threads_basic scope. Only returns users who have allowed their followers list to be visible.`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          limit: z.number().int().min(1).max(100).default(25),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ threads_user_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,username,threads_profile_picture_url",
          limit,
        };
        if (after) params.after = after;

        const data = await client.threadsGet<MetaPaginatedResponse<{
          id: string;
          username?: string;
          threads_profile_picture_url?: string;
        }>>(`/${threads_user_id}/followers`, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No followers found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Threads Followers (${data.data.length} shown)`, ""];
        for (const user of data.data) {
          lines.push(`- **@${user.username ?? "unknown"}** (\`${user.id}\`)`);
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Threads Following ──────────────────────────────────────────────
  server.registerTool(
    "threads_get_following",
    {
      title: "Get Threads Following",
      description: `Lists accounts that the authenticated Threads user is following.

Args:
  - threads_user_id (string): Threads user ID
  - limit (number): Max results (1–100, default 25)
  - after (string, optional): Pagination cursor

Returns: User IDs, usernames, and profile pictures of followed accounts.`,
      inputSchema: z
        .object({
          threads_user_id: z.string(),
          limit: z.number().int().min(1).max(100).default(25),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ threads_user_id, limit, after, response_format }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,username,threads_profile_picture_url",
          limit,
        };
        if (after) params.after = after;

        const data = await client.threadsGet<MetaPaginatedResponse<{
          id: string;
          username?: string;
          threads_profile_picture_url?: string;
        }>>(`/${threads_user_id}/following`, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No following found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Threads Following (${data.data.length} shown)`, ""];
        for (const user of data.data) {
          lines.push(`- **@${user.username ?? "unknown"}** (\`${user.id}\`)`);
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
