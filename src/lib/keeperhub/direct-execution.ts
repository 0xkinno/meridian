import { randomUUID } from 'crypto';
import { auditLog } from '@/lib/audit/logger';
import { assessTransactionRisk } from '@/lib/risk/evaluator';
import { saveExecution, type ExecutionRecord } from '@/lib/store/executions';
import { keeperHubRequest, KeeperHubError } from './client';

export interface TransferParams {
  chainId: number;
  recipientAddress: string;
  amount: string;
  tokenAddress?: string;
}

export interface SimulationResult {
  success: boolean;
  status: string;
  from: string;
  to: string;
  value: string;
  gasEstimate: string;
  wouldRevert: boolean;
  error?: string;
}

export interface DirectExecutionStatus {
  executionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionHash?: string;
  transactionLink?: string;
  sponsored?: boolean;
  error?: string;
  [key: string]: unknown;
}

function endpoint(params: TransferParams): string {
  return params.tokenAddress ? '/api/execute/token-transfer' : '/api/execute/transfer';
}

function body(params: TransferParams, simulate?: boolean): Record<string, unknown> {
  return {
    chainId: params.chainId,
    recipientAddress: params.recipientAddress,
    amount: params.amount,
    ...(params.tokenAddress ? { tokenAddress: params.tokenAddress } : {}),
    ...(simulate ? { simulate: true } : {}),
  };
}

export async function simulateTransfer(params: TransferParams): Promise<SimulationResult> {
  const response = await keeperHubRequest<SimulationResult>(endpoint(params), { method: 'POST', body: JSON.stringify(body(params, true)) });
  if (!response.ok) {
    return { success: false, status: 'simulation_failed', from: '', to: params.recipientAddress, value: '0', gasEstimate: '0', wouldRevert: true, error: JSON.stringify(response.data) };
  }
  return response.data;
}

export async function executeTransfer(params: TransferParams, idempotencyKey: string): Promise<{ executionId: string; status: string }> {
  const response = await keeperHubRequest<{ executionId: string; status: string }>(endpoint(params), {
    method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(body(params)),
  });
  if (!response.ok) throw new KeeperHubError('Direct execution failed', response.status, response.data, response.headers);
  return response.data;
}

export async function pollExecutionStatus(executionId: string, maxAttempts = 45, intervalMs = 2_000): Promise<DirectExecutionStatus> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await keeperHubRequest<DirectExecutionStatus>(`/api/execute/${executionId}/status`);
    if (!response.ok) throw new KeeperHubError('Direct execution status failed', response.status, response.data, response.headers);
    if (response.data.status === 'completed' || response.data.status === 'failed') return response.data;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Execution ${executionId} did not complete within ${maxAttempts * intervalMs}ms`);
}

export async function executeWithSafety(
  params: TransferParams,
  context: { strategyId?: string; strategyName?: string; strategyType?: string; network: string },
): Promise<{ status: DirectExecutionStatus; record: ExecutionRecord }> {
  const idempotencyKey = randomUUID();
  const risk = await assessTransactionRisk({ ...params, strategyId: context.strategyId });
  await auditLog('RISK_ASSESSMENT', { ...context, params, risk });
  if (!risk.allowed) {
    await auditLog('EXECUTION_BLOCKED', { ...context, params, risk, reason: 'Local risk assessment blocked execution' });
    throw new Error('Execution blocked by risk policy');
  }

  await auditLog('EXECUTION_INTENT', { ...context, params, idempotencyKey });
  const simulation = await simulateTransfer(params);
  await auditLog('SIMULATION_RESULT', { ...context, params, simulation });
  if (!simulation.success || simulation.wouldRevert) {
    await auditLog('EXECUTION_BLOCKED', { ...context, params, simulation, reason: 'Simulation failed or would revert' });
    throw new Error(`Simulation failed: ${simulation.error || simulation.status}`);
  }

  const submitted = await executeTransfer(params, idempotencyKey);
  await auditLog('EXECUTION_SUBMITTED', { ...context, params, executionId: submitted.executionId, idempotencyKey });
  const status = await pollExecutionStatus(submitted.executionId);
  const record = await saveExecution({
    strategyId: context.strategyId,
    strategyName: context.strategyName,
    strategyType: context.strategyType,
    keeperHubExecutionId: submitted.executionId,
    kind: 'direct',
    status: status.status === 'completed' ? 'completed' : 'failed',
    chainId: params.chainId,
    network: context.network,
    simulation: simulation as unknown as Record<string, unknown>,
    risk: risk as unknown as Record<string, unknown>,
    transactionHash: status.transactionHash,
    transactionLink: status.transactionLink,
    sponsored: status.sponsored,
    error: status.error,
    alerts: [],
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });
  await auditLog('EXECUTION_RESULT', { ...context, recordId: record.id, ...status });
  if (status.status !== 'completed') throw new Error(status.error || 'KeeperHub execution failed');
  return { status, record };
}

