import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Satellite, TrendingUp, Leaf, Building, Droplets } from 'lucide-react';
import type { AnalysisData } from '../api/analyze';

interface TerraMindInsightsProps {
  terraMindData: NonNullable<AnalysisData['terraMindInsights']>;
  coordinates: { lat: number; lng: number };
}

const TerraMindInsights: React.FC<TerraMindInsightsProps> = ({ 
  terraMindData, 
  coordinates 
}) => {
  const [activeSection, setActiveSection] = useState<'landuse' | 'vegetation' | 'change' | 'environmental'>('landuse');

  const sections = [
    { id: 'landuse', label: 'Land Use', icon: Building, color: 'blue' },
    { id: 'vegetation', label: 'Vegetation', icon: Leaf, color: 'green' },
    { id: 'change', label: 'Change Detection', icon: TrendingUp, color: 'orange' },
    { id: 'environmental', label: 'Environmental', icon: Droplets, color: 'purple' }
  ];

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border') => {
    const colors = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' }
    };
    return colors[color]?.[variant] || colors.blue[variant];
  };

  const renderLandUseClassification = () => {
    const data = terraMindData.landUseClassification;
    if (!data) return <div className="text-gray-400 text-sm">No land use data available</div>;

    return (
      <div className="space-y-4">
        {/* Primary Classification */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" />
            Primary Land Use: {data.primary_class.replace('_', ' ').toUpperCase()}
          </h4>
          <div className="text-xs text-gray-400">
            Confidence: <span className="text-blue-400 font-medium">{(data.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Land Use Distribution */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Land Use Distribution</h4>
          <div className="space-y-2">
            {Object.entries(data.classes).map(([type, percentage]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-xs text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getColorClasses(
                        type === 'urban' ? 'orange' : 
                        type === 'vegetation' ? 'green' : 
                        type === 'water' ? 'blue' : 'purple', 'bg'
                      )}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-medium w-10 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Change Indicators */}
        {data.change_indicators && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Change Indicators</h4>
            <div className="space-y-2">
              {Object.entries(data.change_indicators).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                  <span className={`text-xs font-medium ${
                    value.startsWith('+') ? 'text-orange-400' : 
                    value.startsWith('-') ? 'text-green-400' : 'text-white'
                  }`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVegetationHealth = () => {
    const data = terraMindData.vegetationHealth;
    if (!data) return <div className="text-gray-400 text-sm">No vegetation data available</div>;

    const getHealthColor = (category: string) => {
      switch (category) {
        case 'excellent': return 'text-green-400';
        case 'good': return 'text-green-300';
        case 'moderate': return 'text-yellow-400';
        case 'poor': return 'text-orange-400';
        case 'very_poor': return 'text-red-400';
        default: return 'text-gray-400';
      }
    };

    return (
      <div className="space-y-4">
        {/* NDVI Score */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-400" />
            NDVI Score: {data.ndvi_score}
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${(parseFloat(data.ndvi_score) * 100)}%` }}
                />
              </div>
            </div>
            <span className={`text-sm font-medium capitalize ${getHealthColor(data.health_category)}`}>
              {data.health_category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Stress Indicators */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Stress Indicators</h4>
          <div className="space-y-2">
            {Object.entries(data.stress_indicators).map(([indicator, level]) => (
              <div key={indicator} className="flex justify-between items-center">
                <span className="text-xs text-gray-400 capitalize">{indicator.replace('_', ' ')}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  level === 'low' ? 'bg-green-500/20 text-green-400' :
                  level === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Temporal Trends */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Temporal Trends</h4>
          <div className="space-y-2">
            {Object.entries(data.temporal_trends).map(([trend, value]) => (
              <div key={trend} className="flex justify-between items-center">
                <span className="text-xs text-gray-400 capitalize">{trend.replace('_', ' ')}</span>
                <span className="text-xs text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderChangeDetection = () => {
    const data = terraMindData.changeDetectionAI;
    if (!data) return <div className="text-gray-400 text-sm">No change detection data available</div>;

    return (
      <div className="space-y-4">
        {/* Temporal Analysis */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            Temporal Analysis
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Analysis Period</span>
              <span className="text-xs text-white font-medium">{data.temporal_analysis.analysis_period}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Significant Changes</span>
              <span className="text-xs text-orange-400 font-medium">{data.temporal_analysis.significant_changes}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Confidence</span>
              <span className="text-xs text-green-400 font-medium">
                {(data.temporal_analysis.change_confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Land Cover Changes */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Land Cover Changes</h4>
          <div className="space-y-2">
            {Object.entries(data.land_cover_changes).map(([change, value]) => (
              <div key={change} className="flex justify-between items-center">
                <span className="text-xs text-gray-400 capitalize">{change.replace('_', ' ')}</span>
                <span className={`text-xs font-medium ${
                  value.startsWith('+') ? 'text-red-400' : 
                  value.startsWith('-') ? 'text-green-400' : 'text-white'
                }`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEnvironmentalAssessment = () => {
    const data = terraMindData.environmentalAssessment;
    if (!data) return <div className="text-gray-400 text-sm">No environmental data available</div>;

    return (
      <div className="space-y-4">
        {/* Environmental Score */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-purple-400" />
            Environmental Score: {data.environmental_score}/10
          </h4>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              style={{ width: `${(parseFloat(data.environmental_score) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Sustainability Indicators */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Sustainability Indicators</h4>
          <div className="space-y-2">
            {Object.entries(data.sustainability_indicators).map(([indicator, value]) => (
              <div key={indicator} className="flex justify-between items-center">
                <span className="text-xs text-gray-400 capitalize">{indicator.replace('_', ' ')}</span>
                <span className="text-xs text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'landuse': return renderLandUseClassification();
      case 'vegetation': return renderVegetationHealth();
      case 'change': return renderChangeDetection();
      case 'environmental': return renderEnvironmentalAssessment();
      default: return renderLandUseClassification();
    }
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-medium text-white">TerraMind Geospatial Analysis</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Satellite className="w-3 h-3" />
          <span>IBM + ESA AI Model</span>
          <span className="text-green-400">
            {(terraMindData.confidence * 100).toFixed(1)}% confidence
          </span>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex items-center gap-1 mb-4 bg-gray-800/50 rounded-lg p-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs transition-all duration-200 ${
                isActive
                  ? `${getColorClasses(section.color, 'bg')} ${getColorClasses(section.color, 'text')}`
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>

      {/* TerraMind Insights */}
      {terraMindData.geospatialInsights && terraMindData.geospatialInsights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            🧠 AI Insights
          </h4>
          <div className="space-y-2">
            {terraMindData.geospatialInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <span className="text-xs text-gray-300">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Info */}
      <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500">
        <span>Model: {terraMindData.model}</span>
        {terraMindData.processingTime && (
          <span>Processed in {terraMindData.processingTime}s</span>
        )}
      </div>
    </div>
  );
};

export default TerraMindInsights;
