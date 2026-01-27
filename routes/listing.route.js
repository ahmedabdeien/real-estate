// routes/listing.route.js
import express from 'express';
import { createListing, deleteListing, getListing, updateListing, getPage } from '../controllers/listing.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createListing);
router.get('/getListings', getListing);
router.delete('/delete/:listingId', verifyToken, deleteListing);
router.put('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getPage);

export default router;
