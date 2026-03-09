import { apiRequest } from '@/lib/api/client';
import type { ProductRecord, ProductStatus } from '@/lib/products';

export type ProductInput = {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
};

export const productsApi = {
  list: () => apiRequest<ProductRecord[]>('/products'),
  create: (payload: ProductInput) =>
    apiRequest<ProductRecord>('/products', {
      method: 'POST',
      body: payload,
    }),
  update: (id: string, payload: ProductInput) =>
    apiRequest<ProductRecord>(`/products/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  remove: (id: string) =>
    apiRequest<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
    }),
};
