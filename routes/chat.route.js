import express from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/chat.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

const router = express.Router();

router.post('/send', verifyToken, sendMessage);
router.get('/messages/:receiverId', verifyToken, getMessages);
router.get('/conversations', verifyToken, getConversations);

export default router;
