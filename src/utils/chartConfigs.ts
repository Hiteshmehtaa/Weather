import * as echarts from 'echarts';

const THEME_COLORS = {
  light: {
    text: '#35343b',
    axis: '#948e9c',
    primary: '#6550a8',
    secondary: '#01419c',
    tertiary: '#004b70',
    grid: 'rgba(148, 142, 156, 0.2)'
  },
  dark: {
    text: '#cac4d3',
    axis: 'transparent',
    primary: '#d0c1ff',
    secondary: '#b0c6ff',
    tertiary: '#95d0ff',
    grid: 'rgba(72, 69, 81, 0.2)'
  }
};

const withChartMicroAnimation = (option: echarts.EChartsOption): echarts.EChartsOption => {
  const baseSeries = (Array.isArray(option.series) ? option.series : []) as echarts.SeriesOption[];

  const animatedSeries = baseSeries.map((series, index) => ({
    ...series,
    animationDuration: 650,
    animationEasing: 'cubicOut' as const,
    animationDelay: index * 80,
    animationDurationUpdate: 420,
    animationEasingUpdate: 'quarticOut' as const,
  }));

  return {
    ...option,
    animation: true,
    animationDuration: 500,
    animationEasing: 'cubicOut' as const,
    animationDurationUpdate: 350,
    animationEasingUpdate: 'quarticOut' as const,
    series: animatedSeries,
  };
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
  return withChartMicroAnimation({
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
      show: false,
      splitLine: { show: false },
    },
    series: [
      {
        data: temperatures,
        type: 'bar',
        barWidth: '100%',
        itemStyle: {
          color: 'rgba(74, 68, 88, 0.8)',
          borderColor: '#131319',
          borderWidth: 1,
          borderRadius: 0
        },
        emphasis: {
          itemStyle: { color: colors.primary }
        }
      }
    ],
    media: getResponsiveMedia(false),
  });
};

export const getAQIChartOption = (
  times: string[],
  pm25: number[],
  pm10: number[],
  mode: 'light' | 'dark' = 'dark'
): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  return withChartMicroAnimation({
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
        lineStyle: { width: 3, color: colors.primary },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${colors.primary}40` },
            { offset: 1, color: `${colors.primary}00` }
          ])
        }
      },
      {
        name: 'PM10',
        data: pm10,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: colors.tertiary },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${colors.tertiary}40` },
            { offset: 1, color: `${colors.tertiary}00` }
          ])
        }
      }
    ],
    media: getResponsiveMedia(true),
  });
};

export const getHumidityChartOption = (
  times: string[],
  humidity: number[],
  mode: 'light' | 'dark' = 'dark'
): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  return withChartMicroAnimation({
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
  });
};

export const getPrecipitationChartOption = (times: string[], data: number[], mode: 'light' | 'dark' = 'dark'): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  return withChartMicroAnimation({
    grid: { top: '15%', left: '2%', right: '2%', bottom: '8%', containLabel: true },
    dataZoom: getInteractiveDataZoom(),
    xAxis: { type: 'category', data: times.map(t => t.split('T')[1]?.substring(0, 5) || t), axisLine: { show: false }, axisLabel: { color: colors.text, fontSize: 10, hideOverlap: true, interval: 'auto' } },
    yAxis: { type: 'value', min: 0, splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text, fontSize: 10 } },
    series: [{
      data,
      type: 'line',
      smooth: 0.5,
      symbol: 'none',
      lineStyle: { color: 'rgba(148, 142, 156, 0.9)', width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(148, 142, 156, 0.35)' },
          { offset: 1, color: 'rgba(148, 142, 156, 0.02)' }
        ])
      }
    }],
    media: getResponsiveMedia(false),
  });
};

export const getWindChartOption = (times: string[], data: number[], mode: 'light' | 'dark' = 'dark'): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  return withChartMicroAnimation({
    grid: { top: '15%', left: '2%', right: '2%', bottom: '8%', containLabel: true },
    dataZoom: getInteractiveDataZoom(),
    xAxis: { type: 'category', data: times.map(t => t.split('T')[1]?.substring(0, 5) || t), axisLine: { show: false }, axisLabel: { color: colors.text, fontSize: 10, hideOverlap: true, interval: 'auto' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text, fontSize: 10 } },
    series: [{ data, type: 'line', step: 'middle', lineStyle: { color: colors.primary, width: 3 }, symbol: 'none' }],
    media: getResponsiveMedia(false),
  });
};

export const getVisibilityChartOption = (times: string[], data: number[], mode: 'light' | 'dark' = 'dark'): echarts.EChartsOption => {
  const colors = THEME_COLORS[mode];
  return withChartMicroAnimation({
    grid: { top: '15%', left: '2%', right: '2%', bottom: '8%', containLabel: true },
    dataZoom: getInteractiveDataZoom(),
    xAxis: { type: 'category', data: times.map(t => t.split('T')[1]?.substring(0, 5) || t), axisLine: { show: false }, axisLabel: { color: colors.text, fontSize: 10, hideOverlap: true, interval: 'auto' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: colors.grid } }, axisLabel: { color: colors.text, fontSize: 10 } },
    series: [{ data, type: 'line', smooth: true, lineStyle: { color: colors.primary, width: 3 }, symbol: 'none' }],
    media: getResponsiveMedia(false),
  });
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
  return withChartMicroAnimation({
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
  });
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
  return withChartMicroAnimation({
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
        formatter: (val: number) => `${Math.floor(val / 60).toString().padStart(2, '0')}:00`
      }
    },
    series: [
      { name: 'Sunrise', data: sunriseTimes.map(parseTime), type: 'line', smooth: true, lineStyle: { color: '#fbbf24', width: 3 }, symbol: 'none' },
      { name: 'Sunset', data: sunsetTimes.map(parseTime), type: 'line', smooth: true, lineStyle: { color: '#f43f5e', width: 3 }, symbol: 'none' }
    ],
    media: getResponsiveMedia(true),
  });
};
