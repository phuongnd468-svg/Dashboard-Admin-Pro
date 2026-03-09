'use client';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined,
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
import { permissionsApi } from '@/lib/api/permissions';
import { usersApi, type UserInput } from '@/lib/api/users';
import type { Dictionary } from '@/lib/i18n';
import type { PermissionRecord } from '@/lib/permissions';
import type { UserRecord } from '@/lib/users';

type UserFormValues = UserInput;

const statusColorMap: Record<UserRecord['status'], string> = {
  active: 'success',
  inactive: 'default',
  suspended: 'error',
};

const permissionScopeColorMap: Record<PermissionRecord['scope'], string> = {
  global: 'blue',
  regional: 'cyan',
  brand: 'purple',
};

function PermissionPill({
  permission,
  compact,
}: {
  permission: PermissionRecord;
  compact?: boolean;
}) {
  return (
    <div className={`user-permission-pill${compact ? ' is-compact' : ''}`}>
      <div className="user-permission-pill__header">
        <span className="user-permission-pill__name">{permission.name}</span>
        <Tag bordered={false} color={permissionScopeColorMap[permission.scope]}>
          {permission.scope}
        </Tag>
      </div>
      {!compact ? <div className="user-permission-pill__description">{permission.description}</div> : null}
    </div>
  );
}

