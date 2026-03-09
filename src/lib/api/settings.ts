import { apiRequest } from '@/lib/api/client';
import type { SettingsProfile } from '@/lib/settings';

export type SettingsProfileInput = Omit<SettingsProfile, 'avatarUrl'> & {
  avatarUrl?: string;
};

export const settingsApi = {
  getProfile: () => apiRequest<SettingsProfile>('/settings/profile'),
  updateProfile: (payload: SettingsProfileInput) =>
    apiRequest<SettingsProfile>('/settings/profile', {
      method: 'PUT',
      body: payload,
    }),
};
