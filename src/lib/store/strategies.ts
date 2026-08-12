import { randomUUID } from 'crypto';
import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import path from 'path';
import type { CreateStrategyInput, Strategy, UpdateStrategyInput } from '@/lib/strategies/types';

const DATA_DIR = path.resolve(process.cwd(), process.env.DATA_DIR || './data');
const STRATEGIES_FILE = path.join(DATA_DIR, 'strategies.json');
let writeQueue = Promise.resolve();

async function ensureStore(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(STRATEGIES_FILE, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    await writeFile(STRATEGIES_FILE, '[]\n', { encoding: 'utf8', flag: 'wx' }).catch((writeError) => {
      if ((writeError as NodeJS.ErrnoException).code !== 'EEXIST') throw writeError;
    });
  }
}

async function readStrategies(): Promise<Strategy[]> {
  await ensureStore();
  const contents = await readFile(STRATEGIES_FILE, 'utf8');
  const parsed: unknown = JSON.parse(contents);
  if (!Array.isArray(parsed)) throw new Error('Strategy store is corrupted: expected an array');
  return parsed as Strategy[];
}

async function atomicWrite(strategies: Strategy[]): Promise<void> {
  await ensureStore();
  const temporary = `${STRATEGIES_FILE}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(strategies, null, 2)}\n`, 'utf8');
  await rename(temporary, STRATEGIES_FILE);
}

function serializedWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

export async function listStrategies(): Promise<Strategy[]> {
  return (await readStrategies()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getStrategy(id: string): Promise<Strategy | null> {
  return (await readStrategies()).find((strategy) => strategy.id === id) || null;
}

export async function createStrategy(input: CreateStrategyInput): Promise<Strategy> {
  return serializedWrite(async () => {
    const strategies = await readStrategies();
    const now = new Date().toISOString();
    const strategy: Strategy = {
      id: randomUUID(),
      name: input.name.trim(),
      description: input.description?.trim(),
      type: input.type,
      status: input.status || 'draft',
      config: input.config,
      createdAt: now,
      updatedAt: now,
      executionCount: 0,
    };
    strategies.push(strategy);
    await atomicWrite(strategies);
    return strategy;
  });
}

export async function updateStrategy(id: string, input: UpdateStrategyInput): Promise<Strategy | null> {
  return serializedWrite(async () => {
    const strategies = await readStrategies();
    const index = strategies.findIndex((strategy) => strategy.id === id);
    if (index < 0) return null;
    const current = strategies[index]!;
    const updated: Strategy = {
      ...current,
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.config !== undefined ? { config: { ...current.config, ...input.config } } : {}),
      ...(input.keeperHubWorkflowId !== undefined ? { keeperHubWorkflowId: input.keeperHubWorkflowId } : {}),
      ...(input.keeperHubWorkflowSlug !== undefined ? { keeperHubWorkflowSlug: input.keeperHubWorkflowSlug } : {}),
      ...(input.marketplaceSlug !== undefined ? { marketplaceSlug: input.marketplaceSlug } : {}),
      ...(input.marketplacePrice !== undefined ? { marketplacePrice: input.marketplacePrice } : {}),
      ...(input.lastExecutionAt !== undefined ? { lastExecutionAt: input.lastExecutionAt } : {}),
      ...(input.executionCount !== undefined ? { executionCount: input.executionCount } : {}),
      updatedAt: new Date().toISOString(),
    };
    strategies[index] = updated;
    await atomicWrite(strategies);
    return updated;
  });
}

export async function deleteStrategy(id: string): Promise<boolean> {
  return serializedWrite(async () => {
    const strategies = await readStrategies();
    const filtered = strategies.filter((strategy) => strategy.id !== id);
    if (filtered.length === strategies.length) return false;
    await atomicWrite(filtered);
    return true;
  });
}
