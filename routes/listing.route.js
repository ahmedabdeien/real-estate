// routes/listing.route.js
import express from 'express';
import { createListing, deleteListing, getListing, updateListing, getPage } from '../controllers/listing.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

import { check } from "express-validator";

const router = express.Router();

router.post('/create', verifyToken, [
    check('name.en', 'English Name is required').not().isEmpty(),
    check('name.ar', 'Arabic Name is required').not().isEmpty(),
    check('description.en', 'English Description is required').not().isEmpty(),
    check('description.ar', 'Arabic Description is required').not().isEmpty(),
    check('address.en', 'English Address is required').not().isEmpty(),
    check('address.ar', 'Arabic Address is required').not().isEmpty(),
    check('propertyType', 'Property Type is required').not().isEmpty(),
    check('price', 'Price is required').not().isEmpty().isNumeric(),
], createListing);
router.get('/getListings', getListing);
router.delete('/delete/:listingId', verifyToken, deleteListing);
router.put('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getPage);

export default router;
