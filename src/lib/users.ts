import { promises as fs } from 'node:fs';
import path from 'node:path';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  phone: string;
  lastLogin: string;
  permissionIds: string[];
};

const usersFilePath = path.join(process.cwd(), 'src/data/users.json');

export async function readUsers(): Promise<UserRecord[]> {
  const raw = await fs.readFile(usersFilePath, 'utf8');
  return JSON.parse(raw) as UserRecord[];
}

export async function writeUsers(users: UserRecord[]): Promise<void> {
  await fs.writeFile(usersFilePath, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
}
