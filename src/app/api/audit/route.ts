import { NextResponse } from 'next/server';
import { readAuditLog, verifyAuditLog } from '@/lib/audit/logger';

export const dynamic = 'force-dynamic';
export async function GET() {
  const entries = await readAuditLog();
  return NextResponse.json({ entries, verification: await verifyAuditLog() });
}

