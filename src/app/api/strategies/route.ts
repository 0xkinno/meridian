import { NextRequest, NextResponse } from 'next/server';
import { evaluatePolicy } from '@/lib/policy/engine';
import { createStrategy, listStrategies } from '@/lib/store/strategies';
import { isStrategyStatus, isStrategyType, type CreateStrategyInput, type Strategy } from '@/lib/strategies/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ strategies: await listStrategies() });
}

export async function POST(request: NextRequest) {
  let body: Partial<CreateStrategyInput>;
  try { body = await request.json() as Partial<CreateStrategyInput>; }
  catch { return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 }); }

  if (typeof body.name !== 'string' || !isStrategyType(body.type) || !body.config || typeof body.config !== 'object') {
    return NextResponse.json({ error: 'name, type, and config are required' }, { status: 400 });
  }
  if (body.status !== undefined && !isStrategyStatus(body.status)) {
    return NextResponse.json({ error: 'Invalid strategy status' }, { status: 400 });
  }

  const candidate: Strategy = {
    id: 'policy-preview',
    name: body.name,
    description: body.description,
    type: body.type,
    status: body.status || 'draft',
    config: body.config,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    executionCount: 0,
  };
  const policy = evaluatePolicy(candidate);
  if (!policy.allowed) return NextResponse.json({ error: policy.reason, policy }, { status: 422 });

  const strategy = await createStrategy(body as CreateStrategyInput);
  return NextResponse.json({ strategy, policy }, { status: 201 });
}

