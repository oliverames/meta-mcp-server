# Meta Graph API — Write/Management Operations Coverage Audit

Last updated: 2026-03-20

## Coverage Summary

| Feature | API Supported | Implemented | Notes |
|:---|:---:|:---:|:---|
| **Page Profile Picture** | Yes | Yes | `meta_update_page_picture` |
| **Page Cover Photo** | Yes | Yes | `meta_update_page_cover` |
| **Page About/Description** | Yes | Yes | `meta_update_page` |
| **Page Website/Phone/Email** | Yes | Yes | `meta_update_page` |
| **Page Username** | Yes | Yes | `meta_update_page` (username field) |
| **Page Category** | Yes | Yes | `meta_update_page` (category field) |
| **Page Address** | Yes | Yes | `meta_update_page` (contact_address field) |
| **Page Business Hours** | Yes | Yes | `meta_update_page` (hours field) |
| **Comment Hiding** | Yes | Yes | `meta_hide_comment` |
| **Comment Deletion** | Yes | Yes | `meta_delete_comment` |
| **Post Scheduling** | Yes | Yes | `meta_create_post` (scheduled_publish_time) |
| **Post CRUD** | Yes | Yes | Full create/read/update/delete |
| **Page Messaging** | Yes | Yes | `meta_send_page_message` |
| **Page Webhooks** | Yes | Yes | `meta_subscribe_page_webhooks` |
| **Block/Unblock Users** | Yes | Yes | `meta_block_user` |

## Not Supported by Meta's API

These features cannot be implemented because Meta's Graph API does not expose them:

| Feature | Status |
|:---|:---|
| Instagram Profile Picture Update | Read-only in API |
| Instagram Bio Update | Read-only in API |
| Instagram Username Update | Read-only in API |
| Instagram Website Update | Read-only in API |
| Instagram Product Tag Creation | Read-only in API |
| Instagram Tagged Content Approval | Not available in API |
| Instagram Story Highlights | Not available in API |
| Post Pinning/Unpinning | Not available in API |
| Page Milestones | Endpoint removed |
| Page Offers/Promotions | Endpoint removed |
| Page Role Management | Read-only / limited write |
| Set Page CTA Button | Unclear / undocumented write |
