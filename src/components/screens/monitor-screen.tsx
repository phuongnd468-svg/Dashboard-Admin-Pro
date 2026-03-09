'use client';

import { App, Card, Progress, Space, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api/client';
import { useApiQuery } from '@/lib/api/hooks';
import { monitorApi } from '@/lib/api/monitor';
import type { MonitorSnapshot } from '@/lib/monitor';
import type { Dictionary } from '@/lib/i18n';

function formatAmount(value: number) {
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

function ForecastArea() {
  const points = '0,80 18,74 36,72 54,66 72,68 90,56 108,52 126,54 144,50 162,46 180,44 198,34 216,36 234,28 252,30 270,22';
  return (
    <svg className="monitor-forecast-chart" viewBox="0 0 270 94" preserveAspectRatio="none">
      <defs>
        <linearGradient id="monitorForecastGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#adc6ff" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#monitorForecastGradient)" points={`0,94 ${points} 270,94`} />
      <polyline fill="none" points={points} stroke="#adc6ff" strokeWidth="3" />
    </svg>
  );
}

function Gauge({ score, label }: { score: number; label: string }) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const centerX = 120;
  const centerY = 134;
  const radius = 76;
  const startAngle = 198;
  const endAngle = -18;
  const sweep = startAngle - endAngle;
  const needleAngle = startAngle - (normalizedScore / 100) * sweep;

  const polarToCartesian = (angle: number, currentRadius: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + currentRadius * Math.cos(radians),
      y: centerY + currentRadius * Math.sin(radians),
    };
  };

  const describeArc = (arcStart: number, arcEnd: number, currentRadius: number) => {
    const start = polarToCartesian(arcEnd, currentRadius);
    const end = polarToCartesian(arcStart, currentRadius);
    const largeArcFlag = arcStart - arcEnd <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${currentRadius} ${currentRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const tickAngles = [0, 20, 40, 60, 80, 100].map((value) => ({
    value,
    angle: startAngle - (value / 100) * sweep,
  }));
  const needleEnd = polarToCartesian(needleAngle, 48);
  const needleBase = polarToCartesian(needleAngle, 10);
  const statusTone =
    normalizedScore >= 80 ? 'is-excellent' : normalizedScore >= 60 ? 'is-strong' : normalizedScore >= 40 ? 'is-stable' : 'is-risk';

  return (
    <div className={`monitor-gauge ${statusTone}`}>
      <svg className="monitor-gauge__svg" viewBox="0 0 240 180" aria-hidden="true">
        <defs>
          <linearGradient id="monitorGaugeHalo" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f5f7fb" stopOpacity="0.18" />
          </linearGradient>
          <filter id="monitorGaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1677ff" floodOpacity="0.1" />
          </filter>
        </defs>
        <path className="monitor-gauge__halo" d={describeArc(startAngle, endAngle, radius + 10)} />
        <path className="monitor-gauge__track" d={describeArc(startAngle, endAngle, radius)} />
        <path className="monitor-gauge__segment monitor-gauge__segment--blue" d={describeArc(198, 150, radius)} />
        <path className="monitor-gauge__segment monitor-gauge__segment--mint" d={describeArc(150, 96, radius)} />
        <path className="monitor-gauge__segment monitor-gauge__segment--gold" d={describeArc(96, 42, radius)} />
        <path className="monitor-gauge__segment monitor-gauge__segment--green" d={describeArc(42, -18, radius)} />
        {tickAngles.map((tick) => {
          const point = polarToCartesian(tick.angle, radius + 18);
          return (
            <text
              key={tick.value}
              className="monitor-gauge__tick"
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {tick.value}
            </text>
          );
        })}
        <line
          className="monitor-gauge__needle-line"
          filter="url(#monitorGaugeShadow)"
          x1={needleBase.x}
          x2={needleEnd.x}
          y1={needleBase.y}
          y2={needleEnd.y}
        />
        <circle className="monitor-gauge__needle-cap" cx={centerX} cy={centerY} r={12} />
        <circle className="monitor-gauge__needle-core" cx={centerX} cy={centerY} r={6} />
        <circle className="monitor-gauge__needle-dot" cx={needleEnd.x} cy={needleEnd.y} r={3.5} />
        <circle className="monitor-gauge__center-ring" cx={centerX} cy={centerY} fill="url(#monitorGaugeHalo)" r={36} />
      </svg>
      <div className="monitor-gauge__center">
        <span className="monitor-gauge__score">{normalizedScore}</span>
        <strong>{label}</strong>
        <span className="monitor-gauge__caption">Approval throughput</span>
      </div>
    </div>
  );
}

function SearchCloud({ terms }: { terms: string[] }) {
  const palette = ['#36cfc9', '#69c0ff', '#b37feb', '#95de64', '#ffc53d', '#5cdbd3', '#40a9ff', '#d3adf7'];
  const placements = [
    { left: '10%', top: '62%', rotate: '-84deg', size: 18 },
    { left: '24%', top: '46%', rotate: '28deg', size: 15 },
    { left: '72%', top: '22%', rotate: '-70deg', size: 19 },
    { left: '54%', top: '14%', rotate: '82deg', size: 18 },
    { left: '66%', top: '56%', rotate: '10deg', size: 17 },
    { left: '42%', top: '74%', rotate: '-10deg', size: 16 },
    { left: '16%', top: '24%', rotate: '90deg', size: 17 },
    { left: '84%', top: '42%', rotate: '-88deg', size: 16 },
    { left: '30%', top: '16%', rotate: '-26deg', size: 20 },
    { left: '74%', top: '70%', rotate: '16deg', size: 17 },
    { left: '46%', top: '38%', rotate: '-42deg', size: 15 },
    { left: '56%', top: '84%', rotate: '2deg', size: 18 },
  ];

  return (
    <div className="monitor-cloud">
      {terms.map((term, index) => (
        <span
          key={term}
          className="monitor-cloud__term"
          style={{
            color: palette[index % palette.length],
            left: placements[index % placements.length]?.left,
            top: placements[index % placements.length]?.top,
            fontSize: placements[index % placements.length]?.size,
            transform: `rotate(${placements[index % placements.length]?.rotate ?? '0deg'})`,
          }}
        >
          {term}
        </span>
      ))}
    </div>
  );
}

function WorldBubbleMap({ bubbles }: { bubbles: MonitorSnapshot['mapBubbles'] }) {
  const backgroundBubbles = bubbles.flatMap((bubble, index) => {
    const offsets = [
      { x: -8, y: 8, size: 16 },
      { x: 6, y: -10, size: 20 },
      { x: 12, y: 4, size: 14 },
      { x: -12, y: -6, size: 18 },
    ];

    return offsets.map((offset, offsetIndex) => ({
      key: `${bubble.label}-${offsetIndex}`,
      x: Math.max(3, Math.min(97, bubble.x + offset.x + (index % 2 === 0 ? 0 : 2))),
      y: Math.max(8, Math.min(92, bubble.y + offset.y)),
      size: Math.max(10, Math.round(bubble.size * 0.36) + offset.size),
    }));
  });

  return (
    <div className="monitor-map">
      <div className="monitor-map__continent monitor-map__continent--na" />
      <div className="monitor-map__continent monitor-map__continent--sa" />
      <div className="monitor-map__continent monitor-map__continent--eu" />
      <div className="monitor-map__continent monitor-map__continent--asia" />
      <div className="monitor-map__continent monitor-map__continent--africa" />
      <div className="monitor-map__continent monitor-map__continent--oceania" />
      {backgroundBubbles.map((bubble) => (
        <div
          key={bubble.key}
          className="monitor-map__bubble monitor-map__bubble--ambient"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
          }}
        />
      ))}
      {bubbles.map((bubble) => (
        <div
          key={bubble.label}
          className="monitor-map__bubble"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
          }}
        >
          <span>{bubble.label}</span>
        </div>
      ))}
      <div className="monitor-map__watermark">AntV | L7</div>
    </div>
  );
}

