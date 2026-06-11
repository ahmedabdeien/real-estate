const router = require('express').Router();
const c = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/', c.getNotifications);
router.put('/mark-read', c.markRead);
router.delete('/:id', c.deleteNotification);

module.exports = router;
