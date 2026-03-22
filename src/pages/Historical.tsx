import React, { useState } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useHistoricalData, useHistoricalAirQualityData } from '../hooks/useWeatherData';
import { isValidChartData } from '../utils/formatters';
import ReactECharts from 'echarts-for-react';
import { 
  getHistoricalTemperatureChartOption, 
  getPrecipitationChartOption,
  getWindChartOption,
  getSunCycleChartOption,
  getAQIChartOption
} from '../utils/chartConfigs';
import { format, subDays } from 'date-fns';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { ChartEmptyState } from '../components/ui/ChartEmptyState';

export const Historical: React.FC = () => {
  const { location } = useLocation();

  const maxAllowedDate = subDays(new Date(), 3);
  
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 33),
    endDate: maxAllowedDate
  });

  const [dateError, setDateError] = useState('');

  // Format for API
  const apiStart = format(dateRange.startDate, 'yyyy-MM-dd');
  const apiEnd   = format(dateRange.endDate,   'yyyy-MM-dd');

  const { data: historicalData, isLoading, error } = useHistoricalData(location, apiStart, apiEnd);
  const { data: aqData, isLoading: aqLoading } = useHistoricalAirQualityData(location, apiStart, apiEnd);

  const handleDateChange = (newRange: { startDate: Date; endDate: Date }) => {
    const diffTime = newRange.endDate.getTime() - newRange.startDate.getTime();
    if (diffTime / (1000 * 3600 * 24) > 730) {
      setDateError('Range limited to 2 years max.');
      return;
    }
    setDateError('');
    setDateRange(newRange);
  };

  const isDataReady = !isLoading && !aqLoading && !error && historicalData && historicalData.daily;

  let maxTemp = 0, minTemp = 0, maxRain = 0, maxWind = 0, maxWindDirDegrees = 0;
  let wettestDay = '--';
  let windiestDay = '--';
  
  if (isDataReady) {
    maxTemp = Math.max(...(historicalData.daily.temperature_2m_max || [0]));
    minTemp = Math.min(...(historicalData.daily.temperature_2m_min || [0]));
    maxRain = Math.max(...(historicalData.daily.precipitation_sum || [0]));
    maxWind = Math.max(...(historicalData.daily.wind_speed_10m_max || [0]));
    const maxWindIndex = (historicalData.daily.wind_speed_10m_max || []).indexOf(maxWind);
    const maxRainIndex = (historicalData.daily.precipitation_sum || []).indexOf(maxRain);
    wettestDay = historicalData.daily.time?.[Math.max(0, maxRainIndex)] || '--';
    windiestDay = historicalData.daily.time?.[Math.max(0, maxWindIndex)] || '--';
    maxWindDirDegrees = historicalData.daily.wind_direction_10m_dominant?.[Math.max(0, maxWindIndex)] || 0;
  }

  const getWindDirectionStr = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  const rangeDays = Math.max(
    1,
    Math.round((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 3600 * 24))
  );

  return (
    <div className="relative min-h-screen z-0 pb-12 bg-background">
      {/* Orbital Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] bg-[radial-gradient(circle_at_center,_rgba(101,80,168,0.7)_0%,_transparent_65%)] blur-[100px]"></div>
        <img alt="Orbital Background" className="absolute top-0 right-0 w-[100vw] h-[100vh] max-w-none object-contain md:object-right grayscale invert contrast-[1.3] mix-blend-overlay opacity-70 transform-gpu" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFXXaMrcffAtsYmExe9LzdO5UNn51X5-unoNqzfYQWR2Fd8s3NJqXZpjDVxGHj3cmJh17Lwq5-y7QvZit7SKSUPexakwcW538AEBDJYQNh5iEN5yI7RGMExgpyBzrqgt3cbtgRStQhTkz4ORnhua20VqBmMufcmD7shx_Rg2TVqV_xI_HBxCGgnVwqn3M1WhQlf1X9k-ySafOtRaQIwMYsN8cwWvmPTklQUZ3Z9XZR9khF1MXjbmAXtU2IeF7Dk_cXpn9vp66b_4-w" />
      </div>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8 pb-12">
        {/* Header & Range Selector */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 stagger-reveal" style={{ animationDelay: '0ms' }}>
          <div>
            <h1 className="text-5xl font-headline font-bold tracking-tighter text-on-surface mb-2">Historical Analysis</h1>
            <p className="text-on-surface-variant font-label text-sm tracking-wide">METEOROLOGICAL DATA ARCHIVE • WINDOW: {format(dateRange.startDate, 'MMM yyyy').toUpperCase()} - {format(dateRange.endDate, 'MMM yyyy').toUpperCase()}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-outline-variant/10 flex flex-col md:flex-row md:items-center gap-6" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Observation Period</span>
              <div className="flex items-center gap-3 text-primary font-headline font-medium">
                <span>{format(dateRange.startDate, 'MMM dd, yyyy')}</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                <span>{format(dateRange.endDate, 'MMM dd, yyyy')}</span>
              </div>
            </div>
            <div className="hidden md:block h-10 w-px bg-outline-variant/20"></div>
            <div className="relative z-50">
              <DateRangePicker
                value={dateRange as { startDate: Date; endDate: Date }}
                onChange={handleDateChange}
                maxDate={maxAllowedDate}
                error={dateError}
              />
            </div>
          </div>
        </section>

        {(isLoading || aqLoading) ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="font-label uppercase tracking-widest text-[#acaab3] text-xs">Retrieving Atmospheric Records</p>
          </div>
        ) : (error || !isDataReady) ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6">
            <div className="p-6 rounded-full bg-error-container text-error border border-error/20 shadow-2xl shadow-error/10">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-on-surface">Data Synchronization Failed</h2>
              <p className="text-on-surface-variant font-medium max-w-sm">
                Unable to retrieve historical atmospheric data for this time period spanning beyond the requested API constraints.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 stagger-reveal" style={{ animationDelay: '40ms' }}>
            {/* Temperature Trends */}
            <div className="md:col-span-8 glass-panel rounded-2xl p-8 border border-outline-variant/10 relative overflow-hidden" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-headline text-xl text-on-surface font-semibold mb-1">Thermal Trajectory</h3>
                  <p className="text-on-surface-variant text-xs font-label">MEAN, MAX & MIN RECORDED TEMPERATURES (°C)</p>
                </div>
              </div>
              <div className="h-64 w-full relative">
                {isValidChartData(historicalData.daily?.time) &&
                isValidChartData(historicalData.daily?.temperature_2m_max) &&
                isValidChartData(historicalData.daily?.temperature_2m_min) &&
                isValidChartData(historicalData.daily?.temperature_2m_mean) ? (
                <ReactECharts 
                  option={getHistoricalTemperatureChartOption(
                    historicalData.daily.time, 
                    historicalData.daily.temperature_2m_max,
                    historicalData.daily.temperature_2m_min,
                    historicalData.daily.temperature_2m_mean,
                    'C', 'dark'
                  )} 
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                />
                ) : (
                  <ChartEmptyState title="No temperature data available" />
                )}
              </div>
            </div>

            {/* Sun Cycle */}
            <div className="md:col-span-4 glass-panel rounded-2xl p-8 border border-outline-variant/10" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
              <div className="mb-8">
                <h3 className="font-headline text-xl text-on-surface font-semibold mb-1">Celestial Rhythm</h3>
                <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest">DAYLIGHT DURATION IST</p>
              </div>
              <div className="space-y-6">
                <div className="h-32 w-full">
                  {isValidChartData(historicalData.daily?.time) &&
                  isValidChartData(historicalData.daily?.sunrise) &&
                  isValidChartData(historicalData.daily?.sunset) ? (
                  <ReactECharts 
                      option={getSunCycleChartOption(historicalData.daily.time, historicalData.daily.sunrise, historicalData.daily.sunset, 'dark')} 
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                  />
                  ) : (
                    <ChartEmptyState title="No sunrise/sunset data available" icon="light_mode" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-surface-container-high p-4 rounded-xl">
                    <span className="material-symbols-outlined text-tertiary block mb-2">light_mode</span>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter font-label">Mean Sunrise</p>
                    <span className="text-lg font-headline font-semibold">05:42 IST</span>
                  </div>
                  <div className="bg-surface-container-high p-4 rounded-xl">
                    <span className="material-symbols-outlined text-primary block mb-2">dark_mode</span>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter font-label">Mean Sunset</p>
                    <span className="text-lg font-headline font-semibold">18:14 IST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Precipitation (Hydraulic Load) */}
            <div className="md:col-span-6 glass-panel rounded-2xl p-8 border border-outline-variant/10" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="font-headline text-xl text-on-surface font-semibold mb-1">Hydraulic Load</h3>
                  <p className="text-on-surface-variant text-xs font-label">TOTAL PRECIPITATION (MM) OVER WINDOW</p>
                </div>
                <span className="text-2xl font-headline text-primary-container font-bold">{maxRain}mm MAX</span>
              </div>
              <div className="h-56 w-full">
                {isValidChartData(historicalData.daily?.time) &&
                isValidChartData(historicalData.daily?.precipitation_sum) ? (
                <ReactECharts 
                    option={getPrecipitationChartOption(historicalData.daily.time, historicalData.daily.precipitation_sum, 'dark')} 
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                />
                ) : (
                  <ChartEmptyState title="No precipitation data available" icon="rainy" />
                )}
              </div>
            </div>

            {/* Air Quality (PM Trends) */}
            <div className="md:col-span-6 glass-panel rounded-2xl p-8 border border-outline-variant/10" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="font-headline text-xl text-on-surface font-semibold mb-1">Atmospheric Purity</h3>
                  <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest">PM10 VS PM2.5 CONCENTRATION TRENDS</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-[10px] text-on-surface-variant font-label">PM10</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                    <span className="text-[10px] text-on-surface-variant font-label">PM2.5</span>
                  </div>
                </div>
              </div>
              <div className="h-56 w-full relative">
                {isValidChartData(aqData?.hourly?.time) &&
                isValidChartData(aqData?.hourly?.pm2_5) &&
                isValidChartData(aqData?.hourly?.pm10) ? (
                  <ReactECharts 
                      option={getAQIChartOption(aqData.hourly.time, aqData.hourly.pm2_5, aqData.hourly.pm10, 'dark')} 
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                  />
                ) : (
                  <ChartEmptyState title="Air quality history unavailable" icon="air" />
                )}
              </div>
            </div>

            {/* Wind Dynamics (Kinetic Distribution) */}
            <div className="md:col-span-12 glass-panel rounded-2xl p-8 border border-outline-variant/10" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
              <div className="grid md:grid-cols-3 gap-12 items-center">
                <div className="md:col-span-1">
                  <h3 className="font-headline text-2xl text-on-surface font-semibold mb-2">Kinetic Distribution</h3>
                  <p className="text-on-surface-variant text-sm font-label mb-8">Analysis of peak wind speeds and directional vectors over the selected period.</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                      <span className="text-on-surface-variant text-xs uppercase tracking-widest font-label">Max Gust</span>
                      <span className="text-xl font-headline font-bold text-primary">{maxWind} KM/H</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                      <span className="text-on-surface-variant text-xs uppercase tracking-widest font-label">Dominant Vector</span>
                      <span className="text-xl font-headline font-bold text-on-surface">{getWindDirectionStr(maxWindDirDegrees)} ({maxWindDirDegrees}°)</span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 relative flex justify-center items-center h-80 w-full">
                  {isValidChartData(historicalData.daily?.time) &&
                  isValidChartData(historicalData.daily?.wind_speed_10m_max) ? (
                  <ReactECharts 
                      option={getWindChartOption(historicalData.daily.time, historicalData.daily.wind_speed_10m_max, 'dark')} 
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                  />
                  ) : (
                    <ChartEmptyState title="No wind data available" icon="air" />
                  )}
                </div>
              </div>
            </div>

            {/* General sequence log mapped to range */}
            <div className="md:col-span-12 glass-panel rounded-2xl border border-outline-variant/10 overflow-hidden mt-6" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="font-headline text-lg font-semibold uppercase tracking-widest">Sequence Log: High Resolution</h3>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label">
                  {rangeDays} Days analyzed
                </span>
              </div>
              <div className="px-8 py-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div className="px-4 py-8 border-r border-outline-variant/10">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Highest Peak</span>
                  <div className="mt-4">
                    <span className="text-2xl font-headline font-bold text-error">{maxTemp}°C</span>
                  </div>
                </div>
                <div className="px-4 py-8 border-r border-outline-variant/10">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Lowest Drop</span>
                  <div className="mt-4">
                    <span className="text-2xl font-headline font-bold text-secondary">{minTemp}°C</span>
                  </div>
                </div>
                <div className="px-4 py-8 border-r border-outline-variant/10">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Wettest Period</span>
                  <div className="mt-2 leading-tight">
                    <span className="text-lg font-headline font-bold text-on-surface">{wettestDay !== '--' ? format(new Date(wettestDay), 'dd MMM yy') : '--'}</span>
                  </div>
                </div>
                <div className="px-4 py-8 border-r lg:border-none border-outline-variant/10">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Windiest Event</span>
                  <div className="mt-2 leading-tight">
                    <span className="text-lg font-headline font-bold text-on-surface">{windiestDay !== '--' ? format(new Date(windiestDay), 'dd MMM yy') : '--'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
