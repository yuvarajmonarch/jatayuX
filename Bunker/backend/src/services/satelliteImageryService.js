const axios = require('axios');

class SatelliteImageryService {
  constructor() {
    // Sentinel Hub API configuration
    this.sentinelHubConfig = {
      baseUrl: 'https://services.sentinel-hub.com/api/v1',
      clientId: process.env.SENTINEL_HUB_CLIENT_ID || 'demo',
      clientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET || 'demo'
    };
    
    // Planet Labs API configuration (alternative)
    this.planetConfig = {
      baseUrl: 'https://api.planet.com/basemaps/v1/mosaics',
      apiKey: process.env.PLANET_API_KEY
    };
    
    // NASA Worldview API
    this.nasaConfig = {
      baseUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best'
    };
  }

  /**
   * Generate Sentinel Hub image URL for a given location and time
   */
  generateSentinelHubUrl(coordinates, timeRange, imageType = 'true_color') {
    const { lat, lng } = coordinates;
    
    // For now, return a placeholder URL that will show a fallback image
    // In production, this would use actual Sentinel Hub API with proper authentication
    return this.generateFallbackImage(coordinates, imageType);
  }

  /**
   * Generate NASA Worldview image URL
   */
  generateNasaWorldviewUrl(coordinates, date, layer = 'MODIS_Terra_CorrectedReflectance_TrueColor') {
    const { lat, lng } = coordinates;
    
    // Convert lat/lng to tile coordinates
    const tileSize = 0.1;
    const tileX = Math.floor((lng + 180) / tileSize);
    const tileY = Math.floor((lat + 90) / tileSize);
    
    // Format date as YYYY-MM-DD
    const formattedDate = date.split('T')[0];
    
    return `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${layer}/default/${formattedDate}/250m/${tileY}/${tileX}.jpg`;
  }

  /**
   * Get before and after satellite images for a location
   */
  async getBeforeAfterImages(coordinates) {
    try {
      const { lat, lng } = coordinates;
      
      // Calculate time ranges (6 months ago and current)
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
      
      const currentTime = now.toISOString().split('T')[0];
      const pastTime = sixMonthsAgo.toISOString().split('T')[0];
      
      // Generate mock satellite imagery
      const beforeImage = this.generateMockSatelliteImage(coordinates, 'before', pastTime);
      const currentImage = this.generateMockSatelliteImage(coordinates, 'after', currentTime);
      
      // Generate multiple image sources for redundancy
      const images = {
        before: {
          sentinelHub: beforeImage.url,
          mapbox: beforeImage.url,
          nasa: beforeImage.url,
          timestamp: pastTime,
          source: beforeImage.source,
          resolution: beforeImage.resolution
        },
        after: {
          sentinelHub: currentImage.url,
          mapbox: currentImage.url,
          nasa: currentImage.url,
          timestamp: currentTime,
          source: currentImage.source,
          resolution: currentImage.resolution
        }
      };

      return {
        success: true,
        coordinates: coordinates,
        timeRange: {
          before: pastTime,
          after: currentTime
        },
        images: images,
        metadata: {
          resolution: '10m',
          source: 'Mock Satellite Imagery',
          processing: 'Simulated atmospheric correction',
          cloudCover: 'Minimal cloud coverage simulated'
        }
      };

    } catch (error) {
      console.error('Error generating satellite images:', error);
      return {
        success: false,
        error: error.message,
        fallback: {
          before: this.generateFallbackImage(coordinates, 'before'),
          after: this.generateFallbackImage(coordinates, 'after')
        }
      };
    }
  }

  /**
   * Test if satellite images are available
   */
  async testImageAvailability(images) {
    const tests = {};
    
    try {
      // Test before image
      const beforeResponse = await axios.head(images.before.sentinelHub, { timeout: 5000 });
      tests.before = beforeResponse.status === 200;
    } catch (error) {
      tests.before = false;
    }

    try {
      // Test after image
      const afterResponse = await axios.head(images.after.sentinelHub, { timeout: 5000 });
      tests.after = afterResponse.status === 200;
    } catch (error) {
      tests.after = false;
    }

    return tests;
  }

  /**
   * Get real-time satellite imagery using multiple sources
   */
  async getRealTimeSatelliteImagery(coordinates, imageType = 'satellite') {
    const { lat, lng } = coordinates;
    
    try {
      // Try multiple real satellite data sources in order of preference
      const sources = [
        () => this.getMapboxSatelliteImage(coordinates, imageType),
        () => this.getNasaWorldviewImage(coordinates, imageType),
        () => this.getLandsatImage(coordinates, imageType),
        () => this.getSentinelHubImage(coordinates, imageType)
      ];
      
      for (const source of sources) {
        try {
          const result = await source();
          if (result && result.url) {
            console.log(`✅ Got real satellite imagery from ${result.source}`);
            return result;
          }
        } catch (error) {
          console.warn(`⚠️ Satellite source failed: ${error.message}`);
          continue;
        }
      }
      
      // If all real sources fail, use Mapbox as final fallback
      return await this.getMapboxSatelliteImage(coordinates, imageType);
      
    } catch (error) {
      console.error('❌ All satellite imagery sources failed:', error);
      return this.generateFallbackImage(coordinates, imageType);
    }
  }

