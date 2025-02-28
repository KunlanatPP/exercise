const express = require('express');
const { getAllExercises } = require('../controllers/exerciseController');

const router = express.Router();

router.get('/', getAllExercises);

module.exports = router;
