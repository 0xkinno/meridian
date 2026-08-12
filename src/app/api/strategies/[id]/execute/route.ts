import { NextRequest, NextResponse } from 'next/server';
import { getStrategy, updateStrategy } from '@/lib/store/strategies';
import { executeWithSafety } from '@/lib/keeperhub/direct-execution';
import { getWalletAddress } from '@/lib/keeperhub/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
interface RouteContext { params: { id: string } }

export async function POST(request: NextRequest, { params }: RouteContext) {
  const strategy = await getStrategy(params.id);
  if (!strategy) return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
  const body = await request.json().catch(() => ({})) as { amount?: string; chainId?: number; tokenAddress?: string };
  const recipientAddress = strategy.config.recipientAddress || await getWalletAddress();
  const chainId = body.chainId || strategy.config.chainId;
  try {
    const result = await executeWithSafety({
      chainId,
      recipientAddress,
      amount: body.amount ?? strategy.config.amount,
      tokenAddress: body.tokenAddress ?? strategy.config.tokenAddress,
    }, {
      strategyId: strategy.id,
      strategyName: strategy.name,
      strategyType: strategy.type,
      network: chainId === 84532 ? 'Base Sepolia' : 'Ethereum Sepolia',
    });
    await updateStrategy(strategy.id, { lastExecutionAt: new Date().toISOString(), executionCount: strategy.executionCount + 1 });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Execution failed' }, { status: 502 });
  }
}

