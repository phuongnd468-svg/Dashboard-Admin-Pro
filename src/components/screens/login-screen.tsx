'use client';

import {
  LockOutlined,
  MobileOutlined,
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
  Row,
  Space,
  Tabs,
  Typography,
} from 'antd';
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

  return (
    <div className="app-login">
      <Card className="app-login__card" styles={{ body: { padding: 0 } }}>
        <Row gutter={0}>
          <Col xs={24} lg={11}>
            <div className="app-login__hero">
              <Space direction="vertical" size={20}>
                <Typography.Title level={1} style={{ color: '#fff', margin: 0 }}>
                  {dictionary.login.title}
                </Typography.Title>
                <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.78)', fontSize: 16, margin: 0 }}>
                  {dictionary.login.subtitle}
                </Typography.Paragraph>
                <Alert
                  type="info"
                  showIcon
                  message={dictionary.login.demo.title}
                  description={dictionary.login.demo.description}
                />
              </Space>
            </div>
          </Col>
          <Col xs={24} lg={13}>
            <div style={{ padding: 40 }}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <div>
                  <Typography.Title level={2} style={{ marginBottom: 8 }}>
                    {dictionary.login.formTitle}
                  </Typography.Title>
                  <Typography.Text type="secondary">{dictionary.login.formDescription}</Typography.Text>
                </div>

                {error ? <Alert type="error" showIcon message={error} /> : null}

                <Tabs
                  activeKey={activeTab}
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
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
