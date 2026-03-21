<br>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png">
    <source media="(prefers-color-scheme: light)" srcset="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png" alt="Meta" width="100">
  </picture>
</p>

<h1 align="center">Meta MCP Server</h1>

<p align="center">
  Connect any AI assistant to Meta's entire business platform.<br>
  <sub>Facebook Pages &middot; Instagram &middot; Threads &middot; Ads Manager &middot; Insights &middot; Ad Library</sub>
</p>

<p align="center">
  <a href="https://github.com/oliverames/meta-mcp-server/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>&nbsp;
  <img src="https://img.shields.io/badge/tools-144-6C47FF?style=flat-square" alt="144 Tools">&nbsp;
  <img src="https://img.shields.io/badge/tests-52_passing-34D058?style=flat-square" alt="52 Tests Passing">&nbsp;
  <img src="https://img.shields.io/badge/Graph_API-v21.0-1877F2?style=flat-square" alt="Graph API v21.0">&nbsp;
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<br>

<p align="center">
  <a href="#quick-start">Quick Start</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="#what-you-can-do">What You Can Do</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="#complete-tool-reference">All 144 Tools</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="#configuration">Configuration</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="#architecture">Architecture</a>
</p>

<br>

---

<br>

## Quick Start

```bash
git clone https://github.com/oliverames/meta-mcp-server.git
cd meta-mcp-server
npm install && npm run build
```

Add to your MCP client config:

