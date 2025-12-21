import React from 'react';

interface RiskIndicatorProps {
  level: 'low' | 'medium' | 'high';
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ level }) => {
  const getColor = () => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLabel = () => {
    switch (level) {
      case 'low':
        return 'Low Risk';
      case 'medium':
        return 'Medium Risk';
      case 'high':
        return 'High Risk';
      default:
        return 'Unknown Risk';
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-bunker-textSecondary">Risk Level</span>
        <span className="text-sm font-medium text-bunker-textPrimary">{getLabel()}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: level === 'low' ? '33%' : level === 'medium' ? '66%' : '100%' }}
        />
      </div>
    </div>
  );
};

export default RiskIndicator;
