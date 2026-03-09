import { promises as fs } from 'node:fs';
import path from 'node:path';

export type SettingsProfile = {
  email: string;
  nickname: string;
  profile: string;
  country: string;
  province: string;
  city: string;
  address: string;
  areaCode: string;
  phone: string;
  avatarUrl: string;
};

const settingsProfileFilePath = path.join(process.cwd(), 'src/data/settings-profile.json');

export async function readSettingsProfile(): Promise<SettingsProfile> {
  const raw = await fs.readFile(settingsProfileFilePath, 'utf8');
  return JSON.parse(raw) as SettingsProfile;
}

export async function writeSettingsProfile(profile: SettingsProfile): Promise<void> {
  await fs.writeFile(settingsProfileFilePath, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
}
