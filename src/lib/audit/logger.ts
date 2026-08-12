import { mkdir, open, readFile } from 'fs/promises';
import path from 'path';
import { createEntry, GENESIS_HASH, type AuditEntry, verifyChain } from './chain';

const DATA_DIR = path.resolve(process.cwd(), process.env.DATA_DIR || './data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.jsonl');
let auditQueue = Promise.resolve();

export async function readAuditLog(): Promise<AuditEntry[]> {
  try {
    const contents = await readFile(AUDIT_FILE, 'utf8');
    return contents.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as AuditEntry);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export function auditLog(type: string, payload: Record<string, unknown>): Promise<AuditEntry> {
  const operation = auditQueue.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    const entries = await readAuditLog();
    const verification = verifyChain(entries);
    if (!verification.valid) throw new Error(`Audit chain is invalid at entry ${verification.brokenAt}: ${verification.reason}`);
    const entry = createEntry(entries.length + 1, type, payload, entries.at(-1)?.hash || GENESIS_HASH);
    const handle = await open(AUDIT_FILE, 'a');
    try { await handle.appendFile(`${JSON.stringify(entry)}\n`, 'utf8'); await handle.sync(); }
    finally { await handle.close(); }
    return entry;
  });
  auditQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export async function verifyAuditLog() {
  return verifyChain(await readAuditLog());
}

