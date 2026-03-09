'use client';

import {
  AlipayCircleFilled,
  AndroidFilled,
  AntDesignOutlined,
  ApiFilled,
  AppstoreFilled,
  CodeSandboxCircleFilled,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Avatar, Button, Card, List, Space, Typography } from 'antd';
import { useCallback, useEffect } from 'react';
import { getApiErrorMessage } from '@/lib/api/client';
import { useApiQuery } from '@/lib/api/hooks';
import { workplaceApi } from '@/lib/api/workplace';
import type { Dictionary } from '@/lib/i18n';
import type { WorkplaceProject, WorkplaceSnapshot } from '@/lib/workplace';

const projectIcons: Record<string, React.ReactNode> = {
  Alipay: <AlipayCircleFilled />,
  Angular: <CodeSandboxCircleFilled />,
  'Ant Design': <AntDesignOutlined />,
  'Admin Pro': <AppstoreFilled />,
  Bootstrap: <ApiFilled />,
  React: <AndroidFilled />,
};

const activityAvatars = ['#91d5ff', '#69c0ff', '#95de64', '#ffd666', '#b37feb', '#5cdbd3'];
const radarLabels = ['Innovation', 'Execution', 'Collaboration', 'Delivery', 'Growth'];

function projectIconFor(name: string) {
  return projectIcons[name] ?? <AntDesignOutlined />;
}

function RadarChart({ radar }: { radar: WorkplaceSnapshot['radar'] }) {
  const center = 120;
  const radius = 82;
  const axisCount = radarLabels.length;
  const series = [
    { key: 'personal', values: radar.personal, color: 'rgba(22, 119, 255, 0.42)' },
    { key: 'team', values: radar.team, color: 'rgba(54, 207, 201, 0.34)' },
    { key: 'department', values: radar.department, color: 'rgba(250, 173, 20, 0.24)' },
  ];

  const pointFor = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
    const scaled = (value / 10) * radius;
    return {
      x: center + Math.cos(angle) * scaled,
      y: center + Math.sin(angle) * scaled,
    };
  };

  return (
    <div className="workplace-radar">
      <svg viewBox="0 0 240 240" className="workplace-radar__svg" aria-hidden="true">
        {[0.25, 0.5, 0.75, 1].map((scale, index) => (
          <polygon
            key={scale}
            className="workplace-radar__grid"
            points={radarLabels
              .map((_, radarIndex) => {
                const angle = (Math.PI * 2 * radarIndex) / axisCount - Math.PI / 2;
                return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
              })
              .join(' ')}
            style={{ opacity: 0.25 + index * 0.12 }}
          />
        ))}
        {radarLabels.map((label, index) => {
          const outer = pointFor(10, index);

          return (
            <g key={label}>
              <line className="workplace-radar__axis" x1={center} x2={outer.x} y1={center} y2={outer.y} />
              <text className="workplace-radar__label" x={outer.x} y={outer.y}>
                {label}
              </text>
            </g>
          );
        })}
        {series.map((item) => (
          <polygon
            key={item.key}
            className="workplace-radar__shape"
            fill={item.color}
            points={item.values.map((value, index) => `${pointFor(value, index).x},${pointFor(value, index).y}`).join(' ')}
          />
        ))}
      </svg>
      <div className="workplace-radar__legend">
        <span><i style={{ background: 'rgba(22, 119, 255, 0.9)' }} />Personal</span>
        <span><i style={{ background: 'rgba(54, 207, 201, 0.9)' }} />Team</span>
        <span><i style={{ background: 'rgba(250, 173, 20, 0.9)' }} />Department</span>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: WorkplaceProject }) {
  return (
    <div className="workplace-project-card">
      <div className="workplace-project-card__title">
        <span className="workplace-project-card__icon">{projectIconFor(project.name)}</span>
        <strong>{project.name}</strong>
      </div>
      <p className="workplace-project-card__description">{project.description}</p>
      <div className="workplace-project-card__meta">
        <span>{project.group}</span>
        <span>{project.updatedAgo}</span>
      </div>
    </div>
  );
}

