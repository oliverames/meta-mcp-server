# Marketing API - Overview

Source: https://developers.facebook.com/docs/marketing-api/overview

The Marketing API is a Meta business tool for automating advertising across Meta technologies.

## Structure

### Campaign (highest level)
- Represents a single objective (e.g., drive Page post engagement)
- Setting the objective enforces validation on child ads

### Ad Set
- Groups of ads with shared targeting, budget, billing, optimization goal, and duration
- Create one ad set per target audience
- Controls: budget, schedule, bidding, audience targeting

### Ad Creative
- Visual elements of the ad (immutable once created)
- Stored in creative library for reuse

### Ad
- Contains all information to display ad on Facebook, Instagram, Messenger, WhatsApp
- Links to ad creative
- Create multiple ads per ad set for delivery optimization

## Ad Components Alignment

| Component | Campaign | Ad Set | Ad |
|---|---|---|---|
| Objective | ✓ | | |
| Schedule | | ✓ | |
| Budget | | ✓ | |
| Bidding | | ✓ | |
| Audience | | ✓ | |
| Ad Creative | | | ✓ |

## Related Documentation
- [Get Started](https://developers.facebook.com/docs/marketing-api/get-started)
- [Ad Creative](https://developers.facebook.com/docs/marketing-api/creative)
- [Bidding](https://developers.facebook.com/docs/marketing-api/bidding)
- [Ad Rules Engine](https://developers.facebook.com/docs/marketing-api/ad-rules)
- [Audiences](https://developers.facebook.com/docs/marketing-api/audiences)
- [Insights API](https://developers.facebook.com/docs/marketing-api/insights)
- [API Reference](https://developers.facebook.com/docs/marketing-api/reference)
- [Rate Limiting](https://developers.facebook.com/docs/marketing-api/overview/rate-limiting)
- [Versioning](https://developers.facebook.com/docs/marketing-api/overview/versioning)
