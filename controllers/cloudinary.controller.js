import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const getImages = async (req, res, next) => {
    try {
        const { max_results = 30, next_cursor } = req.query;

        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: 'elsarh', // Optional: filter by folder if used
            max_results: parseInt(max_results),
            next_cursor,
            resource_type: 'image'
        });

        res.status(200).json({
            success: true,
            images: result.resources,
            next_cursor: result.next_cursor
        });
    } catch (error) {
        next(error);
    }
};

export const deleteImage = async (req, res, next) => {
    try {
        const { public_id } = req.params;

        const result = await cloudinary.v2.uploader.destroy(public_id);

        if (result.result !== 'ok') {
            return res.status(400).json({ success: false, message: 'Failed to delete image', result });
        }

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const uploadImage = async (req, res, next) => {
    // This is optional if we want backend-side upload using stream,
    // but usually frontend direct upload is preferred.
    // For now, we rely on frontend direct upload or signed upload.
    res.status(501).json({ message: 'Not implemented' });
};
