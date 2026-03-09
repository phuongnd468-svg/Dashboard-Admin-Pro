'use client';

import { InfoCircleOutlined, MoreOutlined, RiseOutlined } from '@ant-design/icons';
import { App, Card, Col, DatePicker, Progress, Row, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api/client';
import { dashboardApi } from '@/lib/api/dashboard';
import { useApiQuery } from '@/lib/api/hooks';
import type { DashboardSnapshot } from '@/lib/dashboard';
import type { Dictionary } from '@/lib/i18n';

type RankingRow = DashboardSnapshot['overview']['ranking'][number];
type SearchRow = DashboardSnapshot['search']['rows'][number];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function MiniBars({ values }: { values: number[] }) {
  return (
    <div className="dashboard-mini-bars">
      {values.map((value, index) => (
        <span key={index} style={{ height: `${value}px` }} />
      ))}
    </div>
  );
}

function MiniArea({ values }: { values: number[] }) {
  const maxValue = Math.max(...values, 1);
  const points = values
    .map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 264},${80 - (value / maxValue) * 50}`)
    .join(' ');

  return (
    <svg className="dashboard-mini-area" viewBox="0 0 264 80" preserveAspectRatio="none">
      <defs>
        <linearGradient id="miniAreaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#b37feb" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#miniAreaGradient)" points={`0,80 ${points} 264,80`} />
      <polyline fill="none" points={points} stroke="#b37feb" strokeWidth="3" />
    </svg>
  );
}

function SearchWave({ phase = 0 }: { phase?: number }) {
  const base = [42, 24, 34, 18, 38, 22, 44];
  const points = base
    .map((value, index) => `${index * 28},${Math.max(10, value + ((index + phase) % 3) * 2)}`)
    .join(' ');

  return (
    <svg className="dashboard-search-wave" viewBox="0 0 168 54" preserveAspectRatio="none">
      <defs>
        <linearGradient id="searchWaveGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#91baff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#searchWaveGradient)" points={`0,54 ${points} 168,54`} />
      <polyline fill="none" points={points} stroke="#adc6ff" strokeWidth="2.5" />
    </svg>
  );
}

function MainBars({ values }: { values: number[] }) {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxValue = Math.max(...values, 1);
  const gridValues = [0, 200, 400, 600, 800, 1000, 1200];

  return (
    <div className="dashboard-main-chart">
      <div className="dashboard-main-chart__grid">
        {gridValues
          .slice()
          .reverse()
          .map((value) => (
            <div key={value} className="dashboard-main-chart__grid-row">
              <span>{value}</span>
              <i />
            </div>
          ))}
      </div>
      <div className="dashboard-main-chart__bars">
        {values.map((value, index) => (
          <div key={labels[index]} className="dashboard-main-chart__bar-wrap">
            <div className="dashboard-main-chart__bar" style={{ height: `${(value / maxValue) * 320}px` }} />
            <span>{labels[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendLines({ trafficSeries, paymentsSeries }: { trafficSeries: number[]; paymentsSeries: number[] }) {
  const maxValue = Math.max(...trafficSeries, ...paymentsSeries, 1);
  const buildPoints = (values: number[]) =>
    values
      .map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 950},${120 - (value / maxValue) * 108}`)
      .join(' ');

  return (
    <svg className="dashboard-trend-lines" viewBox="0 0 950 120" preserveAspectRatio="none">
      <polyline fill="none" points={buildPoints(trafficSeries)} stroke="#1677ff" strokeWidth="2" />
      <polyline fill="none" points={buildPoints(paymentsSeries)} stroke="#13c2c2" strokeWidth="2" />
    </svg>
  );
}

