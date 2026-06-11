const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { sendSuccess } = require('../utils/response');

exports.getConversations = async (req, res) => {
  const userId = req.user._id;
  const companyId = req.tenantId || req.user.companyId;

  const messages = await ChatMessage.aggregate([
    {
      $match: {
        companyId,
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$isRead', false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const populated = await User.populate(messages, { path: '_id', select: 'name isOnline lastSeen' });
  sendSuccess(res, populated);
};

exports.getMessages = async (req, res) => {
  const userId = req.user._id;
  const { partnerId } = req.params;
  const companyId = req.tenantId || req.user.companyId;

  const messages = await ChatMessage.find({
    companyId,
    $or: [
      { senderId: userId, receiverId: partnerId },
      { senderId: partnerId, receiverId: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name');

  await ChatMessage.updateMany(
    { senderId: partnerId, receiverId: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  sendSuccess(res, messages);
};

exports.getCompanyUsers = async (req, res) => {
  const companyId = req.tenantId || req.user.companyId;
  const users = await User.find({
    companyId,
    _id: { $ne: req.user._id },
    isActive: true,
  }).select('name isOnline lastSeen');
  sendSuccess(res, users);
};
