// Comprehensive location database for India
// Pre-stored coordinates for accurate location lookup

const LOCATIONS_DATABASE = {
  // Major States - India
  "rajasthan": { lat: 27.0238, lng: 74.2179, state: "Rajasthan", type: "state", importance: "major" },
  "maharashtra": { lat: 19.7515, lng: 75.7139, state: "Maharashtra", type: "state", importance: "major" },
  "karnataka": { lat: 15.3173, lng: 75.7139, state: "Karnataka", type: "state", importance: "major" },
  "tamil nadu": { lat: 11.1271, lng: 78.6569, state: "Tamil Nadu", type: "state", importance: "major" },
  "kerala": { lat: 10.8505, lng: 76.2711, state: "Kerala", type: "state", importance: "major" },
  "west bengal": { lat: 22.9868, lng: 87.8550, state: "West Bengal", type: "state", importance: "major" },
  "gujarat": { lat: 23.0225, lng: 72.5714, state: "Gujarat", type: "state", importance: "major" },
  "punjab": { lat: 31.1471, lng: 75.3412, state: "Punjab", type: "state", importance: "major" },
  "haryana": { lat: 29.0588, lng: 76.0856, state: "Haryana", type: "state", importance: "major" },
  "delhi": { lat: 28.7041, lng: 77.1025, state: "Delhi", type: "union territory", importance: "major" },

  // Major Cities - Tamil Nadu
  "chennai": { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu", type: "city", importance: "major" },
  "madurai": { lat: 9.9252, lng: 78.1198, state: "Tamil Nadu", type: "city", importance: "major" },
  "coimbatore": { lat: 11.0168, lng: 76.9558, state: "Tamil Nadu", type: "city", importance: "major" },
  "tiruchirapalli": { lat: 10.7905, lng: 78.7047, state: "Tamil Nadu", type: "city", importance: "major" },
  "salem": { lat: 11.6643, lng: 78.1460, state: "Tamil Nadu", type: "city", importance: "major" },
  "tirunelveli": { lat: 8.7139, lng: 77.7567, state: "Tamil Nadu", type: "city", importance: "major" },
  "tiruppur": { lat: 11.1085, lng: 77.3411, state: "Tamil Nadu", type: "city", importance: "major" },
  "erode": { lat: 11.3410, lng: 77.7172, state: "Tamil Nadu", type: "city", importance: "major" },
  "vellore": { lat: 12.9202, lng: 79.1500, state: "Tamil Nadu", type: "city", importance: "major" },
  
  // Chennai Areas
  "avadi": { lat: 13.1195, lng: 80.1027, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "tambaram": { lat: 12.9246, lng: 80.1331, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "anna nagar": { lat: 13.0878, lng: 80.2206, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "t nagar": { lat: 13.0418, lng: 80.2341, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "mylapore": { lat: 13.0339, lng: 80.2624, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "adyar": { lat: 13.0067, lng: 80.2206, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "velachery": { lat: 12.9819, lng: 80.2206, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "omr": { lat: 12.9141, lng: 80.2206, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "porur": { lat: 13.0339, lng: 80.1581, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "guindy": { lat: 13.0067, lng: 80.2206, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  
  // Beaches and Tourist Places - Tamil Nadu
  "marina beach": { lat: 13.0418, lng: 80.2841, state: "Tamil Nadu", type: "beach", importance: "major", parent: "Chennai" },
  "covelong beach": { lat: 12.7919, lng: 80.2506, state: "Tamil Nadu", type: "beach", importance: "major", parent: "Chennai" },
  "mahabalipuram": { lat: 12.6269, lng: 80.1947, state: "Tamil Nadu", type: "heritage", importance: "major" },
  "pondicherry": { lat: 11.9416, lng: 79.8083, state: "Puducherry", type: "city", importance: "major" },
  
  // Major Cities - Karnataka
  "bangalore": { lat: 12.9716, lng: 77.5946, state: "Karnataka", type: "city", importance: "major" },
  "mysore": { lat: 12.2958, lng: 76.6394, state: "Karnataka", type: "city", importance: "major" },
  "mangalore": { lat: 12.9141, lng: 74.8560, state: "Karnataka", type: "city", importance: "major" },
  "hubli": { lat: 15.3647, lng: 75.1240, state: "Karnataka", type: "city", importance: "major" },
  "belgaum": { lat: 15.8497, lng: 74.4977, state: "Karnataka", type: "city", importance: "major" },
  "gulbarga": { lat: 17.3297, lng: 76.8343, state: "Karnataka", type: "city", importance: "major" },
  
  // Bangalore Areas
  "koramangala": { lat: 12.9279, lng: 77.6271, state: "Karnataka", type: "area", importance: "major", parent: "Bangalore" },
  "indiranagar": { lat: 12.9719, lng: 77.6412, state: "Karnataka", type: "area", importance: "major", parent: "Bangalore" },
  "whitefield": { lat: 12.9698, lng: 77.7500, state: "Karnataka", type: "area", importance: "major", parent: "Bangalore" },
  "electronic city": { lat: 12.8456, lng: 77.6603, state: "Karnataka", type: "area", importance: "major", parent: "Bangalore" },
  "hebbal": { lat: 13.0353, lng: 77.5975, state: "Karnataka", type: "area", importance: "major", parent: "Bangalore" },
  "rajajinagar": { lat: 12.9744, lng: 77.5528, state: "Karnataka", type: "area", importance: "major", parent: "Bangalore" },
  
  // Major Cities - Kerala
  "kochi": { lat: 9.9312, lng: 76.2673, state: "Kerala", type: "city", importance: "major" },
  "trivandrum": { lat: 8.5241, lng: 76.9366, state: "Kerala", type: "city", importance: "major" },
  "calicut": { lat: 11.2588, lng: 75.7804, state: "Kerala", type: "city", importance: "major" },
  "thrissur": { lat: 10.5276, lng: 76.2144, state: "Kerala", type: "city", importance: "major" },
  "kollam": { lat: 8.8932, lng: 76.6141, state: "Kerala", type: "city", importance: "major" },
  "palakkad": { lat: 10.7867, lng: 76.6548, state: "Kerala", type: "city", importance: "major" },
  
  // Major Cities - Other States
  "mumbai": { lat: 19.0760, lng: 72.8777, state: "Maharashtra", type: "city", importance: "major" },
  "delhi": { lat: 28.7041, lng: 77.1025, state: "Delhi", type: "city", importance: "major" },
  "hyderabad": { lat: 17.3850, lng: 78.4867, state: "Telangana", type: "city", importance: "major" },
  "kolkata": { lat: 22.5726, lng: 88.3639, state: "West Bengal", type: "city", importance: "major" },
  "pune": { lat: 18.5204, lng: 73.8567, state: "Maharashtra", type: "city", importance: "major" },
  "ahmedabad": { lat: 23.0225, lng: 72.5714, state: "Gujarat", type: "city", importance: "major" },
  "jaipur": { lat: 26.9124, lng: 75.7873, state: "Rajasthan", type: "city", importance: "major" },
  "surat": { lat: 21.1702, lng: 72.8311, state: "Gujarat", type: "city", importance: "major" },
  "lucknow": { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh", type: "city", importance: "major" },
  "kanpur": { lat: 26.4499, lng: 80.3319, state: "Uttar Pradesh", type: "city", importance: "major" },
  
  // Popular Tourist Destinations
  "goa": { lat: 15.2993, lng: 74.1240, state: "Goa", type: "state", importance: "major" },
  "shimla": { lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh", type: "city", importance: "major" },
  "manali": { lat: 32.2432, lng: 77.1892, state: "Himachal Pradesh", type: "city", importance: "major" },
  "udaipur": { lat: 24.5854, lng: 73.7125, state: "Rajasthan", type: "city", importance: "major" },
  "jodhpur": { lat: 26.2389, lng: 73.0243, state: "Rajasthan", type: "city", importance: "major" },
  "varanasi": { lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh", type: "city", importance: "major" },
  "agra": { lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh", type: "city", importance: "major" },
  
  // Hiking and Trekking Destinations
  "ooty": { lat: 11.4102, lng: 76.6950, state: "Tamil Nadu", type: "hill_station", importance: "major" },
  "kodaikanal": { lat: 10.2381, lng: 77.4892, state: "Tamil Nadu", type: "hill_station", importance: "major" },
  "coonoor": { lat: 11.3467, lng: 76.7939, state: "Tamil Nadu", type: "hill_station", importance: "major" },
  "munnar": { lat: 10.0889, lng: 77.0595, state: "Kerala", type: "hill_station", importance: "major" },
  "wayanad": { lat: 11.6850, lng: 76.1319, state: "Kerala", type: "district", importance: "major" },
  "coorg": { lat: 12.3375, lng: 75.8069, state: "Karnataka", type: "district", importance: "major" },
  "chikmagalur": { lat: 13.3161, lng: 75.7720, state: "Karnataka", type: "city", importance: "major" },
  
  // National Parks and Wildlife
  "bandipur": { lat: 11.6650, lng: 76.6300, state: "Karnataka", type: "national_park", importance: "major" },
  "mudumalai": { lat: 11.6000, lng: 76.5000, state: "Tamil Nadu", type: "national_park", importance: "major" },
  "periyar": { lat: 9.4667, lng: 77.1667, state: "Kerala", type: "national_park", importance: "major" },
  
  // Coastal Areas
  "rameshwaram": { lat: 9.2785, lng: 79.3006, state: "Tamil Nadu", type: "city", importance: "major" },
  "kanyakumari": { lat: 8.0883, lng: 77.5385, state: "Tamil Nadu", type: "city", importance: "major" },
  "alleppey": { lat: 9.4981, lng: 76.3388, state: "Kerala", type: "city", importance: "major" },
  
  // Industrial Areas
  "hosur": { lat: 12.7404, lng: 77.8253, state: "Tamil Nadu", type: "city", importance: "major" },
  "sriperumbudur": { lat: 12.9679, lng: 79.9416, state: "Tamil Nadu", type: "city", importance: "major" },
  "tirupur": { lat: 11.1085, lng: 77.3411, state: "Tamil Nadu", type: "city", importance: "major" },
  
  // Additional Tamil Nadu Locations
  "veppampattu": { lat: 13.0339, lng: 80.1581, state: "Tamil Nadu", type: "area", importance: "major", parent: "Chennai" },
  "theni": { lat: 10.0150, lng: 77.4770, state: "Tamil Nadu", type: "city", importance: "major" },
  "tiruvallur": { lat: 13.1376, lng: 79.9060, state: "Tamil Nadu", type: "city", importance: "major" },
  "tirupati": { lat: 13.6288, lng: 79.4192, state: "Andhra Pradesh", type: "city", importance: "major" },
  "vellore": { lat: 12.9202, lng: 79.1500, state: "Tamil Nadu", type: "city", importance: "major" },
  "tuticorin": { lat: 8.7642, lng: 78.1348, state: "Tamil Nadu", type: "city", importance: "major" },
  "dindigul": { lat: 10.3529, lng: 77.9755, state: "Tamil Nadu", type: "city", importance: "major" },
  "thanjavur": { lat: 10.7867, lng: 79.1378, state: "Tamil Nadu", type: "city", importance: "major" },
  "tirunelveli": { lat: 8.7139, lng: 77.7567, state: "Tamil Nadu", type: "city", importance: "major" },
  "karur": { lat: 10.9577, lng: 78.0809, state: "Tamil Nadu", type: "city", importance: "major" },
  "namakkal": { lat: 11.2202, lng: 78.1672, state: "Tamil Nadu", type: "city", importance: "major" },
  "dharmapuri": { lat: 12.1270, lng: 78.1576, state: "Tamil Nadu", type: "city", importance: "major" },
  "krishnagiri": { lat: 12.5192, lng: 78.2138, state: "Tamil Nadu", type: "city", importance: "major" },
  "perambalur": { lat: 11.2340, lng: 78.8832, state: "Tamil Nadu", type: "city", importance: "major" },
  "ariyalur": { lat: 11.1375, lng: 79.0753, state: "Tamil Nadu", type: "city", importance: "major" },
  "cuddalore": { lat: 11.7463, lng: 79.7643, state: "Tamil Nadu", type: "city", importance: "major" },
  "villupuram": { lat: 11.9416, lng: 79.4983, state: "Tamil Nadu", type: "city", importance: "major" },
  "kanchipuram": { lat: 12.8338, lng: 79.7000, state: "Tamil Nadu", type: "city", importance: "major" },
  "tiruvannamalai": { lat: 12.2270, lng: 79.0626, state: "Tamil Nadu", type: "city", importance: "major" },
  "pudukkottai": { lat: 10.3811, lng: 78.8214, state: "Tamil Nadu", type: "city", importance: "major" },
  "sivaganga": { lat: 9.8436, lng: 78.4809, state: "Tamil Nadu", type: "city", importance: "major" },
  "virudhunagar": { lat: 9.5852, lng: 77.9573, state: "Tamil Nadu", type: "city", importance: "major" },
  "ramanathapuram": { lat: 9.3716, lng: 78.8307, state: "Tamil Nadu", type: "city", importance: "major" },
  "theni": { lat: 10.0150, lng: 77.4770, state: "Tamil Nadu", type: "city", importance: "major" },
  "madurai": { lat: 9.9252, lng: 78.1198, state: "Tamil Nadu", type: "city", importance: "major" }
};

// Location aliases and variations
const LOCATION_ALIASES = {
  // Chennai variations
  "madras": "chennai",
  "chenai": "chennai",
  
  // Bangalore variations
  "bengaluru": "bangalore",
  "bangalore city": "bangalore",
  
  // Mumbai variations
  "bombay": "mumbai",
  
  // Delhi variations
  "new delhi": "delhi",
  "delhi ncr": "delhi",
  
  // Kolkata variations
  "calcutta": "kolkata",
  
  // Kochi variations
  "cochin": "kochi",
  "ernakulam": "kochi",
  
  // Trivandrum variations
  "thiruvananthapuram": "trivandrum",
  
  // Calicut variations
  "kozhikode": "calicut",
  
  // Pondicherry variations
  "puducherry": "pondicherry",
  "pondy": "pondicherry",
  
  // Goa variations
  "panaji": "goa",
  "panjim": "goa",
  
  // Hill station variations
  "udagamandalam": "ooty",
  
  // State name variations
  "tamilnadu": "tamil nadu",
  "karnataka": "karnataka",
  "kerala": "kerala"
};

class LocationDatabase {
  /**
   * Find location in database
   * @param {string} locationName - Location name to search
   * @returns {Object|null} Location data or null if not found
   */
  findLocation(locationName) {
    if (!locationName) return null;
    
    const normalizedName = this.normalizeLocationName(locationName);
    
    // Direct lookup
    if (LOCATIONS_DATABASE[normalizedName]) {
      return {
        ...LOCATIONS_DATABASE[normalizedName],
        name: normalizedName,
        found: true
      };
    }
    
    // Fuzzy search for partial matches
    const fuzzyMatch = this.fuzzySearch(normalizedName);
    if (fuzzyMatch) {
      return {
        ...fuzzyMatch,
        name: fuzzyMatch.key,
        found: true
      };
    }
    
    return null;
  }
  
  /**
   * Normalize location name for database lookup
   * @param {string} locationName - Raw location name
   * @returns {string} Normalized location name
   */
  normalizeLocationName(locationName) {
    if (!locationName) return '';
    
    let normalized = locationName.toLowerCase().trim();
    
    // Check aliases first
    if (LOCATION_ALIASES[normalized]) {
      normalized = LOCATION_ALIASES[normalized];
    }
    
    // Remove common suffixes and prefixes
    normalized = normalized
      .replace(/\b(district|city|town|village|area|zone)\b/g, '')
      .replace(/\b(near|around|close to)\b/g, '')
      .trim();
    
    return normalized;
  }
  
  /**
   * Fuzzy search for partial matches
   * @param {string} searchTerm - Term to search for
   * @returns {Object|null} Best match or null
   */
  fuzzySearch(searchTerm) {
    const keys = Object.keys(LOCATIONS_DATABASE);
    
    // Exact substring match
    for (const key of keys) {
      if (key.includes(searchTerm) || searchTerm.includes(key)) {
        return { key, ...LOCATIONS_DATABASE[key] };
      }
    }
    
    // Word-based matching
    const searchWords = searchTerm.split(' ');
    let bestMatch = null;
    let bestScore = 0;
    
    for (const key of keys) {
      const keyWords = key.split(' ');
      let score = 0;
      
      for (const searchWord of searchWords) {
        for (const keyWord of keyWords) {
          if (keyWord.includes(searchWord) || searchWord.includes(keyWord)) {
            score += 1;
          }
        }
      }
      
      if (score > bestScore && score > 0) {
        bestScore = score;
        bestMatch = { key, ...LOCATIONS_DATABASE[key] };
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Get all locations by type
   * @param {string} type - Location type (city, area, beach, etc.)
   * @returns {Array} Array of locations
   */
  getLocationsByType(type) {
    return Object.entries(LOCATIONS_DATABASE)
      .filter(([key, data]) => data.type === type)
      .map(([key, data]) => ({ name: key, ...data }));
  }
  
  /**
   * Get locations by state
   * @param {string} state - State name
   * @returns {Array} Array of locations
   */
  getLocationsByState(state) {
    return Object.entries(LOCATIONS_DATABASE)
      .filter(([key, data]) => data.state.toLowerCase().includes(state.toLowerCase()))
      .map(([key, data]) => ({ name: key, ...data }));
  }
  
  /**
   * Get database statistics
   * @returns {Object} Database statistics
   */
  getStats() {
    const locations = Object.keys(LOCATIONS_DATABASE);
    const states = [...new Set(Object.values(LOCATIONS_DATABASE).map(l => l.state))];
    const types = [...new Set(Object.values(LOCATIONS_DATABASE).map(l => l.type))];
    
    return {
      totalLocations: locations.length,
      states: states.length,
      types: types.length,
      locations: locations,
      states: states,
      types: types
    };
  }
}

module.exports = new LocationDatabase();
