const axios = require('axios');

class AirQualityService {
  constructor() {
    // OpenAQ API for air quality data
    this.openaqBaseUrl = 'https://api.openaq.org/v2/measurements';
    this.aqicnBaseUrl = 'https://api.waqi.info/feed';
    this.aqicnToken = 'demo'; // Using demo token, in production use real token
    
    // Fallback data for demo purposes
    this.demoMode = true;
  }

  /**
   * Get air quality data for a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Air quality data
   */
  async getAirQuality(lat, lng) {
    try {
      console.log(`🌬️ Fetching air quality data for ${lat}, ${lng}`);
      
      if (this.demoMode) {
        return this.generateDemoAirQuality(lat, lng);
      }

      // Try OpenAQ first
      const openAQData = await this.getOpenAQData(lat, lng);
      if (openAQData && openAQData.success) {
        return openAQData;
      }

      // Fallback to AQICN
      const aqicnData = await this.getAQICNData(lat, lng);
      if (aqicnData && aqicnData.success) {
        return aqicnData;
      }

      // If both fail, return demo data
      return this.generateDemoAirQuality(lat, lng);

    } catch (error) {
      console.error('Air quality API error:', error.message);
      return this.generateDemoAirQuality(lat, lng);
    }
  }

  /**
   * Get data from OpenAQ API
   */
  async getOpenAQData(lat, lng) {
    try {
      const response = await axios.get(this.openaqBaseUrl, {
        params: {
          coordinates: `${lat},${lng}`,
          radius: 25000, // 25km radius
          limit: 100,
          order_by: 'datetime',
          sort: 'desc'
        },
        timeout: 10000
      });

      if (!response.data || !response.data.results || response.data.results.length === 0) {
        return { success: false };
      }

      const measurements = response.data.results;
      const latestMeasurements = this.processOpenAQMeasurements(measurements);

      return {
        success: true,
        data: {
          ...latestMeasurements,
          timestamp: new Date().toISOString(),
          coordinates: { lat, lng },
          source: 'OpenAQ'
        }
      };

    } catch (error) {
      console.error('OpenAQ API error:', error.message);
      return { success: false };
    }
  }

  /**
   * Get data from AQICN API
   */
  async getAQICNData(lat, lng) {
    try {
      const response = await axios.get(`${this.aqicnBaseUrl}/geo:${lat};${lng}/`, {
        params: {
          token: this.aqicnToken
        },
        timeout: 10000
      });

      if (!response.data || response.data.status !== 'ok') {
        return { success: false };
      }

      const aqiData = response.data.data;
      const processedData = this.processAQICNData(aqiData);

      return {
        success: true,
        data: {
          ...processedData,
          timestamp: new Date().toISOString(),
          coordinates: { lat, lng },
          source: 'AQICN'
        }
      };

    } catch (error) {
      console.error('AQICN API error:', error.message);
      return { success: false };
    }
  }

  /**
   * Process OpenAQ measurements
   */
  processOpenAQMeasurements(measurements) {
    const latest = {};
    const pollutants = {};

    // Group by pollutant and get latest measurement
    measurements.forEach(measurement => {
      const pollutant = measurement.parameter;
      const value = measurement.value;
      const date = new Date(measurement.date.utc);

      if (!latest[pollutant] || new Date(latest[pollutant].date) < date) {
        latest[pollutant] = { value, date, unit: measurement.unit };
      }
    });

    // Calculate AQI and health impact
    const pm25 = latest.pm25?.value || 0;
    const pm10 = latest.pm10?.value || 0;
    const no2 = latest.no2?.value || 0;
    const o3 = latest.o3?.value || 0;
    const co = latest.co?.value || 0;

    const aqi = this.calculateAQI(pm25, pm10, no2, o3);
    const healthImpact = this.assessHealthImpact(aqi);

    return {
      aqi: aqi,
      healthImpact: healthImpact,
      pollutants: {
        pm25: { value: pm25, unit: 'μg/m³', level: this.getPollutantLevel('pm25', pm25) },
        pm10: { value: pm10, unit: 'μg/m³', level: this.getPollutantLevel('pm10', pm10) },
        no2: { value: no2, unit: 'μg/m³', level: this.getPollutantLevel('no2', no2) },
        o3: { value: o3, unit: 'μg/m³', level: this.getPollutantLevel('o3', o3) },
        co: { value: co, unit: 'mg/m³', level: this.getPollutantLevel('co', co) }
      },
      rawMeasurements: latest
    };
  }

