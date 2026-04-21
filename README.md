<p align="center">
  <img src="assets/icon.png" width="80" height="80" alt="Meta">
</p>

<h1 align="center">Meta MCP Server</h1>

<p align="center">
  <strong>Connect any AI assistant to Meta's entire business platform</strong><br>
  <sub>Facebook Pages &middot; Instagram &middot; Threads &middot; Ads Manager &middot; Commerce &middot; Conversions API &middot; Insights</sub>
</p>

<p align="center">
  <code>200 tools</code> &bull;
  <code>7 platforms</code> &bull;
  <code>Graph API v21.0</code>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@oliverames/meta-mcp-server"><img src="https://img.shields.io/npm/v/@oliverames/meta-mcp-server?style=flat-square&color=f5a542" alt="npm"></a>
  <a href="https://github.com/oliverames/meta-mcp-server/releases/tag/v2.0.2"><img src="https://img.shields.io/github/v/release/oliverames/meta-mcp-server?style=flat-square&color=f5a542&label=MCPB" alt="MCPB release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-f5a542?style=flat-square" alt="License"></a>
  <a href="https://www.buymeacoffee.com/oliverames"><img src="https://img.shields.io/badge/Buy_Me_a_Coffee-support-f5a542?style=flat-square&logo=buy-me-a-coffee&logoColor=white" alt="Buy Me a Coffee"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#install-with-mcpb">MCPB Download</a> &bull;
  <a href="#what-you-can-do">What You Can Do</a> &bull;
  <a href="#complete-tool-reference">All 200 Tools</a> &bull;
  <a href="#configuration">Configuration</a> &bull;
  <a href="#architecture">Architecture</a>
</p>

---

## Why This Exists

Social media management across Meta's platforms — Facebook Pages, Instagram, Threads, Ads Manager, Commerce — requires juggling multiple dashboards, each with its own API quirks and token flows. This server consolidates the entire Meta Graph API surface into a single MCP interface, so your AI assistant can publish content, analyze performance, manage ad campaigns, and moderate engagement across all platforms in one conversation.

Every tool returns actionable error messages — not cryptic API codes. Token expired? You get a regeneration link. Missing permission? You see exactly which one and where to grant it. This means less debugging and more doing.

## Quick Start

### Install with MCPB

