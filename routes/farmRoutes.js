// routes/farmRoutes.js - Routes for farm management

const express = require('express');
const { getFarms, addFarm } = require('../controllers/farmController');

const router = express.Router();

// Get farms for a user
router.get('/', getFarms);

// Add a new farm location
router.post('/', addFarm);

module.exports = router;