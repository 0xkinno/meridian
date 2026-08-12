# MERIDIAN — Autonomous Strategy Execution Engine

## Build Instruction Manual for Codex Agent

> **Read this entire document before writing a single line of code.**
> Every section is load-bearing. Skipping any part will produce errors, incomplete features, or a project that fails judging.

---

## 0. IDENTITY & CONTEXT

**Project name:** MERIDIAN
**Tagline:** Set your strategy. The agent handles the last mile.
**One-line:** An autonomous AI agent that translates human-readable financial policies into scheduled onchain operations, executes them through KeeperHub with full simulation and safety rails, and publishes proven strategies to the marketplace.

**Hackathon:** KeeperHub "The Last Mile" / Agents Onchain Hackathon (DoraHacks)
**Deadline:** August 13, 2026, 12:00 UTC+2 (extended by 5 days beyond original)
**Prize pool:** $5,000 USD (stablecoins) + bounties

**Developer:** Kinnoski (@0xkinno on GitHub and X)
**Build tool:** Codex agent inside Cursor terminal
**Deploy target:** Vercel (frontend) + Railway or Render (backend)

---

## 1. HACKATHON RULES — EVERY REQUIREMENT MUST BE MET

### Hard Requirements
1. **Must use KeeperHub as the onchain execution layer.** Every onchain write goes through KeeperHub. No direct RPC signing anywhere in this codebase.
2. **Must execute real onchain transactions.** Not mocks, not simulations only. Real mined transactions on a real chain (testnets count).
3. **Must submit:** GitHub repo link, demo video, link to a transaction executed via KeeperHub.

### Judging Criteria (ranked by weight)
1. **Onchain execution via KeeperHub** — Working transactions through KeeperHub. Weighted HEAVIEST.
2. **Use of KeeperHub surfaces** — MCP server, CLI, x402, MPP, workflow builder, audit trail. MORE surfaces = higher score.
3. **Reliability and observability** — Retries, gas handling, simulation before broadcast, audit trail usage, failure mode awareness.
4. **Originality and real-world usefulness** — Would anyone run this? Does it solve a real problem?
5. **Integration quality and developer experience** — Clean code, good architecture, reproducible.

### Surfaces We MUST Use (to maximize criterion #2)
- KeeperHub REST API (workflow CRUD, execution, status polling)
- KeeperHub MCP server (tool calls for workflow management)
- KeeperHub Direct Execution (simulate → execute → poll)
- KeeperHub Workflow Builder primitives (triggers, actions, conditions, edges)
- KeeperHub Audit Trail (execution logs, per-node status, tx hashes)
- KeeperHub Marketplace (list a strategy workflow, set price, verify listing)
- x402 payment protocol (pay for a marketplace workflow)
- Smart Gas Estimation (use gas limit multipliers where appropriate)
- Batch Read Contract (multi-position monitoring in one call)
- Transaction Risk Assessment (pre-execution risk scoring)

---

## 2. WHAT MERIDIAN DOES

### The Problem
Onchain financial operations (recurring investments, scheduled payments, yield harvesting, portfolio rebalancing) require someone to wake up, check conditions, approve transactions, and pay gas. Agents can decide, but they hit the wall at execution: failed txs, gas spikes, no retries, no audit trail.

### The Solution
MERIDIAN lets a user define financial strategies as human-readable policies. An autonomous agent translates those into KeeperHub workflows, executes them on schedule with full simulation, retry handling, risk assessment, and gas optimization, and logs everything to a tamper-evident audit chain. Proven strategies can be published to the KeeperHub Marketplace so other agents can pay to use them.

### Four Strategy Types

**1. Dollar-Cost Averaging (DCA)**
- User sets: token pair, buy amount per interval, frequency, slippage tolerance
- Agent creates a scheduled KeeperHub workflow that: checks balance → checks price → evaluates if conditions met → executes swap/transfer → logs result
- Real execution: ERC20 transfer on Base Sepolia (simulating a swap output)

**2. Scheduled Payments**
- User sets: recipient, token, amount, frequency, start date
- Agent creates a scheduled workflow: checks sender balance → evaluates if sufficient → simulates transfer → executes transfer → sends notification
- Real execution: USDC transfer on Sepolia

**3. Yield Monitor & Harvest**
- User sets: protocol (Aave/Lido/Compound), position address, harvest threshold
- Agent creates a workflow: batch-reads position data across protocols → evaluates harvest profitability → executes harvest call → logs yield
- Real execution: Read Contract calls to DeFi protocols, balance checks

**4. Portfolio Rebalance Check**
- User sets: target allocations (e.g., 60% ETH, 40% USDC), drift threshold
- Agent creates a workflow: batch-reads balances across tokens → calculates drift → flags rebalance needed → assesses risk → executes rebalance transfers
- Real execution: Multiple balance reads, conditional transfer

### What Makes This Win

| Dimension | MERIDIAN | Typical Competitor |
|-----------|----------|-------------------|
| Strategy types | 4 distinct operation modes | 1 single-purpose agent |
| KeeperHub surfaces | 10+ (REST, MCP, direct exec, workflows, marketplace, x402, batch read, risk assess, audit, notifications) | 3-4 |
| Transaction types | Balance checks, ERC20 transfers, contract reads, batch reads, approvals | Single transfer type |
| Marketplace | Lists strategies as paid workflows | Not used |
| Audit trail | Hash-chained local log + KeeperHub execution trail, cross-verified | Basic logging |
| Policy engine | Deterministic, code-only (no LLM in execution path) | Often LLM-dependent |
| UI quality | Premium editorial design | Standard dashboard |

---

## 3. ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    MERIDIAN DASHBOARD                            │
│              (Next.js 14 App Router + React 18)                 │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Strategy │  │Execution │  │Analytics │  │  Audit Trail  │   │
│  │ Builder  │  │ Monitor  │  │  Panel   │  │   Viewer      │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │              │               │           │
│       └──────────────┴──────────────┴───────────────┘           │
│                          │                                      │
│                    API Routes (Next.js)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MERIDIAN AGENT CORE                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │   Policy     │  │  Workflow    │  │    Execution      │     │
│  │   Engine     │  │  Composer    │  │    Pipeline       │     │
│  │  (rules,     │  │  (builds     │  │ (simulate→exec→   │     │
│  │   limits,    │  │   KH nodes   │  │  poll→record)     │     │
│  │   guards)    │  │   + edges)   │  │                   │     │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────────┘     │
│         │                 │                   │                 │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌───────┴───────────┐     │
│  │   Risk       │  │    MCP       │  │   Audit Chain     │     │
│  │   Evaluator  │  │   Client     │  │  (SHA-256 hash    │     │
│  │  (pre-exec   │  │  (KH MCP     │  │   linked log)     │     │
│  │   scoring)   │  │   server)    │  │                   │     │
│  └──────────────┘  └──────────────┘  └───────────────────┘     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │  Marketplace │  │ Notification │  │   Health &        │     │
│  │  Publisher   │  │   Router     │  │   Diagnostics     │     │
│  │ (list, price,│  │ (Discord,    │  │                   │     │
│  │  verify)     │  │  Telegram)   │  │                   │     │
│  └──────────────┘  └──────────────┘  └───────────────────┘     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
     │  KeeperHub   │ │  KeeperHub  │ │  KeeperHub   │
     │  REST API    │ │  MCP Server │ │  Marketplace  │
     └──────┬───────┘ └──────┬──────┘ └──────┬───────┘
            │                │               │
            └────────────────┼───────────────┘
                             ▼
                   ┌───────────────────┐
                   │    ONCHAIN        │
                   │  Base Sepolia     │
                   │  Ethereum Sepolia │
                   └───────────────────┘
```

---

## 4. TECH STACK

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** CSS Modules (NO Tailwind — the design must not look templated)
- **Fonts:** Self-hosted via `next/font/local` or `next/font/google`:
  - Display/headings: `DM Serif Display` or `Playfair Display` (free serif that evokes Canela/Tiempos)
  - Body: `Inter` or `DM Sans` (clean geometric sans, evokes Söhne/Neue Haas Grotesk)
  - Mono/labels: `JetBrains Mono` or `IBM Plex Mono`
- **Charts:** Recharts (minimal, clean)
- **State:** React Context + hooks (no Redux, keep it simple)
- **Deploy:** Vercel

### Backend (API Routes inside Next.js)
- **Runtime:** Node.js 20+
- **HTTP client:** Native `fetch` (no axios)
- **Crypto:** Node `crypto` module for SHA-256 audit chain
- **Storage:** JSON files on disk for development, Vercel KV or filesystem for production
  - `strategies.json` — user-defined strategies
  - `executions.json` — execution history
  - `audit.jsonl` — append-only hash-chained audit log

### External Services
- **KeeperHub REST API:** `https://app.keeperhub.com/api/*`
- **KeeperHub MCP Server:** `https://app.keeperhub.com/mcp`
- **Chains:** Base Sepolia (84532), Ethereum Sepolia (11155111)

