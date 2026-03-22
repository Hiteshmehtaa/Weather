export const API_BASE_URL = 'https://api.open-meteo.com/v1';
export const AIR_QUALITY_API_BASE_URL = 'https://air-quality-api.open-meteo.com/v1';

export const DEFAULT_LOCATION = {
  latitude: 28.6139, // New Delhi
  longitude: 77.2090,
};

export const WEATHER_PARAMS = {
  current: [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'precipitation',
    'rain',
    'showers',
    'snowfall',
    'weather_code',
    'cloud_cover',
    'pressure_msl',
    'surface_pressure',
    'wind_speed_10m',
  ],
  hourly: [
    'temperature_2m',
    'relative_humidity_2m',
    'dew_point_2m',
    'apparent_temperature',
    'precipitation_probability',
    'precipitation',
    'weather_code',
    'pressure_msl',
    'surface_pressure',
    'cloud_cover',
    'visibility',
    'evapotranspiration',
    'wind_speed_10m',
    'uv_index',
  ],
  daily: [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'temperature_2m_mean',
    'sunrise',
    'sunset',
    'uv_index_max',
    'precipitation_sum',
    'rain_sum',
    'showers_sum',
    'snowfall_sum',
    'precipitation_hours',
    'precipitation_probability_max',
    'wind_direction_10m_dominant',
    'wind_speed_10m_max'
  ],
};

export const AIR_QUALITY_PARAMS = [
  'pm10',
  'pm2_5',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
  'european_aqi',
  'carbon_dioxide',
];
