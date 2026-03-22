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
  getHumidityChartOption, 
  getPrecipitationChartOption, 
  getWindChartOption, 
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
  const apparentTemp = isToday && current ? current.apparent_temperature : Math.max(...(hourly?.apparent_temperature?.slice(0, 24) || [0]));
  const humidity = isToday && current ? current.relative_humidity_2m : hourly?.relative_humidity_2m?.[12] || 0;
  const precip = isToday && current ? current.precipitation : daily?.precipitation_sum?.[0] || 0;
  const isRainy = weatherCode > 50;

  const visibilityKm = (hourly?.visibility?.[0] || 0) / 1000;
  const uvIndex = hourly?.uv_index?.[0] || 0;
  const aqi = Math.round(aqData.hourly.european_aqi?.[0] || 0);
  const chartTimes = hourly?.time?.slice(0, 48) || [];
  const chartStart = chartTimes[0]?.split('T')[1]?.substring(0, 5) || '--:--';
  const chartEnd = chartTimes[chartTimes.length - 1]?.split('T')[1]?.substring(0, 5) || '--:--';
  const chartRangeLabel = `${chartStart} - ${chartEnd}`;
  const locationLabel = location
    ? `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`
    : 'Location unavailable';

  return (
    <>
      <section className="stagger-reveal" style={{ animationDelay: '0ms' }}>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">Live Conditions</p>
        <h2 className="text-2xl font-black tracking-tight text-on-surface mt-1">Current Climate Snapshot</h2>
        <p className="text-sm text-on-surface-variant mt-1">Real-time atmospheric state and immediate indicators for your detected location.</p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-reveal" style={{ animationDelay: '40ms' }}>
        <div className="lg:col-span-2 glass-card card-soft-depth rounded-2xl md:rounded-[1.75rem] p-6 md:p-8 flex flex-col justify-between min-h-[400px] relative overflow-hidden group transition-transform duration-300 hover:scale-[1.01]">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/30 transition-all duration-700"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold tracking-tighter text-on-surface">Current Location</h2>
              <p className="text-on-surface-variant text-lg capitalize">{getWeatherDescription(weatherCode)}</p>
              <p className="text-on-surface-variant/80 text-xs mt-1 font-medium">{locationLabel}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-4 py-1.5 bg-primary/5 text-primary border border-primary/15 rounded-full text-xs font-semibold w-fit">
                {isToday ? 'LIVE UPDATE' : 'SELECTED DATE'}
              </span>
              <div className="w-56 relative z-50">
                <CalendarPicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                />
              </div>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-12 mt-4">
            <div className="flex items-baseline">
              <span className="text-[8rem] font-bold tracking-tighter leading-none text-glow">
                {formatTemperature(currentTemp, tempUnit).replace('°C', '').replace('°F', '')}
              </span>
              <span className="text-4xl font-light text-on-surface-variant block mt-4 ml-2">°{tempUnit}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="material-symbols-outlined text-8xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isRainy ? 'rainy' : 'cloud_queue'}
              </span>
              <div className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">thermostat</span>
                <span className="text-sm font-medium">Feels like {Math.round(apparentTemp)}°</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-4 pt-8 mt-8 border-t border-outline-variant/10 gap-4">
            <div className="flex flex-col">
              <span className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant mb-1">Sunrise</span>
              <span className="text-on-surface font-semibold text-sm xl:text-base">{daily?.sunrise?.[0]?.split('T')[1] || '--:--'}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant mb-1">Sunset</span>
              <span className="text-on-surface font-semibold text-sm xl:text-base">{daily?.sunset?.[0]?.split('T')[1] || '--:--'}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant mb-1">Humidity</span>
              <span className="text-on-surface font-semibold text-sm xl:text-base">{Math.round(humidity)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant mb-1">Precipitation</span>
              <span className="text-on-surface font-semibold text-sm xl:text-base">{precip} mm</span>
            </div>
          </div>
        </div>

        {/* Replaced Radar with Air Quality Details */}
        <div className="lg:col-span-1 glass-card rounded-xl p-6 flex flex-col min-h-[400px] transition-transform duration-300 hover:scale-[1.01] hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant">Air Quality Analysis</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wider ${aqi > 50 ? 'bg-error-container text-error' : 'bg-primary/20 text-primary-fixed-dim'}`}>
              AQI: {aqi}
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-between gap-4">
            {[
              { label: 'PM10 Density', value: aqData.hourly.pm10[0], unit: 'μg/m³', color: 'text-primary' },
              { label: 'PM2.5 Density', value: aqData.hourly.pm2_5[0], unit: 'μg/m³', color: 'text-tertiary' },
              { label: 'Carbon Monoxide', value: aqData.hourly.carbon_monoxide[0], unit: 'μg/m³', color: 'text-secondary' },
              { label: 'Carbon Dioxide', value: aqData.hourly.carbon_dioxide?.[0] || 'N/A', unit: 'μg/m³', color: 'text-on-surface' },
              { label: 'Nitrogen Dioxide', value: aqData.hourly.nitrogen_dioxide[0], unit: 'μg/m³', color: 'text-on-surface' },
              { label: 'Sulphur Dioxide', value: aqData.hourly.sulphur_dioxide[0], unit: 'μg/m³', color: 'text-on-surface' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                <span className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors cursor-default">{item.label}</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                  <span className="text-[10px] text-on-surface-variant">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3 stagger-reveal" style={{ animationDelay: '140ms' }}>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">Quick Indicators</p>
          <p className="text-sm text-on-surface-variant mt-1">Core metrics optimized for at-a-glance scanning.</p>
        </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Humidity */}
        <div className="bg-surface-container card-soft-depth rounded-2xl md:rounded-xl p-5 md:p-6 hover:bg-surface-container-high transition-all duration-300 group hover:scale-[1.03] hover:-translate-y-1">
          <span className="material-symbols-outlined text-secondary mb-4 block">humidity_mid</span>
          <p className="font-label uppercase tracking-[0.05em] text-[0.6rem] text-on-surface-variant mb-1 font-medium md:font-bold">Humidity</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-on-surface">{Math.round(humidity)}</span>
            <span className="text-sm text-on-surface-variant">%</span>
          </div>
        </div>
        
        {/* Wind Speed Max */}
        <div className="bg-surface-container card-soft-depth rounded-2xl md:rounded-xl p-5 md:p-6 hover:bg-surface-container-high transition-all duration-300 group hover:scale-[1.03] hover:-translate-y-1">
          <span className="material-symbols-outlined text-tertiary mb-4 block">air</span>
          <p className="font-label uppercase tracking-[0.05em] text-[0.6rem] text-on-surface-variant mb-1 font-medium md:font-bold">Max Wind Speed</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-on-surface">{Math.max(...(hourly?.wind_speed_10m?.slice(0, 24) || [0]))}</span>
            <span className="text-sm text-on-surface-variant">km/h</span>
          </div>
        </div>

        {/* UV Index */}
        <div className="bg-surface-container card-soft-depth rounded-2xl md:rounded-xl p-5 md:p-6 hover:bg-surface-container-high transition-all duration-300 group hover:scale-[1.03] hover:-translate-y-1">
          <span className="material-symbols-outlined text-primary mb-4 block">light_mode</span>
          <p className="font-label uppercase tracking-[0.05em] text-[0.6rem] text-on-surface-variant mb-1 font-medium md:font-bold">UV Index</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-on-surface">{uvIndex}</span>
            <span className="text-xs px-2 py-0.5 ml-2 bg-secondary/20 text-secondary-fixed-dim rounded">
              {uvIndex > 5 ? 'HIGH' : 'MOD'}
            </span>
          </div>
        </div>

        {/* Precipitation */}
        <div className="bg-surface-container card-soft-depth rounded-2xl md:rounded-xl p-5 md:p-6 hover:bg-surface-container-high transition-all duration-300 group hover:scale-[1.03] hover:-translate-y-1">
          <span className="material-symbols-outlined text-secondary mb-4 block">rainy</span>
          <p className="font-label uppercase tracking-[0.05em] text-[0.6rem] text-on-surface-variant mb-1 font-medium md:font-bold">Precip Probability</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-on-surface">{daily?.precipitation_probability_max?.[0] || 0}</span>
            <span className="text-sm text-on-surface-variant">%</span>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-surface-container card-soft-depth rounded-2xl md:rounded-xl p-5 md:p-6 hover:bg-surface-container-high transition-all duration-300 group hover:scale-[1.03] hover:-translate-y-1">
          <span className="material-symbols-outlined text-on-surface-variant mb-4 block">visibility</span>
          <p className="font-label uppercase tracking-[0.05em] text-[0.6rem] text-on-surface-variant mb-1 font-medium md:font-bold">Visibility</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-on-surface">{Math.round(visibilityKm)}</span>
            <span className="text-sm text-on-surface-variant">km</span>
          </div>
        </div>

        {/* General Overview */}
        <div className="bg-surface-container card-soft-depth rounded-2xl md:rounded-xl p-5 md:p-6 hover:bg-surface-container-high transition-all duration-300 group hover:scale-[1.03] hover:-translate-y-1">
          <span className="material-symbols-outlined text-primary mb-4 block">thermostat</span>
          <p className="font-label uppercase tracking-[0.05em] text-[0.6rem] text-on-surface-variant mb-1 font-medium md:font-bold">Min / Max Temp</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-secondary">{Math.round(daily?.temperature_2m_min?.[0] || 0)}°</span>
            <span className="text-sm text-on-surface-variant mx-1">/</span>
            <span className="text-xl font-bold text-error">{Math.round(daily?.temperature_2m_max?.[0] || 0)}°</span>
          </div>
        </div>
      </div>
      </section>

      {/* Hourly Data Interactive Charts */}
      <section className="glass-card card-soft-depth rounded-2xl md:rounded-[1.75rem] p-6 md:p-8 mt-4 stagger-reveal" style={{ animationDelay: '240ms' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-on-surface mb-1">Hourly Data Analytics</h3>
            <p className="text-on-surface-variant text-sm">Interactive granular datasets (Scroll to zoom/pan horizontally)</p>
          </div>
          <div className="flex items-center bg-surface-container-highest p-1 rounded-full card-soft-depth">
            <button 
              onClick={() => setTempUnit('C')}
              className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all border-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${tempUnit === 'C' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Celsius
            </button>
            <button 
              onClick={() => setTempUnit('F')}
              className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all border-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${tempUnit === 'F' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Fahrenheit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Temperature Chart */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 transition-transform duration-300 hover:scale-[1.015]">
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant">Temperature Profile</h4>
              <div className="text-right text-[10px] leading-tight text-on-surface-variant/80">
                <p>Updated: {format(new Date(), 'HH:mm')}</p>
                <p>Range: {chartRangeLabel}</p>
              </div>
            </div>
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

          {/* Precipitation & Real-time Info */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 transition-transform duration-300 hover:scale-[1.015]">
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant">Precipitation Outlook</h4>
              <div className="text-right text-[10px] leading-tight text-on-surface-variant/80">
                <p>Updated: {format(new Date(), 'HH:mm')}</p>
                <p>Range: {chartRangeLabel}</p>
              </div>
            </div>
            {isValidChartData(hourly?.time) && isValidChartData(hourly?.precipitation) ? (
              <ReactECharts 
                option={getPrecipitationChartOption(hourly?.time?.slice(0, 48) || [], hourly?.precipitation?.slice(0, 48) || [], 'dark')} 
                style={{ height: '300px', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            ) : (
              <ChartEmptyState title="No precipitation data available" icon="rainy" />
            )}
          </div>

          {/* PM10 / PM2.5 Chart */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 transition-transform duration-300 hover:scale-[1.015]">
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant">PM10 & PM2.5 Particulates</h4>
              <div className="text-right text-[10px] leading-tight text-on-surface-variant/80">
                <p>Updated: {format(new Date(), 'HH:mm')}</p>
                <p>Range: {chartRangeLabel}</p>
              </div>
            </div>
            {isValidChartData(aqData?.hourly?.time) && isValidChartData(aqData?.hourly?.pm2_5) && isValidChartData(aqData?.hourly?.pm10) ? (
              <ReactECharts 
                option={getAQIChartOption(aqData?.hourly?.time?.slice(0, 48) || [], aqData?.hourly?.pm2_5?.slice(0, 48) || [], aqData?.hourly?.pm10?.slice(0, 48) || [], 'dark')} 
                style={{ height: '300px', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            ) : (
              <ChartEmptyState title="No air quality data available" icon="air" />
            )}
          </div>

          {/* Humidity Chart */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 transition-transform duration-300 hover:scale-[1.015]">
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant">Relative Humidity Variance</h4>
              <div className="text-right text-[10px] leading-tight text-on-surface-variant/80">
                <p>Updated: {format(new Date(), 'HH:mm')}</p>
                <p>Range: {chartRangeLabel}</p>
              </div>
            </div>
            {isValidChartData(hourly?.time) && isValidChartData(hourly?.relative_humidity_2m) ? (
              <ReactECharts 
                option={getHumidityChartOption(hourly?.time?.slice(0, 48) || [], hourly?.relative_humidity_2m?.slice(0, 48) || [], 'dark')} 
                style={{ height: '300px', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            ) : (
              <ChartEmptyState title="No humidity data available" icon="humidity_mid" />
            )}
          </div>

          {/* Wind Speed Chart */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 transition-transform duration-300 hover:scale-[1.015]">
           <div className="flex items-start justify-between mb-4">
             <h4 className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant">Kinetic Wind Speed (10m)</h4>
             <div className="text-right text-[10px] leading-tight text-on-surface-variant/80">
               <p>Updated: {format(new Date(), 'HH:mm')}</p>
               <p>Range: {chartRangeLabel}</p>
             </div>
           </div>
            {isValidChartData(hourly?.time) && isValidChartData(hourly?.wind_speed_10m) ? (
              <ReactECharts 
                option={getWindChartOption(hourly?.time?.slice(0, 48) || [], hourly?.wind_speed_10m?.slice(0, 48) || [], 'dark')} 
                style={{ height: '300px', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            ) : (
              <ChartEmptyState title="No wind data available" icon="air" />
            )}
          </div>

          {/* Visibility Chart */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 transition-transform duration-300 hover:scale-[1.015]">
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant">Atmospheric Visibility</h4>
              <div className="text-right text-[10px] leading-tight text-on-surface-variant/80">
                <p>Updated: {format(new Date(), 'HH:mm')}</p>
                <p>Range: {chartRangeLabel}</p>
              </div>
            </div>
            {isValidChartData(hourly?.time) && isValidChartData(hourly?.visibility) ? (
              <ReactECharts 
                option={getVisibilityChartOption(hourly?.time?.slice(0, 48) || [], (hourly?.visibility?.slice(0, 48) || []).map((v: number) => v / 1000), 'dark')} 
                style={{ height: '300px', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            ) : (
              <ChartEmptyState title="No visibility data available" icon="visibility" />
            )}
          </div>
        </div>
      </section>
    </>
  );
};
