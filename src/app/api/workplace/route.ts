import { NextResponse } from 'next/server';
import { readWorkplaceSnapshot } from '@/lib/workplace';

export async function GET() {
  const snapshot = await readWorkplaceSnapshot();
  return NextResponse.json(snapshot);
}