export function UserManagementScreen({ dictionary }: { dictionary: Dictionary }) {
  const [form] = Form.useForm<UserFormValues>();
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [detailUser, setDetailUser] = useState<UserRecord | null>(null);
  const [permissionUser, setPermissionUser] = useState<UserRecord | null>(null);
  const [permissionIdsDraft, setPermissionIdsDraft] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 6,
    showSizeChanger: true,
  });

  const loadUsers = useCallback(() => usersApi.list(), []);
  const loadPermissions = useCallback(() => permissionsApi.list(), []);
  const usersQuery = useApiQuery(loadUsers, [loadUsers]);
  const permissionsQuery = useApiQuery(loadPermissions, [loadPermissions]);
  const saveUserMutation = useApiMutation(({ id, payload }: { id?: string; payload: UserInput }) =>
    id ? usersApi.update(id, payload) : usersApi.create(payload),
  );
  const deleteUserMutation = useApiMutation((id: string) => usersApi.remove(id));

  const users = usersQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const loading = usersQuery.loading || permissionsQuery.loading;
  const submitting = saveUserMutation.loading;

  const permissionsById = useMemo(
    () => new Map(permissions.map((permission) => [permission.id, permission])),
    [permissions],
  );

  const permissionOptions = useMemo(
    () =>
      Array.from(
        permissions.reduce((groups, permission) => {
          const current = groups.get(permission.module) ?? [];
          current.push({
            label: `${permission.name} · ${permission.action}`,
            value: permission.id,
          });
          groups.set(permission.module, current);
          return groups;
        }, new Map<string, Array<{ label: string; value: string }>>()),
      ).map(([label, options]) => ({
        label,
        options,
      })),
    [permissions],
  );

  const filteredUsers = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return users.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchValue, statusFilter]);

  useEffect(() => {
    setPagination((current) => ({ ...current, current: 1 }));
  }, [searchValue, statusFilter]);

  useEffect(() => {
    if (usersQuery.error) {
      message.error(getApiErrorMessage(usersQuery.error, dictionary.userManagement.loadingError));
    }
    if (permissionsQuery.error) {
      message.error(getApiErrorMessage(permissionsQuery.error, dictionary.permissionManagement.loadingError));
    }
  }, [
    dictionary.permissionManagement.loadingError,
    dictionary.userManagement.loadingError,
    message,
    permissionsQuery.error,
    usersQuery.error,
  ]);

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active', permissionIds: [] });
    setModalOpen(true);
  };

  const openEditModal = (user: UserRecord) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      permissionIds: user.permissionIds,
    });
    setModalOpen(true);
  };

  const openPermissionDrawer = (user: UserRecord) => {
    setPermissionUser(user);
    setPermissionIdsDraft(user.permissionIds);
  };

  const handleDelete = async (ids: React.Key[]) => {
    if (!ids.length) {
      message.warning(dictionary.userManagement.messages.selectAtLeastOne);
      return;
    }

    try {
      await Promise.all(ids.map((id) => deleteUserMutation.mutateAsync(String(id))));
      setSelectedRowKeys([]);
      setDetailUser(null);
      message.success(dictionary.userManagement.messages.deleteSuccess);
      await usersQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.userManagement.loadingError));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await saveUserMutation.mutateAsync({
        id: editingUser?.id,
        payload: values,
      });
      message.success(
        editingUser
          ? dictionary.userManagement.messages.updateSuccess
          : dictionary.userManagement.messages.createSuccess,
      );
      setModalOpen(false);
      form.resetFields();
      await usersQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.userManagement.loadingError));
    }
  };

  const handlePermissionSave = async () => {
    if (!permissionUser) {
      return;
    }

    try {
      if (!permissionIdsDraft.length) {
        message.warning(dictionary.userManagement.validation.permissionsRequired);
        return;
      }

      await saveUserMutation.mutateAsync({
        id: permissionUser.id,
        payload: {
          name: permissionUser.name,
          email: permissionUser.email,
          role: permissionUser.role,
          status: permissionUser.status,
          phone: permissionUser.phone,
          permissionIds: permissionIdsDraft,
        },
      });
      message.success(dictionary.userManagement.messages.permissionsUpdated);
      setPermissionUser(null);
      await usersQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.userManagement.loadingError));
    }
  };

  const columns: ColumnsType<UserRecord> = [
    {
      title: dictionary.userManagement.columns.name,
      dataIndex: 'name',
      render: (_, record) => (
        <Button icon={<TeamOutlined />} style={{ paddingInline: 0 }} type="link" onClick={() => setDetailUser(record)}>
          {record.name}
        </Button>
      ),
    },
    {
      title: dictionary.userManagement.columns.email,
      dataIndex: 'email',
    },
    {
      title: dictionary.userManagement.columns.role,
      dataIndex: 'role',
    },
    {
      title: dictionary.userManagement.columns.permissions,
      dataIndex: 'permissionIds',
      render: (permissionIds: string[]) => {
        const visiblePermissions = permissionIds
          .map((permissionId) => permissionsById.get(permissionId))
          .filter((permission): permission is PermissionRecord => Boolean(permission))
          .slice(0, 2);

        return (
          <Space size={[6, 6]} wrap>
            {visiblePermissions.map((permission) => (
              <Tag key={permission.id} color="blue">
                {permission.name}
              </Tag>
            ))}
            {permissionIds.length > 2 ? <Tag>+{permissionIds.length - 2}</Tag> : null}
          </Space>
        );
      },
    },
    {
      title: dictionary.userManagement.columns.phone,
      dataIndex: 'phone',
    },
    {
      title: dictionary.userManagement.columns.status,
      dataIndex: 'status',
      render: (status: UserRecord['status']) => (
        <Tag color={statusColorMap[status]}>{dictionary.userManagement.status[status]}</Tag>
      ),
    },
    {
      title: dictionary.userManagement.columns.lastLogin,
      dataIndex: 'lastLogin',
    },
    {
      title: dictionary.userManagement.columns.actions,
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button icon={<EyeOutlined />} onClick={() => setDetailUser(record)}>
            {dictionary.userManagement.actions.view}
          </Button>
          <Button icon={<SafetyCertificateOutlined />} onClick={() => openPermissionDrawer(record)}>
            {dictionary.userManagement.actions.assignPermissions}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            {dictionary.userManagement.actions.edit}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete([record.id])}>
            {dictionary.userManagement.actions.delete}
          </Button>
        </Space>
      ),
    },
  ];

  const currentAssignedPermissions = permissionUser
    ? permissionIdsDraft
        .map((permissionId) => permissionsById.get(permissionId))
        .filter((permission): permission is PermissionRecord => Boolean(permission))
    : [];

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="app-panel" styles={{ body: { padding: 28 } }}>
        <Space direction="vertical" size={8}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {dictionary.userManagement.title}
          </Typography.Title>
          <Typography.Text type="secondary">{dictionary.userManagement.subtitle}</Typography.Text>
        </Space>
      </Card>

      <Card className="app-panel" styles={{ body: { padding: 24 } }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
            <Space wrap>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {dictionary.userManagement.actions.create}
              </Button>
              <Input
                allowClear
                placeholder={dictionary.userManagement.searchPlaceholder}
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
              <Select
                options={[
                  { label: dictionary.userManagement.filters.allStatuses, value: 'all' },
                  { label: dictionary.userManagement.status.active, value: 'active' },
                  { label: dictionary.userManagement.status.inactive, value: 'inactive' },
                  { label: dictionary.userManagement.status.suspended, value: 'suspended' },
                ]}
                style={{ width: 180 }}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </Space>
            {selectedRowKeys.length > 0 ? (
              <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete(selectedRowKeys)}>
                {dictionary.userManagement.actions.deleteSelected}
              </Button>
            ) : null}
          </Space>

          <Table<UserRecord>
            rowKey="id"
            columns={columns}
            dataSource={filteredUsers}
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
        title={editingUser ? dictionary.userManagement.modal.editTitle : dictionary.userManagement.modal.createTitle}
        okText={editingUser ? dictionary.common.save : dictionary.common.create}
        cancelText={dictionary.common.cancel}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={dictionary.userManagement.form.name}
            name="name"
            rules={[{ required: true, message: dictionary.userManagement.validation.nameRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.userManagement.form.email}
            name="email"
            rules={[{ required: true, message: dictionary.userManagement.validation.emailRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.userManagement.form.role}
            name="role"
            rules={[{ required: true, message: dictionary.userManagement.validation.roleRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.userManagement.form.phone}
            name="phone"
            rules={[{ required: true, message: dictionary.userManagement.validation.phoneRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label={dictionary.userManagement.form.status} name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: dictionary.userManagement.status.active, value: 'active' },
                { label: dictionary.userManagement.status.inactive, value: 'inactive' },
                { label: dictionary.userManagement.status.suspended, value: 'suspended' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={dictionary.userManagement.form.permissions}
            name="permissionIds"
            rules={[{ required: true, type: 'array', min: 1, message: dictionary.userManagement.validation.permissionsRequired }]}
          >
            <Select
              mode="multiple"
              optionFilterProp="label"
              options={permissionOptions}
              placeholder={dictionary.userManagement.permissionDrawer.available}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={Boolean(detailUser)}
        title={dictionary.userManagement.drawerTitle}
        width={460}
        onClose={() => setDetailUser(null)}
      >
        {detailUser ? (
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {detailUser.name}
            </Typography.Title>
            <Typography.Text>{detailUser.email}</Typography.Text>
            <Typography.Text>{detailUser.role}</Typography.Text>
            <Typography.Text>{detailUser.phone}</Typography.Text>
            <Tag color={statusColorMap[detailUser.status]}>{dictionary.userManagement.status[detailUser.status]}</Tag>
            <Typography.Text type="secondary">
              {dictionary.userManagement.columns.lastLogin}: {detailUser.lastLogin}
            </Typography.Text>
            <div className="user-permission-section">
              <div className="user-permission-section__title">{dictionary.userManagement.columns.permissions}</div>
              <div className="user-permission-section__list">
                {detailUser.permissionIds.length ? (
                  detailUser.permissionIds
                    .map((permissionId) => permissionsById.get(permissionId))
                    .filter((permission): permission is PermissionRecord => Boolean(permission))
                    .map((permission) => <PermissionPill key={permission.id} permission={permission} compact />)
                ) : (
                  <Typography.Text type="secondary">{dictionary.userManagement.permissionDrawer.empty}</Typography.Text>
                )}
              </div>
            </div>
          </Space>
        ) : null}
      </Drawer>

      <Drawer
        className="user-permission-drawer"
        extra={
          <Button loading={submitting} type="primary" onClick={() => void handlePermissionSave()}>
            {dictionary.userManagement.permissionDrawer.save}
          </Button>
        }
        open={Boolean(permissionUser)}
        title={dictionary.userManagement.permissionDrawer.title}
        width={640}
        onClose={() => setPermissionUser(null)}
      >
        {permissionUser ? (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <div className="user-permission-drawer__hero">
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {permissionUser.name}
                </Typography.Title>
                <Typography.Text type="secondary">{permissionUser.email}</Typography.Text>
              </div>
              <Tag color="blue">
                {dictionary.userManagement.permissionDrawer.selectedCount.replace(
                  '{count}',
                  String(permissionIdsDraft.length),
                )}
              </Tag>
            </div>

            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
              {dictionary.userManagement.permissionDrawer.subtitle}
            </Typography.Paragraph>

            <Card className="app-panel" size="small">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div className="user-permission-section__title">{dictionary.userManagement.permissionDrawer.available}</div>
                <Select
                  mode="multiple"
                  optionFilterProp="label"
                  options={permissionOptions}
                  placeholder={dictionary.userManagement.permissionDrawer.available}
                  style={{ width: '100%' }}
                  value={permissionIdsDraft}
                  onChange={setPermissionIdsDraft}
                />
              </Space>
            </Card>

            <div className="user-permission-grid">
              <div className="user-permission-grid__column">
                <div className="user-permission-section__title">{dictionary.userManagement.permissionDrawer.current}</div>
                <div className="user-permission-grid__list">
                  {currentAssignedPermissions.length ? (
                    currentAssignedPermissions.map((permission) => (
                      <PermissionPill key={permission.id} permission={permission} />
                    ))
                  ) : (
                    <Typography.Text type="secondary">{dictionary.userManagement.permissionDrawer.empty}</Typography.Text>
                  )}
                </div>
              </div>
              <div className="user-permission-grid__column">
                <div className="user-permission-section__title">{dictionary.permissionManagement.title}</div>
                <div className="user-permission-grid__catalog">
                  {permissions.map((permission) => (
                    <button
                      key={permission.id}
                      className={`user-permission-catalog-item${permissionIdsDraft.includes(permission.id) ? ' is-active' : ''}`}
                      type="button"
                      onClick={() =>
                        setPermissionIdsDraft((current) =>
                          current.includes(permission.id)
                            ? current.filter((item) => item !== permission.id)
                            : [...current, permission.id],
                        )
                      }
                    >
                      <div className="user-permission-catalog-item__title">
                        <span>{permission.name}</span>
                        <Tag bordered={false} color={permissionScopeColorMap[permission.scope]}>
                          {permission.scope}
                        </Tag>
                      </div>
                      <div className="user-permission-catalog-item__meta">
                        {permission.module} · {permission.action}
                      </div>
                      <div className="user-permission-catalog-item__description">{permission.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}
