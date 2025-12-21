import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MapPin, BarChart3, Satellite } from 'lucide-react';
import MapView from './MapView';
import DataCharts from './DataCharts';
import AnalyticsTabs from './AnalyticsTabs';
import LocationQueryPanel from './LocationQueryPanel';
import TerraMindInsights from './TerraMindInsights';
import { sendChatMessage, createChatMessage, type ChatMessage } from '../api/chat';

// Helper function to determine analysis type from query
const getAnalysisTypeFromQuery = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('fishing') || lowerQuery.includes('fish') || lowerQuery.includes('marine')) {
    return 'fishing';
  }
  if (lowerQuery.includes('hiking') || lowerQuery.includes('trail') || lowerQuery.includes('trek')) {
    return 'hiking';
  }
  if (lowerQuery.includes('driving') || lowerQuery.includes('traffic') || lowerQuery.includes('road')) {
    return 'driving';
  }
  if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('storm')) {
    return 'weather';
  }
  if (lowerQuery.includes('urban') || lowerQuery.includes('city') || lowerQuery.includes('street')) {
    return 'urban';
  }
  
  return 'default';
};

interface AnalysisData {
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  dataPoints: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  spatialData: {
    center: [number, number];
    zoom: number;
    layers: Array<{
      id: string;
      type: string;
      source: string;
      url: string;
      visible: boolean;
    }>;
  };
  sources: string[];
  // New comprehensive satellite data
  satelliteAnalysis?: {
    landUseChange: string;
    areasAnalyzed: string;
    analysisType: string;
  };
  ndviVegetationAnalysis?: {
    totalChange: string;
    vegetationChange: string;
    urbanChange: string;
    waterChange: string;
    changeIntensity: string;
    validPixels: number;
    ndviComparison?: {
      before: {
        mean: number;
        median: number;
        max: number;
        min: number;
      };
      after: {
        mean: number;
        median: number;
        max: number;
        min: number;
      };
    };
    landUseDistribution?: Array<{
      type: string;
      value: number;
    }>;
  };
  keyInsights?: Array<{
    type: string;
    description: string;
    confidence: string;
  }>;
  recommendations?: string[];
  changeDetectionData?: any;
  satelliteImagery?: {
    success: boolean;
    coordinates: { lat: number; lng: number };
    timeRange: {
      before: string;
      after: string;
    };
    images: {
      before: {
        sentinelHub: string;
        nasa: string;
        timestamp: string;
        source: string;
      };
      after: {
        sentinelHub: string;
        nasa: string;
        timestamp: string;
        source: string;
      };
      spectral: {
        ndvi: string;
        ndwi: string;
        infrared: string;
      };
    };
    availability: {
      before: boolean;
      after: boolean;
    };
    metadata: {
      resolution: string;
      source: string;
      processing: string;
      cloudCover: string;
    };
  };
  spectralAnalysis?: {
    success: boolean;
    spectralImages: {
      ndvi: {
        before: string;
        after: string;
        description: string;
      };
      ndwi: {
        before: string;
        after: string;
        description: string;
      };
      infrared: {
        before: string;
        after: string;
        description: string;
      };
    };
  };
}

interface ResultsViewProps {
  query: string;
  coordinates?: { lat: number; lng: number };
  analysisData: AnalysisData;
  onNewSearch: () => void;
}


