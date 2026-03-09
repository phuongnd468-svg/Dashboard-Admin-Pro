'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Progress,
  Radio,
  Rate,
  Row,
  Segmented,
  Select,
  Slider,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import type { Dictionary } from '@/lib/i18n';

type SectionKey = 'controls' | 'selection' | 'feedback' | 'display';

type TableRow = {
  key: string;
  component: string;
  usage: string;
  status: string;
};

const HASH_TO_SECTION: Record<string, SectionKey> = {
  '': 'controls',
  '#controls': 'controls',
  '#selection': 'selection',
  '#feedback': 'feedback',
  '#display': 'display',
};

const SECTION_TO_HASH: Record<SectionKey, string> = {
  controls: '#controls',
  selection: '#selection',
  feedback: '#feedback',
  display: '#display',
};

function syncSectionFromHash() {
  if (typeof window === 'undefined') {
    return 'controls';
  }

  return HASH_TO_SECTION[window.location.hash] ?? 'controls';
}

function updateHash(section: SectionKey) {
  if (typeof window === 'undefined') {
    return;
  }

  const hash = SECTION_TO_HASH[section];
  window.history.replaceState(null, '', hash === '#controls' ? window.location.pathname : `${window.location.pathname}${hash}`);
}

export function ComponentScreen({ dictionary }: { dictionary: Dictionary }) {
  const [activeSection, setActiveSection] = useState<SectionKey>('controls');
  const [segmentValue, setSegmentValue] = useState(dictionary.componentPage.controls.segmentWeekly);
  const [modeValue, setModeValue] = useState(dictionary.componentPage.selection.modeHybrid);
  const [channels, setChannels] = useState<string[]>([
    dictionary.componentPage.selection.optionsEmail,
    dictionary.componentPage.selection.optionsWebhook,
  ]);
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState(62);
  const [owner, setOwner] = useState('Nguyen Dong Phuong');

  useEffect(() => {
    const sync = () => setActiveSection(syncSectionFromHash());
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const dataColumns: ColumnsType<TableRow> = [
    { title: 'Component', dataIndex: 'component', key: 'component' },
    { title: 'Usage', dataIndex: 'usage', key: 'usage' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => <Tag color={value === 'Ready' ? 'success' : value === 'Review' ? 'processing' : 'warning'}>{value}</Tag>,
    },
  ];

  const dataRows: TableRow[] = [
    { key: '1', component: 'Action buttons', usage: 'Primary workflow trigger', status: 'Ready' },
    { key: '2', component: 'Selection controls', usage: 'Form and settings state', status: 'Ready' },
    { key: '3', component: 'Feedback blocks', usage: 'Operational system status', status: 'Review' },
  ];

  const tabItems = [
    {
      key: 'controls',
      label: dictionary.componentPage.sections.controls,
      children: (
        <Row gutter={[24, 24]}>
          <Col lg={14} xs={24}>
            <Card className="component-page__panel">
              <Typography.Title level={3}>{dictionary.componentPage.controls.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{dictionary.componentPage.controls.description}</Typography.Paragraph>
              <Space className="component-page__button-row" size={[12, 12]} wrap>
                <Button type="primary" size="large">
                  {dictionary.componentPage.controls.buttonPrimary}
                </Button>
                <Button size="large">{dictionary.componentPage.controls.buttonSecondary}</Button>
                <Button ghost size="large" type="primary">
                  {dictionary.componentPage.controls.buttonGhost}
                </Button>
                <Button danger size="large" type="default">
                  {dictionary.componentPage.controls.buttonDanger}
                </Button>
              </Space>
              <div className="component-page__segmented">
                <Segmented
                  options={[
                    dictionary.componentPage.controls.segmentDaily,
                    dictionary.componentPage.controls.segmentWeekly,
                    dictionary.componentPage.controls.segmentMonthly,
                  ]}
                  size="large"
                  value={segmentValue}
                  onChange={(value) => setSegmentValue(String(value))}
                />
              </div>
            </Card>
          </Col>
          <Col lg={10} xs={24}>
            <Card className="component-page__panel component-page__panel--stats">
              <Statistic prefix="$" title={dictionary.componentPage.display.statRevenue} value={128560} />
              <Statistic suffix="%" title={dictionary.componentPage.display.statConversion} value={78} />
              <Statistic suffix="ms" title={dictionary.componentPage.display.statResponse} value={248} />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'selection',
      label: dictionary.componentPage.sections.selection,
      children: (
        <Row gutter={[24, 24]}>
          <Col lg={16} xs={24}>
            <Card className="component-page__panel">
              <Typography.Title level={3}>{dictionary.componentPage.selection.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{dictionary.componentPage.selection.description}</Typography.Paragraph>
              <div className="component-page__field">
                <Typography.Text strong>{dictionary.componentPage.selection.modeLabel}</Typography.Text>
                <Radio.Group value={modeValue} onChange={(event) => setModeValue(event.target.value)}>
                  <Radio.Button value={dictionary.componentPage.selection.modeManual}>{dictionary.componentPage.selection.modeManual}</Radio.Button>
                  <Radio.Button value={dictionary.componentPage.selection.modeHybrid}>{dictionary.componentPage.selection.modeHybrid}</Radio.Button>
                  <Radio.Button value={dictionary.componentPage.selection.modeAuto}>{dictionary.componentPage.selection.modeAuto}</Radio.Button>
                </Radio.Group>
              </div>
              <div className="component-page__field">
                <Typography.Text strong>{dictionary.componentPage.selection.optionsLabel}</Typography.Text>
                <Checkbox.Group
                  options={[
                    dictionary.componentPage.selection.optionsEmail,
                    dictionary.componentPage.selection.optionsSms,
                    dictionary.componentPage.selection.optionsWebhook,
                  ]}
                  value={channels}
                  onChange={(value) => setChannels(value as string[])}
                />
              </div>
              <div className="component-page__selection-grid">
                <div className="component-page__selection-card">
                  <Typography.Text strong>{dictionary.componentPage.selection.enableAudit}</Typography.Text>
                  <Switch checked={auditEnabled} onChange={setAuditEnabled} />
                </div>
                <div className="component-page__selection-card">
                  <Typography.Text strong>{dictionary.componentPage.selection.owner}</Typography.Text>
                  <Select
                    options={[
                      { label: 'Nguyen Dong Phuong', value: 'Nguyen Dong Phuong' },
                      { label: 'Le Minh Anh', value: 'Le Minh Anh' },
                      { label: 'Tran Quoc Bao', value: 'Tran Quoc Bao' },
                    ]}
                    value={owner}
                    onChange={setOwner}
                  />
                </div>
              </div>
              <div className="component-page__field">
                <Typography.Text strong>{dictionary.componentPage.selection.volume}</Typography.Text>
                <Slider value={sensitivity} onChange={(value) => setSensitivity(value as number)} />
              </div>
            </Card>
          </Col>
          <Col lg={8} xs={24}>
            <Card className="component-page__panel component-page__panel--summary">
              <Typography.Title level={4}>Live state</Typography.Title>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Tag color="processing">{modeValue}</Tag>
                <Tag color={auditEnabled ? 'success' : 'default'}>{auditEnabled ? 'Audit enabled' : 'Audit disabled'}</Tag>
                <Tag>{owner}</Tag>
                <Progress percent={sensitivity} strokeColor="var(--app-primary)" />
                <Rate disabled value={4} />
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'feedback',
      label: dictionary.componentPage.sections.feedback,
      children: (
        <Row gutter={[24, 24]}>
          <Col lg={14} xs={24}>
            <Card className="component-page__panel">
              <Typography.Title level={3}>{dictionary.componentPage.feedback.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{dictionary.componentPage.feedback.description}</Typography.Paragraph>
              <Space direction="vertical" size={14} style={{ width: '100%' }}>
                <Alert message={dictionary.componentPage.feedback.success} showIcon type="success" />
                <Alert message={dictionary.componentPage.feedback.warning} showIcon type="warning" />
                <Alert banner message={dictionary.componentPage.feedback.processing} type="info" />
              </Space>
              <div className="component-page__badge-row">
                <Badge count={3}>
                  <Button>{dictionary.componentPage.selection.optionsLabel}</Button>
                </Badge>
                <Tag color="success">Stable</Tag>
                <Tag color="processing">Syncing</Tag>
                <Tag color="warning">Needs review</Tag>
              </div>
            </Card>
          </Col>
          <Col lg={10} xs={24}>
            <Card className="component-page__panel">
              <Typography.Title level={4}>Delivery status</Typography.Title>
              <Space direction="vertical" size={18} style={{ width: '100%' }}>
                <Progress percent={92} status="active" strokeColor="var(--app-primary)" />
                <Progress percent={68} strokeColor="#52c41a" />
                <Progress percent={38} status="exception" />
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'display',
      label: dictionary.componentPage.sections.display,
      children: (
        <Row gutter={[24, 24]}>
          <Col lg={14} xs={24}>
            <Card className="component-page__panel">
              <Typography.Title level={3}>{dictionary.componentPage.display.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{dictionary.componentPage.display.description}</Typography.Paragraph>
              <Table columns={dataColumns} dataSource={dataRows} pagination={false} rowHoverable={false} />
            </Card>
          </Col>
          <Col lg={10} xs={24}>
            <Card className="component-page__panel">
              <Timeline
                items={[
                  { color: 'blue', children: dictionary.componentPage.display.timelineCreated },
                  { color: 'green', children: dictionary.componentPage.display.timelineApproved },
                  { color: 'gray', children: dictionary.componentPage.display.timelineLaunched },
                ]}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Card className="app-panel component-page__hero">
        <div className="component-page__hero-inner">
          <div>
            <Typography.Title level={1}>{dictionary.componentPage.title}</Typography.Title>
            <Typography.Paragraph>{dictionary.componentPage.subtitle}</Typography.Paragraph>
          </div>
          <div className="component-page__hero-tags">
            <Tag color="blue">Ant Design 6</Tag>
            <Tag color="cyan">Interactive</Tag>
            <Tag color="green">Production styled</Tag>
          </div>
        </div>
      </Card>

      <Tabs
        activeKey={activeSection}
        className="component-page__tabs"
        items={tabItems}
        onChange={(key) => {
          const next = key as SectionKey;
          setActiveSection(next);
          updateHash(next);
        }}
      />
    </Space>
  );
}
