import { promises as fs } from 'node:fs';
import path from 'node:path';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type OrderPayment = 'paid' | 'unpaid' | 'refunded';

export type OrderRecord = {
  id: string;
  orderNo: string;
  customer: string;
  product: string;
  amount: number;
  payment: OrderPayment;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
};

const ordersFilePath = path.join(process.cwd(), 'src/data/orders.json');

export async function readOrders(): Promise<OrderRecord[]> {
  const raw = await fs.readFile(ordersFilePath, 'utf8');
  return JSON.parse(raw) as OrderRecord[];
}

export async function writeOrders(orders: OrderRecord[]): Promise<void> {
  await fs.writeFile(ordersFilePath, `${JSON.stringify(orders, null, 2)}\n`, 'utf8');
}