---

## 5. PROJECT FILE STRUCTURE

```
meridian/
├── README.md                          # Full project documentation (see Section 14)
├── instruction.md                     # This file
├── .env.example                       # Environment variable template
├── .env.local                         # Local env (gitignored)
├── next.config.js                     # Next.js config
├── tsconfig.json                      # TypeScript config (strict)
├── package.json
│
├── public/
│   └── fonts/                         # Self-hosted font files
│       ├── DMSerifDisplay-Regular.woff2
│       ├── Inter-Variable.woff2
│       └── JetBrainsMono-Variable.woff2
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout with fonts, metadata
│   │   ├── page.tsx                   # Landing / dashboard home
│   │   ├── globals.css                # CSS custom properties, resets
│   │   │
│   │   ├── strategies/
│   │   │   ├── page.tsx               # Strategy list view
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create new strategy
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Strategy detail view
│   │   │
│   │   ├── executions/
│   │   │   ├── page.tsx               # Execution history
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Single execution detail
│   │   │
│   │   ├── audit/
│   │   │   └── page.tsx               # Audit trail viewer + chain verify
│   │   │
│   │   ├── marketplace/
│   │   │   └── page.tsx               # Marketplace listing manager
│   │   │
│   │   └── api/                       # API routes
│   │       ├── health/
│   │       │   └── route.ts           # Health check endpoint
│   │       ├── strategies/
│   │       │   ├── route.ts           # GET all, POST new
│   │       │   └── [id]/
│   │       │       ├── route.ts       # GET one, PUT update, DELETE
│   │       │       ├── execute/
│   │       │       │   └── route.ts   # POST trigger manual execution
│   │       │       ├── workflow/
│   │       │       │   └── route.ts   # POST create KH workflow for strategy
│   │       │       └── publish/
│   │       │           └── route.ts   # POST publish to marketplace
│   │       ├── executions/
│   │       │   ├── route.ts           # GET execution history
│   │       │   └── [id]/
│   │       │       └── route.ts       # GET single execution detail
│   │       ├── audit/
│   │       │   ├── route.ts           # GET audit entries
│   │       │   └── verify/
│   │       │       └── route.ts       # POST verify audit chain integrity
│   │       ├── keeperhub/
│   │       │   ├── status/
│   │       │   │   └── route.ts       # GET KH connection status
│   │       │   ├── wallet/
│   │       │   │   └── route.ts       # GET org wallet info
│   │       │   ├── workflows/
│   │       │   │   └── route.ts       # GET list KH workflows
│   │       │   └── mcp/
│   │       │       └── route.ts       # POST call MCP tool
│   │       └── marketplace/
│   │           └── route.ts           # GET/POST marketplace operations
│   │
│   ├── lib/                           # Core logic
│   │   ├── keeperhub/
│   │   │   ├── client.ts              # REST API client
│   │   │   ├── mcp.ts                 # MCP server client (JSON-RPC 2.0 over HTTP)
│   │   │   ├── workflows.ts           # Workflow composition (build nodes + edges)
│   │   │   ├── execution.ts           # Simulate → execute → poll pipeline
│   │   │   ├── direct-execution.ts    # Direct transfer/contract-call execution
│   │   │   ├── marketplace.ts         # List, price, verify marketplace listings
│   │   │   └── types.ts              # KeeperHub type definitions
│   │   │
│   │   ├── strategies/
│   │   │   ├── types.ts               # Strategy type definitions
│   │   │   ├── dca.ts                 # DCA strategy logic
│   │   │   ├── payments.ts            # Scheduled payment logic
│   │   │   ├── yield.ts               # Yield monitor + harvest logic
│   │   │   ├── rebalance.ts           # Portfolio rebalance logic
│   │   │   └── composer.ts            # Translates strategy → KH workflow nodes
│   │   │
│   │   ├── policy/
│   │   │   ├── engine.ts              # Deterministic policy evaluation
│   │   │   ├── rules.ts              # Built-in safety rules
│   │   │   └── types.ts              # Policy type definitions
│   │   │
│   │   ├── audit/
│   │   │   ├── chain.ts              # SHA-256 hash-chained audit log
│   │   │   ├── logger.ts             # Append audit entries
│   │   │   └── verify.ts             # Chain verification (works in Node + browser)
│   │   │
│   │   ├── risk/
│   │   │   └── evaluator.ts          # Pre-execution risk assessment via KH
│   │   │
│   │   ├── store/
│   │   │   ├── strategies.ts          # Strategy persistence
│   │   │   ├── executions.ts          # Execution persistence
│   │   │   └── audit.ts              # Audit log persistence
│   │   │
│   │   └── utils/
│   │       ├── format.ts              # Number/address formatting
│   │       ├── time.ts                # Time/interval helpers
│   │       └── constants.ts           # Chain IDs, token addresses, defaults
│   │
│   ├── components/                    # React components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.module.css
│   │   │   ├── Navigation.tsx
│   │   │   ├── Navigation.module.css
│   │   │   ├── Footer.tsx
│   │   │   └── Footer.module.css
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatusCard.tsx
│   │   │   ├── StatusCard.module.css
│   │   │   ├── RecentExecutions.tsx
│   │   │   ├── RecentExecutions.module.css
│   │   │   ├── StrategyOverview.tsx
│   │   │   └── StrategyOverview.module.css
│   │   │
│   │   ├── strategies/
│   │   │   ├── StrategyCard.tsx
│   │   │   ├── StrategyCard.module.css
│   │   │   ├── StrategyForm.tsx
│   │   │   ├── StrategyForm.module.css
│   │   │   ├── StrategyDetail.tsx
│   │   │   └── StrategyDetail.module.css
│   │   │
│   │   ├── executions/
│   │   │   ├── ExecutionTimeline.tsx
│   │   │   ├── ExecutionTimeline.module.css
│   │   │   ├── ExecutionDetail.tsx
│   │   │   ├── ExecutionDetail.module.css
│   │   │   ├── TransactionProof.tsx
│   │   │   └── TransactionProof.module.css
│   │   │
│   │   ├── audit/
│   │   │   ├── AuditViewer.tsx
│   │   │   ├── AuditViewer.module.css
│   │   │   ├── ChainVerifier.tsx
│   │   │   └── ChainVerifier.module.css
│   │   │
│   │   ├── marketplace/
│   │   │   ├── ListingManager.tsx
│   │   │   ├── ListingManager.module.css
│   │   │   ├── ListingCard.tsx
│   │   │   └── ListingCard.module.css
│   │   │
│   │   └── shared/
│   │       ├── Badge.tsx
│   │       ├── Badge.module.css
│   │       ├── Button.tsx
│   │       ├── Button.module.css
│   │       ├── Input.tsx
│   │       ├── Input.module.css
│   │       ├── Select.tsx
│   │       ├── Select.module.css
│   │       ├── Modal.tsx
│   │       ├── Modal.module.css
│   │       ├── Spinner.tsx
│   │       ├── Toast.tsx
│   │       ├── Toast.module.css
│   │       ├── AddressDisplay.tsx
│   │       ├── TransactionLink.tsx
│   │       └── EmptyState.tsx
│   │
│   └── hooks/
│       ├── useStrategies.ts
│       ├── useExecutions.ts
│       ├── useAudit.ts
│       ├── useKeeperHub.ts
│       └── usePolling.ts
│
├── data/                              # Runtime data (gitignored except examples)
│   ├── strategies.example.json
│   ├── executions.example.json
│   └── audit.example.jsonl
│
├── scripts/
│   ├── verify-audit.ts                # CLI audit chain verifier
│   ├── demo-execute.ts                # Run a demo execution for testing
│   └── setup-check.ts                 # Verify env vars and KH connectivity
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── KEEPERHUB-INTEGRATION.md       # Every KH surface used and why
│   ├── SECURITY.md
│   ├── AUDIT-CHAIN.md
│   └── FAILURE-MODES.md               # Documented failure modes and handling
│
└── test/
    ├── lib/
    │   ├── policy.test.ts
    │   ├── audit-chain.test.ts
    │   ├── workflow-composer.test.ts
    │   └── execution-pipeline.test.ts
    └── api/
        └── health.test.ts
```

