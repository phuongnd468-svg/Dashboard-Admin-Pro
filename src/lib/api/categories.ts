import { apiRequest } from '@/lib/api/client';
import type { CategoryRecord, CategoryStatus } from '@/lib/categories';

export type CategoryInput = {
  name: string;
  slug: string;
  description: string;
  productCount: number;
  status: CategoryStatus;
};

export const categoriesApi = {
  list: () => apiRequest<CategoryRecord[]>('/categories'),
  create: (payload: CategoryInput) =>
    apiRequest<CategoryRecord>('/categories', {
      method: 'POST',
      body: payload,
    }),
  update: (id: string, payload: CategoryInput) =>
    apiRequest<CategoryRecord>(`/categories/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  remove: (id: string) =>
    apiRequest<{ success: boolean }>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};