  /**
   * Process AQICN data
   */
  processAQICNData(aqiData) {
    const aqi = aqiData.aqi;
    const iaqi = aqiData.iaqi || {};
    
    return {
      aqi: aqi,
      healthImpact: this.assessHealthImpact(aqi),
      pollutants: {
        pm25: { 
          value: iaqi.pm25?.v || 0, 
          unit: 'μg/m³', 
          level: this.getPollutantLevel('pm25', iaqi.pm25?.v || 0) 
        },
        pm10: { 
          value: iaqi.pm10?.v || 0, 
          unit: 'μg/m³', 
          level: this.getPollutantLevel('pm10', iaqi.pm10?.v || 0) 
        },
        no2: { 
          value: iaqi.no2?.v || 0, 
          unit: 'μg/m³', 
          level: this.getPollutantLevel('no2', iaqi.no2?.v || 0) 
        },
        o3: { 
          value: iaqi.o3?.v || 0, 
          unit: 'μg/m³', 
          level: this.getPollutantLevel('o3', iaqi.o3?.v || 0) 
        }
      },
      station: {
        name: aqiData.city?.name || 'Unknown',
        url: aqiData.city?.url || ''
      }
    };
  }

  /**
   * Calculate Air Quality Index
   */
  calculateAQI(pm25, pm10, no2, o3) {
    // Simplified AQI calculation based on PM2.5 (most critical for health)
    if (pm25 <= 12) return Math.round(50 * (pm25 / 12));
    if (pm25 <= 35.4) return Math.round(51 + 49 * ((pm25 - 12.1) / (35.4 - 12.1)));
    if (pm25 <= 55.4) return Math.round(101 + 49 * ((pm25 - 35.5) / (55.4 - 35.5)));
    if (pm25 <= 150.4) return Math.round(151 + 99 * ((pm25 - 55.5) / (150.4 - 55.5)));
    return Math.min(500, Math.round(201 + 299 * ((pm25 - 150.5) / (250.4 - 150.5))));
  }

  /**
   * Assess health impact based on AQI
   */
  assessHealthImpact(aqi) {
    if (aqi <= 50) return { level: 'Good', color: 'green', description: 'Air quality is satisfactory' };
    if (aqi <= 100) return { level: 'Moderate', color: 'yellow', description: 'Sensitive people may experience minor issues' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: 'orange', description: 'Children and people with breathing problems should limit outdoor activities' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'red', description: 'Everyone may experience health effects' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'purple', description: 'Health warnings of emergency conditions' };
    return { level: 'Hazardous', color: 'maroon', description: 'Everyone should avoid outdoor activities' };
  }

  /**
   * Get pollutant level description
   */
  getPollutantLevel(pollutant, value) {
    const thresholds = {
      pm25: { good: 12, moderate: 35, unhealthy: 55, very_unhealthy: 150 },
      pm10: { good: 54, moderate: 154, unhealthy: 254, very_unhealthy: 354 },
      no2: { good: 53, moderate: 100, unhealthy: 360, very_unhealthy: 649 },
      o3: { good: 54, moderate: 70, unhealthy: 85, very_unhealthy: 105 },
      co: { good: 4.4, moderate: 9.4, unhealthy: 12.4, very_unhealthy: 15.4 }
    };

    const threshold = thresholds[pollutant];
    if (!threshold) return 'Unknown';

    if (value <= threshold.good) return 'Good';
    if (value <= threshold.moderate) return 'Moderate';
    if (value <= threshold.unhealthy) return 'Unhealthy';
    if (value <= threshold.very_unhealthy) return 'Very Unhealthy';
    return 'Hazardous';
  }

  /**
   * Generate demo air quality data
   */
  generateDemoAirQuality(lat, lng) {
    // Simulate realistic air quality based on location and time
    const hour = new Date().getHours();
    const isUrban = this.isUrbanArea(lat, lng);
    
    // Higher pollution in urban areas and during rush hours
    let basePM25 = isUrban ? 25 : 15;
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      basePM25 += 10; // Rush hour increase
    }

    const pm25 = basePM25 + Math.random() * 10 - 5; // Add some variation
    const pm10 = pm25 * 1.5 + Math.random() * 5;
    const no2 = 20 + Math.random() * 30;
    const o3 = 40 + Math.random() * 20;
    const co = 1.2 + Math.random() * 0.8;

    const aqi = this.calculateAQI(pm25, pm10, no2, o3);
    const healthImpact = this.assessHealthImpact(aqi);

