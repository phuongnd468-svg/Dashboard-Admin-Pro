'use client';

import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import type { Dictionary } from '@/lib/i18n';

type FormTabKey = 'customer' | 'business' | 'delivery' | 'verification';

type CustomerValues = {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  contactMethod: string;
  customerType: string;
  notes?: string;
};

type BusinessValues = {
  companyName: string;
  taxCode: string;
  industry: string;
  scale: string;
  representative: string;
  representativePhone: string;
  headOfficeProvince: string;
  headOfficeAddress: string;
  documents?: UploadFile[];
};

type DeliveryValues = {
  recipient: string;
  recipientPhone: string;
  warehouseProvince: string;
  warehouseDistrict: string;
  warehouseAddress: string;
  billingEmail: string;
  paymentMethod: string;
  deliveryWindow: string;
  services?: string[];
};

type VerificationValues = {
  manager: string;
  priority: string;
  launchDate: dayjs.Dayjs;
  checklist: string[];
  internalNotes?: string;
  terms: boolean;
};

const HASH_TO_TAB: Record<string, FormTabKey> = {
  '': 'customer',
  '#customer': 'customer',
  '#business': 'business',
  '#delivery': 'delivery',
  '#verification': 'verification',
};

const TAB_TO_HASH: Record<FormTabKey, string> = {
  customer: '#customer',
  business: '#business',
  delivery: '#delivery',
  verification: '#verification',
};

const vietnamLocations = [
  { province: 'Ho Chi Minh City', districts: ['District 1', 'District 3', 'Binh Thanh', 'Thu Duc City'] },
  { province: 'Ha Noi', districts: ['Ba Dinh', 'Cau Giay', 'Dong Da', 'Nam Tu Liem'] },
  { province: 'Da Nang', districts: ['Hai Chau', 'Thanh Khe', 'Son Tra', 'Ngu Hanh Son'] },
  { province: 'Can Tho', districts: ['Ninh Kieu', 'Binh Thuy', 'Cai Rang', 'O Mon'] },
  { province: 'Hai Phong', districts: ['Hong Bang', 'Le Chan', 'Ngo Quyen', 'Hai An'] },
  { province: 'Binh Duong', districts: ['Thu Dau Mot', 'Di An', 'Thuan An', 'Ben Cat'] },
  { province: 'Dong Nai', districts: ['Bien Hoa', 'Long Khanh', 'Trang Bom', 'Nhon Trach'] },
];

function getHashTab() {
  if (typeof window === 'undefined') {
    return 'customer';
  }

  return HASH_TO_TAB[window.location.hash] ?? 'customer';
}

function updateHash(tab: FormTabKey) {
  if (typeof window === 'undefined') {
    return;
  }

  const hash = TAB_TO_HASH[tab];
  window.history.replaceState(null, '', hash === '#customer' ? window.location.pathname : `${window.location.pathname}${hash}`);
}

