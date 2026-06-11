const router = require('express').Router();
const { login, getMe, logout, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/change-password', protect, changePassword);

module.exports = router;
