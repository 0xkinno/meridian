# Security

- Secrets remain in ignored `.env.local` and server-only modules.
- No private keys, direct RPC signers or client-side KeeperHub calls exist.
- Execution chains are allowlisted to Base Sepolia and Ethereum Sepolia.
- Local policies cap transfer amounts and validate addresses, intervals and strategy-specific configuration.
- Local risk checks add execution-frequency limits before simulation.
- Simulation blocks broadcasts that fail or would revert.
- Idempotency keys protect retried writes from duplicate transactions.
- Explorer receipts and KeeperHub receipt verification are preserved in durable records.
- Audit-chain verification detects record mutation or deletion/reordering.

