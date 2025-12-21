import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisData } from '../api/analyze';
import SatelliteImagery from './SatelliteImagery';

interface EnhancedAnalyticsProps {
  analysisData: AnalysisData;
  coordinates?: { lat: number; lng: number };
}

const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({ analysisData, coordinates }) => {
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Simulate real-time data fetching
    const fetchRealTimeData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!isMounted) return;
      
      // Generate realistic analytics data
      const mockData = {
        temporalAnalysis: {
          changeRate: '+2.3%',
          trendDirection: 'increasing',
          confidence: 'high',
          timePeriod: '30 days'
        },
        spatialMetrics: {
          totalArea: '156.7 km²',
          analyzedPixels: '2,847,392',
          validPixels: '2,654,891',
          processingTime: '2.3s'
        },
        qualityMetrics: {
          cloudCover: '12%',
          atmosphericCorrection: 'Applied',
          geometricAccuracy: '0.8 pixels',
          radiometricQuality: 'High'
        },
        environmentalFactors: {
          vegetationIndex: '0.67',
          waterIndex: '0.23',
          builtUpIndex: '0.45',
          bareSoilIndex: '0.12'
        }
      };
      
      setRealTimeData(mockData);
      setLoading(false);
    };

    fetchRealTimeData();
    
    return () => {
      isMounted = false;
    };
  }, [coordinates?.lat, coordinates?.lng]); // Only depend on actual coordinate values

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-3">
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <div className="text-gray-400 text-sm">Loading analytics...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Real-time Satellite Imagery */}
      {coordinates && (
        <SatelliteImagery
          center={[coordinates.lng, coordinates.lat]}
          analysisType="analytics"
          className="h-64"
        />
      )}

      {/* Temporal Analysis */}
      {realTimeData?.temporalAnalysis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4"
        >
          <h4 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
            {getTrendIcon(realTimeData.temporalAnalysis.trendDirection)} Temporal Analysis
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Change Rate:</span>
                <span className={`font-medium ${
                  realTimeData.temporalAnalysis.changeRate.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {realTimeData.temporalAnalysis.changeRate}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Trend:</span>
                <span className="text-white font-medium capitalize">
                  {realTimeData.temporalAnalysis.trendDirection}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Confidence:</span>
                <span className={`font-medium ${
                  realTimeData.temporalAnalysis.confidence === 'high' ? 'text-green-400' : 
                  realTimeData.temporalAnalysis.confidence === 'medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {realTimeData.temporalAnalysis.confidence}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Period:</span>
                <span className="text-white font-medium">
                  {realTimeData.temporalAnalysis.timePeriod}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Spatial Metrics */}
      {realTimeData?.spatialMetrics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4"
        >
          <h4 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
            📐 Spatial Metrics
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Total Area:</span>
                <span className="text-white font-medium">{realTimeData.spatialMetrics.totalArea}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Analyzed Pixels:</span>
                <span className="text-white font-medium">{realTimeData.spatialMetrics.analyzedPixels}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Valid Pixels:</span>
                <span className="text-green-400 font-medium">{realTimeData.spatialMetrics.validPixels}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Processing:</span>
                <span className="text-blue-400 font-medium">{realTimeData.spatialMetrics.processingTime}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quality Metrics */}
      {realTimeData?.qualityMetrics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4"
        >
          <h4 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
            🎯 Quality Metrics
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Cloud Cover:</span>
                <span className="text-white font-medium">{realTimeData.qualityMetrics.cloudCover}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Correction:</span>
                <span className="text-green-400 font-medium">{realTimeData.qualityMetrics.atmosphericCorrection}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Accuracy:</span>
                <span className="text-blue-400 font-medium">{realTimeData.qualityMetrics.geometricAccuracy}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Quality:</span>
                <span className={`font-medium ${getQualityColor(realTimeData.qualityMetrics.radiometricQuality)}`}>
                  {realTimeData.qualityMetrics.radiometricQuality}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Environmental Factors */}
      {realTimeData?.environmentalFactors && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4"
        >
          <h4 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
            🌍 Environmental Factors
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Vegetation:</span>
                <span className="text-green-400 font-medium">{realTimeData.environmentalFactors.vegetationIndex}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Water:</span>
                <span className="text-blue-400 font-medium">{realTimeData.environmentalFactors.waterIndex}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Built-up:</span>
                <span className="text-orange-400 font-medium">{realTimeData.environmentalFactors.builtUpIndex}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Bare Soil:</span>
                <span className="text-yellow-400 font-medium">{realTimeData.environmentalFactors.bareSoilIndex}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Original Satellite Analysis */}
      {analysisData.satelliteAnalysis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4"
        >
          <h4 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
            🛰️ Satellite Analysis
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Land Use Change:</span>
              <span className="text-white font-medium">{analysisData.satelliteAnalysis.landUseChange}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Areas Analyzed:</span>
              <span className="text-white font-medium">{analysisData.satelliteAnalysis.areasAnalyzed}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Analysis Type:</span>
              <span className="text-white font-medium">{analysisData.satelliteAnalysis.analysisType}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Insights */}
      {analysisData.keyInsights && analysisData.keyInsights.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4"
        >
          <h4 className="text-xs font-medium text-white mb-3 flex items-center gap-2">
            💡 Key Insights
          </h4>
          <div className="space-y-2">
            {analysisData.keyInsights.slice(0, 3).map((insight, index) => (
              <div key={index} className="text-xs">
                <div className="text-gray-300 font-medium mb-1">{insight.type}</div>
                <div className="text-gray-400">{insight.description}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedAnalytics;
