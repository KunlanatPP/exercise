const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticateJWT = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

// ใช้ middleware authenticateJWT ก่อนเข้าถึง controller
router.get('/', authenticateJWT, dashboardController.getDashboard);

module.exports = router;
