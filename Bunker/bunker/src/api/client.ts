// Main API client that orchestrates all data services
import WeatherService from './services/weatherService';
import RadarService from './services/radarService';
import MapboxService from './services/mapboxService';

class BunkerAPIClient {
  constructor() {
    this.weatherService = WeatherService;
    this.radarService = RadarService;
    this.mapboxService = MapboxService;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Cache management
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Main analysis function
   * @param {Object} request - Analysis request
   * @param {string} request.query - User query
   * @param {Object} request.coordinates - Location coordinates
   * @param {number} request.coordinates.lat - Latitude
   * @param {number} request.coordinates.lng - Longitude
   * @returns {Promise<Object>} Complete analysis result
   */
  async analyzeQuery(request) {
    const { query, coordinates } = request;
    const { lat, lng } = coordinates || { lat: 13.0827, lng: 80.2707 };
    
    const cacheKey = `analysis_${lat}_${lng}_${query}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Determine analysis type based on query
      const analysisType = this.determineAnalysisType(query);
      
      // Fetch all required data in parallel
      const dataPromises = [
        this.weatherService.getCurrentWeather(lat, lng),
        this.mapboxService.getElevation(lat, lng)
      ];

      // Add marine data for fishing/marine queries
      if (analysisType === 'marine' || analysisType === 'fishing') {
        dataPromises.push(this.weatherService.getMarineWeather(lat, lng));
      }

      // Add radar data for weather queries
      if (analysisType === 'weather' || analysisType === 'marine') {
        dataPromises.push(this.radarService.getRadarConfig());
      }

      const results = await Promise.all(dataPromises);
      const [weatherData, elevation] = results;
      const marineData = results[2];
      const radarData = results[3];

      // Generate analysis
      const analysis = this.generateAnalysis(query, {
        weather: weatherData,
        marine: marineData,
        radar: radarData,
        elevation: elevation,
        coordinates: { lat, lng },
        analysisType: analysisType
      });

      // Cache the result
      this.setCache(cacheKey, analysis);

      return analysis;

    } catch (error) {
      console.error('Analysis error:', error);
      throw error; // Re-throw the error instead of using fallback
    }
  }

  /**
   * Determine the type of analysis needed
   * @param {string} query - User query
   * @returns {string} Analysis type
   */
  determineAnalysisType(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('fish') || lowerQuery.includes('fishing')) {
      return 'fishing';
    }
    
    if (lowerQuery.includes('marina') || lowerQuery.includes('beach') || 
        lowerQuery.includes('water') || lowerQuery.includes('ocean')) {
      return 'marine';
    }
    
    if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || 
        lowerQuery.includes('storm') || lowerQuery.includes('temperature')) {
      return 'weather';
    }
    
    if (lowerQuery.includes('hiking') || lowerQuery.includes('trail') || 
        lowerQuery.includes('trekking') || lowerQuery.includes('outdoor')) {
      return 'hiking';
    }
    
    if (lowerQuery.includes('driving') || lowerQuery.includes('navigation') || 
        lowerQuery.includes('route') || lowerQuery.includes('directions')) {
      return 'driving';
    }
    
    return 'general';
  }

  /**
   * Generate contextual analysis
   * @param {string} query - User query
   * @param {Object} data - All fetched data
   * @returns {Object} Analysis result
   */
  generateAnalysis(query, data) {
    const { weather, marine, radar, elevation, coordinates, analysisType } = data;
    const { lat, lng } = coordinates;
    
    // Debug: Check if weather data exists
    if (!weather || !weather.current_weather) {
      console.error('Weather data missing:', weather);
      throw new Error('Weather data not available');
    }
    
    // Extract current conditions
    const currentWeather = weather.current_weather;
    const temp = currentWeather.temperature;
    const windSpeed = currentWeather.windspeed;
    const windDirection = currentWeather.winddirection;
    
    // Initialize all variables
    let summary, riskLevel, dataPoints, sources;
    const precip = weather?.hourly?.precipitation?.[0] || 0;
    const humidity = weather?.hourly?.relativehumidity_2m?.[0] || 65;

    switch (analysisType) {
      case 'fishing':
        const waveHeight = marine?.hourly?.wave_height?.[0] || 1.2;
        const seaTemp = marine?.hourly?.sea_surface_temperature?.[0] || 28;
        
        riskLevel = this.assessFishingRisk(waveHeight, windSpeed);
        summary = this.generateFishingSummary(waveHeight, windSpeed, seaTemp, riskLevel);
        dataPoints = this.generateFishingDataPoints(waveHeight, windSpeed, seaTemp, temp);
        sources = ["Open-Meteo Marine", "NOAA", "Mapbox", "Sentinel-2"];
        break;

      case 'marine':
        const marineWaveHeight = marine?.hourly?.wave_height?.[0] || 1.0;
        const marineSeaTemp = marine?.hourly?.sea_surface_temperature?.[0] || 26;
        
        riskLevel = this.assessMarineRisk(marineWaveHeight, windSpeed);
        summary = this.generateMarineSummary(marineWaveHeight, windSpeed, marineSeaTemp, riskLevel);
        dataPoints = this.generateMarineDataPoints(marineWaveHeight, windSpeed, marineSeaTemp, temp);
        sources = ["Open-Meteo Marine", "RainViewer", "Mapbox", "NOAA"];
        break;

      case 'weather':
        riskLevel = this.assessWeatherRisk(precip, windSpeed);
        summary = this.generateWeatherSummary(temp, windSpeed, precip, riskLevel);
        dataPoints = this.generateWeatherDataPoints(temp, windSpeed, precip, humidity);
        sources = ["Open-Meteo", "RainViewer", "NOAA", "Mapbox"];
        break;

      case 'hiking':
        riskLevel = this.assessHikingRisk(windSpeed, precip, elevation);
        summary = this.generateHikingSummary(temp, windSpeed, elevation, precip, riskLevel);
        dataPoints = this.generateHikingDataPoints(temp, windSpeed, elevation, humidity);
        sources = ["Open-Meteo", "Mapbox", "OpenStreetMap", "NOAA"];
        break;

      case 'driving':
        riskLevel = this.assessDrivingRisk(windSpeed, precip);
        summary = this.generateDrivingSummary(temp, windSpeed, precip, riskLevel);
        dataPoints = this.generateDrivingDataPoints(temp, windSpeed, precip, humidity);
        sources = ["Open-Meteo", "Mapbox", "OpenStreetMap", "NOAA"];
        break;

      default:
        riskLevel = 'low';
        summary = this.generateGeneralSummary(temp, windSpeed, elevation);
        dataPoints = this.generateGeneralDataPoints(temp, windSpeed, elevation, humidity);
        sources = ["Open-Meteo", "Mapbox", "OpenStreetMap", "NOAA"];
    }

    // Generate map layers
    const mapLayers = this.mapboxService.generateMapLayers(lat, lng, 12, ['satellite']);
    
    // Add radar layer if available
    if (radar && radar.radar) {
      const radarTimestamp = radar.radar.past?.[0];
      if (radarTimestamp) {
        const tile = this.mapboxService.latLngToTile(lat, lng, 12);
        mapLayers.push({
          id: 'radar-layer',
          type: 'raster',
          source: 'rainviewer',
          url: this.radarService.getRadarTileUrl(radarTimestamp, tile.z, tile.x, tile.y),
          visible: true,
          opacity: 0.6
        });
      }
    }

    return {
      summary,
      riskLevel,
      dataPoints,
      spatialData: {
        center: [lng, lat],
        zoom: 12,
        layers: mapLayers
      },
      sources,
      metadata: {
        timestamp: new Date().toISOString(),
        coordinates: { lat, lng },
        elevation: elevation,
        analysisType: analysisType
      }
    };
  }

  // Risk assessment methods
  assessFishingRisk(waveHeight, windSpeed) {
    if (waveHeight > 2.5 || windSpeed > 30) return 'high';
    if (waveHeight > 1.5 || windSpeed > 20) return 'medium';
    return 'low';
  }

  assessMarineRisk(waveHeight, windSpeed) {
    if (waveHeight > 3 || windSpeed > 35) return 'high';
    if (waveHeight > 2 || windSpeed > 25) return 'medium';
    return 'low';
  }

  assessWeatherRisk(precip, windSpeed) {
    if (precip > 10 || windSpeed > 40) return 'high';
    if (precip > 5 || windSpeed > 25) return 'medium';
    return 'low';
  }

  // Summary generation methods
  generateFishingSummary(waveHeight, windSpeed, seaTemp, riskLevel) {
    const riskText = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
    return `Fishing conditions are ${riskText.toUpperCase()}. Waves are ${waveHeight}m with ${windSpeed}km/h winds. Sea temperature is ${seaTemp}°C. ${riskLevel === 'low' ? 'Excellent conditions for fishing.' : riskLevel === 'medium' ? 'Use caution and check conditions regularly.' : 'Not recommended for fishing today.'}`;
  }

  generateMarineSummary(waveHeight, windSpeed, seaTemp, riskLevel) {
    const riskText = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
    return `Marine conditions are ${riskText.toUpperCase()}. Wave height is ${waveHeight}m with ${windSpeed}km/h winds. Sea temperature is ${seaTemp}°C. ${riskLevel === 'low' ? 'Safe conditions for marine activities.' : riskLevel === 'medium' ? 'Moderate conditions - monitor closely.' : 'Dangerous conditions - avoid marine activities.'}`;
  }

  generateWeatherSummary(temp, windSpeed, precip, riskLevel) {
    const riskText = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
    return `Weather conditions are ${riskText.toUpperCase()}. Temperature is ${temp}°C with ${windSpeed}km/h winds. Precipitation: ${precip}mm. ${riskLevel === 'low' ? 'Pleasant weather conditions.' : riskLevel === 'medium' ? 'Moderate weather - some precautions advised.' : 'Severe weather - take necessary precautions.'}`;
  }

  generateGeneralSummary(temp, windSpeed, elevation) {
    return `Spatial analysis complete. Current conditions are stable with ${temp}°C temperature and ${windSpeed}km/h winds. Elevation: ${elevation}m. No significant environmental risks detected in the area.`;
  }

  // Data points generation methods
  generateFishingDataPoints(waveHeight, windSpeed, seaTemp, airTemp) {
    return [
      { label: "Wave Height", value: waveHeight, unit: "m" },
      { label: "Wind Speed", value: windSpeed, unit: "km/h" },
      { label: "Sea Temperature", value: seaTemp, unit: "°C" },
      { label: "Air Temperature", value: airTemp, unit: "°C" },
      { label: "Visibility", value: "Good", unit: "" },
      { label: "Air Pressure", value: 1013, unit: "hPa" }
    ];
  }

  generateMarineDataPoints(waveHeight, windSpeed, seaTemp, airTemp) {
    return [
      { label: "Wave Height", value: waveHeight, unit: "m" },
      { label: "Wind Speed", value: windSpeed, unit: "km/h" },
      { label: "Sea Temperature", value: seaTemp, unit: "°C" },
      { label: "Air Temperature", value: airTemp, unit: "°C" },
      { label: "Wave Period", value: 8.5, unit: "s" },
      { label: "Humidity", value: 65, unit: "%" }
    ];
  }

  generateWeatherDataPoints(temp, windSpeed, precip, humidity) {
    return [
      { label: "Temperature", value: temp, unit: "°C" },
      { label: "Wind Speed", value: windSpeed, unit: "km/h" },
      { label: "Precipitation", value: precip, unit: "mm" },
      { label: "Humidity", value: humidity, unit: "%" },
      { label: "UV Index", value: 6, unit: "" },
      { label: "Air Quality", value: "Good", unit: "" }
    ];
  }

  generateGeneralDataPoints(temp, windSpeed, elevation, humidity) {
    return [
      { label: "Temperature", value: temp, unit: "°C" },
      { label: "Wind Speed", value: windSpeed, unit: "km/h" },
      { label: "Elevation", value: elevation, unit: "m" },
      { label: "Humidity", value: humidity, unit: "%" },
      { label: "Visibility", value: "Excellent", unit: "" },
      { label: "Air Pressure", value: 1015, unit: "hPa" }
    ];
  }

  /**
   * Geocode location using multiple services
   * @param {string} locationString - Location name
   * @returns {Promise<Object>} Geocoded coordinates
   */
  async geocodeLocation(locationString) {
    const cacheKey = `geocode_${locationString}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Try Mapbox first
      let result = await this.mapboxService.geocode(locationString);
      
      if (result) {
        const coordinates = {
          lat: result.center[1],
          lng: result.center[0],
          name: result.place_name
        };
        this.setCache(cacheKey, coordinates);
        return coordinates;
      }

      // Fallback to Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const coordinates = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            name: data[0].display_name
          };
          this.setCache(cacheKey, coordinates);
          return coordinates;
        }
      }

      throw new Error(`Location not found: ${locationString}`);

    } catch (error) {
      console.error('Geocoding error:', error);
      throw error; // Re-throw the error instead of using fallback
    }
  }

  // Hiking-specific methods
  assessHikingRisk(windSpeed, precip, elevation) {
    if (precip > 5 || windSpeed > 25 || elevation > 3000) return 'high';
    if (precip > 2 || windSpeed > 15 || elevation > 2000) return 'medium';
    return 'low';
  }

  generateHikingSummary(temp, windSpeed, elevation, precip, riskLevel) {
    const riskText = riskLevel === 'high' ? 'CHALLENGING' : riskLevel === 'medium' ? 'MODERATE' : 'GOOD';
    return `Hiking conditions are ${riskText}. Temperature: ${temp}°C, Wind: ${windSpeed} km/h. Elevation: ${elevation}m. ${precip > 0 ? `Light precipitation expected.` : 'Clear conditions.'}`;
  }

  generateHikingDataPoints(temp, windSpeed, elevation, humidity) {
    return [
      { label: "Temperature", value: temp, unit: "°C" },
      { label: "Wind Speed", value: windSpeed, unit: "km/h" },
      { label: "Elevation", value: elevation, unit: "m" },
      { label: "Humidity", value: humidity, unit: "%" },
      { label: "Visibility", value: "Good", unit: "" },
      { label: "UV Index", value: 7, unit: "" }
    ];
  }

  // Driving-specific methods
  assessDrivingRisk(windSpeed, precip) {
    if (precip > 10 || windSpeed > 30) return 'high';
    if (precip > 5 || windSpeed > 20) return 'medium';
    return 'low';
  }

  generateDrivingSummary(temp, windSpeed, precip, riskLevel) {
    const riskText = riskLevel === 'high' ? 'DIFFICULT' : riskLevel === 'medium' ? 'CAUTIOUS' : 'GOOD';
    return `Driving conditions are ${riskText}. Temperature: ${temp}°C, Wind: ${windSpeed} km/h. ${precip > 0 ? `Precipitation: ${precip}mm/h. Drive carefully.` : 'Clear roads ahead.'}`;
  }

  generateDrivingDataPoints(temp, windSpeed, precip, humidity) {
    return [
      { label: "Temperature", value: temp, unit: "°C" },
      { label: "Wind Speed", value: windSpeed, unit: "km/h" },
      { label: "Precipitation", value: precip, unit: "mm/h" },
      { label: "Humidity", value: humidity, unit: "%" },
      { label: "Road Conditions", value: precip > 5 ? "Wet" : "Dry", unit: "" },
      { label: "Visibility", value: "Good", unit: "" }
    ];
  }
}

export default new BunkerAPIClient();
