import * as echarts from 'echarts';

const THEME_COLORS = {
  light: {
    text: '#475569',
    axis: '#e2e8f0',
    primary: '#6366f1',
    secondary: '#38bdf8',
    grid: '#f1f5f9'
  },
  dark: {
    text: '#94a3b8',
    axis: '#1e293b',
    primary: '#bac3ff',
    secondary: '#7dd3fc',
    grid: '#0f172a'
  }
};

const getInteractiveDataZoom = (start = 0, end = 100): echarts.DataZoomComponentOption[] => [
  {
    type: 'inside',
    xAxisIndex: 0,
    start,
    end,
    moveOnMouseWheel: false,
    moveOnMouseMove: true,
    zoomOnMouseWheel: true,
    preventDefaultMouseMove: false,
  },
];

const getResponsiveMedia = (withLegend = false): echarts.EChartsOption['media'] => [
  {
    query: { maxWidth: 640 },
    option: {
      grid: { top: withLegend ? '20%' : '16%', left: '10%', right: '8%', bottom: withLegend ? '14%' : '10%', containLabel: true },
      legend: withLegend
        ? { bottom: 8, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 9 } }
        : undefined,
      xAxis: {
        axisLabel: { fontSize: 9, rotate: 30, hideOverlap: true, interval: 'auto' },
      },
      yAxis: {
        axisLabel: { fontSize: 9 },
      },
      dataZoom: [{ type: 'inside', start: 0, end: 100 }],
    },
  },
];

