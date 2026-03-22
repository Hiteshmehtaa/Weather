import React from 'react';
import { useWeatherData, useAirQualityData } from '../hooks/useWeatherData';
import { useLocation } from '../hooks/useLocation';
import { DashboardSkeleton } from '../components/ui/SkeletonLoader';
import { getWeatherDescription, formatTemperature, isValidChartData } from '../utils/formatters';
import ReactECharts from 'echarts-for-react';
import { format } from 'date-fns';
import { CalendarPicker } from '../components/ui/CalendarPicker';
import { ChartEmptyState } from '../components/ui/ChartEmptyState';
import { 
  getTemperatureChartOption, 
  getPrecipitationChartOption, 
  getVisibilityChartOption, 
  getAQIChartOption 
} from '../utils/chartConfigs';

export const Dashboard: React.FC = () => {
  const { location, error: locError } = useLocation();
  const [tempUnit, setTempUnit] = React.useState<'C' | 'F'>('C');
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  
  const apiDate = format(selectedDate, 'yyyy-MM-dd');

  const { data: weather, isLoading: weatherLoading } = useWeatherData(location, apiDate);
  const { data: aqData, isLoading: aqLoading } = useAirQualityData(location, apiDate);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  if (locError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="p-6 rounded-full bg-error-container text-error shadow-2xl shadow-error/20 border border-error/20">
          <span className="material-symbols-outlined text-5xl">warning</span>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Access Denied</h2>
          <p className="text-on-surface-variant font-medium max-w-sm">
            Please enable location services in your browser settings to access real-time atmospheric data.
          </p>
        </div>
      </div>
    );
  }

  if (weatherLoading || aqLoading || !weather || !aqData) {
    return <DashboardSkeleton />;
  }

  const { current, hourly, daily } = weather;
  
  const isToday = !apiDate || apiDate === format(new Date(), 'yyyy-MM-dd');
  
  // Dynamic variables for past/future dates vs today
  const weatherCode = isToday && current ? current.weather_code : daily?.weather_code?.[0] || 0;
  const currentTemp = isToday && current ? current.temperature_2m : daily?.temperature_2m_max?.[0] || 0;
  const humidity = isToday && current ? current.relative_humidity_2m : hourly?.relative_humidity_2m?.[12] || 0;
  const precip = isToday && current ? current.precipitation : daily?.precipitation_sum?.[0] || 0;
  const isRainy = weatherCode > 50;


  const uvIndex = hourly?.uv_index?.[0] || 0;
  const aqi = Math.round(aqData.hourly.european_aqi?.[0] || 0);
  const chartTimes = hourly?.time?.slice(0, 48) || [];
  const chartStart = chartTimes[0]?.split('T')[1]?.substring(0, 5) || '--:--';
  const chartEnd = chartTimes[chartTimes.length - 1]?.split('T')[1]?.substring(0, 5) || '--:--';
  const chartRangeLabel = `${chartStart} - ${chartEnd}`;
  
  const highTemp = Math.round(daily?.temperature_2m_max?.[0] || 0);
  const lowTemp = Math.round(daily?.temperature_2m_min?.[0] || 0);

  const getAQIString = (aqiCode: number) => {
    if (aqiCode <= 20) return "OPTIMAL";
    if (aqiCode <= 40) return "GOOD";
    if (aqiCode <= 60) return "FAIR";
    if (aqiCode <= 80) return "POOR";
    return "HAZARDOUS";
  };
  const aqiLabel = getAQIString(aqi);

  const pm25 = aqData.hourly.pm2_5?.[0] || 0;
  const pm10 = aqData.hourly.pm10?.[0] || 0;
  const co2 = aqData.hourly.carbon_dioxide?.[0] || 'N/A';
  const no2 = aqData.hourly.nitrogen_dioxide?.[0] || 0;
  const so2 = aqData.hourly.sulphur_dioxide?.[0] || 0;
  const ozone = aqData.hourly.ozone?.[0] || 0;

  return (
    <div className="relative min-h-screen z-0">
      {/* Map View Background (Atmospheric Layering) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] bg-[radial-gradient(circle_at_center,_rgba(101,80,168,0.7)_0%,_transparent_65%)] blur-[100px]"></div>
        <img alt="Orbital Background" className="absolute top-0 right-0 w-[100vw] h-[100vh] max-w-none object-contain md:object-right grayscale invert contrast-[1.3] mix-blend-overlay opacity-70 transform-gpu" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFXXaMrcffAtsYmExe9LzdO5UNn51X5-unoNqzfYQWR2Fd8s3NJqXZpjDVxGHj3cmJh17Lwq5-y7QvZit7SKSUPexakwcW538AEBDJYQNh5iEN5yI7RGMExgpyBzrqgt3cbtgRStQhTkz4ORnhua20VqBmMufcmD7shx_Rg2TVqV_xI_HBxCGgnVwqn3M1WhQlf1X9k-ySafOtRaQIwMYsN8cwWvmPTklQUZ3Z9XZR9khF1MXjbmAXtU2IeF7Dk_cXpn9vp66b_4-w" />
      </div>

      <div className="max-w-[1600px] mx-auto pb-8">
        {/* Calendar Picker Floating Above */}
        <div className="flex justify-end mb-6 stagger-reveal" style={{ animationDelay: '0ms' }}>
           <div className="w-64">
             <CalendarPicker
                value={selectedDate}
                onChange={handleDateChange}
                maxDate={new Date()}
             />
           </div>
        </div>

        {/* Hero Section: Current Weather */}
        <section className="relative mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end stagger-reveal" style={{ animationDelay: '40ms' }}>
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold tracking-widest uppercase border border-secondary/30">
                {isToday ? 'Live Orbital Feed' : 'Historical Data'}
              </span>
              <div className="flex items-center gap-2 text-on-surface-variant font-label text-sm">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-baseline gap-6 mt-4">
              <h1 className="font-headline text-8xl md:text-[10rem] font-bold tracking-tighter leading-none text-on-surface text-glow">
                {formatTemperature(currentTemp, tempUnit).replace('°C', '').replace('°F', '')}°
              </h1>
              
              <div className="space-y-4 md:space-y-2 mt-4 md:mt-0">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isRainy ? 'rainy' : 'partly_cloudy_day'}
                  </span>
                  <span className="font-headline text-3xl md:text-4xl font-light text-on-surface-variant capitalize">
                    {getWeatherDescription(weatherCode)}
                  </span>
                </div>
                <div className="flex gap-4 font-label text-lg tracking-tight text-outline">
                  <span>H: {highTemp}°</span>
                  <span>L: {lowTemp}°</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bento Quick Stats */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4 h-full min-h-[160px]">
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-outline">Precipitation</span>
              <div className="mt-4">
                <span className="text-3xl font-headline font-medium text-tertiary">{precip} <span className="text-sm font-light">mm</span></span>
                <p className="text-[11px] text-on-surface-variant mt-1">{precip > 0 ? 'Precipitation expected' : 'Dry conditions'}</p>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-outline">UV Index</span>
              <div className="mt-4">
                <span className="text-3xl font-headline font-medium text-error">{uvIndex}</span>
                <p className="text-[11px] text-on-surface-variant mt-1">{uvIndex > 5 ? 'High Exposure' : 'Low Exposure'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 stagger-reveal" style={{ animationDelay: '80ms' }}>
          {/* Humidity */}
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
            <div className="flex items-center justify-between mb-8">
              <span className="material-symbols-outlined text-primary">humidity_percentage</span>
              <span className="text-[10px] font-bold tracking-widest text-outline uppercase">Humidity</span>
            </div>
            <div className="text-4xl font-headline mb-2">{Math.round(humidity)}%</div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
              <div className="bg-primary h-full shadow-[0_0_10px_rgba(208,193,255,0.5)] transition-all duration-1000" style={{ width: `${Math.round(humidity)}%` }}></div>
            </div>
          </div>
          
          {/* Wind Speed */}
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
            <div className="flex items-center justify-between mb-8">
              <span className="material-symbols-outlined text-primary">air</span>
              <span className="text-[10px] font-bold tracking-widest text-outline uppercase">Wind Speed</span>
            </div>
            <div className="text-4xl font-headline mb-2">{Math.max(...(hourly?.wind_speed_10m?.slice(0, 24) || [0]))} <span className="text-lg font-light text-outline">km/h</span></div>
            <p className="text-xs text-on-surface-variant">Max daily kinetic wind</p>
          </div>
          
          {/* Sun Cycle */}
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <span className="material-symbols-outlined text-primary">wb_sunny</span>
              <span className="text-[10px] font-bold tracking-widest text-outline uppercase">Solar Transit</span>
            </div>
            <div className="flex justify-between items-end h-16">
              <div className="text-center">
                <p className="text-[10px] text-outline uppercase mb-1">Sunrise</p>
                <p className="text-xl font-headline">{daily?.sunrise?.[0]?.split('T')[1] || '--:--'}</p>
              </div>
              <div className="flex-1 mx-8 relative h-12">
                <svg className="w-full h-full stroke-primary/30 fill-none overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d="M 0 50 Q 50 -20 100 50" strokeDasharray="2 2" strokeWidth="1"></path>
                  <circle className="shadow-lg shadow-primary/50" cx="50" cy="15" fill="#d0c1ff" r="4"></circle>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-outline uppercase mb-1">Sunset</p>
                <p className="text-xl font-headline">{daily?.sunset?.[0]?.split('T')[1] || '--:--'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Air Quality Section (Large Editorial Layout) */}
        <section className="mb-12 stagger-reveal" style={{ animationDelay: '120ms' }}>
          <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">aq</span>
            Atmospheric Composition
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Major AQI */}
            <div className="lg:col-span-4 glass-panel p-8 rounded-2xl border border-primary/10 relative overflow-hidden group" style={{ background: 'rgba(53, 52, 59, 0.4)', backdropFilter: 'blur(24px)' }}>
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-outline mb-10 md:mb-12 block">Air Quality Index (AQI)</span>
              <div className="text-6xl md:text-7xl font-headline font-bold text-on-surface mb-2">{aqi}</div>
              <div className={`px-3 py-1 text-[10px] font-bold inline-block rounded-full border mb-6 ${aqi > 50 ? 'bg-error-container/20 text-error border-error/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                {aqiLabel}
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {aqi > 50 ? 'Atmospheric pollutants are elevated. Considerations for sensitive individuals are recommended in the current orbital sector.' : 'Atmospheric pollutants are within safe parameters. No significant risk to health detected.'}
              </p>
            </div>
            
            {/* Chemical Breakdown */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-surface-container-high/50 p-6 rounded-xl border border-outline-variant/10">
                <p className="text-[10px] font-bold text-outline tracking-widest uppercase mb-4">PM2.5</p>
                <div className="text-2xl font-headline">{pm25} <span className="text-xs text-outline">μg/m³</span></div>
              </div>
              <div className="bg-surface-container-high/50 p-6 rounded-xl border border-outline-variant/10">
                <p className="text-[10px] font-bold text-outline tracking-widest uppercase mb-4">PM10</p>
                <div className="text-2xl font-headline">{pm10} <span className="text-xs text-outline">μg/m³</span></div>
              </div>
              <div className="bg-surface-container-high/50 p-6 rounded-xl border border-outline-variant/10">
                <p className="text-[10px] font-bold text-outline tracking-widest uppercase mb-4">CO2</p>
                <div className="text-2xl font-headline">{co2} <span className="text-xs text-outline">μg/m³</span></div>
              </div>
              <div className="bg-surface-container-high/50 p-6 rounded-xl border border-outline-variant/10">
                <p className="text-[10px] font-bold text-outline tracking-widest uppercase mb-4">NO2</p>
                <div className="text-2xl font-headline">{no2} <span className="text-xs text-outline">μg/m³</span></div>
              </div>
              <div className="bg-surface-container-high/50 p-6 rounded-xl border border-outline-variant/10">
                <p className="text-[10px] font-bold text-outline tracking-widest uppercase mb-4">SO2</p>
                <div className="text-2xl font-headline">{so2} <span className="text-xs text-outline">μg/m³</span></div>
              </div>
              <div className="bg-surface-container-high/50 p-6 rounded-xl border border-outline-variant/10">
                <p className="text-[10px] font-bold text-outline tracking-widest uppercase mb-4">O3</p>
                <div className="text-2xl font-headline">{ozone} <span className="text-xs text-outline">μg/m³</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Hourly Visualizations (The "Terminal" Graphs) */}
        <section className="space-y-8 stagger-reveal pb-64" style={{ animationDelay: '160ms' }}>
          <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between gap-4 mb-2">
            <h3 className="font-headline text-2xl font-bold">Orbital Timeline</h3>
            <div className="relative flex gap-0 p-1 bg-surface-container-highest rounded-lg border border-outline-variant/20 overflow-hidden">
              {/* Sliding pill */}
              <span
                className={`absolute top-1 bottom-1 transition-all duration-300 ease-in-out bg-primary shadow-lg shadow-primary/20 ${tempUnit === 'C' ? 'rounded-l-md' : 'rounded-r-md'}`}
                style={{
                  left: tempUnit === 'C' ? '4px' : 'calc(50%)',
                  width: 'calc(50% - 4px)'
                }}
              />
              <button
                onClick={() => setTempUnit('C')}
                className={`relative z-10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors duration-300 ${tempUnit === 'C' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Celsius
              </button>
              <button
                onClick={() => setTempUnit('F')}
                className={`relative z-10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors duration-300 ${tempUnit === 'F' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Fahrenheit
              </button>
            </div>
          </div>

          <div className="space-y-6 overflow-x-hidden">
            {/* Graph 1: Temperature */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-on-surface">Thermal Flux (48h)</span>
                </div>
                <span className="text-[10px] text-on-surface-variant">Range: {chartRangeLabel}</span>
              </div>
              <div className="w-full">
                {isValidChartData(hourly?.time) && isValidChartData(hourly?.temperature_2m) ? (
                  <ReactECharts 
                    option={getTemperatureChartOption(hourly?.time?.slice(0, 48) || [], hourly?.temperature_2m?.slice(0, 48) || [], tempUnit, 'dark')} 
                    style={{ height: '300px', width: '100%' }} 
                    opts={{ renderer: 'svg' }}
                  />
                ) : (
                  <ChartEmptyState title="No temperature data available" />
                )}
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Particulate Analysis (Replaces PM10/PM2.5 mockup) */}
              <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-tertiary rounded-full"></span>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-on-surface">Particulate Analysis</span>
                  </div>
                </div>
                <div className="w-full">
                  {isValidChartData(aqData?.hourly?.time) && isValidChartData(aqData?.hourly?.pm2_5) && isValidChartData(aqData?.hourly?.pm10) ? (
                    <ReactECharts 
                      option={getAQIChartOption(aqData?.hourly?.time?.slice(0, 48) || [], aqData?.hourly?.pm2_5?.slice(0, 48) || [], aqData?.hourly?.pm10?.slice(0, 48) || [], 'dark')} 
                      style={{ height: '240px', width: '100%' }} 
                      opts={{ renderer: 'svg' }}
                    />
                  ) : (
                    <ChartEmptyState title="No air quality data available" icon="air" className="min-h-[240px]" />
                  )}
                </div>
              </div>

              {/* Visibility Index */}
              <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-on-surface">Visibility Index</span>
                  </div>
                </div>
                <div className="w-full">
                  {isValidChartData(hourly?.time) && isValidChartData(hourly?.visibility) ? (
                    <ReactECharts 
                      option={getVisibilityChartOption(hourly?.time?.slice(0, 48) || [], (hourly?.visibility?.slice(0, 48) || []).map((v: number) => v / 1000), 'dark')} 
                      style={{ height: '240px', width: '100%' }} 
                      opts={{ renderer: 'svg' }}
                    />
                  ) : (
                    <ChartEmptyState title="No visibility data available" icon="visibility" className="min-h-[240px]"/>
                  )}
                </div>
              </div>

              {/* Precipitation */}
              <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-error rounded-full"></span>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-on-surface">Precipitation Outlook</span>
                  </div>
                </div>
                <div className="w-full">
                   {isValidChartData(hourly?.time) && isValidChartData(hourly?.precipitation) ? (
                    <ReactECharts 
                      option={getPrecipitationChartOption(hourly?.time?.slice(0, 48) || [], hourly?.precipitation?.slice(0, 48) || [], 'dark')} 
                      style={{ height: '240px', width: '100%' }} 
                      opts={{ renderer: 'svg' }}
                    />
                  ) : (
                    <ChartEmptyState title="No precipitation data available" icon="rainy" className="min-h-[240px]"/>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