    return {
      success: true,
      data: {
        aqi: Math.round(aqi),
        healthImpact: healthImpact,
        pollutants: {
          pm25: { value: Math.round(pm25 * 10) / 10, unit: 'μg/m³', level: this.getPollutantLevel('pm25', pm25) },
          pm10: { value: Math.round(pm10 * 10) / 10, unit: 'μg/m³', level: this.getPollutantLevel('pm10', pm10) },
          no2: { value: Math.round(no2 * 10) / 10, unit: 'μg/m³', level: this.getPollutantLevel('no2', no2) },
          o3: { value: Math.round(o3 * 10) / 10, unit: 'μg/m³', level: this.getPollutantLevel('o3', o3) },
          co: { value: Math.round(co * 10) / 10, unit: 'mg/m³', level: this.getPollutantLevel('co', co) }
        },
        timestamp: new Date().toISOString(),
        coordinates: { lat, lng },
        source: 'Demo',
        recommendations: this.getAirQualityRecommendations(aqi, healthImpact.level)
      }
    };
  }

  /**
   * Check if location is in urban area
   */
  isUrbanArea(lat, lng) {
    // Major urban centers in India
    const urbanCenters = [
      { lat: 13.0827, lng: 80.2707, radius: 50 }, // Chennai
      { lat: 12.9716, lng: 77.5946, radius: 50 }, // Bangalore
      { lat: 19.0760, lng: 72.8777, radius: 50 }, // Mumbai
      { lat: 28.7041, lng: 77.1025, radius: 50 }, // Delhi
      { lat: 17.3850, lng: 78.4867, radius: 50 }, // Hyderabad
    ];

    return urbanCenters.some(center => {
      const distance = this.calculateDistance(lat, lng, center.lat, center.lng);
      return distance <= center.radius;
    });
  }

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get air quality recommendations
   */
  getAirQualityRecommendations(aqi, level) {
    const recommendations = [];

    if (level === 'Good' || level === 'Moderate') {
      recommendations.push('Air quality is good for outdoor activities');
      recommendations.push('Suitable for people with respiratory conditions');
    } else if (level === 'Unhealthy for Sensitive') {
      recommendations.push('Children and people with breathing problems should limit outdoor activities');
      recommendations.push('Consider wearing a mask if you have respiratory issues');
    } else if (level === 'Unhealthy') {
      recommendations.push('Everyone may experience health effects');
      recommendations.push('Avoid outdoor activities, especially exercise');
      recommendations.push('Keep windows closed and use air purifiers');
    } else {
      recommendations.push('Health warnings - avoid all outdoor activities');
      recommendations.push('Stay indoors with windows closed');
      recommendations.push('Use air purifiers and N95 masks if going outside is necessary');
    }

    return recommendations;
  }

  /**
   * Get pollen data (simulated for demo)
   */
  async getPollenData(lat, lng) {
    try {
      console.log(`🌸 Fetching pollen data for ${lat}, ${lng}`);
      
      // Simulate pollen levels based on season and location
      const month = new Date().getMonth();
      const isUrban = this.isUrbanArea(lat, lng);
      
      let treePollen = 0;
      let grassPollen = 0;
      let weedPollen = 0;

      // Seasonal variations
      if (month >= 2 && month <= 5) { // Spring
        treePollen = isUrban ? 3 + Math.random() * 4 : 5 + Math.random() * 5;
      } else if (month >= 5 && month <= 8) { // Summer
        grassPollen = isUrban ? 4 + Math.random() * 4 : 6 + Math.random() * 4;
      } else if (month >= 8 && month <= 11) { // Fall
        weedPollen = isUrban ? 3 + Math.random() * 5 : 5 + Math.random() * 5;
      }

      const totalPollen = treePollen + grassPollen + weedPollen;
      const pollenLevel = totalPollen < 3 ? 'Low' : totalPollen < 6 ? 'Moderate' : totalPollen < 9 ? 'High' : 'Very High';

      return {
        success: true,
        data: {
          level: pollenLevel,
          tree: Math.round(treePollen * 10) / 10,
          grass: Math.round(grassPollen * 10) / 10,
          weed: Math.round(weedPollen * 10) / 10,
          total: Math.round(totalPollen * 10) / 10,
          timestamp: new Date().toISOString(),
          coordinates: { lat, lng },
          source: 'Demo',
          recommendations: this.getPollenRecommendations(pollenLevel)
        }
      };

    } catch (error) {
      console.error('Pollen data error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get pollen recommendations
   */
  getPollenRecommendations(level) {
    const recommendations = [];

    if (level === 'Low') {
      recommendations.push('Pollen levels are low - suitable for outdoor activities');
    } else if (level === 'Moderate') {
      recommendations.push('Pollen levels are moderate - sensitive individuals may experience symptoms');
      recommendations.push('Consider taking antihistamines if you have allergies');
    } else if (level === 'High') {
      recommendations.push('High pollen levels - avoid outdoor activities if you have allergies');
      recommendations.push('Keep windows closed and use air conditioning');
      recommendations.push('Shower after being outdoors to remove pollen');
    } else {
      recommendations.push('Very high pollen levels - stay indoors if possible');
      recommendations.push('Use HEPA air purifiers and keep all windows closed');
      recommendations.push('Consider wearing a mask if you must go outside');
    }

    return recommendations;
  }
}

module.exports = new AirQualityService();
