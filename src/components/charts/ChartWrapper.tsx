import React from 'react';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface ChartWrapperProps {
  option: echarts.EChartsOption;
  className?: string;
  hasData?: boolean;
  errorMessage?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({ 
  option, 
  className,
  hasData = true,
  errorMessage = 'No data available for this chart'
}) => {
  // Return error state if no data
  if (!hasData) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={twMerge(
          "w-full h-[400px] rounded-lg flex items-center justify-center bg-surface-container/50 border border-outline-variant/20",
          className
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl">no_data</span>
          <p className="text-on-surface-variant/60 text-sm font-medium">{errorMessage}</p>
        </div>
      </motion.div>
    );
  }

  // Merge default premium styling for transparent backgrounds and neutral colors
  const mergedOption: echarts.EChartsOption = {
    ...option,
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    // We expect the option to already have specific colors, 
    // but we ensure the grid is clean
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
      ...option.grid
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={twMerge("w-full h-[400px] overflow-hidden", className)}
    >
      <ReactECharts
        option={mergedOption}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        theme="dark"
      />
    </motion.div>
  );
};
