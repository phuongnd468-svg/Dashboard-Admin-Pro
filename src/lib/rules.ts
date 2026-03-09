import { promises as fs } from 'node:fs';
import path from 'node:path';

export type RuleStatus = 'draft' | 'running' | 'online' | 'error';

export type RuleRecord = {
  id: string;
  name: string;
  description: string;
  calls: number;
  status: RuleStatus;
  updatedAt: string;
};

const rulesFilePath = path.join(process.cwd(), 'src/data/rules.json');

export async function readRules(): Promise<RuleRecord[]> {
  const raw = await fs.readFile(rulesFilePath, 'utf8');
  return JSON.parse(raw) as RuleRecord[];
}

export async function writeRules(rules: RuleRecord[]): Promise<void> {
  await fs.writeFile(rulesFilePath, `${JSON.stringify(rules, null, 2)}\n`, 'utf8');
}