---

## 6. ENVIRONMENT VARIABLES

Create `.env.example` with these exact variables:

```env
# KeeperHub
KEEPERHUB_API_KEY=kh_your_organization_api_key_here
KEEPERHUB_API_URL=https://app.keeperhub.com
KEEPERHUB_MCP_URL=https://app.keeperhub.com/mcp

# Chains (use testnets)
PRIMARY_CHAIN_ID=84532
PRIMARY_CHAIN_NAME=base-sepolia
SECONDARY_CHAIN_ID=11155111
SECONDARY_CHAIN_NAME=sepolia

# Token addresses (testnets)
USDC_BASE_SEPOLIA=0x036CbD53842c5426634e7929541eC2318f3dCF7e
USDC_SEPOLIA=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATA_DIR=./data
NODE_ENV=development
```

**CRITICAL:** The `KEEPERHUB_API_KEY` must be an organization key starting with `kh_`. User keys (`wfb_`) will NOT work for REST API or MCP calls.

---

## 7. KEEPERHUB CLIENT IMPLEMENTATION

This section contains the exact API patterns you MUST follow. KeeperHub has specific quirks that will cause silent failures if you get them wrong.

### 7.1 REST API Client (`src/lib/keeperhub/client.ts`)

```typescript
const KEEPERHUB_API_URL = process.env.KEEPERHUB_API_URL || 'https://app.keeperhub.com';
const KEEPERHUB_API_KEY = process.env.KEEPERHUB_API_KEY;

interface KeeperHubResponse<T = unknown> {
  status: number;
  data: T;
  ok: boolean;
}

async function keeperHubRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<KeeperHubResponse<T>> {
  const url = `${KEEPERHUB_API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${KEEPERHUB_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  // Not all responses are JSON (429 can be text/HTML)
  const text = await res.text();
  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    data = { error: text.slice(0, 500) } as T;
  }

  return { status: res.status, data, ok: res.ok };
}

// Verify API key works
export async function verifyConnection(): Promise<boolean> {
  // GET /api/keys is the auth probe: 200 = valid, 401 = invalid
  // DO NOT use /api/chains — it is public and answers regardless of auth
  const res = await keeperHubRequest('/api/keys');
  return res.status === 200;
}

// Get organization wallet address
export async function getWalletAddress(): Promise<string> {
  const res = await keeperHubRequest<{ walletAddress: string }>('/api/user');
  if (!res.ok) throw new Error(`Failed to get user: ${res.status}`);
  // CRITICAL: walletAddress on /api/user is the ORGANIZATION wallet,
  // not the login wallet. This is the address that signs transactions
  // and the address that must hold funds.
  return res.data.walletAddress;
}

// Get supported chains
export async function getChains(): Promise<unknown[]> {
  const res = await keeperHubRequest<unknown[]>('/api/chains');
  return res.data;
}

// Get integrations (needed for wallet integration ID in workflows)
export async function getIntegrations(): Promise<Array<{ id: string }>> {
  // Returns a bare array, not wrapped in an object
  const res = await keeperHubRequest<Array<{ id: string }>>('/api/integrations');
  return res.data;
}
```

### 7.2 MCP Client (`src/lib/keeperhub/mcp.ts`)

KeeperHub's MCP server uses JSON-RPC 2.0 over HTTP, NOT WebSocket.

```typescript
const MCP_URL = process.env.KEEPERHUB_MCP_URL || 'https://app.keeperhub.com/mcp';
const KEEPERHUB_API_KEY = process.env.KEEPERHUB_API_KEY;

let requestId = 0;

interface MCPToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export async function callMCPTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<MCPToolResult> {
  requestId++;

  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEEPERHUB_API_KEY}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`MCP error: ${JSON.stringify(data.error)}`);
  }
  return data.result;
}

// List available MCP tools
export async function listMCPTools(): Promise<unknown[]> {
  requestId++;
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEEPERHUB_API_KEY}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/list',
      params: {},
    }),
  });
  const data = await res.json();
  return data.result?.tools || [];
}

// MCP tool wrappers
export async function mcpListWorkflows() {
  return callMCPTool('list_workflows', {});
}

export async function mcpGetWorkflow(workflowId: string) {
  return callMCPTool('get_workflow', { workflow_id: workflowId });
}

export async function mcpGetExecution(executionId: string) {
  return callMCPTool('get_execution', { execution_id: executionId });
}

export async function mcpListWorkflow(workflowId: string) {
  return callMCPTool('list_workflow', { workflow_id: workflowId });
}

export async function mcpGetWorkflowListing(slug: string) {
  return callMCPTool('get_workflow_listing', { slug });
}
```

### 7.3 Direct Execution Pipeline (`src/lib/keeperhub/direct-execution.ts`)

This is the most critical file. The simulate-then-execute pattern MUST be followed exactly.

```typescript
import { keeperHubRequest } from './client';
import { auditLog } from '../audit/logger';

interface TransferParams {
  chainId: number;
  recipientAddress: string;
  amount: string;
  tokenAddress?: string; // omit for native token transfer
}

interface SimulationResult {
  success: boolean;
  status: string;
  from: string;
  to: string;
  value: string;
  gasEstimate: string;
  wouldRevert: boolean;
}

interface ExecutionResult {
  executionId: string;
  status: string;
}

interface ExecutionStatus {
  executionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionHash?: string;
  transactionLink?: string;
  sponsored?: boolean;
  error?: string;
}

// Step 1: Simulate
export async function simulateTransfer(
  params: TransferParams
): Promise<SimulationResult> {
  const body: Record<string, unknown> = {
    chainId: params.chainId,
    recipientAddress: params.recipientAddress,
    amount: params.amount,
    simulate: true,
  };
  if (params.tokenAddress) {
    body.tokenAddress = params.tokenAddress;
  }

  const endpoint = params.tokenAddress
    ? '/api/execute/token-transfer'
    : '/api/execute/transfer';

  const res = await keeperHubRequest<SimulationResult>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  // A would-revert simulation may come back as 400
  if (res.status >= 400) {
    return {
      success: false,
      status: 'simulation_failed',
      from: '',
      to: '',
      value: '0',
      gasEstimate: '0',
      wouldRevert: true,
    };
  }

  return res.data;
}