For Claude Desktop and other MCPB-compatible clients, download the local bundle from the [v2.0.2 release](https://github.com/oliverames/meta-mcp-server/releases/tag/v2.0.2):

[Download `meta-mcp-server-2.0.2.mcpb`](https://github.com/oliverames/meta-mcp-server/releases/download/v2.0.2/meta-mcp-server-2.0.2.mcpb)

The bundle includes the Meta favicon, production runtime dependencies, and setup prompts for Meta and optional Threads access tokens.

Add to your MCP client config:

```json
{
  "mcpServers": {
    "meta": {
      "command": "npx",
      "args": ["-y", "@oliverames/meta-mcp-server"],
      "env": {
        "META_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

That's it. Your AI assistant now has access to 200 Meta tools.

> Need a token? Go to the [Graph API Explorer](https://developers.facebook.com/tools/explorer), select your app, and generate one. See [Configuration](#configuration) for details.

### From Source

```bash
git clone https://github.com/oliverames/meta-mcp-server.git
cd meta-mcp-server
npm install && npm run build
```

---

## What You Can Do

<table>
<tr>
<td width="50%" valign="top">

### Publish everywhere

Post to Facebook Pages (text, photo, video, Reels, Stories), Instagram (photos, reels, stories, carousels), and Threads (text, images, video, GIFs, links). Schedule content in advance or cross-post to multiple platforms in one call.

```
> Post our holiday hours to the Facebook page
> Schedule an Instagram carousel for tomorrow at 9am
> Cross-post this photo to both Facebook and Instagram
> Publish a GIF to Threads with reply controls
> Create a Facebook Reel from this video
> Post a Story to our Facebook page
> Publish an Instagram reel with alt text for accessibility
> Share a link post on Threads with a quote
```

</td>
<td width="50%" valign="top">

### Manage engagement

Read and reply to comments across platforms, hide inappropriate content without deleting it, manage Instagram DMs and broadcast channels, and set up automated responses for when you're away.

```
> Show me unanswered Instagram DMs
> Hide that offensive comment on our latest post
> Reply to the top 3 comments on yesterday's reel
> Set up an instant reply for new messages
> Set our away message to "Back Monday at 9am"
> Send a DM to that customer who reached out
> What comments did we get on last week's posts?
> Update our Messenger greeting text
```

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Analyze performance

Get insights at every level — page, post, account, campaign, ad set, and individual ad. Over 70 page metrics, comprehensive Reels analytics (including skip rate and crossposted views), and full ad performance with video completion rates, ROAS, and quality rankings. Generate charts for reports.

```
> How did our Instagram perform this month?
> Show campaign spend broken down by age group
> What's the skip rate on our latest Reel?
> Generate a bar chart comparing this week vs last
> Get our Facebook page fan demographics
> What's our follower growth trend over 90 days?
> Show me post-level engagement for our top 5 posts
> Create a pie chart of spend by campaign
```

</td>
<td width="50%" valign="top">

### Run ad campaigns

Full campaign lifecycle — create, optimize, test, and automate. A/B testing with confidence levels, Advantage+ Shopping migration, interest/geo/demographic targeting search, reach estimates, automated rules, and comprehensive pixel management with server-side Conversions API.

```
> Create an A/B test comparing these two ad sets
> Migrate this campaign to Advantage+ Shopping
> Send a purchase conversion event via CAPI
> What's the reach estimate for women 25-34 in NYC?
> List all active campaigns and their ROAS
> Create an automated rule: pause ads over $5 CPA
> Check if our pixel is firing correctly
> Upload this image for a new ad creative
```

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Manage commerce

Full product catalog management for Facebook and Instagram shops — add products, update inventory, organize collections, and manage availability. Everything a brand needs to run social commerce.

```
> List all products in our catalog
> Add this new product at $29.99, in stock
> Mark the seasonal items as out of stock
> Show me our "Summer Collection" product set
> Update the description on our best-selling item
> How many products are in each catalog?
> Delete the discontinued product line
> What products are currently available?
```

</td>
<td width="50%" valign="top">

### Go live and broadcast

Start Facebook Live video broadcasts for product launches and events, publish Stories for time-sensitive content, and reach your audience directly through Instagram broadcast channels with polls, links, and messages.

```
> Start a live video on our Facebook page
> Send a poll to our Instagram broadcast channel
> Schedule a live stream for Friday at 2pm
> Publish a story to Facebook with this photo
> End the live broadcast
> Send a product announcement to our broadcast channel
> What live videos have we done this month?
> What ads is our competitor running right now?
```

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Research competitors

Search any advertiser's active ads through Meta's public Ad Library. See what creative, targeting, and spend your competitors are using — no account access needed. Look up any public Instagram business account's stats.

```
> What ads is Nike running in the US right now?
> Search the Ad Library for "sustainable fashion" ads
> Look up @competitor on Instagram — followers and posts
> Show me all active ads by this page ID
> What platforms are they running ads on?
> How much is our competitor spending on ads?
```

</td>
<td width="50%" valign="top">

### Stay in control

Debug tokens, check permissions, monitor rate limits, verify pixel health, and manage your Business Manager assets. Every error tells you exactly what went wrong and how to fix it — never a cryptic failure.

```
> Check my token status and permissions
> Am I close to Instagram's publishing limit?
> Run a health check on the Meta connection
> Is our pixel receiving events?
> List all ad accounts in our Business Manager
> Share this pixel with our agency's ad account
> What Threads rate limits do we have left?
> Debug why this API call is failing
```

</td>
</tr>
</table>

---

## Complete Tool Reference

### Facebook Pages — 52 tools

Everything a brand needs to manage their Facebook presence, messaging, and live broadcasts.

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
| `meta_hide_comment` | Hide or unhide a comment (non-destructive moderation) |
| `meta_like_object` | Like or unlike a post or comment |
| `meta_get_post_reactions` | Get reaction breakdown (like, love, haha, wow, sad, angry) |
| `meta_get_page_insights` | Page analytics — 70+ metrics across impressions, engagement, fans, video |
| `meta_get_post_insights` | Per-post analytics (impressions, engagement, clicks, reactions, video) |
| `meta_get_page_conversations` | List page message conversations |
| `meta_get_conversation_messages` | Get messages within a conversation |
| `meta_send_page_message` | Send a message to a user (24-hour messaging window) |
| `meta_update_page` | Update page details (about, description, website, hours, username, category, address) |
| `meta_update_page_picture` | Update page profile picture from URL |
| `meta_update_page_cover` | Update page cover photo from URL or existing photo |
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
| `meta_publish_page_story` | Publish a Facebook Story (photo or video) |
| `meta_publish_page_reel` | Publish a Facebook Reel |
| `meta_cross_post` | Cross-post to Facebook + Instagram simultaneously |
| `meta_create_live_video` | Start or schedule a live video broadcast |
| `meta_get_live_videos` | List live videos on a page |
| `meta_end_live_video` | End an active live broadcast |
| `meta_get_page_automated_responses` | Get current auto-reply settings |
| `meta_set_instant_reply` | Set the instant reply message |
| `meta_set_away_message` | Set the away/out-of-office message |
| `meta_set_greeting` | Set the Messenger greeting text |

### Instagram — 37 tools

Full Instagram Business API — publishing with scheduling, DMs, broadcast channels, engagement, discovery, and analytics.

| Tool | Description |
|:---|:---|
| `meta_list_instagram_accounts` | List Instagram business accounts linked to your Facebook Pages |
| `meta_get_instagram_media` | Get recent media for an Instagram account with pagination |
| `meta_get_instagram_single_media` | Get a single media object by ID |
| `meta_publish_instagram_photo` | Publish a photo with optional alt text and scheduling |
| `meta_publish_instagram_reel` | Publish a reel with auto-polling and optional scheduling |
| `meta_publish_instagram_story` | Publish a story (image or video with auto-polling) |
| `meta_publish_instagram_carousel` | Publish a carousel (2–10 items, parallel processing, schedulable) |
| `meta_publish_instagram_container` | Publish a pre-created media container |
| `meta_check_instagram_container` | Check container processing status with actionable messages |
| `meta_get_instagram_account_insights` | Account-level analytics with demographic breakdowns |
| `meta_get_instagram_media_insights` | Per-post metrics including Reels skip rate, crossposted views |
| `meta_get_instagram_comments` | Get comments on a media object |
| `meta_get_instagram_comment_replies` | Get threaded replies to a comment |
| `meta_reply_instagram_comment` | Reply to a comment |
| `meta_delete_instagram_comment` | Delete a comment |
| `meta_hide_instagram_comment` | Hide/unhide a comment (non-destructive moderation) |
| `meta_search_instagram_catalog_products` | Search for products in an Instagram Shopping catalog by name |
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
| `meta_get_instagram_conversations` | List Instagram DM conversations |
| `meta_get_instagram_messages` | Get messages in a DM conversation |
| `meta_send_instagram_message` | Send a text DM |
| `meta_send_instagram_media_message` | Send an image or link via DM |
| `meta_get_instagram_available_catalogs` | List product catalogs available for Instagram Shopping on a professional account |
| `meta_get_instagram_broadcast_channels` | List broadcast channels |
| `meta_get_broadcast_channel_messages` | Get messages in a broadcast channel |
| `meta_send_broadcast_channel_message` | Send a message to a broadcast channel |
| `meta_create_broadcast_channel_poll` | Create a poll in a broadcast channel |

### Ads Manager — 62 tools

Complete ad campaign lifecycle — create, optimize, test, analyze, and automate. Includes Advantage+ migration, A/B testing, and comprehensive pixel management.

| Tool | Description |
|:---|:---|
| `meta_list_ad_accounts` | List ad accounts you have access to |
| `meta_get_ad_account` | Get ad account details (status, currency, spend cap, balance) |
| `meta_list_campaigns` | List campaigns with status filtering and pagination |
| `meta_get_campaign` | Get a single campaign's full details |
| `meta_create_campaign` | Create a campaign (supports Advantage+ Shopping for OUTCOME_SALES) |
| `meta_update_campaign` | Update campaign name, status, budget, or migrate to Advantage+ |
| `meta_delete_campaign` | Delete a campaign |
| `meta_migrate_campaign_to_advantage_plus` | Migrate a campaign to Advantage+ Shopping (keeps campaign ID) |
| `meta_list_adsets` | List ad sets with filtering |
| `meta_get_adset` | Get a single ad set's targeting and budget details |
| `meta_create_adset` | Create an ad set with targeting, budget, and placement_soft_opt_out |
| `meta_update_adset` | Update ad set targeting, budget, or placement_soft_opt_out |
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
| `meta_get_ad_rule` | Get details for a specific automated ad rule |
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
| `meta_get_leadgen_leads` | Get submitted leads from a lead generation form |
| `meta_get_minimum_budgets` | Get minimum daily and lifetime budgets for an ad account by currency and bid strategy |
| `meta_list_leadgen_forms` | List lead generation forms for a Facebook Page |
| `meta_list_offline_event_sets` | List offline conversion event sets for an ad account |
| `meta_list_pixels` | List Meta Pixels for conversion tracking |
| `meta_create_pixel` | Create a new pixel |
| `meta_get_pixel` | Get pixel details (name, cookie status, matching fields) |
| `meta_get_pixel_stats` | Get event volume stats over time (verify pixel is firing) |
| `meta_update_pixel` | Update pixel settings (name, cookies, matching, data use) |
| `meta_delete_pixel` | Delete a pixel |
| `meta_share_pixel` | Share pixel access with another ad account |
| `meta_get_pixel_events` | Get recent test events for debugging |
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
| `meta_list_business_assets` | List pages, ad accounts, IG accounts, and pixels across Business Manager |
| `meta_create_ad_study` | Create an A/B test to compare campaigns or ad sets |
| `meta_get_ad_studies` | List A/B tests for an ad account |
| `meta_get_ad_study_results` | Get A/B test results with winner and confidence level |
| `meta_send_offline_event` | Send an offline conversion event for in-store purchases, phone orders, or other offline conversions |

### Threads — 22 tools

Full Threads API — publishing with GIFs, reply controls, location tagging, and analytics.

| Tool | Description |
|:---|:---|
| `threads_get_profile` | Get your Threads profile info |
| `threads_get_posts` | Get your recent posts with pagination |
| `threads_get_post` | Get a single post by ID (includes reply_audience) |
| `threads_search` | Search your posts by keyword |
| `threads_publish_text` | Publish a text post (with reply control and location) |
| `threads_publish_image` | Publish an image post (with reply control and location) |
| `threads_publish_video` | Publish a video post with auto-polling (with reply control and location) |
| `threads_publish_carousel` | Publish a carousel (parallel creation, with reply control) |
| `threads_publish_link` | Publish a post with a link attachment (with reply control) |
| `threads_publish_gif` | Publish a GIF post via GIPHY URL |
| `threads_delete_post` | Delete a post |
| `threads_get_replies` | Get replies to a post |
| `threads_get_conversation` | Get the full conversation tree for a post |
| `threads_get_followers` | List followers of the authenticated Threads user |
| `threads_get_following` | List accounts the authenticated Threads user is following |
| `threads_get_mentions` | Get posts that @mention you |
| `threads_get_media_children` | Get individual items in a carousel post |
| `threads_hide_reply` | Hide or unhide a reply |
| `threads_repost` | Repost a Threads post |
| `threads_get_post_insights` | Get metrics for a specific post (views, likes, replies, etc.) |
| `threads_get_user_insights` | Get account-level metrics with demographic breakdowns |
| `threads_check_rate_limits` | Check your current publishing rate limit status |

### Commerce — 10 tools

Product catalog management for Facebook and Instagram shops.

| Tool | Description |
|:---|:---|
| `meta_list_product_catalogs` | List product catalogs for a business |
| `meta_get_product_catalog` | Get catalog details and product count |
| `meta_list_products` | List products in a catalog with filtering |
| `meta_get_product` | Get a single product's full details |
| `meta_create_product` | Add a product to a catalog |
| `meta_create_product_feed` | Create a product feed to automatically sync products from a URL |
| `meta_update_product` | Update product details (name, price, availability, etc.) |
| `meta_delete_product` | Delete a product from a catalog |
| `meta_list_product_feeds` | List product feeds for a catalog |
| `meta_list_product_sets` | List product sets (subgroups) in a catalog |

### Conversions API — 2 tools

Server-side event tracking for conversion optimization.

| Tool | Description |
|:---|:---|
| `meta_send_conversion_event` | Send a server-side conversion event (Purchase, Lead, etc.) to a pixel |
| `meta_test_conversion_events` | Test CAPI setup without affecting production data |

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

Performance analytics across the ad hierarchy with 37 metrics, 15 date presets, and 8 breakdown dimensions.

| Tool | Description |
|:---|:---|
| `meta_get_account_insights` | Ad account performance — spend, impressions, reach, clicks, CTR, CPM, CPC, conversions, ROAS, video completion, quality rankings |
| `meta_get_campaign_insights` | Per-campaign performance with the same comprehensive metrics |
| `meta_get_adset_insights` | Per-ad-set performance |
| `meta_get_ad_insights` | Per-ad performance |

### Charts — 2 tools

Generate visual charts from data for reports and presentations.

| Tool | Description |
|:---|:---|
| `meta_generate_chart` | Create bar, line, pie, doughnut, radar charts as PNG images |
| `meta_generate_comparison_chart` | Generate side-by-side comparison charts (A/B, period-over-period) |

### Ad Library & Utility — 4 tools

| Tool | Description |
|:---|:---|
| `meta_search_ad_library` | Search any advertiser's active ads — public transparency API |
| `meta_debug_token` | Inspect your token: type, validity, expiry, permissions, associated app and user |
| `meta_health_check` | Check server health: token status, cached tokens, API connectivity |
| `meta_search_places` | Search Facebook Places (locations) by name or coordinates for post tagging |

---

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `META_ACCESS_TOKEN` | Yes | None | Long-lived Meta Graph API token for Facebook Pages, Instagram, Ads Manager, Commerce, Conversions API, Audiences, Insights, and utility tools. |
| `THREADS_ACCESS_TOKEN` | No | None | Threads API token. Required only for Threads publishing, replies, and insights tools. |

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

### 1Password Integration

If `META_ACCESS_TOKEN` or `THREADS_ACCESS_TOKEN` are not set in the environment, the server automatically attempts to resolve them from [1Password CLI](https://developer.1password.com/docs/cli/):

```
op://Development/Meta Access Token/credential
op://Development/Threads Access Token/credential
```

This means you can skip setting env vars entirely if you have `op` installed and a service account or session active. The fallback adds ~1-2s to startup per token and is silently skipped if 1Password is unavailable.

### 3. Grant Permissions

| Permission | Required for |
|:---|:---|
| `pages_show_list` | Listing pages |
| `pages_read_engagement` | Page insights, reactions |
| `pages_manage_posts` | Creating, editing, deleting posts |
| `pages_manage_metadata` | Page settings, webhooks, profile picture, cover photo |
| `pages_read_user_content` | Tagged posts, visitor posts, ratings |
| `pages_messaging` | Reading and sending messages, automated responses |
| `instagram_basic` | Instagram account info |
| `instagram_content_publish` | Publishing photos, reels, stories, carousels |
| `instagram_manage_insights` | Instagram analytics |
| `instagram_manage_comments` | Comment management |
| `instagram_manage_messages` | Instagram DMs |
| `ads_read` | Reading campaigns, ad sets, ads, insights |
| `ads_management` | Creating and managing ads, A/B tests |
| `business_management` | Business Manager assets, product catalogs |
| `catalog_management` | Product catalog CRUD |
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

---

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

### Token Refresh

Long-lived tokens expire after 60 days. Use `meta_debug_token` to check expiry, then refresh:

```bash
curl "https://graph.facebook.com/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=APP_ID&client_secret=APP_SECRET&\
fb_exchange_token=CURRENT_TOKEN"
```

> For permanent tokens, create a System User in Business Manager → System Users.

---

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
    ├── pages.ts          52 Facebook Page tools
    ├── instagram.ts      37 Instagram tools
    ├── ads.ts            62 Ads Manager tools
    ├── threads.ts        22 Threads tools
    ├── commerce.ts       10 Commerce/Catalog tools
    ├── conversions.ts     2 Conversions API tools
    ├── audiences.ts       5 Audience tools
    ├── insights.ts        4 Insight tools
    ├── charts.ts          2 Chart generation tools
    ├── ad_library.ts      1 Ad Library tool
    └── utility.ts         3 Utility tools
```

### Key Design Decisions

- **Dual API client** — Handles both `graph.facebook.com/v21.0` and `graph.threads.net/v1.0` with separate base URLs and tokens
- **Page token caching** — `meta_list_pages` caches page-scoped tokens; subsequent tools look them up by page ID
- **Two-step container publishing** — Instagram and Threads require container → publish flow; the server handles this automatically with video processing polling
- **Parallel carousel processing** — All carousel items created concurrently via `Promise.allSettled`; partial failures report which items succeeded
- **Zod strict schemas** — Every tool uses strict Zod schemas for type-safe parameter validation
- **Dual output format** — Every read tool supports `response_format: "markdown"` or `"json"`
- **Graceful auth** — Server starts without tokens, returns setup instructions on first tool call instead of crashing
- **Chart generation** — QuickChart integration for rendering data as PNG images for reports

---

## API Coverage

Targets **Meta Graph API v21.0** and **Threads API v1.0**.

| API | Status |
|:---|:---|
| Facebook Pages API | **Comprehensive** — posts, comments, messaging, insights, events, media, Stories, Reels, Live Video, automated responses |
| Instagram Graph API | **Comprehensive** — publishing, scheduling, comments, DMs, broadcast channels, hashtags, business discovery, insights |
| Marketing API | **Comprehensive** — campaigns, ad sets, ads, creatives, targeting, audiences, pixels, CAPI, A/B testing, Advantage+ |
| Threads API | **Comprehensive** — publishing (text, image, video, GIF, carousel, link), reply controls, location, insights |
| Commerce API | **Supported** — product catalog CRUD, product sets |
| Conversions API | **Supported** — server-side event tracking with test mode |
| Ad Library API | **Supported** — public transparency search |
| WhatsApp Business API | Not covered — separate infrastructure and token flow |

---

## Development

Use the same commands for local development and contribution checks:

```bash
npm install
npm test            # 52 tests
npm run build       # TypeScript compilation
npm run test:watch  # Development mode
```

Development conventions: Zod `.strict()` schemas, `response_format` parameter on read tools, and `errorResult()` for tool errors with `isError: true`.

---

<p align="center">
  <sub>Not affiliated with or endorsed by Meta Platforms, Inc.</sub>
</p>

---

<p align="center">
  <a href="https://www.buymeacoffee.com/oliverames">
    <img src="https://img.shields.io/badge/Buy_Me_a_Coffee-support-f5a542?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white" alt="Buy Me a Coffee">
  </a>
</p>

<p align="center">
  <sub>
    Built by <a href="https://ames.consulting">Oliver Ames</a> in Vermont
    &bull; <a href="https://github.com/oliverames">GitHub</a>
    &bull; <a href="https://linkedin.com/in/oliverames">LinkedIn</a>
    &bull; <a href="https://bsky.app/profile/oliverames.bsky.social">Bluesky</a>
  </sub>
</p>
