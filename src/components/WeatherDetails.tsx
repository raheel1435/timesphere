import { FiX } from "react-icons/fi";
import type { WeatherData } from "../types";

interface Props {
  weather: WeatherData;
  onClose: () => void;
}

function fmtTime(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit"
  });
}

export default function WeatherDetails({ weather, onClose }: Props) {
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="glass-card w-full max-w-sm p-5 fade-in-up">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Weather Details</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-all">
            <FiX size={18} />
          </button>
        </div>

        {/* Main display */}
        <div className="flex items-center gap-4 mb-5">
          <img src={iconUrl} alt={weather.description} className="w-20 h-20 object-contain" />
          <div>
            <div className="text-white text-4xl font-bold leading-none">{weather.temp}°C</div>
            <div className="text-white/70 text-sm capitalize mt-1">{weather.description}</div>
            <div className="text-white font-semibold text-sm mt-0.5">
              {weather.city}, {weather.country}
            </div>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-white/50 text-xs mb-1">Condition</div>
            <div className="text-white font-semibold text-sm">{weather.condition}</div>
          </div>

          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-white/50 text-xs mb-1">Humidity</div>
            <div className="text-white font-semibold text-sm">{weather.humidity}%</div>
          </div>

          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-white/50 text-xs mb-1">🌅 Sunrise</div>
            <div className="text-white font-semibold text-sm">{fmtTime(weather.sunrise)}</div>
          </div>

          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-white/50 text-xs mb-1">🌇 Sunset</div>
            <div className="text-white font-semibold text-sm">{fmtTime(weather.sunset)}</div>
          </div>
        </div>

        <div className="mt-4 text-center text-white/30 text-xs">
          {weather.lat.toFixed(4)}°N · {weather.lon.toFixed(4)}°E
        </div>
      </div>
    </div>
  );
}
