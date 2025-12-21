const axios = require('axios');

class RadarService {
  constructor() {
    this.rainViewerBaseUrl = 'https://api.rainviewer.com/public';
  }

  /**
   * Get radar configuration and timestamps
   * @returns {Promise<Object>} Radar configuration
   */
  async getRadarConfig() {
    try {
      console.log('📡 Fetching radar configuration');
      
      const response = await axios.get(`${this.rainViewerBaseUrl}/weather-maps.json`, {
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('❌ Radar API error:', error.message);
      throw new Error('Failed to fetch radar data');
    }
  }

  /**
   * Get satellite imagery data
   * @returns {Promise<Object>} Satellite data
   */
  async getSatelliteData() {
    try {
      console.log('🛰️ Fetching satellite data');
      
      const response = await axios.get(`${this.rainViewerBaseUrl}/weather-maps.json`, {
        timeout: 10000
      });

      const data = response.data;
      return {
        timestamps: data.satellite?.infrared || [],
        host: data.satellite?.host || 'https://tilecache.rainviewer.com/v2/satellite'
      };
    } catch (error) {
      console.error('❌ Satellite API error:', error.message);
      throw new Error('Failed to fetch satellite data');
    }
  }

  /**
   * Generate radar tile URL
   * @param {number} timestamp - Unix timestamp
   * @param {number} z - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {string} Radar tile URL
   */
  getRadarTileUrl(timestamp, z, x, y) {
    return `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/${z}/${x}/${y}/1/1_1.png`;
  }

  /**
   * Generate satellite tile URL
   * @param {number} timestamp - Unix timestamp
   * @param {number} z - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {string} host - Satellite tile host
   * @returns {string} Satellite tile URL
   */
  getSatelliteTileUrl(timestamp, z, x, y, host) {
    return `${host}/${timestamp}/${z}/${x}/${y}.png`;
  }
}

module.exports = new RadarService();
