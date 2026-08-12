# KeeperHub Integration

Meridian authenticates REST calls with a server-only organization `kh_` key and verifies it through `GET /api/keys`. It retrieves the organization execution wallet from `GET /api/user`.

MCP uses JSON-RPC 2.0 over HTTP with protocol `2025-06-18`: `initialize`, session ID capture, `notifications/initialized`, then tools calls. REST creates workflows; MCP enables, validates, lists, prices and verifies them.

Every direct write is simulated with the same arguments before the broadcast call. Every write includes an idempotency key and is polled until `completed` or `failed`. Workflow success requires terminal status `success`, not merely absence of `error`.

See `KEEPERHUB-FINDINGS.md` for live API discrepancies and fixes.

