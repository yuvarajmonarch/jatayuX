const axios = require('axios');

class HealthDataService {
  constructor() {
    // UV Index API
    this.uvIndexBaseUrl = 'https://api.openuv.io/api/v1/uv';
    this.uvIndexKey = 'demo'; // Demo key, use real key in production
    
    // Weather API for additional health metrics
    this.weatherApiKey = 'demo'; // Demo key
    
    this.demoMode = true;
  }

  /**
   * Get comprehensive health data for a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Health data
   */
  async getHealthData(lat, lng) {
    try {
      console.log(`🏥 Fetching health data for ${lat}, ${lng}`);
      
      const [uvData, humidityData, pressureData] = await Promise.all([
        this.getUVIndex(lat, lng),
        this.getHumidityImpact(lat, lng),
        this.getPressureImpact(lat, lng)
      ]);

      return {
        success: true,
        data: {
          uvIndex: uvData,
          humidity: humidityData,
          pressure: pressureData,
          overallHealthRisk: this.calculateOverallHealthRisk(uvData, humidityData, pressureData),
          timestamp: new Date().toISOString(),
          coordinates: { lat, lng }
        }
      };

    } catch (error) {
      console.error('Health data error:', error.message);
      return this.generateDemoHealthData(lat, lng);
    }
  }

  /**
   * Get UV Index data
   */
  async getUVIndex(lat, lng) {
    try {
      if (this.demoMode) {
        return this.generateDemoUVIndex(lat, lng);
      }

      const response = await axios.get(`${this.uvIndexBaseUrl}`, {
        params: {
          lat: lat,
          lng: lng,
          alt: 0
        },
        headers: {
          'x-access-token': this.uvIndexKey
        },
        timeout: 10000
      });

      const uvData = response.data.result;
      return {
        index: Math.round(uvData.uv),
        maxIndex: Math.round(uvData.uv_max),
        riskLevel: this.getUVRiskLevel(uvData.uv),
        safeExposureTime: this.calculateSafeExposureTime(uvData.uv),
        recommendations: this.getUVRecommendations(uvData.uv),
        source: 'OpenUV'
      };

    } catch (error) {
      console.error('UV Index API error:', error.message);
      return this.generateDemoUVIndex(lat, lng);
    }
  }

  /**
   * Get humidity impact data
   */
  async getHumidityImpact(lat, lng) {
    try {
      // Simulate humidity impact based on location and season
      const month = new Date().getMonth();
      const isCoastal = this.isCoastalArea(lat, lng);
      
      let humidity = isCoastal ? 75 + Math.random() * 15 : 45 + Math.random() * 25;
      
      // Seasonal adjustment
      if (month >= 5 && month <= 9) { // Monsoon season
        humidity += 15;
      }

      return {
        percentage: Math.round(humidity),
        impact: this.assessHumidityImpact(humidity),
        recommendations: this.getHumidityRecommendations(humidity),
        source: 'Calculated'
      };

    } catch (error) {
      console.error('Humidity data error:', error.message);
      return { percentage: 60, impact: 'Moderate', recommendations: [], source: 'Demo' };
    }
  }

  /**
   * Get atmospheric pressure impact
   */
  async getPressureImpact(lat, lng) {
    try {
      // Simulate pressure based on altitude and weather patterns
      const altitude = this.estimateAltitude(lat, lng);
      const basePressure = 1013.25 - (altitude * 0.12); // hPa decreases with altitude
      const pressure = basePressure + (Math.random() * 20 - 10); // Weather variation

      return {
        pressure: Math.round(pressure * 10) / 10,
        impact: this.assessPressureImpact(pressure),
        recommendations: this.getPressureRecommendations(pressure),
        source: 'Calculated'
      };

    } catch (error) {
      console.error('Pressure data error:', error.message);
      return { pressure: 1013, impact: 'Normal', recommendations: [], source: 'Demo' };
    }
  }

