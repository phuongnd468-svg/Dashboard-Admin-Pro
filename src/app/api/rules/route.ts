import dayjs from 'dayjs';
import { NextResponse } from 'next/server';
import { readRules, writeRules, type RuleRecord, type RuleStatus } from '@/lib/rules';

type RulePayload = {
  name?: string;
  description?: string;
  calls?: number;
  status?: RuleStatus;
};

function normalizeRulePayload(payload: RulePayload) {
  return {
    name: (payload.name ?? '').trim(),
    description: (payload.description ?? '').trim(),
    calls: Number(payload.calls ?? 0),
    status:
      payload.status === 'running' || payload.status === 'online' || payload.status === 'error'
        ? payload.status
        : 'draft',
  } satisfies Omit<RuleRecord, 'id' | 'updatedAt'>;
}

function validateRulePayload(payload: ReturnType<typeof normalizeRulePayload>) {
  if (!payload.name || !payload.description) {
    return 'Missing required fields.';
  }

  if (!Number.isFinite(payload.calls) || payload.calls < 0) {
    return 'Invalid service calls.';
  }

  return null;
}

export async function GET() {
  const rules = await readRules();
  return NextResponse.json(rules);
}

export async function POST(request: Request) {
  const payload = normalizeRulePayload((await request.json()) as RulePayload);
  const validationError = validateRulePayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const rules = await readRules();
  const newRule: RuleRecord = {
    id: `rule-${Date.now()}`,
    ...payload,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };

  const nextRules = [newRule, ...rules];
  await writeRules(nextRules);

  return NextResponse.json(newRule, { status: 201 });
}
