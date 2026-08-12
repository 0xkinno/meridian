import { auditLog } from '../src/lib/audit/logger';
import { executeWorkflow, waitForWorkflowExecution } from '../src/lib/keeperhub/workflows';
import { saveExecution } from '../src/lib/store/executions';

const workflowId = 'c4ce5sjk8dx7owzue235r';

async function main() {
  await auditLog('WORKFLOW_EXECUTION_INTENT', { workflowId });
  const submitted = await executeWorkflow(workflowId);
  await auditLog('WORKFLOW_EXECUTION_SUBMITTED', { workflowId, executionId: submitted.executionId });
  const result = await waitForWorkflowExecution(submitted.executionId, 180_000);
  const transaction = result.transactionHashes[0];
  const chainId = transaction?.chainId || 84532;
  const transactionHash = transaction?.hash;
  const transactionLink = transactionHash
    ? `${chainId === 84532 ? 'https://sepolia.basescan.org' : 'https://sepolia.etherscan.io'}/tx/${transactionHash}`
    : undefined;
  const alerts = result.output && typeof result.output === 'object' && 'conditionResult' in result.output && result.output.conditionResult === false
    ? [{ type: 'ALERT_INSUFFICIENT_BALANCE', message: 'Workflow condition evaluated false; transfer was skipped.', details: { output: result.output } }]
    : [];
  const record = await saveExecution({
    keeperHubExecutionId: submitted.executionId,
    kind: 'workflow',
    status: transactionHash ? 'completed' : alerts.length ? 'skipped' : 'completed',
    chainId,
    network: chainId === 84532 ? 'Base Sepolia' : 'Ethereum Sepolia',
    transactionHash,
    transactionLink,
    alerts,
    nodeResults: result.output,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });
  if (alerts.length) await auditLog('ALERT_INSUFFICIENT_BALANCE', { workflowId, executionId: submitted.executionId, alerts });
  await auditLog('WORKFLOW_EXECUTION_RESULT', { workflowId, executionId: submitted.executionId, transactionHashes: result.transactionHashes, output: result.output, recordId: record.id });
  console.log(JSON.stringify({ submitted, result, record }, null, 2));
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.stack : error); process.exitCode = 1; });

