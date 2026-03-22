import React from 'react';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface ChartWrapperProps {
  option: echarts.EChartsOption;
  className?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({ option, className }) => {
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
        theme="light" // We will handle dark mode via option colors in chartConfigs
      />
    </motion.div>
  );
};