// Step 2: Execute (only after successful simulation)
export async function executeTransfer(
  params: TransferParams,
  idempotencyKey: string
): Promise<ExecutionResult> {
  const body: Record<string, unknown> = {
    chainId: params.chainId,
    recipientAddress: params.recipientAddress,
    amount: params.amount,
    // DO NOT include simulate: true here
  };
  if (params.tokenAddress) {
    body.tokenAddress = params.tokenAddress;
  }

  const endpoint = params.tokenAddress
    ? '/api/execute/token-transfer'
    : '/api/execute/transfer';

  const res = await keeperHubRequest<ExecutionResult>(endpoint, {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Execute failed: ${res.status} ${JSON.stringify(res.data)}`);
  }

  return res.data;
}

// Step 3: Poll for completion
export async function pollExecutionStatus(
  executionId: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<ExecutionStatus> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await keeperHubRequest<ExecutionStatus>(
      `/api/execute/${executionId}/status`
    );

    if (!res.ok) {
      throw new Error(`Status check failed: ${res.status}`);
    }

    const status = res.data;

    // Terminal states
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }

    // Non-terminal: wait and retry
    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`Execution ${executionId} did not complete within ${maxAttempts * intervalMs}ms`);
}

// Full pipeline: simulate → execute → poll → record
export async function executeWithSafety(
  params: TransferParams,
  strategyId: string,
  strategyType: string
): Promise<ExecutionStatus> {
  const idempotencyKey = crypto.randomUUID();

  // 1. Log intent
  await auditLog('EXECUTION_INTENT', {
    strategyId,
    strategyType,
    params,
    idempotencyKey,
  });

  // 2. Simulate
  const sim = await simulateTransfer(params);
  await auditLog('SIMULATION_RESULT', {
    strategyId,
    success: sim.success,
    wouldRevert: sim.wouldRevert,
    gasEstimate: sim.gasEstimate,
    from: sim.from,
  });

  if (!sim.success || sim.wouldRevert) {
    await auditLog('EXECUTION_BLOCKED', {
      strategyId,
      reason: 'Simulation failed or would revert',
      simulation: sim,
    });
    throw new Error(`Simulation failed: ${JSON.stringify(sim)}`);
  }

  // 3. Execute
  const exec = await executeTransfer(params, idempotencyKey);
  await auditLog('EXECUTION_SUBMITTED', {
    strategyId,
    executionId: exec.executionId,
    idempotencyKey,
  });

  // 4. Poll
  const result = await pollExecutionStatus(exec.executionId);
  await auditLog('EXECUTION_RESULT', {
    strategyId,
    executionId: exec.executionId,
    status: result.status,
    transactionHash: result.transactionHash,
    transactionLink: result.transactionLink,
    sponsored: result.sponsored,
    error: result.error,
  });

  return result;
}
```

### 7.4 Workflow Composer (`src/lib/keeperhub/workflows.ts`)

**CRITICAL SCHEMA RULES** (violating any of these causes silent failures):

1. `abi` must be `JSON.stringify()`d — a raw array causes 422
2. `functionArgs` must be a JSON-stringified positional ARRAY, not named fields
3. `gasLimitMultiplier` must be a string, not a number
4. `network` should be a string chain ID (e.g., `"84532"`)
5. `triggerType` must be Pascal-case: `"Manual"`, `"Schedule"`, `"Webhook"`, `"Event"`, `"Block"`
6. Condition nodes have `type: "action"` with `actionType: "Condition"` and a single JS expression string
7. Condition edges MUST have `sourceHandle: "true"` or `sourceHandle: "false"`
8. `recipientAddress` is the field name for transfer recipient, NOT `to`
9. `create_workflow` requires `nodes` and `edges` in the same call
10. Workflows are created DISABLED by default — you must enable them after creation

```typescript
import { keeperHubRequest } from './client';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action';
  position: { x: number; y: number };
  data: {
    type: 'trigger' | 'action';
    label: string;
    config: Record<string, unknown>;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: 'true' | 'false' | 'loop' | 'done';
  type?: string;
}

interface CreateWorkflowPayload {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// Create a workflow via REST API
export async function createWorkflow(
  payload: CreateWorkflowPayload
): Promise<{ id: string; slug: string }> {
  const res = await keeperHubRequest<{ id: string; slug: string }>(
    '/api/workflows/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error(`Create workflow failed: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data;
}

// Execute a workflow
export async function executeWorkflow(
  workflowId: string
): Promise<{ executionId: string; status: string }> {
  const res = await keeperHubRequest<{ executionId: string; status: string }>(
    `/api/workflows/${workflowId}/execute`,
    { method: 'POST', body: JSON.stringify({}) }
  );
  if (!res.ok) throw new Error(`Execute failed: ${res.status}`);
  return res.data;
}

// Wait for workflow execution to complete (long-poll)
export async function waitForWorkflowExecution(
  executionId: string,
  deadlineMs: number = 120000
): Promise<{
  executionId: string;
  status: string;
  completed: boolean;
  transactionHashes: Array<{ hash: string; nodeId: string; nodeName: string; chainId?: number; network?: string }>;
  output: unknown;
  error: string | null;
}> {
  const giveUpAt = Date.now() + deadlineMs;

  while (Date.now() < giveUpAt) {
    const res = await keeperHubRequest<{
      executionId: string;
      status: string;
      completed: boolean;
      transactionHashes: Array<{ hash: string; nodeId: string; nodeName: string }>;
      output: unknown;
      error: string | null;
    }>(
      `/api/workflows/executions/${executionId}/wait?timeoutMs=55000`
    );

    if (!res.ok) throw new Error(`Wait failed: ${res.status}`);

    if (!res.data.completed) continue;

    // Check status !== 'success' rather than status === 'error'
    // because system_error and cancelled are also terminal failures
    if (res.data.status !== 'success') {
      throw new Error(res.data.error ?? `Execution ${res.data.status}`);
    }

    return res.data;
  }

  throw new Error(`Execution ${executionId} did not finish within deadline`);
}

// Get execution status (immediate, not long-poll)
export async function getExecutionStatus(executionId: string) {
  const res = await keeperHubRequest(
    `/api/workflows/executions/${executionId}/status`
  );
  return res.data;
}

// Get execution logs
export async function getExecutionLogs(executionId: string) {
  const res = await keeperHubRequest(
    `/api/workflows/executions/${executionId}/logs`
  );
  return res.data;
}
```

### 7.5 Strategy-to-Workflow Composer (`src/lib/strategies/composer.ts`)

This file translates a user's strategy definition into KeeperHub workflow nodes and edges.

```typescript
import type { Strategy } from './types';
import type { WorkflowNode, WorkflowEdge } from '../keeperhub/workflows';

export function composeScheduledPaymentWorkflow(
  strategy: Strategy & { type: 'payment' }
): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  const nodes: WorkflowNode[] = [
    // 1. Scheduled Trigger
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 0, y: 250 },
      data: {
        type: 'trigger',
        label: `Every ${strategy.config.interval}`,
        config: {
          triggerType: 'Schedule',
          scheduleCron: intervalToCron(strategy.config.interval),
        },
      },
    },
    // 2. Check sender balance
    {
      id: 'check-balance',
      type: 'action',
      position: { x: 250, y: 250 },
      data: {
        type: 'action',
        label: 'Check Balance',
        config: {
          actionType: 'web3/check-erc20-balance',
          network: String(strategy.config.chainId),
          address: strategy.config.senderAddress,
          tokenAddress: strategy.config.tokenAddress,
        },
      },
    },
    // 3. Condition: balance >= payment amount
    {
      id: 'condition-balance',
      type: 'action', // YES, condition nodes are type: "action"
      position: { x: 500, y: 250 },
      data: {
        type: 'action',
        label: 'Sufficient Balance',
        config: {
          // MUST be a single JS expression string, NOT a structured object
          actionType: 'Condition',
          condition: '{{@check-balance:Check Balance.balance}} >= ' + strategy.config.amount,
        },
      },
    },
    // 4a. TRUE branch: Transfer
    {
      id: 'transfer',
      type: 'action',
      position: { x: 750, y: 150 },
      data: {
        type: 'action',
        label: 'Send Payment',
        config: {
          actionType: 'web3/transfer-erc20',
          network: String(strategy.config.chainId),
          recipientAddress: strategy.config.recipientAddress,
          amount: strategy.config.amount,
          tokenAddress: strategy.config.tokenAddress,
        },
      },
    },
    // 4b. FALSE branch: Alert
    {
      id: 'alert-low',
      type: 'action',
      position: { x: 750, y: 350 },
      data: {
        type: 'action',
        label: 'Low Balance Alert',
        config: {
          actionType: 'webhook/send-webhook',
          webhookUrl: strategy.config.alertWebhookUrl || 'https://httpbin.org/post',
          webhookMethod: 'POST',
          webhookPayload: JSON.stringify({
            alert: 'MERIDIAN: Insufficient balance for scheduled payment',
            strategy: strategy.name,
            required: strategy.config.amount,
            current: '{{@check-balance:Check Balance.balance}}',
          }),
        },
      },
    },
  ];

  const edges: WorkflowEdge[] = [
    { id: 'e1', source: 'trigger', target: 'check-balance' },
    { id: 'e2', source: 'check-balance', target: 'condition-balance' },
    {
      id: 'e3',
      source: 'condition-balance',
      target: 'transfer',
      sourceHandle: 'true',  // MUST specify for condition nodes
      type: 'animated',
    },
    {
      id: 'e4',
      source: 'condition-balance',
      target: 'alert-low',
      sourceHandle: 'false', // MUST specify for condition nodes
      type: 'animated',
    },
  ];

  return { nodes, edges };
}

// Similar composers for DCA, yield, and rebalance strategies...
// Each follows the same node/edge pattern with strategy-specific logic.

function intervalToCron(interval: string): string {
  const map: Record<string, string> = {
    '5min': '*/5 * * * *',
    '15min': '*/15 * * * *',
    'hourly': '0 * * * *',
    'daily': '0 12 * * *',
    'weekly': '0 12 * * 1',
  };
  return map[interval] || '0 * * * *';
}
```

### 7.6 Marketplace Integration (`src/lib/keeperhub/marketplace.ts`)

**CRITICAL ORDERING:** The listing sequence has a specific order that must be followed. Getting it wrong produces a listing that silently fails.

```typescript
import { callMCPTool } from './mcp';

