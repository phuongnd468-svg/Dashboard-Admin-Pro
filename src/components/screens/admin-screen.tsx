'use client';

import { UploadOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Select, Space, Typography } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useMemo } from 'react';
import { getApiErrorMessage } from '@/lib/api/client';
import { useApiMutation, useApiQuery } from '@/lib/api/hooks';
import { settingsApi, type SettingsProfileInput } from '@/lib/api/settings';
import type { Dictionary } from '@/lib/i18n';

type SettingsFormValues = SettingsProfileInput;

const provinceCityMap = {
  'ho-chi-minh-city': ['district-1', 'binh-thanh', 'thu-duc-city'],
  hanoi: ['cau-giay', 'ba-dinh'],
  danang: ['hai-chau', 'son-tra'],
} as const;

export function AdminScreen({ dictionary }: { dictionary: Dictionary }) {
  const { message } = App.useApp();
  const [form] = Form.useForm<SettingsFormValues>();
  const loadProfile = useCallback(() => settingsApi.getProfile(), []);
  const profileQuery = useApiQuery(loadProfile, [loadProfile]);
  const saveProfileMutation = useApiMutation((payload: SettingsProfileInput) => settingsApi.updateProfile(payload));
  const profile = profileQuery.data;
  const selectedProvince = Form.useWatch('province', form) ?? profile?.province ?? 'ho-chi-minh-city';

  const provinceOptions = useMemo(
    () => [
      { label: dictionary.settings.options.hoChiMinh, value: 'ho-chi-minh-city' },
      { label: dictionary.settings.options.hanoi, value: 'hanoi' },
      { label: dictionary.settings.options.danang, value: 'danang' },
    ],
    [dictionary.settings.options.danang, dictionary.settings.options.hanoi, dictionary.settings.options.hoChiMinh],
  );

  const cityOptions = useMemo(() => {
    const labels = {
      'district-1': dictionary.settings.options.district1,
      'binh-thanh': dictionary.settings.options.binhThanh,
      'thu-duc-city': dictionary.settings.options.thuDuc,
      'cau-giay': dictionary.settings.options.cauGiay,
      'ba-dinh': dictionary.settings.options.baDinh,
      'hai-chau': dictionary.settings.options.haiChau,
      'son-tra': dictionary.settings.options.sonTra,
    } satisfies Record<string, string>;

    return (provinceCityMap[selectedProvince as keyof typeof provinceCityMap] ?? []).map((value) => ({
      label: labels[value],
      value,
    }));
  }, [
    dictionary.settings.options.baDinh,
    dictionary.settings.options.binhThanh,
    dictionary.settings.options.cauGiay,
    dictionary.settings.options.district1,
    dictionary.settings.options.haiChau,
    dictionary.settings.options.sonTra,
    dictionary.settings.options.thuDuc,
    selectedProvince,
  ]);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue(profile);
    }
  }, [form, profile]);

  useEffect(() => {
    if (profileQuery.error) {
      message.error(getApiErrorMessage(profileQuery.error, dictionary.settings.loadingError));
    }
  }, [dictionary.settings.loadingError, message, profileQuery.error]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      await saveProfileMutation.mutateAsync(values);
      message.success(dictionary.settings.success);
      await profileQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.settings.loadingError));
    }
  };

  return (
    <Card bordered={false} className="app-settings-shell" loading={profileQuery.loading && !profile}>
      <div className="app-settings-shell__title">{dictionary.settings.pageTitle}</div>
      <div className="app-settings-layout">
        <div className="app-settings-form">
          <Form form={form} layout="vertical">
            <Form.Item
              label={dictionary.settings.fields.email}
              name="email"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={dictionary.settings.fields.nickname}
              name="nickname"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={dictionary.settings.fields.profile} name="profile">
              <Input.TextArea placeholder={dictionary.settings.fields.profilePlaceholder} rows={5} />
            </Form.Item>
            <Form.Item
              label={dictionary.settings.fields.country}
              name="country"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: dictionary.settings.options.vietnam, value: 'vietnam' },
                  { label: dictionary.settings.options.china, value: 'china' },
                  { label: dictionary.settings.options.unitedStates, value: 'us' },
                ]}
              />
            </Form.Item>
            <Form.Item label={dictionary.settings.fields.location}>
              <Space.Compact block>
                <Form.Item name="province" noStyle rules={[{ required: true }]}>
                  <Select
                    placeholder={dictionary.settings.fields.selectPlaceholder}
                    options={provinceOptions}
                    onChange={() => {
                      form.setFieldValue('city', undefined);
                    }}
                  />
                </Form.Item>
                <Form.Item name="city" noStyle rules={[{ required: true }]}>
                  <Select
                    placeholder={dictionary.settings.fields.selectPlaceholder}
                    options={cityOptions}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
            <Form.Item
              label={dictionary.settings.fields.address}
              name="address"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={dictionary.settings.fields.phone}>
              <Space.Compact block>
                <Form.Item name="areaCode" noStyle rules={[{ required: true }]}>
                  <Input style={{ maxWidth: 110 }} />
                </Form.Item>
                <Form.Item name="phone" noStyle rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
            <Button loading={saveProfileMutation.loading} type="primary" onClick={() => void onFinish()}>
              {dictionary.settings.actions.save}
            </Button>
          </Form>
        </div>

        <div className="app-settings-avatar">
          <div className="app-settings-avatar__label">{dictionary.settings.fields.avatar}</div>
          <Image
            alt="avatar"
            className="app-settings-avatar__image"
            height={120}
            src={profile?.avatarUrl ?? 'https://gw.alipayobjects.com/zos/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'}
            width={120}
          />
          <Button icon={<UploadOutlined />}>{dictionary.settings.actions.changeAvatar}</Button>
        </div>
      </div>
    </Card>
  );
}
