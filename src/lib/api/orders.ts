import { apiRequest } from '@/lib/api/client';
import type { OrderPayment, OrderRecord, OrderStatus } from '@/lib/orders';

export type OrderInput = {
  orderNo: string;
  customer: string;
  product: string;
  amount: number;
  payment: OrderPayment;
  status: OrderStatus;
  shippingAddress: string;
};

export const ordersApi = {
  list: () => apiRequest<OrderRecord[]>('/orders'),
  create: (payload: OrderInput) =>
    apiRequest<OrderRecord>('/orders', {
      method: 'POST',
      body: payload,
    }),
  update: (id: string, payload: OrderInput) =>
    apiRequest<OrderRecord>(`/orders/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  remove: (id: string) =>
    apiRequest<{ success: boolean }>(`/orders/${id}`, {
      method: 'DELETE',
    }),
};
