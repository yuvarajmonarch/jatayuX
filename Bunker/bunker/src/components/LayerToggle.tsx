import React, { useState } from 'react';

interface LayerToggleProps {
  label: string;
  defaultChecked?: boolean;
  onToggle?: (checked: boolean) => void;
}

const LayerToggle: React.FC<LayerToggleProps> = ({ label, defaultChecked = false, onToggle }) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onToggle?.(newChecked);
  };

  return (
    <button
      onClick={handleToggle}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
        isChecked
          ? 'bg-bunker-accent text-white'
          : 'bg-bunker-border text-bunker-textSecondary hover:text-bunker-textPrimary'
      }`}
    >
      {label}
    </button>
  );
};

export default LayerToggle;
