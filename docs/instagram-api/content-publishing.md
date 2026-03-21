# Instagram Content Publishing

The Instagram Graph API uses a two-step container-based flow for publishing content: first create a media container, then publish it.

## Limitations

- **Image format**: JPEG only
- **Not supported**: Shopping tags, branded content tags, Instagram filters
- **Rate limit**: 100 API-published posts per 24-hour rolling window (across all media types)
- **Container expiry**: Containers expire after 24 hours if not published

## Publishing Flow

### Step 1: Create a Container

```
POST /{ig-user-id}/media
```

**Parameters (Single Image):**

| Parameter | Description |
|-----------|-------------|
| `image_url` | URL of the image (JPEG only) |
| `caption` | Caption text |
| `alt_text` | Alt text for accessibility (since March 2025) |
| `location_id` | Page ID of a location |
| `user_tags` | Array of tagged users with positions |

**Parameters (Reels):**

| Parameter | Description |
|-----------|-------------|
| `media_type` | `REELS` |
| `video_url` | URL of the video |
| `caption` | Caption text |
| `share_to_feed` | Boolean, whether to share to feed |
| `collaborators` | Array of collaborator usernames |
| `cover_url` | URL for custom cover image |
| `audio_name` | Name for the audio clip |
| `thumb_offset` | Thumbnail offset in milliseconds |

**Parameters (Stories):**

| Parameter | Description |
|-----------|-------------|
| `media_type` | `STORIES` |
| `image_url` or `video_url` | Media URL |

### Step 2: Publish the Container

```
POST /{ig-user-id}/media_publish
```

| Parameter | Description |
|-----------|-------------|
| `creation_id` | The container ID from step 1 |

### Example

```bash
# Step 1: Create container
curl -X POST "https://graph.facebook.com/v22.0/{ig-user-id}/media" \
  -d "image_url=https://example.com/photo.jpg" \
  -d "caption=Hello world" \
  -d "alt_text=A photo of a sunset" \
  -d "access_token={access-token}"

# Step 2: Publish
curl -X POST "https://graph.facebook.com/v22.0/{ig-user-id}/media_publish" \
  -d "creation_id={container-id}" \
  -d "access_token={access-token}"
```

## Container Status

Check the status of a container before publishing:

```
GET /{ig-container-id}?fields=status_code
```

| Status | Description |
|--------|-------------|
| `EXPIRED` | Container expired (24h limit) |
| `ERROR` | Container creation failed |
| `FINISHED` | Ready to publish |
| `IN_PROGRESS` | Still processing (retry later) |
| `PUBLISHED` | Already published |

If `ERROR`, check `status` field for details including the error subcode and message.

## Carousel Posts

Carousel posts support up to 10 images or videos (or a mix).

### Step 1: Create Item Containers

Create individual containers for each item. Do **not** include a `caption` on item containers.

```bash
# Image item
curl -X POST "https://graph.facebook.com/v22.0/{ig-user-id}/media" \
  -d "image_url=https://example.com/photo1.jpg" \
  -d "is_carousel_item=true" \
  -d "access_token={access-token}"

# Video item
curl -X POST "https://graph.facebook.com/v22.0/{ig-user-id}/media" \
  -d "video_url=https://example.com/video1.mp4" \
  -d "media_type=VIDEO" \
  -d "is_carousel_item=true" \
  -d "access_token={access-token}"
```

### Step 2: Create Carousel Container

```bash
curl -X POST "https://graph.facebook.com/v22.0/{ig-user-id}/media" \
  -d "media_type=CAROUSEL" \
  -d "caption=My carousel" \
  -d "children={item-container-id-1},{item-container-id-2}" \
  -d "access_token={access-token}"
```

### Step 3: Publish

```bash
curl -X POST "https://graph.facebook.com/v22.0/{ig-user-id}/media_publish" \
  -d "creation_id={carousel-container-id}" \
  -d "access_token={access-token}"
```

**Note**: All carousel images are cropped to the aspect ratio of the first image.

## Resumable Uploads

For large files, use resumable uploads via `rupload.facebook.com`:

1. Initialize the upload session
2. Upload file data in chunks
3. Use the returned handle as the media source in container creation

This avoids timeouts when uploading large video files.

## Trial Reels

Trial Reels let creators test content with non-followers before deciding to share broadly.

```bash
curl -X POST "https://graph.facebook.com/v22.0/{ig-user-id}/media" \
  -d "media_type=REELS" \
  -d "video_url=https://example.com/video.mp4" \
  -d "caption=Testing this reel" \
  -d "trial_params={\"graduation_strategy\":\"manual\"}" \
  -d "access_token={access-token}"
```

The `graduation_strategy` controls how the trial reel transitions to a regular post.

## Content Publishing Limit

Check your remaining publish quota:

```
GET /{ig-user-id}/content_publishing_limit
```

Returns the current usage against the 100-post/24-hour limit.

## Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{ig-user-id}/media` | POST | Create a media container |
| `/{ig-user-id}/media_publish` | POST | Publish a container |
| `/{ig-container-id}?fields=status_code` | GET | Check container status |
| `/{ig-user-id}/content_publishing_limit` | GET | Check publishing quota |
