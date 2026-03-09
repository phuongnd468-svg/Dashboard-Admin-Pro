'use client';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
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
import { ordersApi, type OrderInput } from '@/lib/api/orders';
import type { OrderRecord } from '@/lib/orders';
import type { Dictionary } from '@/lib/i18n';

type OrderFormValues = {
  orderNo: string;
  customer: string;
  product: string;
  amount: number;
  payment: OrderRecord['payment'];
  status: OrderRecord['status'];
  shippingAddress: string;
};

const statusColorMap: Record<OrderRecord['status'], string> = {
  pending: 'warning',
  processing: 'processing',
  shipped: 'blue',
  completed: 'success',
  cancelled: 'error',
};

const paymentColorMap: Record<OrderRecord['payment'], string> = {
  paid: 'success',
  unpaid: 'default',
  refunded: 'purple',
};

export function OrderScreen({ dictionary }: { dictionary: Dictionary }) {
  const [form] = Form.useForm<OrderFormValues>();
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [detailOrder, setDetailOrder] = useState<OrderRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 6,
    showSizeChanger: true,
  });
  const loadOrders = useCallback(() => ordersApi.list(), []);
  const ordersQuery = useApiQuery(loadOrders, [loadOrders]);
  const saveOrderMutation = useApiMutation(
    ({ id, payload }: { id?: string; payload: OrderInput }) =>
      id ? ordersApi.update(id, payload) : ordersApi.create(payload),
  );
  const deleteOrderMutation = useApiMutation((id: string) => ordersApi.remove(id));
  const orders = ordersQuery.data ?? [];
  const loading = ordersQuery.loading;
  const submitting = saveOrderMutation.loading;

  const filteredOrders = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return orders.filter((item) => {
      const matchesSearch =
        !query ||
        item.orderNo.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.product.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || item.payment === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchValue, statusFilter, paymentFilter]);

  const totalAmount = useMemo(
    () =>
      orders
        .filter((item) => selectedRowKeys.includes(item.id))
        .reduce((sum, item) => sum + item.amount, 0),
    [orders, selectedRowKeys],
  );

  useEffect(() => {
    setPagination((current) => ({
      ...current,
      current: 1,
    }));
  }, [searchValue, statusFilter, paymentFilter]);

  useEffect(() => {
    if (ordersQuery.error) {
      message.error(getApiErrorMessage(ordersQuery.error, dictionary.order.loadingError));
    }
  }, [ordersQuery.error, dictionary.order.loadingError, message]);

  const openCreateModal = () => {
    setEditingOrder(null);
    form.resetFields();
    form.setFieldsValue({ amount: 0, payment: 'unpaid', status: 'pending' });
    setModalOpen(true);
  };

  const openEditModal = (order: OrderRecord) => {
    setEditingOrder(order);
    form.setFieldsValue({
      orderNo: order.orderNo,
      customer: order.customer,
      product: order.product,
      amount: order.amount,
      payment: order.payment,
      status: order.status,
      shippingAddress: order.shippingAddress,
    });
    setModalOpen(true);
  };

  const handleDelete = async (ids: React.Key[]) => {
    if (!ids.length) {
      message.warning(dictionary.order.messages.selectAtLeastOne);
      return;
    }

    try {
      await Promise.all(ids.map((id) => deleteOrderMutation.mutateAsync(String(id))));
      setSelectedRowKeys([]);
      setDetailOrder(null);
      message.success(dictionary.order.messages.deleteSuccess);
      await ordersQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.order.loadingError));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await saveOrderMutation.mutateAsync({
        id: editingOrder?.id,
        payload: values,
      });
      message.success(editingOrder ? dictionary.order.messages.updateSuccess : dictionary.order.messages.createSuccess);
      setModalOpen(false);
      form.resetFields();
      await ordersQuery.refetch();
    } catch (error) {
      message.error(getApiErrorMessage(error, dictionary.order.loadingError));
    }
  };

  const columns: ColumnsType<OrderRecord> = [
    {
      title: dictionary.order.columns.orderNo,
      dataIndex: 'orderNo',
      render: (_, record) => (
        <Button
          type="link"
          icon={<ShoppingCartOutlined />}
          onClick={() => setDetailOrder(record)}
          style={{ paddingInline: 0 }}
        >
          {record.orderNo}
        </Button>
      ),
    },
    {
      title: dictionary.order.columns.customer,
      dataIndex: 'customer',
    },
    {
      title: dictionary.order.columns.product,
      dataIndex: 'product',
    },
    {
      title: dictionary.order.columns.amount,
      dataIndex: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: dictionary.order.columns.payment,
      dataIndex: 'payment',
      render: (payment: OrderRecord['payment']) => (
        <Tag color={paymentColorMap[payment]}>{dictionary.order.payment[payment]}</Tag>
      ),
    },
    {
      title: dictionary.order.columns.status,
      dataIndex: 'status',
      render: (status: OrderRecord['status']) => (
        <Tag color={statusColorMap[status]}>{dictionary.order.status[status]}</Tag>
      ),
    },
    {
      title: dictionary.order.columns.createdAt,
      dataIndex: 'createdAt',
    },
    {
      title: dictionary.order.columns.actions,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setDetailOrder(record)}>
            {dictionary.order.actions.view}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            {dictionary.order.actions.edit}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete([record.id])}>
            {dictionary.order.actions.delete}
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
            {dictionary.order.title}
          </Typography.Title>
          <Typography.Text type="secondary">{dictionary.order.subtitle}</Typography.Text>
        </Space>
      </Card>

      <Card className="app-panel" styles={{ body: { padding: 24 } }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
            <Space wrap>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {dictionary.order.actions.create}
              </Button>
              <Input
                allowClear
                placeholder={dictionary.order.searchPlaceholder}
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
              <Select
                options={[
                  { label: dictionary.order.filters.allStatuses, value: 'all' },
                  { label: dictionary.order.status.pending, value: 'pending' },
                  { label: dictionary.order.status.processing, value: 'processing' },
                  { label: dictionary.order.status.shipped, value: 'shipped' },
                  { label: dictionary.order.status.completed, value: 'completed' },
                  { label: dictionary.order.status.cancelled, value: 'cancelled' },
                ]}
                style={{ width: 180 }}
                value={statusFilter}
                onChange={setStatusFilter}
              />
              <Select
                options={[
                  { label: dictionary.order.filters.allPayments, value: 'all' },
                  { label: dictionary.order.payment.paid, value: 'paid' },
                  { label: dictionary.order.payment.unpaid, value: 'unpaid' },
                  { label: dictionary.order.payment.refunded, value: 'refunded' },
                ]}
                style={{ width: 180 }}
                value={paymentFilter}
                onChange={setPaymentFilter}
              />
            </Space>
            {selectedRowKeys.length > 0 ? (
              <Space wrap>
                <Tag color="blue">
                  {dictionary.order.selected.replace('{count}', String(selectedRowKeys.length))}
                </Tag>
                <Tag>{dictionary.order.totalAmount.replace('{count}', totalAmount.toFixed(2))}</Tag>
                <Button danger icon={<DeleteOutlined />} onClick={() => void handleDelete(selectedRowKeys)}>
                  {dictionary.order.actions.deleteSelected}
                </Button>
              </Space>
            ) : null}
          </Space>

          <Table<OrderRecord>
            rowKey="id"
            loading={loading}
            dataSource={filteredOrders}
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
        title={editingOrder ? dictionary.order.modal.editTitle : dictionary.order.modal.createTitle}
        okText={editingOrder ? dictionary.common.save : dictionary.common.create}
        cancelText={dictionary.common.cancel}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={dictionary.order.form.orderNo}
            name="orderNo"
            rules={[{ required: true, message: dictionary.order.validation.orderNoRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.order.form.customer}
            name="customer"
            rules={[{ required: true, message: dictionary.order.validation.customerRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.order.form.product}
            name="product"
            rules={[{ required: true, message: dictionary.order.validation.productRequired }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={dictionary.order.form.shippingAddress}
            name="shippingAddress"
            rules={[{ required: true, message: dictionary.order.validation.shippingAddressRequired }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label={dictionary.order.form.amount} name="amount" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={dictionary.order.form.payment} name="payment" rules={[{ required: true }]}>
            <Select
              options={[
                { label: dictionary.order.payment.paid, value: 'paid' },
                { label: dictionary.order.payment.unpaid, value: 'unpaid' },
                { label: dictionary.order.payment.refunded, value: 'refunded' },
              ]}
            />
          </Form.Item>
          <Form.Item label={dictionary.order.form.status} name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: dictionary.order.status.pending, value: 'pending' },
                { label: dictionary.order.status.processing, value: 'processing' },
                { label: dictionary.order.status.shipped, value: 'shipped' },
                { label: dictionary.order.status.completed, value: 'completed' },
                { label: dictionary.order.status.cancelled, value: 'cancelled' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        width={520}
        open={Boolean(detailOrder)}
        title={dictionary.order.drawerTitle}
        onClose={() => setDetailOrder(null)}
      >
        {detailOrder ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Text type="secondary">{dictionary.order.columns.orderNo}</Typography.Text>
              <Typography.Title level={4} style={{ marginTop: 4, marginBottom: 0 }}>
                {detailOrder.orderNo}
              </Typography.Title>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.order.columns.customer}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 4 }}>{detailOrder.customer}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.order.columns.product}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 4 }}>{detailOrder.product}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.order.form.shippingAddress}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 4 }}>{detailOrder.shippingAddress}</Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.order.columns.amount}</Typography.Text>
              <Typography.Title level={5} style={{ marginTop: 4, marginBottom: 0 }}>
                ${detailOrder.amount.toFixed(2)}
              </Typography.Title>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.order.columns.payment}</Typography.Text>
              <div style={{ marginTop: 6 }}>
                <Tag color={paymentColorMap[detailOrder.payment]}>
                  {dictionary.order.payment[detailOrder.payment]}
                </Tag>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.order.columns.status}</Typography.Text>
              <div style={{ marginTop: 6 }}>
                <Tag color={statusColorMap[detailOrder.status]}>
                  {dictionary.order.status[detailOrder.status]}
                </Tag>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">{dictionary.order.columns.createdAt}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 4 }}>{detailOrder.createdAt}</Typography.Paragraph>
            </div>
          </Space>
        ) : null}
      </Drawer>
    </Space>
  );
}
