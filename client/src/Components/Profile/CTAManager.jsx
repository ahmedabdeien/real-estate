import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCTAsStart, fetchCTAsSuccess, fetchCTAsFailure, createCTASuccess, updateCTASuccess, deleteCTASuccess } from '../redux/cta/ctaSlice';
import { Table, Button, Form, Input, Select, Switch, Space, Popconfirm, Card, Tag, ColorPicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';

export default function CTAManager() {
    const dispatch = useDispatch();
    const { ctas, loading } = useSelector((state) => state.cta);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        const fetchCTAs = async () => {
            dispatch(fetchCTAsStart());
            try {
                const res = await fetch('/api/cta');
                const data = await res.json();
                dispatch(fetchCTAsSuccess(data));
            } catch (error) {
                dispatch(fetchCTAsFailure(error.message));
            }
        };
        fetchCTAs();
    }, [dispatch]);

    // Update form when editingId changes
    useEffect(() => {
        if (editingId) {
            const cta = ctas.find(c => c._id === editingId);
            if (cta) form.setFieldsValue({
                ...cta,
                labelEn: cta.label.en,
                labelAr: cta.label.ar,
                // Ensure color is hex string if needed, ColorPicker handles string or object
            });
        } else {
            form.resetFields();
        }
    }, [editingId, ctas, form]);

    const onFinish = async (values) => {
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/cta/update/${editingId}` : '/api/cta/create';

            const payload = {
                ...values,
                label: { en: values.labelEn, ar: values.labelAr },
                color: typeof values.color === 'string' ? values.color : values.color?.toHexString(),
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (editingId) {
                dispatch(updateCTASuccess(data));
                message.success('CTA updated successfully');
                setEditingId(null);
            } else {
                dispatch(createCTASuccess(data));
                message.success('CTA created successfully');
            }
            form.resetFields();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/cta/delete/${id}`, { method: 'DELETE' });
            dispatch(deleteCTASuccess(id));
            message.success('CTA deleted');
        } catch (error) {
            message.error(error.message);
        }
    };

    const columns = [
        {
            title: 'Label (EN/AR)',
            key: 'label',
            render: (_, record) => (
                <div>
                    <div className="font-bold">{record.label.en}</div>
                    <div className="text-gray-400 text-xs">{record.label.ar}</div>
                </div>
            )
        },
        {
            title: 'Type & Link',
            key: 'type',
            render: (_, record) => (
                <div>
                    <Tag color={record.color}>{record.type}</Tag>
                    <div className="text-xs mt-1 text-slate-500">{record.link}</div>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => setEditingId(record._id)} />
                    <Popconfirm title="Delete this CTA?" onConfirm={() => handleDelete(record._id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title={editingId ? "Edit CTA" : "Create New CTA"}>
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 'primary', active: true, color: '#005B94' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item name="labelEn" label="Label (English)" rules={[{ required: true }]}>
                            <Input placeholder="e.g. Call Now" />
                        </Form.Item>
                        <Form.Item name="labelAr" label="Label (Arabic)" rules={[{ required: true }]}>
                            <Input placeholder="مثال: اتصل الآن" dir="rtl" />
                        </Form.Item>
                        <Form.Item name="link" label="Link / URL" rules={[{ required: true }]}>
                            <Input placeholder="https://..." />
                        </Form.Item>
                        <Form.Item name="type" label="Button Type">
                            <Select>
                                <Select.Option value="primary">Primary</Select.Option>
                                <Select.Option value="secondary">Secondary</Select.Option>
                                <Select.Option value="whatsapp">WhatsApp</Select.Option>
                                <Select.Option value="call">Call Action</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="color" label="Button Color">
                            <ColorPicker showText />
                        </Form.Item>
                        <Form.Item name="active" label="Status" valuePropName="checked">
                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                    </div>
                    <div className="flex justify-end gap-2">
                        {editingId && <Button onClick={() => { setEditingId(null); form.resetFields(); }}>Cancel</Button>}
                        <Button type="primary" htmlType="submit" icon={editingId ? <SaveOutlined /> : <PlusOutlined />}>
                            {editingId ? 'Update CTA' : 'Add CTA'}
                        </Button>
                    </div>
                </Form>
            </Card>

            <Table
                dataSource={ctas}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 5 }}
            />
        </Space>
    );
}