export function WorkplaceScreen({ dictionary }: { dictionary: Dictionary }) {
  const { message } = App.useApp();
  const loadSnapshot = useCallback(() => workplaceApi.getSnapshot(), []);
  const snapshotQuery = useApiQuery(loadSnapshot, [loadSnapshot]);
  const snapshot = snapshotQuery.data;
  const loading = snapshotQuery.loading;

  useEffect(() => {
    if (snapshotQuery.error) {
      message.error(getApiErrorMessage(snapshotQuery.error, 'Unable to load workplace data.'));
    }
  }, [snapshotQuery.error, message]);

  if (!snapshot) {
    return (
      <Card className="app-panel" loading={loading}>
        <div style={{ height: 720 }} />
      </Card>
    );
  }

  return (
    <Space className="workplace-shell" direction="vertical" size={24}>
      <div className="workplace-breadcrumb">{dictionary.workplace.breadcrumb}</div>

      <section className="workplace-hero">
        <div className="workplace-hero__main">
          <Avatar className="workplace-hero__avatar" icon={<UserOutlined />} size={80} />
          <div>
            <Typography.Title className="workplace-hero__title" level={2}>
              {dictionary.workplace.title}
            </Typography.Title>
            <div className="workplace-hero__greeting">{dictionary.workplace.greeting}</div>
            <div className="workplace-hero__role">{dictionary.workplace.roleLine}</div>
          </div>
        </div>
        <div className="workplace-hero__stats">
          <div>
            <span>{dictionary.workplace.stats.projects}</span>
            <strong>{snapshot.stats.projects}</strong>
          </div>
          <div>
            <span>{dictionary.workplace.stats.ranking}</span>
            <strong>{snapshot.stats.ranking}</strong>
          </div>
          <div>
            <span>{dictionary.workplace.stats.visits}</span>
            <strong>{snapshot.stats.visits.toLocaleString()}</strong>
          </div>
        </div>
      </section>

      <div className="workplace-layout">
        <div className="workplace-main">
          <Card className="dashboard-card" styles={{ body: { padding: 0 } }}>
            <div className="workplace-card__header">
              <span>{dictionary.workplace.projectsTitle}</span>
              <button type="button">{dictionary.workplace.allProjects}</button>
            </div>
            <div className="workplace-projects">
              {snapshot.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Card>

          <Card className="dashboard-card" styles={{ body: { padding: 0 } }}>
            <div className="workplace-card__header">
              <span>{dictionary.workplace.activityTitle}</span>
            </div>
            <List
              className="workplace-activity"
              dataSource={snapshot.activity}
              renderItem={(item, index) => (
                <List.Item className="workplace-activity__item">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        className="workplace-activity__avatar"
                        icon={<UserOutlined />}
                        style={{ background: activityAvatars[index % activityAvatars.length] }}
                      />
                    }
                    description={<span className="workplace-activity__time">a few seconds ago</span>}
                    title={<span className="workplace-activity__title">{item}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>

        <div className="workplace-side">
          <Card className="dashboard-card" styles={{ body: { padding: 0 } }}>
            <div className="workplace-card__header">
              <span>{dictionary.workplace.quickStartTitle}</span>
            </div>
            <div className="workplace-shortcuts">
              {snapshot.shortcuts.map((shortcut) => (
                <button key={shortcut} className="workplace-shortcut" type="button">
                  {shortcut}
                </button>
              ))}
              <Button icon={<PlusOutlined />} type="dashed">
                {dictionary.workplace.addShortcut}
              </Button>
            </div>
          </Card>

          <Card className="dashboard-card" styles={{ body: { padding: 0 } }}>
            <div className="workplace-card__header">
              <span>{dictionary.workplace.radarTitle}</span>
            </div>
            <RadarChart radar={snapshot.radar} />
          </Card>

          <Card className="dashboard-card" styles={{ body: { padding: 0 } }}>
            <div className="workplace-card__header">
              <span>{dictionary.workplace.teamTitle}</span>
            </div>
            <div className="workplace-team">
              {snapshot.team.map((team) => (
                <div key={team} className="workplace-team__item">
                  <Avatar className="workplace-team__avatar" size={30}>
                    {team.slice(0, 1)}
                  </Avatar>
                  <span>{team}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Space>
  );
}
