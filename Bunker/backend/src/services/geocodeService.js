const axios = require('axios');
const locationDatabase = require('../data/locationsDatabase');
const EnhancedGeocodeService = require('./enhancedGeocodeService');
const LocationNLPService = require('./locationNLPService');

class GeocodeService {
  constructor() {
    this.nominatimBaseUrl = 'https://nominatim.openstreetmap.org/search';
    this.locationDatabase = locationDatabase;
    this.enhancedGeocodeService = new EnhancedGeocodeService();
    this.locationNLPService = new LocationNLPService();
  }

  /**
   * Enhanced geocoding with NLP location extraction and precise structured queries
   * @param {string} locationString - Location name to geocode
   * @param {Object} options - Additional options for geocoding
   * @returns {Promise<Object>} Enhanced geocoded result with confidence and validation
   */
  async enhancedGeocodeLocation(locationString, options = {}) {
    try {
      console.log(`🔍 Enhanced geocoding for: ${locationString}`);
      
      // Step 1: Extract location information using NLP
      const locationInfo = this.locationNLPService.extractLocationInfo(locationString);
      console.log(`🧠 NLP Analysis:`, {
        confidence: locationInfo.confidence,
        locations_found: locationInfo.extracted_locations.length,
        suggestions: locationInfo.suggestions
      });
      
      // Step 2: Use enhanced geocoding service
      const geocodeResult = await this.enhancedGeocodeService.geocodeLocation(locationString, {
        ...options,
        nlp_analysis: locationInfo
      });
      
      // Step 3: Validate and enhance result
      const validatedResult = this.enhancedGeocodeService.validateGeocodingResult(geocodeResult);
      
      // Step 4: Combine NLP analysis with geocoding result
      const finalResult = {
        ...validatedResult,
        nlp_analysis: locationInfo,
        extraction_confidence: locationInfo.confidence,
        total_confidence: (validatedResult.confidence + locationInfo.confidence) / 2,
        query_enhancement: this.locationNLPService.enhanceQuery(locationString, locationInfo)
      };
      
      console.log(`✅ Enhanced geocoding completed with confidence: ${finalResult.total_confidence}`);
      return finalResult;
      
    } catch (error) {
      console.error(`❌ Enhanced geocoding error for ${locationString}:`, error.message);
      // Fallback to regular geocoding
      return await this.geocodeLocation(locationString);
    }
  }