  /**
   * Generate demo UV Index data
   */
  generateDemoUVIndex(lat, lng) {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    
    // UV Index varies by time of day and season
    let baseUV = 3;
    if (hour >= 10 && hour <= 16) {
      baseUV += 3; // Peak hours
    }
    
    // Seasonal adjustment (higher in summer)
    if (month >= 3 && month <= 8) {
      baseUV += 2;
    }
    
    // Latitude adjustment (higher near equator)
    const latitude = Math.abs(lat);
    if (latitude < 15) baseUV += 2;
    else if (latitude < 25) baseUV += 1;

    const uvIndex = Math.min(11, baseUV + Math.random() * 2 - 1);
    
    return {
      index: Math.round(uvIndex * 10) / 10,
      maxIndex: Math.round((uvIndex + 1) * 10) / 10,
      riskLevel: this.getUVRiskLevel(uvIndex),
      safeExposureTime: this.calculateSafeExposureTime(uvIndex),
      recommendations: this.getUVRecommendations(uvIndex),
      source: 'Demo'
    };
  }

  /**
   * Generate demo health data
   */
  generateDemoHealthData(lat, lng) {
    const uvData = this.generateDemoUVIndex(lat, lng);
    const humidityData = {
      percentage: 60 + Math.random() * 20,
      impact: 'Moderate',
      recommendations: ['Stay hydrated', 'Use moisturizer if skin feels dry'],
      source: 'Demo'
    };
    const pressureData = {
      pressure: 1010 + Math.random() * 20,
      impact: 'Normal',
      recommendations: [],
      source: 'Demo'
    };

    return {
      success: true,
      data: {
        uvIndex: uvData,
        humidity: humidityData,
        pressure: pressureData,
        overallHealthRisk: this.calculateOverallHealthRisk(uvData, humidityData, pressureData),
        timestamp: new Date().toISOString(),
        coordinates: { lat, lng }
      }
    };
  }

  /**
   * Get UV risk level
   */
  getUVRiskLevel(uvIndex) {
    if (uvIndex <= 2) return { level: 'Low', color: 'green', description: 'Minimal risk' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'yellow', description: 'Some risk' };
    if (uvIndex <= 7) return { level: 'High', color: 'orange', description: 'High risk' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'red', description: 'Very high risk' };
    return { level: 'Extreme', color: 'purple', description: 'Extreme risk' };
  }

  /**
   * Calculate safe sun exposure time
   */
  calculateSafeExposureTime(uvIndex) {
    // Approximate safe exposure time in minutes for fair skin
    const safeTimes = {
      1: 67, 2: 33, 3: 22, 4: 17, 5: 13, 6: 11, 7: 10, 8: 8, 9: 7, 10: 7, 11: 6
    };
    
    const index = Math.min(11, Math.max(1, Math.round(uvIndex)));
    return safeTimes[index] || 5;
  }

  /**
   * Get UV recommendations
   */
  getUVRecommendations(uvIndex) {
    const recommendations = [];
    
    if (uvIndex <= 2) {
      recommendations.push('UV levels are low - minimal protection needed');
      recommendations.push('Wear sunglasses on bright days');
    } else if (uvIndex <= 5) {
      recommendations.push('Moderate UV levels - seek shade during midday hours');
      recommendations.push('Wear protective clothing and sunglasses');
      recommendations.push('Apply sunscreen with SPF 30+');
    } else if (uvIndex <= 7) {
      recommendations.push('High UV levels - reduce sun exposure between 10 AM and 4 PM');
      recommendations.push('Wear protective clothing, wide-brimmed hat, and sunglasses');
      recommendations.push('Apply sunscreen with SPF 30+ and reapply every 2 hours');
    } else if (uvIndex <= 10) {
      recommendations.push('Very high UV levels - avoid sun exposure between 10 AM and 4 PM');
      recommendations.push('Wear protective clothing, wide-brimmed hat, and sunglasses');
      recommendations.push('Apply sunscreen with SPF 50+ and reapply every 2 hours');
      recommendations.push('Seek shade whenever possible');
    } else {
      recommendations.push('Extreme UV levels - avoid sun exposure');
      recommendations.push('Stay indoors or in deep shade between 10 AM and 4 PM');
      recommendations.push('If outside, wear maximum protection including long sleeves, hat, and sunglasses');
      recommendations.push('Apply sunscreen with SPF 50+ and reapply every hour');
    }

    return recommendations;
  }

  /**
   * Assess humidity impact
   */
  assessHumidityImpact(humidity) {
    if (humidity < 30) return { level: 'Low', impact: 'Dry air may cause skin and respiratory irritation' };
    if (humidity < 50) return { level: 'Comfortable', impact: 'Ideal humidity level' };
    if (humidity < 70) return { level: 'Moderate', impact: 'Generally comfortable' };
    if (humidity < 85) return { level: 'High', impact: 'May feel muggy, increased risk of mold' };
    return { level: 'Very High', impact: 'Uncomfortable, high risk of mold and respiratory issues' };
  }

