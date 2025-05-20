import React, { ReactNode } from 'react';

interface StatsCardProps {
  value: string | number;
  description: string;
  icon?: ReactNode;
  className?: string;
  iconPosition?: 'left' | 'right';
  iconColor?: string;
}

/**
 * Stats Card Component
 * Displays a single statistic with value, description and optional icon
 */
const StatsCard: React.FC<StatsCardProps> = ({
  value,
  description,
  icon,
  className = '',
  iconPosition = 'right',
  iconColor = 'text-amber-500'
}) => {
  return (
    <div className={`bg-white p-4 rounded-md shadow-sm flex ${className}`}>
      {iconPosition === 'left' && icon && (
        <div className={`mr-3 ${iconColor}`}>{icon}</div>
      )}
      
      <div className="flex-1">
        <div className="text-xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      
      {iconPosition === 'right' && icon && (
        <div className={`ml-auto ${iconColor}`}>{icon}</div>
      )}
    </div>
  );
};

export default StatsCard;