// The correct sequence to list a workflow on the marketplace:
// 1. Create and test the workflow
// 2. Enable the workflow (disabled workflows reject marketplace calls with 503)
// 3. List the workflow (list_workflow MCP tool)
// 4. Set the price (update_workflow_listing MCP tool) — list_workflow has NO price field
// 5. Verify the listing is live (get_workflow_listing by slug)

export async function publishToMarketplace(
  workflowId: string,
  slug: string,
  priceUsd: string, // MUST be a string, e.g., "0.05"
  inputSchema: Record<string, { type: string; description: string }>,
  outputNodeId: string
): Promise<{ listed: boolean; slug: string; price: string }> {
  // Step 1: List the workflow
  const listResult = await callMCPTool('list_workflow', {
    workflow_id: workflowId,
    slug: slug,
    input_schema: inputSchema,
    output_node_id: outputNodeId,
  });

  if (listResult.isError) {
    throw new Error(`Failed to list: ${listResult.content[0]?.text}`);
  }

  // Step 2: Set the price (separate call!)
  // priceUsdcPerCall MUST be a string, not a number
  const priceResult = await callMCPTool('update_workflow_listing', {
    workflow_id: workflowId,
    priceUsdcPerCall: priceUsd,
  });

  if (priceResult.isError) {
    throw new Error(`Failed to set price: ${priceResult.content[0]?.text}`);
  }

  // Step 3: Verify listing is live and charging
  const verify = await callMCPTool('get_workflow_listing', { slug });
  const verifyData = JSON.parse(verify.content[0]?.text || '{}');

  return {
    listed: true,
    slug,
    price: priceUsd,
  };
}
```

---

## 8. AUDIT CHAIN IMPLEMENTATION

Every observation, decision, and execution is logged to a SHA-256 hash-chained, append-only log. This is critical for the judging criterion "Reliability and observability."

### `src/lib/audit/chain.ts`

```typescript
import { createHash } from 'crypto';

export interface AuditEntry {
  seq: number;
  ts: string;
  type: string;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

const GENESIS_HASH = '0'.repeat(64);

export function computeHash(
  seq: number,
  ts: string,
  type: string,
  payload: Record<string, unknown>,
  prevHash: string
): string {
  const content = `${seq}${ts}${type}${JSON.stringify(payload)}${prevHash}`;
  return createHash('sha256').update(content).digest('hex');
}

export function createEntry(
  seq: number,
  type: string,
  payload: Record<string, unknown>,
  prevHash: string
): AuditEntry {
  const ts = new Date().toISOString();
  const hash = computeHash(seq, ts, type, payload, prevHash);
  return { seq, ts, type, payload, prevHash, hash };
}

export function verifyChain(
  entries: AuditEntry[]
): { valid: boolean; brokenAt?: number; reason?: string } {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const expectedPrev = i === 0 ? GENESIS_HASH : entries[i - 1].hash;

    if (entry.prevHash !== expectedPrev) {
      return { valid: false, brokenAt: i, reason: 'prevHash mismatch' };
    }

    const recomputed = computeHash(
      entry.seq,
      entry.ts,
      entry.type,
      entry.payload,
      entry.prevHash
    );

    if (recomputed !== entry.hash) {
      return { valid: false, brokenAt: i, reason: 'hash mismatch' };
    }
  }
  return { valid: true };
}
```

---

## 9. POLICY ENGINE

The policy engine is DETERMINISTIC. No LLM in the execution path. This is a design choice that shows judges we understand safety.

### `src/lib/policy/engine.ts`

```typescript
import type { Strategy } from '../strategies/types';

export interface PolicyResult {
  allowed: boolean;
  reason: string;
  violations: string[];
}

export function evaluatePolicy(strategy: Strategy): PolicyResult {
  const violations: string[] = [];

  // Rule 1: Testnet only (safety for hackathon)
  const allowedChains = [84532, 11155111]; // Base Sepolia, Ethereum Sepolia
  if (!allowedChains.includes(strategy.config.chainId)) {
    violations.push(`Chain ${strategy.config.chainId} is not in the testnet allowlist`);
  }

  // Rule 2: Transfer cap
  const MAX_TRANSFER = 0.1; // 0.1 tokens max per execution
  if (parseFloat(strategy.config.amount) > MAX_TRANSFER) {
    violations.push(`Amount ${strategy.config.amount} exceeds cap of ${MAX_TRANSFER}`);
  }

  // Rule 3: Valid recipient address
  if (!strategy.config.recipientAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
    violations.push('Invalid recipient address format');
  }

  // Rule 4: Strategy must have a name
  if (!strategy.name || strategy.name.trim().length < 3) {
    violations.push('Strategy name must be at least 3 characters');
  }

  // Rule 5: No self-transfers for payment strategies (except demo)
  // (This is relaxed for the hackathon demo but noted)

  return {
    allowed: violations.length === 0,
    reason: violations.length === 0
      ? 'All policy checks passed'
      : `Blocked: ${violations.join('; ')}`,
    violations,
  };
}
```

---

## 10. RISK ASSESSMENT INTEGRATION

Use KeeperHub's built-in Assess Transaction Risk tool for pre-execution risk scoring.

```typescript
// In workflow nodes, add a risk assessment step before any write operation
const riskNode: WorkflowNode = {
  id: 'risk-assess',
  type: 'action',
  position: { x: 500, y: 100 },
  data: {
    type: 'action',
    label: 'Assess Risk',
    config: {
      actionType: 'web3/assess-transaction-risk',
      // Calldata from the pending transaction
      calldata: '{{@transfer:Send Payment.calldata}}',
      contractAddress: strategy.config.tokenAddress,
      chain: String(strategy.config.chainId),
    },
  },
};
```

---

## 11. UI DESIGN SYSTEM

### Visual Direction
MERIDIAN's design language is **precision financial editorial**. Think Bloomberg Terminal meets Monocle magazine meets Linear's restraint. Not dark mode. Not crypto dashboard. Not Tailwind cards. Every element earns its place.

### Color Palette

```css
:root {
  /* Background layers */
  --bg-primary: #FAFAF8;        /* warm off-white, the page */
  --bg-surface: #F2F1EF;        /* cards, panels */
  --bg-elevated: #FFFFFF;       /* modals, popovers */
  --bg-inset: #ECEAE7;          /* input fields, code blocks */

  /* Text hierarchy */
  --text-primary: #1A1A19;      /* headings, primary content */
  --text-secondary: #5C5B58;    /* body text, descriptions */
  --text-tertiary: #8A8985;     /* captions, timestamps */
  --text-inverse: #FAFAF8;      /* text on dark surfaces */

  /* Accent — warm copper. One accent only. */
  --accent: #B5722E;            /* primary accent */
  --accent-hover: #9A6127;      /* accent hover state */
  --accent-light: #F5EDE4;      /* accent background tint */
  --accent-text: #8B5A1F;       /* accent on light backgrounds */

  /* Semantic */
  --success: #2D7A3A;
  --success-light: #E8F5EA;
  --error: #C23B2E;
  --error-light: #FBE9E7;
  --warning: #B5722E;           /* same as accent */
  --warning-light: #FFF3E0;

  /* Structure */
  --border: #E5E4E1;            /* sparingly — few borders */
  --border-focus: var(--accent);
  --divider: #EDECE9;           /* horizontal rules only where needed */
  --shadow-sm: 0 1px 2px rgba(26, 26, 25, 0.04);
  --shadow-md: 0 4px 12px rgba(26, 26, 25, 0.06);

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;
  --space-3xl: 96px;

  /* Type scale */
  --text-xs: 0.75rem;     /* 12px — labels, badges */
  --text-sm: 0.8125rem;   /* 13px — secondary text */
  --text-base: 0.9375rem; /* 15px — body */
  --text-lg: 1.125rem;    /* 18px — section heads */
  --text-xl: 1.5rem;      /* 24px — page titles */
  --text-2xl: 2rem;       /* 32px — hero */
  --text-3xl: 2.75rem;    /* 44px — display */

  /* Border radius — minimal */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;

  /* Transitions */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
}
```

### Typography in Next.js

```typescript
// src/app/layout.tsx
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';

