import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/farms');
      if (!response.ok) {
        throw new Error('Failed to fetch farms');
      }
      const data = await response.json();
      setFarms(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchWeatherData = async (farmId) => {
    setWeatherLoading(true);
    setError(null);
    try {
      // Fetch current weather
      const weatherResponse = await fetch(`http://localhost:9000/api/weather/current/${farmId}`);
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);
      
      // Fetch forecast
      const forecastResponse = await fetch(`http://localhost:9000/api/weather/forecast/${farmId}`);
      const forecastData = await forecastResponse.json();
      setForecastData(forecastData);
      
      setWeatherLoading(false);
    } catch (err) {
      setError('Failed to fetch weather data: ' + err.message);
      setWeatherLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">FarmWeather AI</h1>
          <p className="hero-subtitle">Hyperlocal Weather Forecasting for Precision Agriculture</p>
          <div className="hero-stats">
            <div className="stat-card">
              <h3>Real-time Data</h3>
              <p>Live weather monitoring</p>
            </div>
            <div className="stat-card">
              <h3>AI-Powered</h3>
              <p>Smart predictions & insights</p>
            </div>
            <div className="stat-card">
              <h3>Precision Farming</h3>
              <p>Tailored recommendations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Our Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌤️</div>
              <h3>Weather Forecasting</h3>
              <p>Accurate hyperlocal weather predictions tailored for your farm locations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Data Analytics</h3>
              <p>Historical weather patterns and trend analysis for better decision making</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Farming Recommendations</h3>
              <p>AI-powered suggestions for planting, irrigation, and harvesting schedules</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Access your farm data anywhere, anytime on any device</p>
            </div>
          </div>
        </div>
      </section>

      {/* Farms Section */}
      <section className="farms-section">
        <div className="container">
          <h2 className="section-title">Registered Farms</h2>
          
          {loading && <div className="loading">Loading farms data...</div>}
          
          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
              <button onClick={fetchFarms} className="retry-btn">Retry</button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="farms-grid">
              {farms.map(farm => (
                <div key={farm.id} className="farm-card">
                  <h3>{farm.name}</h3>
                  <div className="farm-details">
                    <p><strong>ID:</strong> {farm.id}</p>
                    <p><strong>Location:</strong> {farm.lat}, {farm.lng}</p>
                  </div>
                  <div className="farm-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        setSelectedFarm(farm);
                        fetchWeatherData(farm.id);
                        setActiveTab('current');
                      }}
                    >
                      View Weather
                    </button>
                    <button className="btn-secondary">Get Recommendations</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && !error && farms.length === 0 && (
            <div className="no-farms">
              <p>No farms registered yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Weather Data Section */}
      {selectedFarm && (
        <section className="weather-section">
          <div className="container">
            <div className="weather-header">
              <h2 className="section-title">Weather Data for {selectedFarm.name}</h2>
              <div className="tab-navigation">
                <button 
                  className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                  onClick={() => setActiveTab('current')}
                >
                  Current Weather
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
                  onClick={() => setActiveTab('forecast')}
                >
                  5-Day Forecast
                </button>
              </div>
            </div>

            {weatherLoading && (
              <div className="weather-loading">
                <div className="spinner"></div>
                <p>Loading weather data...</p>
              </div>
            )}

            {error && activeTab === 'current' && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {!weatherLoading && activeTab === 'current' && weatherData && (
              <div className="weather-current">
                <div className="weather-card">
                  <div className="weather-main">
                    <div className="temperature">
                      <span className="temp-value">{weatherData.temp?.toFixed(1) || 'N/A'}°C</span>
                      <span className="weather-description">{weatherData.description || 'Clear Sky'}</span>
                    </div>
                    <div className="weather-icon">
                      {getWeatherIcon(weatherData.description)}
                    </div>
                  </div>
                  
                  <div className="weather-details">
                    <div className="detail-item">
                      <span className="detail-label">Humidity</span>
                      <span className="detail-value">{weatherData.humidity?.toFixed(0) || 'N/A'}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Wind Speed</span>
                      <span className="detail-value">{weatherData.windSpeed?.toFixed(1) || 'N/A'} km/h</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Precipitation</span>
                      <span className="detail-value">{weatherData.precipitation?.toFixed(1) || '0.0'} mm</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!weatherLoading && activeTab === 'forecast' && forecastData && (
              <div className="weather-forecast">
                <div className="forecast-grid">
                  {forecastData.slice(0, 5).map((day, index) => (
                    <div key={index} className="forecast-day">
                      <div className="forecast-date">
                        {new Date(day.date || new Date()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="forecast-icon">
                        {getWeatherIcon(day.description)}
                      </div>
                      <div className="forecast-temp">
                        <span className="high">{day.temp?.toFixed(1) || 'N/A'}°</span>
                      </div>
                      <div className="forecast-desc">
                        {day.description || 'Clear'}
                      </div>
                      <div className="forecast-details">
                        <span>💧 {day.humidity?.toFixed(0) || 'N/A'}%</span>
                        <span>💨 {day.windSpeed?.toFixed(1) || 'N/A'} km/h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* API Status Section */}
      <section className="api-section">
        <div className="container">
          <h2 className="section-title">System Status</h2>
          <div className="status-card">
            <div className="status-item">
              <span className="status-label">Backend API:</span>
              <span className="status-value status-success">Running on port 9000</span>
            </div>
            <div className="status-item">
              <span className="status-label">Frontend App:</span>
              <span className="status-value status-success">Running on port 3002</span>
            </div>
            <div className="status-item">
              <span className="status-label">Database:</span>
              <span className="status-value status-warning">Sample Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 FarmWeather AI - Precision Agriculture Solutions</p>
          <div className="footer-links">
            <button className="footer-link-btn">Documentation</button>
            <button className="footer-link-btn">API Reference</button>
            <button className="footer-link-btn">Contact Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function to get weather icons
function getWeatherIcon(description) {
  if (!description) return '☀️';
  
  const desc = description.toLowerCase();
  
  if (desc.includes('rain')) return '🌧️';
  if (desc.includes('cloud')) return '☁️';
  if (desc.includes('sun') || desc.includes('clear')) return '☀️';
  if (desc.includes('snow')) return '❄️';
  if (desc.includes('thunder')) return '⛈️';
  if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
  
  return '🌤️';
}

export default App;