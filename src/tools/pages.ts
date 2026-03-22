import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, truncate, truncateField, formatNumber, formatDate, buildPaginationNote, ResponseFormatSchema } from "../services/utils.js";
import { PAGE_FIELDS, POST_FIELDS } from "../constants.js";
import { MetaPage, MetaPost, MetaPaginatedResponse } from "../types.js";

export function registerPageTools(server: McpServer, client: MetaApiClient): void {
  // ─── List Pages ───────────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_pages",
    {
      title: "List Facebook Pages",
      description: `Lists all Facebook Pages managed by the authenticated user.

IMPORTANT: Call this tool first before any page or Instagram operations — it caches the page access tokens needed for subsequent calls.

Returns:
- id: Page ID (needed for other tools)
- name: Page name
- category: Page category
- fan_count: Number of likes
- followers_count: Number of followers
- link: Page URL
- instagram_business_account.id: Linked Instagram account ID (if any)

Tip: The page tokens are cached automatically. You do not need to manage them manually.`,
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
        const data = await client.get<MetaPaginatedResponse<MetaPage>>("/me/accounts", {
          fields: PAGE_FIELDS,
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No pages found for this account." }] };
        }

        for (const page of data.data) {
          if (page.access_token) {
            client.cachePageToken(page.id, page.access_token);
          }
        }

        if (response_format === "json") {
          return {
            content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }],
          };
        }

        const lines = [
          `# Your Facebook Pages (${data.data.length})`,
          "",
          "_Page tokens cached — you can now call page and Instagram tools._",
          "",
        ];
        for (const page of data.data) {
          lines.push(`## ${page.name} (\`${page.id}\`)`);
          lines.push(`- **Category**: ${page.category ?? "N/A"}`);
          lines.push(`- **Followers**: ${formatNumber(page.followers_count)}`);
          lines.push(`- **Likes (fans)**: ${formatNumber(page.fan_count)}`);
          if (page.link) lines.push(`- **URL**: ${page.link}`);
          if (page.instagram_business_account)
            lines.push(`- **Instagram Account ID**: \`${page.instagram_business_account.id}\``);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "pages") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page ─────────────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page",
    {
      title: "Get Facebook Page Details",
      description: `Gets detailed information about a specific Facebook Page.

Args:
  - page_id (string): The Facebook Page ID

Returns page details including name, category, description, follower counts, and linked Instagram account.`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
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
    async ({ page_id, response_format }) => {
      try {
        const page = await client.get<MetaPage>(`/${page_id}`, {
          fields: PAGE_FIELDS,
        });

        if (page.access_token) {
          client.cachePageToken(page_id, page.access_token);
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(page, null, 2) }] };
        }

        const lines = [
          `# ${page.name}`,
          "",
          `- **ID**: \`${page.id}\``,
          `- **Category**: ${page.category ?? "N/A"}`,
          `- **Followers**: ${formatNumber(page.followers_count)}`,
          `- **Likes**: ${formatNumber(page.fan_count)}`,
          page.link ? `- **URL**: ${page.link}` : "",
          page.description ? `- **Description**: ${page.description}` : "",
          page.about ? `- **About**: ${page.about}` : "",
          page.instagram_business_account
            ? `- **Instagram Account**: \`${page.instagram_business_account.id}\``
            : "- **Instagram**: Not linked",
        ]
          .filter(Boolean)
          .join("\n");
        return { content: [{ type: "text", text: lines }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Post ──────────────────────────────────────────────────────────
  server.registerTool(
    "meta_create_post",
    {
      title: "Create Facebook Page Post",
      description: `Creates a new post on a Facebook Page.

Requires: meta_list_pages must be called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID to post to
  - message (string): Text content of the post
  - link (string, optional): URL to attach to the post (creates a link preview)
  - published (boolean, optional): If false, saves as draft. Default true.
  - scheduled_publish_time (number, optional): Unix timestamp for scheduling (must be 10 min to 30 days in future; published must be false)

Returns: Post ID of the created post.

Notes:
  - Maximum post length: ~63,206 characters
  - Scheduling requires the page to have Page Publishing Authorization`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          message: z.string().min(1).describe("Post text content"),
          link: z.string().url().optional().describe("Optional URL to share"),
          published: z
            .boolean()
            .default(true)
            .describe("Publish immediately (true) or save as draft (false)"),
          scheduled_publish_time: z
            .number()
            .int()
            .optional()
            .describe("Unix timestamp to schedule the post (requires published=false)"),
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
    async ({ page_id, message, link, published, scheduled_publish_time, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const fields: Record<string, unknown> = { message, published };
        if (link) fields.link = link;
        if (scheduled_publish_time) fields.scheduled_publish_time = scheduled_publish_time;

        const result = await client.post<{ id: string }>(
          `/${page_id}/feed`,
          fields,
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        const status = scheduled_publish_time ? "scheduled" : published ? "published" : "saved as draft";
        return {
          content: [
            {
              type: "text",
              text: `Post ${status} successfully.\n\n- **Post ID**: \`${result.id}\``,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Posts ────────────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_posts",
    {
      title: "Get Facebook Page Posts",
      description: `Lists posts from a Facebook Page feed.

Requires: meta_list_pages called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max posts to return (1–100, default 20)
  - after (string, optional): Cursor for next page of results

Returns: List of posts with message, permalink, created time, and post ID.`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          limit: z.number().int().min(1).max(100).default(20),
          after: z.string().optional().describe("Pagination cursor for next page"),
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
    async ({ page_id, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: POST_FIELDS,
          limit,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<MetaPost>>(
          `/${page_id}/feed`,
          pageToken,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No posts found on this page." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Page Posts (${data.data.length} shown)`, ""];
        for (const post of data.data) {
          lines.push(`## Post \`${post.id}\``);
          lines.push(`- **Created**: ${formatDate(post.created_time)}`);
          if (post.message) lines.push(`- **Message**: ${truncateField(post.message, 200)}`);
          if (post.story) lines.push(`- **Story**: ${post.story}`);
          if (post.permalink_url) lines.push(`- **Link**: ${post.permalink_url}`);
          lines.push("");
        }
        if (nextCursor) {
          lines.push(buildPaginationNote(data.data.length, nextCursor));
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "posts") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Post ──────────────────────────────────────────────────────────
  server.registerTool(
    "meta_delete_post",
    {
      title: "Delete Facebook Page Post",
      description: `Deletes a post from a Facebook Page. This action is permanent and cannot be undone.

Args:
  - post_id (string): The post ID to delete (format: {page_id}_{post_id})
  - page_id (string): The Page ID (for authentication)`,
      inputSchema: z
        .object({
          post_id: z
            .string()
            .describe("Post ID to delete (get from meta_get_posts)"),
          page_id: z.string().describe("Page ID (for token — call meta_list_pages first)"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ post_id, page_id }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.delete<{ success: boolean }>(`/${post_id}`, pageToken);
        return {
          content: [
            {
              type: "text",
              text: result.success
                ? `Post \`${post_id}\` deleted successfully.`
                : `Failed to delete post \`${post_id}\`.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Photo Post ──────────────────────────────────────────────────
  server.registerTool(
    "meta_create_photo_post",
    {
      title: "Create Facebook Photo Post",
      description: `Publishes a photo post to a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - url (string): Public URL of the image
  - caption (string, optional): Photo caption/message
  - published (boolean): Default true`,
      inputSchema: z
        .object({
          page_id: z.string(),
          url: z.string().url().describe("Public image URL"),
          caption: z.string().optional(),
          published: z.boolean().default(true),
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
    async ({ page_id, url, caption, published, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const fields: Record<string, unknown> = { url, published };
        if (caption) fields.message = caption;

        const result = await client.post<{ id: string; post_id?: string }>(
          `/${page_id}/photos`,
          fields,
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Photo posted.\n\n- **Photo ID**: \`${result.id}\`${result.post_id ? `\n- **Post ID**: \`${result.post_id}\`` : ""}`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Video Post ─────────────────────────────────────────────────
  server.registerTool(
    "meta_create_video_post",
    {
      title: "Create Facebook Video Post",
      description: `Publishes a video post to a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - file_url (string): Public URL of the video file
  - title (string, optional): Video title
  - description (string, optional): Video description`,
      inputSchema: z
        .object({
          page_id: z.string(),
          file_url: z.string().url().describe("Public video URL"),
          title: z.string().optional(),
          description: z.string().optional(),
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
    async ({ page_id, file_url, title, description, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const fields: Record<string, unknown> = { file_url };
        if (title) fields.title = title;
        if (description) fields.description = description;

        const result = await client.post<{ id: string }>(
          `/${page_id}/videos`,
          fields,
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{ type: "text", text: `Video posted.\n\n- **Video ID**: \`${result.id}\`` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Conversations ────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_conversations",
    {
      title: "Get Page Conversations",
      description: `Lists conversations (messages) in a Facebook Page inbox.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max conversations (1–100, default 20)
  - after (string, optional): Pagination cursor

Requires pages_messaging permission.`,
      inputSchema: z
        .object({
          page_id: z.string(),
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
    async ({ page_id, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: "id,snippet,updated_time,message_count,participants",
          limit,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string;
          snippet: string;
          updated_time: string;
          message_count: number;
          participants: { data: Array<{ name: string; id: string }> };
        }>>(`/${page_id}/conversations`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No conversations found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Page Conversations (${data.data.length})`, ""];
        for (const convo of data.data) {
          const names = convo.participants?.data?.map((p) => p.name).join(", ") ?? "Unknown";
          lines.push(`## \`${convo.id}\``);
          lines.push(`- **With**: ${names}`);
          lines.push(`- **Last message**: ${convo.snippet ?? "N/A"}`);
          lines.push(`- **Messages**: ${convo.message_count}`);
          lines.push(`- **Updated**: ${formatDate(convo.updated_time)}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "conversations") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Conversation Messages ─────────────────────────────────────────
  server.registerTool(
    "meta_get_conversation_messages",
    {
      title: "Get Conversation Messages",
      description: `Gets messages from a specific Page conversation.

Args:
  - page_id (string): Facebook Page ID (for auth)
  - conversation_id (string): Conversation ID (from meta_get_page_conversations)
  - limit (number): Max messages (1–100, default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
          conversation_id: z.string(),
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
    async ({ page_id, conversation_id, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: "id,message,from,created_time,attachments",
          limit,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string;
          message: string;
          from: { name: string; id: string };
          created_time: string;
        }>>(`/${conversation_id}/messages`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No messages found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Messages (${data.data.length})`, ""];
        for (const msg of data.data) {
          lines.push(`**${msg.from?.name ?? "Unknown"}** (${formatDate(msg.created_time)})`);
          lines.push(`> ${msg.message ?? "[no text]"}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "messages") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Send Page Message ─────────────────────────────────────────────────
  server.registerTool(
    "meta_send_page_message",
    {
      title: "Send Page Message",
      description: `Sends a message from a Facebook Page to a user (in an existing conversation).

Args:
  - page_id (string): Facebook Page ID
  - recipient_id (string): PSID (page-scoped user ID) of the recipient
  - message (string): Message text

Requires pages_messaging permission. Only works within the 24-hour messaging window.`,
      inputSchema: z
        .object({
          page_id: z.string(),
          recipient_id: z.string().describe("Page-scoped user ID"),
          message: z.string().min(1),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ page_id, recipient_id, message }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.post<{ recipient_id: string; message_id: string }>(
          `/${page_id}/messages`,
          {
            recipient: { id: recipient_id },
            message: { text: message },
            messaging_type: "RESPONSE",
          },
          pageToken
        );

        return {
          content: [{ type: "text", text: `Message sent.\n\n- **Message ID**: \`${result.message_id}\`` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Insights ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_insights",
    {
      title: "Get Facebook Page Insights",
      description: `Gets analytics/insights for a Facebook Page.

Requires: meta_list_pages called first.

Args:
  - page_id (string): Facebook Page ID
  - metrics (string[]): Metrics to retrieve. Full options:
      Impressions: page_impressions, page_impressions_unique, page_impressions_organic, page_impressions_organic_unique, page_impressions_paid, page_impressions_paid_unique, page_impressions_viral, page_impressions_viral_unique, page_impressions_nonviral, page_impressions_nonviral_unique
      Post Impressions: page_posts_impressions, page_posts_impressions_unique, page_posts_impressions_organic, page_posts_impressions_organic_unique, page_posts_impressions_paid, page_posts_impressions_paid_unique, page_posts_impressions_viral, page_posts_impressions_viral_unique
      Engagement: page_engaged_users, page_post_engagements, page_total_actions, page_negative_feedback
      Reactions: page_actions_post_reactions_total, page_actions_post_reactions_like_total, page_actions_post_reactions_love_total, page_actions_post_reactions_wow_total, page_actions_post_reactions_haha_total, page_actions_post_reactions_sorry_total, page_actions_post_reactions_anger_total
      Fans: page_fans, page_fan_adds, page_fan_adds_unique, page_fan_adds_by_paid_non_paid_unique, page_fan_removes, page_fan_removes_unique, page_daily_follows, page_daily_follows_unique, page_daily_unfollows_unique
      Views: page_views_total, page_tab_views_login_top, page_tab_views_login_top_unique, page_tab_views_logout_top
      Video: page_video_views, page_video_views_unique, page_video_views_paid, page_video_views_organic, page_video_views_autoplayed, page_video_views_click_to_play, page_video_complete_views_30s, page_video_complete_views_30s_unique, page_video_complete_views_30s_paid, page_video_complete_views_30s_organic, page_video_repeat_views, page_video_view_time, page_video_views_10s, page_video_views_10s_unique, page_video_views_10s_paid, page_video_views_10s_organic
      Content: page_media_view, page_lifetime_engaged_followers_unique
  - period (string): Aggregation period: 'day', 'week', 'days_28', 'month'
  - since (string, optional): Start date YYYY-MM-DD
  - until (string, optional): End date YYYY-MM-DD

Returns: Time-series data for each metric.`,
      inputSchema: z
        .object({
          page_id: z.string(),
          metrics: z
            .array(z.string())
            .default([
              "page_impressions",
              "page_impressions_unique",
              "page_engaged_users",
              "page_post_engagements",
              "page_fan_adds_unique",
              "page_fan_removes_unique",
              "page_views_total",
              "page_actions_post_reactions_total",
              "page_video_views",
            ])
            .describe("Metric names — see description for full list of 70+ available metrics"),
          period: z
            .enum(["day", "week", "days_28", "month"])
            .default("day")
            .describe("Aggregation period"),
          since: z.string().optional().describe("Start date YYYY-MM-DD"),
          until: z.string().optional().describe("End date YYYY-MM-DD"),
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
    async ({ page_id, metrics, period, since, until, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          metric: metrics.join(","),
          period,
        };
        if (since) params.since = since;
        if (until) params.until = until;

        const data = await client.getWithToken<{ data: unknown[] }>(
          `/${page_id}/insights`,
          pageToken,
          params
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Page Insights: \`${page_id}\``, `**Period**: ${period}`, ""];
        for (const item of data.data as Array<{
          name: string;
          title: string;
          period: string;
          values: Array<{ value: number; end_time: string }>;
        }>) {
          lines.push(`## ${item.title} (\`${item.name}\`)`);
          if (item.values?.length) {
            for (const v of item.values.slice(-7)) {
              lines.push(`- ${formatDate(v.end_time)}: **${formatNumber(v.value)}**`);
            }
          } else {
            lines.push("_No data available_");
          }
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "metrics") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Post Insights ───────────────────────────────────────────────────
  server.registerTool(
    "meta_get_post_insights",
    {
      title: "Get Facebook Post Insights",
      description: `Gets performance metrics for a specific Facebook Page post.

Requires: meta_list_pages called first.

Args:
  - post_id (string): Post ID (e.g., "page_id_post_id")
  - page_id (string): Page ID (for authentication)
  - metrics (string[]): Metrics to retrieve. Options:
      Performance: post_impressions, post_impressions_unique, post_impressions_paid, post_impressions_paid_unique, post_impressions_fan, post_impressions_fan_unique, post_impressions_organic, post_impressions_organic_unique, post_impressions_viral, post_impressions_viral_unique
      Engagement: post_clicks, post_clicks_by_type, post_engaged_users, post_negative_feedback, post_negative_feedback_by_type, post_engaged_fan
      Reactions: post_reactions_by_type_total, post_reactions_like_total, post_reactions_love_total, post_reactions_wow_total, post_reactions_haha_total, post_reactions_sorry_total, post_reactions_anger_total
      Media: post_media_view, post_total_media_view_unique
      Video: post_video_avg_time_watched, post_video_complete_views_organic, post_video_complete_views_paid, post_video_views_organic, post_video_views_paid, post_video_view_time
      Activity: post_activity_by_action_type, post_activity_by_action_type_unique

All post metrics use 'lifetime' period (cumulative from post creation).`,
      inputSchema: z
        .object({
          post_id: z.string().describe("Post ID"),
          page_id: z.string().describe("Page ID (for auth)"),
          metrics: z
            .array(z.string())
            .default([
              "post_impressions",
              "post_impressions_unique",
              "post_impressions_paid",
              "post_impressions_organic",
              "post_engaged_users",
              "post_clicks",
              "post_reactions_by_type_total",
              "post_negative_feedback",
            ])
            .describe("Metric names — see description for full list"),
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
    async ({ post_id, page_id, metrics, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const data = await client.getWithToken<{ data: unknown[] }>(
          `/${post_id}/insights`,
          pageToken,
          { metric: metrics.join(",") }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Post Insights: \`${post_id}\``, ""];
        for (const item of data.data as Array<{
          name: string;
          title: string;
          period: string;
          values: Array<{ value: number | Record<string, number> }>;
        }>) {
          const val = item.values?.[0]?.value;
          if (typeof val === "object" && val !== null) {
            lines.push(`## ${item.title ?? item.name}`);
            for (const [k, v] of Object.entries(val)) {
              lines.push(`- ${k}: **${formatNumber(v)}**`);
            }
          } else {
            lines.push(`- **${item.title ?? item.name}**: ${formatNumber(val as number)}`);
          }
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Update Page Settings ──────────────────────────────────────────────
  server.registerTool(
    "meta_update_page",
    {
      title: "Update Facebook Page Settings",
      description: `Updates a Facebook Page's profile information.

Args:
  - page_id (string): Facebook Page ID
  - about (string, optional): Short description (max 255 chars)
  - description (string, optional): Long description
  - website (string, optional): Website URL
  - phone (string, optional): Phone number
  - emails (string[], optional): Contact emails
  - hours (object, optional): Business hours as key-value pairs (e.g., {"mon_1_open":"09:00","mon_1_close":"17:00"})
  - category (string, optional): Page category (e.g., "Restaurant")
  - username (string, optional): Page username/vanity URL
  - contact_address (object, optional): Mailing address with street, city, state, zip, country

Requires pages_manage_metadata permission.`,
      inputSchema: z
        .object({
          page_id: z.string(),
          about: z.string().max(255).optional(),
          description: z.string().optional(),
          website: z.string().url().optional(),
          phone: z.string().optional(),
          emails: z.array(z.string().email()).optional(),
          hours: z.record(z.string()).optional().describe("Business hours key-value pairs"),
          category: z.string().optional().describe("Page category"),
          username: z.string().optional().describe("Page vanity URL/username"),
          contact_address: z.object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zip: z.string().optional(),
            country: z.string().optional(),
          }).optional().describe("Mailing/contact address"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ page_id, about, description, website, phone, emails, hours, category, username, contact_address }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const fields: Record<string, unknown> = {};
        if (about !== undefined) fields.about = about;
        if (description !== undefined) fields.description = description;
        if (website !== undefined) fields.website = website;
        if (phone !== undefined) fields.phone = phone;
        if (emails !== undefined) fields.emails = emails;
        if (hours !== undefined) fields.hours = hours;
        if (category !== undefined) fields.category = category;
        if (username !== undefined) fields.username = username;
        if (contact_address !== undefined) fields.contact_address = contact_address;

        if (Object.keys(fields).length === 0) {
          return { content: [{ type: "text", text: "Error: Provide at least one field to update." }], isError: true };
        }

        await client.post(`/${page_id}`, fields, pageToken);
        return {
          content: [{ type: "text", text: `Page \`${page_id}\` updated successfully.\n\nFields updated: ${Object.keys(fields).join(", ")}` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Post Comments ─────────────────────────────────────────────────
  server.registerTool(
    "meta_get_post_comments",
    {
      title: "Get Post Comments",
      description: `Gets comments on a Facebook Page post.

Args:
  - post_id (string): Post ID (format: {page_id}_{post_id})
  - page_id (string): Page ID (for authentication — call meta_list_pages first)
  - limit (number): Max comments (1–100, default 25)
  - order (string): 'chronological' or 'reverse_chronological'
  - after (string, optional): Pagination cursor
  - filter (string): 'toplevel' (default), 'stream' (all including replies)`,
      inputSchema: z
        .object({
          post_id: z.string(),
          page_id: z.string().describe("Page ID (call meta_list_pages first)"),
          limit: z.number().int().min(1).max(100).default(25),
          order: z.enum(["chronological", "reverse_chronological"]).default("reverse_chronological"),
          filter: z.enum(["toplevel", "stream"]).default("toplevel"),
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
    async ({ post_id, page_id, limit, order, filter, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: "id,message,from,created_time,like_count,comment_count,parent",
          limit,
          order,
          filter,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string;
          message: string;
          from: { name: string; id: string };
          created_time: string;
          like_count?: number;
          comment_count?: number;
          parent?: { id: string };
        }>>(`/${post_id}/comments`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No comments on this post." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Comments on \`${post_id}\` (${data.data.length})`, ""];
        for (const c of data.data) {
          const indent = c.parent ? "  " : "";
          lines.push(`${indent}**${c.from?.name ?? "Unknown"}** (${formatDate(c.created_time)})`);
          lines.push(`${indent}> ${c.message}`);
          lines.push(`${indent}_ID: \`${c.id}\` | Likes: ${c.like_count ?? 0} | Replies: ${c.comment_count ?? 0}_`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "comments") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Reply to Post Comment ─────────────────────────────────────────────
  server.registerTool(
    "meta_reply_post_comment",
    {
      title: "Reply to Post Comment",
      description: `Replies to a comment on a Facebook Page post.

Args:
  - comment_id (string): Comment ID to reply to
  - page_id (string): Page ID (for token lookup)
  - message (string): Reply text`,
      inputSchema: z
        .object({
          comment_id: z.string(),
          page_id: z.string(),
          message: z.string().min(1),
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
    async ({ comment_id, page_id, message, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.post<{ id: string }>(
          `/${comment_id}/comments`,
          { message },
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{ type: "text", text: `Reply posted.\n\n- **Comment ID**: \`${result.id}\`` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Comment ────────────────────────────────────────────────────
  server.registerTool(
    "meta_delete_comment",
    {
      title: "Delete Facebook Comment",
      description: `Deletes a comment on a Facebook Page post. Permanent action.

Args:
  - comment_id (string): Comment ID to delete
  - page_id (string): Page ID (for authentication)`,
      inputSchema: z
        .object({
          comment_id: z.string(),
          page_id: z.string().describe("Page ID (call meta_list_pages first)"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ comment_id, page_id }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.delete<{ success: boolean }>(`/${comment_id}`, pageToken);
        return {
          content: [{
            type: "text",
            text: result.success ? `Comment \`${comment_id}\` deleted.` : `Failed to delete comment \`${comment_id}\`.`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Like/Unlike Post or Comment ───────────────────────────────────────
  server.registerTool(
    "meta_like_object",
    {
      title: "Like/Unlike Post or Comment",
      description: `Likes or removes a like from a page post or comment, acting as the Page.

Args:
  - object_id (string): Post ID or Comment ID
  - page_id (string): Page ID (for token)
  - unlike (boolean): If true, removes the like instead`,
      inputSchema: z
        .object({
          object_id: z.string().describe("Post ID or Comment ID"),
          page_id: z.string(),
          unlike: z.boolean().default(false),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ object_id, page_id, unlike }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        if (unlike) {
          await client.delete(`/${object_id}/likes`, pageToken);
        } else {
          await client.post(`/${object_id}/likes`, {}, pageToken);
        }
        return {
          content: [{ type: "text", text: unlike ? `Unliked \`${object_id}\`.` : `Liked \`${object_id}\`.` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Scheduled Posts ───────────────────────────────────────────────
  server.registerTool(
    "meta_get_scheduled_posts",
    {
      title: "Get Scheduled Posts",
      description: `Lists scheduled (unpublished) posts for a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (1–100, default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
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
    async ({ page_id, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: POST_FIELDS + ",scheduled_publish_time,is_published",
          limit,
          is_published: false,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<MetaPost & {
          scheduled_publish_time?: string;
          is_published?: boolean;
        }>>(`/${page_id}/scheduled_posts`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No scheduled posts found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Scheduled Posts (${data.data.length})`, ""];
        for (const post of data.data) {
          lines.push(`## \`${post.id}\``);
          if (post.message) lines.push(`- **Message**: ${truncateField(post.message, 200)}`);
          if (post.scheduled_publish_time) lines.push(`- **Scheduled for**: ${formatDate(post.scheduled_publish_time)}`);
          lines.push(`- **Created**: ${formatDate(post.created_time)}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "scheduled posts") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Albums ───────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_albums",
    {
      title: "Get Page Photo Albums",
      description: `Lists photo albums on a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (1–100, default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
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
    async ({ page_id, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: "id,name,description,count,type,created_time,link",
          limit,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string;
          name: string;
          description?: string;
          count?: number;
          type?: string;
          created_time?: string;
          link?: string;
        }>>(`/${page_id}/albums`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No albums found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Page Albums (${data.data.length})`, ""];
        for (const album of data.data) {
          lines.push(`## ${album.name} (\`${album.id}\`)`);
          if (album.count !== undefined) lines.push(`- **Photos**: ${album.count}`);
          if (album.type) lines.push(`- **Type**: ${album.type}`);
          if (album.description) lines.push(`- **Description**: ${album.description}`);
          if (album.created_time) lines.push(`- **Created**: ${formatDate(album.created_time)}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "albums") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Events ───────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_events",
    {
      title: "Get Page Events",
      description: `Lists events created by a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (1–100, default 20)
  - time_filter (string): 'upcoming' or 'past'`,
      inputSchema: z
        .object({
          page_id: z.string(),
          limit: z.number().int().min(1).max(100).default(20),
          time_filter: z.enum(["upcoming", "past"]).default("upcoming"),
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
    async ({ page_id, limit, time_filter, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string;
          name: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          place?: { name: string };
          attending_count?: number;
          interested_count?: number;
        }>>(`/${page_id}/events`, pageToken, {
          fields: "id,name,description,start_time,end_time,place,attending_count,interested_count",
          limit,
          time_filter,
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: `No ${time_filter} events found.` }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Page Events — ${time_filter} (${data.data.length})`, ""];
        for (const evt of data.data) {
          lines.push(`## ${evt.name} (\`${evt.id}\`)`);
          if (evt.start_time) lines.push(`- **Starts**: ${formatDate(evt.start_time)}`);
          if (evt.end_time) lines.push(`- **Ends**: ${formatDate(evt.end_time)}`);
          if (evt.place?.name) lines.push(`- **Location**: ${evt.place.name}`);
          if (evt.attending_count !== undefined) lines.push(`- **Attending**: ${formatNumber(evt.attending_count)} | **Interested**: ${formatNumber(evt.interested_count)}`);
          if (evt.description) lines.push(`- **Description**: ${truncateField(evt.description, 200)}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "events") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Tagged Posts ─────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_tagged",
    {
      title: "Get Page Tagged Posts",
      description: `Gets posts that tag this Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (1–100, default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
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
    async ({ page_id, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = { fields: POST_FIELDS, limit };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<MetaPost>>(
          `/${page_id}/tagged`,
          pageToken,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No tagged posts found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Tagged Posts (${data.data.length})`, ""];
        for (const post of data.data) {
          lines.push(`## \`${post.id}\``);
          lines.push(`- **From**: ${post.from?.name ?? "Unknown"}`);
          lines.push(`- **Created**: ${formatDate(post.created_time)}`);
          if (post.message) lines.push(`- **Message**: ${truncateField(post.message, 200)}`);
          if (post.permalink_url) lines.push(`- **Link**: ${post.permalink_url}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "tagged posts") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Fans / Followers ─────────────────────────────────────────
  server.registerTool(
    "meta_get_page_fan_demographics",
    {
      title: "Get Page Fan Demographics",
      description: `Gets fan/follower demographic breakdowns for a Facebook Page via insights.

Args:
  - page_id (string): Facebook Page ID
  - metric (string): Demographic metric — 'page_fans_city', 'page_fans_country', 'page_fans_gender_age', 'page_fans_locale'`,
      inputSchema: z
        .object({
          page_id: z.string(),
          metric: z
            .enum(["page_fans_city", "page_fans_country", "page_fans_gender_age", "page_fans_locale"])
            .default("page_fans_gender_age"),
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
    async ({ page_id, metric, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const data = await client.getWithToken<{ data: Array<{
          name: string;
          values: Array<{ value: Record<string, number> }>;
        }> }>(`/${page_id}/insights`, pageToken, {
          metric,
          period: "lifetime",
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const item = data.data?.[0];
        if (!item?.values?.length) {
          return { content: [{ type: "text", text: "No demographic data available." }] };
        }

        const breakdown = item.values[item.values.length - 1].value;
        const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
        const lines = [`# ${metric.replace(/_/g, " ").replace(/\bpage\b/i, "Page")}`, ""];
        for (const [key, val] of sorted.slice(0, 30)) {
          lines.push(`- **${key}**: ${formatNumber(val)}`);
        }
        if (sorted.length > 30) lines.push(`\n_...and ${sorted.length - 30} more_`);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Post Reactions ────────────────────────────────────────────────
  server.registerTool(
    "meta_get_post_reactions",
    {
      title: "Get Post Reactions",
      description: `Gets reaction counts (like, love, haha, wow, sad, angry) on a post.

Args:
  - post_id (string): Post ID`,
      inputSchema: z
        .object({
          post_id: z.string(),
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
    async ({ post_id, response_format }) => {
      try {
        const reactionTypes = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"];
        const results = await Promise.all(
          reactionTypes.map((type) =>
            client.get<{ summary: { total_count: number } }>(
              `/${post_id}/reactions`,
              { type, summary: "total_count", limit: 0 }
            )
          )
        );
        const counts: Record<string, number> = {};
        reactionTypes.forEach((type, i) => {
          counts[type] = results[i].summary?.total_count ?? 0;
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(counts, null, 2) }] };
        }

        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const lines = [`# Reactions on \`${post_id}\` (${formatNumber(total)} total)`, ""];
        const emojis: Record<string, string> = { LIKE: "👍", LOVE: "❤️", HAHA: "😂", WOW: "😮", SAD: "😢", ANGRY: "😡" };
        for (const [type, count] of Object.entries(counts)) {
          if (count > 0) lines.push(`- ${emojis[type] ?? ""} **${type}**: ${formatNumber(count)}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Share Post ────────────────────────────────────────────────────────
  server.registerTool(
    "meta_update_post",
    {
      title: "Update Facebook Post",
      description: `Updates an existing Facebook Page post's message text.

Args:
  - post_id (string): Post ID
  - page_id (string): Page ID (for token)
  - message (string): New message text`,
      inputSchema: z
        .object({
          post_id: z.string(),
          page_id: z.string(),
          message: z.string().min(1),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ post_id, page_id, message, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.post<{ success: boolean }>(
          `/${post_id}`,
          { message },
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{ type: "text", text: `Post \`${post_id}\` updated.` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Videos ───────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_videos",
    {
      title: "Get Page Videos",
      description: `Lists videos uploaded to a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (1–100, default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
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
    async ({ page_id, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: "id,title,description,length,views,created_time,permalink_url,source",
          limit,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string;
          title?: string;
          description?: string;
          length?: number;
          views?: number;
          created_time?: string;
          permalink_url?: string;
        }>>(`/${page_id}/videos`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No videos found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Page Videos (${data.data.length})`, ""];
        for (const video of data.data) {
          lines.push(`## ${video.title ?? "Untitled"} (\`${video.id}\`)`);
          if (video.length) lines.push(`- **Duration**: ${Math.round(video.length)}s`);
          if (video.views !== undefined) lines.push(`- **Views**: ${formatNumber(video.views)}`);
          if (video.created_time) lines.push(`- **Created**: ${formatDate(video.created_time)}`);
          if (video.permalink_url) lines.push(`- **Link**: ${video.permalink_url}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "videos") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Visitor Posts ─────────────────────────────────────────────────
  server.registerTool(
    "meta_get_visitor_posts",
    {
      title: "Get Visitor Posts",
      description: `Gets posts published by visitors on the Facebook Page wall.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (1–100, default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
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
        const params: Record<string, unknown> = { fields: POST_FIELDS, limit };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<MetaPost>>(
          `/${page_id}/visitor_posts`,
          pageToken,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No visitor posts found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Visitor Posts (${data.data.length})`, ""];
        for (const post of data.data) {
          lines.push(`## \`${post.id}\``);
          lines.push(`- **From**: ${post.from?.name ?? "Unknown"}`);
          lines.push(`- **Created**: ${formatDate(post.created_time)}`);
          if (post.message) lines.push(`- **Message**: ${truncateField(post.message, 200)}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "visitor posts") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Published Posts ───────────────────────────────────────────────
  server.registerTool(
    "meta_get_published_posts",
    {
      title: "Get Published Posts",
      description: `Gets posts published by the Page itself (excludes visitor posts, unlike the feed edge).

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (1–100, default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
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
        const params: Record<string, unknown> = { fields: POST_FIELDS, limit };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<MetaPost>>(
          `/${page_id}/published_posts`,
          pageToken,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No published posts found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Published Posts (${data.data.length})`, ""];
        for (const post of data.data) {
          lines.push(`## \`${post.id}\``);
          lines.push(`- **Created**: ${formatDate(post.created_time)}`);
          if (post.message) lines.push(`- **Message**: ${truncateField(post.message, 200)}`);
          if (post.permalink_url) lines.push(`- **Link**: ${post.permalink_url}`);
          lines.push("");
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "published posts") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Blocked Users ────────────────────────────────────────────────
  server.registerTool(
    "meta_get_blocked_users",
    {
      title: "Get Blocked Users",
      description: `Lists users blocked by the Facebook Page.

Args:
  - page_id (string): Facebook Page ID`,
      inputSchema: z
        .object({
          page_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ page_id, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const data = await client.getWithToken<MetaPaginatedResponse<{ id: string; name: string }>>(
          `/${page_id}/blocked`,
          pageToken,
          {}
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No blocked users." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Blocked Users (${data.data.length})`, ""];
        for (const user of data.data) {
          lines.push(`- **${user.name}** (\`${user.id}\`)`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Block/Unblock User ────────────────────────────────────────────────
  server.registerTool(
    "meta_block_user",
    {
      title: "Block/Unblock User from Page",
      description: `Blocks or unblocks a user from a Facebook Page. Blocked users cannot post or comment.

Args:
  - page_id (string): Facebook Page ID
  - user_id (string): User ID to block/unblock
  - unblock (boolean): If true, unblocks the user instead`,
      inputSchema: z
        .object({
          page_id: z.string(),
          user_id: z.string(),
          unblock: z.boolean().default(false),
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ page_id, user_id, unblock }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        if (unblock) {
          // Meta unblock: DELETE /{page-id}/blocked?uid={user-id}
          await client.delete(`/${page_id}/blocked`, pageToken, { uid: user_id });
          return { content: [{ type: "text", text: `User \`${user_id}\` unblocked from page.` }] };
        } else {
          await client.post(`/${page_id}/blocked`, { uid: user_id }, pageToken);
          return { content: [{ type: "text", text: `User \`${user_id}\` blocked from page.` }] };
        }
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Tabs ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_tabs",
    {
      title: "Get Page Tabs",
      description: `Lists custom tabs on a Facebook Page.

Args:
  - page_id (string): Facebook Page ID`,
      inputSchema: z
        .object({
          page_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ page_id, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const data = await client.getWithToken<{ data: Array<{
          id: string;
          name: string;
          link?: string;
          position?: number;
          is_permanent?: boolean;
          application?: { id: string; name: string };
        }> }>(`/${page_id}/tabs`, pageToken, {});

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No tabs found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Page Tabs (${data.data.length})`, ""];
        for (const tab of data.data) {
          lines.push(`- **${tab.name}** (\`${tab.id}\`)${tab.position !== undefined ? ` — Position: ${tab.position}` : ""}${tab.is_permanent ? " [permanent]" : ""}${tab.application ? ` | App: ${tab.application.name}` : ""}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Picture ──────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_picture",
    {
      title: "Get Page Profile Picture",
      description: `Gets the profile picture URL for a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - size (string): Picture size — small, normal, large, square (default: large)`,
      inputSchema: z
        .object({
          page_id: z.string(),
          size: z.enum(["small", "normal", "large", "square"]).default("large"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ page_id, size, response_format }) => {
      try {
        const data = await client.get<{ data: { url: string; width?: number; height?: number; is_silhouette?: boolean } }>(
          `/${page_id}/picture`,
          { type: size, redirect: "false" }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `**Page Picture** (${size})\n\n- **URL**: ${data.data.url}${data.data.width ? `\n- **Size**: ${data.data.width}x${data.data.height}` : ""}${data.data.is_silhouette ? "\n- _Default/silhouette image_" : ""}`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Single Post ───────────────────────────────────────────────────
  server.registerTool(
    "meta_get_post",
    {
      title: "Get Single Post Details",
      description: `Gets detailed information about a specific Facebook post.

Args:
  - post_id (string): Post ID (format: {page_id}_{post_id})`,
      inputSchema: z
        .object({
          post_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ post_id, response_format }) => {
      try {
        const data = await client.get<MetaPost & {
          shares?: { count: number };
          likes?: { summary: { total_count: number } };
          comments?: { summary: { total_count: number } };
        }>(`/${post_id}`, {
          fields: POST_FIELDS + ",shares,likes.summary(true),comments.summary(true)",
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [
          `# Post \`${data.id}\``,
          "",
          `- **Created**: ${formatDate(data.created_time)}`,
          data.from ? `- **From**: ${data.from.name}` : "",
          data.message ? `- **Message**: ${data.message}` : "",
          data.story ? `- **Story**: ${data.story}` : "",
          data.permalink_url ? `- **Link**: ${data.permalink_url}` : "",
          data.shares ? `- **Shares**: ${formatNumber(data.shares.count)}` : "",
          data.likes?.summary ? `- **Likes**: ${formatNumber(data.likes.summary.total_count)}` : "",
          data.comments?.summary ? `- **Comments**: ${formatNumber(data.comments.summary.total_count)}` : "",
        ].filter(Boolean);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Event ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_create_event",
    {
      title: "Create Facebook Page Event",
      description: `Creates an event on a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - name (string): Event name
  - start_time (string): ISO 8601 datetime (e.g., 2024-06-15T18:00:00-0400)
  - end_time (string, optional): ISO 8601 datetime
  - description (string, optional): Event description
  - place (string, optional): Location name
  - ticket_uri (string, optional): Ticket URL`,
      inputSchema: z
        .object({
          page_id: z.string(),
          name: z.string().min(1),
          start_time: z.string().describe("ISO 8601 datetime"),
          end_time: z.string().optional(),
          description: z.string().optional(),
          place: z.string().optional(),
          ticket_uri: z.string().url().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ page_id, name, start_time, end_time, description, place, ticket_uri, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const fields: Record<string, unknown> = { name, start_time };
        if (end_time) fields.end_time = end_time;
        if (description) fields.description = description;
        if (place) fields.place = place;
        if (ticket_uri) fields.ticket_uri = ticket_uri;

        const result = await client.post<{ id: string }>(`/${page_id}/events`, fields, pageToken);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Event created.\n\n- **Event ID**: \`${result.id}\`\n- **Name**: ${name}` }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Locations ────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_locations",
    {
      title: "Get Page Locations",
      description: `Lists location pages for a business with multiple locations.

Args:
  - page_id (string): Parent Facebook Page ID`,
      inputSchema: z
        .object({
          page_id: z.string(),
          limit: z.number().int().min(1).max(100).default(20),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ page_id, limit, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string; name: string; location?: { city?: string; state?: string; country?: string; street?: string; zip?: string; latitude?: number; longitude?: number };
        }>>(`/${page_id}/locations`, pageToken, {
          fields: "id,name,location",
          limit,
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No locations found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Page Locations (${data.data.length})`, ""];
        for (const loc of data.data) {
          const addr = loc.location;
          lines.push(`- **${loc.name}** (\`${loc.id}\`)${addr ? ` — ${[addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(", ")}` : ""}`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get/Set Page CTA ──────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_cta",
    {
      title: "Get Page Call-to-Action",
      description: `Gets the call-to-action button configured on a Facebook Page.

Args:
  - page_id (string): Facebook Page ID`,
      inputSchema: z
        .object({
          page_id: z.string(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ page_id, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const data = await client.getWithToken<{ data: Array<{ id: string; type: string; web_url?: string; status?: string }> }>(
          `/${page_id}/call_to_actions`,
          pageToken,
          { fields: "id,type,web_url,status" }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No CTA configured." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const cta = data.data[0];
        return {
          content: [{
            type: "text",
            text: `# Page CTA\n\n- **Type**: ${cta.type}\n- **ID**: \`${cta.id}\`${cta.web_url ? `\n- **URL**: ${cta.web_url}` : ""}${cta.status ? `\n- **Status**: ${cta.status}` : ""}`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Photos ───────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_photos",
    {
      title: "Get Page Photos",
      description: `Lists photos uploaded to a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - type (string): 'uploaded' (by page) or 'tagged' (photos page is tagged in)
  - limit (number): Max results (default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
          type: z.enum(["uploaded", "tagged"]).default("uploaded"),
          limit: z.number().int().min(1).max(100).default(20),
          after: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ page_id, type, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: "id,name,picture,source,created_time,link,album",
          limit,
          type,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string; name?: string; picture?: string; source?: string; created_time?: string; link?: string;
        }>>(`/${page_id}/photos`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No photos found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Page Photos — ${type} (${data.data.length})`, ""];
        for (const photo of data.data) {
          lines.push(`- \`${photo.id}\`${photo.name ? ` — ${truncateField(photo.name, 80)}` : ""}${photo.created_time ? ` | ${formatDate(photo.created_time)}` : ""}`);
        }
        if (nextCursor) lines.push(buildPaginationNote(data.data.length, nextCursor));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "photos") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Page Ratings ──────────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_ratings",
    {
      title: "Get Page Ratings/Reviews",
      description: `Gets ratings and reviews for a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
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
          fields: "reviewer,rating,review_text,created_time,recommendation_type",
          limit,
        };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          reviewer?: { name: string; id: string };
          rating?: number;
          review_text?: string;
          created_time?: string;
          recommendation_type?: string;
        }>>(`/${page_id}/ratings`, pageToken, params);

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No ratings/reviews found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Page Ratings (${data.data.length})`, ""];
        for (const r of data.data) {
          const stars = r.rating ? `${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}` : r.recommendation_type ?? "";
          lines.push(`**${r.reviewer?.name ?? "Anonymous"}** ${stars} (${formatDate(r.created_time)})`);
          if (r.review_text) lines.push(`> ${truncateField(r.review_text, 200)}`);
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "ratings") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Subscribe Page to Webhooks ────────────────────────────────────────
  server.registerTool(
    "meta_subscribe_page_webhooks",
    {
      title: "Subscribe Page to Webhooks",
      description: `Subscribes your app to receive webhook updates for a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - subscribed_fields (string[]): Fields to subscribe to, e.g., feed, messages, messaging_postbacks, conversations

Call without subscribed_fields to check current subscriptions.`,
      inputSchema: z
        .object({
          page_id: z.string(),
          subscribed_fields: z.array(z.string()).optional().describe("Webhook fields to subscribe to"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ page_id, subscribed_fields, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);

        if (!subscribed_fields?.length) {
          // GET to check current subscriptions
          const data = await client.getWithToken<{ data: Array<{ name: string; id: string }> }>(
            `/${page_id}/subscribed_apps`,
            pageToken,
            {}
          );
          if (response_format === "json") {
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
          }
          if (!data.data?.length) {
            return { content: [{ type: "text", text: "No webhook subscriptions." }] };
          }
          const lines = [`# Current Webhook Subscriptions`, ""];
          for (const sub of data.data) {
            lines.push(`- **${sub.name}** (\`${sub.id}\`)`);
          }
          return { content: [{ type: "text", text: lines.join("\n") }] };
        }

        const result = await client.post<{ success: boolean }>(
          `/${page_id}/subscribed_apps`,
          { subscribed_fields: subscribed_fields.join(",") },
          pageToken
        );

        return {
          content: [{ type: "text", text: result.success ? `Subscribed to: ${subscribed_fields.join(", ")}` : "Subscription failed." }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Promotable Posts ──────────────────────────────────────────────
  server.registerTool(
    "meta_get_promotable_posts",
    {
      title: "Get Promotable Posts",
      description: `Gets posts that are eligible for boosting/promotion on a Facebook Page.

Args:
  - page_id (string): Facebook Page ID
  - limit (number): Max results (default 20)`,
      inputSchema: z
        .object({
          page_id: z.string(),
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
        const params: Record<string, unknown> = { fields: POST_FIELDS + ",is_eligible_for_promotion", limit };
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<MetaPost & { is_eligible_for_promotion?: boolean }>>(
          `/${page_id}/promotable_posts`,
          pageToken,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No promotable posts found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Promotable Posts (${data.data.length})`, ""];
        for (const post of data.data) {
          lines.push(`- \`${post.id}\` — ${formatDate(post.created_time)}${post.message ? ` | ${truncateField(post.message, 80)}` : ""}`);
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "promotable posts") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Update Page Profile Picture ────────────────────────────────────────
  server.registerTool(
    "meta_update_page_picture",
    {
      title: "Update Facebook Page Profile Picture",
      description: `Updates a Facebook Page's profile picture.

Args:
  - page_id (string): Facebook Page ID
  - picture_url (string): URL of the new profile picture

Requires pages_manage_metadata permission.`,
      inputSchema: z
        .object({
          page_id: z.string(),
          picture_url: z.string().url().describe("URL of the new profile picture image"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ page_id, picture_url, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.post<{ success?: boolean; id?: string }>(
          `/${page_id}/picture`,
          { picture: picture_url },
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{ type: "text", text: `Profile picture updated for page \`${page_id}\`.` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Update Page Cover Photo ────────────────────────────────────────────
  server.registerTool(
    "meta_update_page_cover",
    {
      title: "Update Facebook Page Cover Photo",
      description: `Updates a Facebook Page's cover photo.

Args:
  - page_id (string): Facebook Page ID
  - cover_url (string, optional): URL of the new cover photo
  - photo_id (string, optional): ID of an existing photo to use as cover
  - offset_y (number, optional): Vertical offset of the cover photo (0–100)
  - no_feed_story (boolean, optional): If true, don't publish a feed story about the change

Provide either cover_url or photo_id. Requires pages_manage_metadata permission.`,
      inputSchema: z
        .object({
          page_id: z.string(),
          cover_url: z.string().url().optional().describe("URL of the new cover photo"),
          photo_id: z.string().optional().describe("ID of existing photo to use as cover"),
          offset_y: z.number().min(0).max(100).optional().describe("Vertical offset (0–100)"),
          no_feed_story: z.boolean().optional().describe("Suppress feed story about the change"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ page_id, cover_url, photo_id, offset_y, no_feed_story, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const fields: Record<string, unknown> = {};
        if (cover_url) fields.source = cover_url;
        if (photo_id) fields.photo = photo_id;
        if (offset_y !== undefined) fields.offset_y = offset_y;
        if (no_feed_story !== undefined) fields.no_feed_story = no_feed_story;

        if (!cover_url && !photo_id) {
          return { content: [{ type: "text", text: "Error: Provide either cover_url or photo_id." }], isError: true };
        }

        const result = await client.post<{ id?: string }>(`/${page_id}`, { cover: fields }, pageToken);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{ type: "text", text: `Cover photo updated for page \`${page_id}\`.` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Hide/Unhide Comment ────────────────────────────────────────────────
  server.registerTool(
    "meta_hide_comment",
    {
      title: "Hide or Unhide a Facebook Comment",
      description: `Hides or unhides a comment on a Facebook Page post.

Hidden comments are only visible to the comment author and their friends.
This is a non-destructive alternative to deletion — useful for moderation.

Args:
  - comment_id (string): Comment ID to hide/unhide
  - page_id (string): Page ID (for authentication)
  - is_hidden (boolean): true to hide, false to unhide

Requires pages_manage_engagement permission.`,
      inputSchema: z
        .object({
          comment_id: z.string(),
          page_id: z.string().describe("Page ID (for auth)"),
          is_hidden: z.boolean().describe("true to hide, false to unhide"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ comment_id, page_id, is_hidden }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        await client.post(`/${comment_id}`, { is_hidden }, pageToken);
        return {
          content: [{ type: "text", text: `Comment \`${comment_id}\` ${is_hidden ? "hidden" : "unhidden"} successfully.` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Page Story ───────────────────────────────────────────────────
  server.registerTool(
    "meta_publish_page_story",
    {
      title: "Publish Facebook Page Story",
      description: `Publishes a story (photo or video) to a Facebook Page.

Requires: meta_list_pages called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - media_url (string): Public URL of the image or video
  - media_type (enum): "photo" or "video"

Returns the story ID on success.`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          media_url: z.string().url().describe("Public URL of the image or video"),
          media_type: z.enum(["photo", "video"]).describe("Type of media: photo or video"),
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
    async ({ page_id, media_url, media_type, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const fields: Record<string, unknown> =
          media_type === "photo" ? { photo_url: media_url } : { video_url: media_url };

        const result = await client.post<{ id: string }>(
          `/${page_id}/stories`,
          fields,
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Story published.\n\n- **Story ID**: \`${result.id}\``,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Live Video ────────────────────────────────────────────────────
  server.registerTool(
    "meta_create_live_video",
    {
      title: "Create Facebook Live Video",
      description: `Creates a live video broadcast on a Facebook Page.

Requires: meta_list_pages called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - title (string): Title of the live video
  - description (string, optional): Description of the broadcast
  - planned_start_time (string, optional): ISO 8601 datetime for scheduled broadcasts

If planned_start_time is provided, the broadcast is created as SCHEDULED_UNPUBLISHED; otherwise it goes LIVE_NOW.

Returns the stream URL and live video ID.`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          title: z.string().describe("Title of the live video"),
          description: z.string().optional().describe("Description of the broadcast"),
          planned_start_time: z.string().optional().describe("ISO 8601 datetime for scheduled broadcasts"),
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
    async ({ page_id, title, description, planned_start_time, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const fields: Record<string, unknown> = {
          title,
          status: planned_start_time ? "SCHEDULED_UNPUBLISHED" : "LIVE_NOW",
        };
        if (description) fields.description = description;
        if (planned_start_time) fields.planned_start_time = planned_start_time;

        const result = await client.post<{ id: string; stream_url?: string }>(
          `/${page_id}/live_videos`,
          fields,
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        const lines = [
          "Live video created.",
          "",
          `- **Live Video ID**: \`${result.id}\``,
        ];
        if (result.stream_url) lines.push(`- **Stream URL**: ${result.stream_url}`);
        if (planned_start_time) lines.push(`- **Scheduled For**: ${planned_start_time}`);

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Live Videos ──────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_live_videos",
    {
      title: "List Facebook Live Videos",
      description: `Lists live videos on a Facebook Page.

Requires: meta_list_pages called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - broadcast_status (enum, optional): Filter by status — "LIVE", "UNPUBLISHED", "SCHEDULED_UNPUBLISHED", or "VOD"
  - limit (number, optional): Max results (1–100, default 10)
  - after (string, optional): Pagination cursor

Returns live video details including title, status, views, and creation time.`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          broadcast_status: z.enum(["LIVE", "UNPUBLISHED", "SCHEDULED_UNPUBLISHED", "VOD"]).optional().describe("Filter by broadcast status"),
          limit: z.number().int().min(1).max(100).default(10),
          after: z.string().optional().describe("Pagination cursor for next page"),
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
    async ({ page_id, broadcast_status, limit, after, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const params: Record<string, unknown> = {
          fields: "id,title,status,embed_html,live_views,planned_start_time,creation_time",
          limit,
        };
        if (broadcast_status) params.broadcast_status = broadcast_status;
        if (after) params.after = after;

        const data = await client.getWithToken<MetaPaginatedResponse<{
          id: string;
          title?: string;
          status?: string;
          embed_html?: string;
          live_views?: number;
          planned_start_time?: string;
          creation_time?: string;
        }>>(
          `/${page_id}/live_videos`,
          pageToken,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No live videos found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const nextCursor = data.paging?.cursors?.after;
        const lines = [`# Live Videos (${data.data.length} shown)`, ""];
        for (const video of data.data) {
          lines.push(`## ${truncateField(video.title ?? "Untitled", 100)} (\`${video.id}\`)`);
          if (video.status) lines.push(`- **Status**: ${video.status}`);
          if (video.live_views != null) lines.push(`- **Live Views**: ${formatNumber(video.live_views)}`);
          if (video.planned_start_time) lines.push(`- **Scheduled**: ${formatDate(video.planned_start_time)}`);
          if (video.creation_time) lines.push(`- **Created**: ${formatDate(video.creation_time)}`);
          if (video.embed_html) lines.push(`- **Embed HTML**: ${truncateField(video.embed_html, 200)}`);
          lines.push("");
        }
        if (nextCursor) {
          lines.push(buildPaginationNote(data.data.length, nextCursor));
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "live videos") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── End Live Video ───────────────────────────────────────────────────────
  server.registerTool(
    "meta_end_live_video",
    {
      title: "End Facebook Live Video",
      description: `Ends an active live video broadcast.

Requires: meta_list_pages called first to load page tokens.

Args:
  - live_video_id (string): The live video ID to end
  - page_id (string): Facebook Page ID (needed for page token auth)

Ends the broadcast immediately.`,
      inputSchema: z
        .object({
          live_video_id: z.string().describe("The live video ID to end"),
          page_id: z.string().describe("Facebook Page ID (for auth)"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ live_video_id, page_id, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.post<{ success?: boolean }>(
          `/${live_video_id}`,
          { end_live_video: true },
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Live video \`${live_video_id}\` ended successfully.`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Automated Responses ──────────────────────────────────────────────
  server.registerTool(
    "meta_get_page_automated_responses",
    {
      title: "Get Page Automated Messaging Settings",
      description: `Gets the current automated messaging settings for a Facebook Page.

Requires: meta_list_pages called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID

Returns: Instant reply message, away message, greeting text, and ice breakers configuration.`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
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
    async ({ page_id, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const data = await client.getWithToken<Record<string, unknown>>(`/${page_id}`, pageToken, {
          fields: "instant_reply_message,greeting,ice_breakers",
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [
          `# Automated Messaging Settings for Page \`${page_id}\``,
          "",
        ];

        if (data.instant_reply_message) {
          lines.push(`## Instant Reply`);
          lines.push(`- **Message**: ${data.instant_reply_message}`);
          lines.push("");
        }

        if (data.greeting && Array.isArray(data.greeting)) {
          lines.push(`## Greeting`);
          for (const g of data.greeting as Array<{ locale: string; text: string }>) {
            lines.push(`- **${g.locale}**: ${g.text}`);
          }
          lines.push("");
        }

        if (data.ice_breakers && Array.isArray(data.ice_breakers)) {
          lines.push(`## Ice Breakers`);
          for (const ib of data.ice_breakers as Array<{ question: string; payload?: string }>) {
            lines.push(`- ${ib.question}`);
          }
          lines.push("");
        }

        if (lines.length === 2) {
          lines.push("_No automated messaging settings configured._");
        }

        return { content: [{ type: "text", text: truncate(lines.join("\n"), "automated responses") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Set Instant Reply ────────────────────────────────────────────────────
  server.registerTool(
    "meta_set_instant_reply",
    {
      title: "Set Page Instant Reply",
      description: `Sets the instant reply message for a Facebook Page. This is the automatic message sent immediately when someone messages the page.

Requires: meta_list_pages called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - message (string): The instant reply message text
  - enabled (boolean, default true): Whether instant reply is enabled`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          message: z.string().min(1).describe("Instant reply message text"),
          enabled: z.boolean().default(true).describe("Enable or disable instant reply"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ page_id, message, enabled, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.post<Record<string, unknown>>(
          `/${page_id}/page_message_responses`,
          {
            page_set_instant_reply: { message: { text: message } },
            instant_reply_enabled: enabled,
          },
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Instant reply ${enabled ? "enabled" : "disabled"} for page \`${page_id}\`.\n\n- **Message**: ${message}`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Set Away Message ─────────────────────────────────────────────────────
  server.registerTool(
    "meta_set_away_message",
    {
      title: "Set Page Away Message",
      description: `Sets the away message for a Facebook Page. This is shown when the page is set to away mode.

Requires: meta_list_pages called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - message (string): The away message text
  - enabled (boolean, default true): Whether away mode is enabled`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          message: z.string().min(1).describe("Away message text"),
          enabled: z.boolean().default(true).describe("Enable or disable away mode"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ page_id, message, enabled, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.post<Record<string, unknown>>(
          `/${page_id}/page_message_responses`,
          {
            page_set_away_mode: { away_mode: { text: message } },
            away_setting_type: "custom",
            away_mode_enabled: enabled,
          },
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Away message ${enabled ? "enabled" : "disabled"} for page \`${page_id}\`.\n\n- **Message**: ${message}`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Set Greeting ─────────────────────────────────────────────────────────
  server.registerTool(
    "meta_set_greeting",
    {
      title: "Set Page Messenger Greeting",
      description: `Sets the Messenger greeting text for a Facebook Page. This is shown to users before they send their first message.

Requires: meta_list_pages called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - greeting_text (string): The greeting text (max 160 characters)`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          greeting_text: z.string().min(1).max(160).describe("Greeting text shown before first message"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ page_id, greeting_text, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const result = await client.post<Record<string, unknown>>(
          `/${page_id}/thread_settings`,
          {
            greeting: [{ locale: "default", text: greeting_text }],
          },
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Messenger greeting set for page \`${page_id}\`.\n\n- **Greeting**: ${greeting_text}`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Publish Page Reel ──────────────────────────────────────────────────
  server.registerTool(
    "meta_publish_page_reel",
    {
      title: "Publish Facebook Page Reel",
      description: `Publishes a Reel (short-form video) to a Facebook Page.

Requires: meta_list_pages must be called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - video_url (string): Public URL of the video file
  - description (string, optional): Reel description/caption
  - title (string, optional): Reel title

Returns: The reel/video ID on success.

Notes:
  - Video must be hosted on a publicly accessible server
  - FB Reels use a simpler single-step flow (no container polling needed)`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          video_url: z.string().url().describe("Public URL of the video file"),
          description: z.string().optional().describe("Reel description/caption"),
          title: z.string().optional().describe("Reel title"),
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
    async ({ page_id, video_url, description, title, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);
        const fields: Record<string, unknown> = {
          source: video_url,
          video_state: "PUBLISHED",
        };
        if (description) fields.description = description;
        if (title) fields.title = title;

        const result = await client.post<{ id: string }>(
          `/${page_id}/video_reels`,
          fields,
          pageToken
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Reel published to Facebook Page.\n\n- **Reel/Video ID**: \`${result.id}\``,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Cross-Post to Facebook + Instagram ─────────────────────────────────
  server.registerTool(
    "meta_cross_post",
    {
      title: "Cross-Post to Facebook Page & Instagram",
      description: `Publishes the same content to both a Facebook Page and Instagram simultaneously.

Requires: meta_list_pages must be called first to load page tokens.

Args:
  - page_id (string): Facebook Page ID
  - ig_account_id (string): Instagram professional account ID
  - message (string): Text content (used as FB post text and IG caption)
  - image_url (string, optional): Public image URL — creates photo posts on both platforms
  - video_url (string, optional): Public video URL — creates Reels on both platforms

Logic:
  - If image_url: FB photo post + IG photo post (parallel)
  - If video_url: FB Reel + IG Reel (parallel)
  - If text only: FB text post only (IG doesn't support text-only posts)
  - Uses Promise.allSettled so one platform failing doesn't block the other

Returns: Results from both platforms (which succeeded, which failed).`,
      inputSchema: z
        .object({
          page_id: z.string().describe("Facebook Page ID"),
          ig_account_id: z.string().describe("Instagram professional account ID"),
          message: z.string().min(1).describe("Text content / caption for both platforms"),
          image_url: z.string().url().optional().describe("Public image URL for photo posts"),
          video_url: z.string().url().optional().describe("Public video URL for Reels"),
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
    async ({ page_id, ig_account_id, message, image_url, video_url, response_format }) => {
      try {
        const pageToken = client.requirePageToken(page_id);

        const fbPromise = (async (): Promise<{ platform: string; id: string }> => {
          if (image_url) {
            const result = await client.post<{ id: string; post_id?: string }>(
              `/${page_id}/photos`,
              { url: image_url, message },
              pageToken
            );
            return { platform: "Facebook Photo", id: result.post_id ?? result.id };
          } else if (video_url) {
            const result = await client.post<{ id: string }>(
              `/${page_id}/video_reels`,
              { source: video_url, video_state: "PUBLISHED", description: message },
              pageToken
            );
            return { platform: "Facebook Reel", id: result.id };
          } else {
            const result = await client.post<{ id: string }>(
              `/${page_id}/feed`,
              { message },
              pageToken
            );
            return { platform: "Facebook Post", id: result.id };
          }
        })();

        const igPromise = (async (): Promise<{ platform: string; id: string } | null> => {
          if (image_url) {
            const container = await client.post<{ id: string }>(
              `/${ig_account_id}/media`,
              { image_url, caption: message }
            );
            const result = await client.post<{ id: string }>(
              `/${ig_account_id}/media_publish`,
              { creation_id: container.id }
            );
            return { platform: "Instagram Photo", id: result.id };
          } else if (video_url) {
            const container = await client.post<{ id: string }>(
              `/${ig_account_id}/media`,
              { media_type: "REELS", video_url, caption: message, share_to_feed: true }
            );
            const statusCode = await client.pollContainerStatus(container.id, "instagram");
            if (statusCode !== "FINISHED") {
              throw new Error(`Instagram container status: ${statusCode} (not FINISHED)`);
            }
            const result = await client.post<{ id: string }>(
              `/${ig_account_id}/media_publish`,
              { creation_id: container.id }
            );
            return { platform: "Instagram Reel", id: result.id };
          } else {
            return null;
          }
        })();

        const [fbResult, igResult] = await Promise.allSettled([fbPromise, igPromise]);

        if (response_format === "json") {
          const json = {
            facebook: fbResult.status === "fulfilled" ? { success: true, ...fbResult.value } : { success: false, error: (fbResult as PromiseRejectedResult).reason?.message ?? String((fbResult as PromiseRejectedResult).reason) },
            instagram: igResult.status === "fulfilled" ? (igResult.value ? { success: true, ...igResult.value } : { success: true, skipped: true, reason: "Text-only posts not supported on Instagram" }) : { success: false, error: (igResult as PromiseRejectedResult).reason?.message ?? String((igResult as PromiseRejectedResult).reason) },
          };
          return { content: [{ type: "text", text: JSON.stringify(json, null, 2) }] };
        }

        const lines = ["# Cross-Post Results", ""];

        if (fbResult.status === "fulfilled") {
          lines.push(`**${fbResult.value.platform}**: Published — ID \`${fbResult.value.id}\``);
        } else {
          lines.push(`**Facebook**: Failed — ${(fbResult as PromiseRejectedResult).reason?.message ?? "Unknown error"}`);
        }

        if (igResult.status === "fulfilled") {
          if (igResult.value) {
            lines.push(`**${igResult.value.platform}**: Published — ID \`${igResult.value.id}\``);
          } else {
            lines.push("**Instagram**: Skipped (text-only posts not supported on Instagram)");
          }
        } else {
          lines.push(`**Instagram**: Failed — ${(igResult as PromiseRejectedResult).reason?.message ?? "Unknown error"}`);
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
