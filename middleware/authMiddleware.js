const jwt = require('jsonwebtoken');
const User = require('../models/user'); // ดึงโมเดลผู้ใช้จากฐานข้อมูล
const jwtSecret = process.env.JWT_SECRET || 'your_secret_key';

const authenticateJWT = async (req, res, next) => {
    // ดึง token จาก cookie หรือ Authorization header
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        console.log('No token found. Redirecting to login...');
        return res.redirect('/login'); // หากไม่มี token ให้เปลี่ยนเส้นทางไปหน้า login
    }

    try {
        // ตรวจสอบและถอดรหัส token
        const decoded = jwt.verify(token, jwtSecret);
        console.log('Token decoded successfully:', decoded);

        // ค้นหาผู้ใช้จากฐานข้อมูล
        const user = await User.findById(decoded.id);

        if (!user) {
            console.error('User not found.');
            res.clearCookie('token');
            return res.redirect('/login');
        }

        // ตรวจสอบว่าอีเมลได้รับการยืนยันหรือไม่
        if (!user.isVerified) {
            console.error('Email not verified. Redirecting to verification page.');
            res.clearCookie('token');
            return res.redirect('/verify-email'); // เปลี่ยนเส้นทางไปหน้าแจ้งเตือนให้ยืนยันอีเมล
        }

        // เพิ่มข้อมูลผู้ใช้ใน req.user
        req.user = user;

        console.log("User data in req.user:", req.user);  // Debug log

        // ดำเนินการต่อไปยัง middleware หรือ controller ถัดไป
        next();
    } catch (error) {
        console.error('Invalid JWT:', error.message);
        res.clearCookie('token'); // ล้าง token ที่ไม่ถูกต้องใน cookie
        res.redirect('/login'); // หาก token ไม่ถูกต้อง ให้เปลี่ยนเส้นทางไปหน้า login
    }
};

module.exports = authenticateJWT;
