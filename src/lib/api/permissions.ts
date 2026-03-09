import { apiRequest } from '@/lib/api/client';
import type { PermissionAction, PermissionRecord, PermissionScope, PermissionStatus } from '@/lib/permissions';

export type PermissionInput = {
  name: string;
  module: string;
  action: PermissionAction;
  scope: PermissionScope;
  description: string;
  status: PermissionStatus;
};

export const permissionsApi = {
  list: () => apiRequest<PermissionRecord[]>('/permissions'),
  create: (payload: PermissionInput) =>
    apiRequest<PermissionRecord>('/permissions', {
      method: 'POST',
      body: payload,
    }),
  update: (id: string, payload: PermissionInput) =>
    apiRequest<PermissionRecord>(`/permissions/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  remove: (id: string) =>
    apiRequest<{ success: boolean }>(`/permissions/${id}`, {
      method: 'DELETE',
    }),
};
