// routes/weatherRoutes.js - Routes for weather data

const express = require('express');
const { 
  getHistoricalWeather, 
  getCurrentWeather, 
  getForecastWeather, 
  getSecondaryWeather,
  addSensorData
} = require('../controllers/weatherController');

const router = express.Router();

// Get historical weather data for a farm
router.get('/historical/:farmId', getHistoricalWeather);

// Get current weather for a farm using OpenWeatherMap
router.get('/current/:farmId', getCurrentWeather);

// Get forecast weather for a farm
router.get('/forecast/:farmId', getForecastWeather);

// Get WeatherStack data as secondary source
router.get('/secondary/:farmId', getSecondaryWeather);

// Upload sensor data from farm
router.post('/sensor-data/:farmId', addSensorData);

module.exports = router;