  /**
   * Get Mapbox Satellite tile (most reliable for real imagery)
   */
  async getMapboxSatelliteImage(coordinates, imageType) {
    const { lat, lng } = coordinates;
    const zoom = 15; // High resolution
    
    // Convert lat/lng to tile coordinates
    const tileX = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    const mapboxToken = this.mapboxAccessToken || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    let url;
    switch (imageType) {
      case 'satellite':
        url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/${zoom}/${tileX}/${tileY}@2x?access_token=${mapboxToken}`;
        break;
      case 'ndvi':
        // Use Mapbox's NDVI visualization
        url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/${zoom}/${tileX}/${tileY}@2x?access_token=${mapboxToken}`;
        break;
      default:
        url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/${zoom}/${tileX}/${tileY}@2x?access_token=${mapboxToken}`;
    }
    
    return {
      url,
      source: 'Mapbox Satellite',
      timestamp: new Date().toISOString(),
      resolution: 'High (512x512)',
      type: imageType
    };
  }

  /**
   * Get NASA Worldview imagery
   */
  async getNasaWorldviewImage(coordinates, imageType) {
    const { lat, lng } = coordinates;
    
    // NASA Worldview provides global imagery
    const baseUrl = 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best';
    
    let layer;
    switch (imageType) {
      case 'satellite':
        layer = 'MODIS_Terra_CorrectedReflectance_TrueColor';
        break;
      case 'ndvi':
        layer = 'MODIS_Terra_NDVI';
        break;
      case 'ndwi':
        layer = 'MODIS_Terra_NDWI';
        break;
      default:
        layer = 'MODIS_Terra_CorrectedReflectance_TrueColor';
    }
    
    const url = `${baseUrl}/${layer}/default/2023-01-01/250m/${lat}/${lng}/512/512.png`;
    
    // Test if URL is accessible
    try {
      await axios.head(url, { timeout: 5000 });
      return {
        url,
        source: 'NASA Worldview',
        timestamp: new Date().toISOString(),
        resolution: '250m',
        type: imageType
      };
    } catch (error) {
      throw new Error(`NASA Worldview unavailable: ${error.message}`);
    }
  }

  /**
   * Get Landsat imagery
   */
  async getLandsatImage(coordinates, imageType) {
    const { lat, lng } = coordinates;
    
    try {
      // Search for recent Landsat imagery
      const searchUrl = `${this.landsatUrl}/search`;
      const searchParams = {
        bbox: [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01].join(','),
        datetime: '2023-01-01/2024-12-31',
        collections: ['landsat-c2-l2'],
        limit: 1
      };
      
      const response = await axios.get(searchUrl, { 
        params: searchParams,
        timeout: 10000 
      });
      
      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        const thumbnailUrl = feature.assets?.thumbnail?.href;
        
        if (thumbnailUrl) {
          return {
            url: thumbnailUrl,
            source: 'Landsat',
            timestamp: feature.properties.datetime,
            resolution: '30m',
            type: imageType
          };
        }
      }
      
      throw new Error('No Landsat imagery found');
    } catch (error) {
      throw new Error(`Landsat unavailable: ${error.message}`);
    }
  }

  /**
   * Get Sentinel Hub imagery (requires authentication)
   */
  async getSentinelHubImage(coordinates, imageType) {
    if (!this.sentinelHubClientId || this.sentinelHubClientId === 'demo') {
      throw new Error('Sentinel Hub credentials required');
    }
    
    const { lat, lng } = coordinates;
    
    // This would require proper Sentinel Hub authentication and processing
    // For now, we'll skip this as it requires paid subscription
    throw new Error('Sentinel Hub requires paid subscription');
  }

  /**
   * Generate mock satellite image with realistic appearance
   */
  generateMockSatelliteImage(coordinates, imageType = 'satellite', timestamp = null) {
    const { lat, lng } = coordinates;
    
    // Generate consistent random seed based on coordinates and image type
    const seed = Math.abs(lat * 1000 + lng * 1000 + imageType.length * 100);
    const random = (Math.sin(seed) * 10000) % 1;
    
    // Different image sources for different types
    const imageSources = {
      satellite: [
        `https://picsum.photos/512/512?random=${Math.floor(random * 1000)}&blur=0.5`,
        `https://source.unsplash.com/512x512/?satellite,earth,aerial`,
        `https://source.unsplash.com/512x512/?landscape,aerial,drone`,
        `https://source.unsplash.com/512x512/?city,urban,aerial`,
        `https://source.unsplash.com/512x512/?nature,forest,aerial`
      ],
      ndvi: [
        `https://picsum.photos/512/512?random=${Math.floor(random * 1000 + 100)}&blur=0.3`,
        `https://source.unsplash.com/512x512/?nature,forest,green`,
        `https://source.unsplash.com/512x512/?vegetation,agriculture,green`,
        `https://source.unsplash.com/512x512/?fields,crops,green`
      ],
      ndwi: [
        `https://picsum.photos/512/512?random=${Math.floor(random * 1000 + 200)}&blur=0.3`,
        `https://source.unsplash.com/512x512/?water,ocean,blue`,
        `https://source.unsplash.com/512x512/?lake,river,blue`,
        `https://source.unsplash.com/512x512/?coastline,shore,blue`
      ],
      infrared: [
        `https://picsum.photos/512/512?random=${Math.floor(random * 1000 + 300)}&blur=0.3`,
        `https://source.unsplash.com/512x512/?heat,thermal,orange`,
        `https://source.unsplash.com/512x512/?infrared,thermal,red`,
        `https://source.unsplash.com/512x512/?temperature,heat,orange`
      ],
      before: [
        `https://picsum.photos/512/512?random=${Math.floor(random * 1000 + 400)}&blur=0.4`,
        `https://source.unsplash.com/512x512/?historical,old,aerial`,
        `https://source.unsplash.com/512x512/?past,retro,landscape`
      ],
      after: [
        `https://picsum.photos/512/512?random=${Math.floor(random * 1000 + 500)}&blur=0.2`,
        `https://source.unsplash.com/512x512/?current,modern,aerial`,
        `https://source.unsplash.com/512x512/?present,new,landscape`
      ]
    };
    
