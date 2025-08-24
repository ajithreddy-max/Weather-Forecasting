// controllers/weatherController.js - Weather-related business logic

const axios = require('axios');
const { getFarmById } = require('../models/farmModel');
const { 
  getHistoricalData, 
  saveSensorData, 
  predictWeather 
} = require('../models/weatherModel');

// Get historical weather data for a farm
const getHistoricalWeather = (req, res) => {
  const farmId = parseInt(req.params.farmId);
  const data = getHistoricalData(farmId);
  res.json(data);
};

// Get current weather for a farm using OpenWeatherMap
const getCurrentWeather = async (req, res) => {
  try {
    const farmId = parseInt(req.params.farmId);
    const farm = getFarmById(farmId);
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    // Call OpenWeatherMap API
    const openWeatherApiKey = process.env.OPENWEATHERMAP_API_KEY || 'your_api_key_here';
    const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${farm.lat}&lon=${farm.lng}&units=metric&appid=${openWeatherApiKey}`;
    
    const response = await axios.get(openWeatherUrl);
    
    // Transform the response
    const currentWeather = {
      temp: Math.round(response.data.main.temp),
      humidity: response.data.main.humidity,
      precipitation: response.data.rain ? response.data.rain['1h'] || 0 : 0,
      windSpeed: Math.round(response.data.wind.speed * 3.6), // Convert m/s to km/h
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon
    };
    
    res.json(currentWeather);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ error: 'Failed to fetch current weather data' });
  }
};

// Get forecast weather for a farm
const getForecastWeather = async (req, res) => {
  try {
    const farmId = parseInt(req.params.farmId);
    const farm = getFarmById(farmId);
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    // First try to get forecast from OpenWeatherMap API
    const openWeatherApiKey = process.env.OPENWEATHERMAP_API_KEY || 'your_api_key_here';
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${farm.lat}&lon=${farm.lng}&units=metric&appid=${openWeatherApiKey}`;
    
    let externalForecast;
    try {
      const response = await axios.get(forecastUrl);
      
      // Process the forecast data (simplified)
      externalForecast = response.data.list.filter((item, index) => index % 8 === 0) // Get one forecast per day
        .map(item => {
          const date = new Date(item.dt * 1000).toISOString().split('T')[0];
          return {
            date,
            temp: Math.round(item.main.temp),
            humidity: item.main.humidity,
            precipitation: item.rain ? item.rain['3h'] * 8/3 : 0, // Convert 3h to daily
            windSpeed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
            source: 'openweathermap'
          };
        });
    } catch (error) {
      console.error('Error fetching external forecast, falling back to AI model:', error);
      externalForecast = null;
    }
    
    // If external forecast failed, use our AI model
    if (!externalForecast) {
      const today = new Date().toISOString().split('T')[0];
      externalForecast = predictWeather(farmId, today);
    } else {
      // Add confidence values to external forecast
      externalForecast = externalForecast.map((day, index) => ({
        ...day,
        confidence: Math.max(0.65, 0.95 - (index * 0.05)) // Decrease confidence as days go forward
      }));
    }
    
    // Now run our AI model and blend the results
    const aiPredictions = predictWeather(farmId, new Date().toISOString().split('T')[0]);
    
    // Blend external forecast with AI predictions (simple average)
    const blendedForecast = aiPredictions.map((aiDay, index) => {
      if (externalForecast && externalForecast[index]) {
        const extDay = externalForecast[index];
        return {
          date: aiDay.date,
          temp: Math.round((aiDay.temp + extDay.temp) / 2),
          humidity: Math.round((aiDay.humidity + extDay.humidity) / 2),
          precipitation: Math.round((aiDay.precipitation + extDay.precipitation) / 2),
          windSpeed: Math.round((aiDay.windSpeed + extDay.windSpeed) / 2),
          confidence: Math.min(aiDay.confidence, extDay.confidence),
          sources: ['ai-model', extDay.source || 'openweathermap']
        };
      }
      return { ...aiDay, sources: ['ai-model'] };
    });
    
    res.json(blendedForecast);
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
};

// Get WeatherStack data as secondary source
const getSecondaryWeather = async (req, res) => {
  try {
    const farmId = parseInt(req.params.farmId);
    const farm = getFarmById(farmId);
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    // Call WeatherStack API
    const weatherStackApiKey = process.env.WEATHERSTACK_API_KEY || 'your_weatherstack_api_key';
    const weatherStackUrl = `http://api.weatherstack.com/current?access_key=${weatherStackApiKey}&query=${farm.lat},${farm.lng}&units=m`;
    
    const response = await axios.get(weatherStackUrl);
    
    if (response.data.error) {
      throw new Error(response.data.error.info);
    }
    
    // Transform the response
    const currentWeather = {
      temp: response.data.current.temperature,
      humidity: response.data.current.humidity,
      precipitation: response.data.current.precip,
      windSpeed: response.data.current.wind_speed,
      description: response.data.current.weather_descriptions[0],
      source: 'weatherstack'
    };
    
    res.json(currentWeather);
  } catch (error) {
    console.error('Error fetching WeatherStack data:', error);
    res.status(500).json({ error: 'Failed to fetch WeatherStack data' });
  }
};

// Upload sensor data from farm
const addSensorData = (req, res) => {
  const farmId = parseInt(req.params.farmId);
  const { date, temp, humidity, precipitation, windSpeed } = req.body;
  
  if (!date || temp === undefined || humidity === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  saveSensorData(farmId, {
    date,
    temp: parseFloat(temp),
    humidity: parseFloat(humidity),
    precipitation: parseFloat(precipitation || 0),
    windSpeed: parseFloat(windSpeed || 0)
  });
  
  res.status(201).json({ message: 'Sensor data saved successfully' });
};

module.exports = {
  getHistoricalWeather,
  getCurrentWeather,
  getForecastWeather,
  getSecondaryWeather,
  addSensorData
};