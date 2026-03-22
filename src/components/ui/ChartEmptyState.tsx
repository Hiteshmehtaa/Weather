import React from 'react';

interface ChartEmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  className?: string;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  title,
  description = 'Try changing the date or location range.',
  icon = 'insights',
  className = '',
}) => {
  return (
    <div className={`h-full min-h-[300px] flex items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-low/70 ${className}`}>
      <div className="text-center px-6">
        <span className="material-symbols-outlined text-primary/70 text-4xl mb-2 block">{icon}</span>
        <p className="text-on-surface font-semibold text-sm">{title}</p>
        <p className="text-on-surface-variant text-xs mt-1">{description}</p>
      </div>
    </div>
  );
};
