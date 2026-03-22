import { API_BASE_URL, AIR_QUALITY_API_BASE_URL, WEATHER_PARAMS, AIR_QUALITY_PARAMS } from '../constants/config';

export interface Location {
  latitude: number;
  longitude: number;
}

export const fetchWeatherData = async (location: Location) => {
  const { latitude, longitude } = location;
  const url = `${API_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=${WEATHER_PARAMS.current.join(',')}&hourly=${WEATHER_PARAMS.hourly.join(',')}&daily=${WEATHER_PARAMS.daily.join(',')}&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather data fetch failed');
  return response.json();
};

export const fetchAirQualityData = async (location: Location) => {
  const { latitude, longitude } = location;
  const url = `${AIR_QUALITY_API_BASE_URL}/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=${AIR_QUALITY_PARAMS.join(',')}&timezone=auto`;
  
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
