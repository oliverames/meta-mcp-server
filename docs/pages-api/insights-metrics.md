# Facebook Page Insights — Complete Metric Reference

Source: Meta Graph API v21.0 — /{page_id}/insights endpoint

## Page Impressions

| Metric | Description | Periods |
|---|---|---|
| `page_impressions` | Total page impressions | day, week, days_28 |
| `page_impressions_unique` | Unique users who saw page content | day, week, days_28 |
| `page_impressions_organic` | Organic (non-paid) impressions | day, week, days_28 |
| `page_impressions_organic_unique` | Unique organic impressions | day, week, days_28 |
| `page_impressions_paid` | Paid impressions | day, week, days_28 |
| `page_impressions_paid_unique` | Unique paid impressions | day, week, days_28 |
| `page_impressions_viral` | Viral impressions (from shares) | day, week, days_28 |
| `page_impressions_viral_unique` | Unique viral impressions | day, week, days_28 |
| `page_impressions_nonviral` | Non-viral impressions | day, week, days_28 |
| `page_impressions_nonviral_unique` | Unique non-viral impressions | day, week, days_28 |

## Post Impressions (aggregate across all page posts)

| Metric | Description | Periods |
|---|---|---|
| `page_posts_impressions` | Total post impressions | day, week, days_28 |
| `page_posts_impressions_unique` | Unique post impressions | day, week, days_28 |
| `page_posts_impressions_organic` | Organic post impressions | day, week, days_28 |
| `page_posts_impressions_organic_unique` | Unique organic post impressions | day, week, days_28 |
| `page_posts_impressions_paid` | Paid post impressions | day, week, days_28 |
| `page_posts_impressions_paid_unique` | Unique paid post impressions | day, week, days_28 |
| `page_posts_impressions_viral` | Viral post impressions | day, week, days_28 |
| `page_posts_impressions_viral_unique` | Unique viral post impressions | day |
| `page_posts_impressions_nonviral` | Non-viral post impressions | day, week, days_28 |
| `page_posts_impressions_nonviral_unique` | Unique non-viral post impressions | day, week, days_28 |
| `page_posts_served_impressions_organic_unique` | Organic unique served | day, week, days_28 |

## Engagement

| Metric | Description | Periods |
|---|---|---|
| `page_engaged_users` | Unique users who engaged | day, week, days_28 |
| `page_post_engagements` | Post engagement (clicks, reactions, comments, shares) | day, week, days_28 |
| `page_total_actions` | Total clicks on page (website, phone, directions) | day, week, days_28 |
| `page_negative_feedback` | Hides, spam reports, unlikes | day, week, days_28 |
| `page_lifetime_engaged_followers_unique` | Unique engaged followers (lifetime) | day |
| `page_media_view` | Video/photo views | day |

## Reactions

| Metric | Description | Periods |
|---|---|---|
| `page_actions_post_reactions_total` | Total reactions on page posts | day |
| `page_actions_post_reactions_like_total` | Like reactions | day |
| `page_actions_post_reactions_love_total` | Love reactions | day |
| `page_actions_post_reactions_wow_total` | Wow reactions | day |
| `page_actions_post_reactions_haha_total` | Haha reactions | day |
| `page_actions_post_reactions_sorry_total` | Sad reactions | day |
| `page_actions_post_reactions_anger_total` | Angry reactions | day |

## Fans & Followers

| Metric | Description | Periods |
|---|---|---|
| `page_fans` | Total page likes (lifetime) | day |
| `page_fan_adds` | New page likes | day |
| `page_fan_adds_unique` | Unique new page likes | day |
| `page_fan_adds_by_paid_non_paid_unique` | New likes by paid vs organic | day |
| `page_fan_removes` | Page unlikes | day |
| `page_fan_removes_unique` | Unique page unlikes | day |
| `page_daily_follows` | New followers | day |
| `page_daily_follows_unique` | Unique new followers | day |
| `page_daily_unfollows_unique` | Unique unfollows | day |
| `page_follows` | Total follows (lifetime) | day |

## Demographics (lifetime only)

| Metric | Description | Returns |
|---|---|---|
| `page_fans_city` | Fans by city | Object: { "city_name": count } |
| `page_fans_country` | Fans by country | Object: { "US": count, "GB": count } |
| `page_fans_gender_age` | Fans by gender and age | Object: { "M.25-34": count } |
| `page_fans_locale` | Fans by locale | Object: { "en_US": count } |

## Page Views

| Metric | Description | Periods |
|---|---|---|
| `page_views_total` | Total page views | day, week, days_28 |
| `page_tab_views_login_top` | Top tab views (logged-in users) | day, week |
| `page_tab_views_login_top_unique` | Unique top tab views | day, week |
| `page_tab_views_logout_top` | Top tab views (logged-out users) | day |

## Video

| Metric | Description | Periods |
|---|---|---|
| `page_video_views` | Total video views (3s+) | day, week, days_28 |
| `page_video_views_unique` | Unique video views | day, week, days_28 |
| `page_video_views_paid` | Paid video views | day, week, days_28 |
| `page_video_views_organic` | Organic video views | day, week, days_28 |
| `page_video_views_autoplayed` | Autoplay video views | day, week, days_28 |
| `page_video_views_click_to_play` | Click-to-play video views | day, week, days_28 |
| `page_video_views_by_paid_non_paid` | Views broken down by paid/organic | day |
| `page_video_views_by_uploaded_hosted` | Views by uploaded vs crossposted | day |
| `page_video_complete_views_30s` | 30-second complete views | day, week, days_28 |
| `page_video_complete_views_30s_unique` | Unique 30-second views | day, week, days_28 |
| `page_video_complete_views_30s_paid` | Paid 30-second views | day, week, days_28 |
| `page_video_complete_views_30s_organic` | Organic 30-second views | day, week, days_28 |
| `page_video_complete_views_30s_autoplayed` | Autoplay 30-second views | day, week, days_28 |
| `page_video_complete_views_30s_click_to_play` | Click-to-play 30-second views | day, week, days_28 |
| `page_video_complete_views_30s_repeat_views` | Repeat 30-second views | day |
| `page_video_repeat_views` | Total repeat video views | day, week, days_28 |
| `page_video_view_time` | Total time spent watching videos (ms) | day |
| `page_video_views_10s` | 10-second video views | day, week, days_28 |
| `page_video_views_10s_unique` | Unique 10-second views | day, week, days_28 |
| `page_video_views_10s_paid` | Paid 10-second views | day, week, days_28 |
| `page_video_views_10s_organic` | Organic 10-second views | day, week, days_28 |
| `page_video_views_10s_autoplayed` | Autoplay 10-second views | day, week, days_28 |
| `page_video_views_10s_click_to_play` | Click-to-play 10-second views | day, week, days_28 |
| `page_video_views_10s_repeat` | Repeat 10-second views | day |

## Video Monetization

| Metric | Description | Periods |
|---|---|---|
| `page_daily_video_ad_break_ad_impressions_by_crosspost_status` | Ad break impressions | day |
| `page_daily_video_ad_break_cpm_by_crosspost_status` | Ad break CPM | day |
| `page_daily_video_ad_break_earnings_by_crosspost_status` | Ad break earnings | day |

## Notes

- Metrics marked with `*` in Meta's docs are deprecated or may require special access
- `page_fans` is a lifetime metric — use `period: "day"` but it returns the total, not daily change
- Demographic metrics (`page_fans_city`, etc.) return objects, not numbers
- Video view counts use 3-second threshold by default
- Most metrics support day, week, and days_28 periods; some only support day
