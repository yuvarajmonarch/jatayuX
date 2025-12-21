const axios = require('axios');

class WeatherService {
  constructor() {
    this.openMeteoBaseUrl = 'https://api.open-meteo.com/v1';
    this.marineApiUrl = 'https://marine-api.open-meteo.com/v1';
  }

  /**
   * Get current weather conditions
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeather(lat, lng) {
    try {
      console.log(`🌤️ Fetching weather for ${lat}, ${lng}`);
      
      const response = await axios.get(`${this.openMeteoBaseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lng,
          current_weather: true,
          hourly: 'temperature_2m,relativehumidity_2m,precipitation,cloudcover,windspeed_10m,winddirection_10m',
          daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max',
          timezone: 'auto'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('❌ Weather API error:', error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  /**
   * Get marine weather data
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Marine weather data
   */
  async getMarineWeather(lat, lng) {
    try {
      console.log(`🌊 Fetching marine weather for ${lat}, ${lng}`);
      
      const response = await axios.get(`${this.marineApiUrl}/marine`, {
        params: {
          latitude: lat,
          longitude: lng,
          hourly: 'wave_height,wave_direction,wave_period,sea_surface_temperature'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('❌ Marine weather API error:', error.message);
      throw new Error('Failed to fetch marine weather data');
    }
  }

  /**
   * Get weather forecast
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} days - Number of forecast days
   * @returns {Promise<Object>} Weather forecast
   */
  async getForecast(lat, lng, days = 7) {
    try {
      console.log(`📅 Fetching ${days}-day forecast for ${lat}, ${lng}`);
      
      const response = await axios.get(`${this.openMeteoBaseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lng,
          daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max',
          forecast_days: days,
          timezone: 'auto'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('❌ Forecast API error:', error.message);
      throw new Error('Failed to fetch weather forecast');
    }
  }
}

module.exports = new WeatherService();
