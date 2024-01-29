
import { createListing } from '../controllers/listing.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';
import  express  from 'express';

const router = express.Router();

router.post('/create',verifyToken, createListing);

export default router;