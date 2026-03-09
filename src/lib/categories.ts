import { promises as fs } from 'node:fs';
import path from 'node:path';

export type CategoryStatus = 'active' | 'inactive';

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  status: CategoryStatus;
  updatedAt: string;
};

const categoriesFilePath = path.join(process.cwd(), 'src/data/categories.json');

export async function readCategories(): Promise<CategoryRecord[]> {
  const raw = await fs.readFile(categoriesFilePath, 'utf8');
  return JSON.parse(raw) as CategoryRecord[];
}

export async function writeCategories(categories: CategoryRecord[]): Promise<void> {
  await fs.writeFile(categoriesFilePath, `${JSON.stringify(categories, null, 2)}\n`, 'utf8');
}
