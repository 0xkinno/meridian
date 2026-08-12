# KeeperHub Integration Findings

This file records discrepancies and integration friction observed while building Meridian. Timestamps use UTC.

## 2026-08-11 — MCP session initialization is mandatory

- Manual pattern attempted: send `tools/list` directly to `POST /mcp` with bearer authentication.
- Observed response: HTTP 400, JSON-RPC error `-32003`, reason `session_not_initialized`.
- Server guidance: send `initialize`, then `notifications/initialized`, sequentially, before `tools/list` or `tools/call`.
- Required headers discovered: `Mcp-Protocol-Version` and the returned `Mcp-Session-Id` on subsequent requests.
- Meridian fix: implemented the MCP 2025-06-18 initialization handshake and cached the issued session for subsequent tool operations.
- Proposed documentation improvement: replace the direct `tools/list` example with the full three-step session handshake and show session expiration/reinitialization behavior.

## 2026-08-11 — Workflow Web3 action identifiers changed

- Manual identifiers rejected with `INVALID_ACTION_CONFIG`: `web3/check-native-balance` and `web3/transfer-native`.
- Live schemas from `list_action_schemas` use `web3/check-balance`, `web3/check-token-balance`, `web3/transfer-funds`, and `web3/transfer-token`.
- ERC20 actions now require a JSON-stringified `tokenConfig`, rather than a bare `tokenAddress` field.
- Meridian fix: composers consume the live schema identifiers and serialize custom token selection as required.
- Proposed documentation improvement: generate workflow examples directly from the versioned `list_action_schemas` response and clearly mark identifier migrations.

## 2026-08-11 — Send Webhook is plan-gated

- A structurally valid workflow containing `webhook/send-webhook` was rejected with HTTP 402, code `upgrade_required`, requiring the Pro plan.
- Meridian fallback: use KeeperHub's built-in `HTTP Request` system action for webhook-compatible POST notifications, preserving observable notification behavior on the current organization plan.
- Proposed documentation improvement: label plan-gated actions in `list_action_schemas` and include free-plan equivalents where available.

## 2026-08-11 — Marketplace chain uses canonical payment/data slugs

- Passing testnet chain ID `"84532"` to `list_workflow` returned HTTP 422 `INVALID_CHAIN`.
- Exact guidance returned: use a supported chain id, canonical slug such as `"base"`, or `"multi-chain"`.
- Meridian fix: listings targeting Base Sepolia use the marketplace data-chain slug `"base"` while workflow execution remains pinned to chain ID `84532`.

## 2026-08-11 — Transaction risk action absent from live catalog

- `list_action_schemas` returned no `web3/assess-transaction-risk` action.
- This was not a 402; the action identifier is absent entirely from the current catalog.
- Meridian fallback: deterministic local checks for testnet allowlist, recipient format, amount format/cap, and recent execution frequency. The result is logged before every simulation.
- Proposed documentation improvement: publish availability/version metadata for optional actions and distinguish unavailable from plan-gated.

## 2026-08-11 — Batch Read Contract is available on the free tier

- `web3/batch-read-contract` created, deep-validated, and executed without 402.
- Execution `mnjxe7tl88swpcrvfcum1` completed two Base Sepolia USDC `balanceOf` calls in one Multicall3 operation.
- Deep validation emitted a warning-only low-confidence ABI match for the proxy token; both runtime calls succeeded.

## 2026-08-11 — Marketplace pricing requires unlisted state

- Live MCP documentation states price cannot change while a workflow is listed.
- Working sequence: initial list to reserve slug → unlist → `update_workflow_listing` price → relist → verify.
- Listing `meridian-base-usdc-monitor-9bfbd747` was priced at `0.05` USDC/call.
- An unpaid call returned the expected x402 v2 challenge with Base USDC settlement terms.

## 2026-08-12 — Public listing pages use `/workflows/{listedSlug}`

- The guessed dashboard route `/marketplace/{listedSlug}` returns HTTP 404 even when the listing is live.
- The canonical public page `https://app.keeperhub.com/workflows/{listedSlug}` returns HTTP 200.
- Meridian now constructs listing links through `canonicalMarketplaceUrl()` and verifies the authoritative `listedSlug` and price returned by `get_workflow_listing`.
- The publisher also enables the workflow before listing so the lifecycle is consistently: enable → list → unlist for pricing → price → relist → verify.
