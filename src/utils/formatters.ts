import { format, parseISO } from 'date-fns';

export const formatTemperature = (value: number, unit: 'C' | 'F' = 'C') => {
  if (unit === 'F') {
    return `${Math.round((value * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(value)}°C`;
};

export const formatTime = (time: string) => {
  return format(parseISO(time), 'HH:mm');
};

export const formatDate = (date: string) => {
  return format(parseISO(date), 'EEE, MMM d');
};

export const getWindDirection = (degree: number) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degree / 45) % 8];
};

export const getWeatherDescription = (code: number) => {
  // WMO Weather interpretation codes (WW)
  const codes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
  };
  return codes[code] || 'Unknown';
};

/**
 * Validates if an array has sufficient data for chart rendering
 * @param data - Array to validate
 * @param minLength - Minimum required length (default: 1)
 * @returns boolean indicating if data is valid
 */
export const isValidChartData = (
  data: any[] | undefined | null,
  minLength: number = 1
): boolean => {
  return Array.isArray(data) && data.length >= minLength;
};

/**
 * Validates multiple data arrays for chart rendering
 * @param datasets - Array of data arrays to validate
 * @returns boolean indicating if all datasets are valid
 */
export const areValidChartDatas = (
  datasets: (any[] | undefined | null)[]
): boolean => {
  return datasets.every(data => isValidChartData(data, 1));
};