// Display serif for headings
const displayFont = localFont({
  src: '../public/fonts/DMSerifDisplay-Regular.woff2',
  variable: '--font-display',
  display: 'swap',
});

// Body sans for reading
const bodyFont = localFont({
  src: [
    { path: '../public/fonts/Inter-Regular.woff2', weight: '400' },
    { path: '../public/fonts/Inter-Medium.woff2', weight: '500' },
    { path: '../public/fonts/Inter-SemiBold.woff2', weight: '600' },
  ],
  variable: '--font-body',
  display: 'swap',
});

// Mono for data, addresses, hashes
const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});
```

### CSS Typography Rules

```css
/* globals.css */
body {
  font-family: var(--font-body), system-ui, sans-serif;
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display), Georgia, serif;
  font-weight: 400; /* serifs look better at normal weight */
  letter-spacing: -0.01em;
  line-height: 1.15;
}

h1 { font-size: var(--text-3xl); }
h2 { font-size: var(--text-xl); }
h3 { font-size: var(--text-lg); }

/* Eyebrow labels */
.eyebrow {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

/* Mono for data */
.mono {
  font-family: var(--font-mono), 'Courier New', monospace;
  font-size: 0.875em;
  font-feature-settings: 'tnum' 1; /* tabular numbers */
}

/* Address display — truncated with mono */
.address {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* No Tailwind-looking cards. Cards use subtle shadows, not borders. */
.card {
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  /* NO border. NO ring. NO outline. */
}

/* Strong hierarchy through spacing, not decoration */
.section + .section {
  margin-top: var(--space-2xl);
}

/* Minimal dividers */
.divider {
  height: 1px;
  background: var(--divider);
  border: none;
  margin: var(--space-xl) 0;
}
```

### Component Design Principles

1. **No borders on cards.** Use background color shifts and subtle shadows.
2. **No bold colored buttons.** Primary action is the accent color, minimal, pill-shaped or rectangular with no border-radius > 6px.
3. **Data tables use generous whitespace,** not zebra striping or grid lines. Alternating background is acceptable if very subtle.
4. **Transaction hashes and addresses** always in mono, always truncated with a copy button.
5. **Status indicators** are small colored dots (8px), not large badges.
6. **Empty states** give direction, not apology. "Create your first strategy to begin" not "No strategies found."
7. **Loading states** use subtle skeleton screens, not spinners everywhere.
8. **Numbers and amounts** use tabular figures (`font-feature-settings: 'tnum'`).
9. **The navigation** is a thin left sidebar or top bar, not a full sidebar with icons.
10. **Page transitions** are instant. No page-level loading screens.

### Key UI Components and Their Personality

**Dashboard (home page):**
- Hero section: Large display type "Meridian" with a single-line descriptor
- Four strategy summary cards in a clean grid (not cramped)
- A compact execution timeline showing last 5 executions with status dots
- Connection status indicator (KeeperHub connected/disconnected)

**Strategy Builder:**
- A stepped form, not all fields at once
- Strategy type selector: 4 options in a clean row, selected state has accent underline
- Form fields use labels above inputs, not floating labels
- Preview pane showing the workflow graph that will be created

**Execution Monitor:**
- Timeline view, newest first
- Each entry: timestamp, strategy name, status dot, chain, tx hash (linked)
- Expandable detail showing: simulation result, execution ID, gas used, node-by-node status

**Audit Trail:**
- Log viewer with typewriter aesthetic (mono font, each line is an entry)
- Chain verification button that runs `verifyChain()` and shows VALID/INVALID
- Export button for the full audit log

---

## 12. BUILD PHASES

Execute these phases IN ORDER. Do not skip ahead. Each phase produces verifiable output.

### PHASE 1: Project Scaffold & KeeperHub Connection
**Goal:** Project boots, connects to KeeperHub, verifies API key, shows wallet address.

**Tasks:**
1. `npx create-next-app@latest meridian --typescript --app --no-tailwind --no-eslint`
2. Set up TypeScript strict mode in `tsconfig.json`
3. Install dependencies: none beyond Next.js defaults (keep it minimal)
4. Create `.env.example` and `.env.local` with KeeperHub credentials
5. Implement `src/lib/keeperhub/client.ts` (REST client with auth)
6. Implement `src/lib/keeperhub/mcp.ts` (MCP client)
7. Create `src/app/api/health/route.ts`:
   - Verifies KeeperHub API key (`GET /api/keys`)
   - Returns wallet address (`GET /api/user`)
   - Returns chain list (`GET /api/chains`)
   - Returns MCP tool count (`tools/list`)
8. Create `scripts/setup-check.ts` that validates the full environment
9. Create the design system in `globals.css` (all CSS custom properties, font setup)
10. Create root layout with fonts, basic navigation structure

**Verify:** `curl http://localhost:3000/api/health` returns `{ "keeperhub": true, "wallet": "0x...", "chains": [...], "mcpTools": 40+ }`

### PHASE 2: Strategy Data Model & Policy Engine
**Goal:** Define, create, store, and validate strategies.

**Tasks:**
1. Define `src/lib/strategies/types.ts`:
   ```typescript
   export type StrategyType = 'dca' | 'payment' | 'yield' | 'rebalance';
   export type StrategyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'error';
   
   export interface Strategy {
     id: string;
     name: string;
     type: StrategyType;
     status: StrategyStatus;
     config: StrategyConfig;
     keeperHubWorkflowId?: string;
     keeperHubWorkflowSlug?: string;
     createdAt: string;
     updatedAt: string;
     lastExecutionAt?: string;
     executionCount: number;
   }
   
   export interface StrategyConfig {
     chainId: number;
     interval: string;
     amount: string;
     tokenAddress?: string;
     recipientAddress?: string;
     senderAddress?: string;
     // DCA-specific
     targetToken?: string;
     slippageTolerance?: number;
     // Yield-specific
     protocol?: string;
     harvestThreshold?: string;
     // Rebalance-specific
     allocations?: Array<{ token: string; targetPercent: number }>;
     driftThreshold?: number;
     // Notification
     alertWebhookUrl?: string;
   }
   ```
2. Implement `src/lib/store/strategies.ts` (JSON file persistence)
3. Implement `src/lib/policy/engine.ts` and `src/lib/policy/rules.ts`
4. Create strategy API routes (`src/app/api/strategies/route.ts`)
5. Create individual strategy API route (`src/app/api/strategies/[id]/route.ts`)

**Verify:** POST a strategy via API, GET it back, policy validation works for valid and invalid strategies.

### PHASE 3: Workflow Composer & KeeperHub Workflow Creation
**Goal:** Translate strategies into KeeperHub workflows and create them via the API.

**Tasks:**
1. Implement `src/lib/strategies/composer.ts` with workflow composers for all 4 strategy types:
   - `composeScheduledPaymentWorkflow()` — Trigger(Schedule) → CheckBalance → Condition → Transfer/Alert
   - `composeDCAWorkflow()` — Trigger(Schedule) → CheckBalance → Condition(enough funds) → Transfer(buy) → Alert
   - `composeYieldMonitorWorkflow()` — Trigger(Schedule) → BatchReadContract(positions) → Condition(harvest?) → WriteContract(harvest) → Alert
   - `composeRebalanceWorkflow()` — Trigger(Schedule) → BatchReadContract(balances) → Condition(drift) → Transfer(rebalance) → Alert
2. Implement `src/lib/keeperhub/workflows.ts` (createWorkflow, executeWorkflow, waitForExecution)
3. Create workflow creation API route (`src/app/api/strategies/[id]/workflow/route.ts`)
4. Test: Create a real workflow on KeeperHub via the API. Verify it appears in the KeeperHub dashboard.

**Verify:** A strategy creates a real KeeperHub workflow with correct nodes and edges. The workflow is visible at `app.keeperhub.com`.

### PHASE 4: Execution Pipeline & Direct Execution
**Goal:** Execute real onchain transactions through KeeperHub with full simulation and audit.

**Tasks:**
1. Implement `src/lib/keeperhub/direct-execution.ts` (simulate → execute → poll)
2. Implement `src/lib/audit/chain.ts` (SHA-256 hash chain)
3. Implement `src/lib/audit/logger.ts` (append entries to audit.jsonl)
4. Create execution API route (`src/app/api/strategies/[id]/execute/route.ts`)
5. Create execution history routes (`src/app/api/executions/route.ts`)
6. Implement `src/lib/store/executions.ts`
7. **Execute a real transaction on Base Sepolia:**
   - Zero-value self-transfer (proves the path works with no funding needed)
   - Record the transaction hash, execution ID, and explorer link
8. **Execute a second transaction: USDC transfer (if wallet is funded) or another zero-value transfer on Ethereum Sepolia**

**Verify:** Real transaction hashes from Base Sepolia visible on `sepolia.basescan.org`. Audit log contains the full execution trail.

### PHASE 5: Risk Assessment & Batch Read Integration
**Goal:** Integrate KeeperHub's transaction risk assessment and batch read capabilities.

**Tasks:**
1. Implement `src/lib/risk/evaluator.ts` using KeeperHub's Assess Transaction Risk action
2. Add risk assessment as a pre-execution step in the execution pipeline
3. Implement batch read contract calls for yield monitoring:
   - Create a workflow that batch-reads balances across multiple addresses
   - Use Multicall3 via KeeperHub's Batch Read Contract action
4. Create a yield monitor workflow that reads from DeFi protocol contracts
5. Log risk scores and batch read results to the audit trail

**Verify:** Risk assessment runs before execution. Batch read successfully queries multiple addresses in one call.

### PHASE 6: Marketplace Integration
**Goal:** Publish a proven strategy workflow to the KeeperHub Marketplace.

**Tasks:**
1. Implement `src/lib/keeperhub/marketplace.ts`
2. Create marketplace API route (`src/app/api/strategies/[id]/publish/route.ts`)
3. Publish one working strategy to the marketplace:
   - Define input/output schema
   - Set price (e.g., $0.05 per call)
   - Verify listing is live via `get_workflow_listing`
4. Document the listing slug and verify it's accessible

**Verify:** Workflow is listed on KeeperHub marketplace with a price. `GET` to the marketplace endpoint returns 402 with payment required.

### PHASE 7: Dashboard UI Build
**Goal:** Build the complete premium editorial frontend.

**Tasks:**
1. Create design system components (`src/components/shared/`):
   - Button, Input, Select, Badge, Modal, Toast, Spinner
   - AddressDisplay (mono, truncated, copy button)
   - TransactionLink (links to block explorer)
   - EmptyState
2. Create layout components (`src/components/layout/`):
   - Header with MERIDIAN wordmark
   - Navigation (clean, minimal)
   - Footer
3. Build Dashboard page (`src/app/page.tsx`):
   - KeeperHub connection status
   - Strategy summary cards (4 types)
   - Recent executions timeline
   - Wallet address display
4. Build Strategies pages:
   - List view with strategy cards
   - Create new strategy form (stepped)
   - Strategy detail view with workflow visualization
5. Build Executions page:
   - Execution history timeline
   - Execution detail with node-by-node status
   - Transaction proof display
6. Build Audit Trail page:
   - Log viewer (mono, typewriter style)
   - Chain verification button + result display
7. Build Marketplace page:
   - Published listings manager
   - Listing status and revenue display

**Verify:** Every page renders correctly. No broken layouts. No Tailwind. No generic SaaS aesthetic. The design feels editorial and premium.

### PHASE 8: Testing, Documentation & Submission Package
**Goal:** Tests pass, docs are complete, submission is ready.

**Tasks:**
1. Write tests:
   - `test/lib/policy.test.ts` — policy engine validation
   - `test/lib/audit-chain.test.ts` — hash chain creation and verification
   - `test/lib/workflow-composer.test.ts` — correct node/edge generation
2. Create comprehensive README.md (see Section 14)
3. Create `docs/ARCHITECTURE.md`
4. Create `docs/KEEPERHUB-INTEGRATION.md` (every surface used and why)
5. Create `docs/SECURITY.md`
6. Create `docs/FAILURE-MODES.md`
7. Create `docs/AUDIT-CHAIN.md`
8. Record demo video showing:
   - Creating a strategy
   - Workflow created on KeeperHub
   - Real onchain execution
   - Audit trail verification
   - Marketplace listing
9. Prepare submission with:
   - GitHub repo link
   - Demo video link
   - Transaction link(s)

---

## 13. VERIFIED ONCHAIN TRANSACTIONS TABLE

This table MUST be populated with real data during the build and included in the README.

```markdown
| # | What | Network | Chain ID | Transaction | KeeperHub Execution ID | Type |
|---|------|---------|----------|-------------|----------------------|------|
| 1 | Zero-value self-transfer (path proof) | Base Sepolia | 84532 | [0x...](link) | `...` | Direct Execution |
| 2 | Scheduled payment execution | Ethereum Sepolia | 11155111 | [0x...](link) | `...` | Workflow Execution |
| 3 | Balance check workflow run | Base Sepolia | 84532 | N/A (read-only) | `...` | Workflow Execution |
| 4 | Marketplace-listed strategy call | Base Sepolia | 84532 | [0x...](link) | `...` | Marketplace Call |
```

---

## 14. README.md STRUCTURE

The README must be comprehensive, honest, and judge-facing. Follow this structure:

```markdown
# Meridian

**Autonomous strategy execution, sealed onchain.**

Meridian lets you define financial strategies — dollar-cost averaging, scheduled 
payments, yield harvesting, portfolio rebalancing — as human-readable policies. 
An autonomous agent translates them into KeeperHub workflows, executes them with 
full simulation, risk assessment, and safety rails, and logs every decision to a 
tamper-evident audit chain. Proven strategies can be published to the KeeperHub 
Marketplace for other agents to discover and pay for.

Built for the KeeperHub "The Last Mile" hackathon.

## Live Proof

[table of verified transactions — see Section 13]

## The Problem

[2 paragraphs on the real problem]

## The Solution

[2 paragraphs on Meridian's approach]

## Architecture

[Architecture diagram from Section 3]

## KeeperHub Surfaces Used

[Table listing every KH surface: REST API, MCP, Direct Execution, Workflows, 
Marketplace, x402, Batch Read, Risk Assessment, Audit Trail, Notifications, 
Smart Gas — with what Meridian uses each for]

## Strategy Types

[4 strategy descriptions with workflow diagrams]

## Security Model

[Policy engine, simulation-before-execution, testnet constraint, no LLM in 
execution path, no private keys stored]

## Audit Chain

[SHA-256 hash chain description, verification instructions]

## Honest Disclosures

[Testnet only, demo limitations, what this does and does not do]

## Quick Start

[Clone, install, configure, run]

## Environment Variables

[Complete list with descriptions]

## API Reference

[Every endpoint]

## Testing

[How to run tests]

## Project Status

[Phase-by-phase completion status]

## License

MIT
```

---

## 15. CRITICAL RULES FOR THE CODEX AGENT

### DO NOT:
- Use Tailwind CSS or any utility-first CSS framework
- Use `axios` or any HTTP library — use native `fetch`
- Store private keys anywhere in the codebase
- Use an LLM in the execution/decision path — policy is deterministic code
- Create mock transactions — every tx must be real and verifiable
- Use `border` on cards — use background shifts and shadows
- Use generic SaaS UI patterns (colored sidebar, card grids with borders, gradient buttons)
- Use dark mode as default
- Skip simulation before execution
- Check `status === 'error'` alone — check `status !== 'success'` to catch `system_error` and `cancelled`
- Use `functionArgs` as a named object — it MUST be a positional array
- Pass ABI as a raw array — it MUST be `JSON.stringify()`d
- Create workflows without both `nodes` AND `edges` in the same call
- Forget to enable workflows after creation (they are disabled by default)
- Use `GET /api/chains` to verify auth (it is public and answers regardless)
- Fund or reference the login wallet — the ORGANIZATION wallet is what executes

### DO:
- Use CSS Modules for all component styling
- Use `next/font` for font loading
- Use native `crypto` module for SHA-256
- Simulate EVERY transaction before execution
- Use idempotency keys (UUID) on every write operation
- Poll execution status until terminal (`completed` or `failed`)
- Log every action to the audit chain
- Include `sourceHandle: "true"` or `"false"` on all condition node edges
- Use string chain IDs in workflow configs (e.g., `"84532"`, not `84532`)
- Use `GET /api/keys` as the auth verification endpoint
- Reference the organization wallet from `GET /api/user` → `walletAddress`
- Handle rate limits (429) with exponential backoff
- Use `Idempotency-Key` header on REST writes, `idempotency_key` on MCP direct execution
- Make the UI feel editorial, handcrafted, and premium
- Include block explorer links for every transaction
- Write clear, honest documentation

### Typography Rules:
- Headings: serif display font, normal weight, tight letter-spacing
- Body: clean sans-serif, 15px base, 1.6 line-height
- Data/addresses/hashes: monospace, tabular numbers
- Labels/badges: uppercase, 12px, wider letter-spacing, medium weight
- Never mix more than 3 font families on one page

### Color Rules:
- One accent color only (warm copper #B5722E)
- Monochrome base (warm off-white to near-black)
- Status colors are muted, not saturated (forest green for success, not lime)
- No gradients except very subtle background shifts
- No colored section backgrounds — use whitespace to separate

---

## 16. TESTING REQUIREMENTS

### Unit Tests
- Policy engine: validates and rejects strategies correctly
- Audit chain: creates entries, verifies valid chains, detects tampering
- Workflow composer: generates correct nodes, edges, and config for each strategy type
- Format utilities: address truncation, number formatting

### Integration Tests
- KeeperHub client: connects, verifies auth, reads wallet
- Workflow creation: creates a real workflow on KeeperHub
- Execution pipeline: simulates and executes (on testnet)

### Manual Verification Checklist
- [ ] `GET /api/health` returns all green
- [ ] Create a payment strategy via UI
- [ ] Strategy appears in strategy list
- [ ] Create KeeperHub workflow from strategy
- [ ] Workflow appears in KeeperHub dashboard
- [ ] Execute strategy (real onchain tx)
- [ ] Transaction visible on block explorer
- [ ] Execution appears in execution history
- [ ] Audit chain verifies as valid
- [ ] Publish strategy to marketplace
- [ ] Listing visible via marketplace API
- [ ] All pages render without layout issues
- [ ] No console errors in browser

---

## 17. DEMO VIDEO SCRIPT (2-3 minutes)

1. **Open** (10s): Show MERIDIAN landing page. "Meridian is an autonomous strategy execution engine. Set your strategy. The agent handles the last mile."

2. **Create Strategy** (30s): Walk through creating a scheduled payment strategy. Show the form, the policy validation, the preview.

3. **Deploy to KeeperHub** (20s): Click deploy. Show the workflow being created on KeeperHub. Show it in the KeeperHub dashboard.

4. **Execute** (30s): Trigger execution. Show the simulation step, then the live execution. Show the pending state, then the confirmed transaction.

5. **Verify** (20s): Open the transaction on BaseScan/Etherscan. Show it is real.

6. **Audit Trail** (15s): Show the audit log. Run chain verification. Show VALID.

7. **Marketplace** (15s): Publish the strategy to the KeeperHub Marketplace. Show the listing.

8. **Close** (10s): "Meridian uses 10+ KeeperHub surfaces. Every transaction is real. Every decision is audited. The code is open source." Show GitHub link.

---

## 18. SUBMISSION CHECKLIST

Before submitting on DoraHacks:

- [ ] GitHub repo is public with MIT license
- [ ] README.md is complete with verified transaction table
- [ ] `.env.example` has all required variables (no secrets)
- [ ] Demo video is recorded and uploaded
- [ ] At least 2 real onchain transactions executed via KeeperHub
- [ ] Transaction links work and show confirmed status
- [ ] All UI pages load without errors
- [ ] Audit chain verification passes
- [ ] At least 1 workflow listed on KeeperHub marketplace
- [ ] `docs/KEEPERHUB-INTEGRATION.md` lists every surface used
- [ ] `docs/FAILURE-MODES.md` documents known failure handling
- [ ] Tests pass: `npm test`
- [ ] No hardcoded API keys or secrets in the codebase
- [ ] No TODO comments in production code
- [ ] Deploy is live on Vercel (link in README)

---

## 19. WINNING EDGE DETAILS

### What Makes This Score Highest on Every Criterion

**Criterion 1 — Onchain Execution:**
- Multiple real transactions, not just one
- Both workflow execution AND direct execution demonstrated
- Multiple chains (Base Sepolia + Ethereum Sepolia)
- Transaction hashes independently verifiable

**Criterion 2 — KeeperHub Surface Usage:**
We use MORE surfaces than any competitor:
- REST API (workflow CRUD, execution, status, logs)
- MCP Server (tool calls, workflow management)
- Direct Execution (simulate → execute → poll)
- Workflow Builder (triggers, actions, conditions, edges)
- Batch Read Contract (multi-position monitoring)
- Transaction Risk Assessment
- Marketplace (list, price, verify)
- Audit Trail (execution logs, per-node status)
- Smart Gas (multiplier configuration)
- Notifications (webhook alerts)
- Idempotency keys
- Gas sponsorship awareness

**Criterion 3 — Reliability and Observability:**
- Simulation before every write
- Idempotency keys prevent double-execution
- SHA-256 hash-chained audit log with tamper detection
- Cross-verification between local audit and KeeperHub execution records
- Deterministic policy engine (no LLM in decisions)
- Failure mode documentation
- Rate limit handling with exponential backoff

**Criterion 4 — Originality and Real-World Usefulness:**
- Four distinct strategy types (DCA, payments, yield, rebalance)
- Real daily use case (everyone needs recurring onchain operations)
- Marketplace integration (strategies become products)
- Post-hackathon viability (this is a real product concept)

**Criterion 5 — Integration Quality:**
- Clean TypeScript codebase
- Comprehensive tests
- Full documentation
- Premium UI (not default Bootstrap/Tailwind)
- No unnecessary dependencies

### Onboarding UX Bounty Opportunity
Document every KeeperHub API quirk we encounter during the build in `docs/KEEPERHUB-FINDINGS.md`. Include timestamps, error messages, and proposed fixes. This qualifies for the $1,000 "Best Onboarding UX Improvement" bounty, stackable with the main prize.

---

## 20. FONT FILES

Download these font files and place them in `public/fonts/`:

1. **DM Serif Display** — https://fonts.google.com/specimen/DM+Serif+Display
   - Download the Regular weight WOFF2 file
   
2. **Inter** — https://fonts.google.com/specimen/Inter
   - Download Regular (400), Medium (500), SemiBold (600) WOFF2 files
   
3. **JetBrains Mono** — Available via `next/font/google`, no download needed

Alternatively, use `next/font/google` for all three:

```typescript
import { DM_Serif_Display, Inter, JetBrains_Mono } from 'next/font/google';

const displayFont = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});
```

---

## 21. KEEPERHUB TOKEN ADDRESSES FOR TESTNETS

These are the USDC addresses to use in workflows and transfers:

| Network | Chain ID | USDC Address | Faucet |
|---------|----------|-------------|--------|
| Ethereum Sepolia | 11155111 | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | [ETH](https://cloud.google.com/application/web3/faucet/ethereum/sepolia), [USDC](https://faucet.circle.com) |
| Base Sepolia | 84532 | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | [ETH](https://portal.cdp.coinbase.com/products/faucet), [USDC](https://faucet.circle.com) |

**Gas sponsorship on testnets:** Base Sepolia and Ethereum Sepolia both have gas sponsorship. A zero-value self-transfer works even with an unfunded wallet because the relayer pays gas. This is how Phase 4 gets a first transaction without needing faucet funds.

**CRITICAL:** The organization wallet (from `GET /api/user` → `walletAddress`) is the address that executes. It is NOT the login wallet. Fund this address if you need to move value.

---

## 22. RESPONSE TO RATE LIMITS

KeeperHub rate limits:
- MCP: 120 requests/minute per organization
- Direct execution: 60 requests/minute per API key
- Public MCP: 10 requests/minute per IP

When you get a 429:
1. Read the `Retry-After` header (seconds)
2. Wait at least that long
3. Retry with exponential backoff (1s, 2s, 4s, max 30s, max 5 attempts)
4. Always include `Idempotency-Key` on writes so retries are safe

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 5
): Promise<T> {
  let delay = 1000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.status === 429 && attempt < maxAttempts - 1) {
        const retryAfter = err.headers?.get?.('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : delay;
        await new Promise(r => setTimeout(r, waitMs));
        delay = Math.min(delay * 2, 30000);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retry attempts exceeded');
}
```

---

## END OF INSTRUCTION

This document is the complete build specification for MERIDIAN. Every section is essential. Follow the build phases in order. Verify each phase before moving to the next. The goal is a project that scores highest on every judging criterion through genuine depth of integration, real onchain execution, premium UI quality, and comprehensive documentation.

Build it to win. No shortcuts. No simplifications. No managed or skipped features.
