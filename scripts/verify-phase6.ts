import { auditLog } from '../src/lib/audit/logger';
import { publishToMarketplace, verifyPaymentRequired } from '../src/lib/keeperhub/marketplace';
import { createStrategy, updateStrategy } from '../src/lib/store/strategies';
import { getWalletAddress } from '../src/lib/keeperhub/client';

const workflowId = 'x6rhuwkc4mbac3fnfp7yq';

async function main() {
  const wallet = await getWalletAddress();
  const token = process.env.USDC_BASE_SEPOLIA!;
  const strategy = await createStrategy({
    name: 'Base USDC Position Monitor', type: 'yield',
    description: 'Paid read workflow that batch-reads Base Sepolia USDC balances through KeeperHub Multicall3.',
    config: {
      chainId: 84532, interval: 'hourly', amount: '0', protocol: 'USDC', positionAddress: wallet,
      tokenAddress: token, harvestThreshold: '0',
      batchReads: [{
        contractAddress: token,
        abi: [{ inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }],
        functionName: 'balanceOf', functionArgs: [wallet],
      }],
    },
  });
  await updateStrategy(strategy.id, { status: 'active', keeperHubWorkflowId: workflowId, keeperHubWorkflowSlug: workflowId });
  const slug = `meridian-base-usdc-monitor-${strategy.id.slice(0, 8)}`;
  const listing = await publishToMarketplace({
    workflowId, slug, priceUsd: '0.05', category: 'defi', chain: 'base', workflowType: 'read',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputMapping: { balances: '@batch-read.results', totalCalls: '@batch-read.totalCalls' },
  });
  const payment = await verifyPaymentRequired(slug);
  await updateStrategy(strategy.id, { marketplaceSlug: slug, marketplacePrice: '0.05' });
  await auditLog('MARKETPLACE_LISTED', { strategyId: strategy.id, workflowId, listing, payment });
  console.log(JSON.stringify({ strategyId: strategy.id, listing, payment }, null, 2));
}

main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  await auditLog('MARKETPLACE_LISTING_FAILED', { workflowId, message }).catch(() => undefined);
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
