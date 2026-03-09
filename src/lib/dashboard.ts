import { promises as fs } from 'node:fs';
import path from 'node:path';

export type DashboardSearchTrend = 'up' | 'down';

export type DashboardSnapshot = {
  metrics: {
    sales: {
      total: number;
      daily: number;
      weekOnWeek: number;
      dayOnDay: number;
    };
    visits: {
      total: number;
      daily: number;
      trend: number[];
    };
    payments: {
      total: number;
      conversionRate: number;
      bars: number[];
    };
    effect: {
      percent: number;
      weekOnWeek: number;
      dayOnDay: number;
    };
  };
  overview: {
    salesByMonth: number[];
    visitsByMonth: number[];
    ranking: Array<{
      id: string;
      name: string;
      value: number;
    }>;
    range: {
      start: string;
      end: string;
    };
  };
  search: {
    searchUsers: number;
    perCapita: number;
    rows: Array<{
      id: string;
      keyword: string;
      users: number;
      change: number;
      trend: DashboardSearchTrend;
    }>;
  };
  salesCategories: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  storePerformance: {
    stores: Array<{
      id: string;
      name: string;
      conversionRate: number;
    }>;
    timeLabels: string[];
    trafficSeries: number[];
    paymentsSeries: number[];
  };
};

const dashboardFilePath = path.join(process.cwd(), 'src/data/dashboard.json');

export async function readDashboardSnapshot(): Promise<DashboardSnapshot> {
  const raw = await fs.readFile(dashboardFilePath, 'utf8');
  return JSON.parse(raw) as DashboardSnapshot;
}
