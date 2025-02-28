const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authenticateJWT = require('../middleware/authMiddleware');

router.use(authenticateJWT);

// ✅ ให้ `/settings` แสดงหน้า `settings.ejs`
router.get('/', settingsController.getSettings);

// ✅ อัปเดตการตั้งค่าการแจ้งเตือน
router.put('/update-notifications', settingsController.updateNotifications);

// ✅ อัปเดตธีมของผู้ใช้
router.put('/update-theme', settingsController.updateTheme);

// ✅ ลบบัญชีผู้ใช้
router.delete('/delete-account', settingsController.deleteAccount);

module.exports = router;
