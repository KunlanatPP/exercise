const express = require('express');
const { getHistory, deleteHistory, getDetail } = require('../controllers/historyController');

const router = express.Router();

router.get('/', getHistory);
router.get('/:id', getDetail); 
router.delete('/:id', deleteHistory);

module.exports = router;
