import { apiRequest } from '@/lib/api/client';
import type { MonitorSnapshot } from '@/lib/monitor';

export const monitorApi = {
  getSnapshot: () => apiRequest<MonitorSnapshot>('/monitor'),
};
