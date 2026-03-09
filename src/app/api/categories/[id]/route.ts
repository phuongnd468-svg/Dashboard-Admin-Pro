import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';
import { readCategories, writeCategories, type CategoryRecord, type CategoryStatus } from '@/lib/categories';

type CategoryPayload = {
  name?: string;
  slug?: string;
  description?: string;
  productCount?: number;
  status?: CategoryStatus;
};

function normalizeCategoryPayload(payload: CategoryPayload) {
  return {
    name: (payload.name ?? '').trim(),
    slug: (payload.slug ?? '').trim(),
    description: (payload.description ?? '').trim(),
    productCount: Number(payload.productCount ?? 0),
    status: payload.status === 'inactive' ? 'inactive' : 'active',
  } satisfies Omit<CategoryRecord, 'id' | 'updatedAt'>;
}

function validateCategoryPayload(payload: ReturnType<typeof normalizeCategoryPayload>) {
  if (!payload.name || !payload.slug || !payload.description) {
    return 'Missing required fields.';
  }

  if (!Number.isFinite(payload.productCount) || payload.productCount < 0) {
    return 'Invalid product count.';
  }

  return null;
}

async function resolveId(params: Promise<unknown>) {
  const value = (await params) as { id?: string };
  return value.id ?? '';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<unknown> },
) {
  const id = await resolveId(params);
  const payload = normalizeCategoryPayload((await request.json()) as CategoryPayload);
  const validationError = validateCategoryPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const categories = await readCategories();
  const existingIndex = categories.findIndex((item) => item.id === id);

  if (existingIndex === -1) {
    return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
  }

  const updatedCategory: CategoryRecord = {
    ...categories[existingIndex],
    ...payload,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };

  const nextCategories = [...categories];
  nextCategories[existingIndex] = updatedCategory;
  await writeCategories(nextCategories);

  return NextResponse.json(updatedCategory);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<unknown> },
) {
  const id = await resolveId(params);
  const categories = await readCategories();
  const nextCategories = categories.filter((item) => item.id !== id);

  if (nextCategories.length === categories.length) {
    return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
  }

  await writeCategories(nextCategories);
  return NextResponse.json({ ok: true });
}
