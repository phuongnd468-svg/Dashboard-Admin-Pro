'use client';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Drawer,
  Form,
  Input,
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
import { permissionsApi, type PermissionInput } from '@/lib/api/permissions';
import type { Dictionary } from '@/lib/i18n';
import type { PermissionRecord } from '@/lib/permissions';

const statusColorMap: Record<PermissionRecord['status'], string> = {
  active: 'success',
  inactive: 'default',
};

type PermissionFormValues = PermissionInput;

export function PermissionManagementScreen({ dictionary }: { dictionary: Dictionary }) {
  const [form] = Form.useForm<PermissionFormValues>();
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingPermission, setEditingPermission] = useState<PermissionRecord | null>(null);
  const [detailPermission, setDetailPermission] = useState<PermissionRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 6,
    showSizeChanger: true,
  });

  const loadPermissions = useCallback(() => permissionsApi.list(), []);
  const permissionsQuery = useApiQuery(loadPermissions, [loadPermissions]);
  const savePermissionMutation = useApiMutation(
    ({ id, payload }: { id?: string; payload: PermissionInput }) =>
      id ? permissionsApi.update(id, payload) : permissionsApi.create(payload),
  );
  const deletePermissionMutation = useApiMutation((id: string) => permissionsApi.remove(id));
  const permissions = permissionsQuery.data ?? [];
  const loading = permissionsQuery.loading;
  const submitting = savePermissionMutation.loading;

  const filteredPermissions = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return permissions.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.module.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [permissions, searchValue, statusFilter]);

  useEffect(() => {
    setPagination((current) => ({ ...current, current: 1 }));
  }, [searchValue, statusFilter]);

  useEffect(() => {
    if (permissionsQuery.error) {
      message.error(getApiErrorMessage(permissionsQuery.error, dictionary.permissionManagement.loadingError));
    }
  }, [permissionsQuery.error, dictionary.permissionManagement.loadingError, message]);

  const openCreateModal = () => {
    setEditingPermission(null);
    form.resetFields();
    form.setFieldsValue({ action: 'read', scope: 'global', status: 'active' });
    setModalOpen(true);
  };

  const openEditModal = (permission: PermissionRecord) => {
    setEditingPermission(permission);
    form.setFieldsValue({
      name: permission.name,
      module: permission.module,
      action: permission.action,
      scope: permission.scope,
      description: permission.description,
      status: permission.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (ids: React.Key[]) => {
    if (!ids.length) {
      message.warning(dictionary.permissionManagement.messages.selectAtLeastOne);
      return;
    }

    try {
      await Promise.all(ids.map((id) => deletePermissionMutation.mutateAsync(String(id))));
      setSelectedRowKeys([]);
      setDetailPermission(null);
      message.success(dictionary.permissionManagement.messages.deleteSuccess);
      await permissionsQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.permissionManagement.loadingError));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await savePermissionMutation.mutateAsync({
        id: editingPermission?.id,
        payload: values,
      });
      message.success(
        editingPermission
          ? dictionary.permissionManagement.messages.updateSuccess
          : dictionary.permissionManagement.messages.createSuccess,
      );
      setModalOpen(false);
      form.resetFields();
      await permissionsQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.permissionManagement.loadingError));
    }
  };

  const columns: ColumnsType<PermissionRecord> = [
    {
      title: dictionary.permissionManagement.columns.name,
      dataIndex: 'name',
      render: (_, record) => (
        <Button type="link" icon={<SafetyCertificateOutlined />} style={{ paddingInline: 0 }} onClick={() => setDetailPermission(record)}>
          {record.name}
        </Button>
      ),
    },
    { title: dictionary.permissionManagement.columns.module, dataIndex: 'module' },
    { title: dictionary.permissionManagement.columns.action, dataIndex: 'action' },
    { title: dictionary.permissionManagement.columns.scope, dataIndex: 'scope' },
    {
      title: dictionary.permissionManagement.columns.status,
      dataIndex: 'status',
      render: (status: PermissionRecord['status']) => (
        <Tag color={statusColorMap[status]}>{dictionary.permissionManagement.status[status]}</Tag>
      ),
    },
    { title: dictionary.permissionManagement.columns.updatedAt, dataIndex: 'updatedAt' },
    {
      title: dictionary.permissionManagement.columns.actions,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setDetailPermission(record)}>
            {dictionary.permissionManagement.actions.view}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            {dictionary.permissionManagement.actions.edit}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete([record.id])}>
            {dictionary.permissionManagement.actions.delete}
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
            {dictionary.permissionManagement.title}
          </Typography.Title>
          <Typography.Text type="secondary">{dictionary.permissionManagement.subtitle}</Typography.Text>
        </Space>
      </Card>

      <Card className="app-panel" styles={{ body: { padding: 24 } }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
            <Space wrap>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {dictionary.permissionManagement.actions.create}
              </Button>
              <Input
                allowClear
                placeholder={dictionary.permissionManagement.searchPlaceholder}
                prefix={<SearchOutlined />}
                style={{ width: 320 }}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
              <Select
                options={[
                  { label: dictionary.permissionManagement.filters.allStatuses, value: 'all' },
                  { label: dictionary.permissionManagement.status.active, value: 'active' },
                  { label: dictionary.permissionManagement.status.inactive, value: 'inactive' },
                ]}
                style={{ width: 180 }}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </Space>
            {selectedRowKeys.length > 0 ? (
              <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete(selectedRowKeys)}>
                {dictionary.permissionManagement.actions.deleteSelected}
              </Button>
            ) : null}
          </Space>

          <Table<PermissionRecord>
            rowKey="id"
            columns={columns}
            dataSource={filteredPermissions}
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
        title={
          editingPermission
            ? dictionary.permissionManagement.modal.editTitle
            : dictionary.permissionManagement.modal.createTitle
        }
        okText={editingPermission ? dictionary.common.save : dictionary.common.create}
        cancelText={dictionary.common.cancel}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={dictionary.permissionManagement.form.name} name="name" rules={[{ required: true, message: dictionary.permissionManagement.validation.nameRequired }]}>
            <Input />
          </Form.Item>
          <Form.Item label={dictionary.permissionManagement.form.module} name="module" rules={[{ required: true, message: dictionary.permissionManagement.validation.moduleRequired }]}>
            <Input />
          </Form.Item>
          <Form.Item label={dictionary.permissionManagement.form.action} name="action" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Read', value: 'read' },
                { label: 'Write', value: 'write' },
                { label: 'Approve', value: 'approve' },
                { label: 'Publish', value: 'publish' },
                { label: 'Export', value: 'export' },
              ]}
            />
          </Form.Item>
          <Form.Item label={dictionary.permissionManagement.form.scope} name="scope" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Global', value: 'global' },
                { label: 'Regional', value: 'regional' },
                { label: 'Brand', value: 'brand' },
              ]}
            />
          </Form.Item>
          <Form.Item label={dictionary.permissionManagement.form.description} name="description" rules={[{ required: true, message: dictionary.permissionManagement.validation.descriptionRequired }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label={dictionary.permissionManagement.form.status} name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: dictionary.permissionManagement.status.active, value: 'active' },
                { label: dictionary.permissionManagement.status.inactive, value: 'inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={Boolean(detailPermission)}
        title={dictionary.permissionManagement.drawerTitle}
        width={460}
        onClose={() => setDetailPermission(null)}
      >
        {detailPermission ? (
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Typography.Title level={4} style={{ margin: 0 }}>{detailPermission.name}</Typography.Title>
            <Typography.Text>{detailPermission.description}</Typography.Text>
            <Typography.Text>
              {dictionary.permissionManagement.columns.module}: {detailPermission.module}
            </Typography.Text>
            <Typography.Text>
              {dictionary.permissionManagement.columns.action}: {detailPermission.action}
            </Typography.Text>
            <Typography.Text>
              {dictionary.permissionManagement.columns.scope}: {detailPermission.scope}
            </Typography.Text>
            <Tag color={statusColorMap[detailPermission.status]}>
              {dictionary.permissionManagement.status[detailPermission.status]}
            </Tag>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}
