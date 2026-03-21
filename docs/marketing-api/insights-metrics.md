# Marketing API Insights — Complete Metric Reference

Source: Meta Marketing API v21.0

## Requested via INSIGHT_FIELDS constant

All ad insight tools (account, campaign, ad set, ad) request these fields by default:

### Performance Metrics

| Field | Description |
|---|---|
| `impressions` | Total number of times ads were on screen |
| `reach` | Number of unique people who saw ads |
| `clicks` | Total clicks (links, CTAs, and other) |
| `unique_clicks` | Number of unique people who clicked |
| `unique_impressions` | Number of unique people who saw ads |
| `frequency` | Average number of times each person saw your ad |
| `spend` | Total amount spent (dollar string, NOT cents) |

### Cost Metrics

| Field | Description |
|---|---|
| `cpm` | Cost per 1,000 impressions |
| `cpc` | Cost per click |
| `cpp` | Cost per 1,000 people reached |
| `ctr` | Click-through rate as percentage (e.g., "2.5" = 2.5%) |
| `cost_per_action_type` | Array of {action_type, value} — cost per each action type |
| `cost_per_conversion` | Array — cost per conversion event |
| `cost_per_inline_link_click` | Cost per inline link click |
| `cost_per_outbound_click` | Cost per outbound click |
| `cost_per_thruplay` | Cost per ThruPlay (video watched to completion or 15s+) |

### Engagement Metrics

| Field | Description |
|---|---|
| `actions` | Array of {action_type, value} — all tracked actions |
| `inline_link_clicks` | Clicks on links within the ad |
| `inline_link_click_ctr` | CTR for inline link clicks (percentage) |
| `inline_post_engagement` | Total post engagement (likes, comments, shares, etc.) |
| `outbound_clicks` | Clicks that take people off Meta-owned properties |
| `outbound_clicks_ctr` | CTR for outbound clicks (percentage) |
| `social_spend` | Amount spent on social context (shown to friends of fans) |

### Conversion Metrics

| Field | Description |
|---|---|
| `conversions` | Array of {action_type, value} — conversion events |
| `conversion_values` | Array — monetary value of conversions |
| `purchase_roas` | Array — return on ad spend for purchase events |

### Video Metrics

| Field | Description |
|---|---|
| `video_play_actions` | Array — number of video plays |
| `video_avg_time_watched_actions` | Array — average seconds of video watched |
| `video_thruplay_watched_actions` | Array — ThruPlays (video to completion or 15s+) |
| `video_p25_watched_actions` | Array — views reaching 25% of video |
| `video_p50_watched_actions` | Array — views reaching 50% of video |
| `video_p75_watched_actions` | Array — views reaching 75% of video |
| `video_p95_watched_actions` | Array — views reaching 95% of video |
| `video_p100_watched_actions` | Array — views reaching 100% of video |

### Quality Metrics

| Field | Description |
|---|---|
| `quality_ranking` | Ad quality ranking vs. competing ads (ABOVE_AVERAGE, AVERAGE, etc.) |
| `engagement_rate_ranking` | Expected engagement rate ranking |
| `conversion_rate_ranking` | Expected conversion rate ranking |

### Available Breakdowns

`age`, `gender`, `country`, `region`, `device_platform`, `publisher_platform`, `impression_device`, `placement`

### Available Date Presets

`today`, `yesterday`, `this_week_sun_today`, `this_week_mon_today`, `last_week_sun_sat`, `last_week_mon_sun`, `last_7d`, `last_14d`, `last_28d`, `last_30d`, `last_90d`, `this_month`, `last_month`, `this_quarter`, `last_3d`

## Notes

- **Spend, CPM, CPC, CPP** are returned as dollar strings (e.g., "12.50"), NOT cents
- **CTR** is returned as a percentage string (e.g., "2.5" means 2.5%)
- **Action arrays** contain `{action_type: string, value: string}` objects
- **Quality rankings** are categorical: ABOVE_AVERAGE, AVERAGE, BELOW_AVERAGE_10, BELOW_AVERAGE_20, BELOW_AVERAGE_35
