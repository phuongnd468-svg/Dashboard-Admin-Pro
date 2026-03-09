import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';
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

async function resolveId(params: Promise<unknown>) {
  const value = (await params) as { id?: string };
  return value.id ?? '';
}

export async function PUT(request: NextRequest, { params }: { params: Promise<unknown> }) {
  const id = await resolveId(params);
  const payload = normalizeRulePayload((await request.json()) as RulePayload);
  const validationError = validateRulePayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const rules = await readRules();
  const existingIndex = rules.findIndex((item) => item.id === id);

  if (existingIndex === -1) {
    return NextResponse.json({ message: 'Rule not found.' }, { status: 404 });
  }

  const updatedRule: RuleRecord = {
    ...rules[existingIndex],
    ...payload,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };

  const nextRules = [...rules];
  nextRules[existingIndex] = updatedRule;
  await writeRules(nextRules);

  return NextResponse.json(updatedRule);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<unknown> }) {
  const id = await resolveId(params);
  const rules = await readRules();
  const nextRules = rules.filter((item) => item.id !== id);

  if (nextRules.length === rules.length) {
    return NextResponse.json({ message: 'Rule not found.' }, { status: 404 });
  }

  await writeRules(nextRules);
  return NextResponse.json({ ok: true });
}
