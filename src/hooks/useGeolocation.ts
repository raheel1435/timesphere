// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useGeolocation.ts
//
// A custom React "hook" that asks the browser for the user's GPS coordinates.
//
// WHAT IS A HOOK?
//   A hook is a special function that starts with "use" and lets a component
//   remember state (useState) or run side effects (useEffect).
//   By putting this logic in a hook, any component can just call useGeolocation()
//   and get the user's location without rewriting the same code every time.
//
// HOW BROWSER GEOLOCATION WORKS:
//   1. We call navigator.geolocation.getCurrentPosition()
//   2. The browser shows a popup asking the user to allow/deny location access
//   3. If allowed → we receive { latitude, longitude }
//   4. If denied  → we receive an error message
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react"; // useState stores data, useEffect runs code on mount
import type { GeoPosition }    from "../types"; // import our TypeScript shape for position data

// useGeolocation is our custom hook – it returns a GeoPosition object
export function useGeolocation(): GeoPosition {

  // useState creates a variable + a setter function.
  // The initial value is { lat: 0, lon: 0, loading: true, error: null }
  // "loading: true" means we're still waiting for the browser to respond.
  const [position, setPosition] = useState<GeoPosition>({
    lat:     0,     // default latitude (equator) until real location arrives
    lon:     0,     // default longitude (prime meridian) until real location arrives
    loading: true,  // we start in "loading" state
    error:   null   // no error yet
  });

  // useEffect runs once after the component mounts (because [] dependency array is empty).
  // This is where we ask the browser for the user's location.
  useEffect(() => {

    // Check if the browser supports Geolocation (all modern browsers do)
    if (!navigator.geolocation) {
      // If not supported, set an error and stop loading
      setPosition(prev => ({ ...prev, loading: false, error: "Geolocation not supported by your browser." }));
      return; // exit early – nothing more we can do
    }

    // Ask the browser for the current GPS position.
    // This might take 1-5 seconds and shows a permission popup the first time.
    navigator.geolocation.getCurrentPosition(
      // ── SUCCESS CALLBACK ──────────────────────────────────────────────────
      // Called when the browser successfully retrieves the position
      (pos) => {
        setPosition({
          lat:     pos.coords.latitude,  // e.g. 59.33 (Stockholm's latitude)
          lon:     pos.coords.longitude, // e.g. 18.07 (Stockholm's longitude)
          loading: false,                // done loading
          error:   null                  // no error
        });
      },

      // ── ERROR CALLBACK ────────────────────────────────────────────────────
      // Called when the browser fails (user denied, timeout, etc.)
      (err) => {
        // err.message is a human-readable explanation from the browser
        setPosition(prev => ({ ...prev, loading: false, error: err.message }));

        // Fall back to Stockholm, Sweden as the default location
        // so the clock still works even without location permission
        setPosition({
          lat:     59.3293, // Stockholm latitude
          lon:     18.0686, // Stockholm longitude
          loading: false,
          error:   "Location denied – using Stockholm as default."
        });
      },

      // ── OPTIONS ───────────────────────────────────────────────────────────
      {
        enableHighAccuracy: false, // false = faster, uses network instead of GPS chip
        timeout:            10000, // wait maximum 10 seconds before giving up
        maximumAge:         300000 // accept a cached position up to 5 minutes old (300000ms)
      }
    );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // state setters are stable — empty array is correct here

  return position; // give the caller the current position state
}
