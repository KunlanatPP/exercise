const express = require('express');
const profileController = require('../controllers/profileController');
const authenticateJWT = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateJWT); // ✅ ตรวจสอบว่าเข้าสู่ระบบแล้ว

// ✅ แสดงหน้า Profile
router.get('/', profileController.getProfile);

// ✅ แสดงหน้า Profile Settings (แทนที่การใช้ profilesettingRoutes.js)
router.get('/settings', profileController.getProfileSettings);

// ✅ อัปเดตชื่อผู้ใช้
router.put('/update-username', profileController.updateUsername);

// ✅ เปลี่ยนรหัสผ่าน
router.put('/update-password', profileController.changePassword);

// ✅ ตั้งเป้าหมายออกกำลังกาย
router.put('/update-goal', profileController.updateGoal);

module.exports = router;
