# Access Tokens

Meta APIs use OAuth 2.0 access tokens for authentication. Different token types grant different levels of access.

## Token Types

| Type | Description |
|------|-------------|
| **User Token** | Represents a logged-in user; most common token type |
| **App Token** | Represents the app itself; used for app-level operations |
| **Page Token** | Represents a Facebook Page; used for Page API calls |
| **Client Token** | Embedded in client apps; limited access scope |
| **System User Token** | For server-to-server Business Manager integrations |

## Token Lifetimes

| Token | Lifetime |
|-------|----------|
| Short-lived User Token | ~1-2 hours |
| Long-lived User Token | ~60 days |
| App Token | Does not expire |
| Page Token (from long-lived user token) | Does not expire |
| Client Token | Does not expire |
| Marketing API long-lived (standard access) | Does not expire by time |

**Important**: Token length is variable. Use variable-length storage (e.g., `TEXT` not `VARCHAR(255)`).

## Exchange Short-Lived for Long-Lived Token

```bash
curl -s "https://graph.facebook.com/v22.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id={app-id}&\
client_secret={app-secret}&\
fb_exchange_token={short-lived-token}"
```

Response:

```json
{
  "access_token": "{long-lived-token}",
  "token_type": "bearer",
  "expires_in": 5184000
}
```

## App Access Token

```bash
curl -s "https://graph.facebook.com/v22.0/oauth/access_token?\
client_id={app-id}&\
client_secret={app-secret}&\
grant_type=client_credentials"
```

Or use the format `{app-id}|{app-secret}` directly as the token (less secure, not recommended for production).

## Page Access Token

Get Page tokens for all Pages the user manages:

```bash
curl -s "https://graph.facebook.com/v22.0/{user-id}/accounts?access_token={user-access-token}"
```

Response:

```json
{
  "data": [
    {
      "access_token": "{page-access-token}",
      "category": "Software",
      "name": "My Page",
      "id": "123456789"
    }
  ]
}
```

If the user token is long-lived, the resulting Page tokens **do not expire**.

## Client Token

Found in the App Dashboard under **Settings > Advanced > Security > Client Token**.

Client tokens are meant for embedding in native mobile or desktop apps. They provide limited access and should be combined with the app ID:

```
{app-id}|{client-token}
```

## Debugging Tokens

Inspect any token to see its metadata:

```bash
curl -s "https://graph.facebook.com/v22.0/debug_token?input_token={token-to-inspect}&access_token={app-id}|{app-secret}"
```

Response includes: `app_id`, `type`, `expires_at`, `is_valid`, `scopes`, `user_id`.

## Token Refresh Strategy

1. Store the long-lived token securely
2. Before it expires (~60 days), exchange it for a new long-lived token using the same endpoint
3. If the token has expired, the user must re-authenticate via the OAuth flow
4. Page tokens derived from long-lived user tokens do not need refreshing
