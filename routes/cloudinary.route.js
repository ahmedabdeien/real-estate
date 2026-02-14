import express from 'express';
import { getImages, deleteImage } from '../controllers/cloudinary.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Only admin should access media library
router.get('/images', verifyToken, getImages);
router.delete('/delete/:public_id', verifyToken, deleteImage);

export default router;
