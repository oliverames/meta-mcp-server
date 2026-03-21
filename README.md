<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png" alt="Meta" width="120">
</p>

<h1 align="center">Meta MCP Server</h1>

<p align="center">
  <strong>The most comprehensive MCP server for Meta's entire business platform.</strong><br>
  140 tools covering Facebook Pages, Instagram, Threads, Ads Manager, Audiences, Insights, and Ad Library.
</p>

<p align="center">
  <a href="#setup">Setup</a> · <a href="#tools-140-total">Tools</a> · <a href="#usage">Usage</a> · <a href="#error-handling">Error Handling</a> · <a href="#contributing">Contributing</a>
</p>

---

## Why This Exists

Social media teams manage brands across Meta's ecosystem every day — publishing posts, monitoring engagement, running ad campaigns, analyzing performance. This MCP server gives AI assistants (Claude, or any MCP-compatible client) full access to Meta's business APIs, so your AI can actually *do the work* alongside you.

**One server. Every Meta platform. 140 tools.**

## Features

- **Facebook Pages** — Full page management: posts (text, photo, video), comments, reactions, messaging, insights, events, albums, ratings, locations, webhooks, blocked users, and more
- **Instagram** — Publishing (photos, reels, stories, carousels with parallel video processing), comments, hashtag search, business discovery, media insights, product tags, stories, live media, mentions
- **Threads** — Publishing (text, images, video, carousels, links), replies, conversation trees, reposts, mentions, insights, rate limit monitoring
- **Ads Manager** — Full CRUD for campaigns, ad sets, ads, and creatives. Targeting search (interests, geolocations, demographics). Reach/delivery estimates, pixels, custom conversions, saved audiences, ad rules, labels, image/video libraries
- **Audiences** — Custom audience and lookalike audience management
- **Insights** — Performance analytics at account, campaign, ad set, and ad levels with breakdowns and custom date ranges
- **Ad Library** — Competitive intelligence: search any advertiser's active ads (public transparency API)
- **Utility** — Token debugging and server health checks

### Design Principles