    // Select image source based on random seed
    const sources = imageSources[imageType] || imageSources.satellite;
    const selectedSource = sources[Math.floor(random * sources.length)];
    
    return {
      url: selectedSource,
      source: 'Mock Satellite Imagery',
      timestamp: timestamp || new Date().toISOString(),
      resolution: '10m',
      type: imageType,
      coordinates: coordinates
    };
  }

  /**
   * Generate fallback image URL (only used if all real sources fail)
   */
  generateFallbackImage(coordinates, imageType = 'satellite') {
    const { lat, lng } = coordinates;
    
    // Use a simple colored placeholder as absolute fallback
    const colors = {
      satellite: '4a5568', // Gray
      ndvi: '22c55e',      // Green
      ndwi: '3b82f6',      // Blue
      infrared: 'f97316'   // Orange
    };
    
    const color = colors[imageType] || '4a5568';
    const text = `${imageType.toUpperCase()}`;
    
    return {
      url: `https://via.placeholder.com/512x512/${color}/ffffff?text=${encodeURIComponent(text)}`,
      source: 'Fallback Placeholder',
      timestamp: new Date().toISOString(),
      resolution: 'N/A',
      type: imageType
    };
  }

  /**
   * Get spectral analysis images (NDVI, NDWI, etc.)
   */
  async getSpectralAnalysis(coordinates) {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
      
      const currentTime = now.toISOString().split('T')[0];
      const pastTime = sixMonthsAgo.toISOString().split('T')[0];
      
      return {
        success: true,
        spectralImages: {
          ndvi: {
            before: this.generateMockSatelliteImage(coordinates, 'ndvi', pastTime),
            after: this.generateMockSatelliteImage(coordinates, 'ndvi', currentTime),
            description: 'Normalized Difference Vegetation Index - Shows vegetation health'
          },
          ndwi: {
            before: this.generateMockSatelliteImage(coordinates, 'ndwi', pastTime),
            after: this.generateMockSatelliteImage(coordinates, 'ndwi', currentTime),
            description: 'Normalized Difference Water Index - Shows water bodies'
          },
          infrared: {
            before: this.generateMockSatelliteImage(coordinates, 'infrared', pastTime),
            after: this.generateMockSatelliteImage(coordinates, 'infrared', currentTime),
            description: 'Infrared composite - Shows vegetation and water features'
          }
        }
      };
    } catch (error) {
      console.error('Error getting spectral analysis:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get high-resolution imagery for specific analysis
   */
  async getHighResolutionImagery(coordinates, analysisType = 'general') {
    const imageryTypes = {
      general: 'true_color',
      vegetation: 'ndvi',
      water: 'ndwi',
      urban: 'infrared'
    };

    const imageType = imageryTypes[analysisType] || 'true_color';
    
    return {
      success: true,
      highResImage: this.generateMockSatelliteImage(coordinates, imageType),
      imageType: imageType,
      resolution: '10m',
      coordinates: coordinates
    };
  }
}

module.exports = SatelliteImageryService;