export function MonitorScreen({ dictionary }: { dictionary: Dictionary }) {
  const { message } = App.useApp();
  const loadSnapshot = useCallback(() => monitorApi.getSnapshot(), []);
  const snapshotQuery = useApiQuery(loadSnapshot, [loadSnapshot]);
  const snapshot = snapshotQuery.data;
  const loading = snapshotQuery.loading;
  const [liveNow, setLiveNow] = useState(Date.now());

  useEffect(() => {
    if (snapshotQuery.error) {
      message.error(getApiErrorMessage(snapshotQuery.error, dictionary.monitor.loadingError));
    }
  }, [snapshotQuery.error, dictionary.monitor.loadingError, message]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void snapshotQuery.refetch().catch(() => undefined);
    }, 15000);

    return () => window.clearInterval(timer);
  }, [snapshotQuery.refetch]);

  if (!snapshot) {
    return (
      <Card className="app-panel" loading={loading}>
        <div style={{ height: 480 }} />
      </Card>
    );
  }

  const serverTimestamp = new Date(snapshot.serverTime).getTime();
  const elapsedSinceFetch = Math.max(0, liveNow - serverTimestamp);
  const liveAmountValue = snapshot.todayTotalAmountValue + (elapsedSinceFetch / 1000) * snapshot.amountPerSecond;
  const liveRemainingMs = Math.max(0, snapshot.remainingMs - elapsedSinceFetch);

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div className="monitor-layout">
        <Card className="dashboard-card monitor-card monitor-card--map" styles={{ body: { padding: 0 } }}>
          <div className="monitor-card__title">{dictionary.monitor.title}</div>
          <div className="monitor-card__metrics">
            <div>
              <span>{dictionary.monitor.metrics.totalAmount}</span>
              <strong>{formatAmount(liveAmountValue)}</strong>
            </div>
            <div>
              <span>{dictionary.monitor.metrics.targetRate}</span>
              <strong>{snapshot.targetRate}%</strong>
            </div>
            <div>
              <span>{dictionary.monitor.metrics.remainingTime}</span>
              <strong>{formatRemainingTime(liveRemainingMs)}</strong>
            </div>
            <div>
              <span>{dictionary.monitor.metrics.amountPerSecond}</span>
              <strong>{snapshot.amountPerSecond}</strong>
            </div>
          </div>
          <WorldBubbleMap bubbles={snapshot.mapBubbles} />
        </Card>

        <div className="monitor-side">
          <Card className="dashboard-card monitor-card" styles={{ body: { padding: 0 } }}>
            <div className="monitor-card__title">{dictionary.monitor.forecastTitle}</div>
            <div className="monitor-forecast">
              <span>{dictionary.monitor.forecast.label}</span>
              <strong>{dictionary.monitor.forecast.value}</strong>
              <div className="monitor-forecast__numbers">
                <div>{snapshot.forecastUpper.toFixed(1)}B</div>
                <div>{snapshot.forecastLower.toFixed(1)}B</div>
              </div>
              <ForecastArea />
              <div className="monitor-forecast__axis">
                <span>00:00</span>
                <span>12:00</span>
                <span>23:00</span>
              </div>
            </div>
          </Card>

          <Card className="dashboard-card monitor-card" styles={{ body: { padding: 0 } }}>
            <div className="monitor-card__title">{dictionary.monitor.efficiencyTitle}</div>
            <div className="monitor-gauge-shell">
              <Gauge label={dictionary.monitor.efficiency.score} score={snapshot.efficiencyScore} />
            </div>
          </Card>
        </div>
      </div>

      <div className="monitor-bottom">
        <Card className="dashboard-card monitor-card" styles={{ body: { padding: 0 } }}>
          <div className="monitor-card__title">{dictionary.monitor.categoryTitle}</div>
          <div className="monitor-progress-list">
            {snapshot.categoryProgress.map((item) => (
              <div key={item.label} className="monitor-progress-item">
                <Progress percent={item.value} showInfo={false} size={140} strokeWidth={10} type="circle" />
                <div className="monitor-progress-item__value">{item.value}%</div>
                <div className="monitor-progress-item__label">{item.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="dashboard-card monitor-card" styles={{ body: { padding: 0 } }}>
          <div className="monitor-card__title">{dictionary.monitor.searchTitle}</div>
          <div className="monitor-cloud-shell">
            <SearchCloud terms={snapshot.searchTerms} />
          </div>
        </Card>

        <Card className="dashboard-card monitor-card" styles={{ body: { padding: 0 } }}>
          <div className="monitor-card__title">{dictionary.monitor.resourceTitle}</div>
          <div className="monitor-resource">
            <div className="monitor-resource__orb">
              <div className="monitor-resource__fill" style={{ height: `${snapshot.resourceRemaining}%` }}>
                <div className="monitor-resource__wave monitor-resource__wave--back" />
                <div className="monitor-resource__wave monitor-resource__wave--front" />
                <div className="monitor-resource__wave monitor-resource__wave--crest" />
              </div>
              <div className="monitor-resource__value">{snapshot.resourceRemaining} %</div>
            </div>
          </div>
        </Card>
      </div>
    </Space>
  );
}
