# Marketing API: Audiences

Create and manage audiences for ad targeting on Meta platforms.

## Audience Types

### Custom Audiences

Build audiences from your own data sources:

| Source | Description |
|--------|-------------|
| **CRM / Customer List** | Upload hashed emails, phone numbers, or other identifiers |
| **Website** | Users who visited your site (requires Meta Pixel) |
| **Mobile App** | Users who took actions in your app (requires App Events) |
| **Engagement** | Users who interacted with your content on Meta platforms |
| **Offline** | Users from offline conversion data |

#### Create a Custom Audience (Customer List)

```bash
curl -X POST "https://graph.facebook.com/v22.0/act_{ad-account-id}/customaudiences" \
  -d "name=My Customer List" \
  -d "subtype=CUSTOM" \
  -d "customer_file_source=USER_PROVIDED_ONLY" \
  -d "access_token={access-token}"
```

#### Create a Website Custom Audience

```bash
curl -X POST "https://graph.facebook.com/v22.0/act_{ad-account-id}/customaudiences" \
  -d "name=Website Visitors Last 30 Days" \
  -d "subtype=WEBSITE" \
  -d "rule={\"inclusions\":{\"operator\":\"or\",\"rules\":[{\"event_sources\":[{\"id\":\"{pixel-id}\",\"type\":\"pixel\"}],\"retention_seconds\":2592000,\"filter\":{\"operator\":\"and\",\"filters\":[{\"field\":\"url\",\"operator\":\"i_contains\",\"value\":\"shop\"}]}}]}}" \
  -d "access_token={access-token}"
```

### Lookalike Audiences

Find users similar to an existing Custom Audience:

```bash
curl -X POST "https://graph.facebook.com/v22.0/act_{ad-account-id}/customaudiences" \
  -d "name=Lookalike - Top Customers" \
  -d "subtype=LOOKALIKE" \
  -d "origin_audience_id={custom-audience-id}" \
  -d "lookalike_spec={\"type\":\"similarity\",\"country\":\"US\",\"ratio\":0.01}" \
  -d "access_token={access-token}"
```

The `ratio` field (0.01 to 0.20) controls audience size: smaller ratios = more similar to source.

### Dynamic Audiences

Automatically updated audiences based on app or website signals. Users are added/removed as they meet or stop meeting the audience rules.

## Targeting Options

When creating ad sets, specify targeting with the `targeting` parameter:

### Demographics

```json
{
  "targeting": {
    "age_min": 25,
    "age_max": 45,
    "genders": [1],
    "locales": [6]
  }
}
```

### Location

```json
{
  "targeting": {
    "geo_locations": {
      "countries": ["US", "GB"],
      "cities": [{"key": "2420379", "radius": 10, "distance_unit": "mile"}],
      "regions": [{"key": "3847"}]
    },
    "excluded_geo_locations": {
      "cities": [{"key": "2512345"}]
    }
  }
}
```

### Interests and Behaviors

```json
{
  "targeting": {
    "interests": [{"id": "6003139266461", "name": "Cooking"}],
    "behaviors": [{"id": "6002714895372", "name": "Frequent Travelers"}]
  }
}
```

### Life Events

```json
{
  "targeting": {
    "life_events": [{"id": "6002714398172", "name": "Recently moved"}]
  }
}
```

## Special Ad Categories

Ads related to housing, employment, or credit must declare their category and face restricted targeting:

```bash
curl -X POST "https://graph.facebook.com/v22.0/act_{ad-account-id}/campaigns" \
  -d "name=Housing Campaign" \
  -d "special_ad_categories=[\"HOUSING\"]" \
  -d "objective=OUTCOME_LEADS" \
  -d "access_token={access-token}"
```

Restrictions for special categories:
- No age, gender, or zip code targeting
- Minimum 15-mile radius for location targeting
- Limited interest and behavior targeting

Valid categories: `HOUSING`, `EMPLOYMENT`, `CREDIT`, `ISSUES_ELECTIONS_POLITICS`

## Reach Estimate API

Estimate the potential audience size for a targeting spec:

```bash
curl -s "https://graph.facebook.com/v22.0/act_{ad-account-id}/reachestimate?targeting_spec={\"geo_locations\":{\"countries\":[\"US\"]},\"age_min\":25,\"age_max\":45}&access_token={access-token}"
```

Returns `users_lower_bound` and `users_upper_bound`.

## Audience Rules

Rules define inclusion/exclusion criteria for custom audiences. They use a JSON structure with operators:

| Operator | Description |
|----------|-------------|
| `or` | Match any rule |
| `and` | Match all rules |
| `i_contains` | Case-insensitive contains |
| `eq` | Equals |
| `gt` / `lt` | Greater than / less than |

Rules support `retention_seconds` to control how long users stay in the audience after qualifying.