- **Graceful degradation** — Server starts without tokens. No crashes, no "failed" status in MCP settings. Every tool returns a helpful setup message if auth is missing.
- **Actionable errors** — Every error includes what went wrong, why, and how to fix it (with direct links to Meta's tools).
- **Dual output** — Every tool supports `response_format: "markdown"` (human-readable) or `"json"` (machine-readable).
- **Smart pagination** — Responses include cursor-based pagination hints. Large responses are truncated at 25K characters with guidance on how to get more.
- **Parallel processing** — Carousel publishing creates all containers in parallel, polls all videos in parallel. Partial failure reports which items succeeded.

---

## Tools (140 total)

| Category | Count | Highlights |
|---|---|---|
| **Facebook Pages** | 38 | Post CRUD, photo/video posts, comments, reactions, messaging, insights, events, albums, ratings, locations, webhooks, blocked users |
| **Instagram** | 26 | Photo/reel/story/carousel publishing, comments, hashtag search, business discovery, media insights, product tags, publishing limits |
| **Ads Manager** | 45 | Campaign/ad set/ad CRUD, creatives, targeting search, reach estimates, pixels, conversions, saved audiences, rules, labels, image/video libraries |
| **Threads** | 19 | Text/image/video/carousel/link publishing, replies, conversations, mentions, reposts, insights, rate limits |
| **Audiences** | 5 | Custom audiences, lookalike audiences |
| **Insights** | 4 | Account/campaign/ad set/ad analytics with breakdowns |
| **Ad Library** | 1 | Competitive ad search (public transparency) |
| **Utility** | 2 | Token debug, health check |

<details>
<summary><strong>Full tool list</strong> (click to expand)</summary>

### Facebook Pages (38)

| Tool | Description |
|---|---|
| `meta_list_pages` | List all Facebook Pages you manage (must call first to cache page tokens) |
| `meta_get_page` | Get detailed info about a specific page |
| `meta_get_post` | Get a single post by ID |
| `meta_create_post` | Create a text post on a page |
| `meta_create_photo_post` | Create a photo post (URL or page photo ID) |
| `meta_create_video_post` | Create a video post with optional title/description |
| `meta_update_post` | Edit an existing post's message |
| `meta_delete_post` | Delete a post |
| `meta_get_posts` | Get a page's feed with pagination |
| `meta_get_published_posts` | Get published-only posts |
| `meta_get_scheduled_posts` | Get scheduled (unpublished) posts |
| `meta_get_promotable_posts` | Get posts eligible for promotion |
| `meta_get_visitor_posts` | Get posts by visitors on a page |
| `meta_get_post_comments` | Get comments on a post |
| `meta_reply_post_comment` | Reply to a comment |
| `meta_delete_comment` | Delete a comment |
| `meta_like_object` | Like or unlike a post/comment |
| `meta_get_post_reactions` | Get reaction breakdown (like, love, haha, wow, sad, angry) |
| `meta_get_page_insights` | Get page-level analytics (reach, impressions, engagement) |
| `meta_get_page_conversations` | List page message conversations |
| `meta_get_conversation_messages` | Get messages in a conversation |
| `meta_send_page_message` | Send a message to a user (24-hour window) |
| `meta_update_page` | Update page details (about, description, website, etc.) |
| `meta_create_event` | Create a page event |
| `meta_get_page_events` | List page events (upcoming, past, canceled) |
| `meta_get_page_albums` | List page photo albums |
| `meta_get_page_photos` | Get photos (uploaded or tagged) |
| `meta_get_page_videos` | List page videos |
| `meta_get_page_tagged` | Get posts where the page is tagged |
| `meta_get_page_fan_demographics` | Get follower age/gender/country breakdown |
| `meta_get_page_ratings` | Get page reviews and ratings |
| `meta_get_page_locations` | Get page location info for multi-location businesses |
| `meta_get_page_cta` | Get the page's call-to-action button config |
| `meta_get_page_tabs` | List page tabs |
| `meta_get_page_picture` | Get page profile picture URL |
| `meta_get_blocked_users` | List blocked users |
| `meta_block_user` | Block or unblock a user |
| `meta_subscribe_page_webhooks` | Subscribe to page webhooks |

### Instagram (26)

| Tool | Description |
|---|---|
| `meta_list_instagram_accounts` | List IG business accounts linked to your pages |
| `meta_get_instagram_media` | Get recent media for an IG account |
| `meta_get_instagram_single_media` | Get a single media object by ID |
| `meta_publish_instagram_photo` | Publish a photo (with optional alt text) |
| `meta_publish_instagram_reel` | Publish a reel with video polling |
| `meta_publish_instagram_story` | Publish a story (image or video) |
| `meta_publish_instagram_carousel` | Publish a carousel (2–10 items, parallel processing) |
| `meta_publish_instagram_container` | Publish a pre-created container |
| `meta_check_instagram_container` | Check container processing status |
| `meta_get_instagram_account_insights` | Get account-level analytics |
| `meta_get_instagram_media_insights` | Get per-post/reel/story metrics |
| `meta_get_instagram_comments` | Get comments on a media object |
| `meta_get_instagram_comment_replies` | Get replies to a comment |
| `meta_reply_instagram_comment` | Reply to a comment |
| `meta_delete_instagram_comment` | Delete a comment |
| `meta_search_instagram_hashtag` | Search hashtag top/recent media |
| `meta_get_instagram_recent_hashtags` | Get recently searched hashtags |
| `meta_get_instagram_user` | Business discovery: look up any public IG business by username |
| `meta_get_instagram_stories` | Get currently active stories |
| `meta_get_instagram_live_media` | Get live video media |
| `meta_get_instagram_mentioned_media` | Get media where you're mentioned |
| `meta_get_instagram_media_children` | Get carousel child items |
| `meta_get_instagram_product_tags` | Get product tags on media |
| `meta_delete_instagram_media` | Delete a media object |
| `meta_toggle_instagram_comments` | Enable/disable comments on media |
| `meta_check_instagram_publishing_limit` | Check publishing rate limit (100/24h) |

### Ads Manager (45)

| Tool | Description |
|---|---|
| `meta_list_ad_accounts` | List ad accounts you have access to |
| `meta_get_ad_account` | Get ad account details |
| `meta_list_campaigns` | List campaigns in an ad account |
| `meta_get_campaign` | Get a single campaign |
| `meta_create_campaign` | Create a campaign |
| `meta_update_campaign` | Update campaign settings |
| `meta_delete_campaign` | Delete a campaign |
| `meta_list_adsets` | List ad sets |
| `meta_get_adset` | Get a single ad set |
| `meta_create_adset` | Create an ad set with targeting and budget |
| `meta_update_adset` | Update ad set settings |
| `meta_delete_adset` | Delete an ad set |
| `meta_list_ads` | List ads |
| `meta_get_ad` | Get a single ad |
| `meta_create_ad` | Create an ad |
| `meta_update_ad` | Update ad settings |
| `meta_delete_ad` | Delete an ad |
| `meta_list_ad_creatives` | List ad creatives |
| `meta_get_ad_creative` | Get a single creative |
| `meta_create_ad_creative` | Create an ad creative |
| `meta_get_ad_preview` | Preview an ad as it would appear |
| `meta_get_ad_account_users` | List users with ad account access |
| `meta_upload_ad_image` | Upload an image for use in ads |
| `meta_list_ad_images` | List uploaded ad images |
| `meta_upload_ad_video` | Upload a video for use in ads |
| `meta_list_ad_videos` | List uploaded ad videos |
| `meta_search_targeting_interests` | Search for targeting interests |
| `meta_search_targeting_geolocations` | Search for targeting geolocations |
| `meta_search_targeting_demographics` | Search for targeting demographics |
| `meta_browse_targeting_categories` | Browse all targeting categories |
| `meta_get_reach_estimate` | Estimate audience reach for targeting |
| `meta_get_delivery_estimate` | Estimate ad delivery for budget/targeting |
| `meta_list_pixels` | List Meta Pixels |
| `meta_create_pixel` | Create a pixel |
| `meta_list_custom_conversions` | List custom conversions |
| `meta_create_custom_conversion` | Create a custom conversion |
| `meta_list_saved_audiences` | List saved audiences |
| `meta_create_saved_audience` | Create a saved audience |
| `meta_delete_saved_audience` | Delete a saved audience |
| `meta_list_ad_rules` | List automated ad rules |
| `meta_create_ad_rule` | Create an automated rule |
| `meta_delete_ad_rule` | Delete an automated rule |
| `meta_list_ad_labels` | List ad labels |
| `meta_create_ad_label` | Create an ad label |
| `meta_get_ad_account_activity` | Get ad account activity log |

### Threads (19)

| Tool | Description |
|---|---|
| `threads_get_profile` | Get your Threads profile |
| `threads_get_posts` | Get your recent Threads posts |
| `threads_get_post` | Get a single post by ID |
| `threads_search` | Search your Threads posts by keyword |
| `threads_publish_text` | Publish a text post |
| `threads_publish_image` | Publish an image post |
| `threads_publish_video` | Publish a video post (with processing poll) |
| `threads_publish_carousel` | Publish a carousel (parallel processing) |
| `threads_publish_link` | Publish a link attachment post |
| `threads_delete_post` | Delete a post |
| `threads_get_replies` | Get replies to a post |
| `threads_get_conversation` | Get full conversation tree |
| `threads_get_mentions` | Get posts mentioning you |
| `threads_get_media_children` | Get carousel child items |
| `threads_hide_reply` | Hide/unhide a reply |
| `threads_repost` | Repost a Threads post |
| `threads_get_post_insights` | Get post-level metrics |
| `threads_get_user_insights` | Get account-level metrics |
| `threads_check_rate_limits` | Check publishing rate limits |

### Audiences (5)

| Tool | Description |
|---|---|
| `meta_list_custom_audiences` | List custom audiences |
| `meta_get_custom_audience` | Get custom audience details |
| `meta_create_custom_audience` | Create a custom audience |
| `meta_create_lookalike_audience` | Create a lookalike audience |
| `meta_delete_custom_audience` | Delete a custom audience |

### Insights (4)

| Tool | Description |
|---|---|
| `meta_get_account_insights` | Ad account performance (spend, impressions, clicks, CTR, etc.) |
| `meta_get_campaign_insights` | Per-campaign performance |
| `meta_get_adset_insights` | Per-ad-set performance |
| `meta_get_ad_insights` | Per-ad performance |

### Ad Library (1)

| Tool | Description |
|---|---|
| `meta_search_ad_library` | Search any advertiser's ads (public transparency API) |

### Utility (2)

| Tool | Description |
|---|---|
| `meta_debug_token` | Inspect your token: type, expiry, permissions, app info |
| `meta_health_check` | Check server health: token status, API connectivity |

</details>

---

## Setup

### 1. Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App**
2. Choose **Business** as the app type
3. Add these products: **Facebook Login**, **Pages API**, **Instagram Graph API**, **Marketing API**

### 2. Get Access Tokens

#### Meta User Token (required)

1. Go to the [Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. Select your app → **Generate Access Token** → grant the permissions listed below
3. Exchange for a **long-lived token** (valid 60 days):

```bash
curl "https://graph.facebook.com/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=YOUR_APP_ID&\
client_secret=YOUR_APP_SECRET&\
fb_exchange_token=SHORT_LIVED_TOKEN"
```

> **Tip:** For a permanent token, create a System User in Business Manager → System Users.

#### Threads Token (optional)

Threads uses a separate OAuth flow via `graph.threads.net`:
1. Register your app for Threads API access at Meta for Developers
2. Complete the Threads OAuth flow to get a Threads-specific access token
3. Exchange for a long-lived token (valid 60 days)

### 3. Required Permissions

| Permission | Used for |
|---|---|
| `pages_show_list` | List pages |
| `pages_read_engagement` | Page insights, reactions |
| `pages_manage_posts` | Create/edit/delete posts |
| `pages_manage_metadata` | Update page settings, webhooks |
| `pages_read_user_content` | Tagged posts, visitor posts, ratings |
| `pages_messaging` | Read/send page messages |
| `instagram_basic` | Read Instagram account info |
| `instagram_content_publish` | Publish photos, reels, stories, carousels |
| `instagram_manage_insights` | Instagram analytics |
| `instagram_manage_comments` | Read/reply/delete comments |
| `ads_read` | Read campaigns, ad sets, ads, insights |
| `ads_management` | Create/update/delete ads and campaigns |
| `business_management` | Access Business Manager assets |
| `threads_basic` | Read Threads profile and posts |
| `threads_content_publish` | Publish to Threads |
| `threads_manage_insights` | Threads analytics |
| `threads_manage_replies` | Manage Threads replies |

### 4. Install & Build

```bash
git clone https://github.com/oliverames/meta-mcp-server.git
cd meta-mcp-server
npm install
npm run build
npm test  # 52 tests, all should pass
```

### 5. Configure Your MCP Client

#### Claude Code

Add to `~/.claude/settings.json` (or project `.claude/settings.json`):

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

`THREADS_ACCESS_TOKEN` is optional — only needed for Threads tools.

#### Other MCP Clients

This server uses **stdio transport** and works with any MCP-compatible client. Point your client at `node dist/index.js` with the environment variables above.

---

## Usage

### First Steps

```
> Call meta_list_pages
```

**Always call `meta_list_pages` first.** This caches the page access tokens needed for all subsequent page and Instagram operations.

### Publishing Content

```
> Publish a photo to my Instagram with the caption "Beautiful sunset"
> Create a post on my Facebook page about our holiday hours
> Post a thread with an image carousel
```

### Analytics

```
> Get my Instagram insights for the last 30 days
> Show me campaign performance broken down by age and gender
> What are my top-performing ads this month?
```

### Ad Management

```
> List all active campaigns in my ad account
> Create a new campaign with reach objective
> What's the estimated reach for targeting women 25-34 in the US interested in yoga?
```

### Competitive Intelligence

```
> Search the Ad Library for ads by Nike in the US
> What ads is [competitor] running right now?
```

---

## Error Handling

The server provides actionable error messages for every failure scenario:

| Scenario | What you see |
|---|---|
| **No token configured** | Setup instructions with link to Graph Explorer |
| **Token expired** (code 190) | "Token is invalid or expired" + link to regenerate |
| **Missing permission** (code 10/200) | Names the missing permission + link to grant it |
| **Rate limited** (429) | Tells you to wait + links to rate limit docs |
| **Page token not cached** | Tells you to call `meta_list_pages` first |
| **Threads token missing** | Tells you to set `THREADS_ACCESS_TOKEN` in config |
| **Network error** | "Cannot reach graph.facebook.com — check your connection" |
| **Request timeout** | "Request timed out — try again or break into smaller requests" |

> **No token? No crash.** The server starts without a token configured and returns a helpful setup message when you call any tool. This prevents the dreaded "failed" status in MCP settings.

---

## Token Refresh

Long-lived tokens expire after **60 days**. Refresh before expiry:

```bash
curl "https://graph.facebook.com/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=APP_ID&\
client_secret=APP_SECRET&\
fb_exchange_token=CURRENT_TOKEN"
```

For **permanent tokens**, use a System User token from Business Manager → System Users.

Use `meta_debug_token` to check your token's expiry and permissions at any time.

---

## Architecture

```
src/
├── index.ts              # Server entry point (stdio transport)
├── constants.ts          # API versions, base URLs, field constants
├── types.ts              # TypeScript interfaces for all Meta entities
├── services/
│   ├── api.ts            # MetaApiClient (Graph API + Threads API)
│   └── utils.ts          # Shared utilities, error handling, formatting
└── tools/
    ├── pages.ts          # 38 Facebook Page tools
    ├── instagram.ts      # 26 Instagram tools
    ├── ads.ts            # 45 Ads Manager tools
    ├── threads.ts        # 19 Threads tools
    ├── audiences.ts      # 5 Audience tools
    ├── insights.ts       # 4 Insights tools
    ├── ad_library.ts     # 1 Ad Library tool
    └── utility.ts        # 2 Utility tools
```

### Key Design Decisions

- **Dual API client** — The `MetaApiClient` handles both `graph.facebook.com` (Graph API) and `graph.threads.net` (Threads API) with separate base URLs and tokens
- **Page token caching** — Page operations require page-scoped tokens. `meta_list_pages` caches these; subsequent tools retrieve them by page ID
- **Two-step container publishing** — Instagram and Threads use Meta's required container → publish flow, with automatic video processing polling
- **`Promise.allSettled` for carousels** — Carousel items are created in parallel. Partial failures report which items succeeded and which failed
- **`URLSearchParams` for POST** — Meta requires `application/x-www-form-urlencoded` with nested objects JSON-stringified

---

## API Coverage

This server targets the **Meta Graph API v21.0** and **Threads API v1.0**.

| API | Coverage |
|---|---|
| Pages API | Comprehensive — posts, comments, messaging, insights, events, media, settings |
| Instagram Graph API | Comprehensive — publishing, comments, hashtags, business discovery, insights |
| Marketing API | Comprehensive — campaigns, ad sets, ads, creatives, targeting, audiences, pixels |
| Threads API | Comprehensive — publishing, replies, conversations, mentions, insights |
| Ad Library API | Basic — search and transparency |

### Not Covered (Requires Separate API Access)

- WhatsApp Business API (separate infrastructure and token flow)
- Product Catalogs / Commerce API (requires Commerce permissions)
- Lead Generation Forms (requires leads_retrieval permission)

---

## Contributing

Contributions are welcome! This project follows a few conventions:

- All tools use Zod schemas with `.strict()` mode for input validation
- Every tool supports `response_format` parameter (markdown/json)
- Error returns include `isError: true` for MCP-compliant error handling
- New tools should follow the patterns in existing tool files

```bash
npm test          # Run all tests
npm run build     # Compile TypeScript
npm run test:watch  # Watch mode for development
```

---

## Credits

Built with [Claude Code](https://claude.ai/claude-code) by [Oliver Ames](https://github.com/oliverames).

Powered by:
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) — The open protocol for AI tool integration
- [Meta Graph API](https://developers.facebook.com/docs/graph-api/) — Facebook Pages, Instagram, Marketing
- [Threads API](https://developers.facebook.com/docs/threads/) — Threads publishing and analytics
- [TypeScript](https://www.typescriptlang.org/) + [Zod](https://zod.dev/) — Type-safe development
- [Vitest](https://vitest.dev/) — Fast unit testing

## License

MIT
