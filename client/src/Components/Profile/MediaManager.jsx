import React, { useState, useEffect } from 'react';
import { Upload, Button, Image, Card, message, Spin, Empty, Modal } from 'antd';
import { UploadOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';

export default function MediaManager() {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);

    const fetchImages = async (cursor = null) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/media/images${cursor ? `?next_cursor=${cursor}` : ''}`);
            const data = await res.json();
            if (data.success) {
                if (cursor) {
                    setImages(prev => [...prev, ...data.images]);
                } else {
                    setImages(data.images);
                }
                setNextCursor(data.next_cursor);
            } else {
                message.error('Failed to fetch images');
            }
        } catch (err) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleUpload = async ({ file, onSuccess, onError }) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'elsarh_preset');

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/elsarh/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.secure_url) {
                setImages(prev => [{
                    secure_url: data.secure_url,
                    public_id: data.public_id,
                    format: data.format
                }, ...prev]);
                message.success('Image uploaded successfully');
                onSuccess(data);
            } else {
                throw new Error(data.error?.message || 'Upload failed');
            }
        } catch (error) {
            message.error(error.message);
            onError(error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (public_id) => {
        Modal.confirm({
            title: 'Delete Image?',
            content: 'Are you sure you want to delete this image? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    const res = await fetch(`/api/media/delete/${encodeURIComponent(public_id)}`, {
                        method: 'DELETE',
                    });
                    const data = await res.json();
                    if (data.success) {
                        setImages(prev => prev.filter(img => img.public_id !== public_id));
                        message.success('Image deleted');
                    } else {
                        message.error(data.message || 'Failed to delete');
                    }
                } catch (err) {
                    message.error(err.message);
                }
            }
        });
    };

    return (
        <Card title="Media Library (Cloudinary)" bordered={false} extra={
            <Button icon={<ReloadOutlined />} onClick={() => fetchImages()}>Refresh</Button>
        }>
            <div className="mb-6">
                <Upload
                    customRequest={handleUpload}
                    showUploadList={false}
                    accept="image/*"
                >
                    <Button icon={<UploadOutlined />} loading={uploading} type="primary" size="large">
                        Upload New Image
                    </Button>
                </Upload>
            </div>

            {loading && !images.length ? (
                <div className="text-center p-10"><Spin size="large" /></div>
            ) : (
                <>
                    {images.length === 0 ? <Empty description="No images found" /> : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {images.map((img) => (
                                <div key={img.public_id} className="relative group border border-slate-200 rounded overflow-hidden">
                                    <Image
                                        src={img.secure_url}
                                        alt={img.public_id}
                                        className="h-32 w-full object-cover"
                                        style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                                    />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            type="primary"
                                            danger
                                            shape="circle"
                                            icon={<DeleteOutlined />}
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(img.public_id); }}
                                        />
                                    </div>
                                    <div className="p-2 text-xs text-slate-500 truncate bg-slate-50">
                                        {img.public_id.split('/').pop()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {nextCursor && (
                        <div className="text-center mt-6">
                            <Button onClick={() => fetchImages(nextCursor)} loading={loading}>Load More</Button>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}
