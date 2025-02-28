const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const nodemailer = require('nodemailer');

const jwtSecret = process.env.JWT_SECRET || 'your_secret_key';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';

// ✅ ตั้งค่า Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ ฟังก์ชันส่งอีเมล
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = { from: `"Our Service" <${process.env.EMAIL_USER}>`, to, subject, html: htmlContent };
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new Error("Error sending email: " + error.message);
    }
};

// ✅ ฟังก์ชันตรวจสอบความแข็งแรงของรหัสผ่าน
const isPasswordStrong = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/.test(password);
};

// ✅ **ลงทะเบียน**
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        if (!isPasswordStrong(password)) {
            return res.status(400).json({ message: 'Password must be 8-16 characters, include letters, numbers, and special characters' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, isVerified: false });
        await newUser.save();

        const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });
        const confirmationUrl = `${req.protocol}://${req.get('host')}/confirm?token=${token}`;

        await sendEmail(email, 'Please Confirm Your Email', `<p>Click below to confirm your email:</p><a href="${confirmationUrl}">Confirm Email</a>`);

        // ✅ เปลี่ยนจาก `res.json(...)` เป็น `res.redirect('/verify?email=...')`
        res.redirect(`/verify?email=${encodeURIComponent(email)}`);
        
    } catch (error) {
        res.status(500).json({ message: 'Registration failed' });
    }
};


// ✅ **ยืนยันอีเมล**
exports.confirmEmail = async (req, res) => {
    try {
        const decoded = jwt.verify(req.query.token, jwtSecret);
        const user = await User.findOne({ email: decoded.email });

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified) {
            return res.json({ message: 'Email already verified. You can now log in.' });
        }

        user.isVerified = true;
        await user.save();
        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

// ✅ ฟังก์ชันเข้าสู่ระบบ
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in' });
      }
  
      const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });
  
      res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Strict', maxAge: 24 * 60 * 60 * 1000 });
  
      res.json({ success: true, redirectTo: "/dashboard" });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  };
  
  // ✅ ฟังก์ชันป้องกันการเข้าถึงหน้าที่ต้องล็อกอินก่อน
  exports.protect = async (req, res, next) => {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        res.clearCookie('token');
        return res.status(401).json({ message: 'User not found. Please log in again.' });
      }
  
      req.user = user;
      next();
    } catch (error) {
      res.clearCookie('token');
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }
  };

// ✅ **ออกจากระบบ**
// ✅ **ฟังก์ชัน Logout**
exports.logout = (req, res) => {
    try {
        req.session.destroy(() => {
            res.redirect('/'); // ✅ กลับไปที่หน้า Index หลัง Logout
        });
    } catch (error) {
        console.error("❌ Error logging out:", error);
        res.status(500).render("error", { message: "Failed to logout" });
    }
};


// ✅ **รีเซ็ตรหัสผ่าน**
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '15m' });
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;

        await sendEmail(email, 'Password Reset Request', `<p>Click below to reset your password:</p><a href="${resetUrl}">Reset Password</a>`);

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending reset email' });
    }
};

// ✅ **เปลี่ยนรหัสผ่าน**
exports.resetPassword = async (req, res) => {
    try {
        const decoded = jwt.verify(req.body.token, jwtSecret);
        const newPassword = req.body.newPassword;

        if (!isPasswordStrong(newPassword)) {
            return res.status(400).json({ message: 'Password must be 8-16 characters, include letters, numbers, and special characters' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};
