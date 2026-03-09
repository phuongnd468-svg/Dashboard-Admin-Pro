import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';
import { readOrders, writeOrders, type OrderPayment, type OrderRecord, type OrderStatus } from '@/lib/orders';

type OrderPayload = {
  orderNo?: string;
  customer?: string;
  product?: string;
  amount?: number;
  payment?: OrderPayment;
  status?: OrderStatus;
  shippingAddress?: string;
};

function normalizeOrderPayload(payload: OrderPayload) {
  return {
    orderNo: (payload.orderNo ?? '').trim(),
    customer: (payload.customer ?? '').trim(),
    product: (payload.product ?? '').trim(),
    amount: Number(payload.amount ?? 0),
    payment: payload.payment === 'unpaid' || payload.payment === 'refunded' ? payload.payment : 'paid',
    status:
      payload.status === 'pending' ||
      payload.status === 'processing' ||
      payload.status === 'shipped' ||
      payload.status === 'cancelled'
        ? payload.status
        : 'completed',
    shippingAddress: (payload.shippingAddress ?? '').trim(),
  } satisfies Omit<OrderRecord, 'id' | 'createdAt'>;
}

function validateOrderPayload(payload: ReturnType<typeof normalizeOrderPayload>) {
  if (!payload.orderNo || !payload.customer || !payload.product || !payload.shippingAddress) {
    return 'Missing required fields.';
  }

  if (!Number.isFinite(payload.amount) || payload.amount < 0) {
    return 'Invalid amount.';
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
  const payload = normalizeOrderPayload((await request.json()) as OrderPayload);
  const validationError = validateOrderPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const orders = await readOrders();
  const existingIndex = orders.findIndex((item) => item.id === id);

  if (existingIndex === -1) {
    return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
  }

  const updatedOrder: OrderRecord = {
    ...orders[existingIndex],
    ...payload,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };

  const nextOrders = [...orders];
  nextOrders[existingIndex] = updatedOrder;
  await writeOrders(nextOrders);

  return NextResponse.json(updatedOrder);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<unknown> },
) {
  const id = await resolveId(params);
  const orders = await readOrders();
  const nextOrders = orders.filter((item) => item.id !== id);

  if (nextOrders.length === orders.length) {
    return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
  }

  await writeOrders(nextOrders);
  return NextResponse.json({ ok: true });
}
