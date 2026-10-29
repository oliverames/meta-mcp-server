## 2026-10-29 - Recent-change release review

**What changed**: Reviewed and merged PR #11 (Page story edges) and #12 (Unix-second timestamps), retaining their regression tests. Main `05a0e94` builds and all 112 tests pass with one worker. An earlier loaded parallel run timed out three integration probes; the serial rerun passed unchanged. Registry delivery is owned by the full maintenance publication run.

**Left off at**: Remaining publication checks are recorded in the cross-project review handoff.

---

# Worklog

## 2026-10-28 - Prepare the security update for npm

**What changed**: Prepared package version 3.0.0 so kitchensync's publication stage can deliver the patched dependency, corrected Page tools and credential-isolated tests. The Node 18 to Node 20 minimum change is reflected in the major version. The existing desktop bundle remains a dated 2.0.2 artifact.

**Verification**: Build and package inventory passed. A real MCP initialize/tools-list probe reported version 3.0.0 and 200 tools with credential lookup unavailable in the child environment. Publication and receiving-version verification belong to the final kitchensync phase.

---

## 2026-10-28 - Isolate integration tests from live credentials

The MCP integration harness now launches the current Node executable with an empty child PATH and blank Meta, Threads and Sentry settings. This prevents the server's 1Password fallback from resolving live tokens during tests, fixing [#8](https://github.com/oliverames/meta-mcp-server/issues/8) without adding a production setting.

Verification used a harmless `op` canary that only recorded invocation and exited unsuccessfully. The same three entry-point tests passed before the fix with six canary invocations, then passed afterward with zero invocations on Node 26.12.1 and Node 20.20.2. No real credential lookup or Meta request was used.

## 2026-10-28 - Integrate the completed Page contributions

**What changed**: Integrated the top-level Page comment contribution from PR #2 and the cover-photo upload flow from PR #5, retaining both contributors' original commits and the current security fixes. The server now registers 200 tools. The cover update sends the photo ID as the scalar `cover` parameter, with `offset_y` and `no_feed_story` at the top level, matching Meta's [v21 Page reference](https://developers.facebook.com/docs/graph-api/reference/v21.0/page/). URL input uploads an unpublished Page photo first. The tool no longer advertises idempotence because that upload creates a photo.

**Decisions made**: The submitted cover patch nested `photo_id` inside `cover`, which disagreed with the documented contract. Corrected the request while retaining its upload flow. Resolved the comment branch's conflicts against the current 199-tool base, so its one addition produces 200 tools. Preserved both contributor-owned remote branches.

**Verification**: `npm run build` and 37 tests covering Page handlers, the MCP entry point and the existing contract regressions passed. Three new cover assertions failed against the previous implementation and pass with the fix. Tests used a failing `op` stub and an empty Sentry DSN; the Page requests were mocked, so live Meta acceptance remains unverified. No Page was changed by verification.

**Left off at**: Source verification is complete. Package version remains 2.0.2; this integration does not itself establish a new npm release or an installed-server update. Earlier release and operational questions remain below.

**Resolved this session**: [Issue #9](https://github.com/oliverames/meta-mcp-server/issues/9) tracks GHSA-rmxm-3fg6-px4f in the transitive Hono adapter. Oliver authorized security patches, so the compatible 2.1.5 adapter update is included and the declared minimum is now Node 20. The complete audit reports zero vulnerabilities, a clean locked install and build pass, and the MCP entry-point tests passed on Node 20.20.2 and Node 26.12.1. The README states the new minimum. Earlier package-publication and live Meta acceptance limits still apply.

---

## 2026-10-23 - Security review

**What changed**: `7b79005` stops `meta_list_pages` and `meta_get_page` from returning each Page's `access_token` when `response_format` is json; the tokens are still cached for the Page tools. `46b93b6` requires the chart tools' `output_path` to end in `.png`, checked before the chart is fetched, so a path taken from untrusted Page content cannot overwrite an arbitrary file. `71b3438` removes the unused annotation presets, the `ResponseFormat` enum, and the `PageInsight` type. `537c6b8` moves zod from 3.25.76 to 4.6.7 for GHSA-mrhx-c7xc-m3w5, which has no 3.x fix; the nine one-argument `z.record` schemas now name their string keys. `80178e9` moves `body-parser` to 2.4.0 for GHSA-27r3-jxmh-p828.

**Verification**: `npm run build` and 90 tests pass (three new), and `npm audit --omit=dev` reports 0 vulnerabilities. The integration tests ran with a stub `op` on `PATH` so the 1Password fallback stayed silent. A `tools/list` dump of all 199 tools matched the zod 3 build except `meta_send_instagram_media_message`, which zod 3 had listed with no properties and zod 4 lists correctly.

**Left off at**: Not published.

---

## 2026-10-23 - MCP SDK 1.32.1 and transitive security fixes

**What changed**: `0f54ebc` refreshed the lockfile to `@modelcontextprotocol/sdk` 1.32.1 and vitest 4.1.12. That clears `proxy-addr` (critical IP spoofing), the MCP SDK session-binding, OAuth redirect and request-size advisories, the `follow-redirects` credential leaks, and the `hono`, `ip-address`, `source-map-js`, vite and vitest advisories.

**Verification**: Build and 87 tests pass, and `npm audit` reports 0 vulnerabilities. No package was published.

**Left off at**: Contributor PRs #2 and #5 remain open and untouched.

---

## 2026-10-07 - GitHub Issue Review Closeout

**What changed**: Reviewed all 2 open issues against source at `7bab82594f36` and their complete issue history. No issue qualified for closure.

**Decisions made**: Close completed implementations even when device acceptance remains, and close testing-only tasks under Oliver's explicit instruction. Keep unresolved defects, missing implementation, release work, and owner decisions open.

**Left off at**: Resolved this session: issue assignment and state reconciliation. GitHub was independently re-read on October 7, 2026 at 10:20 AM EDT. All 3 repository issues include Oliver as an assignee, with 2 open. Source paths and cited lines were checked. No runtime tests, deployment, or application changes were performed. This is one part of the account-wide review.

**Open questions**: Still open: [#1](https://github.com/oliverames/meta-mcp-server/issues/1), [#4](https://github.com/oliverames/meta-mcp-server/issues/4). Other previously recorded operational follow-ups retain their dated status. No new issue was needed for this review.

---

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
