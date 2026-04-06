# Worklog

## 2026-04-06 — 1Password CLI fallback for credential resolution

**What changed**: Added automatic 1Password CLI fallback to credential resolution at startup. When environment variables are not set, the server attempts to resolve them via `op read` from the Development vault before failing. Uses `execFileSync` (Node) or `exec.Command` (Go) for shell-safe execution with a 10s timeout. Silent no-op if 1Password CLI is unavailable. Updated README to document the integration with `op://` reference paths. Part of a broader session that also touched ynab-mcp-server, imagerelay-mcp-server, meta-mcp-server, sprout-mcp-server, and ames-unifi-mcp.

**Decisions made**: Used `execFileSync` instead of `execSync` to avoid shell injection surface (even though inputs are hardcoded string literals). Added the fallback as a separate `op-fallback.ts` module (TS servers) or inline helper (Go) rather than modifying the existing auth flow, keeping the env var path as primary (zero overhead) and 1Password as fallback only. Chose `op://Development/` vault paths matching existing 1Password item names where items exist; for servers without items yet (Meta, Sprout, UniFi), chose conventional names so items can be created later.

**Left off at**: Published and pushed. 1Password items still need to be created for Meta Access Token, Threads Access Token, Sprout API Token/OAuth Client, and UniFi Controller credentials. YNAB and ImageRelay items already exist. Also: 20 uncategorized YNAB transactions from this session's review were identified but not yet categorized.

**Open questions**: None.

---



## 2026-03-22 — v2.1.0: 18 bug fixes, 13 new tools (187 → 200), CAPI schema expansion

**What changed**: Comprehensive 10-iteration review of the entire MCP server codebase. Fixed 18 bugs (6 critical duplicate tool registrations that crashed the server, wrong API endpoints for Threads search and Instagram comment replies, double-stringified DM payloads, incorrect Facebook Reels upload flow, overly restrictive CAPI event enum). Added 13 new tools covering lead gen forms, offline conversions, minimum budgets, Threads followers/following, product feeds, Instagram shopping catalogs, and Facebook Places search. Expanded CAPI UserDataSchema from 7 to 19 fields and CustomDataSchema from 7 to 13 fields. Updated all documentation references from 187 to 200 tools. Fixed integration test EPIPE race condition. Updated GitHub repo description and topics.

**Decisions made**:
- Changed CAPI `event_name` from a restrictive 7-item enum to `z.string()` — the Meta API accepts any string including custom events, so the enum was incorrectly blocking valid usage.
- Kept annotation objects inline rather than adopting the `READ_ONLY_ANNOTATIONS` presets from utils.ts — the presets aren't used anywhere in the existing 187 tools, so adopting them for just 13 new tools would create inconsistency. Better as a separate cleanup PR.
- Didn't extract a shared helper for threads_get_followers/following — at ~30 lines each, the duplication is small enough that a helper would add more complexity than it removes.
- Left Graph API version at v21.0 — changing it could break things without testing against actual API responses.

**Left off at**: The server is feature-complete at 200 tools. Next steps would be: (1) bump version to 2.1.0 in package.json and publish to npm, (2) consider adding WhatsApp Business Platform tools (biggest remaining API gap per research), (3) the annotation preset adoption could be done as a bulk refactor across all 200 tools.

**Open questions**:
- Should Graph API version be bumped to v22.0 or v23.0? Would need to test for any breaking changes in field names or response formats.
- WhatsApp Business Platform has zero coverage — is this in scope for this server or a separate project?
- The `meta_search_places` endpoint (`/search?type=place`) may be deprecated in newer API versions — monitor for replacement.

---
