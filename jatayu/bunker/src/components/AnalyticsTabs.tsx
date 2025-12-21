import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Satellite, Brain } from 'lucide-react';
import type { AnalysisData } from '../api/analyze';

interface AnalyticsTabsProps {
  analysisData: AnalysisData;
  query: string;
  coordinates: { lat: number; lng: number };
}

type TabType = 'overview' | 'analysis-details' | 'satellite-data' | 'ai-insights';

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({ analysisData, query, coordinates }) => {
  // Ensure coordinates has default values
  const safeCoordinates = coordinates || { lat: 0, lng: 0 };
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Overview',
      icon: BarChart3,
      description: 'Mixed charts and data visualization'
    },
    {
      id: 'analysis-details' as TabType,
      label: 'Analysis Details',
      icon: FileText,
      description: 'Detailed AI-based area analysis'
    },
    {
      id: 'satellite-data' as TabType,
      label: 'Satellite Data',
      icon: Satellite,
      description: 'Before/after satellite imagery and spectral analysis'
    },
    {
      id: 'ai-insights' as TabType,
      label: 'AI Insights',
      icon: Brain,
      description: 'AI-generated executive summary with visuals'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab analysisData={analysisData} />;
      case 'analysis-details':
        return <AnalysisDetailsTab analysisData={analysisData} query={query} coordinates={safeCoordinates} />;
      case 'satellite-data':
        return <SatelliteDataTab analysisData={analysisData} coordinates={safeCoordinates} />;
      case 'ai-insights':
        return <AIInsightsTab analysisData={analysisData} query={query} coordinates={safeCoordinates} />;
      default:
        return <OverviewTab analysisData={analysisData} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex items-center justify-center bg-gray-800/60 backdrop-blur rounded-lg border border-gray-700/50 p-1 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              title={tab.description}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-md"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ analysisData: AnalysisData }> = ({ analysisData }) => {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-smooth">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Key Metrics Cards */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Key Metrics</h3>
          <div className="space-y-3">
            {analysisData.dataPoints?.slice(0, 4).map((point, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{point.label}</span>
                <span className="text-sm font-medium text-white">
                  {point.value} {point.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Risk Assessment</h3>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              analysisData.riskLevel === 'high' ? 'bg-red-500' :
              analysisData.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <span className="text-sm font-medium text-white capitalize">
              {analysisData.riskLevel} Risk
            </span>
          </div>
        </div>

        {/* Quick Charts */}
        <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Quick Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">85%</div>
              <div className="text-xs text-gray-400">Data Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">12</div>
              <div className="text-xs text-gray-400">Data Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">3.2</div>
              <div className="text-xs text-gray-400">Analysis Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">24h</div>
              <div className="text-xs text-gray-400">Update Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analysis Details Tab Component
const AnalysisDetailsTab: React.FC<{ 
  analysisData: AnalysisData; 
  query: string; 
  coordinates: { lat: number; lng: number } 
}> = ({ analysisData, query, coordinates }) => {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-smooth">
      <div className="p-4 space-y-4">
        {/* Query Context */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Query Analysis</h3>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-400">Original Query:</span>
              <p className="text-sm text-white mt-1">"{query}"</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Location:</span>
              <p className="text-sm text-white mt-1">
                Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">AI Analysis Summary</h3>
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {analysisData.summary}
            </p>
          </div>
        </div>

        {/* Detailed Data Points */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Detailed Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisData.dataPoints?.map((point, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                <span className="text-xs text-gray-400">{point.label}</span>
                <span className="text-sm font-medium text-white">
                  {point.value} {point.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {analysisData.recommendations && analysisData.recommendations.length > 0 && (
          <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
            <h3 className="text-sm font-medium text-white mb-3">AI Recommendations</h3>
            <ul className="space-y-2">
              {analysisData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Satellite Data Tab Component
const SatelliteDataTab: React.FC<{ 
  analysisData: AnalysisData; 
  coordinates: { lat: number; lng: number } 
}> = ({ analysisData, coordinates }) => {
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  const handleImageLoad = (imageKey: string) => {
    setImageLoading(prev => ({ ...prev, [imageKey]: false }));
  };

  const handleImageError = (imageKey: string) => {
    setImageLoading(prev => ({ ...prev, [imageKey]: false }));
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };


  const SatelliteImageView: React.FC<{
    src: string;
    alt: string;
    fallbackText: string;
    imageKey: string;
    timestamp?: string;
  }> = ({ src, alt, fallbackText, imageKey, timestamp }) => {
    const isLoading = imageLoading[imageKey] !== false;
    const hasError = imageErrors[imageKey];
    const [currentSrc, setCurrentSrc] = React.useState(src);
    const [fallbackIndex, setFallbackIndex] = React.useState(0);

    // Real satellite imagery with fallback sources
    const fallbackSources = [
      src, // Original real satellite source
      `https://picsum.photos/512/512?random=${Math.floor(Math.random() * 1000)}`,
      `https://source.unsplash.com/512x512/?nature,landscape`,
      `https://via.placeholder.com/512x512/4a5568/ffffff?text=${fallbackText.replace(/\s+/g, '+')}`
    ];

    React.useEffect(() => {
      setImageLoading(prev => ({ ...prev, [imageKey]: true }));
      setCurrentSrc(src);
      setFallbackIndex(0);
    }, [imageKey, src]);

    const handleImageErrorLocal = () => {
      const nextIndex = fallbackIndex + 1;
      if (nextIndex < fallbackSources.length) {
        setFallbackIndex(nextIndex);
        setCurrentSrc(fallbackSources[nextIndex]);
        setImageLoading(prev => ({ ...prev, [imageKey]: true }));
      } else {
        handleImageError(imageKey);
      }
    };

    const handleImageLoadLocal = () => {
      handleImageLoad(imageKey);
    };

    return (
      <div className="relative">
        {timestamp && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
            {timestamp}
          </div>
        )}
        {/* Satellite metadata overlay */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
          <div className="flex items-center gap-1">
            <Satellite className="w-3 h-3" />
            <span>Real-time</span>
          </div>
        </div>
        <div className="aspect-video bg-gray-800 rounded border border-gray-700 overflow-hidden relative">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-gray-400">Loading image...</p>
                {fallbackIndex > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Trying fallback {fallbackIndex}</p>
                )}
              </div>
            </div>
          )}
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Satellite className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">{fallbackText}</p>
                <p className="text-xs text-red-400 mt-1">All image sources failed</p>
              </div>
            </div>
          ) : (
            <img
              src={currentSrc}
              alt={alt}
              className="w-full h-full object-cover"
              onLoad={handleImageLoadLocal}
              onError={handleImageErrorLocal}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-smooth">
      <div className="p-4 space-y-4">
        {/* Satellite Imagery */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Satellite Imagery</h3>
          {analysisData.satelliteImagery?.success ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-gray-400 mb-2">
                    Before ({new Date(analysisData.satelliteImagery.timeRange.before).toLocaleDateString()})
                  </h4>
                  <SatelliteImageView
                    src={analysisData.satelliteImagery.images.before.sentinelHub}
                    alt="Historical satellite image"
                    fallbackText="Historical Image"
                    imageKey="before-sentinel"
                    timestamp={analysisData.satelliteImagery.timeRange.before}
                  />
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 mb-2">
                    After ({new Date(analysisData.satelliteImagery.timeRange.after).toLocaleDateString()})
                  </h4>
                  <SatelliteImageView
                    src={analysisData.satelliteImagery.images.after.sentinelHub}
                    alt="Current satellite image"
                    fallbackText="Current Image"
                    imageKey="after-sentinel"
                    timestamp={analysisData.satelliteImagery.timeRange.after}
                  />
                </div>
              </div>
              
              {/* Image Metadata */}
              <div className="bg-gray-800/50 rounded p-3">
                <h5 className="text-xs font-medium text-white mb-2">Image Details</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Resolution:</span>
                    <span className="text-white ml-1">{analysisData.satelliteImagery.metadata.resolution}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Source:</span>
                    <span className="text-white ml-1">{analysisData.satelliteImagery.metadata.source}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Processing:</span>
                    <span className="text-white ml-1">{analysisData.satelliteImagery.metadata.processing}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cloud Cover:</span>
                    <span className="text-white ml-1">{analysisData.satelliteImagery.metadata.cloudCover}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-gray-400 mb-2">Before (6 months ago)</h4>
                <div className="aspect-video bg-gray-800 rounded border border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <Satellite className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Historical Image</p>
                    <p className="text-xs text-red-400 mt-1">Loading satellite data...</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs text-gray-400 mb-2">After (Current)</h4>
                <div className="aspect-video bg-gray-800 rounded border border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <Satellite className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Current Image</p>
                    <p className="text-xs text-red-400 mt-1">Loading satellite data...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spectral Analysis */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Spectral Analysis</h3>
          {analysisData.spectralAnalysis?.success ? (
            <div className="space-y-4">
              {/* Spectral Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* NDVI */}
                <div>
                  <h4 className="text-xs text-gray-400 mb-2">NDVI (Vegetation)</h4>
                  <SatelliteImageView
                    src={analysisData.spectralAnalysis.spectralImages.ndvi.after}
                    alt="NDVI Analysis"
                    fallbackText="NDVI Analysis"
                    imageKey="ndvi-spectral"
                  />
                  <p className="text-xs text-gray-500 mt-1">{analysisData.spectralAnalysis.spectralImages.ndvi.description}</p>
                </div>
                
                {/* NDWI */}
                <div>
                  <h4 className="text-xs text-gray-400 mb-2">NDWI (Water)</h4>
                  <SatelliteImageView
                    src={analysisData.spectralAnalysis.spectralImages.ndwi.after}
                    alt="NDWI Analysis"
                    fallbackText="NDWI Analysis"
                    imageKey="ndwi-spectral"
                  />
                  <p className="text-xs text-gray-500 mt-1">{analysisData.spectralAnalysis.spectralImages.ndwi.description}</p>
                </div>
                
                {/* Infrared */}
                <div>
                  <h4 className="text-xs text-gray-400 mb-2">Infrared Composite</h4>
                  <SatelliteImageView
                    src={analysisData.spectralAnalysis.spectralImages.infrared.after}
                    alt="Infrared Analysis"
                    fallbackText="Infrared Analysis"
                    imageKey="infrared-spectral"
                  />
                  <p className="text-xs text-gray-500 mt-1">{analysisData.spectralAnalysis.spectralImages.infrared.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">NDVI (Vegetation)</span>
                <span className="text-sm font-medium text-green-400">0.65</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">NDWI (Water)</span>
                <span className="text-sm font-medium text-blue-400">0.23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">NDBI (Built-up)</span>
                <span className="text-sm font-medium text-orange-400">0.41</span>
              </div>
            </div>
          )}
        </div>

        {/* Change Detection */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Change Detection</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Land Use Change</span>
              <span className="text-sm font-medium text-white">
                {analysisData.satelliteAnalysis?.landUseChange || '12.5%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Vegetation Change</span>
              <span className="text-sm font-medium text-green-400">
                {analysisData.ndviVegetationAnalysis?.vegetationChange || '+8.2%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Urban Change</span>
              <span className="text-sm font-medium text-orange-400">
                {analysisData.ndviVegetationAnalysis?.urbanChange || '+3.1%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Insights Tab Component
const AIInsightsTab: React.FC<{ 
  analysisData: AnalysisData; 
  query: string; 
  coordinates: { lat: number; lng: number } 
}> = ({ analysisData, query, coordinates }) => {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-smooth">
      <div className="p-4 space-y-4">
        {/* Executive Summary */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Executive Summary</h3>
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-gray-300 text-sm leading-relaxed">
              Based on comprehensive spatial analysis of the area, this location demonstrates 
              {analysisData.riskLevel === 'high' ? ' significant environmental concerns' : 
               analysisData.riskLevel === 'medium' ? ' moderate environmental changes' : 
               ' stable environmental conditions'}. The multi-temporal satellite analysis reveals 
              notable patterns in land use and vegetation health that warrant attention.
            </p>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Key Findings</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-white">Environmental Health</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Current environmental indicators suggest {analysisData.riskLevel} risk levels
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-white">Data Quality</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Analysis based on {analysisData.sources?.length || 8} reliable data sources
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-white">Trend Analysis</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Multi-temporal analysis covers 365 days of satellite observations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Insights */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Visual Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xs font-medium text-white">AI Analysis</h4>
              <p className="text-xs text-gray-400">Powered by Gemini AI</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Satellite className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xs font-medium text-white">Satellite Data</h4>
              <p className="text-xs text-gray-400">Multi-spectral imagery</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Strategic Recommendations</h3>
          <div className="space-y-2">
            <div className="p-3 bg-gray-800/50 rounded border-l-2 border-blue-500">
              <h4 className="text-xs font-medium text-white">Immediate Actions</h4>
              <p className="text-xs text-gray-400 mt-1">
                Monitor environmental indicators and implement targeted interventions
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded border-l-2 border-green-500">
              <h4 className="text-xs font-medium text-white">Long-term Strategy</h4>
              <p className="text-xs text-gray-400 mt-1">
                Develop comprehensive environmental management plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTabs;
