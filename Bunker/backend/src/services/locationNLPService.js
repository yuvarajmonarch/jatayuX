const natural = require('natural');

class LocationNLPService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Enhanced location patterns
    this.locationPatterns = {
      // Company/Organization patterns
      companies: [
        /(microsoft|google|amazon|infosys|tcs|wipro|hcl|tech\s+mahindra)\s+(campus|office|building|center|centre|tower)/i,
        /(\w+)\s+(campus|office|building|center|centre|tower|plaza|mall)/i,
        /(iit|iim|iisc|nit)\s+(\w+)/i
      ],
      
      // Geographic patterns
      cities: [
        /(bangalore|mumbai|delhi|chennai|hyderabad|pune|kolkata|ahmedabad|jaipur|surat|lucknow|kanpur|nagpur|indore|thane|bhopal|visakhapatnam|pimpri|patna|vadodara)/i
      ],
      
      // Landmark patterns
      landmarks: [
        /(gateway\s+of\s+india|taj\s+mahal|red\s+fort|golden\s+temple|lotus\s+temple|india\s+gate)/i,
        /(\w+\s+(temple|fort|palace|garden|park|mall|airport|station))/i
      ],
      
      // Address patterns
      addresses: [
        /(\d+)\s+(\w+)\s+(street|road|avenue|lane|colony|nagar|pura)/i,
        /(\w+)\s+(nagar|pura|colony|sector|phase|block)/i,
        /near\s+(\w+)/i,
        /behind\s+(\w+)/i,
        /opposite\s+(\w+)/i
      ],
      
      // Postal code patterns
      postalCodes: [
        /\b\d{6}\b/,
        /pin\s*code?\s*:?\s*(\d{6})/i,
        /pincode\s*:?\s*(\d{6})/i
      ],
      
      // Distance/area patterns
      distances: [
        /(\d+)\s*(km|kilometer|miles?)\s*(from|to|of)\s+(\w+)/i,
        /within\s+(\d+)\s*(km|kilometer|miles?)\s*(of|from)\s+(\w+)/i
      ]
    };
    
    // Location context words
    this.locationContextWords = [
      'at', 'in', 'near', 'around', 'close to', 'next to', 'behind', 'opposite',
      'within', 'outside', 'inside', 'nearby', 'vicinity', 'area', 'region',
      'campus', 'office', 'building', 'center', 'centre', 'tower', 'plaza',
      'street', 'road', 'avenue', 'lane', 'colony', 'nagar', 'sector'
    ];
    
    // Confidence boosters
    this.confidenceBoosters = {
      exact_match: 0.3,
      company_name: 0.25,
      landmark_name: 0.2,
      city_name: 0.15,
      postal_code: 0.2,
      building_type: 0.1,
      address_component: 0.1
    };
  }

  /**
   * Extract location information from natural language query
   * @param {string} query - User's natural language query
   * @returns {Object} Extracted location information with confidence scores
   */
  extractLocationInfo(query) {
    const tokens = this.tokenizer.tokenize(query.toLowerCase());
    const locationInfo = {
      original_query: query,
      extracted_locations: [],
      confidence: 0,
      suggestions: [],
      context: this.extractContext(query)
    };
    
    // Extract different types of location information
    const extractedData = {
      companies: this.extractCompanies(query),
      cities: this.extractCities(query),
      landmarks: this.extractLandmarks(query),
      addresses: this.extractAddresses(query),
      postalCodes: this.extractPostalCodes(query),
      distances: this.extractDistances(query)
    };
    
    // Calculate overall confidence
    locationInfo.confidence = this.calculateLocationConfidence(extractedData);
    
    // Combine all extracted locations
    locationInfo.extracted_locations = this.combineLocationData(extractedData);
    
    // Generate suggestions for improvement
    locationInfo.suggestions = this.generateSuggestions(extractedData, query);
    
    return locationInfo;
  }

  /**
   * Extract company/organization names from query
   * @param {string} query - User query
   * @returns {Array} Extracted companies
   */
  extractCompanies(query) {
    const companies = [];
    
    for (const pattern of this.locationPatterns.companies) {
      const matches = query.match(pattern);
      if (matches) {
        companies.push({
          name: matches[0],
          confidence: this.confidenceBoosters.company_name,
          type: 'company',
          context: this.extractContextAroundMatch(query, matches[0])
        });
      }
    }
    
    return companies;
  }

  /**
   * Extract city names from query
   * @param {string} query - User query
   * @returns {Array} Extracted cities
   */
  extractCities(query) {
    const cities = [];
    
    for (const pattern of this.locationPatterns.cities) {
      const matches = query.match(pattern);
      if (matches) {
        cities.push({
          name: matches[1],
          confidence: this.confidenceBoosters.city_name,
          type: 'city',
          context: this.extractContextAroundMatch(query, matches[1])
        });
      }
    }
    
    return cities;
  }

  /**
   * Extract landmark names from query
   * @param {string} query - User query
   * @returns {Array} Extracted landmarks
   */
  extractLandmarks(query) {
    const landmarks = [];
    
    for (const pattern of this.locationPatterns.landmarks) {
      const matches = query.match(pattern);
      if (matches) {
        landmarks.push({
          name: matches[0],
          confidence: this.confidenceBoosters.landmark_name,
          type: 'landmark',
          context: this.extractContextAroundMatch(query, matches[0])
        });
      }
    }
    
    return landmarks;
  }

  /**
   * Extract address components from query
   * @param {string} query - User query
   * @returns {Array} Extracted addresses
   */
  extractAddresses(query) {
    const addresses = [];
    
    for (const pattern of this.locationPatterns.addresses) {
      const matches = query.match(pattern);
      if (matches) {
        addresses.push({
          name: matches[0],
          confidence: this.confidenceBoosters.address_component,
          type: 'address',
          context: this.extractContextAroundMatch(query, matches[0])
        });
      }
    }
    
    return addresses;
  }

  /**
   * Extract postal codes from query
   * @param {string} query - User query
   * @returns {Array} Extracted postal codes
   */
  extractPostalCodes(query) {
    const postalCodes = [];
    
    for (const pattern of this.locationPatterns.postalCodes) {
      const matches = query.match(pattern);
      if (matches) {
        postalCodes.push({
          name: matches[0],
          confidence: this.confidenceBoosters.postal_code,
          type: 'postal_code',
          context: this.extractContextAroundMatch(query, matches[0])
        });
      }
    }
    
    return postalCodes;
  }

  /**
   * Extract distance/area information from query
   * @param {string} query - User query
   * @returns {Array} Extracted distances
   */
  extractDistances(query) {
    const distances = [];
    
    for (const pattern of this.locationPatterns.distances) {
      const matches = query.match(pattern);
      if (matches) {
        distances.push({
          name: matches[0],
          confidence: 0.1,
          type: 'distance',
          context: this.extractContextAroundMatch(query, matches[0])
        });
      }
    }
    
    return distances;
  }

  /**
   * Extract context around a matched location
   * @param {string} query - Original query
   * @param {string} match - Matched location
   * @returns {Object} Context information
   */
  extractContextAroundMatch(query, match) {
    const matchIndex = query.toLowerCase().indexOf(match.toLowerCase());
    const contextStart = Math.max(0, matchIndex - 20);
    const contextEnd = Math.min(query.length, matchIndex + match.length + 20);
    
    return {
      before: query.substring(contextStart, matchIndex).trim(),
      after: query.substring(matchIndex + match.length, contextEnd).trim(),
      full_context: query.substring(contextStart, contextEnd).trim()
    };
  }

  /**
   * Extract general context from query
   * @param {string} query - User query
   * @returns {Object} General context
   */
  extractContext(query) {
    const tokens = this.tokenizer.tokenize(query.toLowerCase());
    const context = {
      has_location_context: false,
      location_words: [],
      intent: 'general',
      specificity: 'low'
    };
    
    // Check for location context words
    for (const token of tokens) {
      if (this.locationContextWords.includes(token)) {
        context.has_location_context = true;
        context.location_words.push(token);
      }
    }
    
    // Determine intent
    if (query.includes('where') || query.includes('location')) {
      context.intent = 'location_inquiry';
    } else if (query.includes('near') || query.includes('around') || query.includes('close')) {
      context.intent = 'proximity_inquiry';
    } else if (query.includes('directions') || query.includes('how to reach')) {
      context.intent = 'directions';
    }
    
    // Determine specificity
    const locationCount = this.countLocationMatches(query);
    if (locationCount >= 3) {
      context.specificity = 'high';
    } else if (locationCount >= 1) {
      context.specificity = 'medium';
    }
    
    return context;
  }

  /**
   * Count location matches in query
   * @param {string} query - User query
   * @returns {number} Number of location matches
   */
  countLocationMatches(query) {
    let count = 0;
    
    // Count matches for each pattern type
    for (const patternType of Object.keys(this.locationPatterns)) {
      for (const pattern of this.locationPatterns[patternType]) {
        if (pattern.test(query)) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * Calculate overall confidence for location extraction
   * @param {Object} extractedData - All extracted location data
   * @returns {number} Overall confidence score (0-1)
   */
  calculateLocationConfidence(extractedData) {
    let confidence = 0;
    let totalWeight = 0;
    
    // Weight different types of location data
    const weights = {
      companies: 0.3,
      landmarks: 0.25,
      cities: 0.2,
      postalCodes: 0.15,
      addresses: 0.1
    };
    
    for (const [type, data] of Object.entries(extractedData)) {
      if (data.length > 0 && weights[type]) {
        const typeConfidence = Math.max(...data.map(item => item.confidence));
        confidence += typeConfidence * weights[type];
        totalWeight += weights[type];
      }
    }
    
    return totalWeight > 0 ? confidence / totalWeight : 0;
  }

  /**
   * Combine all extracted location data
   * @param {Object} extractedData - All extracted location data
   * @returns {Array} Combined location information
   */
  combineLocationData(extractedData) {
    const combined = [];
    
    for (const [type, data] of Object.entries(extractedData)) {
      combined.push(...data);
    }
    
    // Sort by confidence
    return combined.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate suggestions for improving location accuracy
   * @param {Object} extractedData - All extracted location data
   * @param {string} query - Original query
   * @returns {Array} Suggestions for improvement
   */
  generateSuggestions(extractedData, query) {
    const suggestions = [];
    
    // Check for missing information
    if (extractedData.companies.length === 0 && extractedData.landmarks.length === 0) {
      suggestions.push('Consider specifying a building name, company, or landmark for better accuracy');
    }
    
    if (extractedData.cities.length === 0) {
      suggestions.push('Adding the city name can help improve location precision');
    }
    
    if (extractedData.postalCodes.length === 0) {
      suggestions.push('Including a postal code can significantly improve accuracy');
    }
    
    if (extractedData.addresses.length === 0 && !query.includes('street') && !query.includes('road')) {
      suggestions.push('Adding street/road information can help pinpoint the exact location');
    }
    
    // Suggest based on query complexity
    const totalLocations = Object.values(extractedData).reduce((sum, arr) => sum + arr.length, 0);
    if (totalLocations === 0) {
      suggestions.push('Try being more specific about the location (e.g., "Microsoft campus in Bangalore")');
    } else if (totalLocations === 1) {
      suggestions.push('Adding more location details (city, area, landmark) can improve accuracy');
    }
    
    return suggestions;
  }

  /**
   * Enhance query with location suggestions
   * @param {string} query - Original query
   * @param {Object} locationInfo - Extracted location information
   * @returns {Object} Enhanced query with suggestions
   */
  enhanceQuery(query, locationInfo) {
    const enhanced = {
      original_query: query,
      enhanced_query: query,
      location_suggestions: [],
      confidence_improvement: 0
    };
    
    // If confidence is low, suggest improvements
    if (locationInfo.confidence < 0.6) {
      enhanced.location_suggestions = locationInfo.suggestions;
      
      // Try to enhance the query automatically
      let enhancedQuery = query;
      
      // Add "India" if no country context
      if (!query.toLowerCase().includes('india') && !query.toLowerCase().includes('in ')) {
        enhancedQuery += ', India';
        enhanced.confidence_improvement += 0.1;
      }
      
      // Add common location qualifiers
      if (query.includes('office') || query.includes('building')) {
        if (!query.toLowerCase().includes('in ') && !query.toLowerCase().includes('at ')) {
          enhancedQuery = query.replace(/(office|building)/i, 'in $1');
          enhanced.confidence_improvement += 0.05;
        }
      }
      
      enhanced.enhanced_query = enhancedQuery;
    }
    
    return enhanced;
  }
}

module.exports = LocationNLPService;
