const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { getConversations, getMessages, getCompanyUsers } = require('../controllers/chatController');

router.use(protect, tenantScope);
router.get('/conversations', getConversations);
router.get('/users', getCompanyUsers);
router.get('/:partnerId', getMessages);

module.exports = router;