```json
{
  "mcpServers": {
    "meta": {
      "command": "node",
      "args": ["/path/to/meta-mcp-server/dist/index.js"],
      "env": {
        "META_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

That's it. Your AI assistant now has access to 144 Meta tools.

> Need a token? Go to the [Graph API Explorer](https://developers.facebook.com/tools/explorer), select your app, and generate one. See [Configuration](#configuration) for details.

<br>

---

<br>

## What You Can Do

<table>
<tr>
<td width="50%" valign="top">

### Publish everywhere

Post to Facebook Pages, Instagram (photos, reels, stories, carousels), and Threads (text, images, video, links) — all from natural language.

```
> Post our holiday hours to the Facebook page
> Publish this photo to Instagram with alt text
> Share a carousel on Threads with these 5 images
```

</td>
<td width="50%" valign="top">

### Manage engagement

Read and reply to comments, moderate conversations, track reactions, manage blocked users, and handle page messaging.

```
> What are the recent comments on our latest post?
> Reply to that comment thanking them
> Show me the reaction breakdown on yesterday's post
```

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Analyze performance

Get insights at every level — page, post, account, campaign, ad set, and individual ad. Break down by age, gender, country, device, and placement.

```
> How did our Instagram perform this month?
> Show campaign spend broken down by age group
> What's our CTR trend over the last 90 days?
```

</td>
<td width="50%" valign="top">

### Run ad campaigns

Full CRUD for campaigns, ad sets, ads, and creatives. Search targeting options, estimate reach, manage pixels, audiences, and automated rules.

```
> List all active campaigns in my ad account
> What's the reach estimate for women 25-34 in NYC?
> Create a lookalike audience from my best customers
```

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Research competitors

Search any advertiser's active ads through Meta's public Ad Library — no account access needed.

```
> What ads is Nike running in the US right now?
> Search the Ad Library for "sustainable fashion" ads
```

</td>
<td width="50%" valign="top">

### Stay in control

Debug tokens, check permissions, monitor rate limits, and verify API connectivity. Every error tells you exactly what went wrong and how to fix it.

```
> Check my token status and permissions
> Am I close to Instagram's publishing limit?
> Run a health check on the Meta connection
```

</td>
</tr>
</table>

<br>

---

<br>

## Complete Tool Reference

### Facebook Pages — 42 tools

Everything a brand needs to manage their Facebook presence.

| Tool | Description |
|:---|:---|
| `meta_list_pages` | List all Facebook Pages you manage *(call first — caches page tokens)* |
| `meta_get_page` | Get detailed page info (category, followers, description, links) |
| `meta_get_post` | Get a single post by ID |
| `meta_create_post` | Create a text post on a page |
| `meta_create_photo_post` | Create a photo post (URL or page photo ID) |
| `meta_create_video_post` | Create a video post with optional title and description |
| `meta_update_post` | Edit an existing post's message |
| `meta_delete_post` | Delete a post |
| `meta_get_posts` | Get a page's feed with pagination |
| `meta_get_published_posts` | Get published posts only |
| `meta_get_scheduled_posts` | Get scheduled (unpublished) posts |
| `meta_get_promotable_posts` | Get posts eligible for ad promotion |
| `meta_get_visitor_posts` | Get posts made by visitors on the page |
| `meta_get_post_comments` | Get comments on a post with pagination |
| `meta_reply_post_comment` | Reply to a comment as the page |
| `meta_delete_comment` | Delete a comment |
| `meta_like_object` | Like or unlike a post or comment |
| `meta_get_post_reactions` | Get reaction breakdown (like, love, haha, wow, sad, angry) |
| `meta_get_page_insights` | Page analytics — reach, impressions, engagement, fans |
| `meta_get_page_conversations` | List page message conversations |
| `meta_get_conversation_messages` | Get messages within a conversation |
| `meta_send_page_message` | Send a message to a user (24-hour messaging window) |
| `meta_update_page` | Update page details (about, description, website, hours) |
| `meta_create_event` | Create a page event |
| `meta_get_page_events` | List events (upcoming, past, or canceled) |
| `meta_get_page_albums` | List page photo albums |
| `meta_get_page_photos` | Get photos (uploaded or tagged) |
| `meta_get_page_videos` | List page videos |
| `meta_get_page_tagged` | Get posts where the page is tagged |
| `meta_get_page_fan_demographics` | Follower breakdown by age, gender, and country |
| `meta_get_page_ratings` | Get page reviews and star ratings |
| `meta_get_page_locations` | Location info for multi-location businesses |
| `meta_get_page_cta` | Get the page's call-to-action button configuration |
| `meta_get_page_tabs` | List page tabs and their configuration |
| `meta_get_page_picture` | Get page profile picture URL |
| `meta_get_blocked_users` | List blocked users |
| `meta_block_user` | Block or unblock a user |
| `meta_subscribe_page_webhooks` | Subscribe the page to webhook events |
| `meta_get_post_insights` | Per-post analytics (impressions, engagement, clicks, reactions, video) |
| `meta_update_page_picture` | Update page profile picture from URL |
| `meta_update_page_cover` | Update page cover photo from URL or existing photo |
| `meta_hide_comment` | Hide or unhide a comment (non-destructive moderation) |

### Instagram — 26 tools

Full Instagram Business API — publishing, engagement, discovery, and analytics.

| Tool | Description |
|:---|:---|
| `meta_list_instagram_accounts` | List Instagram business accounts linked to your Facebook Pages |
| `meta_get_instagram_media` | Get recent media for an Instagram account with pagination |
| `meta_get_instagram_single_media` | Get a single media object by ID |
| `meta_publish_instagram_photo` | Publish a photo with optional alt text for accessibility |
| `meta_publish_instagram_reel` | Publish a reel with automatic video processing polling |
| `meta_publish_instagram_story` | Publish a story (image or video with auto-polling) |
| `meta_publish_instagram_carousel` | Publish a carousel (2–10 items, parallel container creation) |
| `meta_publish_instagram_container` | Publish a pre-created media container |
| `meta_check_instagram_container` | Check container processing status with actionable messages |
| `meta_get_instagram_account_insights` | Account-level analytics (impressions, reach, profile views) |
| `meta_get_instagram_media_insights` | Per-post metrics (impressions, reach, engagement, saves, plays) |
| `meta_get_instagram_comments` | Get comments on a media object |
| `meta_get_instagram_comment_replies` | Get threaded replies to a comment |
| `meta_reply_instagram_comment` | Reply to a comment |
| `meta_delete_instagram_comment` | Delete a comment |
| `meta_search_instagram_hashtag` | Search hashtag top or recent media |
| `meta_get_instagram_recent_hashtags` | Get your recently searched hashtags |
| `meta_get_instagram_user` | Business discovery — look up any public business/creator by username |
| `meta_get_instagram_stories` | Get currently active stories |
| `meta_get_instagram_live_media` | Get live video media |
| `meta_get_instagram_mentioned_media` | Get media where you're @mentioned |
| `meta_get_instagram_media_children` | Get individual items in a carousel |
| `meta_get_instagram_product_tags` | Get product tags on a media object |
| `meta_delete_instagram_media` | Delete a media object |
| `meta_toggle_instagram_comments` | Enable or disable comments on media |
| `meta_check_instagram_publishing_limit` | Check rate limit status (100 posts per 24 hours) |

### Ads Manager — 45 tools

Complete ad campaign management — create, optimize, analyze, and automate.

| Tool | Description |
|:---|:---|
| `meta_list_ad_accounts` | List ad accounts you have access to |
| `meta_get_ad_account` | Get ad account details (status, currency, spend cap, balance) |
| `meta_list_campaigns` | List campaigns with status filtering and pagination |
| `meta_get_campaign` | Get a single campaign's full details |
| `meta_create_campaign` | Create a campaign with objective and budget |
| `meta_update_campaign` | Update campaign name, status, budget, or schedule |
| `meta_delete_campaign` | Delete a campaign |
| `meta_list_adsets` | List ad sets with filtering |
| `meta_get_adset` | Get a single ad set's targeting and budget details |
| `meta_create_adset` | Create an ad set with targeting, budget, and optimization |
| `meta_update_adset` | Update ad set targeting, budget, or schedule |
| `meta_delete_adset` | Delete an ad set |
| `meta_list_ads` | List ads with status filtering |
| `meta_get_ad` | Get a single ad's details |
| `meta_create_ad` | Create an ad linking a creative to an ad set |
| `meta_update_ad` | Update ad name, status, or creative |
| `meta_delete_ad` | Delete an ad |
| `meta_list_ad_creatives` | List ad creatives |
| `meta_get_ad_creative` | Get a single creative's details |
| `meta_create_ad_creative` | Create an ad creative with text, image, and link |
| `meta_get_ad_preview` | Preview how an ad will appear in different placements |
| `meta_get_ad_account_users` | List users with access to the ad account |
| `meta_upload_ad_image` | Upload an image for use in ad creatives |
| `meta_list_ad_images` | List previously uploaded ad images |
| `meta_upload_ad_video` | Upload a video for use in ad creatives |
| `meta_list_ad_videos` | List previously uploaded ad videos |
| `meta_search_targeting_interests` | Search for interest-based targeting options |
| `meta_search_targeting_geolocations` | Search for location-based targeting (countries, cities, zips) |
| `meta_search_targeting_demographics` | Search for demographic targeting options |
| `meta_browse_targeting_categories` | Browse all available targeting categories |
| `meta_get_reach_estimate` | Estimate potential audience size for a targeting spec |
| `meta_get_delivery_estimate` | Estimate ad delivery for a given budget and targeting |
| `meta_list_pixels` | List Meta Pixels for conversion tracking |
| `meta_create_pixel` | Create a new pixel |
| `meta_list_custom_conversions` | List custom conversion events |
| `meta_create_custom_conversion` | Create a custom conversion from pixel events |
| `meta_list_saved_audiences` | List saved audiences |
| `meta_create_saved_audience` | Create a reusable saved audience |
| `meta_delete_saved_audience` | Delete a saved audience |
| `meta_list_ad_rules` | List automated ad rules |
| `meta_create_ad_rule` | Create an automated rule (e.g., pause ads over $5 CPA) |
| `meta_delete_ad_rule` | Delete an automated rule |
| `meta_list_ad_labels` | List ad labels for organization |
| `meta_create_ad_label` | Create an ad label |
| `meta_get_ad_account_activity` | Get the ad account's activity log |

### Threads — 19 tools

Full Threads API — publishing, engagement, and analytics.

| Tool | Description |
|:---|:---|
| `threads_get_profile` | Get your Threads profile info |
| `threads_get_posts` | Get your recent posts with pagination |
| `threads_get_post` | Get a single post by ID |
| `threads_search` | Search your posts by keyword |
| `threads_publish_text` | Publish a text post |
| `threads_publish_image` | Publish an image post |
| `threads_publish_video` | Publish a video post with automatic processing polling |
| `threads_publish_carousel` | Publish a carousel (parallel creation and video polling) |
| `threads_publish_link` | Publish a post with a link attachment |
| `threads_delete_post` | Delete a post |
| `threads_get_replies` | Get replies to a post |
| `threads_get_conversation` | Get the full conversation tree for a post |
| `threads_get_mentions` | Get posts that @mention you |
| `threads_get_media_children` | Get individual items in a carousel post |
| `threads_hide_reply` | Hide or unhide a reply |
| `threads_repost` | Repost a Threads post |
| `threads_get_post_insights` | Get metrics for a specific post (views, likes, replies, etc.) |
| `threads_get_user_insights` | Get account-level metrics over time |
| `threads_check_rate_limits` | Check your current publishing rate limit status |

### Audiences — 5 tools

Custom and lookalike audience management for ad targeting.

| Tool | Description |
|:---|:---|
| `meta_list_custom_audiences` | List custom audiences in an ad account |
| `meta_get_custom_audience` | Get audience details (size, delivery status) |
| `meta_create_custom_audience` | Create a custom audience |
| `meta_create_lookalike_audience` | Create a lookalike audience from a source audience |
| `meta_delete_custom_audience` | Delete a custom audience |

### Insights — 4 tools

Performance analytics across the ad hierarchy with breakdowns and custom date ranges.

| Tool | Description |
|:---|:---|
| `meta_get_account_insights` | Ad account performance — spend, impressions, reach, clicks, CTR, CPM, CPC, conversions |
| `meta_get_campaign_insights` | Per-campaign performance with the same metrics |
| `meta_get_adset_insights` | Per-ad-set performance |
| `meta_get_ad_insights` | Per-ad performance |

> All insight tools support **15 date presets** (today, last_7d, last_30d, etc.), **custom date ranges**, and **8 breakdown dimensions** (age, gender, country, region, device, platform, impression device, placement).

### Ad Library & Utility — 3 tools

| Tool | Description |
|:---|:---|
| `meta_search_ad_library` | Search any advertiser's active ads — public transparency API, no account access needed |
| `meta_debug_token` | Inspect your token: type, validity, expiry, permissions, associated app and user |
| `meta_health_check` | Check server health: token status, cached tokens, API connectivity for both Graph and Threads |

<br>

---

<br>

## Configuration

### 1. Create a Meta App

Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App** → choose **Business** type. Add **Facebook Login**, **Pages API**, **Instagram Graph API**, and **Marketing API**.

### 2. Generate Tokens

Get a token from the [Graph API Explorer](https://developers.facebook.com/tools/explorer), then exchange it for a long-lived token (60 days):

```bash
curl "https://graph.facebook.com/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=YOUR_APP_ID&\
client_secret=YOUR_APP_SECRET&\
fb_exchange_token=SHORT_LIVED_TOKEN"
```

> **For permanent access**, create a System User token in Business Manager → System Users.

**Threads** uses a separate token via `graph.threads.net` OAuth — see [Threads API docs](https://developers.facebook.com/docs/threads/get-started).

### 3. Grant Permissions

| Permission | Required for |
|:---|:---|
| `pages_show_list` | Listing pages |
| `pages_read_engagement` | Page insights, reactions |
| `pages_manage_posts` | Creating, editing, deleting posts |
| `pages_manage_metadata` | Page settings, webhooks |
| `pages_read_user_content` | Tagged posts, visitor posts, ratings |
| `pages_messaging` | Reading and sending messages |
| `instagram_basic` | Instagram account info |
| `instagram_content_publish` | Publishing photos, reels, stories, carousels |
| `instagram_manage_insights` | Instagram analytics |
| `instagram_manage_comments` | Comment management |
| `ads_read` | Reading campaigns, ad sets, ads, insights |
| `ads_management` | Creating and managing ads |
| `business_management` | Business Manager assets |
| `threads_basic` | Threads profile and posts |
| `threads_content_publish` | Publishing to Threads |
| `threads_manage_insights` | Threads analytics |
| `threads_manage_replies` | Managing Threads replies |

### 4. Connect to Your MCP Client

**Claude Code** — add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "meta": {
      "command": "node",
      "args": ["/absolute/path/to/meta-mcp-server/dist/index.js"],
      "env": {
        "META_ACCESS_TOKEN": "your_long_lived_token",
        "THREADS_ACCESS_TOKEN": "your_threads_token"
      }
    }
  }
}
```

