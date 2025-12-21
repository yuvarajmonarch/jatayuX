const express = require('express');
const geocodeService = require('../services/geocodeService');
const weatherService = require('../services/weatherService');
const radarService = require('../services/radarService');
const geminiService = require('../services/geminiService');
const sentinelService = require('../services/sentinelService');
const trafficService = require('../services/trafficService');
const airQualityService = require('../services/airQualityService');
const healthDataService = require('../services/healthDataService');
const SatelliteImageryService = require('../services/satelliteImageryService');
const terraMindService = require('../services/terraMindService');

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze spatial data for a given query and location
 */
router.post('/', async (req, res) => {
  try {
    const { query, coordinates, areaData } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Query string is required'
      });
    }

    console.log(`🔍 Analyzing query: "${query}"`);
    
    // Log area data if provided
    if (areaData) {
      console.log(`🗺️ Area data provided: ${areaData.coordinates.length} points`);
      console.log(`📍 Area bounds:`, areaData.bounds);
    }

    let location = coordinates;
    
    // If no coordinates provided, try to extract location from query using enhanced geocoding
    if (!location) {
      const extractedLocation = geocodeService.extractLocationFromQuery(query);
      console.log(`🔍 Query: "${query}"`);
      console.log(`📍 Extracted location: "${extractedLocation}"`);
      
      if (extractedLocation) {
        try {
          // Use enhanced geocoding for better accuracy
          location = await geocodeService.enhancedGeocodeLocation(extractedLocation, {
            query_context: query,
            enable_nlp: true,
            require_validation: true
          });
          console.log(`✅ Enhanced geocoded: ${extractedLocation} → ${location.lat}, ${location.lng} (confidence: ${location.total_confidence})`);
          
          // Log NLP analysis results
          if (location.nlp_analysis) {
            console.log(`🧠 NLP Analysis Results:`, {
              extraction_confidence: location.nlp_analysis.confidence,
              locations_found: location.nlp_analysis.extracted_locations.length,
              suggestions: location.nlp_analysis.suggestions
            });
          }
          
        } catch (geocodeError) {
          console.log(`❌ Enhanced geocoding failed for: ${extractedLocation}, falling back to standard geocoding`);
          try {
            location = await geocodeService.geocodeLocation(extractedLocation);
            console.log(`✅ Fallback geocoded: ${extractedLocation} → ${location.lat}, ${location.lng}`);
          } catch (fallbackError) {
            console.log(`❌ Both geocoding methods failed for: ${extractedLocation}`);
            return res.status(404).json({
              error: 'Location Not Found',
              message: `Could not find coordinates for "${extractedLocation}". Please try a different location or provide coordinates.`,
              suggestions: [
                'Try being more specific (e.g., "Microsoft campus in Bangalore")',
                'Include city name and state',
                'Add building or landmark names',
                'Include postal code if known'
              ]
            });
          }
        }
      } else {
        return res.status(400).json({
          error: 'Location Required',
          message: 'No location found in query. Please specify a location or provide coordinates.'
        });
      }
    }

    const { lat, lng } = location;

    // Determine analysis type based on query
    const analysisType = determineAnalysisType(query);

    // Initialize satellite imagery service
    const satelliteImageryService = new SatelliteImageryService();

    // Fetch data in parallel
    console.log('📊 Fetching comprehensive spatial data...');
    const dataPromises = [
      weatherService.getCurrentWeather(lat, lng),
      weatherService.getMarineWeather(lat, lng).catch(() => null), // Optional
      radarService.getRadarConfig().catch(() => null), // Optional
      sentinelService.getSentinelData(lat, lng).catch(() => null), // Sentinel satellite data
      sentinelService.getLandCoverClassification(lat, lng).catch(() => null), // Land cover
      sentinelService.getChangeDetection(lat, lng, 365).catch(() => null), // Multi-temporal change detection
      trafficService.getTrafficConditions(lat, lng).catch(() => null), // Traffic data
      airQualityService.getAirQuality(lat, lng).catch(() => null), // Air quality data
      airQualityService.getPollenData(lat, lng).catch(() => null), // Pollen data
      healthDataService.getHealthData(lat, lng).catch(() => null), // Health data (UV, humidity, pressure)
      satelliteImageryService.getBeforeAfterImages(location).catch(() => null), // Satellite imagery
      satelliteImageryService.getSpectralAnalysis(location).catch(() => null), // Spectral analysis
    ];

    const [weatherData, marineData, radarData, sentinelData, landCoverData, changeDetectionData, trafficData, airQualityData, pollenData, healthData, satelliteImageryData, spectralAnalysisData] = await Promise.all(dataPromises);

    // NEW: TerraMind Geospatial Analysis (parallel with existing analysis)
    console.log('🧠 Running TerraMind geospatial analysis...');
    const terraMindAnalysis = await terraMindService.analyzeGeospatialData(
      query,
      {
        sentinelData,
        landCoverData,
        changeDetectionData,
        satelliteImageryData,
        spectralAnalysisData
      },
      location,
      analysisType
    ).catch(error => {
      console.warn('⚠️ TerraMind analysis failed, continuing without it:', error.message);
      return { success: false, reason: 'analysis_failed' };
    });

    // Generate AI analysis (existing Gemini functionality unchanged)
    console.log('🤖 Generating comprehensive AI analysis...');
    const aiAnalysis = await geminiService.generateAnalysis(
      query,
      weatherData,
      marineData,
      location,
      analysisType,
      sentinelData,
      landCoverData,
      changeDetectionData,
      trafficData,
      airQualityData,
      pollenData,
      healthData
    );

    // Generate data points
    const dataPoints = generateDataPoints(weatherData, marineData, analysisType, sentinelData, landCoverData, trafficData, airQualityData, pollenData, healthData);

    // Generate map layers
    const mapLayers = generateMapLayers(lat, lng, radarData, analysisType);

    // Build response with comprehensive satellite data + TerraMind insights
    const response = {
      summary: aiAnalysis.summary,
      riskLevel: aiAnalysis.riskLevel,
      dataPoints,
      spatialData: {
        center: [lng, lat],
        zoom: getZoomLevel(analysisType),
        layers: mapLayers
      },
      sources: terraMindAnalysis.success 
        ? ['Open-Meteo', 'RainViewer', 'NOAA', 'OpenStreetMap', 'Sentinel-2', 'Traffic APIs', 'Air Quality APIs', 'Health Data APIs', 'IBM TerraMind', 'ESA Copernicus AI']
        : ['Open-Meteo', 'RainViewer', 'NOAA', 'OpenStreetMap', 'Sentinel-2', 'Traffic APIs', 'Air Quality APIs', 'Health Data APIs'],
      metadata: {
        timestamp: new Date().toISOString(),
        coordinates: location,
        analysisType,
        recommendations: aiAnalysis.recommendations || [],
        keyInsights: aiAnalysis.keyInsights || [],
        // NEW: AI model information
        aiModels: terraMindAnalysis.success 
          ? ['Google Gemini 1.5 Flash', 'IBM TerraMind 1.0 Large']
          : ['Google Gemini 1.5 Flash'],
        multimodalAnalysis: terraMindAnalysis.success || false
      },
      // Include comprehensive satellite analysis data (existing)
      satelliteAnalysis: changeDetectionData?.data?.satelliteAnalysis || null,
      ndviVegetationAnalysis: changeDetectionData?.data?.ndviVegetationAnalysis || null,
      keyInsights: changeDetectionData?.data?.insights || aiAnalysis.keyInsights || [],
      changeDetectionData: changeDetectionData?.data || null,
      // Include satellite imagery data (existing)
      satelliteImagery: satelliteImageryData || null,
      spectralAnalysis: spectralAnalysisData || null,
      // NEW: Air quality and health data
      airQualityData: airQualityData || null,
      pollenData: pollenData || null,
      healthData: healthData || null,
      // NEW: TerraMind geospatial insights (only if available)
      terraMindInsights: terraMindAnalysis.success ? {
        landUseClassification: terraMindAnalysis.data.land_use_classification || null,
        vegetationHealth: terraMindAnalysis.data.vegetation_health || null,
        changeDetectionAI: terraMindAnalysis.data.change_detection || null,
        environmentalAssessment: terraMindAnalysis.data.environmental_assessment || null,
        geospatialInsights: terraMindAnalysis.data.geospatial_insights || [],
        confidence: terraMindAnalysis.confidence || 0.85,
        processingTime: terraMindAnalysis.metadata?.processing_time || null,
        model: terraMindAnalysis.model || 'TerraMind-1.0-large'
      } : null
    };

    console.log('✅ Analysis complete');
    res.json(response);

  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    
    res.status(500).json({
      error: 'Analysis Failed',
      message: error.message
    });
  }
});