export function FormScreen({ dictionary }: { dictionary: Dictionary }) {
  const { message } = App.useApp();
  const [customerForm] = Form.useForm<CustomerValues>();
  const [businessForm] = Form.useForm<BusinessValues>();
  const [deliveryForm] = Form.useForm<DeliveryValues>();
  const [verificationForm] = Form.useForm<VerificationValues>();
  const [activeTab, setActiveTab] = useState<FormTabKey>('customer');
  const [customerProvince, setCustomerProvince] = useState('Ho Chi Minh City');
  const [deliveryProvince, setDeliveryProvince] = useState('Ho Chi Minh City');
  const [businessProvince, setBusinessProvince] = useState('Ha Noi');

  useEffect(() => {
    const syncTab = () => setActiveTab(getHashTab());
    syncTab();
    window.addEventListener('hashchange', syncTab);

    return () => window.removeEventListener('hashchange', syncTab);
  }, []);

  const provinceOptions = vietnamLocations.map((item) => ({
    label: item.province,
    value: item.province,
  }));

  const customerDistrictOptions = useMemo(
    () => vietnamLocations.find((item) => item.province === customerProvince)?.districts.map((district) => ({ label: district, value: district })) ?? [],
    [customerProvince],
  );
  const deliveryDistrictOptions = useMemo(
    () => vietnamLocations.find((item) => item.province === deliveryProvince)?.districts.map((district) => ({ label: district, value: district })) ?? [],
    [deliveryProvince],
  );

  const phoneRule = {
    pattern: /^(0|\+84)(3|5|7|8|9)\d{8}$/,
    message: dictionary.formPage.validation.phone,
  };

  const emailRule = {
    type: 'email' as const,
    message: dictionary.formPage.validation.email,
  };

  const previewTags = [
    dictionary.formPage.helper.summaryItems.phone,
    dictionary.formPage.helper.summaryItems.location,
    dictionary.formPage.helper.summaryItems.business,
    dictionary.formPage.helper.summaryItems.logistics,
  ];

  const saveDraft = async (form: typeof customerForm | typeof businessForm | typeof deliveryForm | typeof verificationForm) => {
    await form.validateFields();
    message.success(dictionary.formPage.messages.draftSaved);
  };

  const submitForm = async (form: typeof customerForm | typeof businessForm | typeof deliveryForm | typeof verificationForm) => {
    await form.validateFields();
    message.success(dictionary.formPage.messages.submitted);
  };

  const tabItems = [
    {
      key: 'customer',
      label: dictionary.formPage.tabs.customer,
      children: (
        <Row gutter={[24, 24]}>
          <Col lg={16} xs={24}>
            <Card className="form-page__panel">
              <div className="form-page__section-head">
                <div>
                  <Typography.Title level={3}>{dictionary.formPage.customer.title}</Typography.Title>
                  <Typography.Text type="secondary">{dictionary.formPage.customer.description}</Typography.Text>
                </div>
              </div>
              <Form
                form={customerForm}
                layout="vertical"
                initialValues={{
                  contactMethod: dictionary.formPage.options.contactZalo,
                  customerType: dictionary.formPage.options.typeBusiness,
                  district: 'District 1',
                  province: customerProvince,
                }}
              >
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.customer.fields.fullName} name="fullName" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Input placeholder="Nguyen Van An" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.customer.fields.email} name="email" rules={[{ required: true, message: dictionary.formPage.validation.required }, emailRule]}>
                      <Input placeholder="contact@company.vn" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.customer.fields.phone} name="phone" rules={[{ required: true, message: dictionary.formPage.validation.required }, phoneRule]}>
                      <Input placeholder="0901234567" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.customer.fields.customerType} name="customerType" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Radio.Group optionType="button" buttonStyle="solid">
                        <Radio.Button value={dictionary.formPage.options.typeIndividual}>{dictionary.formPage.options.typeIndividual}</Radio.Button>
                        <Radio.Button value={dictionary.formPage.options.typeBusiness}>{dictionary.formPage.options.typeBusiness}</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.customer.fields.province} name="province" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select
                        options={provinceOptions}
                        onChange={(value) => {
                          setCustomerProvince(value);
                          customerForm.setFieldValue('district', undefined);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.customer.fields.district} name="district" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select options={customerDistrictOptions} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label={dictionary.formPage.customer.fields.address} name="address" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Input placeholder="102 Nguyen Hue, Ben Nghe Ward" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.customer.fields.contactMethod} name="contactMethod" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select
                        options={[
                          { label: dictionary.formPage.options.contactEmail, value: dictionary.formPage.options.contactEmail },
                          { label: dictionary.formPage.options.contactPhone, value: dictionary.formPage.options.contactPhone },
                          { label: dictionary.formPage.options.contactZalo, value: dictionary.formPage.options.contactZalo },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label={dictionary.formPage.customer.fields.notes} name="notes">
                      <Input.TextArea placeholder="Preferred follow-up timing, contract notes, or onboarding constraints." rows={5} />
                    </Form.Item>
                  </Col>
                </Row>
                <Space>
                  <Button onClick={() => void saveDraft(customerForm)}>{dictionary.formPage.actions.saveDraft}</Button>
                  <Button type="primary" onClick={() => void submitForm(customerForm)}>
                    {dictionary.formPage.actions.submit}
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>
          <Col lg={8} xs={24}>
            <Card className="form-page__panel form-page__panel--helper">
              <Typography.Title level={4}>{dictionary.formPage.helper.previewTitle}</Typography.Title>
              <Typography.Paragraph type="secondary">{dictionary.formPage.helper.previewDescription}</Typography.Paragraph>
              <Divider />
              <Typography.Text strong>{dictionary.formPage.helper.summaryTitle}</Typography.Text>
              <div className="form-page__tag-list">
                {previewTags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'business',
      label: dictionary.formPage.tabs.business,
      children: (
        <Row gutter={[24, 24]}>
          <Col lg={16} xs={24}>
            <Card className="form-page__panel">
              <div className="form-page__section-head">
                <div>
                  <Typography.Title level={3}>{dictionary.formPage.business.title}</Typography.Title>
                  <Typography.Text type="secondary">{dictionary.formPage.business.description}</Typography.Text>
                </div>
              </div>
              <Form
                form={businessForm}
                layout="vertical"
                initialValues={{ industry: dictionary.formPage.options.industryTechnology, scale: dictionary.formPage.options.scaleMedium, headOfficeProvince: businessProvince }}
              >
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.business.fields.companyName} name="companyName" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Input placeholder="Cong ty Co phan Doi Moi So" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.business.fields.taxCode} name="taxCode" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Input placeholder="0312345678" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.business.fields.industry} name="industry" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select
                        options={[
                          { label: dictionary.formPage.options.industryRetail, value: dictionary.formPage.options.industryRetail },
                          { label: dictionary.formPage.options.industryTechnology, value: dictionary.formPage.options.industryTechnology },
                          { label: dictionary.formPage.options.industryLogistics, value: dictionary.formPage.options.industryLogistics },
                          { label: dictionary.formPage.options.industryManufacturing, value: dictionary.formPage.options.industryManufacturing },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.business.fields.scale} name="scale" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select
                        options={[
                          { label: dictionary.formPage.options.scaleSmall, value: dictionary.formPage.options.scaleSmall },
                          { label: dictionary.formPage.options.scaleMedium, value: dictionary.formPage.options.scaleMedium },
                          { label: dictionary.formPage.options.scaleLarge, value: dictionary.formPage.options.scaleLarge },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.business.fields.representative} name="representative" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Input placeholder="Tran Minh Phuong" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.business.fields.representativePhone} name="representativePhone" rules={[{ required: true, message: dictionary.formPage.validation.required }, phoneRule]}>
                      <Input placeholder="0912345678" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.business.fields.headOfficeProvince} name="headOfficeProvince" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select options={provinceOptions} onChange={(value) => setBusinessProvince(value)} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label={dictionary.formPage.business.fields.headOfficeAddress} name="headOfficeAddress" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Input placeholder="Floor 12, 81-83-83B-85 Ham Nghi, District 1" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      label={dictionary.formPage.business.fields.documents}
                      name="documents"
                      valuePropName="fileList"
                      getValueFromEvent={(event) => event?.fileList ?? []}
                    >
                      <Upload.Dragger beforeUpload={() => false} multiple>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">{dictionary.formPage.business.fields.documents}</p>
                        <p className="ant-upload-hint">PDF, tax registration, and company profile documents.</p>
                      </Upload.Dragger>
                    </Form.Item>
                  </Col>
                </Row>
                <Space>
                  <Button onClick={() => void saveDraft(businessForm)}>{dictionary.formPage.actions.saveDraft}</Button>
                  <Button type="primary" onClick={() => void submitForm(businessForm)}>
                    {dictionary.formPage.actions.submit}
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>
          <Col lg={8} xs={24}>
            <Card className="form-page__panel form-page__panel--helper">
              <Typography.Title level={4}>{businessProvince}</Typography.Title>
              <Typography.Paragraph type="secondary">
                Common legal setup template for Vietnamese head office registration, invoice handling, and assigned representative information.
              </Typography.Paragraph>
              <Upload beforeUpload={() => false} showUploadList={false}>
                <Button icon={<UploadOutlined />}>{dictionary.formPage.business.fields.documents}</Button>
              </Upload>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'delivery',
      label: dictionary.formPage.tabs.delivery,
      children: (
        <Row gutter={[24, 24]}>
          <Col lg={16} xs={24}>
            <Card className="form-page__panel">
              <div className="form-page__section-head">
                <div>
                  <Typography.Title level={3}>{dictionary.formPage.delivery.title}</Typography.Title>
                  <Typography.Text type="secondary">{dictionary.formPage.delivery.description}</Typography.Text>
                </div>
              </div>
              <Form
                form={deliveryForm}
                layout="vertical"
                initialValues={{
                  warehouseProvince: deliveryProvince,
                  warehouseDistrict: 'District 1',
                  paymentMethod: dictionary.formPage.options.paymentBank,
                  deliveryWindow: dictionary.formPage.options.windowMorning,
                  services: [dictionary.formPage.options.serviceInvoice],
                }}
              >
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.delivery.fields.recipient} name="recipient" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Input placeholder="Le Thi Quynh Nhu" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.delivery.fields.recipientPhone} name="recipientPhone" rules={[{ required: true, message: dictionary.formPage.validation.required }, phoneRule]}>
                      <Input placeholder="0987654321" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.delivery.fields.warehouseProvince} name="warehouseProvince" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select
                        options={provinceOptions}
                        onChange={(value) => {
                          setDeliveryProvince(value);
                          deliveryForm.setFieldValue('warehouseDistrict', undefined);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.delivery.fields.warehouseDistrict} name="warehouseDistrict" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select options={deliveryDistrictOptions} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label={dictionary.formPage.delivery.fields.warehouseAddress} name="warehouseAddress" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Input placeholder="Lot B2, Hiep Phuoc Industrial Zone" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.delivery.fields.billingEmail} name="billingEmail" rules={[{ required: true, message: dictionary.formPage.validation.required }, emailRule]}>
                      <Input placeholder="billing@company.vn" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.delivery.fields.paymentMethod} name="paymentMethod" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select
                        options={[
                          { label: dictionary.formPage.options.paymentBank, value: dictionary.formPage.options.paymentBank },
                          { label: dictionary.formPage.options.paymentCod, value: dictionary.formPage.options.paymentCod },
                          { label: dictionary.formPage.options.paymentCard, value: dictionary.formPage.options.paymentCard },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.delivery.fields.deliveryWindow} name="deliveryWindow" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select
                        options={[
                          { label: dictionary.formPage.options.windowMorning, value: dictionary.formPage.options.windowMorning },
                          { label: dictionary.formPage.options.windowAfternoon, value: dictionary.formPage.options.windowAfternoon },
                          { label: dictionary.formPage.options.windowEvening, value: dictionary.formPage.options.windowEvening },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label={dictionary.formPage.delivery.fields.services} name="services">
                      <Checkbox.Group
                        options={[
                          { label: dictionary.formPage.options.serviceInstall, value: dictionary.formPage.options.serviceInstall },
                          { label: dictionary.formPage.options.serviceExpress, value: dictionary.formPage.options.serviceExpress },
                          { label: dictionary.formPage.options.serviceInvoice, value: dictionary.formPage.options.serviceInvoice },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Space>
                  <Button onClick={() => void saveDraft(deliveryForm)}>{dictionary.formPage.actions.saveDraft}</Button>
                  <Button type="primary" onClick={() => void submitForm(deliveryForm)}>
                    {dictionary.formPage.actions.submit}
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>
          <Col lg={8} xs={24}>
            <Card className="form-page__panel form-page__panel--helper">
              <Typography.Title level={4}>{dictionary.formPage.delivery.fields.deliveryWindow}</Typography.Title>
              <div className="form-page__tag-list">
                <Tag color="blue">{dictionary.formPage.options.windowMorning}</Tag>
                <Tag color="cyan">{dictionary.formPage.options.windowAfternoon}</Tag>
                <Tag color="purple">{dictionary.formPage.options.windowEvening}</Tag>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'verification',
      label: dictionary.formPage.tabs.verification,
      children: (
        <Row gutter={[24, 24]}>
          <Col lg={16} xs={24}>
            <Card className="form-page__panel">
              <div className="form-page__section-head">
                <div>
                  <Typography.Title level={3}>{dictionary.formPage.verification.title}</Typography.Title>
                  <Typography.Text type="secondary">{dictionary.formPage.verification.description}</Typography.Text>
                </div>
              </div>
              <Form
                form={verificationForm}
                layout="vertical"
                initialValues={{
                  priority: dictionary.formPage.options.priorityStandard,
                  launchDate: dayjs().add(7, 'day'),
                  checklist: [dictionary.formPage.options.checklistIdentity, dictionary.formPage.options.checklistAddress],
                  terms: true,
                }}
              >
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.verification.fields.manager} name="manager" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Input placeholder="Nguyen Dong Phuong" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.verification.fields.priority} name="priority" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Select
                        options={[
                          { label: dictionary.formPage.options.priorityStandard, value: dictionary.formPage.options.priorityStandard },
                          { label: dictionary.formPage.options.priorityHigh, value: dictionary.formPage.options.priorityHigh },
                          { label: dictionary.formPage.options.priorityUrgent, value: dictionary.formPage.options.priorityUrgent },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item label={dictionary.formPage.verification.fields.launchDate} name="launchDate" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label={dictionary.formPage.verification.fields.checklist} name="checklist" rules={[{ required: true, message: dictionary.formPage.validation.required }]}>
                      <Checkbox.Group
                        options={[
                          { label: dictionary.formPage.options.checklistIdentity, value: dictionary.formPage.options.checklistIdentity },
                          { label: dictionary.formPage.options.checklistAddress, value: dictionary.formPage.options.checklistAddress },
                          { label: dictionary.formPage.options.checklistTax, value: dictionary.formPage.options.checklistTax },
                          { label: dictionary.formPage.options.checklistContract, value: dictionary.formPage.options.checklistContract },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label={dictionary.formPage.verification.fields.internalNotes} name="internalNotes">
                      <Input.TextArea rows={5} placeholder="Approval dependencies, SLA notes, and launch blockers." />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="terms" valuePropName="checked" rules={[{ validator: async (_, value) => (value ? Promise.resolve() : Promise.reject(new Error(dictionary.formPage.validation.required))) }]}>
                      <Checkbox>{dictionary.formPage.options.termsAccepted}</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
                <Space>
                  <Button onClick={() => void saveDraft(verificationForm)}>{dictionary.formPage.actions.saveDraft}</Button>
                  <Button type="primary" onClick={() => void submitForm(verificationForm)}>
                    {dictionary.formPage.actions.submit}
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>
          <Col lg={8} xs={24}>
            <Card className="form-page__panel form-page__panel--helper">
              <Typography.Title level={4}>{dictionary.formPage.verification.fields.checklist}</Typography.Title>
              <Typography.Paragraph type="secondary">
                Final review should confirm legal identity, address validity, tax readiness, and commercial approval before launch.
              </Typography.Paragraph>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Card className="app-panel form-page__hero">
        <div className="form-page__hero-content">
          <div>
            <Typography.Title level={1}>{dictionary.formPage.title}</Typography.Title>
            <Typography.Paragraph>{dictionary.formPage.subtitle}</Typography.Paragraph>
          </div>
          <div className="form-page__hero-stats">
            {previewTags.map((tag) => (
              <div key={tag} className="form-page__metric">
                <strong>{tag}</strong>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Tabs
        activeKey={activeTab}
        className="form-page__tabs"
        items={tabItems}
        onChange={(key) => {
          const nextTab = key as FormTabKey;
          setActiveTab(nextTab);
          updateHash(nextTab);
        }}
      />
    </Space>
  );
}
