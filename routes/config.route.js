import express from 'express';
import { getConfig, updateConfig } from '../controllers/config.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

const router = express.Router();

router.get('/', getConfig);
router.put('/', verifyToken, updateConfig);

export default router;
