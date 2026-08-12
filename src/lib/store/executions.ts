import { randomUUID } from 'crypto';
import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import path from 'path';

export type ExecutionKind = 'direct' | 'workflow' | 'batch-read' | 'marketplace';
export type ExecutionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export interface ExecutionAlert {
  type: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ExecutionRecord {
  id: string;
  strategyId?: string;
  strategyName?: string;
  strategyType?: string;
  keeperHubExecutionId: string;
  kind: ExecutionKind;
  status: ExecutionStatus;
  chainId: number;
  network: string;
  simulation?: Record<string, unknown>;
  risk?: Record<string, unknown>;
  transactionHash?: string;
  transactionLink?: string;
  sponsored?: boolean;
  error?: string;
  alerts: ExecutionAlert[];
  nodeResults?: unknown;
  createdAt: string;
  completedAt?: string;
}

const DATA_DIR = path.resolve(process.cwd(), process.env.DATA_DIR || './data');
const EXECUTIONS_FILE = path.join(DATA_DIR, 'executions.json');
let queue = Promise.resolve();

async function readRecords(): Promise<ExecutionRecord[]> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const parsed: unknown = JSON.parse(await readFile(EXECUTIONS_FILE, 'utf8'));
    if (!Array.isArray(parsed)) throw new Error('Execution store is corrupted');
    return parsed as ExecutionRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function writeRecords(records: ExecutionRecord[]): Promise<void> {
  const temporary = `${EXECUTIONS_FILE}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
  await rename(temporary, EXECUTIONS_FILE);
}

function serialized<T>(operation: () => Promise<T>): Promise<T> {
  const result = queue.then(operation, operation);
  queue = result.then(() => undefined, () => undefined);
  return result;
}

export async function listExecutions(): Promise<ExecutionRecord[]> {
  return (await readRecords()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getExecutionRecord(id: string): Promise<ExecutionRecord | null> {
  return (await readRecords()).find((record) => record.id === id || record.keeperHubExecutionId === id) || null;
}

export async function saveExecution(input: Omit<ExecutionRecord, 'id'> & { id?: string }): Promise<ExecutionRecord> {
  return serialized(async () => {
    const records = await readRecords();
    const record: ExecutionRecord = { ...input, id: input.id || randomUUID() };
    const index = records.findIndex(({ id, keeperHubExecutionId }) => id === record.id || keeperHubExecutionId === record.keeperHubExecutionId);
    if (index >= 0) records[index] = record; else records.push(record);
    await writeRecords(records);
    return record;
  });
}

