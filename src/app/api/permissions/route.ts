import dayjs from 'dayjs';
import { NextResponse } from 'next/server';
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

export async function GET() {
  const permissions = await readPermissions();
  return NextResponse.json(permissions);
}

export async function POST(request: Request) {
  const payload = normalizePermissionPayload((await request.json()) as PermissionPayload);
  const validationError = validatePermissionPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const permissions = await readPermissions();
  const newPermission: PermissionRecord = {
    id: `perm-${Date.now()}`,
    ...payload,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };
  const nextPermissions = [newPermission, ...permissions];
  await writePermissions(nextPermissions);

  return NextResponse.json(newPermission, { status: 201 });
}
