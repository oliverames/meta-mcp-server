# Meta API — Undocumented & Lesser-Known Endpoints Research

Last updated: 2026-03-20

## Newly Available Endpoints (2025-2026)

### Reels & Story Metrics (Dec 2025)
- `reels_skip_rate` — % of viewers who skip within first 3 seconds
- `repost_count` — Individual media reposts
- `account_repost_count` — Account-level reposts
- `crossposted_views` — Total views across Instagram and Facebook
- `facebook_views` — Facebook-specific views for crossposted content

### Threads API Expansions (2025-2026)
- **GIF Support** (Feb 27, 2026) — `POST /{user-id}/threads` with GIPHY GIFs
- **oEmbed Without Token** (Mar 3, 2026) — `GET /ig_permalink?fields=media_type,media_url`
- **App Ads Support** (Feb 17, 2026) — Threads ad creation enabled
- **Location Tagging** — In content creation
- **Reply Restrictions** — Control who can reply to posts

### Campaign Management (v25-v26)
- `placement_soft_opt_out` — Allocate up to 5% spend to excluded placements for better performance
- `migrate_to_advantage_plus` — Transition legacy campaigns to Advantage+ keeping campaign IDs
- `lookalike_spec` (mandatory Jan 6, 2026) — Required for new lookalike audience creation

## Business Manager Tier-2 APIs
- `POST /{parent-business-id}/child_businesses` — Create/manage child Business Manager accounts
- Hierarchical structure for agencies managing multiple clients

## Instagram Broadcast Channels (Emerging)
- One-to-many messaging with subscriber management
- Guest collaboration, clickable links, polls, prompts, timed notifications
- Metrics: subscriber growth, reach/opens, poll participation, link clicks

## Deprecated / Changing (Plan For)
- **Post Reach Metrics** → Replaced by "Media Views" / "Media Viewers" (deprecated June 2026)
- **Graph API v19** → Removed May 21, 2026
- **Graph API v20** → Removed Sep 24, 2026
- **ASC/AAC Campaigns** → Deprecated in favor of Advantage+ (v26.0, Sep 2026)
- **Instagram DM API** → Rate limit reduced from 5,000 to 200 calls/hour
- **mTLS webhook certificates** → Changing from DigiCert to Meta CA (March 31, 2026)

## NOT Recommended
- Reverse-engineered private APIs (instagrapi, threads-re, etc.) — legal risk, account bans
- Any unofficial endpoints violating ToS
