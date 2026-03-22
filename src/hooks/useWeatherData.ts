import { useQuery } from '@tanstack/react-query';
import { fetchWeatherData, fetchAirQualityData, fetchHistoricalData, fetchHistoricalAirQualityData, Location } from '../services/api';

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

interface CachedPayload<T> {
  timestamp: number;
  data: T;
}

const getCacheKey = (type: string, location: Location, dateA?: string, dateB?: string) =>
  `weather-dashboard:${type}:${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}:${dateA || ''}:${dateB || ''}`;

const readCache = <T,>(key: string): T | undefined => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CachedPayload<T>;
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return undefined;
    }
    return parsed.data;
  } catch {
    return undefined;
  }
};

const writeCache = <T,>(key: string, data: T) => {
  try {
    const payload: CachedPayload<T> = { timestamp: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore cache write failures (private mode/storage limits)
  }
};

export const useWeatherData = (location: Location | null, date?: string) => {
  const cacheKey = location ? getCacheKey('weather', location, date) : '';

  return useQuery({
    queryKey: ['weather', location?.latitude, location?.longitude, date],
    queryFn: async () => {
      const data = await fetchWeatherData(location!, date);
      writeCache(cacheKey, data);
      return data;
    },
    enabled: !!location,
    placeholderData: () => (location ? readCache(cacheKey) : undefined),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAirQualityData = (location: Location | null, date?: string) => {
  const cacheKey = location ? getCacheKey('aq', location, date) : '';

  return useQuery({
    queryKey: ['airQuality', location?.latitude, location?.longitude, date],
    queryFn: async () => {
      const data = await fetchAirQualityData(location!, date);
      writeCache(cacheKey, data);
      return data;
    },
    enabled: !!location,
    placeholderData: () => (location ? readCache(cacheKey) : undefined),
    staleTime: 1000 * 60 * 5,
  });
};

export const useHistoricalData = (location: Location | null, startDate: string, endDate: string) => {
  const cacheKey = location ? getCacheKey('historical-weather', location, startDate, endDate) : '';

  return useQuery({
    queryKey: ['historical', location?.latitude, location?.longitude, startDate, endDate],
    queryFn: async () => {
      const data = await fetchHistoricalData(location!, startDate, endDate);
      writeCache(cacheKey, data);
      return data;
    },
    enabled: !!location && !!startDate && !!endDate,
    placeholderData: () => (location ? readCache(cacheKey) : undefined),
    staleTime: 1000 * 60 * 10,
  });
};

export const useHistoricalAirQualityData = (location: Location | null, startDate: string, endDate: string) => {
  const cacheKey = location ? getCacheKey('historical-aq', location, startDate, endDate) : '';

  return useQuery({
    queryKey: ['historicalAirQuality', location?.latitude, location?.longitude, startDate, endDate],
    queryFn: async () => {
      const data = await fetchHistoricalAirQualityData(location!, startDate, endDate);
      writeCache(cacheKey, data);
      return data;
    },
    enabled: !!location && !!startDate && !!endDate,
    placeholderData: () => (location ? readCache(cacheKey) : undefined),
    staleTime: 1000 * 60 * 10,
  });
};
