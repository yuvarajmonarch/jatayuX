import { weatherService } from './weatherService';
import { sentinelService } from './sentinelService';
import { airQualityService } from './airQualityService';
import { trafficService } from './trafficService';

export const generateComprehensiveReport = async (locationData) => {
    // Collect data from all existing modules in parallel
    const [weather, satellite, airQuality, traffic] = await Promise.all([
        weatherService.getWeather(locationData),
        sentinelService.getLatestImagery(locationData),
        airQualityService.getAirQuality(locationData),
        trafficService.getTraffic(locationData)
    ]);

    return {
        timestamp: new Date().toLocaleString(),
        location: locationData,
        modules: {
            atmospheric: weather,
            imagery: satellite,
            environmental: airQuality,
            logistics: traffic
        },
        summary: "Jatayu Automated Intelligence Synthesis"
    };
};