import React, { useState } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useHistoricalData, useHistoricalAirQualityData } from '../hooks/useWeatherData';
import { useTheme } from '../store/ThemeContext';
import ReactECharts from 'echarts-for-react';
import { 
  getHistoricalTemperatureChartOption, 
  getPrecipitationChartOption,
  getWindChartOption,
  getSunCycleChartOption,
  getAQIChartOption
} from '../utils/chartConfigs';
import { format, subDays } from 'date-fns';

import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";

export const Historical: React.FC = () => {
  const { theme } = useTheme();
  const { location } = useLocation();

  const maxAllowedDate = format(subDays(new Date(), 3), 'yyyy-MM-dd');
  
  const [activeDateRange, setActiveDateRange] = useState(() => ({
    startDate: format(subDays(new Date(), 33), 'yyyy-MM-dd'),
    endDate: maxAllowedDate
  }));

  const [dateRange, setDateRange] = useState<DateValueType>({
    startDate: new Date(activeDateRange.startDate),
    endDate: new Date(activeDateRange.endDate)
  });
  
  const [dateError, setDateError] = useState('');

  const { data: historicalData, isLoading, error } = useHistoricalData(
    location, 
    activeDateRange.startDate, 
    activeDateRange.endDate
  );
  
  const { data: aqData, isLoading: aqLoading } = useHistoricalAirQualityData(
    location, 
    activeDateRange.startDate, 
    activeDateRange.endDate
  );

  const handleDateChange = (newValue: DateValueType) => {
    if (newValue) {
      setDateRange(newValue);
    }
    setDateError('');
  };

  const handleUpdate = () => {
    if (!dateRange?.startDate || !dateRange?.endDate) {
       setDateError('Please select a full date range.');
       return;
    }

    const s = dateRange.startDate instanceof Date ? dateRange.startDate : new Date(dateRange.startDate as string);
    const e = dateRange.endDate instanceof Date ? dateRange.endDate : new Date(dateRange.endDate as string);
    
    if (s > e) {
      setDateError('Start Date must precede End Date.');
      return;
    }
    
    const diffTime = e.getTime() - s.getTime();
    if (diffTime / (1000 * 3600 * 24) > 730) {
      setDateError('Range limited to 2 years max.');
      return;
    }
    
    setActiveDateRange({
      startDate: format(s, 'yyyy-MM-dd'),
      endDate: format(e, 'yyyy-MM-dd')
    });
  };

  const isDataReady = !isLoading && !aqLoading && !error && historicalData && historicalData.daily;

  let maxTemp = 0, maxRain = 0, maxWind = 0, maxWindDirDegrees = 0;
  
  if (isDataReady) {
    maxTemp = Math.max(...(historicalData.daily.temperature_2m_max || [0]));
    maxRain = Math.max(...(historicalData.daily.precipitation_sum || [0]));
    maxWind = Math.max(...(historicalData.daily.wind_speed_10m_max || [0]));
    const maxWindIndex = (historicalData.daily.wind_speed_10m_max || []).indexOf(maxWind);
    maxWindDirDegrees = historicalData.daily.wind_direction_10m_dominant?.[Math.max(0, maxWindIndex)] || 0;
  }

  const getWindDirectionStr = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

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
              {dateError && <span className="text-[10px] text-error font-bold uppercase tracking-widest">{dateError}</span>}
            </div>
            <div className="flex items-center gap-2 relative z-50">
              <div className="w-72">
                <Datepicker 
                  value={dateRange} 
                  onChange={handleDateChange} 
                  maxDate={new Date(maxAllowedDate)}
                  useRange={false}
                  showShortcuts={true}
                  primaryColor={"violet"}
                  inputClassName="bg-background border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary w-full cursor-pointer placeholder-on-surface-variant/50"
                  toggleClassName="absolute bg-transparent rounded-r-lg text-primary right-0 h-full px-3 text-on-surface-variant focus:outline-none"
                />
              </div>
              <button 
                onClick={handleUpdate}
                disabled={isLoading || aqLoading}
                className="bg-primary hover:bg-primary-dim text-on-primary rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-colors disabled:opacity-50 h-full min-h-[38px]"
              >
                Fetch
              </button>
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
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-8 rounded-[3rem] glass-card space-y-6 group hover:bg-surface-container-high transition-all">
                <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center group-hover:bg-error transition-colors">
                  <span className="material-symbols-outlined text-error group-hover:text-on-error">thermostat</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Peak Thermal</p>
                  <h3 className="text-4xl font-black tracking-tight text-on-surface">{maxTemp}°C</h3>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] glass-card space-y-6 group hover:bg-surface-container-high transition-all">
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center group-hover:bg-tertiary transition-colors">
                  <span className="material-symbols-outlined text-tertiary group-hover:text-on-tertiary">water_drop</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Precipitation Spike</p>
                  <h3 className="text-4xl font-black tracking-tight text-on-surface">{maxRain}mm</h3>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] glass-card space-y-6 group hover:bg-surface-container-high transition-all">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary transition-colors">
                  <span className="material-symbols-outlined text-secondary group-hover:text-on-secondary">air</span>
                </div>
                <div className="space-y-1 flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Wind Amplitude & Direction</p>
                  <h3 className="text-4xl font-black tracking-tight text-on-surface mt-1">{maxWind} <span className="text-sm text-on-surface-variant">km/h {getWindDirectionStr(maxWindDirDegrees)}</span></h3>
                  <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Kinetic Vector: {maxWindDirDegrees}°</p>
                </div>
             </div>
          </section>

          {/* Visualization Grid */}
          <section className="space-y-12">
            <div className="space-y-6">
               <div className="flex items-center gap-3 px-2">
                <div className="p-2 rounded-xl bg-error/10"><span className="material-symbols-outlined text-error text-[16px]">thermostat</span></div>
                <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Temperature Corridor Analysis (Min, Max, Mean)</h3>
              </div>
              <ReactECharts 
                option={getHistoricalTemperatureChartOption(
                  historicalData.daily.time, 
                  historicalData.daily.temperature_2m_max,
                  historicalData.daily.temperature_2m_min,
                  historicalData.daily.temperature_2m_mean,
                  'C', theme
                )} 
                style={{ height: '400px', width: '100%' }}
                className="rounded-[3rem] glass-card p-8"
                opts={{ renderer: 'svg' }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 rounded-xl bg-tertiary/10"><span className="material-symbols-outlined text-tertiary text-[16px]">water_drop</span></div>
                        <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Cumulative Precipitation</h3>
                    </div>
                    <ReactECharts 
                        option={getPrecipitationChartOption(historicalData.daily.time, historicalData.daily.precipitation_sum, theme)} 
                        style={{ height: '350px', width: '100%' }}
                        className="rounded-[3rem] glass-card p-8"
                        opts={{ renderer: 'svg' }}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 rounded-xl bg-secondary/10"><span className="material-symbols-outlined text-secondary text-[16px]">air</span></div>
                        <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Kinetic Wind Patterns</h3>
                    </div>
                    <ReactECharts 
                        option={getWindChartOption(historicalData.daily.time, historicalData.daily.wind_speed_10m_max, theme)} 
                        style={{ height: '350px', width: '100%' }}
                        className="rounded-[3rem] glass-card p-8"
                        opts={{ renderer: 'svg' }}
                    />
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 rounded-xl bg-[#fbbf24]/10"><span className="material-symbols-outlined text-[#fbbf24] text-[16px]">light_mode</span></div>
                        <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Sun Cycle (IST)</h3>
                    </div>
                    <ReactECharts 
                        option={getSunCycleChartOption(historicalData.daily.time, historicalData.daily.sunrise, historicalData.daily.sunset, theme)} 
                        style={{ height: '350px', width: '100%' }}
                        className="rounded-[3rem] glass-card p-8"
                        opts={{ renderer: 'svg' }}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 rounded-xl bg-error/10"><span className="material-symbols-outlined text-error text-[16px]">air</span></div>
                        <h3 className="font-label text-[11px] font-black tracking-tight uppercase text-on-surface-variant">Historical Air Quality (PM10 & PM2.5)</h3>
                    </div>
                    {aqData?.hourly?.time ? (
                      <ReactECharts 
                          option={getAQIChartOption(aqData.hourly.time, aqData.hourly.pm2_5, aqData.hourly.pm10, theme)} 
                          style={{ height: '350px', width: '100%' }}
                          className="rounded-[3rem] glass-card p-8"
                          opts={{ renderer: 'svg' }}
                      />
                    ) : (
                      <div className="rounded-[3rem] glass-card p-8 h-[350px] flex items-center justify-center text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">
                        Air Quality History Unavailable
                      </div>
                    )}
                </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