const ResultsView: React.FC<ResultsViewProps> = ({ 
  query, 
  coordinates, 
  analysisData, 
  onNewSearch 
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'user',
      content: query,
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'ai',
      content: analysisData.summary,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [activeMapView, setActiveMapView] = useState<'map' | 'analytics' | 'ndvi' | 'terramind'>('map');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  // Geotagging state
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationPanel, setShowLocationPanel] = useState(false);

  // Handle location selection from map
  const handleLocationSelect = (coordinates: { lat: number; lng: number }) => {
    setSelectedLocation(coordinates);
    setShowLocationPanel(true);
  };

  // Handle asking question about selected location
  const handleLocationQuestion = async (question: string, coordinates: { lat: number; lng: number }) => {
    // Add location context to the question
    const contextualQuestion = `At location ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}: ${question}`;
    
    const userMessage = createChatMessage('user', contextualQuestion);
    setChatMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    try {
      const response = await sendChatMessage({
        message: contextualQuestion,
        userId: 'user_' + Date.now(),
        conversationId: conversationId || undefined
      });

      if (response.success) {
        const aiMessage = createChatMessage('ai', response.response);
        setChatMessages(prev => [...prev, aiMessage]);
        
        if (response.conversationId) {
          setConversationId(response.conversationId);
        }
      } else {
        const errorMessage = createChatMessage('ai', 'Sorry, I couldn\'t process your question about that location.');
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending location question:', error);
      const errorMessage = createChatMessage('ai', 'Sorry, there was an error processing your question.');
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMessage = createChatMessage('user', newMessage);
    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: currentMessage,
        context: {
          coordinates: coordinates,
        },
        analysisData: {
          summary: analysisData.summary,
          sources: analysisData.sources,
          dataPoints: analysisData.dataPoints,
        },
        userId: 'user', // In a real app, this would be the actual user ID
        conversationId: conversationId || undefined
      });

      // Store conversation ID for future messages
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }

      const aiMessage = createChatMessage('ai', response.response);
      setChatMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = createChatMessage('ai', 
        "I apologize, but I'm having trouble processing your message right now. Please try again in a moment."
      );
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLayers = analysisData.spatialData.layers;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen textured-grid p-6"
    >
      {/* Bunker Logo - Top Left Corner */}
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-2xl font-semibold text-white">Bunker</h2>
      </div>

      {/* Dashboard Control Bar */}
      <header className="flex items-center justify-center mb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          
          {/* New Query Button */}
          <button 
            onClick={onNewSearch}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-sm">New Query</span>
          </button>

          {/* Segmented Control Container */}
          <div className="bg-gray-700 rounded-full p-0.5 shadow-md flex">
            
            {/* Map View Button */}
            <button
              onClick={() => setActiveMapView('map')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeMapView === 'map'
                  ? 'bg-white text-gray-800'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>

            {/* Analytics Button */}
            <button
              onClick={() => setActiveMapView('analytics')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeMapView === 'analytics'
                  ? 'bg-white text-gray-800'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            {/* NDVI Button */}
            <button
              onClick={() => setActiveMapView('ndvi')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeMapView === 'ndvi'
                  ? 'bg-white text-gray-800'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>NDVI</span>
            </button>

            {/* NEW: TerraMind Button - Only show if TerraMind data is available */}
            {analysisData.terraMindInsights && (
              <button
                onClick={() => setActiveMapView('terramind')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeMapView === 'terramind'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-300 hover:text-white border border-blue-500/30'
                }`}
                title="IBM TerraMind AI Geospatial Analysis"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
                TerraMind AI
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Split-screen layout */}
      <div className="flex gap-6 h-[calc(100vh-140px)] max-w-7xl mx-auto overflow-hidden">
        
        {/* Left Panel - Chat Interface */}
        <div className="w-1/3 bg-black/60 backdrop-blur rounded-2xl border border-gray-700 flex flex-col h-full">
          
          {/* Panel Header */}
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-2">Query History</h3>
            <p className="text-gray-400 text-sm">Continue the conversation about this analysis</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/40 text-gray-200 border border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      message.type === 'user' ? 'bg-blue-300' : 'bg-green-400'
                    }`}></div>
                    <span className={`text-xs font-normal ${
                      message.type === 'user' ? 'text-blue-100' : 'text-green-300'
                    }`}>
                      {message.type === 'user' ? 'You' : 'AI'}
                    </span>
                  </div>
                  <p className="text-xs leading-snug font-light">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSendMessage}>
              <div className="bg-gray-800/40 rounded-lg px-3 py-2 border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask follow-up questions..."
                    className="bg-transparent text-gray-200 text-xs flex-grow outline-none placeholder:text-gray-500 caret-blue-400 font-light"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Data Visualization */}
        <div className="w-2/3 bg-black/60 backdrop-blur rounded-2xl border border-gray-700 flex flex-col h-full overflow-hidden">

          {/* Main Visualization Area */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="h-full flex gap-3 overflow-hidden">
              
              {/* Main Map Box - Only show when in map view */}
              {activeMapView === 'map' && (
                <div className="flex-1 bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 relative overflow-hidden">
                  <div className="absolute inset-0">
                    <MapView
                      center={analysisData.spatialData.center}
                      zoom={analysisData.spatialData.zoom}
                      layers={filteredLayers}
                      analysisType={getAnalysisTypeFromQuery(query)}
                      showLightingControl={true}
                      show3DControls={true}
                      enableGeotagging={true}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                  
                  {/* Map Overlay Info */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur rounded-md px-3 py-1.5">
                    <div className="text-xs text-gray-300 font-medium">
                      Spatial Analysis
                    </div>
                  </div>
                  
                  {/* Geotagging Instructions */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur rounded-md px-3 py-1.5">
                    <div className="text-xs text-gray-300 font-medium">
                      📍 Click anywhere to select a location
                    </div>
                  </div>
                  
                  {/* Map Attribution */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur rounded-md px-2 py-1">
                    <div className="text-xs text-gray-400">mapbox</div>
                  </div>
                  
                  {/* Location Query Panel */}
                  {selectedLocation && (
                    <LocationQueryPanel
                      coordinates={selectedLocation}
                      isVisible={showLocationPanel}
                      onClose={() => setShowLocationPanel(false)}
                      onAskQuestion={handleLocationQuestion}
                    />
                  )}
                </div>
              )}

              {/* Charts Area - Only show when not in map view */}
              {activeMapView !== 'map' && (
                <div className="w-full h-full overflow-hidden">
                  {activeMapView === 'analytics' ? (
                    <AnalyticsTabs 
                      analysisData={analysisData} 
                      query={query}
                      coordinates={coordinates || { lat: 0, lng: 0 }}
                    />
                  ) : activeMapView === 'terramind' && analysisData.terraMindInsights ? (
                    <TerraMindInsights
                      terraMindData={analysisData.terraMindInsights}
                      coordinates={coordinates || { lat: 0, lng: 0 }}
                    />
                  ) : (
                    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-smooth">
                      <div className="flex gap-3 p-1">
                        {/* Enhanced Analytics or NDVI Data */}
                        <div className="flex-1">
                          <div className="flex flex-col gap-3 pb-4">
                              {/* NDVI Vegetation Analysis */}
                              {analysisData.ndviVegetationAnalysis && (
                                <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
                                  <h4 className="text-xs font-medium text-white mb-3">NDVI Vegetation Analysis</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Total Change:</span>
                                      <span className="text-white font-medium">{analysisData.ndviVegetationAnalysis.totalChange}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Vegetation Change:</span>
                                      <span className={`font-medium ${parseFloat(analysisData.ndviVegetationAnalysis.vegetationChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {analysisData.ndviVegetationAnalysis.vegetationChange}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Urban Change:</span>
                                      <span className={`font-medium ${parseFloat(analysisData.ndviVegetationAnalysis.urbanChange) >= 0 ? 'text-orange-400' : 'text-blue-400'}`}>
                                        {analysisData.ndviVegetationAnalysis.urbanChange}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Water Change:</span>
                                      <span className={`font-medium ${parseFloat(analysisData.ndviVegetationAnalysis.waterChange) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                        {analysisData.ndviVegetationAnalysis.waterChange}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Change Intensity:</span>
                                      <span className={`font-medium ${
                                        analysisData.ndviVegetationAnalysis.changeIntensity === 'high' ? 'text-red-400' :
                                        analysisData.ndviVegetationAnalysis.changeIntensity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                                      }`}>
                                        {analysisData.ndviVegetationAnalysis.changeIntensity}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Valid Pixels:</span>
                                      <span className="text-white font-medium">{analysisData.ndviVegetationAnalysis.validPixels?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Additional NDVI Content */}
                              <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
                                <h4 className="text-xs font-medium text-white mb-3">NDVI Statistics</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Mean NDVI:</span>
                                    <span className="text-white font-medium">0.67</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Median NDVI:</span>
                                    <span className="text-white font-medium">0.64</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Max NDVI:</span>
                                    <span className="text-green-400 font-medium">0.89</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Min NDVI:</span>
                                    <span className="text-red-400 font-medium">0.12</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
                                <h4 className="text-xs font-medium text-white mb-3">Vegetation Health</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Health Score:</span>
                                    <span className="text-green-400 font-medium">Good</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Density:</span>
                                    <span className="text-white font-medium">High</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Coverage:</span>
                                    <span className="text-white font-medium">78.5%</span>
                                  </div>
                                </div>
                              </div>
                          </div>
                        </div>

                        {/* Chart.js Data Visualization */}
                        <div className="flex-1">
                          <DataCharts analysisData={analysisData} activeTab={activeMapView} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Data Sources Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-xs">
                Data sources: {analysisData.sources.join(', ')}
              </div>
              {coordinates && (
                <div className="text-gray-400 text-xs">
                  Location: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsView;
