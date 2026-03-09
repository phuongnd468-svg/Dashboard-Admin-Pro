import { apiRequest } from '@/lib/api/client';
import type { RuleRecord, RuleStatus } from '@/lib/rules';

export type RuleInput = {
  name: string;
  description: string;
  calls: number;
  status: RuleStatus;
};

export const rulesApi = {
  list: () => apiRequest<RuleRecord[]>('/rules'),
  create: (payload: RuleInput) =>
    apiRequest<RuleRecord>('/rules', {
      method: 'POST',
      body: payload,
    }),
  update: (id: string, payload: RuleInput) =>
    apiRequest<RuleRecord>(`/rules/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  remove: (id: string) =>
    apiRequest<{ success: boolean }>(`/rules/${id}`, {
      method: 'DELETE',
    }),
};
