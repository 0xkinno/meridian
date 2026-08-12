import { NextRequest, NextResponse } from 'next/server';
import { auditLog } from '@/lib/audit/logger';
import { publishToMarketplace, verifyPaymentRequired } from '@/lib/keeperhub/marketplace';
import { getStrategy, updateStrategy } from '@/lib/store/strategies';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
interface RouteContext { params: { id: string } }

export async function POST(request: NextRequest, { params }: RouteContext) {
  const strategy = await getStrategy(params.id);
  if (!strategy) return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
  if (!strategy.keeperHubWorkflowId) return NextResponse.json({ error: 'Create a KeeperHub workflow before publishing' }, { status: 409 });
  const body = await request.json().catch(() => ({})) as { slug?: string; price?: string };
  const slug = body.slug || `meridian-${strategy.type}-${strategy.id.slice(0, 8)}`;
  const price = body.price || '0.05';
  try {
    const listing = await publishToMarketplace({
      workflowId: strategy.keeperHubWorkflowId,
      slug,
      priceUsd: price,
      category: 'defi',
      chain: strategy.config.chainId === 84532 || strategy.config.chainId === 8453 ? 'base' : 'ethereum',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      outputMapping: { result: '@output' },
      workflowType: 'read',
    });
    const payment = await verifyPaymentRequired(slug);
    await updateStrategy(strategy.id, { marketplaceSlug: listing.slug, marketplacePrice: listing.price });
    await auditLog('MARKETPLACE_LISTED', { strategyId: strategy.id, workflowId: strategy.keeperHubWorkflowId, listing, payment });
    return NextResponse.json({ listing, payment, canonicalUrl: listing.canonicalUrl }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Marketplace publishing failed';
    await auditLog('MARKETPLACE_LISTING_FAILED', { strategyId: strategy.id, workflowId: strategy.keeperHubWorkflowId, message });
    const paymentRequired = /402|upgrade_required|payment required/i.test(message);
    return NextResponse.json({ error: message, paymentRequired }, { status: paymentRequired ? 402 : 502 });
  }
}
