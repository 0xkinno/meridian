import { NextResponse } from 'next/server';
import { listExecutions } from '@/lib/store/executions';

export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json({ executions: await listExecutions() }); }

