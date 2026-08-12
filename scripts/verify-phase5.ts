import { randomUUID } from 'crypto';
import { auditLog } from '../src/lib/audit/logger';
import { getWalletAddress } from '../src/lib/keeperhub/client';
import { createWorkflow, executeWorkflow, validateWorkflow, waitForWorkflowExecution } from '../src/lib/keeperhub/workflows';
import { saveExecution } from '../src/lib/store/executions';

const BALANCE_OF_ABI = [{
  inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
  name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view', type: 'function',
}];

async function main() {
  const wallet = await getWalletAddress();
  const token = process.env.USDC_BASE_SEPOLIA!;
  const nodes = [
    {
      id: 'trigger', type: 'trigger' as const, position: { x: 0, y: 200 },
      data: { type: 'trigger' as const, label: 'Manual Batch Read', config: { triggerType: 'Manual' } },
    },
    {
      id: 'batch-read', type: 'action' as const, position: { x: 320, y: 200 },
      data: {
        type: 'action' as const, label: 'Batch Read USDC Balances',
        config: {
          actionType: 'web3/batch-read-contract', inputMode: 'uniform', network: '84532',
          contractAddress: token, abi: JSON.stringify(BALANCE_OF_ABI), abiFunction: 'balanceOf',
          calls: JSON.stringify([[wallet], ['0x0000000000000000000000000000000000000000']]),
          argsList: JSON.stringify([[wallet], ['0x0000000000000000000000000000000000000000']]),
          batchSize: 100,
        },
      },
    },
  ];
  const workflow = await createWorkflow({
    name: `MERIDIAN — Batch Read Proof ${randomUUID().slice(0, 8)}`,
    description: 'Multicall3 proof reading multiple Base Sepolia USDC balances in one KeeperHub action.',
    nodes,
    edges: [{ id: 'e-trigger-batch', source: 'trigger', target: 'batch-read' }],
    enabled: true,
  });
  const validation = await validateWorkflow(workflow.id, true);
  const submitted = await executeWorkflow(workflow.id);
  const result = await waitForWorkflowExecution(submitted.executionId, 180_000);
  await auditLog('BATCH_READ_RESULT', { workflowId: workflow.id, executionId: submitted.executionId, validation, output: result.output });
  const record = await saveExecution({
    keeperHubExecutionId: submitted.executionId, kind: 'batch-read', status: 'completed', chainId: 84532,
    network: 'Base Sepolia', alerts: [], nodeResults: result.output,
    createdAt: new Date().toISOString(), completedAt: new Date().toISOString(),
  });
  console.log(JSON.stringify({ workflow, validation, submitted, result, recordId: record.id }, null, 2));
}

main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  await auditLog('BATCH_READ_FAILED', { message }).catch(() => undefined);
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});

