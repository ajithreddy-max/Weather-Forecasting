// server.js - Main application file for AI-Powered Weather Forecasting System

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const farmRoutes = require('./routes/farmRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Sample farms data
const farms = [
    { id: 1, name: 'North Farm', lat: 37.7749, lng: -122.4194, userId: 1 },
    { id: 2, name: 'South Orchard', lat: 34.0522, lng: -118.2437, userId: 1 }
];

// Routes
app.use('/api/farms', farmRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Endpoint to get the list of farms (fallback if not handled by routes)
app.get('/api/farms', (req, res) => {
    res.json(farms);
});

// Serve index.html at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3002;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;