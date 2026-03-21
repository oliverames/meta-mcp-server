# Threads API: Insights

Retrieve engagement metrics for individual media objects and user-level analytics.

## Permissions Required

- `threads_basic`
- `threads_manage_insights`

## Media Insights

```
GET /{threads-media-id}/insights
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `views` | Number of times the post was viewed |
| `likes` | Number of likes |
| `replies` | Number of replies |
| `reposts` | Number of reposts |
| `quotes` | Number of quote posts |
| `shares` | Number of shares |

### Example

```bash
curl -s "https://graph.threads.net/v1.0/{threads-media-id}/insights?metric=views,likes,replies,reposts,quotes,shares&access_token={access-token}"
```

### Response

```json
{
  "data": [
    {
      "name": "views",
      "period": "lifetime",
      "values": [{ "value": 1520 }],
      "title": "Views",
      "id": "{threads-media-id}/insights/views/lifetime"
    },
    {
      "name": "likes",
      "period": "lifetime",
      "values": [{ "value": 42 }],
      "title": "Likes",
      "id": "{threads-media-id}/insights/likes/lifetime"
    }
  ]
}
```

## User Insights

```
GET /{threads-user-id}/threads_insights
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `views` | Total profile views |
| `likes` | Total likes received |
| `replies` | Total replies received |
| `reposts` | Total reposts received |
| `quotes` | Total quote posts received |
| `clicks` | Link clicks |
| `followers_count` | Total follower count (not time-series) |
| `follower_demographics` | Breakdown of followers by attribute |

### Time-Series Queries

Use `since` and `until` parameters (Unix timestamps) for time-range queries:

```bash
curl -s "https://graph.threads.net/v1.0/{threads-user-id}/threads_insights?metric=views,likes&since=1712991600&until=1713078000&access_token={access-token}"
```

**Important**: `since`/`until` parameters do not return data from before **April 13, 2024** (Unix timestamp `1712991600`). Queries with `since` before this date will return empty results.

### Follower Count

`followers_count` is a snapshot metric, not a time-series. Do not use `since`/`until` with it:

```bash
curl -s "https://graph.threads.net/v1.0/{threads-user-id}/threads_insights?metric=followers_count&access_token={access-token}"
```

### Follower Demographics

Requires a minimum of **100 followers**. Use the `breakdown` parameter:

| Breakdown | Description |
|-----------|-------------|
| `country` | Follower distribution by country |
| `city` | Follower distribution by city |
| `age` | Follower distribution by age range |
| `gender` | Follower distribution by gender |

```bash
curl -s "https://graph.threads.net/v1.0/{threads-user-id}/threads_insights?metric=follower_demographics&breakdown=country&access_token={access-token}"
```

### Response (Demographics)

```json
{
  "data": [
    {
      "name": "follower_demographics",
      "period": "lifetime",
      "title": "Follower demographics",
      "total_value": {
        "breakdowns": [
          {
            "dimension_keys": ["country"],
            "results": [
              { "dimension_values": ["US"], "value": 3400 },
              { "dimension_values": ["GB"], "value": 850 }
            ]
          }
        ]
      }
    }
  ]
}
```
