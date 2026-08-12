import { callMCPTool } from './mcp';

const KEEPERHUB_APP_URL = process.env.KEEPERHUB_APP_URL || 'https://app.keeperhub.com';

function parseToolText(result: Awaited<ReturnType<typeof callMCPTool>>): unknown {
  const text = result.content.find(({ type }) => type === 'text')?.text;
  if (!text) return result;
  try { return JSON.parse(text); } catch { return text; }
}

function assertToolSuccess(result: Awaited<ReturnType<typeof callMCPTool>>, operation: string): void {
  if (result.isError) throw new Error(`${operation}: ${result.content.find(({ type }) => type === 'text')?.text || 'KeeperHub MCP error'}`);
}

export interface MarketplacePublishInput {
  workflowId: string;
  slug: string;
  priceUsd: string;
  category: string;
  chain: string;
  inputSchema: Record<string, unknown>;
  outputMapping: Record<string, unknown>;
  workflowType: 'read' | 'write';
}

export function canonicalMarketplaceUrl(slug: string): string {
  return `${KEEPERHUB_APP_URL.replace(/\/$/, '')}/workflows/${encodeURIComponent(slug)}`;
}

export async function publishToMarketplace(input: MarketplacePublishInput) {
  const enable = await callMCPTool('update_workflow', { workflowId: input.workflowId, enabled: true });
  assertToolSuccess(enable, 'Marketplace workflow enable failed');
  const listArgs = {
    workflowId: input.workflowId,
    slug: input.slug,
    category: input.category,
    chain: input.chain,
    inputSchema: input.inputSchema,
    outputMapping: input.outputMapping,
    workflowType: input.workflowType,
  };

  // Current KeeperHub requires price changes while unlisted. First publish reserves the slug,
  // then unlist -> price -> relist preserves it.
  const initialList = await callMCPTool('list_workflow', listArgs);
  assertToolSuccess(initialList, 'Initial marketplace listing failed');
  const unlist = await callMCPTool('unlist_workflow', { workflowId: input.workflowId });
  assertToolSuccess(unlist, 'Marketplace unlist for pricing failed');
  const price = await callMCPTool('update_workflow_listing', { workflowId: input.workflowId, priceUsdcPerCall: input.priceUsd });
  assertToolSuccess(price, 'Marketplace pricing failed');
  const relist = await callMCPTool('list_workflow', listArgs);
  assertToolSuccess(relist, 'Marketplace relisting failed');
  const verify = await callMCPTool('get_workflow_listing', { slug: input.slug });
  assertToolSuccess(verify, 'Marketplace verification failed');
  const verifiedListing = parseToolText(verify) as Record<string, unknown>;
  if (verifiedListing?.isListed !== true) throw new Error('Marketplace verification failed: listing is not live');
  const verifiedSlug = typeof verifiedListing?.listedSlug === 'string' ? verifiedListing.listedSlug : input.slug;
  const verifiedPrice = typeof verifiedListing?.priceUsdcPerCall === 'string' ? verifiedListing.priceUsdcPerCall : input.priceUsd;

  return {
    listed: true,
    slug: verifiedSlug,
    price: verifiedPrice,
    canonicalUrl: canonicalMarketplaceUrl(verifiedSlug),
    listing: verifiedListing,
  };
}

export async function verifyPaymentRequired(slug: string): Promise<{ paymentRequired: boolean; response: unknown }> {
  const result = await callMCPTool('call_workflow', { slug, inputs: {} });
  const response = parseToolText(result);
  const serialized = JSON.stringify(response);
  return { paymentRequired: Boolean(result.isError && /402|payment|required/i.test(serialized)), response };
}
