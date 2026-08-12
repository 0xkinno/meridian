import { createHash } from 'crypto';

export interface AuditEntry {
  seq: number;
  ts: string;
  type: string;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

export const GENESIS_HASH = '0'.repeat(64);

export function computeHash(seq: number, ts: string, type: string, payload: Record<string, unknown>, prevHash: string): string {
  return createHash('sha256').update(`${seq}${ts}${type}${JSON.stringify(payload)}${prevHash}`).digest('hex');
}

export function createEntry(seq: number, type: string, payload: Record<string, unknown>, prevHash: string, ts = new Date().toISOString()): AuditEntry {
  return { seq, ts, type, payload, prevHash, hash: computeHash(seq, ts, type, payload, prevHash) };
}

export function verifyChain(entries: AuditEntry[]): { valid: boolean; brokenAt?: number; reason?: string } {
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]!;
    const expectedPrev = index === 0 ? GENESIS_HASH : entries[index - 1]!.hash;
    if (entry.seq !== index + 1) return { valid: false, brokenAt: index, reason: 'sequence mismatch' };
    if (entry.prevHash !== expectedPrev) return { valid: false, brokenAt: index, reason: 'prevHash mismatch' };
    if (computeHash(entry.seq, entry.ts, entry.type, entry.payload, entry.prevHash) !== entry.hash) {
      return { valid: false, brokenAt: index, reason: 'hash mismatch' };
    }
  }
  return { valid: true };
}

