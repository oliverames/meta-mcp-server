# Threads API - Overview

Source: https://developers.facebook.com/docs/threads/overview

The Threads API enables people to create and publish content on Threads.
Accessible via `graph.threads.com` or `graph.threads.net`.

## Rate Limiting
`Calls within 24 hours = 4800 * Number of Impressions`
Minimum impressions value: 10

CPU time limits:
- `720000 * number_of_impressions` for total_cputime
- `2880000 * Number of Impressions` for total_time

### Posts
- 250 API-published posts per 24-hour moving period
- Carousels count as single post
- Enforced on `POST /{threads-user-id}/threads_publish`
- Check usage: `GET /{threads-user-id}/threads_publishing_limit?fields=quota_usage,config`

### Replies
- 1,000 replies per 24-hour moving period
- Check usage: `GET /{threads-user-id}/threads_publishing_limit?fields=reply_quota_usage,reply_config`

### Deletion
- 100 deletions per 24-hour moving period
- Check usage: `GET /{threads-user-id}/threads_publishing_limit?fields=delete_quota_usage,delete_config`

### Location Search
- 500 location searches per 24-hour moving period
- Requires `threads_basic` and `threads_location_tagging` permissions

## Image Specifications
- Format: JPEG, PNG
- Max file size: 8 MB
- Aspect ratio limit: 10:1
- Min width: 320, Max width: 1440
- Color space: sRGB

## Video Specifications
- Container: MOV or MP4
- Audio: AAC, 48khz max, mono or stereo
- Video: HEVC or H264, progressive scan
- Frame rate: 23-60 FPS
- Max resolution: 1920 horizontal pixels
- Max bitrate: 100 Mbps VBR
- Max duration: 300 seconds (5 minutes)
- Max file size: 1 GB

## Other Limitations
- Text posts: 500 characters max
- Carousel: 2-20 children

## Related Documentation
- [Get Started](https://developers.facebook.com/docs/threads/get-started)
- [Create Posts](https://developers.facebook.com/docs/threads/create-posts)
- [Retrieve and Discover Posts](https://developers.facebook.com/docs/threads/retrieve-and-discover-posts)
- [Retrieve and Manage Replies](https://developers.facebook.com/docs/threads/retrieve-and-manage-replies)
- [Delete Posts](https://developers.facebook.com/docs/threads/posts/delete-posts)
- [Profiles](https://developers.facebook.com/docs/threads/threads-profiles)
- [Insights](https://developers.facebook.com/docs/threads/insights)
- [Webhooks](https://developers.facebook.com/docs/threads/webhooks)
- [Reference](https://developers.facebook.com/docs/threads/reference)