export const getTemperatureChartOption = (
  times: string[], 
  temperatures: number[], 
  unit: 'C' | 'F' = 'C',
  mode: 'light' | 'dark' = 'dark'
): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
      borderColor: colors.axis,
      textStyle: { color: colors.text, fontWeight: 'bold' },
      formatter: (params: any) => {
        const item = params[0];
        return `<div style="padding: 4px">
          <div style="font-size: 10px; opacity: 0.6; margin-bottom: 4px; font-weight: 900; text-transform: uppercase;">${item.name}</div>
          <div style="font-size: 18px; font-weight: 900">${item.value}°${unit}</div>
        </div>`;
      }
    },
    grid: { top: '15%', left: '2%', right: '2%', bottom: '8%', containLabel: true },
    dataZoom: getInteractiveDataZoom(),
    xAxis: {
      type: 'category',
      data: times.map(t => t.split('T')[1]?.substring(0, 5) || t),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: colors.text, fontSize: 10, fontWeight: 'bold', hideOverlap: true, interval: 'auto' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: colors.grid, type: 'dashed' } },
      axisLabel: { color: colors.text, fontSize: 10, fontWeight: 'bold', formatter: `{value}°` }
    },
    series: [
      {
        data: temperatures,
        type: 'line',
        smooth: 0.4,
        symbol: 'none',
        lineStyle: { width: 4, color: colors.primary, cap: 'round' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${colors.primary}33` },
            { offset: 1, color: `${colors.primary}00` }
          ])
        }
      }
    ],
    media: getResponsiveMedia(false),
  };
};

export const getAQIChartOption = (
  times: string[], 
  pm25: number[], 
  pm10: number[],
  mode: 'light' | 'dark' = 'dark'
): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  return {
    tooltip: { trigger: 'axis', backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff', textStyle: { color: colors.text } },
    legend: { show: true, bottom: 8, itemWidth: 8, itemHeight: 8, textStyle: { color: colors.text, fontWeight: 'bold', fontSize: 10 } },
    grid: { top: '15%', left: '2%', right: '2%', bottom: '14%', containLabel: true },
    dataZoom: getInteractiveDataZoom(),
    xAxis: {
      type: 'category',
      data: times.map(t => t.split('T')[1]?.substring(0, 5) || t),
      axisLine: { show: false },
      axisLabel: { color: colors.text, fontSize: 10, fontWeight: 'bold', hideOverlap: true, interval: 'auto' }
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text, fontSize: 10 } },
    series: [
      {
        name: 'PM2.5',
        data: pm25,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: colors.primary }
      },
      {
        name: 'PM10',
        data: pm10,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: colors.secondary }
      }
    ],
    media: getResponsiveMedia(true),
  };
};

export const getHumidityChartOption = (
  times: string[], 
  humidity: number[],
  mode: 'light' | 'dark' = 'dark'
): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  return {
    grid: { top: '15%', left: '2%', right: '2%', bottom: '8%', containLabel: true },
    dataZoom: getInteractiveDataZoom(),
    xAxis: {
      type: 'category',
      data: times.map(t => t.split('T')[1]?.substring(0, 5) || t),
      axisLine: { show: false },
      axisLabel: { color: colors.text, fontSize: 10, fontWeight: 'bold', hideOverlap: true, interval: 'auto' }
    },
    yAxis: { type: 'value', min: 0, max: 100, splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text, fontSize: 10 } },
    series: [{
      data: humidity,
      type: 'bar',
      itemStyle: { 
        color: colors.primary,
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '40%'
    }],
    media: getResponsiveMedia(false),
  };
};

export const getPrecipitationChartOption = (times: string[], data: number[], mode: 'light' | 'dark' = 'dark'): echarts.EChartsOption => {
    const colors = THEME_COLORS[mode];
    return {
        grid: { top: '15%', left: '2%', right: '2%', bottom: '8%', containLabel: true },
        dataZoom: getInteractiveDataZoom(),
        xAxis: { type: 'category', data: times.map(t => t.split('T')[1]?.substring(0, 5) || t), axisLine: { show: false }, axisLabel: { color: colors.text, fontSize: 10, hideOverlap: true, interval: 'auto' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text, fontSize: 10 } },
        series: [{ data, type: 'line', smooth: true, areaStyle: { color: `${colors.secondary}22` }, lineStyle: { color: colors.secondary, width: 3 }, symbol: 'none' }],
        media: getResponsiveMedia(false),
    };
};

export const getWindChartOption = (times: string[], data: number[], mode: 'light' | 'dark' = 'dark'): echarts.EChartsOption => {
    const colors = THEME_COLORS[mode];
    return {
        grid: { top: '15%', left: '2%', right: '2%', bottom: '8%', containLabel: true },
        dataZoom: getInteractiveDataZoom(),
        xAxis: { type: 'category', data: times.map(t => t.split('T')[1]?.substring(0, 5) || t), axisLine: { show: false }, axisLabel: { color: colors.text, fontSize: 10, hideOverlap: true, interval: 'auto' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text, fontSize: 10 } },
        series: [{ data, type: 'line', step: 'middle', lineStyle: { color: colors.primary, width: 3 }, symbol: 'none' }],
        media: getResponsiveMedia(false),
    };
};

export const getVisibilityChartOption = (times: string[], data: number[], mode: 'light' | 'dark' = 'dark'): echarts.EChartsOption => {
    const colors = THEME_COLORS[mode];
    return {
        grid: { top: '15%', left: '2%', right: '2%', bottom: '8%', containLabel: true },
        dataZoom: getInteractiveDataZoom(),
        xAxis: { type: 'category', data: times.map(t => t.split('T')[1]?.substring(0, 5) || t), axisLine: { show: false }, axisLabel: { color: colors.text, fontSize: 10, hideOverlap: true, interval: 'auto' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text, fontSize: 10 } },
        series: [{ data, type: 'line', smooth: true, lineStyle: { color: colors.primary, width: 3 }, symbol: 'none' }],
        media: getResponsiveMedia(false),
    };
};

export const getHistoricalTemperatureChartOption = (
  times: string[],
  maxTemps: number[],
  minTemps: number[],
  meanTemps: number[],
  unit: 'C' | 'F' = 'C',
  mode: 'light' | 'dark' = 'dark'
): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  return {
    tooltip: { trigger: 'axis', backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff', textStyle: { color: colors.text } },
    legend: { show: true, bottom: 8, textStyle: { color: colors.text, fontWeight: 'bold' } },
    grid: { top: '15%', left: '2%', right: '2%', bottom: '14%', containLabel: true },
    dataZoom: getInteractiveDataZoom(),
    xAxis: { type: 'category', data: times.map(t => t.substring(5)), axisLabel: { color: colors.text, fontSize: 10, hideOverlap: true, interval: 'auto' } },
    yAxis: { type: 'value', axisLabel: { color: colors.text, fontSize: 10, formatter: `{value}°${unit}` } },
    series: [
      { name: 'Max', data: maxTemps, type: 'line', smooth: true, lineStyle: { color: colors.primary, width: 2 }, symbol: 'none' },
      { name: 'Mean', data: meanTemps, type: 'line', smooth: true, lineStyle: { color: '#fbbf24', type: 'dashed', width: 2 }, symbol: 'none' },
      { name: 'Min', data: minTemps, type: 'line', smooth: true, lineStyle: { color: colors.secondary, width: 2 }, symbol: 'none' },
    ],
    media: getResponsiveMedia(true),
  };
};

export const getSunCycleChartOption = (
  times: string[],
  sunriseTimes: string[],
  sunsetTimes: string[],
  mode: 'light' | 'dark' = 'dark'
): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  const parseTime = (isoString: string) => {
    if (!isoString) return 0;
    const time = isoString.split('T')[1];
    const [h, m] = time.split(':');
    return Number.parseInt(h, 10) * 60 + Number.parseInt(m, 10);
  };
  return {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
      textStyle: { color: colors.text },
      formatter: (params: any) => {
        return params.map((p: any) => {
          const h = Math.floor(p.value / 60);
          const m = Math.floor(p.value % 60);
          return `${p.seriesName}: ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }).join('<br/>');
      }
    },
    legend: { show: true, bottom: 8, textStyle: { color: colors.text, fontWeight: 'bold' } },
    grid: { top: '15%', left: '2%', right: '2%', bottom: '14%', containLabel: true },
    dataZoom: getInteractiveDataZoom(),
    xAxis: { type: 'category', data: times.map(t => t.substring(5)), axisLabel: { color: colors.text, fontSize: 10, hideOverlap: true, interval: 'auto' } },
    yAxis: { 
      type: 'value', 
      inverse: true, 
      axisLabel: { 
        color: colors.text, fontSize: 10,
        formatter: (val: number) => `${Math.floor(val/60).toString().padStart(2,'0')}:00` 
      } 
    },
    series: [
      { name: 'Sunrise', data: sunriseTimes.map(parseTime), type: 'line', smooth:true, lineStyle: { color: '#fbbf24', width: 3 }, symbol: 'none' },
      { name: 'Sunset', data: sunsetTimes.map(parseTime), type: 'line', smooth:true, lineStyle: { color: '#f43f5e', width: 3 }, symbol: 'none' }
    ],
    media: getResponsiveMedia(true),
  }
};
