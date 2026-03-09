import { NextResponse } from 'next/server';
import { readSettingsProfile, writeSettingsProfile, type SettingsProfile } from '@/lib/settings';

type SettingsProfilePayload = Partial<SettingsProfile>;

function normalizeSettingsPayload(payload: SettingsProfilePayload) {
  return {
    email: (payload.email ?? '').trim(),
    nickname: (payload.nickname ?? '').trim(),
    profile: (payload.profile ?? '').trim(),
    country: (payload.country ?? '').trim(),
    province: (payload.province ?? '').trim(),
    city: (payload.city ?? '').trim(),
    address: (payload.address ?? '').trim(),
    areaCode: (payload.areaCode ?? '').trim(),
    phone: (payload.phone ?? '').trim(),
    avatarUrl: (payload.avatarUrl ?? '').trim(),
  } satisfies SettingsProfile;
}

function validateSettingsPayload(payload: SettingsProfile) {
  if (!payload.email || !payload.nickname || !payload.country || !payload.address || !payload.areaCode || !payload.phone) {
    return 'Missing required fields.';
  }

  return null;
}

export async function GET() {
  const profile = await readSettingsProfile();
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const currentProfile = await readSettingsProfile();
  const payload = normalizeSettingsPayload({
    ...currentProfile,
    ...((await request.json()) as SettingsProfilePayload),
  });
  const validationError = validateSettingsPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  await writeSettingsProfile(payload);
  return NextResponse.json(payload);
}
