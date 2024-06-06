// routes/listing.route.js
import express from 'express';
import { createListing, deletePage, getListing } from '../controllers/listing.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createListing);
router.get('/getPages', verifyToken, getListing);
router.delete('/deletePage/:pageId/:userId', verifyToken, deletePage);

export default router;
