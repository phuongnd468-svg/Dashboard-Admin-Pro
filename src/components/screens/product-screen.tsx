'use client';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingOutlined,
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
import { productsApi, type ProductInput } from '@/lib/api/products';
import type { ProductRecord } from '@/lib/products';
import type { Dictionary } from '@/lib/i18n';

type ProductFormValues = {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  status: ProductRecord['status'];
};

const statusColorMap: Record<ProductRecord['status'], string> = {
  active: 'success',
  draft: 'processing',
  outOfStock: 'error',
};

export function ProductScreen({ dictionary }: { dictionary: Dictionary }) {
  const [form] = Form.useForm<ProductFormValues>();
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 6,
    showSizeChanger: true,
  });

  const loadProducts = useCallback(() => productsApi.list(), []);
  const productsQuery = useApiQuery(loadProducts, [loadProducts]);
  const saveProductMutation = useApiMutation(
    ({ id, payload }: { id?: string; payload: ProductInput }) =>
      id ? productsApi.update(id, payload) : productsApi.create(payload),
  );
  const deleteProductMutation = useApiMutation((id: string) => productsApi.remove(id));
  const productsData = productsQuery.data ?? [];
  const loading = productsQuery.loading;
  const submitting = saveProductMutation.loading;

  const categoryOptions = useMemo(
    () => Array.from(new Set(productsData.map((item) => item.category))).sort(),
    [productsData],
  );

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return productsData.filter((item) => {
      const matchesSearch =
        !query || item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [productsData, searchValue, categoryFilter, statusFilter]);

  const totalStock = useMemo(
    () =>
      productsData
        .filter((item) => selectedRowKeys.includes(item.id))
        .reduce((sum, item) => sum + item.stock, 0),
    [productsData, selectedRowKeys],
  );

  useEffect(() => {
    setPagination((current) => ({
      ...current,
      current: 1,
    }));
  }, [searchValue, categoryFilter, statusFilter]);

  useEffect(() => {
    if (productsQuery.error) {
      message.error(getApiErrorMessage(productsQuery.error, dictionary.product.loadingError));
    }
  }, [productsQuery.error, dictionary.product.loadingError, message]);

  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({ price: 0, stock: 0, status: 'draft' });
    setModalOpen(true);
  };

  const openEditModal = (product: ProductRecord) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (ids: React.Key[]) => {
    if (!ids.length) {
      message.warning(dictionary.product.messages.selectAtLeastOne);
      return;
    }

    try {
      await Promise.all(ids.map((id) => deleteProductMutation.mutateAsync(String(id))));
      setSelectedRowKeys([]);
      setDetailProduct(null);
      message.success(dictionary.product.messages.deleteSuccess);
      await productsQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.product.loadingError));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await saveProductMutation.mutateAsync({
        id: editingProduct?.id,
        payload: values,
      });
      message.success(
        editingProduct ? dictionary.product.messages.updateSuccess : dictionary.product.messages.createSuccess,
      );
      setModalOpen(false);
      form.resetFields();
      await productsQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.product.loadingError));
    }
  };

  const columns: ColumnsType<ProductRecord> = [
    {
      title: dictionary.product.columns.name,
      dataIndex: 'name',
      render: (_, record) => (
        <Button
          type="link"
          icon={<ShoppingOutlined />}
          onClick={() => setDetailProduct(record)}
          style={{ paddingInline: 0 }}
        >
          {record.name}
        </Button>
      ),
    },
    {
      title: dictionary.product.columns.sku,
      dataIndex: 'sku',
      render: (sku: string) => <Typography.Text code>{sku}</Typography.Text>,
    },
    {
      title: dictionary.product.columns.category,
      dataIndex: 'category',
    },
    {
      title: dictionary.product.columns.price,
      dataIndex: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: dictionary.product.columns.stock,
      dataIndex: 'stock',
    },
    {
      title: dictionary.product.columns.status,
      dataIndex: 'status',
      render: (status: ProductRecord['status']) => (
        <Tag color={statusColorMap[status]}>{dictionary.product.status[status]}</Tag>
      ),
    },
    {
      title: dictionary.product.columns.updatedAt,
      dataIndex: 'updatedAt',
    },
    {
      title: dictionary.product.columns.actions,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setDetailProduct(record)}>
            {dictionary.product.actions.view}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            {dictionary.product.actions.edit}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete([record.id])}>
            {dictionary.product.actions.delete}
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
            {dictionary.product.title}
          </Typography.Title>
          <Typography.Text type="secondary">{dictionary.product.subtitle}</Typography.Text>
        </Space>
      </Card>

      <Card className="app-panel" styles={{ body: { padding: 24 } }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
            <Space wrap>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {dictionary.product.actions.create}
              </Button>
              <Input
                allowClear
                placeholder={dictionary.product.searchPlaceholder}
                prefix={<SearchOutlined />}
                style={{ width: 260 }}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
              <Select
                options={[
                  { label: dictionary.product.filters.allCategories, value: 'all' },
                  ...categoryOptions.map((category) => ({ label: category, value: category })),
                ]}
                style={{ width: 180 }}
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
              <Select
                options={[
                  { label: dictionary.product.filters.allStatuses, value: 'all' },
                  { label: dictionary.product.status.active, value: 'active' },
                  { label: dictionary.product.status.draft, value: 'draft' },
                  { label: dictionary.product.status.outOfStock, value: 'outOfStock' },
                ]}
                style={{ width: 180 }}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </Space>
            {selectedRowKeys.length > 0 ? (
              <Space wrap>
                <Tag color="blue">
                  {dictionary.product.selected.replace('{count}', String(selectedRowKeys.length))}
                </Tag>
                <Tag>{dictionary.product.totalStock.replace('{count}', String(totalStock))}</Tag>
                <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete(selectedRowKeys)}>
                  {dictionary.product.actions.deleteSelected}
                </Button>
              </Space>
            ) : null}
          </Space>

          <Table<ProductRecord>
            rowKey="id"
            loading={loading}
            dataSource={filteredProducts}
            columns={columns}
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
        title={editingProduct ? dictionary.product.modal.editTitle : dictionary.product.modal.createTitle}
        okText={editingProduct ? dictionary.common.save : dictionary.common.create}
        cancelText={dictionary.common.cancel}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={dictionary.product.form.name}
            name="name"
            rules={[{ required: true, message: dictionary.product.validation.nameRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.product.form.sku}
            name="sku"
            rules={[{ required: true, message: dictionary.product.validation.skuRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.product.form.category}
            name="category"
            rules={[{ required: true, message: dictionary.product.validation.categoryRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.product.form.description}
            name="description"
            rules={[{ required: true, message: dictionary.product.validation.descriptionRequired }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label={dictionary.product.form.price} name="price" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={dictionary.product.form.stock} name="stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={dictionary.product.form.status} name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: dictionary.product.status.active, value: 'active' },
                { label: dictionary.product.status.draft, value: 'draft' },
                { label: dictionary.product.status.outOfStock, value: 'outOfStock' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        width={520}
        open={Boolean(detailProduct)}
        title={dictionary.product.drawerTitle}
        onClose={() => setDetailProduct(null)}
      >
        {detailProduct ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Text type="secondary">{dictionary.product.columns.name}</Typography.Text>
              <Typography.Title level={4} style={{ marginTop: 4, marginBottom: 0 }}>
                {detailProduct.name}
              </Typography.Title>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.product.columns.sku}</Typography.Text>
              <div>
                <Typography.Text code>{detailProduct.sku}</Typography.Text>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.product.columns.category}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 4 }}>{detailProduct.category}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.product.form.description}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 4 }}>{detailProduct.description}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.product.columns.price}</Typography.Text>
              <Typography.Title level={5} style={{ marginTop: 4, marginBottom: 0 }}>
                ${detailProduct.price.toFixed(2)}
              </Typography.Title>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.product.columns.stock}</Typography.Text>
              <Typography.Title level={5} style={{ marginTop: 4, marginBottom: 0 }}>
                {detailProduct.stock}
              </Typography.Title>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.product.columns.status}</Typography.Text>
              <div style={{ marginTop: 6 }}>
                <Tag color={statusColorMap[detailProduct.status]}>
                  {dictionary.product.status[detailProduct.status]}
                </Tag>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.product.columns.updatedAt}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 4 }}>{detailProduct.updatedAt}</Typography.Paragraph>
            </div>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}
