import React from 'react';
import { Form, Input, Card, Row, Col } from 'antd';

export default function HeroSettings({ parentForm }) {
    return (
        <Card title="Hero Section Configuration" bordered={false}>
            <Row gutter={24}>
                <Col span={24} md={12}>
                    <Form.Item
                        name={['hero', 'title', 'en']}
                        label="Headline (English)"
                        rules={[{ required: true, message: 'Please enter English headline' }]}
                    >
                        <Input size="large" placeholder="Enter headline in English" />
                    </Form.Item>
                </Col>
                <Col span={24} md={12}>
                    <Form.Item
                        name={['hero', 'title', 'ar']}
                        label="Headline (Arabic)"
                        rules={[{ required: true, message: 'Please enter Arabic headline' }]}
                    >
                        <Input size="large" placeholder="Enter headline in Arabic" style={{ direction: 'rtl' }} />
                    </Form.Item>
                </Col>

                <Col span={24} md={12}>
                    <Form.Item
                        name={['hero', 'subtitle', 'en']}
                        label="Subtitle (English)"
                    >
                        <Input.TextArea rows={4} placeholder="Enter subtitle in English" />
                    </Form.Item>
                </Col>
                <Col span={24} md={12}>
                    <Form.Item
                        name={['hero', 'subtitle', 'ar']}
                        label="Subtitle (Arabic)"
                    >
                        <Input.TextArea rows={4} placeholder="Enter subtitle in Arabic" style={{ direction: 'rtl' }} />
                    </Form.Item>
                </Col>
            </Row>
        </Card>
    );
}
