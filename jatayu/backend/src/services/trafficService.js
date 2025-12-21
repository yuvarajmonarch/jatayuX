const axios = require('axios');

class TrafficService {
  constructor() {
    // For demo purposes, we'll simulate traffic data
    // In production, you'd integrate with services like Google Maps, TomTom, or HERE
    this.demoMode = true;
  }

  /**
   * Get traffic conditions for a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in kilometers (default: 10km)
   * @returns {Promise<Object>} Traffic data
   */
  async getTrafficConditions(lat, lng, radius = 10) {
    try {
      console.log(`🚦 Fetching traffic conditions for ${lat}, ${lng} (${radius}km radius)`);
      
      if (this.demoMode) {
        return this.generateDemoTrafficData(lat, lng, radius);
      }

      // Real traffic API integration would go here
      // Example: Google Maps Traffic API, TomTom Traffic API, etc.
      
    } catch (error) {
      console.error('Traffic API error:', error.message);
      return this.generateDemoTrafficData(lat, lng, radius);
    }
  }

  /**
   * Generate demo traffic data
   */
  generateDemoTrafficData(lat, lng, radius) {
    const currentHour = new Date().getHours();
    
    // Simulate traffic patterns based on time of day
    let baseCongestion;
    if (currentHour >= 7 && currentHour <= 9) {
      baseCongestion = Math.random() * 40 + 40; // 40-80% (morning rush)
    } else if (currentHour >= 17 && currentHour <= 19) {
      baseCongestion = Math.random() * 35 + 45; // 45-80% (evening rush)
    } else if (currentHour >= 22 || currentHour <= 5) {
      baseCongestion = Math.random() * 20 + 5; // 5-25% (night)
    } else {
      baseCongestion = Math.random() * 30 + 20; // 20-50% (normal hours)
    }

    const trafficLevels = [
      { name: 'Highway', congestion: Math.min(baseCongestion + Math.random() * 20 - 10, 100) },
      { name: 'Main Roads', congestion: Math.min(baseCongestion + Math.random() * 15 - 7, 100) },
      { name: 'Local Roads', congestion: Math.min(baseCongestion + Math.random() * 10 - 5, 100) }
    ];

    const incidents = this.generateTrafficIncidents();
    const roadConditions = this.generateRoadConditions();

    return {
      success: true,
      data: {
        overallCongestion: Math.round(baseCongestion),
        trafficLevel: this.getTrafficLevel(baseCongestion),
        routes: trafficLevels,
        incidents,
        roadConditions,
        timestamp: new Date().toISOString(),
        coordinates: { lat, lng },
        radius: radius
      }
    };
  }

  /**
   * Get traffic level description
   */
  getTrafficLevel(congestion) {
    if (congestion >= 80) return 'Heavy';
    if (congestion >= 60) return 'Moderate';
    if (congestion >= 40) return 'Light';
    return 'Free Flowing';
  }

  /**
   * Generate traffic incidents
   */
  generateTrafficIncidents() {
    const incidentTypes = [
      'Accident', 'Road Work', 'Construction', 'Weather', 'Event', 'Breakdown'
    ];
    
    const numIncidents = Math.floor(Math.random() * 4); // 0-3 incidents
    const incidents = [];

    for (let i = 0; i < numIncidents; i++) {
      incidents.push({
        type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
        severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        impact: ['Minor', 'Moderate', 'Major'][Math.floor(Math.random() * 3)],
        estimatedDelay: Math.floor(Math.random() * 45) + 5, // 5-50 minutes
        location: `${Math.random() * 5 + 1}km from center`
      });
    }

    return incidents;
  }

  /**
   * Generate road conditions
   */
  generateRoadConditions() {
    const conditions = ['Dry', 'Wet', 'Icy', 'Snowy', 'Flooded'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      surface: condition,
      visibility: Math.floor(Math.random() * 20) + 80, // 80-100%
      lighting: ['Good', 'Fair', 'Poor'][Math.floor(Math.random() * 3)]
    };
  }

  /**
   * Get route recommendations
   */
  async getRouteRecommendations(origin, destination) {
    try {
      console.log(`🗺️ Getting route recommendations from ${origin} to ${destination}`);
      
      // Demo route data
      const routes = [
        {
          name: 'Fastest Route',
          duration: Math.floor(Math.random() * 30) + 20, // 20-50 minutes
          distance: (Math.random() * 20 + 15).toFixed(1), // 15-35 km
          congestion: Math.floor(Math.random() * 40) + 30, // 30-70%
          tolls: Math.random() > 0.5 ? 'Yes' : 'No'
        },
        {
          name: 'Alternative Route',
          duration: Math.floor(Math.random() * 40) + 25, // 25-65 minutes
          distance: (Math.random() * 25 + 12).toFixed(1), // 12-37 km
          congestion: Math.floor(Math.random() * 30) + 20, // 20-50%
          tolls: 'No'
        }
      ];

      return {
        success: true,
        data: {
          routes,
          recommended: routes[0].congestion < routes[1].congestion ? 'Fastest Route' : 'Alternative Route',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Route recommendations error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get real-time traffic updates
   */
  async getRealTimeUpdates(lat, lng) {
    try {
      console.log(`🔄 Getting real-time traffic updates for ${lat}, ${lng}`);
      
      // Simulate real-time updates
      const updates = [
        {
          type: 'congestion_change',
          message: `Traffic congestion decreased by ${Math.floor(Math.random() * 15 + 5)}%`,
          severity: 'info',
          timestamp: new Date(Date.now() - Math.random() * 600000).toISOString() // Last 10 minutes
        },
        {
          type: 'incident_resolved',
          message: 'Previous accident on Highway 1 has been cleared',
          severity: 'success',
          timestamp: new Date(Date.now() - Math.random() * 1200000).toISOString() // Last 20 minutes
        }
      ];

      return {
        success: true,
        data: {
          updates,
          lastUpdated: new Date().toISOString(),
          coordinates: { lat, lng }
        }
      };

    } catch (error) {
      console.error('Real-time updates error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new TrafficService();
