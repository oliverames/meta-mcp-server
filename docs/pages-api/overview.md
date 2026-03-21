# Facebook Pages API - Overview

Source: https://developers.facebook.com/docs/pages-api/overview

The Pages API is a set of Facebook Graph API endpoints that apps can use to create and manage a Page's settings and content.

## Components

### Access Tokens
API authentication is handled through Access Tokens. Most endpoints require Page access tokens, which are unique to each Page, app User, and app. Get tokens from app Users by implementing Facebook Login for Business.

### Features
Some endpoints require a Feature approved through App Review before your app can use them live.

### Mentions
@mentions allows your Page to publicly reply to a specific person who has posted on your Page or commented on a Page post.

### Page-Scoped User IDs (PSID)
Users who interact with Pages are identified by PSIDs — unique to each User-Page pair. Used by Pages API and Messenger Platform endpoints.

### Permissions
Most endpoints require permissions granted through Facebook Login. All permissions require App Review before live use.

## Tasks

| Task | Permitted Actions |
|------|-------------------|
| ADVERTISE | Create ads, create unpublished Page Posts |
| ANALYZE | View Insights, view which admin published a post |
| CREATE_CONTENT | Publish content as the Page |
| MANAGE | Assign and manage Page tasks |
| MANAGE_LEADS | View and manage leads |
| MESSAGING | Send messages as the Page |
| MODERATE | Respond to/delete comments, manage IG content |
| VIEW_MONETIZATION_INSIGHTS | View monetization insights |

## Rate Limits
All Pages endpoint requests are subject to Rate Limiting. Check app's current call count in the App Dashboard.

## How It Works
1. Get a User Access Token from app user through Facebook Login for Business
2. Query `/me/accounts` to get Page ID and Page Access Token
3. Capture returned Page ID and Page Access Token
4. Use the ID and token to query the Page node

## Related Documentation
- [Get Started Guide](https://developers.facebook.com/docs/pages/getting-started)
- [Page Endpoint Reference](https://developers.facebook.com/docs/graph-api/reference/page)
- [Permissions Reference](https://developers.facebook.com/docs/permissions#p)
- [Webhooks for Pages](https://developers.facebook.com/docs/pages-api/webhooks-for-pages)
- [Posts](https://developers.facebook.com/docs/pages-api/posts)
- [Comments and @Mentions](https://developers.facebook.com/docs/pages-api/comments-mentions)
- [Insights](https://developers.facebook.com/docs/platforminsights/page)
- [Pages Search](https://developers.facebook.com/docs/pages-api/search-pages)
