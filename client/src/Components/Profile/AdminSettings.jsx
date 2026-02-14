import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConfigStart, fetchConfigSuccess, fetchConfigFailure, updateConfigSuccess } from '../redux/config/configSlice';
import { Layout, Menu, Form, Input, Button, Card, Tabs, Table, Switch, message, Spin, ColorPicker, Typography, Space } from 'antd';
import {
    AppstoreOutlined,
    GlobalOutlined,
    BgColorsOutlined,
    PhoneOutlined,
    ShopOutlined,
    ShareAltOutlined,
    FileImageOutlined,
    TranslationOutlined,
    SaveOutlined
} from '@ant-design/icons';
import HeroSettings from './HeroSettings'; // Assuming these can be adapted or wrapped
import CTAManager from './CTAManager';
import MediaManager from './MediaManager';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function AdminSettings() {
    const { config, loading } = useSelector((state) => state.config);
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [activeKey, setActiveKey] = useState('general');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                dispatch(fetchConfigStart());
                const res = await fetch('/api/config');
                const data = await res.json();
                if (data.success === false) {
                    dispatch(fetchConfigFailure(data.message));
                    return;
                }
                dispatch(fetchConfigSuccess(data));

                // Prepare form data
                // Need to convert Maps/Objects for certain fields if necessary, 
                // but AntD Form handles nested paths well.
                form.setFieldsValue(data);
            } catch (error) {
                dispatch(fetchConfigFailure(error.message));
            }
        };
        fetchConfig();
    }, [dispatch, form]);

    const onFinish = async (values) => {
        try {
            message.loading({ content: 'Saving settings...', key: 'save' });
            // Merge with existing config to ensure we don't lose deeply nested keys not in form
            // ideally backend handles this via $set with dot notation or we send full object.
            // Since we setFieldsValue with full data, 'values' should contain what we touched + initial values if we used form.item names correctly.
            // However, nested tabs might mean some fields are not mounted/registered if `destroyInactiveTabPane` is true.
            // Current AntD Tabs keep content mounted by default.

            // Special handling for colors if using ColorPicker which returns object
            const processedValues = { ...config, ...values };
            if (typeof processedValues.primaryColor === 'object') processedValues.primaryColor = processedValues.primaryColor.toHexString();
            if (typeof processedValues.accentColor === 'object') processedValues.accentColor = processedValues.accentColor.toHexString();

            const res = await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedValues),
            });
            const data = await res.json();

            if (data.success === false) {
                message.error({ content: data.message || 'Error updating settings', key: 'save' });
                return;
            }

            dispatch(updateConfigSuccess(data));
            message.success({ content: 'Settings updated successfully!', key: 'save' });

            // Update CSS variables
            if (data.primaryColor) document.documentElement.style.setProperty('--primary', data.primaryColor);
            if (data.accentColor) document.documentElement.style.setProperty('--accent', data.accentColor);

        } catch (error) {
            message.error({ content: error.message, key: 'save' });
        }
    };

    if (currentUser?.role !== 'Admin') return <div className="p-20 text-center">Unauthorized Access</div>;

    const items = [
        { key: 'general', icon: <AppstoreOutlined />, label: 'General Branding' },
        { key: 'hero', icon: <FileImageOutlined />, label: 'Hero Section' },
        { key: 'colors', icon: <BgColorsOutlined />, label: 'Design & Colors' },
        { key: 'cta', icon: <GlobalOutlined />, label: 'Call to Actions' },
        { key: 'contact', icon: <PhoneOutlined />, label: 'Contact Details' },
        { key: 'branches', icon: <ShopOutlined />, label: 'Branches' },
        { key: 'social', icon: <ShareAltOutlined />, label: 'Social Media' },
        { key: 'media', icon: <FileImageOutlined />, label: 'Media Library' },
        { key: 'translations', icon: <TranslationOutlined />, label: 'Translations' },
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Sider theme="light" width={250} style={{ borderRight: '1px solid #e8e8e8' }}>
                <div className="p-4 border-b">
                    <Title level={4} style={{ margin: 0, color: '#005B94' }}>Admin Panel</Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Custom CMS Control</Text>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[activeKey]}
                    onClick={({ key }) => setActiveKey(key)}
                    items={items}
                    style={{ borderRight: 0 }}
                />
            </Sider>

            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px #f0f1f2' }}>
                    <Title level={3} style={{ margin: 0 }}>
                        {items.find(i => i.key === activeKey)?.label}
                    </Title>
                    <Button type="primary" icon={<SaveOutlined />} size="large" onClick={() => form.submit()}>
                        Save Changes
                    </Button>
                </Header>

                <Content style={{ margin: '24px', padding: 24, background: '#fff', minHeight: 280 }}>
                    {loading ? <div className="text-center p-10"><Spin size="large" /></div> : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={config}
                        >
                            <div style={{ display: activeKey === 'general' ? 'block' : 'none' }}>
                                <Card title="Site Identity" bordered={false}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Form.Item name="siteName" label="Site Name">
                                            <Input size="large" />
                                        </Form.Item>
                                        <Form.Item name="logo" label="Logo URL">
                                            <Input size="large" />
                                        </Form.Item>
                                        <Form.Item name="mapsApiKey" label="Google Maps API Key" className="md:col-span-2">
                                            <Input.Password size="large" />
                                        </Form.Item>
                                    </div>
                                </Card>
                            </div>

                            <div style={{ display: activeKey === 'colors' ? 'block' : 'none' }}>
                                <Card title="Theme Colors" bordered={false}>
                                    <div className="flex gap-12">
                                        <Form.Item name="primaryColor" label="Primary Color">
                                            <ColorPicker showText />
                                        </Form.Item>
                                        <Form.Item name="accentColor" label="Accent Color">
                                            <ColorPicker showText />
                                        </Form.Item>
                                    </div>
                                </Card>
                            </div>

                            <div style={{ display: activeKey === 'contact' ? 'block' : 'none' }}>
                                <Card title="Contact Information" bordered={false}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Form.Item name={['contact', 'hotline']} label="Hotline">
                                            <Input prefix={<PhoneOutlined />} />
                                        </Form.Item>
                                        <Form.Item name={['contact', 'phone']} label="Phone Number">
                                            <Input prefix={<PhoneOutlined />} />
                                        </Form.Item>
                                        <Form.Item name={['contact', 'email']} label="Email Address">
                                            <Input type="email" />
                                        </Form.Item>
                                    </div>
                                </Card>
                            </div>

                            <div style={{ display: activeKey === 'branches' ? 'block' : 'none' }}>
                                <Card title="Branches" bordered={false}>
                                    <Title level={5}>Maadi Branch</Title>
                                    <Form.Item name={['contact', 'maadiBranchAddress']} label="Address">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name={['contact', 'maadiBranchLink']} label="Support Map Link">
                                        <Input />
                                    </Form.Item>

                                    <Title level={5} style={{ marginTop: 20 }}>Beni Suef Branch</Title>
                                    <Form.Item name={['contact', 'beniSuefBranchAddress']} label="Address">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name={['contact', 'beniSuefBranchLink']} label="Support Map Link">
                                        <Input />
                                    </Form.Item>
                                </Card>
                            </div>

                            <div style={{ display: activeKey === 'social' ? 'block' : 'none' }}>
                                <Card title="Social Media Links" bordered={false}>
                                    <Form.Item name={['socialLinks', 'facebook']} label="Facebook">
                                        <Input addonBefore="facebook.com/" />
                                    </Form.Item>
                                    <Form.Item name={['socialLinks', 'instagram']} label="Instagram">
                                        <Input addonBefore="instagram.com/" />
                                    </Form.Item>
                                    <Form.Item name={['socialLinks', 'whatsapp']} label="WhatsApp Link">
                                        <Input />
                                    </Form.Item>
                                </Card>
                            </div>

                            {/* Components that manage their own state but propogate changes via Form API would be complex here without refactoring them. 
                                For now, we render them and they might need to update the Form state or handle their own persistence 
                            */}
                            {activeKey === 'hero' && <HeroSettings parentForm={form} />}
                            {activeKey === 'cta' && <CTAManager />}
                            {activeKey === 'media' && <MediaManager />}

                            {activeKey === 'translations' && (
                                <Card title="Translation Manager" bordered={false}>
                                    <Alert message="Translations are managed here. Add keys and values for EN and AR." type="info" showIcon className="mb-4" />
                                    {/* Translation Manager Logic using Table/Editable Cells would go here */}
                                    <Form.List name={['translations', 'en']}>
                                        {(fields, { add, remove }) => (
                                            <>
                                                <Typography.Title level={5}>English Translations</Typography.Title>
                                                {['welcome', 'contact_us', 'hero_title'].map(k => (
                                                    <Form.Item key={k} name={['translations', 'en', k]} label={k}>
                                                        <Input />
                                                    </Form.Item>
                                                ))}
                                                {/* Dynamic map iteration ideally */}
                                            </>
                                        )}
                                    </Form.List>
                                </Card>
                            )}

                        </Form>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}
