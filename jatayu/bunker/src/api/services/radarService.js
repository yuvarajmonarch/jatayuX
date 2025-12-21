// Radar data service using RainViewer API
class RadarService {
  constructor() {
    this.baseUrl = 'https://api.rainviewer.com/public';
  }

  /**
   * Get radar timestamps and configuration
   * @returns {Promise<Object>} Radar configuration data
   */
  async getRadarConfig() {
    try {
      const response = await fetch(`${this.baseUrl}/weather-maps.json`);
      
      if (!response.ok) {
        throw new Error(`Radar API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Radar service error:', error);
      throw error; // Don't fall back to mock data
    }
  }

  /**
   * Get radar tile URL for specific timestamp
   * @param {number} timestamp - Unix timestamp
   * @param {number} z - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {string} color - Color scheme
   * @param {number} smooth - Smoothing level
   * @returns {string} Radar tile URL
   */
  getRadarTileUrl(timestamp, z, x, y, color = '1', smooth = 1) {
    try {
      const config = this.getRadarConfig();
      const host = config.radar?.host || 'https://tilecache.rainviewer.com/v2/radar';
      return `${host}/${timestamp}/256/${z}/${x}/${y}/${color}/${smooth}_1.png`;
    } catch (error) {
      console.error('Radar tile URL error:', error);
      return `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/${z}/${x}/${y}/1/1_1.png`;
    }
  }

  /**
   * Get satellite imagery data
   * @returns {Promise<Object>} Satellite data
   */
  async getSatelliteData() {
    try {
      const response = await fetch(`${this.baseUrl}/weather-maps.json`);
      
      if (!response.ok) {
        throw new Error(`Satellite API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        timestamps: data.satellite?.infrared || [],
        host: data.satellite?.host || 'https://tilecache.rainviewer.com/v2/satellite'
      };
    } catch (error) {
      console.error('Satellite service error:', error);
      throw error; // Don't fall back to mock data
    }
  }

  /**
   * Get precipitation forecast
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Precipitation forecast
   */
  async getPrecipitationForecast(lat, lng) {
    try {
      // Use Open-Meteo for precipitation data since RainViewer doesn't have this endpoint
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation&forecast_days=3`
      );
      
      if (!response.ok) {
        throw new Error(`Precipitation API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Precipitation forecast error:', error);
      throw error; // Don't fall back to mock data
    }
  }

  /**
   * Get storm tracking data
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in km
   * @returns {Promise<Object>} Storm tracking data
   */
  async getStormTracking(lat, lng, radius = 100) {
    try {
      // This would typically use a storm tracking API
      // For demo purposes, we'll return mock data
      return {
        storms: [
          {
            id: 'storm_001',
            center: { lat: lat + 0.1, lng: lng + 0.1 },
            intensity: 'moderate',
            direction: 'northeast',
            speed: 15,
            radius: 50
          }
        ],
        alerts: [
          {
            type: 'thunderstorm_warning',
            severity: 'moderate',
            message: 'Thunderstorms possible within 50km'
          }
        ]
      };
    } catch (error) {
      console.error('Storm tracking error:', error);
      return { storms: [], alerts: [] };
    }
  }

  // Mock data fallbacks
  getMockRadarConfig() {
    return {
      radar: {
        past: [Math.floor(Date.now() / 1000)],
        host: 'https://tilecache.rainviewer.com/v2/radar',
        coverage: 0.8
      },
      satellite: {
        infrared: [Math.floor(Date.now() / 1000)],
        host: 'https://tilecache.rainviewer.com/v2/satellite'
      }
    };
  }

  getMockSatelliteData() {
    return {
      timestamps: [Math.floor(Date.now() / 1000)],
      host: 'https://tilecache.rainviewer.com/v2/satellite'
    };
  }

  getMockPrecipitationData() {
    return {
      hourly: {
        time: [],
        precipitation: []
      }
    };
  }
}

export default new RadarService();
