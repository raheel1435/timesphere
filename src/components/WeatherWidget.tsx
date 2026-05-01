// ─────────────────────────────────────────────────────────────────────────────
// src/components/WeatherWidget.tsx
//
// Top-right corner widget showing:
//   • Current city name
//   • Temperature
//   • Weather icon (from OpenWeatherMap)
//   • Weather description
// ─────────────────────────────────────────────────────────────────────────────

import type { WeatherData } from "../types"; // type-only import

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  weather:  WeatherData | null;
  loading:  boolean;
  units:    "metric" | "imperial";
  onClick?: () => void;
}

export default function WeatherWidget({ weather, loading, units, onClick }: Props) {

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading || !weather) {
    return (
      <div className="flex items-center gap-2">
        {/* Animated loading dots */}
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce"
              style={{ animationDelay: `${i*0.15}s` }} // stagger the bounce
            />
          ))}
        </div>
        <span className="text-white/60 text-xs">Getting weather...</span>
      </div>
    );
  }

  // ── OpenWeatherMap icon URL ───────────────────────────────────────────────
  // The icon code from the API (e.g. "01d") maps to an image at this URL
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex items-center gap-2 fade-in-up cursor-pointer transition-all"
      onClick={onClick}
      title="View weather details"
    >

      {/* Weather icon from OpenWeatherMap */}
      <img
        src={iconUrl}                            // URL built from the icon code
        alt={weather.description}               // accessibility description
        className="w-10 h-10 object-contain"    // fixed size, no cropping
      />

      {/* City name + temperature */}
      <div className="flex flex-col items-start drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
        <span className="text-white font-semibold text-sm leading-tight">
          {weather.city}, {weather.country}
        </span>
        <span className="text-white/80 text-xs">
          {units === "imperial"
            ? `${Math.round(weather.temp * 9/5 + 32)}°F`
            : `${weather.temp}°C`
          } · {weather.description}
        </span>
      </div>
    </div>
  );
}
