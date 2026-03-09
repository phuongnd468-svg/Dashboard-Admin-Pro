import { promises as fs } from 'node:fs';
import path from 'node:path';

export type MonitorBubble = {
  label: string;
  x: number;
  y: number;
  size: number;
};

type MonitorSeed = {
  totalAmountBase: number;
  totalAmountDailyGrowth: number;
  targetRateBase: number;
  eventDurationMs: number;
  amountPerSecondBase: number;
  forecastUpperBase: number;
  forecastLowerBase: number;
  efficiencyScoreBase: number;
  categoryProgress: Array<{
    label: string;
    value: number;
  }>;
  searchTerms: string[];
  resourceRemaining: number;
  mapBubbles: MonitorBubble[];
};

export type MonitorSnapshot = {
  todayTotalAmount: string;
  todayTotalAmountValue: number;
  targetRate: number;
  remainingTime: string;
  remainingMs: number;
  amountPerSecond: number;
  forecastUpper: number;
  forecastLower: number;
  efficiencyScore: number;
  serverTime: string;
  categoryProgress: Array<{
    label: string;
    value: number;
  }>;
  searchTerms: string[];
  resourceRemaining: number;
  mapBubbles: MonitorBubble[];
};

const monitorFilePath = path.join(process.cwd(), 'src/data/monitor.json');

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function formatRemainingTime(remainingMs: number) {
  const totalMilliseconds = Math.max(0, remainingMs);
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMilliseconds % 60_000) / 1_000);
  const milliseconds = Math.floor(totalMilliseconds % 1_000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
}

export async function readMonitorSnapshot(): Promise<MonitorSnapshot> {
  const raw = await fs.readFile(monitorFilePath, 'utf8');
  const seed = JSON.parse(raw) as MonitorSeed;
  const now = new Date();
  const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const millisSinceMidnight =
    secondsSinceMidnight * 1000 + now.getMilliseconds();
  const cycleProgress = (millisSinceMidnight % seed.eventDurationMs) / seed.eventDurationMs;
  const wave = Math.sin((secondsSinceMidnight / 86400) * Math.PI * 4);
  const burst = Math.cos((secondsSinceMidnight / 86400) * Math.PI * 8);
  const amountPerSecond = Math.max(180, Math.round(seed.amountPerSecondBase + wave * 18 + burst * 10));
  const todayTotalAmountValue =
    seed.totalAmountBase +
    secondsSinceMidnight * amountPerSecond +
    cycleProgress * seed.totalAmountDailyGrowth;
  const remainingMs = seed.eventDurationMs - (millisSinceMidnight % seed.eventDurationMs);
  const targetRate = Math.max(72, Math.min(99, Math.round(seed.targetRateBase + wave * 2)));
  const forecastUpper = Number((seed.forecastUpperBase + wave * 8).toFixed(1));
  const forecastLower = Number((seed.forecastLowerBase + burst * 6).toFixed(1));
  const efficiencyScore = Math.max(0, Math.min(100, Math.round(seed.efficiencyScoreBase + wave * 4)));

  return {
    todayTotalAmount: formatNumber(todayTotalAmountValue),
    todayTotalAmountValue,
    targetRate,
    remainingTime: formatRemainingTime(remainingMs),
    remainingMs,
    amountPerSecond,
    forecastUpper,
    forecastLower,
    efficiencyScore,
    serverTime: now.toISOString(),
    categoryProgress: seed.categoryProgress,
    searchTerms: seed.searchTerms,
    resourceRemaining: seed.resourceRemaining,
    mapBubbles: seed.mapBubbles,
  };
}
