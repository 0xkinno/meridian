import { ADDRESS_PATTERN, ALLOWED_TESTNET_CHAINS, MAX_TRANSFER_AMOUNT } from '@/lib/policy/rules';
import { listExecutions } from '@/lib/store/executions';

export interface TransactionRiskInput {
  chainId: number;
  recipientAddress: string;
  amount: string;
  strategyId?: string;
}

export interface RiskAssessment {
  allowed: boolean;
  score: number;
  level: 'low' | 'medium' | 'high' | 'blocked';
  checks: Array<{ id: string; passed: boolean; detail: string }>;
  source: 'local';
}

export async function assessTransactionRisk(input: TransactionRiskInput): Promise<RiskAssessment> {
  const recentCutoff = Date.now() - 60_000;
  const recent = (await listExecutions()).filter((execution) =>
    execution.strategyId === input.strategyId && new Date(execution.createdAt).getTime() >= recentCutoff,
  ).length;
  const amount = Number(input.amount);
  const checks = [
    { id: 'testnet-allowlist', passed: ALLOWED_TESTNET_CHAINS.has(input.chainId), detail: `Chain ${input.chainId}` },
    { id: 'recipient-format', passed: ADDRESS_PATTERN.test(input.recipientAddress), detail: input.recipientAddress },
    { id: 'amount-format', passed: Number.isFinite(amount) && amount >= 0, detail: input.amount },
    { id: 'policy-cap', passed: amount <= MAX_TRANSFER_AMOUNT, detail: `Maximum ${MAX_TRANSFER_AMOUNT}` },
    { id: 'execution-rate', passed: recent < 3, detail: `${recent} executions for this strategy in the last minute` },
  ];
  const failures = checks.filter(({ passed }) => !passed).length;
  const score = Math.min(100, failures * 30 + (recent * 5));
  return {
    allowed: failures === 0,
    score,
    level: failures > 0 ? 'blocked' : score >= 40 ? 'high' : score >= 20 ? 'medium' : 'low',
    checks,
    source: 'local',
  };
}

