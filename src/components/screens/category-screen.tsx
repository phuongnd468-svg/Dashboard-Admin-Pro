'use client';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  TagsOutlined,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { categoriesApi, type CategoryInput } from '@/lib/api/categories';
import { getApiErrorMessage } from '@/lib/api/client';
import { useApiMutation, useApiQuery } from '@/lib/api/hooks';
import type { CategoryRecord } from '@/lib/categories';
import type { Dictionary } from '@/lib/i18n';

type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  productCount: number;
  status: CategoryRecord['status'];
};

const statusColorMap: Record<CategoryRecord['status'], string> = {
  active: 'success',
  inactive: 'default',
};

export function CategoryScreen({ dictionary }: { dictionary: Dictionary }) {
  const [form] = Form.useForm<CategoryFormValues>();
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [detailCategory, setDetailCategory] = useState<CategoryRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadCategories = useCallback(() => categoriesApi.list(), []);
  const categoriesQuery = useApiQuery(loadCategories, [loadCategories]);
  const saveCategoryMutation = useApiMutation(
    ({ id, payload }: { id?: string; payload: CategoryInput }) =>
      id ? categoriesApi.update(id, payload) : categoriesApi.create(payload),
  );
  const deleteCategoryMutation = useApiMutation((id: string) => categoriesApi.remove(id));

  const categoriesData = categoriesQuery.data ?? [];
  const loading = categoriesQuery.loading;
  const submitting = saveCategoryMutation.loading;
  const totalProducts = useMemo(
    () =>
      categoriesData
        .filter((item) => selectedRowKeys.includes(item.id))
        .reduce((sum, item) => sum + item.productCount, 0),
    [categoriesData, selectedRowKeys],
  );

  useEffect(() => {
    if (categoriesQuery.error) {
      message.error(getApiErrorMessage(categoriesQuery.error, dictionary.category.loadingError));
    }
  }, [categoriesQuery.error, dictionary.category.loadingError, message]);

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({ productCount: 0, status: 'active' });
    setModalOpen(true);
  };

  const openEditModal = (category: CategoryRecord) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      productCount: category.productCount,
      status: category.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (ids: React.Key[]) => {
    if (!ids.length) {
      message.warning(dictionary.category.messages.selectAtLeastOne);
      return;
    }

    try {
      await Promise.all(ids.map((id) => deleteCategoryMutation.mutateAsync(String(id))));
      setSelectedRowKeys([]);
      setDetailCategory(null);
      message.success(dictionary.category.messages.deleteSuccess);
      await categoriesQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.category.loadingError));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await saveCategoryMutation.mutateAsync({
        id: editingCategory?.id,
        payload: values,
      });
      message.success(
        editingCategory ? dictionary.category.messages.updateSuccess : dictionary.category.messages.createSuccess,
      );
      setModalOpen(false);
      form.resetFields();
      await categoriesQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.category.loadingError));
    }
  };

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="app-panel" styles={{ body: { padding: 28 } }}>
        <Space direction="vertical" size={8}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {dictionary.category.title}
          </Typography.Title>
          <Typography.Text type="secondary">{dictionary.category.subtitle}</Typography.Text>
        </Space>
      </Card>

      <Card className="app-panel" styles={{ body: { padding: 24 } }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {dictionary.category.actions.create}
            </Button>
            {selectedRowKeys.length > 0 ? (
              <Space wrap>
                <Tag color="blue">
                  {dictionary.category.selected.replace('{count}', String(selectedRowKeys.length))}
                </Tag>
                <Tag>{dictionary.category.totalProducts.replace('{count}', String(totalProducts))}</Tag>
                <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete(selectedRowKeys)}>
                  {dictionary.category.actions.deleteSelected}
                </Button>
              </Space>
            ) : null}
          </Space>

          <Table<CategoryRecord>
            rowKey="id"
            loading={loading}
            dataSource={categoriesData}
            pagination={{ pageSize: 6 }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            columns={[
              {
                title: dictionary.category.columns.name,
                dataIndex: 'name',
                render: (_, record) => (
                  <Button type="link" icon={<TagsOutlined />} onClick={() => setDetailCategory(record)} style={{ paddingInline: 0 }}>
                    {record.name}
                  </Button>
                ),
              },
              {
                title: dictionary.category.columns.slug,
                dataIndex: 'slug',
                render: (slug: string) => <Typography.Text code>{slug}</Typography.Text>,
              },
              {
                title: dictionary.category.columns.description,
                dataIndex: 'description',
              },
              {
                title: dictionary.category.columns.products,
                dataIndex: 'productCount',
              },
              {
                title: dictionary.category.columns.status,
                dataIndex: 'status',
                render: (status: CategoryRecord['status']) => (
                  <Tag color={statusColorMap[status]}>{dictionary.category.status[status]}</Tag>
                ),
              },
              {
                title: dictionary.category.columns.updatedAt,
                dataIndex: 'updatedAt',
              },
              {
                title: dictionary.category.columns.actions,
                key: 'actions',
                render: (_, record) => (
                  <Space>
                    <Button icon={<EyeOutlined />} onClick={() => setDetailCategory(record)}>
                      {dictionary.category.actions.view}
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                      {dictionary.category.actions.edit}
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete([record.id])}>
                      {dictionary.category.actions.delete}
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Space>
      </Card>

      <Modal
        destroyOnHidden
        open={modalOpen}
        confirmLoading={submitting}
        title={editingCategory ? dictionary.category.modal.editTitle : dictionary.category.modal.createTitle}
        okText={editingCategory ? dictionary.common.save : dictionary.common.create}
        cancelText={dictionary.common.cancel}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={dictionary.category.form.name}
            name="name"
            rules={[{ required: true, message: dictionary.category.validation.nameRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.category.form.slug}
            name="slug"
            rules={[{ required: true, message: dictionary.category.validation.slugRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.category.form.description}
            name="description"
            rules={[{ required: true, message: dictionary.category.validation.descriptionRequired }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label={dictionary.category.form.products} name="productCount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={dictionary.category.form.status} name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: dictionary.category.status.active, value: 'active' },
                { label: dictionary.category.status.inactive, value: 'inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        width={480}
        open={Boolean(detailCategory)}
        title={dictionary.category.drawerTitle}
        onClose={() => setDetailCategory(null)}
      >
        {detailCategory ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Text type="secondary">{dictionary.category.columns.name}</Typography.Text>
              <Typography.Title level={4} style={{ marginTop: 4, marginBottom: 0 }}>
                {detailCategory.name}
              </Typography.Title>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.category.columns.slug}</Typography.Text>
              <div>
                <Typography.Text code>{detailCategory.slug}</Typography.Text>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.category.columns.description}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 4 }}>{detailCategory.description}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.category.columns.products}</Typography.Text>
              <Typography.Title level={5} style={{ marginTop: 4, marginBottom: 0 }}>
                {detailCategory.productCount}
              </Typography.Title>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.category.columns.status}</Typography.Text>
              <div style={{ marginTop: 6 }}>
                <Tag color={statusColorMap[detailCategory.status]}>
                  {dictionary.category.status[detailCategory.status]}
                </Tag>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.category.columns.updatedAt}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 4 }}>{detailCategory.updatedAt}</Typography.Paragraph>
            </div>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}
