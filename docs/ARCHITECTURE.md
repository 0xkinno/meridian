# Architecture

Meridian is a Next.js 14 App Router application with server-side KeeperHub integration. API routes never expose the organization key. Strategy definitions are persisted in JSON, evaluated by deterministic rules, composed into versioned KeeperHub graphs, and associated with provider workflow identifiers.

Writes flow through: local risk assessment → KeeperHub simulation → idempotent execution → terminal-state polling → receipt recording → audit-chain append. Workflow executions use KeeperHub's background execution API and long-poll endpoint. Reads and writes are presented through the same execution ledger.

The storage layer uses serialized writes and atomic replacement for JSON collections. The audit file is JSONL and append-only with an `fsync` after every entry.

