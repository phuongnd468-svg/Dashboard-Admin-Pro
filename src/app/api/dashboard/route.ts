import { NextResponse } from 'next/server';
import { readDashboardSnapshot } from '@/lib/dashboard';

export async function GET() {
  const snapshot = await readDashboardSnapshot();
  return NextResponse.json(snapshot);
}
