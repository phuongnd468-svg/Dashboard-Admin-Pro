import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';
import {
  readPermissions,
  writePermissions,
  type PermissionAction,
  type PermissionRecord,
  type PermissionScope,
  type PermissionStatus,
} from '@/lib/permissions';

type PermissionPayload = {
  name?: string;
  module?: string;
  action?: PermissionAction;
  scope?: PermissionScope;
  description?: string;
  status?: PermissionStatus;
};

function normalizePermissionPayload(payload: PermissionPayload) {
  return {
    name: (payload.name ?? '').trim(),
    module: (payload.module ?? '').trim(),
    action:
      payload.action === 'write' ||
      payload.action === 'approve' ||
      payload.action === 'publish' ||
      payload.action === 'export'
        ? payload.action
        : 'read',
    scope: payload.scope === 'regional' || payload.scope === 'brand' ? payload.scope : 'global',
    description: (payload.description ?? '').trim(),
    status: payload.status === 'inactive' ? 'inactive' : 'active',
  } satisfies Omit<PermissionRecord, 'id' | 'updatedAt'>;
}

function validatePermissionPayload(payload: ReturnType<typeof normalizePermissionPayload>) {
  if (!payload.name || !payload.module || !payload.description) {
    return 'Missing required fields.';
  }

  return null;
}

async function resolveId(params: Promise<unknown>) {
  const value = (await params) as { id?: string };
  return value.id ?? '';
}

export async function PUT(request: NextRequest, { params }: { params: Promise<unknown> }) {
  const id = await resolveId(params);
  const payload = normalizePermissionPayload((await request.json()) as PermissionPayload);
  const validationError = validatePermissionPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const permissions = await readPermissions();
  const existingIndex = permissions.findIndex((item) => item.id === id);

  if (existingIndex === -1) {
    return NextResponse.json({ message: 'Permission not found.' }, { status: 404 });
  }

  const updatedPermission: PermissionRecord = {
    ...permissions[existingIndex],
    ...payload,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };
  const nextPermissions = [...permissions];
  nextPermissions[existingIndex] = updatedPermission;
  await writePermissions(nextPermissions);

  return NextResponse.json(updatedPermission);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<unknown> }) {
  const id = await resolveId(params);
  const permissions = await readPermissions();
  const nextPermissions = permissions.filter((item) => item.id !== id);

  if (nextPermissions.length === permissions.length) {
    return NextResponse.json({ message: 'Permission not found.' }, { status: 404 });
  }

  await writePermissions(nextPermissions);
  return NextResponse.json({ ok: true });
}
