# Marketing API: Insights

Retrieve performance metrics for ad accounts, campaigns, ad sets, and ads.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /act_{ad-account-id}/insights` | Account-level insights |
| `GET /{campaign-id}/insights` | Campaign-level insights |
| `GET /{adset-id}/insights` | Ad set-level insights |
| `GET /{ad-id}/insights` | Ad-level insights |

## Level Parameter

Use the `level` parameter to aggregate data at a different level than the endpoint:

```bash
# Get ad-level data from the account endpoint
curl -s "https://graph.facebook.com/v22.0/act_{ad-account-id}/insights?level=ad&fields=ad_name,impressions,clicks&access_token={access-token}"
```

Valid values: `ad`, `adset`, `campaign`, `account`

## Attribution Windows

Control the attribution window with `action_attribution_windows`:

| Window | Description |
|--------|-------------|
| `1d_click` | 1-day click-through |
| `7d_click` | 7-day click-through (default) |
| `1d_view` | 1-day view-through |

```bash
curl -s "https://graph.facebook.com/v22.0/{campaign-id}/insights?fields=actions&action_attribution_windows=['1d_click','7d_click']&access_token={access-token}"
```

## Field Expansion

Request insights inline when fetching objects:

```bash
curl -s "https://graph.facebook.com/v22.0/act_{ad-account-id}/campaigns?fields=name,insights{impressions,clicks,spend}&access_token={access-token}"
```

## Sorting

Sort results with the `sort` parameter:

```bash
curl -s "https://graph.facebook.com/v22.0/act_{ad-account-id}/insights?level=campaign&fields=campaign_name,reach&sort=reach_descending&access_token={access-token}"
```

Format: `{field}_{direction}` where direction is `ascending` or `descending`.

## Filtering

### By Ad Labels

```bash
curl -s "https://graph.facebook.com/v22.0/act_{ad-account-id}/insights?level=ad&filtering=[{\"field\":\"ad.adlabels\",\"operator\":\"ANY\",\"value\":[\"Label Name\"]}]&fields=impressions&access_token={access-token}"
```

### Deleted and Archived Objects

By default, insights exclude deleted/archived objects. Include them with `effective_status`:

```bash
curl -s "https://graph.facebook.com/v22.0/act_{ad-account-id}/insights?level=campaign&filtering=[{\"field\":\"campaign.effective_status\",\"operator\":\"IN\",\"value\":[\"ACTIVE\",\"PAUSED\",\"DELETED\",\"ARCHIVED\"]}]&fields=impressions&access_token={access-token}"
```

## Clicks: link_click vs clicks

| Metric | Description |
|--------|-------------|
| `actions` with `action_type=link_click` | Clicks on links in the ad that lead to destinations (on or off Facebook) |
| `clicks` | All clicks including link clicks, likes, comments, shares, and other interactions |

## Breakdowns

Segment data by demographics or delivery dimensions:

```bash
curl -s "https://graph.facebook.com/v22.0/{campaign-id}/insights?fields=impressions,clicks&breakdowns=age,gender&access_token={access-token}"
```

Common breakdowns: `age`, `gender`, `country`, `region`, `publisher_platform`, `platform_position`, `device_platform`, `impression_device`

**Note**: Not all breakdown combinations are valid. Some breakdowns cannot be combined with each other.

## Date Ranges

```bash
curl -s "https://graph.facebook.com/v22.0/{campaign-id}/insights?time_range={\"since\":\"2024-01-01\",\"until\":\"2024-01-31\"}&fields=impressions,spend&access_token={access-token}"
```

Or use `date_preset`: `today`, `yesterday`, `last_7d`, `last_30d`, `this_month`, `last_month`, `lifetime`

## Async Jobs

For large result sets, use asynchronous report runs:

```bash
# Create an async job
curl -X POST "https://graph.facebook.com/v22.0/act_{ad-account-id}/insights" \
  -d "level=ad" \
  -d "fields=impressions,clicks,spend" \
  -d "breakdowns=age,gender" \
  -d "access_token={access-token}"

# Response includes a report_run_id
# Poll for completion:
curl -s "https://graph.facebook.com/v22.0/{report-run-id}?access_token={access-token}"

# When async_percent_completion = 100, fetch results:
curl -s "https://graph.facebook.com/v22.0/{report-run-id}/insights?access_token={access-token}"
```

## Rate Limiting and Timeouts

- Insights API has its own rate limits separate from the general Graph API
- Large queries may time out; use async jobs for heavy reports
- If you receive a timeout error, reduce the date range or number of fields/breakdowns
- Use `time_increment` to split results by day (`time_increment=1`) or month (`time_increment=monthly`) for better performance
