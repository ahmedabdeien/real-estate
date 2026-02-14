import express from 'express';
import { verifyToken } from '../Utils/verifyUser.js';
import { createCTA, deleteCTA, getCTAs, updateCTA } from '../controllers/cta.controller.js';

const router = express.Router();

router.post('/create', verifyToken, createCTA);
router.get('/', getCTAs);
router.put('/update/:id', verifyToken, updateCTA);
router.delete('/delete/:id', verifyToken, deleteCTA);

export default router;