Works with any MCP client that supports **stdio transport**. `THREADS_ACCESS_TOKEN` is optional — only needed for Threads tools.

<br>

---

<br>

## How It Works

The server starts without any tokens configured — no crashes, no "failed" status in MCP settings. When you call a tool without proper auth, you get a clear setup message.

**First call should always be `meta_list_pages`** — this caches the page-scoped access tokens required for all Page and Instagram operations.

### Error Handling

Every error message tells you what went wrong, why, and how to fix it:

| What happened | What you see |
|:---|:---|
| No token set | Step-by-step setup instructions with link to Graph Explorer |
| Token expired (code 190) | Direct link to regenerate at developers.facebook.com |
| Missing permission (code 10/200) | Names the exact permission needed and where to grant it |
| Rate limited (429) | Tells you to wait, links to Meta's rate limit docs |
| Page token missing | Reminds you to call `meta_list_pages` first |
| Network unreachable | "Cannot reach graph.facebook.com — check your connection" |
| Request timeout | "Request timed out — try again or break into smaller requests" |

### Token Refresh

Long-lived tokens expire after 60 days. Use `meta_debug_token` to check expiry, then refresh:

```bash
curl "https://graph.facebook.com/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=APP_ID&client_secret=APP_SECRET&\
fb_exchange_token=CURRENT_TOKEN"
```

