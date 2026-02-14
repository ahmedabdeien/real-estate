import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Modal, message, Card } from 'antd';
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

const TranslationManager = ({ value = { en: {}, ar: {} }, onChange }) => {
    const [searchText, setSearchText] = useState('');
    const [dataSource, setDataSource] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newKey, setNewKey] = useState('');

    useEffect(() => {
        // Transform { en: { k: v }, ar: { k: v } } -> [{ key, en, ar }]
        const enKeys = Object.keys(value.en || {});
        const arKeys = Object.keys(value.ar || {});
        const allKeys = Array.from(new Set([...enKeys, ...arKeys]));

        const data = allKeys.map(key => ({
            key,
            en: value.en?.[key] || '',
            ar: value.ar?.[key] || ''
        }));
        setDataSource(data);
    }, [value]);

    const triggerChange = (newData) => {
        const en = {};
        const ar = {};
        newData.forEach(item => {
            en[item.key] = item.en;
            ar[item.key] = item.ar;
        });
        onChange?.({ en, ar });
    };

    const handleCellChange = (key, field, val) => {
        const newData = dataSource.map(item => {
            if (item.key === key) {
                return { ...item, [field]: val };
            }
            return item;
        });
        setDataSource(newData);
        triggerChange(newData);
    };

    const handleDelete = (key) => {
        const newData = dataSource.filter(item => item.key !== key);
        setDataSource(newData);
        triggerChange(newData);
    };

    const handleAdd = () => {
        if (!newKey) {
            message.error('Key cannot be empty');
            return;
        }
        if (dataSource.some(item => item.key === newKey)) {
            message.error('Key already exists');
            return;
        }
        const newData = [...dataSource, { key: newKey, en: '', ar: '' }];
        setDataSource(newData);
        triggerChange(newData);
        setNewKey('');
        setIsModalVisible(false);
    };

    const filteredData = dataSource.filter(item =>
        item.key.toLowerCase().includes(searchText.toLowerCase()) ||
        item.en.toLowerCase().includes(searchText.toLowerCase()) ||
        item.ar.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            width: '20%',
            render: (text) => <span className="font-mono text-xs text-slate-500">{text}</span>
        },
        {
            title: 'English',
            dataIndex: 'en',
            key: 'en',
            render: (text, record) => (
                <Input.TextArea
                    value={text}
                    onChange={e => handleCellChange(record.key, 'en', e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    bordered={false}
                    className="bg-transparent hover:bg-slate-50 focus:bg-white transition-colors"
                />
            )
        },
        {
            title: 'Arabic',
            dataIndex: 'ar',
            key: 'ar',
            render: (text, record) => (
                <Input.TextArea
                    value={text}
                    onChange={e => handleCellChange(record.key, 'ar', e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    dir="rtl"
                    bordered={false}
                    className="bg-transparent hover:bg-slate-50 focus:bg-white transition-colors"
                />
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: '10%',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.key)}
                />
            )
        }
    ];

    return (
        <Card
            title="Translation Manager"
            bordered={false}
            extra={
                <Space>
                    <Input
                        placeholder="Search keys..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                        Add Key
                    </Button>
                </Space>
            }
        >
            <Table
                dataSource={filteredData}
                columns={columns}
                pagination={{ pageSize: 10 }}
                rowKey="key"
                size="small"
                bordered
            />

            <Modal
                title="Add New Translation Key"
                open={isModalVisible}
                onOk={handleAdd}
                onCancel={() => setIsModalVisible(false)}
            >
                <Input
                    placeholder="e.g., home_page_title"
                    value={newKey}
                    onChange={e => setNewKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                />
                <p className="text-xs text-slate-400 mt-2">Use snake_case for keys (e.g. `button_label`).</p>
            </Modal>
        </Card>
    );
};

export default TranslationManager;
