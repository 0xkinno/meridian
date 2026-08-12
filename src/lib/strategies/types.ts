export type StrategyType = 'dca' | 'payment' | 'yield' | 'rebalance';
export type StrategyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'error';

export interface AllocationTarget {
  token: string;
  targetPercent: number;
}

export interface ContractRead {
  contractAddress: string;
  abi: unknown[];
  functionName: string;
  functionArgs: unknown[];
}

export interface StrategyConfig {
  chainId: number;
  interval: string;
  amount: string;
  tokenAddress?: string;
  recipientAddress?: string;
  senderAddress?: string;
  targetToken?: string;
  slippageTolerance?: number;
  protocol?: string;
  positionAddress?: string;
  harvestContractAddress?: string;
  harvestFunctionName?: string;
  harvestFunctionArgs?: unknown[];
  harvestAbi?: unknown[];
  harvestThreshold?: string;
  allocations?: AllocationTarget[];
  driftThreshold?: number;
  batchReads?: ContractRead[];
  alertWebhookUrl?: string;
  gasLimitMultiplier?: string;
}

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  type: StrategyType;
  status: StrategyStatus;
  config: StrategyConfig;
  keeperHubWorkflowId?: string;
  keeperHubWorkflowSlug?: string;
  marketplaceSlug?: string;
  marketplacePrice?: string;
  createdAt: string;
  updatedAt: string;
  lastExecutionAt?: string;
  executionCount: number;
}

export type CreateStrategyInput = Pick<Strategy, 'name' | 'type' | 'config'> & {
  description?: string;
  status?: StrategyStatus;
};

export type UpdateStrategyInput = Partial<Pick<Strategy, 'name' | 'description' | 'status' | 'config' | 'keeperHubWorkflowId' | 'keeperHubWorkflowSlug' | 'marketplaceSlug' | 'marketplacePrice' | 'lastExecutionAt' | 'executionCount'>>;

export function isStrategyType(value: unknown): value is StrategyType {
  return value === 'dca' || value === 'payment' || value === 'yield' || value === 'rebalance';
}

export function isStrategyStatus(value: unknown): value is StrategyStatus {
  return value === 'draft' || value === 'active' || value === 'paused' || value === 'completed' || value === 'error';
}
