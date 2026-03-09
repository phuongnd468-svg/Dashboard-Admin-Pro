import { promises as fs } from 'node:fs';
import path from 'node:path';

export type PermissionStatus = 'active' | 'inactive';
export type PermissionAction = 'read' | 'write' | 'approve' | 'publish' | 'export';
export type PermissionScope = 'global' | 'regional' | 'brand';

export type PermissionRecord = {
  id: string;
  name: string;
  module: string;
  action: PermissionAction;
  scope: PermissionScope;
  description: string;
  status: PermissionStatus;
  updatedAt: string;
};

const permissionsFilePath = path.join(process.cwd(), 'src/data/permissions.json');

export async function readPermissions(): Promise<PermissionRecord[]> {
  const raw = await fs.readFile(permissionsFilePath, 'utf8');
  return JSON.parse(raw) as PermissionRecord[];
}

export async function writePermissions(permissions: PermissionRecord[]): Promise<void> {
  await fs.writeFile(permissionsFilePath, `${JSON.stringify(permissions, null, 2)}\n`, 'utf8');
}
