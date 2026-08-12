import { NextResponse } from 'next/server';
import { getChains, getWalletAddress, verifyConnection } from '@/lib/keeperhub/client';
import { listMCPTools } from '@/lib/keeperhub/mcp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const checkedAt = new Date().toISOString();
  try {
    const keeperhub = await verifyConnection();
    if (!keeperhub) {
      return NextResponse.json(
        { keeperhub: false, wallet: null, chains: [], mcpTools: 0, checkedAt, error: 'KeeperHub authentication failed' },
        { status: 503 },
      );
    }

    const [wallet, chains, tools] = await Promise.all([
      getWalletAddress(),
      getChains(),
      listMCPTools(),
    ]);

    return NextResponse.json({
      keeperhub: true,
      wallet,
      chains,
      mcpTools: tools.length,
      checkedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        keeperhub: false,
        wallet: null,
        chains: [],
        mcpTools: 0,
        checkedAt,
        error: error instanceof Error ? error.message : 'Unknown health-check failure',
      },
      { status: 503 },
    );
  }
}

