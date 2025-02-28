const express = require('express');
const summaryController = require('../controllers/summaryController');
const authenticateJWT = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateJWT);

// ✅ `/summary` สำหรับแสดงหน้า EJS
router.get('/', summaryController.renderSummary);

// ✅ `/summary/data` สำหรับ Fetch API
router.get('/data', summaryController.getSummaryData);

module.exports = router;
