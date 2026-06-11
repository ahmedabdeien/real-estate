const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const ctrl = require('../controllers/mediaController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  },
});

router.use(protect);
router.use(tenantScope);

router.get('/',              ctrl.getMedia);
router.post('/upload',       upload.single('file'), ctrl.uploadMedia);
router.put('/:id',           ctrl.updateMedia);
router.delete('/:id',        ctrl.deleteMedia);

module.exports = router;
