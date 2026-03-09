'use client';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api/client';
import { useApiMutation, useApiQuery } from '@/lib/api/hooks';
import { rulesApi, type RuleInput } from '@/lib/api/rules';
import type { Dictionary } from '@/lib/i18n';
import type { RuleRecord } from '@/lib/rules';

type RuleFormValues = RuleInput;

const statusColorMap: Record<RuleRecord['status'], string> = {
  draft: 'default',
  running: 'processing',
  online: 'success',
  error: 'error',
};

export function RulesListScreen({ dictionary }: { dictionary: Dictionary }) {
  const [form] = Form.useForm<RuleFormValues>();
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingRule, setEditingRule] = useState<RuleRecord | null>(null);
  const [detailRule, setDetailRule] = useState<RuleRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 6,
    showSizeChanger: true,
  });

  const loadRules = useCallback(() => rulesApi.list(), []);
  const rulesQuery = useApiQuery(loadRules, [loadRules]);
  const saveRuleMutation = useApiMutation(({ id, payload }: { id?: string; payload: RuleInput }) =>
    id ? rulesApi.update(id, payload) : rulesApi.create(payload),
  );
  const deleteRuleMutation = useApiMutation((id: string) => rulesApi.remove(id));
  const rules = rulesQuery.data ?? [];
  const loading = rulesQuery.loading;
  const submitting = saveRuleMutation.loading;

  const filteredRules = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return rules.filter((item) => {
      const matchesSearch =
        !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rules, searchValue, statusFilter]);

  const totalCalls = useMemo(
    () =>
      rules
        .filter((item) => selectedRowKeys.includes(item.id))
        .reduce((sum, item) => sum + item.calls, 0),
    [rules, selectedRowKeys],
  );

  useEffect(() => {
    setPagination((current) => ({ ...current, current: 1 }));
  }, [searchValue, statusFilter]);

  useEffect(() => {
    if (rulesQuery.error) {
      message.error(getApiErrorMessage(rulesQuery.error, dictionary.list.loadingError));
    }
  }, [dictionary.list.loadingError, message, rulesQuery.error]);

  const openCreateModal = () => {
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({ calls: 1, status: 'draft' });
    setModalOpen(true);
  };

  const openEditModal = (rule: RuleRecord) => {
    setEditingRule(rule);
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      calls: rule.calls,
      status: rule.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (ids: React.Key[]) => {
    if (!ids.length) {
      message.warning(dictionary.list.messages.selectAtLeastOne);
      return;
    }

    try {
      await Promise.all(ids.map((id) => deleteRuleMutation.mutateAsync(String(id))));
      setSelectedRowKeys([]);
      setDetailRule(null);
      message.success(dictionary.list.messages.deleteSuccess);
      await rulesQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.list.loadingError));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await saveRuleMutation.mutateAsync({
        id: editingRule?.id,
        payload: values,
      });
      message.success(editingRule ? dictionary.list.messages.updateSuccess : dictionary.list.messages.createSuccess);
      setModalOpen(false);
      form.resetFields();
      await rulesQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.list.loadingError));
    }
  };

  const columns: ColumnsType<RuleRecord> = [
    {
      title: dictionary.list.columns.name,
      dataIndex: 'name',
      render: (_, record) => (
        <Button type="link" onClick={() => setDetailRule(record)} style={{ paddingInline: 0 }}>
          {record.name}
        </Button>
      ),
    },
    {
      title: dictionary.list.columns.description,
      dataIndex: 'description',
    },
    {
      title: dictionary.list.columns.calls,
      dataIndex: 'calls',
    },
    {
      title: dictionary.list.columns.status,
      dataIndex: 'status',
      render: (status: RuleRecord['status']) => (
        <Tag color={statusColorMap[status]}>{dictionary.list.status[status]}</Tag>
      ),
    },
    {
      title: dictionary.list.columns.updatedAt,
      dataIndex: 'updatedAt',
    },
    {
      title: dictionary.list.columns.actions,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setDetailRule(record)}>
            {dictionary.list.actions.view}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            {dictionary.list.actions.edit}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete([record.id])}>
            {dictionary.list.actions.delete}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="app-panel" styles={{ body: { padding: 28 } }}>
        <Space direction="vertical" size={8}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {dictionary.list.title}
          </Typography.Title>
          <Typography.Text type="secondary">{dictionary.list.subtitle}</Typography.Text>
        </Space>
      </Card>

      <Card className="app-panel" styles={{ body: { padding: 24 } }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
            <Space wrap>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {dictionary.list.actions.create}
              </Button>
              <Input
                allowClear
                placeholder={dictionary.list.searchPlaceholder}
                prefix={<SearchOutlined />}
                style={{ width: 320 }}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
              <Select
                options={[
                  { label: dictionary.list.filters.allStatuses, value: 'all' },
                  { label: dictionary.list.status.draft, value: 'draft' },
                  { label: dictionary.list.status.running, value: 'running' },
                  { label: dictionary.list.status.online, value: 'online' },
                  { label: dictionary.list.status.error, value: 'error' },
                ]}
                style={{ width: 180 }}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </Space>
            {selectedRowKeys.length > 0 ? (
              <Space wrap>
                <Tag color="blue">
                  {dictionary.list.selected.replace('{count}', String(selectedRowKeys.length))}
                </Tag>
                <Tag>{dictionary.list.totalCalls.replace('{count}', String(totalCalls))}</Tag>
                <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete(selectedRowKeys)}>
                  {dictionary.list.actions.deleteSelected}
                </Button>
              </Space>
            ) : null}
          </Space>

          <Table<RuleRecord>
            rowKey="id"
            columns={columns}
            dataSource={filteredRules}
            loading={loading}
            pagination={pagination}
            onChange={(nextPagination) => setPagination(nextPagination)}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
          />
        </Space>
      </Card>

      <Modal
        destroyOnHidden
        open={modalOpen}
        confirmLoading={submitting}
        title={editingRule ? dictionary.list.modal.editTitle : dictionary.list.modal.createTitle}
        okText={editingRule ? dictionary.common.save : dictionary.common.create}
        cancelText={dictionary.common.cancel}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={dictionary.list.form.name}
            name="name"
            rules={[{ required: true, message: dictionary.list.validation.nameRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.list.form.description}
            name="description"
            rules={[{ required: true, message: dictionary.list.validation.descriptionRequired }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label={dictionary.list.form.calls} name="calls" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={dictionary.list.form.status} name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: dictionary.list.status.draft, value: 'draft' },
                { label: dictionary.list.status.running, value: 'running' },
                { label: dictionary.list.status.online, value: 'online' },
                { label: dictionary.list.status.error, value: 'error' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer width={480} open={Boolean(detailRule)} title={dictionary.list.drawerTitle} onClose={() => setDetailRule(null)}>
        {detailRule ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Text type="secondary">{dictionary.list.columns.name}</Typography.Text>
              <Typography.Title level={4}>{detailRule.name}</Typography.Title>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.list.columns.description}</Typography.Text>
              <Typography.Paragraph>{detailRule.description}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.list.columns.calls}</Typography.Text>
              <Typography.Paragraph>{detailRule.calls}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.list.columns.status}</Typography.Text>
              <div>
                <Tag color={statusColorMap[detailRule.status]}>{dictionary.list.status[detailRule.status]}</Tag>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.list.columns.updatedAt}</Typography.Text>
              <Typography.Paragraph>{detailRule.updatedAt}</Typography.Paragraph>
            </div>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}
