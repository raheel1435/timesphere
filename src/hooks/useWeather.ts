// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useWeather.ts
//
// Fetches real-time weather data from OpenWeatherMap API.
//
// WHAT THIS HOOK DOES:
//   1. Receives latitude + longitude from useGeolocation
//   2. Calls the OpenWeatherMap API with those coordinates
//   3. Returns weather info: temperature, condition (rain/clear/clouds), city name,
//      sunrise time, sunset time, etc.
//   4. Automatically refreshes every 10 minutes
//
// OPENWEATHERMAP API:
//   URL: https://api.openweathermap.org/data/2.5/weather?lat=...&lon=...&appid=...
//   Returns a JSON object with current weather for that GPS location.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";  // React hooks
import type { WeatherData }    from "../types"; // our TypeScript shape for weather data

// The OpenWeatherMap API key comes from the .env file
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// How often to refresh weather data (in milliseconds). 10 minutes = 600,000 ms
const REFRESH_INTERVAL = 10 * 60 * 1000;

// useWeather takes a lat/lon and returns weather data + loading/error states
export function useWeather(lat: number, lon: number) {

  // "data" holds the weather information once it arrives (null while loading)
  const [data,    setData]    = useState<WeatherData | null>(null);

  // "loading" is true while we're waiting for the API to respond
  const [loading, setLoading] = useState<boolean>(true);

  // "error" holds a message if something went wrong (e.g. network error)
  const [error,   setError]   = useState<string | null>(null);

  // The main fetch function – stable reference via useCallback so it can be a dep
  const fetchWeather = useCallback(async () => {
    if (lat === 0 && lon === 0) return;

    try {
      setLoading(true);

      const url = `https://api.openweathermap.org/data/2.5/weather`
                + `?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const json = await response.json();

      setData({
        city:        json.name,
        country:     json.sys.country,
        condition:   json.weather[0].main,
        description: json.weather[0].description,
        icon:        json.weather[0].icon,
        temp:        Math.round(json.main.temp),
        humidity:    json.main.humidity,
        sunrise:     json.sys.sunrise,
        sunset:      json.sys.sunset,
        lat:         json.coord.lat,
        lon:         json.coord.lon
      });

      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown weather error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchWeather();
    const timer = setInterval(fetchWeather, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchWeather]);

  // Return everything the component needs
  return { data, loading, error };
}
