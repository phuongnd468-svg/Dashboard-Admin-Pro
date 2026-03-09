import dayjs from 'dayjs';
import { NextResponse } from 'next/server';
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

export async function GET() {
  const products = await readProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const payload = normalizeProductPayload((await request.json()) as ProductPayload);
  const validationError = validateProductPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const products = await readProducts();
  const newProduct: ProductRecord = {
    id: `prod-${Date.now()}`,
    ...payload,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };

  const nextProducts = [newProduct, ...products];
  await writeProducts(nextProducts);

  return NextResponse.json(newProduct, { status: 201 });
}
