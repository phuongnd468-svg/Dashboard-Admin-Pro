import { apiRequest } from '@/lib/api/client';
import type { DashboardSnapshot } from '@/lib/dashboard';

export const dashboardApi = {
  getSnapshot: () => apiRequest<DashboardSnapshot>('/dashboard'),
};
