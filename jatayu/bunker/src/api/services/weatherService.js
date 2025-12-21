// Weather data service using Open-Meteo API
class WeatherService {
  constructor() {
    this.baseUrl = 'https://api.open-meteo.com/v1';
    this.marineUrl = 'https://marine-api.open-meteo.com/v1';
  }

  /**
   * Get current weather conditions
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Current weather data
   */
  async getCurrentWeather(lat, lng) {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,cloudcover,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Weather service error:', error);
      throw error; // Don't fall back to mock data
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
      const response = await fetch(
        `${this.marineUrl}/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wave_direction,wave_period,sea_surface_temperature`
      );
      
      if (!response.ok) {
        throw new Error(`Marine API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Marine weather service error:', error);
      throw error; // Don't fall back to mock data
    }
  }

  /**
   * Get weather forecast
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} days - Number of days to forecast
   * @returns {Promise<Object>} Weather forecast
   */
  async getForecast(lat, lng, days = 7) {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&forecast_days=${days}&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Forecast service error:', error);
      throw error; // Don't fall back to mock data
    }
  }

  // Mock data fallbacks
  getMockWeatherData() {
    return {
      current_weather: {
        temperature: 26,
        windspeed: 15,
        winddirection: 180,
        weathercode: 0,
        time: new Date().toISOString()
      },
      hourly: {
        time: [],
        temperature_2m: [],
        precipitation: [],
        cloudcover: []
      },
      daily: {
        weathercode: [0],
        temperature_2m_max: [28],
        temperature_2m_min: [24]
      }
    };
  }

  getMockMarineData() {
    return {
      hourly: {
        time: [new Date().toISOString()],
        wave_height: [1.2],
        wave_direction: [180],
        wave_period: [8.5],
        sea_surface_temperature: [28]
      }
    };
  }

  getMockForecastData() {
    return {
      daily: {
        time: [],
        weathercode: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
        precipitation_sum: [],
        windspeed_10m_max: []
      }
    };
  }
}

export default new WeatherService();
