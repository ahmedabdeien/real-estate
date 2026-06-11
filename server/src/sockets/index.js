const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');

const setupSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    socket.join(userId);
    socket.broadcast.emit('user:online', { userId });

    socket.on('chat:send', async ({ receiverId, message }) => {
      try {
        const msg = await ChatMessage.create({
          companyId: socket.user.companyId,
          senderId: socket.user._id,
          receiverId,
          message,
        });
        const populated = await ChatMessage.findById(msg._id).populate('senderId', 'name avatar');
        io.to(receiverId).emit('chat:receive', populated);
        socket.emit('chat:sent', populated);
      } catch (e) {}
    });

    socket.on('chat:read', async ({ senderId }) => {
      await ChatMessage.updateMany(
        { senderId, receiverId: socket.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      io.to(senderId).emit('chat:read', { by: userId });
    });

    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      socket.broadcast.emit('user:offline', { userId });
    });
  });
};

const sendNotification = async (io, userId, notification) => {
  try {
    const saved = await Notification.create({ userId, ...notification });
    io.to(userId.toString()).emit('notification:new', saved);
  } catch (_) {}
};

module.exports = { setupSockets, sendNotification };
