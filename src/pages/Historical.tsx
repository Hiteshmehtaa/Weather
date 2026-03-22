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
    <div className="space-y-12 pb-12">
      {/* Editorial Header - ALWAYS VISIBLE */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-outline-variant/10 pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-[12px]">history</span>
              Historical Records Enabled
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-on-surface">Climate Analytics</h1>
            <p className="text-lg text-on-surface-variant font-medium max-w-xl leading-relaxed">
              Deep-dive into weather patterns up to 2 years in the past. Interactive time-series extraction available below.
            </p>
          </div>

          <div className="flex flex-col bg-surface-container p-4 rounded-3xl border border-outline-variant/10 gap-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Analysis Period (Max 2 Years)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-50">
              <DateRangePicker
                value={dateRange as { startDate: Date; endDate: Date }}
                onChange={handleDateChange}
                maxDate={maxAllowedDate}
                error={dateError}
              />
            </div>
          </div>
      </section>

      {/* Dynamic Main Layout */}
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
        <>
          {/* Analytics Insight Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 stagger-reveal" style={{ animationDelay: '60ms' }}>
            <article className="glass-card rounded-3xl p-6 border border-outline-variant/15 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:bg-surface-container-high">
              <div className="w-11 h-11 rounded-2xl bg-error/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-error">thermostat</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Peak Thermal</p>
              <h3 className="text-4xl font-black tracking-tight text-on-surface">{maxTemp}°C</h3>
            </article>

            <article className="glass-card rounded-3xl p-6 border border-outline-variant/15 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:bg-surface-container-high">
              <div className="w-11 h-11 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-tertiary">water_drop</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Precipitation Spike</p>
              <h3 className="text-4xl font-black tracking-tight text-on-surface">{maxRain}mm</h3>
            </article>

            <article className="glass-card rounded-3xl p-6 border border-outline-variant/15 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:bg-surface-container-high">
              <div className="w-11 h-11 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-secondary">air</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Max Wind & Direction</p>
              <h3 className="text-4xl font-black tracking-tight text-on-surface">{maxWind} <span className="text-sm text-on-surface-variant">km/h</span></h3>
              <p className="text-xs text-on-surface-variant mt-2">{getWindDirectionStr(maxWindDirDegrees)} at {maxWindDirDegrees}°</p>
            </article>

            <article className="glass-card rounded-3xl p-6 border border-outline-variant/15 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:bg-surface-container-high">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Analysis Window</p>
              <h3 className="text-4xl font-black tracking-tight text-on-surface">{rangeDays}</h3>
              <p className="text-xs text-on-surface-variant mt-2">Days in selected range</p>
            </article>
          </section>

          <section className="rounded-3xl bg-surface-container/65 card-soft-depth p-4 md:p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-reveal" style={{ animationDelay: '130ms' }}>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Date Span</p>
              <p className="text-sm md:text-base font-semibold text-on-surface mt-1">{format(dateRange.startDate, 'dd MMM yyyy')} - {format(dateRange.endDate, 'dd MMM yyyy')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Max / Min Temp</p>
              <p className="text-sm md:text-base font-semibold text-on-surface mt-1">{maxTemp}°C / {minTemp}°C</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Wettest Day</p>
              <p className="text-sm md:text-base font-semibold text-on-surface mt-1">{wettestDay !== '--' ? format(new Date(wettestDay), 'dd MMM yyyy') : '--'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Windiest Day</p>
              <p className="text-sm md:text-base font-semibold text-on-surface mt-1">{windiestDay !== '--' ? format(new Date(windiestDay), 'dd MMM yyyy') : '--'}</p>
            </div>
          </section>

          {/* Visualization Grid */}
          <section className="space-y-8 stagger-reveal" style={{ animationDelay: '220ms' }}>
            <div className="rounded-[2rem] glass-card card-soft-depth p-8 border border-outline-variant/15 transition-transform duration-300 hover:scale-[1.01]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-error/10"><span className="material-symbols-outlined text-error text-[16px]">thermostat</span></div>
                <div>
                  <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Temperature Corridor Analysis (Min, Max, Mean)</h3>
                  <p className="text-[10px] text-on-surface-variant mt-1">Updated: {format(new Date(), 'HH:mm')} • Range: {format(dateRange.startDate, 'dd MMM')} - {format(dateRange.endDate, 'dd MMM')}</p>
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-surface-container-low/40 p-4 overflow-hidden">
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
                style={{ height: '400px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
              ) : (
                <ChartEmptyState title="No temperature data available" />
              )}
              </div>
              </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="rounded-[2rem] glass-card card-soft-depth p-6 border border-outline-variant/15 transition-transform duration-300 hover:scale-[1.01]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-tertiary/10"><span className="material-symbols-outlined text-tertiary text-[16px]">water_drop</span></div>
                        <div>
                          <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Cumulative Precipitation</h3>
                          <p className="text-[10px] text-on-surface-variant mt-1">Updated: {format(new Date(), 'HH:mm')}</p>
                        </div>
                    </div>
                    <div className="rounded-[1.5rem] bg-surface-container-low/40 p-4 overflow-hidden">
                    {isValidChartData(historicalData.daily?.time) &&
                    isValidChartData(historicalData.daily?.precipitation_sum) ? (
                    <ReactECharts 
                        option={getPrecipitationChartOption(historicalData.daily.time, historicalData.daily.precipitation_sum, 'dark')} 
                        style={{ height: '350px', width: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                    ) : (
                      <ChartEmptyState title="No precipitation data available" icon="rainy" className="min-h-[350px]" />
                    )}
                    </div>
                </div>

                  <div className="rounded-[2rem] glass-card card-soft-depth p-6 border border-outline-variant/15 transition-transform duration-300 hover:scale-[1.01]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-secondary/10"><span className="material-symbols-outlined text-secondary text-[16px]">air</span></div>
                        <div>
                          <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Kinetic Wind Patterns</h3>
                          <p className="text-[10px] text-on-surface-variant mt-1">Updated: {format(new Date(), 'HH:mm')}</p>
                        </div>
                    </div>
                    <div className="rounded-[1.5rem] bg-surface-container-low/40 p-4 overflow-hidden">
                    {isValidChartData(historicalData.daily?.time) &&
                    isValidChartData(historicalData.daily?.wind_speed_10m_max) ? (
                    <ReactECharts 
                        option={getWindChartOption(historicalData.daily.time, historicalData.daily.wind_speed_10m_max, 'dark')} 
                        style={{ height: '350px', width: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                    ) : (
                      <ChartEmptyState title="No wind data available" icon="air" className="min-h-[350px]" />
                    )}
                    </div>
                </div>
                
                  <div className="rounded-[2rem] glass-card card-soft-depth p-6 border border-outline-variant/15 transition-transform duration-300 hover:scale-[1.01]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-[#fbbf24]/10"><span className="material-symbols-outlined text-[#fbbf24] text-[16px]">light_mode</span></div>
                        <div>
                          <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Sun Cycle (IST)</h3>
                          <p className="text-[10px] text-on-surface-variant mt-1">Updated: {format(new Date(), 'HH:mm')}</p>
                        </div>
                    </div>
                    <div className="rounded-[1.5rem] bg-surface-container-low/40 p-4 overflow-hidden">
                    {isValidChartData(historicalData.daily?.time) &&
                    isValidChartData(historicalData.daily?.sunrise) &&
                    isValidChartData(historicalData.daily?.sunset) ? (
                    <ReactECharts 
                        option={getSunCycleChartOption(historicalData.daily.time, historicalData.daily.sunrise, historicalData.daily.sunset, 'dark')} 
                        style={{ height: '350px', width: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                    ) : (
                      <ChartEmptyState title="No sunrise/sunset data available" icon="light_mode" className="min-h-[350px]" />
                    )}
                    </div>
                </div>

                  <div className="rounded-[2rem] glass-card card-soft-depth p-6 border border-outline-variant/15 transition-transform duration-300 hover:scale-[1.01]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-error/10"><span className="material-symbols-outlined text-error text-[16px]">air</span></div>
                        <div>
                          <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Historical Air Quality (PM10 & PM2.5)</h3>
                          <p className="text-[10px] text-on-surface-variant mt-1">Updated: {format(new Date(), 'HH:mm')}</p>
                        </div>
                    </div>
                    <div className="rounded-[1.5rem] bg-surface-container-low/40 p-4 overflow-hidden">
                    {isValidChartData(aqData?.hourly?.time) &&
                    isValidChartData(aqData?.hourly?.pm2_5) &&
                    isValidChartData(aqData?.hourly?.pm10) ? (
                      <ReactECharts 
                          option={getAQIChartOption(aqData.hourly.time, aqData.hourly.pm2_5, aqData.hourly.pm10, 'dark')} 
                          style={{ height: '350px', width: '100%' }}
                          opts={{ renderer: 'svg' }}
                      />
                    ) : (
                      <ChartEmptyState title="Air quality history unavailable" icon="air" className="min-h-[350px]" />
                    )}
                    </div>
                </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

