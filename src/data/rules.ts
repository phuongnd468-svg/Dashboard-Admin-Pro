export type RuleRecord = {
  key: string;
  name: string;
  description: string;
  calls: number;
  status: 'draft' | 'running' | 'online' | 'error';
  updatedAt: string;
};

export const initialRules: RuleRecord[] = [
  {
    key: 'rule-1',
    name: 'Customer onboarding',
    description: 'Validate profile completeness and trigger follow-up tasks.',
    calls: 24,
    status: 'online',
    updatedAt: '2026-03-08 08:30',
  },
  {
    key: 'rule-2',
    name: 'Vendor compliance',
    description: 'Pause vendors that are missing monthly compliance documents.',
    calls: 11,
    status: 'running',
    updatedAt: '2026-03-07 14:20',
  },
  {
    key: 'rule-3',
    name: 'Invoice anomalies',
    description: 'Send a review task to finance when totals exceed tolerance.',
    calls: 5,
    status: 'error',
    updatedAt: '2026-03-05 17:05',
  },
];
