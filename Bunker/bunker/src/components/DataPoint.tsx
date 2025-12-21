import React from 'react';

interface DataPointProps {
  label: string;
  value: string | number;
  unit?: string;
}

const DataPoint: React.FC<DataPointProps> = ({ label, value, unit }) => {
  return (
    <div className="bg-gray-900/50 rounded-lg p-3">
      <div className="text-xs text-bunker-textSecondary uppercase tracking-wide">
        {label}
      </div>
      <div className="text-lg font-semibold text-bunker-textPrimary">
        {value}{unit && <span className="text-sm text-bunker-textSecondary ml-1">{unit}</span>}
      </div>
    </div>
  );
};

export default DataPoint;
