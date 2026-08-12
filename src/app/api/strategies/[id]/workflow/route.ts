import { NextRequest, NextResponse } from 'next/server';
import { evaluatePolicy } from '@/lib/policy/engine';
import { composeStrategyWorkflow } from '@/lib/strategies/composer';
import { getStrategy, updateStrategy } from '@/lib/store/strategies';
import { createWorkflow, createWorkflowViaMCP, enableWorkflow, validateWorkflow } from '@/lib/keeperhub/workflows';
import { auditLog } from '@/lib/audit/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext { params: { id: string } }

export async function POST(request: NextRequest, { params }: RouteContext) {
  const strategy = await getStrategy(params.id);
  if (!strategy) return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
  const policy = evaluatePolicy(strategy);
  if (!policy.allowed) return NextResponse.json({ error: policy.reason, policy }, { status: 422 });
  if (strategy.keeperHubWorkflowId) return NextResponse.json({ error: 'Strategy already has a KeeperHub workflow', workflowId: strategy.keeperHubWorkflowId }, { status: 409 });

  const composed = composeStrategyWorkflow(strategy);
  let surface: 'rest' | 'mcp' = 'rest';
  let workflow: { id: string; slug: string };
  try {
    workflow = await createWorkflow({ name: `MERIDIAN — ${strategy.name}`, description: strategy.description || `${strategy.type} strategy managed by Meridian`, ...composed, enabled: true });
  } catch (restError) {
    const allowFallback = request.nextUrl.searchParams.get('mcpFallback') !== 'false';
    if (!allowFallback) throw restError;
    surface = 'mcp';
    workflow = await createWorkflowViaMCP({ name: `MERIDIAN — ${strategy.name}`, description: strategy.description || `${strategy.type} strategy managed by Meridian`, ...composed, enabled: true });
  }
  await enableWorkflow(workflow.id);
  const validation = await validateWorkflow(workflow.id, false);
  const updated = await updateStrategy(strategy.id, {
    status: 'active',
    keeperHubWorkflowId: workflow.id,
    keeperHubWorkflowSlug: workflow.slug,
  });
  await auditLog('WORKFLOW_CREATED', {
    strategyId: strategy.id,
    strategyType: strategy.type,
    workflowId: workflow.id,
    workflowSlug: workflow.slug,
    surface,
    nodes: composed.nodes.map((node) => ({ id: node.id, label: node.data.label, actionType: node.data.config.actionType || node.data.config.triggerType })),
    edges: composed.edges,
  });
  return NextResponse.json({ workflow, surface, validation, nodes: composed.nodes.length, edges: composed.edges.length, strategy: updated }, { status: 201 });
}
