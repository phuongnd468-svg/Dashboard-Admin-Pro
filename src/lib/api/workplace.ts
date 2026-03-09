import { apiRequest } from '@/lib/api/client';
import type { WorkplaceSnapshot } from '@/lib/workplace';

export const workplaceApi = {
  getSnapshot: () => apiRequest<WorkplaceSnapshot>('/workplace'),
};
