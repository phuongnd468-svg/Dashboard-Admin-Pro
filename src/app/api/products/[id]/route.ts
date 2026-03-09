import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';
import { readProducts, writeProducts, type ProductRecord, type ProductStatus } from '@/lib/products';

type ProductPayload = {
  name?: string;
  sku?: string;
  category?: string;
  description?: string;
  price?: number;
  stock?: number;
  status?: ProductStatus;
};

function normalizeProductPayload(payload: ProductPayload) {
  return {
    name: (payload.name ?? '').trim(),
    sku: (payload.sku ?? '').trim(),
    category: (payload.category ?? '').trim(),
    description: (payload.description ?? '').trim(),
    price: Number(payload.price ?? 0),
    stock: Number(payload.stock ?? 0),
    status:
      payload.status === 'draft' || payload.status === 'outOfStock' ? payload.status : 'active',
  } satisfies Omit<ProductRecord, 'id' | 'updatedAt'>;
}

function validateProductPayload(payload: ReturnType<typeof normalizeProductPayload>) {
  if (!payload.name || !payload.sku || !payload.category || !payload.description) {
    return 'Missing required fields.';
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return 'Invalid price.';
  }

  if (!Number.isFinite(payload.stock) || payload.stock < 0) {
    return 'Invalid stock.';
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
  const payload = normalizeProductPayload((await request.json()) as ProductPayload);
  const validationError = validateProductPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const products = await readProducts();
  const existingIndex = products.findIndex((item) => item.id === id);

  if (existingIndex === -1) {
    return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  }

  const updatedProduct: ProductRecord = {
    ...products[existingIndex],
    ...payload,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };

  const nextProducts = [...products];
  nextProducts[existingIndex] = updatedProduct;
  await writeProducts(nextProducts);

  return NextResponse.json(updatedProduct);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<unknown> },
) {
  const id = await resolveId(params);
  const products = await readProducts();
  const nextProducts = products.filter((item) => item.id !== id);

  if (nextProducts.length === products.length) {
    return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  }

  await writeProducts(nextProducts);
  return NextResponse.json({ ok: true });
}
