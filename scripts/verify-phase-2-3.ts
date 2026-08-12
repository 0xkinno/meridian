import { evaluatePolicy } from '../src/lib/policy/engine';
import { composeStrategyWorkflow } from '../src/lib/strategies/composer';
import { createStrategy, getStrategy, updateStrategy } from '../src/lib/store/strategies';
import { getWalletAddress } from '../src/lib/keeperhub/client';
import { createWorkflow, createWorkflowViaMCP, enableWorkflow, validateWorkflow } from '../src/lib/keeperhub/workflows';
import { auditLog } from '../src/lib/audit/logger';

async function main() {
  const wallet = await getWalletAddress();
  const strategy = await createStrategy({
    name: `Base Sepolia Path Proof ${new Date().toISOString().slice(11, 19)}`,
    description: 'Policy-bound zero-value path proof composed by Meridian.',
    type: 'payment',
    config: {
      chainId: 84532,
      interval: 'hourly',
      amount: '0',
      senderAddress: wallet,
      recipientAddress: wallet,
      gasLimitMultiplier: '1.25',
    },
  });

  const policy = evaluatePolicy(strategy);
  if (!policy.allowed) throw new Error(policy.reason);
  const composed = composeStrategyWorkflow(strategy);

  let workflow: { id: string; slug: string };
  let surface = 'REST';
  try {
    workflow = await createWorkflow({
      name: `MERIDIAN — ${strategy.name}`,
      description: strategy.description || 'Meridian strategy',
      ...composed,
      enabled: true,
    });
  } catch (error) {
    surface = 'MCP';
    console.error(`REST workflow create unavailable; verifying through MCP: ${error instanceof Error ? error.message : error}`);
    workflow = await createWorkflowViaMCP({
      name: `MERIDIAN — ${strategy.name}`,
      description: strategy.description || 'Meridian strategy',
      ...composed,
      enabled: true,
    });
  }

  await enableWorkflow(workflow.id);
  const validation = await validateWorkflow(workflow.id);
  await updateStrategy(strategy.id, {
    status: 'active',
    keeperHubWorkflowId: workflow.id,
    keeperHubWorkflowSlug: workflow.slug,
  });
  await auditLog('WORKFLOW_CREATED', {
    strategyId: strategy.id,
    workflowId: workflow.id,
    workflowSlug: workflow.slug,
    surface,
    nodes: composed.nodes.length,
    edges: composed.edges.length,
  });
  const persisted = await getStrategy(strategy.id);

  console.log(JSON.stringify({
    phase2: {
      strategyId: strategy.id,
      policyAllowed: policy.allowed,
      persisted: persisted?.id === strategy.id,
    },
    phase3: {
      surface,
      workflowId: workflow.id,
      workflowSlug: workflow.slug,
      nodes: composed.nodes.length,
      edges: composed.edges.length,
      validation,
    },
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
