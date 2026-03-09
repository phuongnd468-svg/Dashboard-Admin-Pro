import { promises as fs } from 'node:fs';
import path from 'node:path';

export type ProductStatus = 'active' | 'draft' | 'outOfStock';

export type ProductRecord = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
  updatedAt: string;
};

const productsFilePath = path.join(process.cwd(), 'src/data/products.json');

export async function readProducts(): Promise<ProductRecord[]> {
  const raw = await fs.readFile(productsFilePath, 'utf8');
  return JSON.parse(raw) as ProductRecord[];
}

export async function writeProducts(products: ProductRecord[]): Promise<void> {
  await fs.writeFile(productsFilePath, `${JSON.stringify(products, null, 2)}\n`, 'utf8');
}
