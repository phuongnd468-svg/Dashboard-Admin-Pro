'use client';

import {
  ApiOutlined,
  GlobalOutlined,
  LockOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppContext } from '@/components/providers/app-provider';
import type { Dictionary, Locale } from '@/lib/i18n';

type AccountForm = {
  username: string;
  password: string;
};

type MobileForm = {
  phone: string;
  captcha: string;
};

export function LoginScreen({
  dictionary,
  locale,
  redirectTarget,
}: {
  dictionary: Dictionary;
  locale: Locale;
  redirectTarget?: string;
}) {
  const router = useRouter();
  const { message } = App.useApp();
  const { login } = useAppContext();
  const [activeTab, setActiveTab] = useState<'account' | 'mobile'>('account');
  const [error, setError] = useState<string | null>(null);

  const nextRoute = redirectTarget || `/${locale}/welcome`;

  const onAccountSubmit = async (values: AccountForm) => {
    if (!['admin', 'user'].includes(values.username) || values.password !== 'ant.design') {
      setError(dictionary.login.account.error);
      return;
    }

    login({ username: values.username });
    message.success(dictionary.login.success);
    router.push(nextRoute);
  };

  const onMobileSubmit = async (_values: MobileForm) => {
    login({ username: 'user' });
    message.success(dictionary.login.success);
    router.push(nextRoute);
  };

  const heroHighlights = [
    { icon: <GlobalOutlined />, label: '3 Locales' },
    { icon: <ApiOutlined />, label: 'Mock API Ready' },
    { icon: <SafetyCertificateOutlined />, label: 'Persistent Settings' },
  ];

  const demoAccounts = [
    { role: dictionary.common.admin, username: 'admin', password: 'ant.design' },
    { role: dictionary.common.member, username: 'user', password: 'ant.design' },
  ];

  return (
    <div className="app-login">
      <Card className="app-login__card" styles={{ body: { padding: 0 } }}>
        <Row gutter={0}>
          <Col xs={24} lg={11}>
            <div className="app-login__hero">
              <div className="app-login__cover">
                <Image
                  alt="Admin Pro login cover"
                  className="app-login__cover-image"
                  fill
                  priority
                  src="/login-cover.svg"
                />
                <div className="app-login__cover-badge">
                  <span className="app-login__cover-badge-dot" />
                  <span>Admin Pro</span>
                </div>
              </div>
              <div className="app-login__hero-content">
                <div className="app-login__hero-top">
                  <Tag bordered={false} className="app-login__hero-tag">
                    Modern admin template
                  </Tag>
                  <Typography.Title level={1} style={{ color: '#fff', margin: 0 }}>
                    {dictionary.login.title}
                  </Typography.Title>
                  <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.78)', fontSize: 16, margin: 0 }}>
                    {dictionary.login.subtitle}
                  </Typography.Paragraph>
                </div>

                <div className="app-login__hero-highlights">
                  {heroHighlights.map((item) => (
                    <div key={item.label} className="app-login__hero-highlight">
                      <span className="app-login__hero-highlight-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <Alert
                  type="info"
                  showIcon
                  message={dictionary.login.demo.title}
                  description={dictionary.login.demo.description}
                />
              </div>
            </div>
          </Col>
          <Col xs={24} lg={13}>
            <div className="app-login__auth">
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <div className="app-login__auth-header">
                  <div>
                    <Typography.Text className="app-login__eyebrow">Secure access</Typography.Text>
                    <Typography.Title level={2} style={{ marginBottom: 8 }}>
                      {dictionary.login.formTitle}
                    </Typography.Title>
                    <Typography.Text type="secondary">{dictionary.login.formDescription}</Typography.Text>
                  </div>
                </div>

                <div className="app-login__demo-cards">
                  {demoAccounts.map((account) => (
                    <div key={account.role} className="app-login__demo-card">
                      <div className="app-login__demo-card-role">{account.role}</div>
                      <div className="app-login__demo-card-credential">
                        <span>{account.username}</span>
                        <span>{account.password}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {error ? <Alert type="error" showIcon message={error} /> : null}

                <Card className="app-login__auth-panel" bordered={false}>
                  <Typography.Title level={3} style={{ marginBottom: 8 }}>
                    {dictionary.login.formTitle}
                  </Typography.Title>
                  <Typography.Text type="secondary">{dictionary.login.formDescription}</Typography.Text>
                  <Tabs
                    activeKey={activeTab}
                    className="app-login__tabs"
                    onChange={(key) => {
                      setActiveTab(key as 'account' | 'mobile');
                      setError(null);
                    }}
                    items={[
                      {
                        key: 'account',
                        label: dictionary.login.tabs.account,
                        children: (
                          <Form<AccountForm> layout="vertical" onFinish={onAccountSubmit}>
                            <Form.Item
                              label={dictionary.login.account.username}
                              name="username"
                              rules={[{ required: true, message: dictionary.login.account.usernameRequired }]}
                            >
                              <Input prefix={<UserOutlined />} placeholder="admin / user" />
                            </Form.Item>
                            <Form.Item
                              label={dictionary.login.account.password}
                              name="password"
                              rules={[{ required: true, message: dictionary.login.account.passwordRequired }]}
                            >
                              <Input.Password prefix={<LockOutlined />} placeholder="ant.design" />
                            </Form.Item>
                            <Button block htmlType="submit" size="large" type="primary">
                              {dictionary.login.actions.signIn}
                            </Button>
                          </Form>
                        ),
                      },
                      {
                        key: 'mobile',
                        label: dictionary.login.tabs.mobile,
                        children: (
                          <Form<MobileForm> layout="vertical" onFinish={onMobileSubmit}>
                            <Form.Item
                              label={dictionary.login.mobile.phone}
                              name="phone"
                              rules={[{ required: true, message: dictionary.login.mobile.phoneRequired }]}
                            >
                              <Input prefix={<MobileOutlined />} placeholder="+84 912 345 678" />
                            </Form.Item>
                            <Form.Item
                              label={dictionary.login.mobile.captcha}
                              name="captcha"
                              rules={[{ required: true, message: dictionary.login.mobile.captchaRequired }]}
                            >
                              <Input placeholder="123456" />
                            </Form.Item>
                            <Button block htmlType="submit" size="large" type="primary">
                              {dictionary.login.actions.sendCode}
                            </Button>
                          </Form>
                        ),
                      },
                    ]}
                  />
                </Card>

                <Card className="app-login__meta" bordered={false}>
                  <List
                    dataSource={heroHighlights}
                    renderItem={(item) => (
                      <List.Item className="app-login__meta-item">
                        <span className="app-login__meta-item-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </List.Item>
                    )}
                  />
                </Card>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
