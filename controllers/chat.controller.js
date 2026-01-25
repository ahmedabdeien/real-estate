import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../Utils/error.js';

export const sendMessage = async (req, res, next) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user.id;

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            message
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

export const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get all unique users the current user has chatted with
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        const conversationPartners = new Set();
        messages.forEach(msg => {
            if (msg.sender.toString() !== userId) conversationPartners.add(msg.sender.toString());
            if (msg.receiver.toString() !== userId) conversationPartners.add(msg.receiver.toString());
        });

        const users = await User.find({ _id: { $in: Array.from(conversationPartners) } })
            .select('name username avatar isAdmin');

        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};
