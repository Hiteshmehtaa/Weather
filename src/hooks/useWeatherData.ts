import { useQuery } from '@tanstack/react-query';
import { fetchWeatherData, fetchAirQualityData, fetchHistoricalData, fetchHistoricalAirQualityData, Location } from '../services/api';

export const useWeatherData = (location: Location | null) => {
  return useQuery({
    queryKey: ['weather', location?.latitude, location?.longitude],
    queryFn: () => fetchWeatherData(location!),
    enabled: !!location,
  });
};

export const useAirQualityData = (location: Location | null) => {
  return useQuery({
    queryKey: ['airQuality', location?.latitude, location?.longitude],
    queryFn: () => fetchAirQualityData(location!),
    enabled: !!location,
  });
};

export const useHistoricalData = (location: Location | null, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['historical', location?.latitude, location?.longitude, startDate, endDate],
    queryFn: () => fetchHistoricalData(location!, startDate, endDate),
    enabled: !!location && !!startDate && !!endDate,
  });
};

export const useHistoricalAirQualityData = (location: Location | null, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['historicalAirQuality', location?.latitude, location?.longitude, startDate, endDate],
    queryFn: () => fetchHistoricalAirQualityData(location!, startDate, endDate),
    enabled: !!location && !!startDate && !!endDate,
  });
};