  /**
   * Geocode a location string to coordinates (legacy method)
   * @param {string} locationString - Location name to geocode
   * @returns {Promise<Object>} Geocoded coordinates with metadata
   */
  async geocodeLocation(locationString) {
    try {
      console.log(`🔍 Geocoding location: ${locationString}`);
      
      // First, try to find in our comprehensive database
      const dbResult = this.locationDatabase.findLocation(locationString);
      if (dbResult) {
        console.log(`✅ Found in database: ${locationString} → ${dbResult.lat}, ${dbResult.lng}`);
        return {
          lat: dbResult.lat,
          lng: dbResult.lng,
          coordinates: {
            lat: dbResult.lat,
            lng: dbResult.lng
          },
          location: dbResult.name,
          name: dbResult.name,
          confidence: 1.0, // Database results are 100% accurate
          address: `${dbResult.name}, ${dbResult.state}, India`,
          place_id: `db_${dbResult.name}`,
          source: 'database',
          type: dbResult.type,
          state: dbResult.state,
          importance: dbResult.importance
        };
      }
      
      console.log(`🔍 Location not in database, trying Nominatim API...`);
      
      // Fallback to Nominatim API for locations not in our database
      let searchQuery = locationString;
      
      // If it's a city/area name, add more context
      if (!locationString.includes(',')) {
        searchQuery = `${locationString}, India`;
      }
      
      const response = await axios.get(this.nominatimBaseUrl, {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 10, // Get more results to find the best match
          addressdetails: 1,
          countrycodes: 'in', // Focus on India for better results
          accept_language: 'en',
          dedupe: 1 // Remove duplicates
        },
        headers: {
          'User-Agent': 'Bunker-Spatial-Intelligence/1.0'
        },
        timeout: 10000
      });

      if (!response.data || response.data.length === 0) {
        throw new Error(`Location not found: ${locationString}`);
      }

      // Find the best match based on confidence and relevance
      const results = response.data.map(result => ({
        ...result,
        confidence: this.calculateConfidence(result),
        relevance: this.calculateRelevance(result, locationString)
      }));

      // Sort by confidence and relevance, pick the best match
      const bestResult = results.sort((a, b) => {
        const scoreA = a.confidence * 0.7 + a.relevance * 0.3;
        const scoreB = b.confidence * 0.7 + b.relevance * 0.3;
        return scoreB - scoreA;
      })[0];

      const coordinates = {
        lat: parseFloat(bestResult.lat),
        lng: parseFloat(bestResult.lon),
        coordinates: {
          lat: parseFloat(bestResult.lat),
          lng: parseFloat(bestResult.lon)
        },
        location: bestResult.display_name,
        name: bestResult.display_name,
        confidence: bestResult.confidence,
        address: bestResult.address,
        place_id: bestResult.place_id,
        source: 'nominatim'
      };

      console.log(`✅ Geocoded via API: ${locationString} → ${coordinates.lat}, ${coordinates.lng}`);
      return coordinates;

    } catch (error) {
      console.error(`❌ Geocoding error for ${locationString}:`, error.message);
      throw new Error(`Failed to geocode location: ${locationString}`);
    }
  }

  /**
   * Calculate confidence score based on result quality
   * @param {Object} result - Nominatim result
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(result) {
    let confidence = 0.5; // Base confidence

    // Higher confidence for exact matches
    if (result.importance > 0.7) confidence += 0.3;
    else if (result.importance > 0.5) confidence += 0.2;
    else if (result.importance > 0.3) confidence += 0.1;

    // Bonus for detailed address
    if (result.address) {
      if (result.address.city || result.address.town) confidence += 0.1;
      if (result.address.state) confidence += 0.05;
      if (result.address.country) confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate relevance score based on how well the result matches the search term
   * @param {Object} result - Nominatim result
   * @param {string} searchTerm - Original search term
   * @returns {number} Relevance score (0-1)
   */
  calculateRelevance(result, searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const lowerDisplayName = result.display_name.toLowerCase();
    let relevance = 0;

    // Exact match in display name gets highest score
    if (lowerDisplayName.includes(lowerSearchTerm)) {
      relevance += 0.8;
    }

    // Check if search term appears in address components
    if (result.address) {
      const addressParts = [
        result.address.city,
        result.address.town,
        result.address.village,
        result.address.county,
        result.address.state
      ].filter(Boolean);

      for (const part of addressParts) {
        if (part.toLowerCase().includes(lowerSearchTerm)) {
          relevance += 0.6;
          break;
        }
      }
    }

    // Prefer results with higher importance (more significant places)
    if (result.importance > 0.8) relevance += 0.2;
    else if (result.importance > 0.6) relevance += 0.1;

    return Math.min(relevance, 1.0);
  }

  /**
   * Extract location from query string using intelligent parsing
   * @param {string} query - User query
   * @returns {string|null} Extracted location string
   */
  extractLocationFromQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // Handle "near me" and "my area" queries - use Coimbatore coordinates
    if (lowerQuery.includes('near me') || lowerQuery.includes('my area') || lowerQuery.includes('around me')) {
      console.log(`📍 Using Coimbatore coordinates for "near me" query`);
      return 'Coimbatore, Tamil Nadu, India';
    }

    // Handle water scarcity and environmental queries - use the full query for context
    const waterScarcityPatterns = [
      /water\s+scarcity\s+in\s+(?:my\s+)?area/i,
      /water\s+shortage\s+in\s+(?:my\s+)?area/i,
      /drought\s+in\s+(?:my\s+)?area/i,
      /water\s+availability\s+in\s+(?:my\s+)?area/i,
      /water\s+crisis\s+in\s+(?:my\s+)?area/i,
      /water\s+scarcity\s+(?:in|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /water\s+shortage\s+(?:in|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];
    
    for (const pattern of waterScarcityPatterns) {
      const match = query.match(pattern);
      if (match) {
        if (match[1]) {
          // Specific location mentioned
          console.log(`📍 Extracted water scarcity location "${match[1]}" from pattern`);
          return match[1];
        } else {
          // "my area" - return Coimbatore coordinates for local analysis
          console.log(`📍 Using Coimbatore coordinates for "my area" query`);
          return 'Coimbatore, Tamil Nadu, India';
        }
      }
    }
    
    // First, try to find capitalized place names (proper nouns)
    const capitalizedWords = query.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (capitalizedWords) {
      // Filter out common non-location words
      const excludeWords = ['How', 'What', 'Where', 'When', 'Why', 'The', 'This', 'That', 'Today', 'Tomorrow', 'Yesterday', 'Traffic', 'Weather', 'Driving', 'Hiking', 'Fishing', 'Growth', 'Development', 'Infrastructure', 'Water'];
      
      for (const word of capitalizedWords) {
        if (!excludeWords.includes(word)) {
          const cleaned = this.cleanLocationString(word);
          if (cleaned && cleaned.length > 2) {
            console.log(`📍 Extracted location "${cleaned}" from capitalized word`);
            return cleaned;
          }
        }
      }
    }
    
    // Define specific patterns for different query types
    const patterns = [
      // Growth/Development queries - extract the location before "in"
      { pattern: /(?:growth|development|developement)\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'development' },
      { pattern: /(?:how\s+is|how's)\s+(?:the\s+)?(?:growth|development)\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'development' },
      
      // Traffic queries
      { pattern: /traffic\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'traffic' },
      { pattern: /how\s+(?:is|are)\s+traffic\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'traffic' },
      
      // Weather queries
      { pattern: /weather\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'weather' },
      { pattern: /how\s+(?:is|are)\s+weather\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'weather' },
      
      // Driving queries
      { pattern: /driving\s+(?:in|at|near|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'driving' },
      { pattern: /how\s+(?:is|are)\s+driving\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'driving' },
      
      // Hiking queries
      { pattern: /hiking\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'hiking' },
      { pattern: /trails?\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'hiking' },
      { pattern: /hiking\s+trails?\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'hiking' },
      
      // Fishing queries
      { pattern: /fishing\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'fishing' },
      { pattern: /safe\s+to\s+fish\s+(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'fishing' },
      
      // General "in/at/near" patterns - but only for capitalized words
      { pattern: /(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i, type: 'general' }
    ];

    // Try each pattern
    for (const { pattern, type } of patterns) {
      const match = query.match(pattern);
      if (match) {
        let location = match[1].trim();
        
        // Clean up the extracted location
        location = this.cleanLocationString(location);
        
        if (location && location.length > 2) {
          console.log(`📍 Extracted location "${location}" using ${type} pattern`);
          return location;
        }
      }
    }

    // If no pattern matched, return null
    console.log(`❌ No location found in query: "${query}"`);
    return null;
  }

  /**
   * Clean and normalize location string
   * @param {string} location - Raw location string
   * @returns {string} Cleaned location string
   */
  cleanLocationString(location) {
    if (!location) return '';
    
    // Remove common words that might interfere
    const removeWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    // Split into words and filter
    let words = location.trim().split(/\s+/)
      .filter(word => !removeWords.includes(word.toLowerCase()))
      .filter(word => word.length > 1); // Remove single characters
    
    // If we have multiple words, prefer the first meaningful word
    if (words.length > 1) {
      // Check if first word is a common question word
      const questionWords = ['how', 'what', 'where', 'when', 'why', 'is', 'are', 'was', 'were'];
      if (questionWords.includes(words[0].toLowerCase())) {
        words = words.slice(1); // Remove question word
      }
    }
    
    return words.join(' ').trim();
  }
}

module.exports = new GeocodeService();
