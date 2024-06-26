// routes/listing.route.js
import express from 'express';
import { createListing, deletePage, getListing, updatePage ,getPage} from '../controllers/listing.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createListing);
router.get('/getPages', getListing);
router.delete('/deletePage/:pageId/:userId', verifyToken, deletePage);
router.post('/updatePage/:id', verifyToken, updatePage);
router.get('/get/:id',verifyToken, getPage);

export default router;
