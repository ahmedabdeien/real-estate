import express from 'express';
import { createListing } from '../controllers/listing.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

const router = express.Router();

// Route to create a new listing, protected by verifyToken middleware
router.post('/create', verifyToken, createListing);

export default router;
