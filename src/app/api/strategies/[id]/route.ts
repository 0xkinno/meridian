import { NextRequest, NextResponse } from 'next/server';
import { evaluatePolicy } from '@/lib/policy/engine';
import { deleteStrategy, getStrategy, updateStrategy } from '@/lib/store/strategies';
import { isStrategyStatus, type UpdateStrategyInput } from '@/lib/strategies/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext { params: { id: string } }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const strategy = await getStrategy(params.id);
  return strategy ? NextResponse.json({ strategy, policy: evaluatePolicy(strategy) }) : NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const current = await getStrategy(params.id);
  if (!current) return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
  let body: UpdateStrategyInput;
  try { body = await request.json() as UpdateStrategyInput; }
  catch { return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 }); }
  if (body.status !== undefined && !isStrategyStatus(body.status)) return NextResponse.json({ error: 'Invalid strategy status' }, { status: 400 });

  const candidate = { ...current, ...body, config: body.config ? { ...current.config, ...body.config } : current.config };
  const policy = evaluatePolicy(candidate);
  if (!policy.allowed) return NextResponse.json({ error: policy.reason, policy }, { status: 422 });
  const strategy = await updateStrategy(params.id, body);
  return NextResponse.json({ strategy, policy });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  return await deleteStrategy(params.id)
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
}

