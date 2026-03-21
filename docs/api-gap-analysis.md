# Meta Graph API — Gap Analysis & Feature Roadmap

Last updated: 2026-03-20

## Implemented in This Round

| Feature | Priority | Status |
|:---|:---|:---|
| Conversions API (CAPI) | Critical | Added — `meta_send_conversion_event`, `meta_test_conversion_events` |
| Facebook Stories | High | Added — `meta_publish_page_story` |
| Facebook Live Video | High | Added — `meta_create_live_video`, `meta_get_live_videos`, `meta_end_live_video` |
| Instagram Scheduled Posts | High | Added — `scheduled_publish_time` param on publish tools |
| Instagram Comment Hiding | High | Added — `meta_hide_instagram_comment` |
| Business Manager Assets | Medium | Added — `meta_list_business_assets` |
| Chart Generation | Medium | Added — `meta_generate_chart`, `meta_generate_comparison_chart` |

## Not Supported by Meta's API

These cannot be implemented — Meta doesn't expose the endpoints:

| Feature | Reason |
|:---|:---|
| Facebook Groups API | Deprecated April 2024 (spam prevention) |
| Instagram Profile Updates | Bio, username, website, picture all read-only |
| Instagram Product Tag Creation | Read-only via API |
| Story Highlights Management | Not available in API |
| Post Pinning/Unpinning | Not available in API |
| Page Milestones | Endpoint removed |
| Page Offers/Promotions | Endpoint removed |
| Profanity Filter / Keyword Blocks | UI-only in Business Suite |

## Future Considerations

| Feature | Priority | Notes |
|:---|:---|:---|
| Branded Content / Partnership Ads | Medium | `/{page-id}/partner_assets` — growing feature for creator partnerships |
| Instagram Shopping / Full Catalog | Low | Complex, requires Commerce permissions |
| Page Role Management | Low | Read-only / limited write via API |
