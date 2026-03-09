import dayjs from 'dayjs';
import { NextResponse } from 'next/server';
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

export async function GET() {
  const orders = await readOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const payload = normalizeOrderPayload((await request.json()) as OrderPayload);
  const validationError = validateOrderPayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const orders = await readOrders();
  const newOrder: OrderRecord = {
    id: `ord-${Date.now()}`,
    ...payload,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };

  const nextOrders = [newOrder, ...orders];
  await writeOrders(nextOrders);

  return NextResponse.json(newOrder, { status: 201 });
}
