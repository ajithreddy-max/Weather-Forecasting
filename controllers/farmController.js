// controllers/farmController.js - Farm-related business logic

const { getFarmsByUserId, createFarm } = require('../models/farmModel');

// Get farms for a user
const getFarms = (req, res) => {
  const userId = parseInt(req.query.userId) || 1;
  const userFarms = getFarmsByUserId(userId);
  res.json(userFarms);
};

// Add a new farm location
const addFarm = (req, res) => {
  const { name, lat, lng, userId } = req.body;
  
  if (!name || !lat || !lng || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newFarm = createFarm({
    name,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    userId: parseInt(userId)
  });
  
  res.status(201).json(newFarm);
};

module.exports = {
  getFarms,
  addFarm
};