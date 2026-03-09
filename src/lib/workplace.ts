import { promises as fs } from 'node:fs';
import path from 'node:path';

export type WorkplaceProject = {
  id: string;
  name: string;
  description: string;
  group: string;
  updatedAgo: string;
};

export type WorkplaceSnapshot = {
  stats: {
    projects: number;
    ranking: string;
    visits: number;
  };
  projects: WorkplaceProject[];
  shortcuts: string[];
  radar: {
    personal: number[];
    team: number[];
    department: number[];
  };
  activity: string[];
  team: string[];
};

const workplaceFilePath = path.join(process.cwd(), 'src/data/workplace.json');

export async function readWorkplaceSnapshot(): Promise<WorkplaceSnapshot> {
  const raw = await fs.readFile(workplaceFilePath, 'utf8');
  return JSON.parse(raw) as WorkplaceSnapshot;
}
