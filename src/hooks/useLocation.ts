import { useState, useEffect } from 'react';
import { DEFAULT_LOCATION } from '../constants/config';

export const useLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation fallback used:', err.message);
        setError(err.message);
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      },
      { timeout: 5000, maximumAge: 1000 * 60 * 15 } // 5s timeout, 15 min cache
    );
  }, []);

  return { location, error, loading };
};
