import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';
import { readUsers, writeUsers, type UserRecord, type UserStatus } from '@/lib/users';

type UserPayload = {
  name?: string;
  email?: string;
  role?: string;
  status?: UserStatus;
  phone?: string;
  permissionIds?: string[];
};

function normalizeUserPayload(payload: UserPayload) {
  return {
    name: (payload.name ?? '').trim(),
    email: (payload.email ?? '').trim(),
    role: (payload.role ?? '').trim(),
    status:
      payload.status === 'inactive' || payload.status === 'suspended' ? payload.status : 'active',
    phone: (payload.phone ?? '').trim(),
    permissionIds: Array.isArray(payload.permissionIds)
      ? payload.permissionIds.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [],
  } satisfies Omit<UserRecord, 'id' | 'lastLogin'>;
}

function validateUserPayload(payload: ReturnType<typeof normalizeUserPayload>) {
  if (!payload.name || !payload.email || !payload.role || !payload.phone) {
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
  const payload = normalizeUserPayload((await request.json()) as UserPayload);
  const validationError = validateUserPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const users = await readUsers();
  const existingIndex = users.findIndex((item) => item.id === id);

  if (existingIndex === -1) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 });
  }

  const updatedUser: UserRecord = {
    ...users[existingIndex],
    ...payload,
    lastLogin: dayjs().format('YYYY-MM-DD HH:mm'),
  };
  const nextUsers = [...users];
  nextUsers[existingIndex] = updatedUser;
  await writeUsers(nextUsers);

  return NextResponse.json(updatedUser);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<unknown> }) {
  const id = await resolveId(params);
  const users = await readUsers();
  const nextUsers = users.filter((item) => item.id !== id);

  if (nextUsers.length === users.length) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 });
  }

  await writeUsers(nextUsers);
  return NextResponse.json({ ok: true });
}
