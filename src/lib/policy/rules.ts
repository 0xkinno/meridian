import type { Strategy } from '@/lib/strategies/types';

export const ALLOWED_TESTNET_CHAINS = new Set([84532, 11155111]);
export const MAX_TRANSFER_AMOUNT = 0.1;
export const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
export const ALLOWED_INTERVALS = new Set(['5min', '15min', 'hourly', 'daily', 'weekly']);

export interface PolicyRule {
  id: string;
  validate(strategy: Strategy): string | null;
}

function finiteNonNegative(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

export const policyRules: PolicyRule[] = [
  {
    id: 'testnet-only',
    validate: ({ config }) => ALLOWED_TESTNET_CHAINS.has(config.chainId)
      ? null
      : `Chain ${config.chainId} is not in the testnet allowlist`,
  },
  {
    id: 'strategy-name',
    validate: ({ name }) => name.trim().length >= 3 ? null : 'Strategy name must be at least 3 characters',
  },
  {
    id: 'known-interval',
    validate: ({ config }) => ALLOWED_INTERVALS.has(config.interval)
      ? null
      : `Interval ${config.interval} is not supported`,
  },
  {
    id: 'amount-format',
    validate: ({ config }) => finiteNonNegative(config.amount)
      ? null
      : 'Amount must be a finite non-negative decimal string',
  },
  {
    id: 'transfer-cap',
    validate: ({ type, config }) => {
      if (type === 'yield' || type === 'rebalance') return null;
      return Number(config.amount) <= MAX_TRANSFER_AMOUNT
        ? null
        : `Amount ${config.amount} exceeds cap of ${MAX_TRANSFER_AMOUNT}`;
    },
  },
  {
    id: 'recipient-address',
    validate: ({ type, config }) => {
      if (type !== 'payment' && type !== 'dca' && type !== 'rebalance') return null;
      return config.recipientAddress && ADDRESS_PATTERN.test(config.recipientAddress)
        ? null
        : 'Invalid recipient address format';
    },
  },
  {
    id: 'sender-address',
    validate: ({ config }) => !config.senderAddress || ADDRESS_PATTERN.test(config.senderAddress)
      ? null
      : 'Invalid sender address format',
  },
  {
    id: 'token-address',
    validate: ({ type, config }) => {
      if (type === 'yield') return null;
      return !config.tokenAddress || ADDRESS_PATTERN.test(config.tokenAddress)
        ? null
        : 'Invalid token address format';
    },
  },
  {
    id: 'dca-config',
    validate: ({ type, config }) => {
      if (type !== 'dca') return null;
      if (!config.targetToken || !ADDRESS_PATTERN.test(config.targetToken)) return 'DCA target token must be a valid address';
      if (config.slippageTolerance === undefined || config.slippageTolerance < 0 || config.slippageTolerance > 5) {
        return 'DCA slippage tolerance must be between 0 and 5 percent';
      }
      return null;
    },
  },
  {
    id: 'yield-config',
    validate: ({ type, config }) => {
      if (type !== 'yield') return null;
      if (!config.protocol?.trim()) return 'Yield strategy protocol is required';
      if (!config.positionAddress || !ADDRESS_PATTERN.test(config.positionAddress)) return 'Yield position address must be valid';
      if (!config.harvestThreshold || !finiteNonNegative(config.harvestThreshold)) return 'Harvest threshold must be a non-negative decimal string';
      if (!config.batchReads?.length) return 'Yield strategy requires at least one batch contract read';
      return null;
    },
  },
  {
    id: 'rebalance-config',
    validate: ({ type, config }) => {
      if (type !== 'rebalance') return null;
      if (!config.allocations || config.allocations.length < 2) return 'Rebalance strategy requires at least two allocations';
      const total = config.allocations.reduce((sum, allocation) => sum + allocation.targetPercent, 0);
      if (Math.abs(total - 100) > 0.001) return 'Rebalance target allocations must total 100 percent';
      if (config.allocations.some(({ token }) => !ADDRESS_PATTERN.test(token))) return 'Every rebalance token must be a valid address';
      if (config.driftThreshold === undefined || config.driftThreshold <= 0 || config.driftThreshold > 50) {
        return 'Rebalance drift threshold must be greater than 0 and at most 50 percent';
      }
      return null;
    },
  },
];

