// routes/detailsupportRoutes.js
const express = require('express');
const router = express.Router();
const detailsupportController = require('../controllers/detailsupportController');

// แสดงรายละเอียดท่าเมื่อไปที่ /detailsupport/:id
router.get('/:id', detailsupportController.getDetailSupport);

module.exports = router;
