// routes/recommendationRoutes.js - Routes for agricultural recommendations

const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController');

const router = express.Router();

// Get agricultural recommendations based on weather
router.get('/:farmId', getRecommendations);

module.exports = router;