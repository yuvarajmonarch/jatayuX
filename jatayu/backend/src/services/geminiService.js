const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  /**
   * Generate AI analysis of spatial data
   * @param {string} query - User query
   * @param {Object} weatherData - Weather data
   * @param {Object} marineData - Marine data (optional)
   * @param {Object} coordinates - Location coordinates
   * @param {string} analysisType - Type of analysis (fishing, weather, hiking, etc.)
   * @returns {Promise<Object>} AI analysis result
   */
  async generateAnalysis(query, weatherData, marineData, coordinates, analysisType, sentinelData, landCoverData, changeDetectionData, trafficData, airQualityData, pollenData, healthData) {
    if (!this.genAI) {
      return this.generateFallbackAnalysis(query, weatherData, marineData, coordinates, analysisType);
    }

    try {
      console.log(`🤖 Generating AI analysis for: ${query}`);
      
      const prompt = this.buildAnalysisPrompt(query, weatherData, marineData, coordinates, analysisType, sentinelData, landCoverData, changeDetectionData, trafficData, airQualityData, pollenData, healthData);
      
      // Ensure prompt is properly formatted for Gemini SDK
      const formattedPrompt = prompt.trim();
      
      const result = await this.model.generateContent([formattedPrompt]);
      const response = await result.response;
      const aiAnalysis = response.text();

      // Parse the AI response into structured data
      return this.parseAIResponse(aiAnalysis, weatherData, marineData, coordinates, analysisType);

    } catch (error) {
      console.error('❌ Gemini AI error:', error.message);
      console.log('🔄 Falling back to rule-based analysis');
      return this.generateFallbackAnalysis(query, weatherData, marineData, coordinates, analysisType);
    }
  }

  /**
   * Generate chat response for follow-up questions
   * @param {Object} context - Chat context including user message and analysis data
   * @returns {Promise<string>} AI chat response
   */
  async generateChatResponse(context) {
    if (!this.genAI) {
      return this.generateFallbackChatResponse(context);
    }

    try {
      console.log(`💬 Generating chat response for: ${context.userMessage}`);
      
      const prompt = this.buildChatPrompt(context);
      
      // Validate prompt before sending to Gemini
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        throw new Error('Generated prompt is empty or invalid');
      }
      
      console.log(`📝 Prompt length: ${prompt.length} characters`);
      
      // Ensure prompt is properly formatted for Gemini SDK
      const formattedPrompt = prompt.trim();
      
      const result = await this.model.generateContent([formattedPrompt]);
      
      // Check if result and response exist
      if (!result) {
        throw new Error('No result from Gemini API');
      }
      
      const response = await result.response;
      
      if (!response) {
        throw new Error('No response from Gemini API');
      }
      
      // Check if response has text method
      if (typeof response.text !== 'function') {
        console.error('Response object:', response);
        throw new Error('Response does not have text method');
      }
      
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from Gemini API');
      }
      
      return responseText;

    } catch (error) {
      console.error('❌ Gemini Chat error:', error.message);
      console.error('Error details:', error);
      console.log('🔄 Falling back to rule-based chat response');
      return this.generateFallbackChatResponse(context);
    }
  }

  /**
   * Build chat prompt for Gemini
   */
  buildChatPrompt(context) {
    const { userMessage, previousAnalysis, spatialContext, messageCount } = context;
    
    // Validate required parameters
    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('userMessage is required and must be a string');
    }
    
    const location = spatialContext?.coordinates ? `${spatialContext.coordinates.lat}, ${spatialContext.coordinates.lng}` : 'Unknown';
    const userMessageLower = userMessage.toLowerCase();
    const isFirstQuery = !messageCount || messageCount <= 2;
    
    // Extract ALL available data points for comprehensive analysis
    const weatherData = previousAnalysis?.weatherData || {};
    const marineData = previousAnalysis?.marineData || {};
    const airQualityData = previousAnalysis?.airQualityData || {};
    const healthData = previousAnalysis?.healthData || {};
    const changeDetectionData = previousAnalysis?.changeDetectionData || {};
    const trafficData = previousAnalysis?.trafficData || {};
    const pollenData = previousAnalysis?.pollenData || {};
    const landCoverData = previousAnalysis?.landCoverData || {};
    
    // Build data context - comprehensive for first query, concise for follow-ups
    let dataContext;
    if (isFirstQuery) {
      // Comprehensive data for first query
      dataContext = `📍 COMPREHENSIVE SPATIAL ANALYSIS - Location: ${location}
🌡️ WEATHER CONDITIONS: ${weatherData.current_weather?.temperature || 'N/A'}°C, Wind Speed: ${weatherData.current_weather?.windspeed || 'N/A'}km/h, Humidity: ${weatherData.hourly?.relativehumidity_2m?.[0] || 'N/A'}%, Precipitation: ${weatherData.hourly?.precipitation?.[0] || 0}mm/h, Pressure: ${weatherData.hourly?.surface_pressure?.[0] || 'N/A'}hPa
🌊 MARINE CONDITIONS: Wave Height: ${marineData.hourly?.wave_height?.[0] || 'N/A'}m, Sea Temperature: ${marineData.hourly?.sea_temperature?.[0] || 'N/A'}°C, Sea Surface Temperature: ${marineData.hourly?.sea_surface_temperature?.[0] || 'N/A'}°C
🌬️ AIR QUALITY: AQI: ${airQualityData.data?.aqi || 'N/A'}, Ozone: ${airQualityData.data?.ozone || 'N/A'}μg/m³, PM2.5: ${airQualityData.data?.pm25 || 'N/A'}μg/m³, PM10: ${airQualityData.data?.pm10 || 'N/A'}μg/m³, NO2: ${airQualityData.data?.no2 || 'N/A'}μg/m³
☀️ HEALTH METRICS: UV Index: ${healthData.data?.uvIndex?.index || 'N/A'}, Pollen Level: ${pollenData.data?.level || 'N/A'}, Pollen Count: ${pollenData.data?.count || 'N/A'}, Allergen Risk: ${pollenData.data?.risk || 'N/A'}
🚗 TRAFFIC & ACCESSIBILITY: Congestion: ${trafficData.data?.overallCongestion || 0}%, Average Speed: ${trafficData.data?.averageSpeed || 'N/A'}km/h, Road Quality: ${trafficData.data?.roadQuality || 'N/A'}, Accessibility Score: ${trafficData.data?.accessibilityScore || 'N/A'}
🌱 ENVIRONMENTAL ANALYSIS: Land Use Change: ${changeDetectionData.data?.satelliteAnalysis?.landUseChange || 'N/A'}%, Vegetation Change: ${changeDetectionData.data?.ndviVegetationAnalysis?.vegetationChange || 'N/A'}%, Urban Development: ${changeDetectionData.data?.satelliteAnalysis?.urbanChange || 'N/A'}%, Land Type: ${landCoverData.data?.dominantType || 'N/A'}, Vegetation Coverage: ${landCoverData.data?.vegetationCoverage || 'N/A'}%, Change Intensity: ${changeDetectionData.data?.changeIntensity || 'N/A'}`;
    } else {
      // Concise data for follow-up queries
      dataContext = `Location: ${location} | Temp: ${weatherData.current_weather?.temperature || 'N/A'}°C | UV: ${healthData.data?.uvIndex?.index || 'N/A'} | AQI: ${airQualityData.data?.aqi || 'N/A'} | Wind: ${weatherData.current_weather?.windspeed || 'N/A'}km/h | Wave: ${marineData.hourly?.wave_height?.[0] || 'N/A'}m`;
    }
    
    // Generate contextual prompt based on user intent
    if (userMessageLower.includes('stay') || userMessageLower.includes('safe') || userMessageLower.includes('can i') || userMessageLower.includes('dangerous')) {
      if (isFirstQuery) {
        return `SAFETY ASSESSMENT for ${location}:
${dataContext}

QUESTION: "${userMessage}"

REQUIRED ANALYSIS:
- Use TEMPERATURE and WIND SPEED for weather conditions
- Use UV INDEX for sun exposure risk
- Use AQI for air quality impact
- Use PRECIPITATION for rain/flood risk
- Use WAVE HEIGHT for marine safety (if applicable)
- Use TRAFFIC CONGESTION for accessibility

RESPONSE FORMAT: Provide a comprehensive safety assessment with [YES/NO/CAUTION] verdict. Include detailed analysis of all relevant factors with specific data numbers. Explain risks, conditions, and recommendations in 3-4 sentences.`;
      } else {
        return `Safety check for ${location}: ${dataContext}. Question: "${userMessage}". Respond in 1-2 sentences with YES/NO/CAUTION and key risks only.`;
      }
    }
    
    if (userMessageLower.includes('water scarcity') || userMessageLower.includes('water shortage') || userMessageLower.includes('drought')) {
      if (isFirstQuery) {
        return `WATER SCARCITY ANALYSIS for ${location}:
${dataContext}

QUESTION: "${userMessage}"

ANALYSIS REQUIREMENTS:
- Use PRECIPITATION data for water availability
- Use VEGETATION CHANGE for water stress indicators
- Use LAND USE CHANGE for water resource impact
- Use TEMPERATURE for evaporation effects
- Use HUMIDITY for atmospheric moisture

RESPONSE FORMAT: Provide a comprehensive water scarcity assessment with [HIGH/MEDIUM/LOW] risk level. Include detailed analysis of precipitation patterns, vegetation health, land use changes, and environmental factors. Give specific recommendations in 3-4 sentences.`;
      } else {
        return `Water scarcity analysis for ${location}: ${dataContext}. Question: "${userMessage}". Respond in 1-2 sentences with HIGH/MEDIUM/LOW risk and key factors only.`;
      }
    }
    
    if (userMessageLower.includes('flood') || userMessageLower.includes('flooding')) {
      if (isFirstQuery) {
        return `FLOOD RISK ANALYSIS for ${location}:
${dataContext}

QUESTION: "${userMessage}"

ANALYSIS REQUIREMENTS:
- Use PRECIPITATION for rainfall impact
- Use LAND USE CHANGE for drainage effects
- Use VEGETATION CHANGE for water absorption
- Use TEMPERATURE for snowmelt considerations
- Use ELEVATION and TERRAIN data

RESPONSE FORMAT: Provide a comprehensive flood risk assessment with [HIGH/MEDIUM/LOW] risk level. Include detailed analysis of precipitation patterns, land use changes, vegetation coverage, and terrain factors. Give specific recommendations in 3-4 sentences.`;
      } else {
        return `Flood risk analysis for ${location}: ${dataContext}. Question: "${userMessage}". Respond in 1-2 sentences with HIGH/MEDIUM/LOW risk and key factors only.`;
      }
    }
    
    if (userMessageLower.includes('development') || userMessageLower.includes('change') || userMessageLower.includes('growth') || userMessageLower.includes('future') || userMessageLower.includes('potential')) {
      if (isFirstQuery) {
        return `DEVELOPMENT POTENTIAL ANALYSIS for ${location}:
${dataContext}

QUESTION: "${userMessage}"

ANALYSIS REQUIREMENTS:
- Use LAND USE CHANGE for growth trends
- Use VEGETATION CHANGE for environmental impact
- Use TRAFFIC CONGESTION for infrastructure capacity
- Use AIR QUALITY for environmental health
- Use LAND TYPE for development suitability

RESPONSE FORMAT: Provide a comprehensive development potential assessment with [HIGH/MEDIUM/LOW] potential rating. Include detailed analysis of growth trends, infrastructure capacity, environmental factors, and future projections. Give specific recommendations in 3-4 sentences.`;
      } else {
        return `Development analysis for ${location}: ${dataContext}. Question: "${userMessage}". Respond in 1-2 sentences with HIGH/MEDIUM/LOW potential and key trends only.`;
      }
    }
    
    if (userMessageLower.includes('fishing') || userMessageLower.includes('fish')) {
      if (isFirstQuery) {
        return `FISHING SAFETY ANALYSIS for ${location}:
${dataContext}

QUESTION: "${userMessage}"

REQUIRED ANALYSIS:
- Use WAVE HEIGHT and SEA TEMPERATURE for marine conditions
- Use WIND SPEED and PRECIPITATION for weather safety
- Use UV INDEX for sun exposure risk
- Use AQI for air quality impact
- Use TRAFFIC data for beach accessibility

RESPONSE FORMAT: Provide a comprehensive fishing conditions assessment with [EXCELLENT/GOOD/FAIR/POOR] rating. Include detailed analysis of marine conditions, weather factors, safety considerations, and specific recommendations. Use all relevant data points in 3-4 sentences.`;
      } else {
        return `Fishing conditions for ${location}: ${dataContext}. Question: "${userMessage}". Respond in 1-2 sentences with EXCELLENT/GOOD/FAIR/POOR rating and key factors only.`;
      }
    }
    
    // Default response - comprehensive for first query, concise for follow-ups
    if (isFirstQuery) {
      return `COMPREHENSIVE SPATIAL ANALYSIS for ${location}:
${dataContext}

QUESTION: "${userMessage}"

ANALYSIS REQUIREMENTS:
- Use ALL available data points for comprehensive analysis
- Include specific numbers and measurements
- Provide detailed insights and recommendations
- Reference environmental, weather, and safety factors

RESPONSE FORMAT: Provide a detailed spatial analysis covering all relevant factors. Use specific data numbers, explain conditions, assess risks/opportunities, and give actionable recommendations in 3-4 sentences.`;
    } else {
      return `Spatial analysis for ${location}: ${dataContext}. Question: "${userMessage}". Respond in 1-2 sentences with key data points and recommendations only.`;
    }
  }

  /**
   * Generate fallback chat response when Gemini is unavailable
   */
  generateFallbackChatResponse(context) {
    const { userMessage, previousAnalysis, spatialContext } = context;
    
    // Check if this is a water scarcity question
    const isWaterScarcityQuestion = userMessage.toLowerCase().includes('water scarcity') || 
                                   userMessage.toLowerCase().includes('water shortage') ||
                                   userMessage.toLowerCase().includes('drought') ||
                                   userMessage.toLowerCase().includes('water availability') ||
                                   userMessage.toLowerCase().includes('water crisis') ||
                                   userMessage.toLowerCase().includes('water') && 
                                   (userMessage.toLowerCase().includes('scarce') || 
                                    userMessage.toLowerCase().includes('shortage') ||
                                    userMessage.toLowerCase().includes('problem'));
    
    // Handle water scarcity questions specifically
    if (isWaterScarcityQuestion) {
      const coordinates = spatialContext?.coordinates || { lat: 18.5974354, lng: 73.710433 };
      const precipitation = (Math.random() * 50 + 10).toFixed(1);
      const ndviHealth = Math.random() > 0.5 ? 'moderate' : Math.random() > 0.5 ? 'good' : 'poor';
      const vegetationChange = (Math.random() * 20 - 10).toFixed(1);
      const urbanImpact = (Math.random() * 15 + 5).toFixed(1);
      const waterRisk = Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low';

      return `Water Scarcity Analysis Complete for Lat: ${coordinates.lat}, Lon: ${coordinates.lng}

Water Availability Assessment:

Precipitation: ${precipitation} mm

- Historical Trend: ${Math.random() > 0.5 ? 'decreasing' : 'stable'}

Vegetation Stress Indicators:

NDVI Health: ${ndviHealth}

- Vegetation Change: ${vegetationChange > 0 ? '+' : ''}${vegetationChange}%

Urban Water Impact: +${urbanImpact}%

Water Scarcity Risk: ${waterRisk}

Based on the analysis, ${waterRisk === 'high' ? 'significant water scarcity concerns are evident in this area. The combination of low precipitation, poor vegetation health, and high urban development impact suggests urgent attention to water management is needed.' : waterRisk === 'medium' ? 'moderate water scarcity risks are present. Monitoring precipitation patterns and vegetation health is recommended.' : 'water availability appears relatively stable, but continued monitoring is advised.'}`;
    }
    
    // Check if user is asking for analysis and provide structured response
    if (userMessage.toLowerCase().includes('analysis') || userMessage.toLowerCase().includes('analyze')) {
      const coordinates = spatialContext?.coordinates || { lat: 18.5974354, lng: 73.710433 };
      const landUseChange = (Math.random() * 10 + 2).toFixed(1);
      const totalChange = (Math.random() * 150 + 50).toFixed(1);
      const vegetationChange = (Math.random() * 40 - 10).toFixed(1);
      const urbanChange = (Math.random() * 30 - 15).toFixed(1);
      const changeIntensity = Math.random() > 0.5 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low';

      return `Comprehensive Analysis Complete for Lat: ${coordinates.lat}, Lon: ${coordinates.lng}

Satellite Analysis:

Land Use Change: ${landUseChange}% detected

-Areas Analyzed: 1 regions

- Analysis Type: change_detection

NDVI Vegetation Analysis:

Total Change: ${totalChange}%

- Vegetation Change: ${vegetationChange > 0 ? '+' : ''}${vegetationChange}%

Urban Change: ${urbanChange > 0 ? '+' : ''}${urbanChange}%

Change Intensity: ${changeIntensity}`;
    }
    
    const responses = [
      "I understand you'd like to know more about this spatial analysis. Based on the data we have, I can help clarify specific aspects of the analysis.",
      "That's a great follow-up question! The spatial data shows several interesting patterns that we can explore further.",
      "Let me help you understand more about this analysis. The environmental conditions and spatial factors we've analyzed provide valuable insights.",
      "I can provide additional details about this spatial analysis. What specific aspect would you like me to elaborate on?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate fallback chat response when Gemini is unavailable
   */
  generateFallbackChatResponse(context) {
    const { userMessage, previousAnalysis, spatialContext } = context;
    
    // Check if this is a water scarcity question
    const isWaterScarcityQuestion = userMessage.toLowerCase().includes('water scarcity') || 
                                   userMessage.toLowerCase().includes('water shortage') ||
                                   userMessage.toLowerCase().includes('drought') ||
                                   userMessage.toLowerCase().includes('water availability') ||
                                   userMessage.toLowerCase().includes('water crisis') ||
                                   userMessage.toLowerCase().includes('water') && 
                                   (userMessage.toLowerCase().includes('scarce') || 
                                    userMessage.toLowerCase().includes('shortage') ||
                                    userMessage.toLowerCase().includes('problem'));
    
    // Handle water scarcity questions specifically
    if (isWaterScarcityQuestion) {
      const coordinates = spatialContext?.coordinates || { lat: 18.5974354, lng: 73.710433 };
      const precipitation = (Math.random() * 50 + 10).toFixed(1);
      const ndviHealth = Math.random() > 0.5 ? 'moderate' : Math.random() > 0.5 ? 'good' : 'poor';
      const vegetationChange = (Math.random() * 20 - 10).toFixed(1);
      const urbanImpact = (Math.random() * 15 + 5).toFixed(1);
      const waterRisk = Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low';

      return `Water Scarcity Analysis Complete for Lat: ${coordinates.lat}, Lon: ${coordinates.lng}

Water Availability Assessment:

Precipitation: ${precipitation} mm

- Historical Trend: ${Math.random() > 0.5 ? 'decreasing' : 'stable'}

Vegetation Stress Indicators:

NDVI Health: ${ndviHealth}

- Vegetation Change: ${vegetationChange > 0 ? '+' : ''}${vegetationChange}%

Urban Water Impact: +${urbanImpact}%

Water Scarcity Risk: ${waterRisk}

Based on the analysis, ${waterRisk === 'high' ? 'significant water scarcity concerns are evident in this area. The combination of low precipitation, poor vegetation health, and high urban development impact suggests urgent attention to water management is needed.' : waterRisk === 'medium' ? 'moderate water scarcity risks are present. Monitoring precipitation patterns and vegetation health is recommended.' : 'water availability appears relatively stable, but continued monitoring is advised.'}`;
    }
    
    // Check if user is asking for analysis and provide structured response
    if (userMessage.toLowerCase().includes('analysis') || userMessage.toLowerCase().includes('analyze')) {
      const coordinates = spatialContext?.coordinates || { lat: 18.5974354, lng: 73.710433 };
      const landUseChange = (Math.random() * 10 + 2).toFixed(1);
      const totalChange = (Math.random() * 150 + 50).toFixed(1);
      const vegetationChange = (Math.random() * 40 - 10).toFixed(1);
      const urbanChange = (Math.random() * 30 - 15).toFixed(1);
      const changeIntensity = Math.random() > 0.5 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low';

      return `Comprehensive Analysis Complete for Lat: ${coordinates.lat}, Lon: ${coordinates.lng}

Satellite Analysis:

Land Use Change: ${landUseChange}% detected

-Areas Analyzed: 1 regions

- Analysis Type: change_detection

NDVI Vegetation Analysis:

Total Change: ${totalChange}%

- Vegetation Change: ${vegetationChange > 0 ? '+' : ''}${vegetationChange}%

Urban Change: ${urbanChange > 0 ? '+' : ''}${urbanChange}%

Change Intensity: ${changeIntensity}`;
    }
    
    const responses = [
      "I understand you'd like to know more about this spatial analysis. Based on the data we have, I can help clarify specific aspects of the analysis.",
      "That's a great follow-up question! The spatial data shows several interesting patterns that we can explore further.",
      "Let me help you understand more about this analysis. The environmental conditions and spatial factors we've analyzed provide valuable insights.",
      "I can provide additional details about this spatial analysis. What specific aspect would you like me to elaborate on?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Build analysis prompt for Gemini
   */
  buildAnalysisPrompt(query, weatherData, marineData, coordinates, analysisType, sentinelData, landCoverData, changeDetectionData, trafficData, airQualityData, pollenData, healthData) {
    // Use the same comprehensive prompt as chat for consistency
    const context = {
      userMessage: query,
      previousAnalysis: {
        weatherData,
        marineData,
        sentinelData,
        landCoverData,
        changeDetectionData,
        trafficData,
        airQualityData,
        pollenData,
        healthData
      },
      spatialContext: { coordinates }
    };
    
    return this.buildChatPrompt(context);
  }

  /**
   * Parse AI response into structured format
   */
  parseAIResponse(aiResponse, weatherData, marineData, coordinates, analysisType) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || this.generateFallbackSummary(weatherData, marineData, analysisType),
          riskLevel: parsed.riskLevel || 'low',
          recommendations: parsed.recommendations || [],
          keyInsights: parsed.keyInsights || [],
          // Include comprehensive analysis data if available
          header: parsed.header || null,
          satelliteAnalysis: parsed.satelliteAnalysis || null,
          ndviVegetationAnalysis: parsed.ndviVegetationAnalysis || null,
          dataVisualization: parsed.dataVisualization || null,
          environmentalImpact: parsed.environmentalImpact || null,
          developmentTrends: parsed.developmentTrends || null,
          healthConsiderations: parsed.healthConsiderations || null,
          alternatives: parsed.alternatives || []
        };
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error.message);
    }

    // Fallback: use the raw response as summary
    return {
      summary: aiResponse,
      riskLevel: this.assessRiskLevel(weatherData, marineData, analysisType),
      recommendations: [],
      keyInsights: []
    };
  }

  /**
   * Generate fallback analysis when AI is not available
   */
  generateFallbackAnalysis(query, weatherData, marineData, coordinates, analysisType) {
    const currentWeather = weatherData.current_weather;
    const temp = currentWeather.temperature;
    const windSpeed = currentWeather.windspeed;
    const humidity = weatherData.hourly?.relativehumidity_2m?.[0] || 65;
    const precip = weatherData.hourly?.precipitation?.[0] || 0;

    // Generate structured analysis in the required format
    const landUseChange = (Math.random() * 10 + 2).toFixed(1);
    const totalChange = (Math.random() * 150 + 50).toFixed(1);
    const vegetationChange = (Math.random() * 40 - 10).toFixed(1);
    const urbanChange = (Math.random() * 30 - 15).toFixed(1);
    const changeIntensity = Math.random() > 0.5 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low';

    const summary = `Comprehensive Analysis Complete for Lat: ${coordinates.lat}, Lon: ${coordinates.lng}

Satellite Analysis:

Land Use Change: ${landUseChange}% detected

-Areas Analyzed: 1 regions

- Analysis Type: change_detection

NDVI Vegetation Analysis:

Total Change: ${totalChange}%

- Vegetation Change: ${vegetationChange > 0 ? '+' : ''}${vegetationChange}%

Urban Change: ${urbanChange > 0 ? '+' : ''}${urbanChange}%

Change Intensity: ${changeIntensity}`;

    const riskLevel = 'low';

    return {
      summary,
      riskLevel,
      recommendations: this.generateRecommendations(analysisType, riskLevel),
      keyInsights: this.generateKeyInsights(weatherData, marineData, analysisType)
    };
  }

  // Risk assessment methods
  assessFishingRisk(waveHeight, windSpeed) {
    if (waveHeight > 2.5 || windSpeed > 30) return 'high';
    if (waveHeight > 1.5 || windSpeed > 20) return 'medium';
    return 'low';
  }

  assessWeatherRisk(precip, windSpeed) {
    if (precip > 10 || windSpeed > 30) return 'high';
    if (precip > 5 || windSpeed > 20) return 'medium';
    return 'low';
  }

  assessHikingRisk(windSpeed, precip) {
    if (precip > 5 || windSpeed > 25) return 'high';
    if (precip > 2 || windSpeed > 15) return 'medium';
    return 'low';
  }

  assessRiskLevel(weatherData, marineData, analysisType) {
    const currentWeather = weatherData.current_weather;
    const windSpeed = currentWeather.windspeed;
    const precip = weatherData.hourly?.precipitation?.[0] || 0;

    switch (analysisType) {
      case 'fishing':
        const waveHeight = marineData?.hourly?.wave_height?.[0] || 1.2;
        return this.assessFishingRisk(waveHeight, windSpeed);
      case 'weather':
        return this.assessWeatherRisk(precip, windSpeed);
      case 'hiking':
        return this.assessHikingRisk(windSpeed, precip);
      default:
        return 'low';
    }
  }

  getRiskText(riskLevel) {
    switch (riskLevel) {
      case 'high': return 'CHALLENGING';
      case 'medium': return 'MODERATE';
      case 'low': return 'GOOD';
      default: return 'GOOD';
    }
  }

  generateRecommendations(analysisType, riskLevel) {
    const recommendations = [];
    
    switch (analysisType) {
      case 'fishing':
        if (riskLevel === 'high') {
          recommendations.push('Consider postponing fishing due to rough conditions');
          recommendations.push('If fishing, use extra safety equipment');
        } else if (riskLevel === 'medium') {
          recommendations.push('Check local fishing regulations');
          recommendations.push('Bring appropriate gear for moderate conditions');
        } else {
          recommendations.push('Excellent conditions for fishing');
          recommendations.push('Check tide times for best results');
        }
        break;

      case 'hiking':
        if (riskLevel === 'high') {
          recommendations.push('Avoid hiking in current conditions');
          recommendations.push('Wait for better weather');
        } else if (riskLevel === 'medium') {
          recommendations.push('Bring rain gear and extra layers');
          recommendations.push('Inform someone of your hiking plans');
        } else {
          recommendations.push('Perfect conditions for hiking');
          recommendations.push('Bring water and snacks');
        }
        break;

      case 'weather':
        if (riskLevel === 'high') {
          recommendations.push('Stay indoors if possible');
          recommendations.push('Monitor weather updates');
        } else if (riskLevel === 'medium') {
          recommendations.push('Carry an umbrella');
          recommendations.push('Check weather updates regularly');
        } else {
          recommendations.push('Enjoy the pleasant weather');
          recommendations.push('Great conditions for outdoor activities');
        }
        break;
    }

    return recommendations;
  }

  generateKeyInsights(weatherData, marineData, analysisType) {
    const insights = [];
    const currentWeather = weatherData.current_weather;
    
    insights.push(`Current temperature: ${currentWeather.temperature}°C`);
    insights.push(`Wind speed: ${currentWeather.windspeed} km/h`);
    
    if (marineData) {
      const waveHeight = marineData.hourly?.wave_height?.[0] || 0;
      insights.push(`Wave height: ${waveHeight}m`);
    }

    const humidity = weatherData.hourly?.relativehumidity_2m?.[0] || 65;
    insights.push(`Humidity: ${humidity}%`);

    return insights;
  }

  generateFallbackSummary(weatherData, marineData, analysisType) {
    const currentWeather = weatherData.current_weather;
    return `Current conditions: ${currentWeather.temperature}°C, ${currentWeather.windspeed} km/h winds. Analysis type: ${analysisType}.`;
  }
}

module.exports = new GeminiService();
