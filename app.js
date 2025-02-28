require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const crypto = require('crypto'); 
const authenticateJWT = require('./middleware/authMiddleware');
const nonce = crypto.randomBytes(16).toString("base64");
const app = express();
const PORT = process.env.PORT || 4000;

// ✅ อนุญาตการเชื่อมต่อไปยัง Flask API (127.0.0.1:5000)
app.use(cors({
    origin: ['http://127.0.0.1:5000', 'http://localhost:5000'], 
    credentials: true
}));

// ✅ อัปเดต Content Security Policy (CSP) ให้รองรับ API
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "default-src": ["'self'", "https://cdn.jsdelivr.net", "http://127.0.0.1:5000"], // ✅ อนุญาต API
                "script-src": [
                    "'self'",
                    "'unsafe-eval'",
                    "'unsafe-inline'",
                    `'nonce-${nonce}'`, 
                    "https://cdn.jsdelivr.net",
                    "https://cdnjs.cloudflare.com",
                    "https://kit.fontawesome.com"
                ],
                "script-src-elem": [
                    "'self'",
                    `'nonce-${nonce}'`,
                    "'unsafe-eval'",
                    "https://cdn.jsdelivr.net",
                    "https://cdnjs.cloudflare.com",
                    "https://kit.fontawesome.com"
                ],
                "style-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com",
                "'unsafe-eval'",
                "'unsafe-inline'"],
                "img-src": ["'self'", "data:"],
                "connect-src": ["'self'", "https://cdn.jsdelivr.net", "http://127.0.0.1:5000"], // ✅ อนุญาตให้ fetch API
                "worker-src": ["'self'", "blob:"]
            }
        }
    })
);

// ✅ ส่ง `nonce` ไปยัง `views`
app.use((req, res, next) => {
    res.locals.nonce = nonce;
    next();
});

// ✅ เชื่อมต่อ MongoDB
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: Missing MONGO_URI in .env");
    process.exit(1);
}

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// ✅ Middleware พื้นฐาน
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.disable('etag');

// ✅ กำหนด Static Files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ ตั้งค่า View Engine เป็น EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Debugging Logs
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ✅ Import Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const profileRoutes = require('./routes/profileRoutes');
const historyRoutes = require('./routes/historyRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const supportRoutes = require('./routes/supportRoutes');
const detailsupportRoutes = require('./routes/detailsupportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// ✅ กำหนด Routes
app.use('/', authRoutes);
app.use('/dashboard', authenticateJWT, dashboardRoutes);
app.use('/session', authenticateJWT, sessionRoutes);
app.use('/profile', authenticateJWT, profileRoutes);
app.use('/profilesetting', authenticateJWT, profileRoutes);
app.use('/support', authenticateJWT, supportRoutes);
app.use('/detailsupport', authenticateJWT, detailsupportRoutes);
app.use('/history', authenticateJWT, historyRoutes);
app.use('/summary', authenticateJWT, summaryRoutes);
app.use('/settings', authenticateJWT, settingsRoutes);
app.use('/model', express.static(path.join(__dirname, 'public/model')));
app.use('/api/history', authenticateJWT, historyRoutes);

// ✅ Route หน้าแรก (Home Page)
app.get("/", (req, res) => {
    res.render("index");
});

// ✅ ปิด Cache CSS
app.use('/css', express.static(path.join(__dirname, 'public/css'), {
    etag: false,
    lastModified: false,
    cacheControl: false,
    setHeaders: (res) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    }
}));

// ✅ จัดการ Route ที่ไม่มีอยู่
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// ✅ Middleware สำหรับจัดการข้อผิดพลาดเซิร์ฟเวอร์
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});


app.use((req, res, next) => {
    res.locals.theme = req.cookies.theme || "light"; // ดึงค่าธีมจาก Cookie
    next();
});

