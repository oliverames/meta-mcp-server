# Instagram Platform - Overview

Source: https://developers.facebook.com/docs/instagram-platform/overview

The Instagram Platform is a collection of APIs for Instagram professional accounts (businesses and creators).

## Two API Configurations

| Instagram API with Facebook Login | Instagram API with Instagram Login |
|---|---|
| IG accounts linked to Facebook Page | IG accounts with Instagram-only presence |
| Users log in with Facebook credentials | Users log in with Instagram credentials |
| Base URL: graph.facebook.com | Base URL: graph.instagram.com |

## Features Comparison

| Feature | Instagram Login | Facebook Login |
|---|---|---|
| Comment moderation | ✓ | ✓ |
| Content publishing | ✓ | ✓ |
| Hashtag search | ✗ | ✓ |
| Insights | ✓ | ✓ |
| Mentions | ✓ | ✓ |
| Messaging | ✓ | via Messenger Platform |
| Product tagging | ✗ | ✓ |
| Partnership Ads | ✗ | ✓ |

## Permissions (Facebook Login)
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_comments`
- `instagram_manage_insights`
- `instagram_manage_messages`
- `pages_show_list`
- `pages_read_engagement`
- Human Agent feature
- Instagram Public Content Access feature

## Permissions (Instagram Login)
- `instagram_business_basic`
- `instagram_business_content_publish`
- `instagram_business_manage_comments`
- `instagram_business_manage_messages`
- Human Agent feature

## Page Tasks → Permissions Mapping

| Task in UI | API Task Name | Grantable Permissions |
|---|---|---|
| Ads | PROFILE_PLUS_ADVERTISE | instagram_basic |
| Content | PROFILE_PLUS_CREATE_CONTENT | instagram_basic, instagram_content_publish |
| Full control | PROFILE_PLUS_FULL_CONTROL | instagram_basic, instagram_content_publish |
| Insights | PROFILE_PLUS_ANALYZE | instagram_basic, instagram_manage_insights |
| Messages | PROFILE_PLUS_MESSAGING | instagram_basic, instagram_manage_messages |
| Community Activity | PROFILE_PLUS_MODERATE | instagram_basic, instagram_manage_comments |

## Rate Limiting
`Calls within 24 hours = 4800 * Number of Impressions`

Business Discovery and Hashtag Search are subject to Platform Rate Limits.

### Messaging Rate Limits
- Conversations API: 2 calls/sec per IG account
- Private Replies (Live): 100 calls/sec
- Private Replies (Posts/Reels): 750 calls/hour
- Send API (text): 100 calls/sec
- Send API (audio/video): 10 calls/sec

## Content Publishing
Two-step container flow: create container → publish.
Supports: single images, videos, reels, carousels.
CDN URLs are privacy-aware and expire when content is deleted.

## Comment Moderation
Get comments, reply, delete, hide/unhide, disable/enable comments.
Identify media where IG account has been @mentioned.

## Related Documentation
- [API Reference](https://developers.facebook.com/docs/instagram-platform/reference)
- [Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing)
- [Comment Moderation](https://developers.facebook.com/docs/instagram-platform/comment-moderation)
- [Insights](https://developers.facebook.com/docs/instagram-platform/insights)
- [Webhooks](https://developers.facebook.com/docs/instagram-platform/webhooks)
