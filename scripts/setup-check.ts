const requiredVariables = [
  'KEEPERHUB_API_KEY',
  'KEEPERHUB_API_URL',
  'KEEPERHUB_MCP_URL',
  'PRIMARY_CHAIN_ID',
  'SECONDARY_CHAIN_ID',
  'USDC_BASE_SEPOLIA',
  'USDC_SEPOLIA',
] as const;

function assertEnvironment(): void {
  const missing = requiredVariables.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  if (!process.env.KEEPERHUB_API_KEY?.startsWith('kh_')) {
    throw new Error('KEEPERHUB_API_KEY must be an organization key beginning with kh_');
  }
}

async function requestJson(path: string): Promise<{ status: number; data: unknown }> {
  const response = await fetch(`${process.env.KEEPERHUB_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${process.env.KEEPERHUB_API_KEY}`, Accept: 'application/json' },
  });
  const text = await response.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text.slice(0, 200); }
  return { status: response.status, data };
}

async function main(): Promise<void> {
  assertEnvironment();
  const auth = await requestJson('/api/keys');
  if (auth.status !== 200) throw new Error(`KeeperHub authentication probe failed with HTTP ${auth.status}`);
  const user = await requestJson('/api/user');
  if (user.status !== 200) throw new Error(`KeeperHub user probe failed with HTTP ${user.status}`);

  const wallet = typeof user.data === 'object' && user.data !== null && 'walletAddress' in user.data
    ? String(user.data.walletAddress)
    : '';
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) throw new Error('KeeperHub organization wallet was missing or invalid');

  const mcpHeaders = {
    Authorization: `Bearer ${process.env.KEEPERHUB_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
    'Mcp-Protocol-Version': '2025-06-18',
  };
  const initializeResponse = await fetch(process.env.KEEPERHUB_MCP_URL!, {
    method: 'POST',
    headers: mcpHeaders,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'meridian-setup-check', version: '0.1.0' },
      },
    }),
  });
  const initialize = await initializeResponse.json() as { result?: unknown; error?: unknown };
  const sessionId = initializeResponse.headers.get('mcp-session-id');
  if (!initializeResponse.ok || initialize.error || !sessionId) {
    throw new Error(`KeeperHub MCP initialize failed with HTTP ${initializeResponse.status}`);
  }

  const initializedResponse = await fetch(process.env.KEEPERHUB_MCP_URL!, {
    method: 'POST',
    headers: { ...mcpHeaders, 'Mcp-Session-Id': sessionId },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }),
  });
  if (!initializedResponse.ok) throw new Error(`KeeperHub MCP session acknowledgement failed with HTTP ${initializedResponse.status}`);

  const mcpResponse = await fetch(process.env.KEEPERHUB_MCP_URL!, {
    method: 'POST',
    headers: { ...mcpHeaders, 'Mcp-Session-Id': sessionId },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }),
  });
  const mcp = await mcpResponse.json() as { result?: { tools?: unknown[] }; error?: unknown };
  if (!mcpResponse.ok || mcp.error) throw new Error(`KeeperHub MCP probe failed with HTTP ${mcpResponse.status}`);

  console.log(JSON.stringify({
    keeperhub: true,
    wallet,
    mcpTools: mcp.result?.tools?.length || 0,
    primaryChain: process.env.PRIMARY_CHAIN_ID,
    secondaryChain: process.env.SECONDARY_CHAIN_ID,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