function DonutChart({ items }: { items: DashboardSnapshot['salesCategories'] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const gradient = items
    .map((item) => {
      const start = currentAngle;
      const sweep = (item.value / total) * 360;
      currentAngle += sweep;
      return `${item.color} ${start}deg ${currentAngle}deg`;
    })
    .join(', ');

  return (
    <div className="dashboard-donut">
      <div className="dashboard-donut__ring" style={{ background: `conic-gradient(${gradient})` }} />
      {items.map((item, index) => (
        <div key={item.label} className={`dashboard-donut__label dashboard-donut__label--${String.fromCharCode(97 + index)}`}>
          {item.label}: {formatCurrency(item.value)}
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  meta,
  footer,
  title,
  trend,
  value,
  visual,
}: {
  meta?: string;
  footer: React.ReactNode;
  title: string;
  trend: React.ReactNode;
  value: string;
  visual: React.ReactNode;
}) {
  return (
    <Card className="dashboard-card dashboard-card--metric" styles={{ body: { padding: 22 } }}>
      <div className="dashboard-card__header">
        <div className="dashboard-card__title">{title}</div>
        <InfoCircleOutlined className="dashboard-card__info" />
      </div>
      {meta ? <div className="dashboard-card__meta">{meta}</div> : null}
      <div className="dashboard-card__value">{value}</div>
      <div className="dashboard-card__visual">{visual}</div>
      <div className="dashboard-card__trend">{trend}</div>
      <div className="dashboard-card__footer">{footer}</div>
    </Card>
  );
}

export function WelcomeScreen({ dictionary }: { dictionary: Dictionary }) {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<'sales' | 'visits'>('sales');
  const loadSnapshot = useCallback(() => dashboardApi.getSnapshot(), []);
  const snapshotQuery = useApiQuery(loadSnapshot, [loadSnapshot]);
  const snapshot = snapshotQuery.data;

  useEffect(() => {
    if (snapshotQuery.error) {
      message.error(getApiErrorMessage(snapshotQuery.error, dictionary.dashboard.loadingError));
    }
  }, [dictionary.dashboard.loadingError, message, snapshotQuery.error]);

  const searchColumns: ColumnsType<SearchRow> = [
    { title: dictionary.dashboard.search.columns.rank, render: (_, __, index) => index + 1, width: 70 },
    { title: dictionary.dashboard.search.columns.keyword, dataIndex: 'keyword' },
    { title: dictionary.dashboard.search.columns.users, dataIndex: 'users' },
    {
      title: dictionary.dashboard.search.columns.range,
      dataIndex: 'change',
      render: (_, record) => (
        <Tag bordered={false} color={record.trend === 'up' ? 'red' : 'green'}>
          {record.change}% {record.trend === 'up' ? '▲' : '▼'}
        </Tag>
      ),
    },
  ];

  const overviewSeries = useMemo(
    () => (activeTab === 'sales' ? snapshot?.overview.salesByMonth ?? [] : snapshot?.overview.visitsByMonth ?? []),
    [activeTab, snapshot],
  );

  if (!snapshot) {
    return (
      <Card className="dashboard-card" loading={snapshotQuery.loading}>
        <div style={{ height: 980 }} />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Row gutter={[20, 20]}>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            meta={dictionary.dashboard.metrics.sales}
            footer={`Daily sales $ ${formatCurrency(snapshot.metrics.sales.daily)}`}
            title={dictionary.dashboard.metrics.sales}
            trend={
              <>
                {dictionary.dashboard.weekOnWeek}{' '}
                <Tag bordered={false} color="red">
                  {snapshot.metrics.sales.weekOnWeek}% ▲
                </Tag>
                {dictionary.dashboard.dayOnDay}{' '}
                <Tag bordered={false} color="green">
                  {snapshot.metrics.sales.dayOnDay}% ▼
                </Tag>
              </>
            }
            value={`$ ${formatCurrency(snapshot.metrics.sales.total)}`}
            visual={<div className="dashboard-metric-spacer" />}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            meta={dictionary.dashboard.metrics.visits}
            footer={`Daily visits ${formatCurrency(snapshot.metrics.visits.daily)}`}
            title={dictionary.dashboard.metrics.visits}
            trend={<MiniArea values={snapshot.metrics.visits.trend} />}
            value={formatCurrency(snapshot.metrics.visits.total)}
            visual={<div className="dashboard-metric-spacer" />}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            meta={dictionary.dashboard.metrics.payments}
            footer={`${dictionary.dashboard.conversionRate} ${snapshot.metrics.payments.conversionRate}%`}
            title={dictionary.dashboard.metrics.payments}
            trend={<MiniBars values={snapshot.metrics.payments.bars} />}
            value={formatCurrency(snapshot.metrics.payments.total)}
            visual={<div className="dashboard-metric-spacer" />}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            meta={dictionary.dashboard.metrics.effect}
            footer={
              <div className="dashboard-effect">
                <Progress
                  percent={snapshot.metrics.effect.percent}
                  showInfo={false}
                  size="small"
                  strokeColor="#52c41a"
                />
                <span>{snapshot.metrics.effect.percent}%</span>
              </div>
            }
            title={dictionary.dashboard.metrics.effect}
            trend={
              <>
                {dictionary.dashboard.weekOnWeek}{' '}
                <Tag bordered={false} color="red">
                  {snapshot.metrics.effect.weekOnWeek}% ▲
                </Tag>
                {dictionary.dashboard.dayOnDay}{' '}
                <Tag bordered={false} color="green">
                  {snapshot.metrics.effect.dayOnDay}% ▼
                </Tag>
              </>
            }
            value={`${snapshot.metrics.effect.percent}%`}
            visual={<div className="dashboard-metric-spacer" />}
          />
        </Col>
      </Row>

      <Card className="dashboard-card" styles={{ body: { padding: 0 } }}>
        <div className="dashboard-overview__header">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'sales' | 'visits')}
            items={[
              { key: 'sales', label: dictionary.dashboard.tabs.sales },
              { key: 'visits', label: dictionary.dashboard.tabs.visits },
            ]}
          />
          <div className="dashboard-overview__filters">
            <span>{dictionary.dashboard.filters.today}</span>
            <span>{dictionary.dashboard.filters.week}</span>
            <span>{dictionary.dashboard.filters.month}</span>
            <span className="is-active">{dictionary.dashboard.filters.year}</span>
            <DatePicker.RangePicker
              allowClear={false}
              value={[dayjs(snapshot.overview.range.start), dayjs(snapshot.overview.range.end)]}
            />
          </div>
        </div>
        <div className="dashboard-overview">
          <div className="dashboard-overview__chart">
            <MainBars values={overviewSeries} />
          </div>
          <div className="dashboard-overview__ranking">
            <div className="dashboard-section-title">{dictionary.dashboard.rankingTitle}</div>
            {snapshot.overview.ranking.map((row, index) => (
              <div key={row.id} className={`dashboard-ranking__row${index < 3 ? ' is-top' : ''}`}>
                <span className="dashboard-ranking__badge">{index + 1}</span>
                <span>{row.name}</span>
                <strong>{formatCurrency(row.value)}</strong>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={12}>
          <Card
            className="dashboard-card"
            extra={<MoreOutlined />}
            styles={{ body: { padding: 22 } }}
            title={dictionary.dashboard.search.title}
          >
            <div className="dashboard-search__meta">
              <div>
                <div className="dashboard-search__meta-label">
                  <span>{dictionary.dashboard.search.searchUsers}</span>
                  <InfoCircleOutlined />
                </div>
                <strong>{snapshot.search.searchUsers}</strong>
                <SearchWave phase={0} />
              </div>
              <div>
                <div className="dashboard-search__meta-label">
                  <span>{dictionary.dashboard.search.perCapita}</span>
                  <InfoCircleOutlined />
                </div>
                <strong>{snapshot.search.perCapita}</strong>
                <SearchWave phase={1} />
              </div>
            </div>
            <Table columns={searchColumns} dataSource={snapshot.search.rows} pagination={false} size="small" />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            className="dashboard-card"
            extra={
              <Space size={6}>
                <Tag>{dictionary.dashboard.channels.all}</Tag>
                <Tag>{dictionary.dashboard.channels.online}</Tag>
                <Tag>{dictionary.dashboard.channels.stores}</Tag>
              </Space>
            }
            styles={{ body: { padding: 22 } }}
            title={dictionary.dashboard.salesProportion}
          >
            <DonutChart items={snapshot.salesCategories} />
          </Card>
        </Col>
      </Row>

      <Card className="dashboard-card" styles={{ body: { padding: 22 } }}>
        <div className="dashboard-store-tabs">
          {snapshot.storePerformance.stores.map((store, index) => (
            <div key={store.id} className={`dashboard-store-tab${index === 0 ? ' is-active' : ''}`}>
              <div className="dashboard-store-tab__title">{store.name}</div>
              <div className="dashboard-store-tab__sub">{dictionary.dashboard.conversionRate}</div>
              <Progress percent={store.conversionRate} showInfo={false} size={72} type="circle" />
            </div>
          ))}
        </div>
        <div className="dashboard-store-chart__legend">
          <span>
            <RiseOutlined style={{ color: '#1677ff' }} /> {dictionary.dashboard.traffic}
          </span>
          <span>
            <RiseOutlined style={{ color: '#13c2c2' }} /> {dictionary.dashboard.paymentsCount}
          </span>
        </div>
        <TrendLines
          paymentsSeries={snapshot.storePerformance.paymentsSeries}
          trafficSeries={snapshot.storePerformance.trafficSeries}
        />
        <Typography.Text className="dashboard-trend-axis">
          {snapshot.storePerformance.timeLabels.join('  ')}
        </Typography.Text>
      </Card>
    </Space>
  );
}