> For permanent tokens, create a System User in Business Manager → System Users.

<br>

---

<br>

## Architecture

```
src/
├── index.ts              Server entry point (stdio transport)
├── constants.ts          API versions, base URLs, field constants
├── types.ts              TypeScript interfaces for Meta entities
├── services/
│   ├── api.ts            MetaApiClient — dual Graph + Threads API
│   └── utils.ts          Error handling, formatting, shared schemas
└── tools/
    ├── pages.ts          42 Facebook Page tools
    ├── instagram.ts      26 Instagram tools
    ├── ads.ts            45 Ads Manager tools
    ├── threads.ts        19 Threads tools
    ├── audiences.ts       5 Audience tools
    ├── insights.ts        4 Insight tools
    ├── ad_library.ts      1 Ad Library tool
    └── utility.ts         2 Utility tools
```

### Design Decisions

- **Dual API client** — Handles both `graph.facebook.com/v21.0` and `graph.threads.net/v1.0` with separate base URLs and tokens
- **Page token caching** — `meta_list_pages` caches page-scoped tokens; subsequent tools look them up by page ID
- **Two-step container publishing** — Instagram and Threads require container → publish flow; the server handles this automatically with video processing polling
- **Parallel carousel processing** — All carousel items created concurrently via `Promise.allSettled`; partial failures report which items succeeded
- **Zod strict schemas** — Every tool uses strict Zod schemas for type-safe parameter validation
- **Dual output format** — Every read tool supports `response_format: "markdown"` (human-readable) or `"json"` (machine-parseable)
- **Graceful auth** — Server starts without tokens, returns setup instructions on first tool call instead of crashing

