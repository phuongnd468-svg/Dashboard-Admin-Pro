import dayjs from 'dayjs';
import { NextResponse } from 'next/server';
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

export async function GET() {
  const users = await readUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const payload = normalizeUserPayload((await request.json()) as UserPayload);
  const validationError = validateUserPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const users = await readUsers();
  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    ...payload,
    lastLogin: dayjs().format('YYYY-MM-DD HH:mm'),
  };
  const nextUsers = [newUser, ...users];
  await writeUsers(nextUsers);

  return NextResponse.json(newUser, { status: 201 });
}