/**
 * Determine analysis type from query
 */
function determineAnalysisType(query) {
  const lowerQuery = query.toLowerCase();
  
  // Water scarcity and environmental concerns - check before general water detection
  if (lowerQuery.includes('water scarcity') || lowerQuery.includes('water shortage') ||
      lowerQuery.includes('drought') || lowerQuery.includes('water availability') ||
      lowerQuery.includes('water crisis') || lowerQuery.includes('water problem')) {
    return 'water_scarcity';
  }
  
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
  
  if (lowerQuery.includes('air quality') || lowerQuery.includes('pollution') || 
      lowerQuery.includes('aqi') || lowerQuery.includes('smog')) {
    return 'air_quality';
  }
  
  return 'general';
}

/**
 * Generate data points based on analysis type
 */
function generateDataPoints(weatherData, marineData, analysisType, sentinelData, landCoverData, trafficData, airQualityData, pollenData, healthData) {
  const currentWeather = weatherData.current_weather;
  const temp = currentWeather.temperature;
  const windSpeed = currentWeather.windspeed;
  const humidity = weatherData.hourly?.relativehumidity_2m?.[0] || 65;
  const precip = weatherData.hourly?.precipitation?.[0] || 0;

  // Extract air quality data
  const aqi = airQualityData?.data?.aqi || null;
  const pm25 = airQualityData?.data?.pollutants?.pm25?.value || null;
  const uvIndex = healthData?.data?.uvIndex?.index || null;
  const pollenLevel = pollenData?.data?.level || null;

  const baseDataPoints = [
    { label: "Temperature", value: temp, unit: "°C" },
    { label: "Wind Speed", value: windSpeed, unit: "km/h" },
    { label: "Humidity", value: humidity, unit: "%" },
    { label: "Precipitation", value: precip, unit: "mm/h" }
  ];

  // Add air quality data if available
  if (aqi !== null) {
    baseDataPoints.push({ label: "Air Quality Index", value: aqi, unit: "AQI" });
  }
  if (pm25 !== null) {
    baseDataPoints.push({ label: "PM2.5", value: pm25, unit: "μg/m³" });
  }
  if (uvIndex !== null) {
    baseDataPoints.push({ label: "UV Index", value: uvIndex, unit: "" });
  }
  if (pollenLevel !== null) {
    baseDataPoints.push({ label: "Pollen Level", value: pollenLevel, unit: "" });
  }

  switch (analysisType) {
    case 'fishing':
      const waveHeight = marineData?.hourly?.wave_height?.[0] || 1.2;
      const seaTemp = marineData?.hourly?.sea_surface_temperature?.[0] || 28;
      return [
        { label: "Wave Height", value: waveHeight, unit: "m" },
        { label: "Wind Speed", value: windSpeed, unit: "km/h" },
        { label: "Sea Temperature", value: seaTemp, unit: "°C" },
        { label: "Air Temperature", value: temp, unit: "°C" },
        { label: "Visibility", value: "Good", unit: "" },
        { label: "Air Pressure", value: 1013, unit: "hPa" }
      ];

    case 'hiking':
      const vegetationHealth = sentinelData?.data?.vegetationHealth || 'Unknown';
      const ndvi = sentinelData?.data?.ndvi || '0.5';
      return [
        { label: "Temperature", value: temp, unit: "°C" },
        { label: "Wind Speed", value: windSpeed, unit: "km/h" },
        { label: "Humidity", value: humidity, unit: "%" },
        { label: "Precipitation", value: precip, unit: "mm/h" },
        { label: "Vegetation Health", value: vegetationHealth, unit: "" },
        { label: "NDVI", value: ndvi, unit: "" }
      ];

    case 'driving':
      const trafficLevel = trafficData?.data?.trafficLevel || 'Unknown';
      const congestion = trafficData?.data?.overallCongestion || 0;
      return [
        { label: "Temperature", value: temp, unit: "°C" },
        { label: "Wind Speed", value: windSpeed, unit: "km/h" },
        { label: "Precipitation", value: precip, unit: "mm/h" },
        { label: "Humidity", value: humidity, unit: "%" },
        { label: "Road Conditions", value: precip > 5 ? "Wet" : "Dry", unit: "" },
        { label: "Traffic Level", value: trafficLevel, unit: "" },
        { label: "Congestion", value: congestion, unit: "%" }
      ];

    case 'air_quality':
      const airQualityPoints = [
        { label: "Temperature", value: temp, unit: "°C" },
        { label: "Wind Speed", value: windSpeed, unit: "km/h" },
        { label: "Humidity", value: humidity, unit: "%" }
      ];
      
      if (aqi !== null) {
        airQualityPoints.push({ label: "Air Quality Index", value: aqi, unit: "AQI" });
        airQualityPoints.push({ 
          label: "Air Quality Level", 
          value: airQualityData?.data?.healthImpact?.level || 'Unknown', 
          unit: "" 
        });
      }
      if (pm25 !== null) {
        airQualityPoints.push({ label: "PM2.5", value: pm25, unit: "μg/m³" });
      }
      if (airQualityData?.data?.pollutants?.no2?.value !== null) {
        airQualityPoints.push({ 
          label: "NO2", 
          value: airQualityData.data.pollutants.no2.value, 
          unit: "μg/m³" 
        });
      }
      if (uvIndex !== null) {
        airQualityPoints.push({ label: "UV Index", value: uvIndex, unit: "" });
      }
      if (pollenLevel !== null) {
        airQualityPoints.push({ label: "Pollen Level", value: pollenLevel, unit: "" });
      }
      
      return airQualityPoints;

    default:
      return baseDataPoints;
  }
}

/**
 * Generate map layers based on analysis type and available data
 */
function generateMapLayers(lat, lng, radarData, analysisType) {
  const layers = [];

  // Base satellite layer
  layers.push({
    id: "satellite-imagery",
    type: "raster",
    source: "satellite",
    url: "https://tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png",
    visible: true
  });

  // Add radar layer if available
  if (radarData && radarData.radar && radarData.radar.past && radarData.radar.past.length > 0) {
    const radarTimestamp = radarData.radar.past[0];
    layers.push({
      id: "radar-overlay",
      type: "raster",
      source: "radar",
      url: `https://tilecache.rainviewer.com/v2/radar/${radarTimestamp}/256/{z}/{x}/{y}/1/1_1.png`,
      visible: analysisType === 'weather',
      opacity: 0.6
    });
  }

  return layers;
}

/**
 * Get appropriate zoom level for analysis type
 */
function getZoomLevel(analysisType) {
  switch (analysisType) {
    case 'fishing':
    case 'marine':
      return 12; // Good for water features
    case 'hiking':
      return 11; // Good for terrain
    case 'driving':
      return 10; // Good for roads
    case 'weather':
      return 9; // Good for regional weather
    default:
      return 11; // Balanced view
  }
}

module.exports = router;
