import { getWalletAddress } from '../src/lib/keeperhub/client';
import { executeWithSafety } from '../src/lib/keeperhub/direct-execution';

async function main() {
  const wallet = await getWalletAddress();
  const results = [];
  for (const [chainId, network] of [[84532, 'Base Sepolia'], [11155111, 'Ethereum Sepolia']] as const) {
    const result = await executeWithSafety({ chainId, recipientAddress: wallet, amount: '0' }, {
      strategyName: `${network} Path Proof`, strategyType: 'payment', network,
    });
    results.push({ chainId, network, ...result.status, recordId: result.record.id });
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.stack : error); process.exitCode = 1; });