<br>

---

<br>

## API Coverage

Targets **Meta Graph API v21.0** and **Threads API v1.0**.

| API | Status |
|:---|:---|
| Facebook Pages API | **Comprehensive** — posts, comments, messaging, insights, events, media, settings |
| Instagram Graph API | **Comprehensive** — publishing, comments, hashtags, business discovery, insights |
| Marketing API | **Comprehensive** — campaigns, ad sets, ads, creatives, targeting, audiences, pixels |
| Threads API | **Comprehensive** — publishing, replies, conversations, mentions, insights |
| Ad Library API | **Supported** — public transparency search |
| WhatsApp Business API | Not covered — separate infrastructure and token flow |
| Commerce / Catalog API | Not covered — requires Commerce permissions |

<br>

---

<br>

## Contributing

Contributions welcome. Run the test suite and follow existing patterns:

```bash
npm test            # 52 tests
npm run build       # TypeScript compilation
npm run test:watch  # Development mode
```

Conventions: Zod `.strict()` schemas, `response_format` parameter on read tools, `errorResult()` for error returns with `isError: true`.

<br>

---

<br>

<p align="center">
  Built by <a href="https://github.com/oliverames">Oliver Ames</a> with <a href="https://claude.ai/claude-code">Claude Code</a>
</p>

<p align="center">
  <sub>
    Powered by <a href="https://modelcontextprotocol.io">Model Context Protocol</a> · <a href="https://developers.facebook.com/docs/graph-api">Meta Graph API</a> · <a href="https://developers.facebook.com/docs/threads">Threads API</a> · <a href="https://www.typescriptlang.org">TypeScript</a> · <a href="https://zod.dev">Zod</a> · <a href="https://vitest.dev">Vitest</a>
  </sub>
</p>

<p align="center">
  <sub>Not affiliated with or endorsed by Meta Platforms, Inc.</sub>
</p>

<p align="center">
  <a href="https://github.com/oliverames/meta-mcp-server/blob/main/LICENSE">MIT License</a>
</p>
