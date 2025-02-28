const express = require('express');
const authController = require('../controllers/authController'); // ✅ Import controller ที่ถูกต้อง

const router = express.Router();

// ✅ **ลงทะเบียน และยืนยันอีเมล**
router.post('/register', authController.register);
router.get('/confirm', authController.confirmEmail);
router.get('/register', (req, res) => {
    res.render("register", { message: null });
});
router.get("/verify", (req, res) => {
    res.render("verify", { email: req.query.email || "" });
});

// ✅ **เข้าสู่ระบบ และออกจากระบบ**
router.post('/login', authController.login);
router.get("/login", (req, res) => {
    res.render("login", { message: null });
});
router.get('/logout', authController.logout);

// ✅ **หน้า Dashboard (ต้องล็อกอินก่อน)**
router.get('/dashboard', authController.protect, (req, res) => {
    // ตรวจสอบว่า req.user มีข้อมูลหรือไม่
    console.log("User in Dashboard:", req.user); // Debug log

    // ตรวจสอบว่า req.user มีค่าหรือไม่ ก่อนที่จะใช้ข้อมูลในการ render
    if (!req.user) {
        return res.status(500).json({ message: 'User data not found' });
    }

    res.render("dashboard", { user: req.user });
});

module.exports = router;
