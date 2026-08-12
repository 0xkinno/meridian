# Audit Chain

Each entry contains `seq`, ISO timestamp, event type, structured payload, previous hash and SHA-256 hash. The genesis previous hash is 64 zeroes.

```text
hash = SHA256(seq + ts + type + JSON(payload) + prevHash)
```

The logger verifies the complete existing chain before appending, serializes concurrent appends, writes one JSON object per line, and flushes the file handle. `GET /api/audit` and the Audit page return the entries plus verification result.