  /**
   * Get humidity recommendations
   */
  getHumidityRecommendations(humidity) {
    const recommendations = [];
    
    if (humidity < 30) {
      recommendations.push('Low humidity - use humidifier to add moisture to air');
      recommendations.push('Stay hydrated and use moisturizer');
      recommendations.push('Consider using saline nasal spray for dry nasal passages');
    } else if (humidity > 70) {
      recommendations.push('High humidity - use dehumidifier to reduce moisture');
      recommendations.push('Ensure proper ventilation in your home');
      recommendations.push('Watch for mold growth and address immediately');
      recommendations.push('People with respiratory conditions should be extra cautious');
    } else {
      recommendations.push('Humidity levels are comfortable');
      recommendations.push('Maintain current indoor humidity levels');
    }

    return recommendations;
  }

  /**
   * Assess pressure impact
   */
  assessPressureImpact(pressure) {
    if (pressure < 1000) return { level: 'Low', impact: 'May cause headaches and joint pain' };
    if (pressure < 1020) return { level: 'Normal', impact: 'Normal atmospheric conditions' };
    return { level: 'High', impact: 'May cause slight discomfort in sensitive individuals' };
  }

  /**
   * Get pressure recommendations
   */
  getPressureRecommendations(pressure) {
    const recommendations = [];
    
    if (pressure < 1000) {
      recommendations.push('Low pressure - stay hydrated and get adequate rest');
      recommendations.push('People with migraines should be prepared for potential triggers');
      recommendations.push('Consider gentle stretching for joint pain relief');
    } else if (pressure > 1020) {
      recommendations.push('High pressure - generally comfortable conditions');
      recommendations.push('Good time for outdoor activities');
    } else {
      recommendations.push('Normal pressure - comfortable conditions');
    }

    return recommendations;
  }

  /**
   * Calculate overall health risk
   */
  calculateOverallHealthRisk(uvData, humidityData, pressureData) {
    let riskScore = 0;
    
    // UV risk
    if (uvData.index > 7) riskScore += 3;
    else if (uvData.index > 5) riskScore += 2;
    else if (uvData.index > 3) riskScore += 1;
    
    // Humidity risk
    if (humidityData.percentage > 80) riskScore += 2;
    else if (humidityData.percentage < 30) riskScore += 1;
    
    // Pressure risk
    if (pressureData.pressure < 1000) riskScore += 1;

    if (riskScore <= 1) return { level: 'Low', color: 'green', score: riskScore };
    if (riskScore <= 3) return { level: 'Moderate', color: 'yellow', score: riskScore };
    if (riskScore <= 5) return { level: 'High', color: 'orange', score: riskScore };
    return { level: 'Very High', color: 'red', score: riskScore };
  }

  /**
   * Check if location is coastal
   */
  isCoastalArea(lat, lng) {
    // Major coastal areas in India
    const coastalAreas = [
      { lat: 13.0827, lng: 80.2707, radius: 30 }, // Chennai
      { lat: 19.0760, lng: 72.8777, radius: 20 }, // Mumbai
      { lat: 12.9141, lng: 74.8560, radius: 15 }, // Mangalore
      { lat: 8.5241, lng: 76.9366, radius: 20 },  // Trivandrum
      { lat: 9.9312, lng: 76.2673, radius: 15 },  // Kochi
    ];

    return coastalAreas.some(area => {
      const distance = this.calculateDistance(lat, lng, area.lat, area.lng);
      return distance <= area.radius;
    });
  }

  /**
   * Estimate altitude based on location
   */
  estimateAltitude(lat, lng) {
    // Simplified altitude estimation
    // In reality, you'd use a more sophisticated elevation service
    const baseAltitude = 100; // Base altitude in meters
    
    // Add some variation based on location
    const variation = Math.sin(lat * Math.PI / 180) * 500 + Math.cos(lng * Math.PI / 180) * 300;
    
    return Math.max(0, baseAltitude + variation);
  }

  /**
   * Calculate distance between coordinates
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
}

module.exports = new HealthDataService();
