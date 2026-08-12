# Failure Modes

| Failure | Handling |
|---|---|
| Invalid or missing API key | Health returns 503; no writes attempted |
| MCP session not initialized/expired | Client initializes sequentially and recreates failed session promises |
| Rate limit 429 | REST client respects `Retry-After` and exponential backoff |
| Policy or risk violation | Execution blocked and audited before simulation |
| Simulation revert | Broadcast blocked and audited |
| Duplicate/retried write | Stable idempotency key binds the intent |
| Pending execution | Poll until terminal state or explicit timeout |
| Workflow `system_error`/`cancelled` | Any status other than `success` is failure |
| Paywalled notification action | Alerts derived from node results and written to local audit/dashboard |
| Risk action absent | Deterministic local evaluator used and disclosed |
| Marketplace schema mismatch | Exact 422 recorded; canonical chain slug applied |
| Store corruption | Parsing/shape errors fail closed |
| Audit tampering | Verification returns the first broken entry and reason |

