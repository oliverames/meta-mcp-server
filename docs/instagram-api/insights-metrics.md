# Instagram Insights API — Complete Metric Reference

Source: Meta Instagram Graph API v21.0+

## Account-Level Insights (`/{ig_user_id}/insights`)

### Interaction Metrics (metric_type=total_value or time_series)

| Metric | Description |
|---|---|
| `accounts_engaged` | Accounts that interacted with content (estimated) |
| `comments` | Comments on posts, reels, videos, live videos |
| `follows_and_unfollows` | Accounts that followed and unfollowed |
| `likes` | Likes on posts, reels, and videos |
| `profile_links_taps` | Taps on business address, call, email, text buttons |
| `reach` | Unique accounts that saw content at least once (estimated) |
| `replies` | Replies received from stories |
| `reposts` | Reposts of posts, stories, reels, and videos |
| `saves` | Saves of posts, reels, and videos |
| `shares` | Shares of posts, stories, reels, videos, and live videos |
| `total_interactions` | Total interactions across all media types |
| `views` | Times content was played or displayed |
| `impressions` | Times content was on screen (**deprecated v22.0+, April 2025**) |

### Demographic Metrics (metric_type=total_value)

| Metric | Description | Breakdowns |
|---|---|---|
| `engaged_audience_demographics` | Demographics of engaged audience | age, city, country, gender |
| `follower_demographics` | Demographics of followers | age, city, country, gender |
| `reached_audience_demographics` | Demographics of reached audience | age, city, country, gender |
| `online_followers` | Followers currently online (requires 100+ followers) | — |

### Available Breakdowns for Interaction Metrics

- `contact_button_type`: BOOK_NOW, CALL, DIRECTION, EMAIL, INSTANT_EXPERIENCE, TEXT, UNDEFINED
- `follow_type`: FOLLOWER, NON_FOLLOWER, UNKNOWN
- `media_product_type`: AD, FEED, REELS, STORY

### Available Timeframes for Demographic Metrics

`last_14_days`, `last_30_days`, `last_90_days`, `prev_month`, `this_month`, `this_week`

---

## Media-Level Insights (`/{media_id}/insights`)

### Photo & Carousel Posts

| Metric | Description |
|---|---|
| `reach` | Unique accounts that saw the content (estimated) |
| `likes` | Number of likes |
| `comments` | Number of comments |
| `shares` | Number of shares |
| `saved` | Number of saves |
| `total_interactions` | Sum of likes, saves, comments, shares |
| `follows` | New followers from this media |
| `profile_visits` | Profile visits from this media |
| `profile_activity` | Profile actions taken (breakdown: action_type) |
| `views` | Total views |
| `impressions` | Total times seen (**deprecated v22.0+**) |

### Reels & Videos

| Metric | Description |
|---|---|
| `reach` | Unique accounts that saw the content (estimated) |
| `likes` | Number of likes |
| `comments` | Number of comments |
| `shares` | Number of shares |
| `saved` | Number of saves |
| `total_interactions` | Sum of likes, saves, comments, shares |
| `follows` | New followers from this media |
| `profile_visits` | Profile visits from this media |
| `profile_activity` | Profile actions taken (breakdown: action_type) |
| `views` | Total views |
| `ig_reels_avg_watch_time` | Average watch time per view |
| `ig_reels_video_view_total_time` | Total watch time including replays |
| `impressions` | Total times seen (**deprecated v22.0+**) |
| `plays` | Number of plays (**deprecated v22.0+**) |
| `clips_replays_count` | Number of replays (**deprecated v22.0+**) |
| `ig_reels_aggregated_all_plays_count` | Total plays including replays (**deprecated v22.0+**) |

### Stories

| Metric | Description |
|---|---|
| `reach` | Unique accounts that saw the story (estimated) |
| `shares` | Number of shares |
| `follows` | New followers from this story |
| `profile_visits` | Profile visits from this story |
| `profile_activity` | Profile actions taken (breakdown: action_type) |
| `replies` | Total replies (0 for EU/Japan users) |
| `navigation` | Navigation actions (breakdown: story_navigation_action_type) |
| `total_interactions` | Sum of interactions |
| `views` | Total views |
| `impressions` | Total times seen (**deprecated v22.0+**) |

### Story Navigation Action Types

`SWIPE_FORWARD`, `TAP_BACK`, `TAP_EXIT`, `TAP_FORWARD`

### Profile Activity Action Types

`BIO_LINK_CLICKED`, `CALL`, `DIRECTION`, `EMAIL`, `OTHER`, `TEXT`

---

## Limitations

- **Follower requirement**: `follower_count` and `online_followers` require 100+ followers
- **Story metrics**: Only available for 24 hours; less than 5 values returns an error
- **Demographic metrics**: Return top 45 performers only
- **Data delay**: Up to 48 hours
- **Album metrics**: Not available for media within albums
- **Data retention**: Up to 2 years
