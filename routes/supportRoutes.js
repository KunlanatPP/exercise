// routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// แสดงรายการท่าทั้งหมดที่ /support
router.get('/', supportController.getSupportPage);

module.exports = router;
