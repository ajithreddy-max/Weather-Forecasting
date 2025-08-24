// models/weatherModel.js - Weather data storage and prediction logic

const { LinearRegression } = require('ml-regression');

// Sample historical weather data (in a real app, this would come from a database)
const historicalWeatherData = {
  1: [ // Farm ID 1
    { date: '2025-04-18', temp: 22, humidity: 65, precipitation: 0, windSpeed: 8 },
    { date: '2025-04-19', temp: 23, humidity: 68, precipitation: 5, windSpeed: 10 },
    { date: '2025-04-20', temp: 21, humidity: 70, precipitation: 15, windSpeed: 12 },
    { date: '2025-04-21', temp: 19, humidity: 75, precipitation: 20, windSpeed: 15 },
    { date: '2025-04-22', temp: 18, humidity: 72, precipitation: 8, windSpeed: 11 },
    { date: '2025-04-23', temp: 20, humidity: 68, precipitation: 2, windSpeed: 9 },
    { date: '2025-04-24', temp: 21, humidity: 66, precipitation: 0, windSpeed: 7 },
  ]
};

// Utility to convert date string to day of year (0-365)
const dateToFeature = (dateStr) => {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Get historical weather data for a farm
const getHistoricalData = (farmId) => {
  return historicalWeatherData[farmId] || [];
};

// Save sensor data for a farm
const saveSensorData = (farmId, data) => {
  if (!historicalWeatherData[farmId]) {
    historicalWeatherData[farmId] = [];
  }
  
  historicalWeatherData[farmId].push(data);
  return data;
};

// AI Prediction using Linear Regression
const predictWeather = (farmId, targetDate) => {
  const farmData = historicalWeatherData[farmId] || [];
  
  if (farmData.length < 5) {
    throw new Error('Insufficient historical data for prediction');
  }
  
  // Prepare data for temperature prediction
  const X = farmData.map(entry => [dateToFeature(entry.date)]);
  const yTemp = farmData.map(entry => entry.temp);
  const yHumidity = farmData.map(entry => entry.humidity);
  const yPrecipitation = farmData.map(entry => entry.precipitation);
  const yWindSpeed = farmData.map(entry => entry.windSpeed);
  
  // Create regression models
  const tempModel = new LinearRegression(X, yTemp);
  const humidityModel = new LinearRegression(X, yHumidity);
  const precipitationModel = new LinearRegression(X, yPrecipitation);
  const windSpeedModel = new LinearRegression(X, yWindSpeed);
  
  // Get predictions for the next 5 days
  const predictions = [];
  const targetDayOfYear = dateToFeature(targetDate);
  
  for (let i = 0; i < 5; i++) {
    const dayToPredict = targetDayOfYear + i;
    const dateObj = new Date(new Date(targetDate).setDate(new Date(targetDate).getDate() + i));
    const predictionDate = dateObj.toISOString().split('T')[0];
    
    const temp = Math.round(tempModel.predict([dayToPredict]));
    const humidity = Math.round(humidityModel.predict([dayToPredict]));
    const precipitation = Math.round(precipitationModel.predict([dayToPredict]));
    const windSpeed = Math.round(windSpeedModel.predict([dayToPredict]));
    
    // Calculate confidence based on prediction distance from training data
    // (simplified for example - in a real app use proper confidence intervals)
    const daysFromLastKnown = dayToPredict - dateToFeature(farmData[farmData.length-1].date);
    const confidence = Math.max(0.5, 1 - (daysFromLastKnown * 0.03));
    
    predictions.push({
      date: predictionDate,
      temp,
      humidity,
      precipitation,
      windSpeed,
      confidence: parseFloat(confidence.toFixed(2))
    });
  }
  
  return predictions;
};

module.exports = {
  getHistoricalData,
  saveSensorData,
  predictWeather
};