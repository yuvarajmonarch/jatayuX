// Mapbox service for satellite imagery and mapping
class MapboxService {
  constructor() {
    this.accessToken = 'pk.eyJ1IjoibmlybWFsLTA3IiwiYSI6ImNtZnNqYW91NzBjN2EycXNoYTl6bWx6Ym8ifQ.pckER2f_OX6V10ttE5o3Pw';
    this.baseUrl = 'https://api.mapbox.com';
  }

  /**
   * Get satellite tile URL
   * @param {number} z - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {string} Satellite tile URL
   */
  getSatelliteTileUrl(z, x, y) {
    return `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.png?access_token=${this.accessToken}`;
  }

  /**
   * Get street map tile URL
   * @param {number} z - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {string} Street tile URL
   */
  getStreetTileUrl(z, x, y) {
    return `https://api.mapbox.com/v4/mapbox.streets/${z}/${x}/${y}.png?access_token=${this.accessToken}`;
  }

  /**
   * Get dark theme tile URL
   * @param {number} z - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {string} Dark tile URL
   */
  getDarkTileUrl(z, x, y) {
    return `https://api.mapbox.com/v4/mapbox.dark/${z}/${x}/${y}.png?access_token=${this.accessToken}`;
  }

  /**
   * Convert lat/lng to tile coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} zoom - Zoom level
   * @returns {Object} Tile coordinates
   */
  latLngToTile(lat, lng, zoom) {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lng + 180) / 360) * n);
    const y = Math.floor(((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2) * n);
    return { x, y, z: zoom };
  }

  /**
   * Get map bounds for a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} zoom - Zoom level
   * @returns {Object} Map bounds
   */
  getMapBounds(lat, lng, zoom) {
    const tile = this.latLngToTile(lat, lng, zoom);
    const tileSize = 256;
    const worldSize = Math.pow(2, zoom) * tileSize;
    
    return {
      north: lat + (tileSize / worldSize) * 180 / Math.PI,
      south: lat - (tileSize / worldSize) * 180 / Math.PI,
      east: lng + (tileSize / worldSize) * 360 / Math.PI,
      west: lng - (tileSize / worldSize) * 360 / Math.PI,
      center: [lng, lat],
      zoom: zoom
    };
  }

  /**
   * Get elevation data for coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<number>} Elevation in meters
   */
  async getElevation(lat, lng) {
    try {
      // Use Open-Elevation API (free alternative to Mapbox elevation)
      const response = await fetch(
        `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
      );
      
      if (!response.ok) {
        throw new Error(`Elevation API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results[0]?.elevation || 0;
    } catch (error) {
      console.error('Elevation service error:', error);
      throw error; // Re-throw the error instead of using fallback
    }
  }

  /**
   * Get geocoding data
   * @param {string} query - Search query
   * @returns {Promise<Object>} Geocoding results
   */
  async geocode(query) {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.accessToken}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.features[0] || null;
    } catch (error) {
      console.error('Geocoding service error:', error);
      return null;
    }
  }

  /**
   * Get reverse geocoding data
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Reverse geocoding result
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.features[0] || null;
    } catch (error) {
      console.error('Reverse geocoding service error:', error);
      return null;
    }
  }

  /**
   * Get map style configuration
   * @param {string} style - Style name (satellite, streets, dark)
   * @returns {Object} Map style configuration
   */
  getMapStyle(style = 'satellite') {
    const styles = {
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      streets: 'mapbox://styles/mapbox/streets-v12',
      dark: 'mapbox://styles/mapbox/dark-v11',
      light: 'mapbox://styles/mapbox/light-v11'
    };
    
    return {
      style: styles[style] || styles.satellite,
      accessToken: this.accessToken
    };
  }

  /**
   * Generate map layers configuration
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} zoom - Zoom level
   * @param {Array<string>} layerTypes - Types of layers to include
   * @returns {Array<Object>} Map layers configuration
   */
  generateMapLayers(lat, lng, zoom, layerTypes = ['satellite']) {
    const layers = [];
    const tile = this.latLngToTile(lat, lng, zoom);
    
    layerTypes.forEach(type => {
      let url;
      switch (type) {
        case 'satellite':
          url = this.getSatelliteTileUrl(tile.z, tile.x, tile.y);
          break;
        case 'streets':
          url = this.getStreetTileUrl(tile.z, tile.x, tile.y);
          break;
        case 'dark':
          url = this.getDarkTileUrl(tile.z, tile.x, tile.y);
          break;
        default:
          url = this.getSatelliteTileUrl(tile.z, tile.x, tile.y);
      }
      
      layers.push({
        id: `${type}-layer`,
        type: 'raster',
        source: type,
        url: url,
        visible: true,
        opacity: 0.8
      });
    });
    
    return layers;
  }
}

export default new MapboxService();
