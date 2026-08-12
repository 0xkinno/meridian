const DEFAULT_MCP_URL = 'https://app.keeperhub.com/mcp';
const MCP_PROTOCOL_VERSION = '2025-06-18';
let requestId = 0;
let sessionPromise: Promise<string> | undefined;

export interface MCPContent {
  type: string;
  text?: string;
  [key: string]: unknown;
}

export interface MCPToolResult {
  content: MCPContent[];
  isError?: boolean;
}

interface MCPResponse<T> {
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

function mcpConfig(): { url: string; key: string } {
  const key = process.env.KEEPERHUB_API_KEY;
  if (!key?.startsWith('kh_')) throw new Error('A KeeperHub organization API key is required for MCP');
  return { url: process.env.KEEPERHUB_MCP_URL || DEFAULT_MCP_URL, key };
}

async function rawMcpRequest<T>(
  method: string,
  params: Record<string, unknown>,
  sessionId?: string,
  notification = false,
): Promise<{ result?: T; sessionId?: string }> {
  const { url, key } = mcpConfig();
  if (!notification) requestId += 1;
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'Mcp-Protocol-Version': MCP_PROTOCOL_VERSION,
      ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      ...(!notification ? { id: requestId } : {}),
      method,
      params,
    }),
  });

  const text = await response.text();
  if (notification && response.ok && !text) {
    return { sessionId: response.headers.get('mcp-session-id') || sessionId };
  }
  let payload: MCPResponse<T>;
  try {
    payload = JSON.parse(text) as MCPResponse<T>;
  } catch {
    throw new Error(`KeeperHub MCP returned ${response.status} with a non-JSON response`);
  }
  if (!response.ok || payload.error) {
    throw new Error(`KeeperHub MCP error: ${payload.error?.message || response.status}`);
  }
  return {
    result: payload.result,
    sessionId: response.headers.get('mcp-session-id') || sessionId,
  };
}

async function initializeSession(): Promise<string> {
  const initialized = await rawMcpRequest<{
    protocolVersion: string;
    serverInfo: { name: string; version: string };
  }>('initialize', {
    protocolVersion: MCP_PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: 'meridian', version: '0.1.0' },
  });

  if (!initialized.sessionId) throw new Error('KeeperHub MCP did not issue a session ID');
  await rawMcpRequest('notifications/initialized', {}, initialized.sessionId, true);
  return initialized.sessionId;
}

async function getSession(): Promise<string> {
  sessionPromise ||= initializeSession().catch((error) => {
    sessionPromise = undefined;
    throw error;
  });
  return sessionPromise;
}

async function mcpRequest<T>(method: string, params: Record<string, unknown>): Promise<T> {
  const sessionId = await getSession();
  const response = await rawMcpRequest<T>(method, params, sessionId);
  if (response.result === undefined) throw new Error('KeeperHub MCP response did not include a result');
  return response.result;
}

export async function callMCPTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
  return mcpRequest<MCPToolResult>('tools/call', { name: toolName, arguments: args });
}

export async function listMCPTools(): Promise<unknown[]> {
  const result = await mcpRequest<{ tools?: unknown[] }>('tools/list', {});
  return result.tools || [];
}

export const mcpListWorkflows = () => callMCPTool('list_workflows', {});
export const mcpGetWorkflow = (workflowId: string) => callMCPTool('get_workflow', { workflow_id: workflowId });
export const mcpGetExecution = (executionId: string) => callMCPTool('get_execution', { execution_id: executionId });
export const mcpListWorkflow = (workflowId: string) => callMCPTool('list_workflow', { workflow_id: workflowId });
export const mcpGetWorkflowListing = (slug: string) => callMCPTool('get_workflow_listing', { slug });
