import type { Strategy } from '@/lib/strategies/types';
import { policyRules } from './rules';

export interface PolicyResult {
  allowed: boolean;
  reason: string;
  violations: string[];
  evaluatedRules: string[];
}

export function evaluatePolicy(strategy: Strategy): PolicyResult {
  const violations = policyRules
    .map((rule) => rule.validate(strategy))
    .filter((violation): violation is string => violation !== null);

  return {
    allowed: violations.length === 0,
    reason: violations.length === 0 ? 'All policy checks passed' : `Blocked: ${violations.join('; ')}`,
    violations,
    evaluatedRules: policyRules.map(({ id }) => id),
  };
}

