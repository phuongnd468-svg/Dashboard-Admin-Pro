import { NextResponse } from 'next/server';
import { readMonitorSnapshot } from '@/lib/monitor';

export async function GET() {
  const snapshot = await readMonitorSnapshot();
  return NextResponse.json(snapshot);
}
