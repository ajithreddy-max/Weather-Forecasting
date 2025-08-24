// controllers/recommendationController.js - Agricultural recommendations logic

const { predictWeather } = require('../models/weatherModel');

// Get agricultural recommendations based on weather
const getRecommendations = (req, res) => {
  const farmId = parseInt(req.params.farmId);
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const forecast = predictWeather(farmId, today);
    
    // Simple rules-based system for recommendations
    const recommendations = {
      planting: { 
        status: 'favorable',
        message: 'Conditions look favorable for planting in the next 48 hours.'
      },
      harvesting: {
        status: 'neutral',
        message: 'Standard harvesting conditions expected.'
      },
      irrigation: {
        status: 'not_needed',
        message: 'Natural precipitation should be sufficient for the next 3 days.'
      },
      pesticides: {
        status: 'caution',
        message: 'Apply pesticides within 24 hours before expected precipitation.'
      }
    };
    
    // Adjust recommendations based on forecast
    const highWindDays = forecast.filter(day => day.windSpeed > 15);
    const rainyDays = forecast.filter(day => day.precipitation > 5);
    
    if (highWindDays.length > 0) {
      const windyDateStr = new Date(highWindDays[0].date).toLocaleDateString();
      recommendations.pesticides.status = 'warning';
      recommendations.pesticides.message = `Avoid spraying pesticides on ${windyDateStr} due to high winds.`;
      
      recommendations.harvesting.status = 'warning';
      recommendations.harvesting.message = `Complete harvesting before ${windyDateStr} to avoid wind damage.`;
    }
    
    if (rainyDays.length > 0) {
      const rainyDateStr = new Date(rainyDays[0].date).toLocaleDateString();
      recommendations.planting.status = 'caution';
      recommendations.planting.message = `Complete planting before ${rainyDateStr} to avoid wet soil conditions.`;
      
      recommendations.irrigation.status = 'not_needed';
      recommendations.irrigation.message = `Skip irrigation due to expected rainfall on ${rainyDateStr}.`;
    }
    
    // Check for extreme conditions
    const extremeHeat = forecast.some(day => day.temp > 35);
    const extremeCold = forecast.some(day => day.temp < 5);
    
    if (extremeHeat) {
      recommendations.alerts = recommendations.alerts || [];
      recommendations.alerts.push({
        type: 'extreme_heat',
        message: 'Extreme heat expected. Consider additional irrigation and heat protection measures.'
      });
    }
    
    if (extremeCold) {
      recommendations.alerts = recommendations.alerts || [];
      recommendations.alerts.push({
        type: 'frost_risk',
        message: 'Risk of frost. Consider frost protection for sensitive crops.'
      });
    }
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

module.exports = {
  getRecommendations
};