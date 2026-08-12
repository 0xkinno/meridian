import type { WorkflowEdge, WorkflowNode } from '@/lib/keeperhub/workflows';
import type { Strategy, StrategyType } from './types';

export interface ComposedWorkflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

const ERC20_BALANCE_ABI = [{
  inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
  name: 'balanceOf',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
}];

function scheduleTrigger(strategy: Strategy): WorkflowNode {
  return {
    id: 'trigger',
    type: 'trigger',
    position: { x: 0, y: 250 },
    data: {
      type: 'trigger',
      label: `Every ${strategy.config.interval || 'hourly'}`,
      config: {
        triggerType: 'Schedule',
        scheduleCron: intervalToCron(strategy.config.interval || 'hourly'),
      },
    },
  };
}

function tokenConfig(address: string, symbol = 'USDC'): string {
  return JSON.stringify({ mode: 'custom', customToken: { address, symbol } });
}

export function composeScheduledPaymentWorkflow(strategy: Strategy & { type: 'payment' }): ComposedWorkflow {
  const tokenAddress = strategy.config.tokenAddress;
  const tokenPayment = Boolean(tokenAddress);
  const nodes: WorkflowNode[] = [
    scheduleTrigger(strategy),
    {
      id: 'check-balance',
      type: 'action',
      position: { x: 280, y: 250 },
      data: {
        type: 'action',
        label: 'Check Balance',
        config: tokenPayment ? {
          actionType: 'web3/check-token-balance',
          network: String(strategy.config.chainId),
          address: strategy.config.senderAddress,
          tokenConfig: tokenConfig(tokenAddress!),
        } : {
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
          condition: tokenPayment
            ? `{{@check-balance:Check Balance.balance.balance}} >= ${strategy.config.amount}`
            : `{{@check-balance:Check Balance.balance}} >= ${strategy.config.amount}`,
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
        config: tokenPayment ? {
          actionType: 'web3/transfer-token',
          network: String(strategy.config.chainId),
          recipientAddress: strategy.config.recipientAddress,
          amount: strategy.config.amount,
          tokenConfig: tokenConfig(tokenAddress!),
          gasLimitMultiplier: strategy.config.gasLimitMultiplier || '1.25',
        } : {
          actionType: 'web3/transfer-funds',
          network: String(strategy.config.chainId),
          recipientAddress: strategy.config.recipientAddress,
          amount: strategy.config.amount,
          gasLimitMultiplier: strategy.config.gasLimitMultiplier || '1.25',
        },
      },
    },
  ];

  return {
    nodes,
    edges: [
      { id: 'e-trigger-balance', source: 'trigger', target: 'check-balance' },
      { id: 'e-balance-condition', source: 'check-balance', target: 'condition-balance' },
      { id: 'e-condition-transfer', source: 'condition-balance', target: 'transfer', sourceHandle: 'true' },
    ],
  };
}

export function composeDCAWorkflow(strategy: Strategy & { type: 'dca' }): ComposedWorkflow {
  const nodes: WorkflowNode[] = [
    scheduleTrigger(strategy),
    {
      id: 'check-balance', type: 'action', position: { x: 280, y: 250 },
      data: {
        type: 'action', label: 'Check Native Balance',
        config: { actionType: 'web3/check-balance', network: String(strategy.config.chainId), address: strategy.config.senderAddress },
      },
    },
    {
      id: 'condition-balance', type: 'action', position: { x: 560, y: 250 },
      data: {
        type: 'action', label: 'Sufficient Balance',
        config: { actionType: 'Condition', condition: `{{@check-balance:Check Native Balance.balance}} >= ${strategy.config.amount}` },
      },
    },
    {
      id: 'transfer', type: 'action', position: { x: 840, y: 200 },
      data: {
        type: 'action', label: 'Execute DCA Allocation',
        config: {
          actionType: 'web3/transfer-funds', network: String(strategy.config.chainId),
          recipientAddress: strategy.config.recipientAddress, amount: strategy.config.amount,
          gasLimitMultiplier: strategy.config.gasLimitMultiplier || '1.25',
        },
      },
    },
  ];
  return {
    nodes,
    edges: [
      { id: 'e-trigger-balance', source: 'trigger', target: 'check-balance' },
      { id: 'e-balance-condition', source: 'check-balance', target: 'condition-balance' },
      { id: 'e-condition-transfer', source: 'condition-balance', target: 'transfer', sourceHandle: 'true' },
    ],
  };
}

export function composeYieldMonitorWorkflow(strategy: Strategy & { type: 'yield' }): ComposedWorkflow {
  const tokenAddress = strategy.config.tokenAddress || process.env.USDC_BASE_SEPOLIA!;
  const contractRead = strategy.config.batchReads?.[0];
  const contractAddress = contractRead?.contractAddress || tokenAddress;
  const nodes: WorkflowNode[] = [
    scheduleTrigger(strategy),
    {
      id: 'check-position', type: 'action', position: { x: 320, y: 250 },
      data: {
        type: 'action', label: 'Check Position Balance',
        config: {
          actionType: 'web3/check-token-balance', network: String(strategy.config.chainId),
          address: strategy.config.positionAddress, tokenConfig: tokenConfig(tokenAddress),
        },
      },
    },
    {
      id: 'read-rewards', type: 'action', position: { x: 640, y: 250 },
      data: {
        type: 'action', label: 'Read Rewards',
        config: {
          actionType: 'web3/read-contract', network: String(strategy.config.chainId),
          contractAddress,
          abi: JSON.stringify(contractRead?.abi || ERC20_BALANCE_ABI),
          abiFunction: contractRead?.functionName || 'balanceOf',
          functionArgs: JSON.stringify(contractRead?.functionArgs || [strategy.config.positionAddress]),
        },
      },
    },
  ];
  return {
    nodes,
    edges: [
      { id: 'e-trigger-position', source: 'trigger', target: 'check-position' },
      { id: 'e-position-rewards', source: 'check-position', target: 'read-rewards' },
    ],
  };
}

export function composeRebalanceCheckWorkflow(strategy: Strategy & { type: 'rebalance' }): ComposedWorkflow {
  const tokenAddress = strategy.config.tokenAddress || strategy.config.allocations?.[0]?.token || process.env.USDC_BASE_SEPOLIA!;
  const nodes: WorkflowNode[] = [
    scheduleTrigger(strategy),
    {
      id: 'check-native', type: 'action', position: { x: 320, y: 250 },
      data: {
        type: 'action', label: 'Check Native Balance',
        config: { actionType: 'web3/check-balance', network: String(strategy.config.chainId), address: strategy.config.senderAddress },
      },
    },
    {
      id: 'check-token', type: 'action', position: { x: 640, y: 250 },
      data: {
        type: 'action', label: 'Check Token Balance',
        config: {
          actionType: 'web3/check-token-balance', network: String(strategy.config.chainId),
          address: strategy.config.senderAddress, tokenConfig: tokenConfig(tokenAddress),
        },
      },
    },
  ];
  return {
    nodes,
    edges: [
      { id: 'e-trigger-native', source: 'trigger', target: 'check-native' },
      { id: 'e-native-token', source: 'check-native', target: 'check-token' },
    ],
  };
}

export const composeRebalanceWorkflow = composeRebalanceCheckWorkflow;

export function composeStrategyWorkflow(strategy: Strategy): ComposedWorkflow {
  const composers: Record<StrategyType, (value: never) => ComposedWorkflow> = {
    payment: composeScheduledPaymentWorkflow,
    dca: composeDCAWorkflow,
    yield: composeYieldMonitorWorkflow,
    rebalance: composeRebalanceCheckWorkflow,
  };
  return composers[strategy.type](strategy as never);
}

export function intervalToCron(interval: string): string {
  return ({ '5min': '*/5 * * * *', '15min': '*/15 * * * *', hourly: '0 * * * *', daily: '0 12 * * *', weekly: '0 12 * * 1' } as Record<string, string>)[interval] || '0 * * * *';
}

