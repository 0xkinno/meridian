# MERIDIAN — Continue from Phase 3

## Context
Phase 1 and Phase 2 are complete. Phase 3 was blocked by KeeperHub returning HTTP 402 `upgrade_required` for `webhook/send-webhook` and HTTP Request actions. These are paywalled on the free tier.

## The Fix: Remove Webhook/Notification Actions from KeeperHub Workflows

This is NOT a simplification. This is a stronger architecture. Here is why:

KeeperHub's webhook action is a convenience feature. Our own codebase already has a SHA-256 hash-chained audit log that captures every decision, simulation, execution, and result. The dashboard displays all alerts, statuses, and execution history. Routing alerts through our own system instead of KeeperHub's paywalled webhook gives us:
- Full control over alert content and formatting
- Tamper-evident audit trail (KeeperHub's webhook has no audit chain)
- No plan dependency for a supplementary feature
- A stronger "reliability and observability" score because we built the observability ourselves

## What Changes in Workflow Composition

Every workflow composer that previously had a notification branch on the FALSE side of a condition node now either:
1. Ends the workflow on the FALSE branch (condition evaluates, FALSE path has no downstream action, workflow completes with the condition result logged)
2. OR adds a second Web3 read action on the FALSE branch (e.g., re-read the balance to confirm) that provides data our API layer can use for alerting

**The core execution path is unchanged:** Trigger → Check Balance → Condition → Transfer (on TRUE branch). This is what judges care about. The transfer executes onchain through KeeperHub. That is the point.

Our API layer (Next.js API routes) handles the alert logic AFTER the workflow completes:
- Poll execution status via `GET /api/workflows/executions/{executionId}/wait`
- Read per-node results from the execution response
- If the condition was FALSE (insufficient balance, drift below threshold, etc.), log an alert entry to the audit chain
- The dashboard shows these alerts in the execution timeline with clear status indicators

## Revised Workflow Structures

### Scheduled Payment Workflow (4 nodes, 3 edges)
```
Trigger(Schedule) → CheckERC20Balance → Condition(balance >= amount) → TransferERC20
```
- Trigger: `triggerType: "Schedule"`, `scheduleCron: "0 * * * *"` (hourly)
- CheckERC20Balance: `actionType: "web3/check-erc20-balance"`, reads sender's token balance
- Condition: `actionType: "Condition"`, expression: `{{@check-balance:Check Balance.balance}} >= 0.01`
- TransferERC20: `actionType: "web3/transfer-erc20"`, sends tokens to recipient

The FALSE branch of the condition has NO downstream node. The workflow simply completes. Our API layer reads the execution result, sees the condition was FALSE, and logs "Insufficient balance" to the audit chain. The dashboard shows this as a skipped execution.

Edge from condition to transfer uses `sourceHandle: "true"`. There is NO edge with `sourceHandle: "false"` because there is no FALSE target node.

### DCA Workflow (4 nodes, 3 edges)
```
Trigger(Schedule) → CheckNativeBalance → Condition(balance >= buy amount) → TransferNative
```
- Same pattern. On TRUE: transfer executes (simulating a DCA buy). On FALSE: workflow ends, API logs the skip.

### Yield Monitor Workflow (3 nodes, 2 edges)
```
Trigger(Schedule) → CheckERC20Balance(protocol position) → ReadContract(check rewards)
```
- This is read-only. No transfer. No condition needed. Reads protocol data. Our API layer evaluates whether harvest is worthwhile based on the read results.

### Portfolio Rebalance Check Workflow (3 nodes, 2 edges)
```
Trigger(Schedule) → CheckNativeBalance → CheckERC20Balance
```
- Read-only. Reads ETH and token balances. Our API layer computes drift and flags rebalance needed.

## CRITICAL: Workflow Schema Rules (from instruction.md, repeated here for emphasis)

1. `abi` field MUST be `JSON.stringify()`'d — a raw array causes 422
2. `functionArgs` MUST be a JSON-stringified positional ARRAY — `"[\"0xabc\",\"100\"]"` not `"[{\"to\":\"0xabc\"}]"`
3. `gasLimitMultiplier` MUST be a string — `"1.5"` not `1.5`
4. `network` MUST be a string chain ID — `"84532"` not `84532`
5. `triggerType` MUST be Pascal-case — `"Schedule"` not `"schedule"` or `"cron"`
6. Condition nodes have `type: "action"` with `actionType: "Condition"` and a SINGLE JS expression string — NOT a structured `{logicalOperator, conditions}` object
7. Condition edges MUST have `sourceHandle: "true"` or `sourceHandle: "false"`
8. Transfer recipient field is `recipientAddress` — NOT `to`
9. `create_workflow` requires BOTH `nodes` AND `edges` in the same call
10. Workflows are created DISABLED by default — you must enable after creation
11. `GET /api/keys` is the auth probe (200 = valid) — NOT `GET /api/chains` (public, answers regardless)
12. Organization wallet from `GET /api/user` → `walletAddress` — NOT the login wallet

## Phase 3: Resume Now

### Step 3.1 — Update the workflow composers

Rewrite `src/lib/strategies/composer.ts` to produce workflows WITHOUT webhook/notification actions. Follow the revised structures above exactly. Each composer function returns `{ nodes, edges }` with only Web3 actions and conditions.

For the payment workflow composer specifically:

```typescript
export function composeScheduledPaymentWorkflow(strategy: Strategy): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  const nodes: WorkflowNode[] = [
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 0, y: 250 },
      data: {
        type: 'trigger',
        label: `Every ${strategy.config.interval || 'hour'}`,
        config: {
          triggerType: 'Schedule',
          scheduleCron: intervalToCron(strategy.config.interval || 'hourly'),
        },
      },
    },
    {
      id: 'check-balance',
      type: 'action',
      position: { x: 280, y: 250 },
      data: {
        type: 'action',
        label: 'Check Balance',
        config: {
          actionType: 'web3/check-balance',
          network: String(strategy.config.chainId),
          address: strategy.config.senderAddress,
        },
      },
    },
    {
      id: 'condition-balance',
      type: 'action',
      position: { x: 560, y: 250 },
      data: {
        type: 'action',
        label: 'Sufficient Balance',
        config: {
          actionType: 'Condition',
          condition: `{{@check-balance:Check Balance.balance}} >= ${strategy.config.amount}`,
        },
      },
    },
    {
      id: 'transfer',
      type: 'action',
      position: { x: 840, y: 200 },
      data: {
        type: 'action',
        label: 'Send Payment',
        config: {
          actionType: 'web3/transfer-funds',
          network: String(strategy.config.chainId),
          recipientAddress: strategy.config.recipientAddress,
          amount: strategy.config.amount,
        },
      },
    },
  ];

  const edges: WorkflowEdge[] = [
    { id: 'e-trigger-balance', source: 'trigger', target: 'check-balance' },
    { id: 'e-balance-condition', source: 'check-balance', target: 'condition-balance' },
    {
      id: 'e-condition-transfer',
      source: 'condition-balance',
      target: 'transfer',
      sourceHandle: 'true',
    },
    // NO false-branch edge — workflow ends on FALSE, our API handles the alert
  ];

  return { nodes, edges };
}
```

For native token transfers (DCA), use `actionType: "web3/transfer-funds"` with NO tokenAddress.
For ERC20 transfers (payments), if tokenAddress is provided, use `actionType: "web3/transfer-erc20"` with `tokenAddress` in the config.
For balance checks, use `actionType: "web3/check-balance"` for native or `actionType: "web3/check-erc20-balance"` with `tokenAddress` for ERC20.

Write all four composers: `composeScheduledPaymentWorkflow`, `composeDCAWorkflow`, `composeYieldMonitorWorkflow`, `composeRebalanceCheckWorkflow`.

### Step 3.2 — Create the workflow creation API route

`src/app/api/strategies/[id]/workflow/route.ts` — POST handler that:
1. Reads the strategy from the store
2. Runs the policy engine (must pass)
3. Calls the appropriate composer to build nodes + edges
4. Creates the workflow on KeeperHub via `POST /api/workflows/create`
5. Stores the returned `workflowId` and `slug` on the strategy
6. Logs `WORKFLOW_CREATED` to the audit chain
7. Returns the workflow ID and slug

### Step 3.3 — Test with a real workflow

Create a workflow on KeeperHub by calling the API route. Verify:
- The workflow appears in KeeperHub at `app.keeperhub.com`
- The nodes and edges are correct
- No 422 or validation errors

If KeeperHub returns errors, document them in `docs/KEEPERHUB-FINDINGS.md` with the exact error message and how you fixed it. This documentation qualifies for the onboarding bounty.

### Step 3.4 — Add alert handling in the execution layer

When our API layer polls a workflow execution and finds that the condition node returned FALSE:
- Extract the condition result from the per-node execution data
- Log an `ALERT_INSUFFICIENT_BALANCE` (or similar) entry to the audit chain with the actual balance and required amount
- Store the alert in the execution record so the dashboard can show it

This replaces the webhook notification with something better: a tamper-evident, locally verifiable alert record that the dashboard renders.

## Phase 4: Execute Real Onchain Transactions

After Phase 3 workflows are creating successfully, proceed to Phase 4 as defined in the main instruction.md.

### Step 4.1 — Direct Execution: Zero-Value Self-Transfer

This is the FIRST real transaction. It proves the entire execution path works with zero funding because Base Sepolia gas is sponsored.

```typescript
// In the execution route or a test script:
const walletAddress = await getWalletAddress(); // from GET /api/user

const params = {
  chainId: 84532, // Base Sepolia
  recipientAddress: walletAddress, // self-transfer
  amount: '0', // zero value — still lands a real mined tx
};

// 1. Simulate
const sim = await simulateTransfer(params);
// sim.success should be true, sim.wouldRevert should be false

// 2. Execute
const exec = await executeTransfer(params, crypto.randomUUID());

// 3. Poll
const result = await pollExecutionStatus(exec.executionId);
// result.status should be 'completed'
// result.transactionHash is the REAL tx hash
// result.transactionLink is the BaseScan link
```

**CRITICAL:** A zero-value self-transfer is a REAL, MINED, INDEPENDENTLY VERIFIABLE transaction. The relayer pays the gas via sponsorship. The organization wallet needs zero ETH. This is documented in KeeperHub's headless onboarding guide and is the recommended first transaction.

### Step 4.2 — Workflow Execution

Execute one of the workflows created in Phase 3:

```typescript
const exec = await executeWorkflow(workflowId);
const result = await waitForWorkflowExecution(exec.executionId);
// result.transactionHashes contains tx hashes from any write actions
```

### Step 4.3 — Record All Transactions

Every transaction must be recorded in the verified transactions table in README.md:

| # | What | Network | Chain ID | Transaction | KeeperHub Execution ID | Type |
|---|------|---------|----------|-------------|----------------------|------|
| 1 | Zero-value self-transfer (path proof) | Base Sepolia | 84532 | `0x...` (link to basescan) | `...` | Direct Execution |
| 2 | Workflow execution | Base Sepolia | 84532 | `0x...` or N/A if read-only | `...` | Workflow Execution |

## Phase 5: Risk Assessment & Batch Read

Continue as defined in main instruction.md. Use `web3/check-balance` for batch reads across multiple addresses. If `web3/batch-read-contract` is available on the free tier (test it), use it. If it returns 402, fall back to sequential balance checks and document the finding.

For risk assessment, use `web3/assess-transaction-risk` if available on free tier. If paywalled, implement a local risk evaluator that checks:
- Amount vs policy cap
- Recipient address validation
- Chain allowlist
- Recent execution frequency (rate limiting)
Document whichever path you take.

## Phase 6: Marketplace

Test `list_workflow` via MCP. If marketplace listing is paywalled on the free tier, document the finding in `KEEPERHUB-FINDINGS.md` and note it as a limitation in the README under "Honest Disclosures." Prepare the listing code so it works if the feature is available — do not skip the implementation, just handle the 402 gracefully.

## Phase 7: Dashboard UI

Build the full UI as specified in the main instruction.md Section 11. Every design rule applies. Key pages:

1. **Dashboard home** — KeeperHub status, strategy overview, recent executions, wallet display
2. **Strategies list** — all strategies with status indicators
3. **Strategy detail** — config, workflow ID, execution history for this strategy
4. **Create strategy** — stepped form for all 4 types
5. **Executions** — timeline of all executions with tx links
6. **Audit trail** — log viewer with chain verification
7. **Marketplace** — listing manager (shows listing status or "available on Pro" if paywalled)

Design system rules from instruction.md Section 11 are NON-NEGOTIABLE:
- No Tailwind. CSS Modules only.
- Warm off-white background (#FAFAF8), not dark mode
- Copper accent (#B5722E) only — one accent color
- Serif display font for headings, sans for body, mono for data
- No borders on cards — use background color shifts and subtle shadows
- Strong typographic hierarchy
- Mono + tabular figures for all addresses, hashes, amounts

## Phase 8: Tests, Docs, Submission

As defined in main instruction.md Sections 16-18.

## Summary of Free-Tier Adaptations

| Feature | Paywalled? | Our Approach |
|---------|-----------|--------------|
| Web3 actions (balance, transfer, read contract) | No | Use directly |
| Condition nodes | No | Use directly |
| Scheduled triggers | No | Use directly |
| Manual triggers | No | Use directly |
| Workflow creation | No | Use directly |
| Direct execution (simulate + execute) | No | Use directly |
| Gas sponsorship (testnets) | No | Use directly |
| Webhook/HTTP notification actions | YES (402) | Route alerts through our own audit chain + dashboard |
| Batch Read Contract | Unknown | Test it; fall back to sequential reads if 402 |
| Assess Transaction Risk | Unknown | Test it; fall back to local evaluator if 402 |
| Marketplace listing | Unknown | Test it; handle 402 gracefully, document finding |

Every 402 we encounter gets documented in `docs/KEEPERHUB-FINDINGS.md` with exact error, what we tried, and our workaround. This documentation is itself a submission asset for the onboarding bounty.

## DO NOT:
- Pay for any upgrade
- Stub or mock any execution — every transaction is real
- Skip any phase — complete them in order
- Use Tailwind or any utility CSS
- Put notification webhooks back in workflows (they will 402)
- Use `GET /api/chains` as auth check (it is public)
- Forget `sourceHandle: "true"` on condition edges
- Pass ABI as raw array (must be JSON.stringify'd)
- Check only `status === 'error'` (also catch `system_error` and `cancelled`)

## DO:
- Test every KeeperHub action for 402 before building around it
- Document every 402 finding
- Simulate before every execution
- Use idempotency keys on every write
- Log everything to the audit chain
- Build the full premium UI
- Include real transaction hashes in the README
- Complete all 8 phases
