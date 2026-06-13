const router = require('express').Router();
const axios  = require('axios');
const { protect } = require('../middlewares/auth');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const proxy = (path) => async (req, res) => {
  try {
    const { data } = await axios.post(`${AI_URL}${path}`, req.body, { timeout: 30000 });
    res.json({ success: true, ...data });
  } catch (e) {
    const msg = e.response?.data?.detail || e.message;
    res.status(500).json({ success: false, message: msg });
  }
};

router.use(protect);

router.post('/describe',          proxy('/ai/describe'));
router.post('/analyze-contract',  proxy('/ai/analyze-contract'));
router.post('/chat',              proxy('/ai/chat'));
router.post('/price',             proxy('/ai/price'));

module.exports = router;
