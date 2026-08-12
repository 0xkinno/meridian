import { randomUUID } from 'crypto';
import { keeperHubRequest, KeeperHubError } from './client';
import { callMCPTool } from './mcp';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action';
  position: { x: number; y: number };
  data: {
    type: 'trigger' | 'action';
    label: string;
    config: Record<string, unknown>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: 'true' | 'false' | 'loop' | 'done';
  type?: string;
}

export interface CreateWorkflowPayload {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  enabled?: boolean;
}

export interface WorkflowExecutionResult {
  executionId: string;
  status: string;
  completed: boolean;
  transactionHashes: Array<{ hash: string; nodeId: string; nodeName: string; chainId?: number; network?: string }>;
  output: unknown;
  error: string | null;
}

export async function createWorkflow(payload: CreateWorkflowPayload): Promise<{ id: string; slug: string }> {
  const response = await keeperHubRequest<{ id: string; slug?: string; workflow?: { id: string; slug?: string } }>(
    '/api/workflows/create',
    {
      method: 'POST',
      headers: { 'Idempotency-Key': randomUUID() },
      body: JSON.stringify({ ...payload, enabled: payload.enabled ?? true }),
    },
  );
  if (!response.ok) {
    throw new KeeperHubError('Create workflow failed', response.status, response.data, response.headers);
  }
  const id = response.data.id || response.data.workflow?.id;
  if (!id) throw new Error('KeeperHub workflow creation response did not include an ID');
  return { id, slug: response.data.slug || response.data.workflow?.slug || id };
}

export async function createWorkflowViaMCP(payload: CreateWorkflowPayload): Promise<{ id: string; slug: string; raw: unknown }> {
  const result = await callMCPTool('create_workflow', {
    name: payload.name,
    description: payload.description,
    nodes: payload.nodes,
    edges: payload.edges,
    enabled: payload.enabled ?? true,
    idempotency_key: randomUUID(),
  });
  if (result.isError) throw new Error(result.content[0]?.text || 'MCP workflow creation failed');
  const rawText = result.content.find(({ type }) => type === 'text')?.text || '{}';
  const raw = JSON.parse(rawText) as { id?: string; workflowId?: string; slug?: string; result?: { id?: string; slug?: string } };
  const id = raw.id || raw.workflowId || raw.result?.id;
  if (!id) throw new Error(`MCP workflow creation response did not include an ID: ${rawText}`);
  return { id, slug: raw.slug || raw.result?.slug || id, raw };
}

export async function enableWorkflow(workflowId: string): Promise<void> {
  const result = await callMCPTool('update_workflow', { workflowId, enabled: true });
  if (result.isError) throw new Error(result.content[0]?.text || 'Failed to enable KeeperHub workflow');
}

export async function validateWorkflow(workflowId: string, deepCheck = false): Promise<unknown> {
  const result = await callMCPTool('validate_workflow', { workflowId, deepCheck });
  if (result.isError) throw new Error(result.content[0]?.text || 'KeeperHub workflow validation failed');
  const text = result.content.find(({ type }) => type === 'text')?.text;
  return text ? JSON.parse(text) : result;
}

export async function executeWorkflow(workflowId: string, input: Record<string, unknown> = {}): Promise<{ executionId: string; status: string }> {
  const response = await keeperHubRequest<{ executionId: string; status: string }>(
    `/api/workflows/${workflowId}/execute`,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': randomUUID() },
      body: JSON.stringify({ input }),
    },
  );
  if (!response.ok) throw new KeeperHubError('Workflow execution failed', response.status, response.data, response.headers);
  return response.data;
}

export async function waitForWorkflowExecution(executionId: string, deadlineMs = 120_000): Promise<WorkflowExecutionResult> {
  const giveUpAt = Date.now() + deadlineMs;
  while (Date.now() < giveUpAt) {
    const response = await keeperHubRequest<WorkflowExecutionResult>(
      `/api/workflows/executions/${executionId}/wait?timeoutMs=55000`,
    );
    if (!response.ok) throw new KeeperHubError('Workflow wait failed', response.status, response.data, response.headers);
    if (!response.data.completed) continue;
    if (response.data.status !== 'success') throw new Error(response.data.error || `Execution ${response.data.status}`);
    return response.data;
  }
  throw new Error(`Execution ${executionId} did not finish within ${deadlineMs}ms`);
}

export async function getExecutionStatus(executionId: string): Promise<unknown> {
  const response = await keeperHubRequest(`/api/workflows/executions/${executionId}/status`);
  if (!response.ok) throw new KeeperHubError('Execution status failed', response.status, response.data, response.headers);
  return response.data;
}

export async function getExecutionLogs(executionId: string): Promise<unknown> {
  const response = await keeperHubRequest(`/api/workflows/executions/${executionId}/logs`);
  if (!response.ok) throw new KeeperHubError('Execution logs failed', response.status, response.data, response.headers);
  return response.data;
}

