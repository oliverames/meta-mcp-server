# Graph API - Overview

Source: https://developers.facebook.com/docs/graph-api/overview

The Graph API is the primary way to get data into and out of the Facebook platform. It's an HTTP-based API composed of nodes, edges, and fields.

## Host URL
All requests are passed to `graph.facebook.com`.

## Access Tokens
Almost all Graph API endpoints require an access token. They allow your app to access a User's information without requiring their password and identify your app, the User, and permitted data access.

## Nodes
An individual object with a unique ID. Examples: User, Page, Post, Photo, Comment.

```
GET https://graph.facebook.com/USER-ID?access_token=ACCESS-TOKEN
```

## /me Endpoint
Translates to the object ID of the person or Page whose access token is being used.

## Edges
Connections between two nodes. Example: a User node can have photos connected to it.

```
GET https://graph.facebook.com/USER-ID/photos?access_token=ACCESS-TOKEN
```

## Fields
Node properties. Use the `fields` parameter to specify which fields to return:

```
GET https://graph.facebook.com/USER-ID?fields=id,name,email,picture&access_token=ACCESS-TOKEN
```

## Complex Parameters
- `list` type: JSON syntax `["firstitem", "seconditem"]`
- `object` type: JSON syntax `{"firstkey": "firstvalue", "secondKey": 123}`

## Publishing, Updating, and Deleting
- Publish: POST to an edge (e.g., `POST /{page-id}/feed`)
- Update: POST to a node (e.g., `POST /{user-id}?email=new@email.com`)
- Delete: DELETE on a node (e.g., `DELETE /{photo-id}`)

## Read-After-Write
For create/update endpoints, include `fields` parameter to get data back immediately.

## Webhooks
Subscribe to notifications about changes to nodes. See Webhooks documentation.

## Versions
Quarterly releases. Specify version in path: `https://graph.facebook.com/v21.0/...`

## Related Documentation
- [Get Started](https://developers.facebook.com/docs/graph-api/get-started)
- [Batch Requests](https://developers.facebook.com/docs/graph-api/batch-requests)
- [Error Handling](https://developers.facebook.com/docs/graph-api/guides/error-handling)
- [Field Expansion](https://developers.facebook.com/docs/graph-api/guides/field-expansion)
- [Rate Limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting)
- [Paginated Results](https://developers.facebook.com/docs/graph-api/results)
- [Reference](https://developers.facebook.com/docs/graph-api/reference)
