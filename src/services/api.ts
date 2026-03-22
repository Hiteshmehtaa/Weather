import { API_BASE_URL, AIR_QUALITY_API_BASE_URL, WEATHER_PARAMS, AIR_QUALITY_PARAMS } from '../constants/config';

export interface Location {
  latitude: number;
  longitude: number;
}

export const fetchWeatherData = async (location: Location, date?: string) => {
  const { latitude, longitude } = location;

  // Determine if date is historical (> 7 days ago). Forecast API only covers ~7 days back.
  const isHistorical = (() => {
    if (!date) return false;
    const selected = new Date(date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return selected < cutoff;
  })();

  let url: string;

  if (!date || !isHistorical) {
    // Use forecast API — supports current + hourly + daily for recent/future dates
    url = `${API_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=${WEATHER_PARAMS.current.join(',')}&hourly=${WEATHER_PARAMS.hourly.join(',')}&daily=${WEATHER_PARAMS.daily.join(',')}&timezone=auto`;
    if (date) url += `&start_date=${date}&end_date=${date}`;
  } else {
    // Use archive API — no 'current', no 'precipitation_probability' in hourly
    const archiveHourly = WEATHER_PARAMS.hourly.filter(p => p !== 'precipitation_probability');
    url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&hourly=${archiveHourly.join(',')}&daily=${WEATHER_PARAMS.daily.join(',')}&timezone=auto&start_date=${date}&end_date=${date}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather data fetch failed');
  return response.json();
};

export const fetchAirQualityData = async (location: Location, date?: string) => {
  const { latitude, longitude } = location;

  const isHistorical = (() => {
    if (!date) return false;
    const selected = new Date(date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return selected < cutoff;
  })();

  // For historical AQ, carbon_dioxide is often unavailable — drop it to avoid 400s
  const params = isHistorical
    ? AIR_QUALITY_PARAMS.filter(p => p !== 'carbon_dioxide')
    : AIR_QUALITY_PARAMS;

  let url = `${AIR_QUALITY_API_BASE_URL}/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=${params.join(',')}&timezone=auto`;
  if (date) url += `&start_date=${date}&end_date=${date}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Air quality data fetch failed');
  return response.json();
};

export const fetchHistoricalData = async (location: Location, startDate: string, endDate: string) => {
  const { latitude, longitude } = location;
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=${WEATHER_PARAMS.daily.join(',')}&hourly=${WEATHER_PARAMS.hourly.join(',')}&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Historical data fetch failed');
  return response.json();
};

export const fetchHistoricalAirQualityData = async (location: Location, startDate: string, endDate: string) => {
  const { latitude, longitude } = location;
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=${AIR_QUALITY_PARAMS.join(',')}&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Historical AQI data fetch failed');
  return response.json();
};
