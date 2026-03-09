import { apiRequest } from '@/lib/api/client';
import type { UserRecord, UserStatus } from '@/lib/users';

export type UserInput = {
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  phone: string;
  permissionIds: string[];
};

export const usersApi = {
  list: () => apiRequest<UserRecord[]>('/users'),
  create: (payload: UserInput) =>
    apiRequest<UserRecord>('/users', {
      method: 'POST',
      body: payload,
    }),
  update: (id: string, payload: UserInput) =>
    apiRequest<UserRecord>(`/users/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  remove: (id: string) =>
    apiRequest<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    }),
};
