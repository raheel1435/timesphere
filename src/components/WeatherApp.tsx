import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import type { WeatherData } from "../types";

interface Props {
  weather: WeatherData;
  lat:     number;
  lon:     number;
  onClose: () => void;
}

// ── WMO weather code helpers ──────────────────────────────────────────────────
function wmoEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 49) return "🌫";
  if (code <= 59) return "🌦";
  if (code <= 69) return "🌧";
  if (code <= 79) return "🌨";
  if (code <= 84) return "🌦";
  if (code <= 94) return "🌨";
  return "⛈";
}

function wmoLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Rain showers";
  if (code <= 94) return "Snow showers";
  return "Thunderstorm";
}

function aqiInfo(aqi: number): { label: string; color: string } {
  if (aqi <= 50)  return { label: "Good",          color: "#22c55e" };
  if (aqi <= 100) return { label: "Moderate",       color: "#eab308" };
  if (aqi <= 150) return { label: "Unhealthy*",     color: "#f97316" };
  if (aqi <= 200) return { label: "Unhealthy",      color: "#ef4444" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#a855f7" };
  return             { label: "Hazardous",           color: "#7f1d1d" };
}

function uvLabel(uv: number): string {
  if (uv < 3)  return "Low";
  if (uv < 6)  return "Moderate";
  if (uv < 8)  return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

// ── Moon phase ────────────────────────────────────────────────────────────────
function moonPhase(date: Date): { name: string; emoji: string; illumination: number } {
  const knownNew = new Date(2000, 0, 6).getTime();
  const cycle    = 29.530588853;
  const days     = (date.getTime() - knownNew) / 86_400_000;
  const phase    = ((days % cycle) + cycle) % cycle;
  const frac     = phase / cycle;
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * frac)));

  let name: string; let emoji: string;
  if      (frac < 0.0625) { name = "New Moon";        emoji = "🌑"; }
  else if (frac < 0.1875) { name = "Waxing Crescent"; emoji = "🌒"; }
  else if (frac < 0.3125) { name = "First Quarter";   emoji = "🌓"; }
  else if (frac < 0.4375) { name = "Waxing Gibbous";  emoji = "🌔"; }
  else if (frac < 0.5625) { name = "Full Moon";       emoji = "🌕"; }
  else if (frac < 0.6875) { name = "Waning Gibbous";  emoji = "🌖"; }
  else if (frac < 0.8125) { name = "Last Quarter";    emoji = "🌗"; }
  else if (frac < 0.9375) { name = "Waning Crescent"; emoji = "🌘"; }
  else                    { name = "New Moon";         emoji = "🌑"; }

  return { name, emoji, illumination };
}

// ── Activity score (0–100) ────────────────────────────────────────────────────
function activityScore(
  type: "running" | "cycling" | "walking",
  temp: number, wind: number, precipProb: number, uvIndex: number
): number {
  const ranges: Record<string, [number, number]> = {
    running: [5, 18], cycling: [8, 25], walking: [0, 30]
  };
  const windLimits: Record<string, number> = { running: 20, cycling: 15, walking: 30 };
  let s = 100;
  const [tMin, tMax] = ranges[type];
  if (temp < tMin) s -= (tMin - temp) * 3;
  if (temp > tMax) s -= (temp - tMax) * 3;
  if (wind > windLimits[type]) s -= (wind - windLimits[type]) * 2;
  s -= precipProb * 0.5;
  if (uvIndex > 8) s -= (uvIndex - 8) * 5;
  return Math.max(0, Math.min(100, Math.round(s)));
}

function scoreColor(s: number) {
  if (s >= 75) return "#22c55e";
  if (s >= 50) return "#eab308";
  if (s >= 25) return "#f97316";
  return "#ef4444";
}

// ── Open-Meteo response shapes ────────────────────────────────────────────────
interface HourlyData {
  time:                      string[];
  temperature_2m:            number[];
  apparent_temperature:      number[];
  precipitation_probability: number[];
  weathercode:               number[];
  windspeed_10m:             number[];
  relativehumidity_2m:       number[];
  uv_index:                  number[];
  dewpoint_2m:               number[];
  surface_pressure:          number[];
}

interface DailyData {
  time:                          string[];
  weathercode:                   number[];
  temperature_2m_max:            number[];
  temperature_2m_min:            number[];
  sunrise:                       string[];
  sunset:                        string[];
  uv_index_max:                  number[];
  precipitation_sum:             number[];
  precipitation_probability_max: number[];
}

type Tab = "today" | "forecast" | "details" | "sky";

const TABS: { id: Tab; label: string }[] = [
  { id: "today",    label: "Today"    },
  { id: "forecast", label: "7-Day"    },
  { id: "details",  label: "Details"  },
  { id: "sky",      label: "Sky"      },
];

// Format "YYYY-MM-DDTHH:MM" → "HH:MM"
function fmtHour(isoLocal: string): string {
  return isoLocal.slice(11, 16);
}

function fmtDay(isoLocal: string): string {
  const date = new Date(isoLocal + "T00:00:00");
  const today    = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString())    return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

function fmtTime(isoLocal: string): string {
  // isoLocal can be "YYYY-MM-DDTHH:MM" (Open-Meteo format, local time)
  const parts = isoLocal.match(/T(\d{2}):(\d{2})/);
  if (!parts) return isoLocal;
  const h = parseInt(parts[1], 10);
  const m = parts[2];
  const ampm = h < 12 ? "AM" : "PM";
  const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${ampm}`;
}

function dayLength(sunrise: string, sunset: string): string {
  const riseH = parseInt(sunrise.slice(11, 13), 10);
  const riseM = parseInt(sunrise.slice(14, 16), 10);
  const setH  = parseInt(sunset.slice(11, 13), 10);
  const setM  = parseInt(sunset.slice(14, 16), 10);
  const totalMins = (setH * 60 + setM) - (riseH * 60 + riseM);
  if (totalMins <= 0) return "—";
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${m}m`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WeatherApp({ weather, lat, lon, onClose }: Props) {
  const [tab,     setTab]     = useState<Tab>("today");
  const [hourly,  setHourly]  = useState<HourlyData | null>(null);
  const [daily,   setDaily]   = useState<DailyData | null>(null);
  const [aqi,     setAqi]     = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const [fcRes, aqRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
            + `&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode`
            + `,windspeed_10m,relativehumidity_2m,uv_index,dewpoint_2m,surface_pressure`
            + `&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset`
            + `,uv_index_max,precipitation_sum,precipitation_probability_max`
            + `&timezone=auto&forecast_days=7`),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}`
            + `&hourly=us_aqi&timezone=auto&forecast_days=1`)
        ]);
        const fcJson = await fcRes.json();
        const aqJson = await aqRes.json();
        if (cancelled) return;
        setHourly(fcJson.hourly as HourlyData);
        setDaily(fcJson.daily as DailyData);
        const nowH = new Date().getHours();
        const aqiVal = aqJson.hourly?.us_aqi?.[nowH] ?? null;
        setAqi(typeof aqiVal === "number" ? aqiVal : null);
      } catch { /* fail silently */ }
      finally  { if (!cancelled) setLoading(false); }
    }
    loadData();
    return () => { cancelled = true; };
  }, [lat, lon]);

  // Find current hour index in hourly array
  const curIdx = (() => {
    if (!hourly) return 0;
    const now = new Date();
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const needle = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())}T${pad2(now.getHours())}:00`;
    const idx = hourly.time.indexOf(needle);
    return idx >= 0 ? idx : 0;
  })();

  // Derived current values
  const feelsLike  = hourly ? Math.round(hourly.apparent_temperature[curIdx])      : null;
  const wind       = hourly ? Math.round(hourly.windspeed_10m[curIdx])             : null;
  const humidity   = hourly ? hourly.relativehumidity_2m[curIdx]                   : weather.humidity;
  const uvNow      = hourly ? Math.round(hourly.uv_index[curIdx])                  : 0;
  const dewPoint   = hourly ? Math.round(hourly.dewpoint_2m[curIdx])               : null;
  const pressure   = hourly ? Math.round(hourly.surface_pressure[curIdx])          : null;
  const precipProb = hourly ? hourly.precipitation_probability[curIdx]             : 0;
  const wcode      = hourly ? hourly.weathercode[curIdx]                           : 0;

  const todayHi      = daily ? Math.round(daily.temperature_2m_max[0])  : null;
  const todayLo      = daily ? Math.round(daily.temperature_2m_min[0])  : null;
  const todaySunrise = daily ? daily.sunrise[0]                          : null;
  const todaySunset  = daily ? daily.sunset[0]                           : null;

  // Activity scores
  const actArgs: [number, number, number, number] = [
    weather.temp, wind ?? 0, precipProb, uvNow
  ];
  const runScore   = activityScore("running",  ...actArgs);
  const cycleScore = activityScore("cycling",  ...actArgs);
  const walkScore  = activityScore("walking",  ...actArgs);

  // Sunrise progress (0–1)
  const sunProgress = (() => {
    if (!todaySunrise || !todaySunset) return 0.5;
    const now  = Date.now();
    const rise = new Date(todaySunrise).getTime();
    const set  = new Date(todaySunset).getTime();
    if (now < rise) return 0;
    if (now > set)  return 1;
    return (now - rise) / (set - rise);
  })();

  const moon = moonPhase(new Date());

  // Hourly strip: next 24 hours
  const hourlyStrip = hourly
    ? Array.from({ length: 24 }, (_, i) => curIdx + i).filter(i => i < hourly.time.length)
    : [];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        <div>
          <h2 className="text-white font-bold text-xl leading-tight">
            {weather.city}, {weather.country}
          </h2>
          <p className="text-white/40 text-xs capitalize">{weather.description}</p>
        </div>
        <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-all">
          <FiX size={20} />
        </button>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 px-4 pb-3 flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === t.id
                ? "bg-white/20 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">

        {loading && (
          <div className="flex items-center justify-center h-40">
            <span className="text-white/40 text-sm animate-pulse">Loading weather data…</span>
          </div>
        )}

        {/* ════════════════════ TODAY TAB ════════════════════ */}
        {!loading && tab === "today" && (
          <div className="flex flex-col gap-4">

            {/* Hero card */}
            <div className="glass-card p-5 text-center">
              <div className="text-6xl mb-2">{wmoEmoji(wcode)}</div>
              <div className="text-white text-6xl font-thin mb-1">{weather.temp}°</div>
              <div className="text-white/60 text-sm">{wmoLabel(wcode)}</div>
              <div className="text-white/40 text-xs mt-1 space-x-2">
                {feelsLike !== null && <span>Feels like {feelsLike}°</span>}
                {todayHi !== null && todayLo !== null && (
                  <span>H:{todayHi}° L:{todayLo}°</span>
                )}
              </div>
            </div>

            {/* Hourly strip */}
            {hourly && (
              <div className="glass-card p-3">
                <p className="text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">Hourly</p>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {hourlyStrip.map((hi, i) => (
                    <div key={i} className="flex flex-col items-center flex-shrink-0 gap-1 px-1">
                      <span className="text-white/50 text-xs">{i === 0 ? "Now" : fmtHour(hourly.time[hi])}</span>
                      <span className="text-xl leading-none">{wmoEmoji(hourly.weathercode[hi])}</span>
                      <span className="text-white text-sm font-semibold">{Math.round(hourly.temperature_2m[hi])}°</span>
                      <span className={`text-xs ${hourly.precipitation_probability[hi] > 10 ? "text-blue-400" : "text-transparent"}`}>
                        {hourly.precipitation_probability[hi]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-3">
                <p className="text-white/40 text-xs mb-1">Humidity</p>
                <p className="text-white font-bold text-2xl">{humidity}%</p>
                {dewPoint !== null && <p className="text-white/40 text-xs">Dew point {dewPoint}°</p>}
              </div>
              <div className="glass-card p-3">
                <p className="text-white/40 text-xs mb-1">Wind</p>
                <p className="text-white font-bold text-2xl">
                  {wind ?? "—"}<span className="text-sm font-normal"> km/h</span>
                </p>
                {wind !== null && (
                  <p className="text-white/40 text-xs">
                    {wind < 20 ? "Calm" : wind < 40 ? "Breezy" : wind < 60 ? "Windy" : "Strong winds"}
                  </p>
                )}
              </div>
              <div className="glass-card p-3">
                <p className="text-white/40 text-xs mb-1">UV Index</p>
                <p className="text-white font-bold text-2xl">{uvNow}</p>
                <p className="text-white/40 text-xs">{uvLabel(uvNow)}</p>
              </div>
              <div className="glass-card p-3">
                <p className="text-white/40 text-xs mb-1">Air Quality</p>
                {aqi !== null ? (
                  <>
                    <p className="font-bold text-2xl" style={{ color: aqiInfo(aqi).color }}>{aqi}</p>
                    <p className="text-white/40 text-xs">{aqiInfo(aqi).label}</p>
                  </>
                ) : (
                  <p className="text-white/30 text-sm mt-1">Unavailable</p>
                )}
              </div>
            </div>

            {/* Activity scores */}
            <div className="glass-card p-4">
              <p className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider">Activity Conditions</p>
              {([ ["🏃 Running", runScore], ["🚴 Cycling", cycleScore], ["🚶 Walking", walkScore] ] as [string, number][]).map(
                ([label, score]) => (
                  <div key={label} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/70 text-sm">{label}</span>
                      <span className="text-white text-sm font-semibold">{score}/100</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${score}%`, background: scoreColor(score) }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Sunrise / Sunset arc */}
            {todaySunrise && todaySunset && (
              <div className="glass-card p-4">
                <p className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider">Sun</p>
                <div className="relative h-14 mb-2">
                  <svg viewBox="0 0 200 55" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M 10,50 Q 100,5 190,50" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeLinecap="round" />
                    <path
                      d="M 10,50 Q 100,5 190,50"
                      fill="none"
                      stroke="rgba(251,191,36,0.7)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${sunProgress * 220} 220`}
                    />
                    {(() => {
                      const t = sunProgress;
                      const x = 10 + 180 * t;
                      const y = 50 + (5 - 50) * 4 * t * (1 - t);
                      return <circle cx={x} cy={y} r="6" fill="#fbbf24" />;
                    })()}
                  </svg>
                </div>
                <div className="flex justify-between text-xs">
                  <div className="text-center">
                    <p className="text-yellow-300/70">Sunrise</p>
                    <p className="text-white font-semibold">{fmtTime(todaySunrise)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/30">Day length</p>
                    <p className="text-white/60 font-semibold">{dayLength(todaySunrise, todaySunset)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-orange-300/70">Sunset</p>
                    <p className="text-white font-semibold">{fmtTime(todaySunset)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════ 7-DAY TAB ════════════════════ */}
        {!loading && tab === "forecast" && daily && (
          <div className="flex flex-col gap-2">
            {(() => {
              const maxAll = Math.max(...daily.temperature_2m_max);
              const minAll = Math.min(...daily.temperature_2m_min);
              const span   = maxAll - minAll || 1;
              return daily.time.map((day, i) => {
                const barLeft  = ((daily.temperature_2m_min[i] - minAll) / span) * 100;
                const barWidth = Math.max(8, ((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) / span) * 100);
                return (
                  <div key={day} className="glass-card px-4 py-3 flex items-center gap-3">
                    <span className="text-white/60 text-sm w-16 flex-shrink-0">{fmtDay(day)}</span>
                    <span className="text-xl flex-shrink-0">{wmoEmoji(daily.weathercode[i])}</span>
                    <span className={`text-xs w-8 flex-shrink-0 ${daily.precipitation_probability_max[i] > 10 ? "text-blue-400" : "text-transparent"}`}>
                      {daily.precipitation_probability_max[i]}%
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-white/40 text-xs w-7 text-right">{Math.round(daily.temperature_2m_min[i])}°</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full relative">
                        <div
                          className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
                          style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-white text-xs w-7">{Math.round(daily.temperature_2m_max[i])}°</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ════════════════════ DETAILS TAB ════════════════════ */}
        {!loading && tab === "details" && hourly && (
          <div className="flex flex-col gap-4">

            {/* Pressure */}
            <div className="glass-card p-4">
              <p className="text-white/40 text-xs font-semibold mb-1 uppercase tracking-wider">Pressure</p>
              <p className="text-white text-3xl font-bold">
                {pressure} <span className="text-sm font-normal text-white/50">hPa</span>
              </p>
              <p className="text-white/40 text-xs mt-1">
                {pressure !== null
                  ? pressure > 1013
                    ? "High pressure — fair weather likely"
                    : pressure < 1000
                      ? "Low pressure — unsettled conditions"
                      : "Near average pressure"
                  : ""}
              </p>
            </div>

            {/* Dew point */}
            <div className="glass-card p-4">
              <p className="text-white/40 text-xs font-semibold mb-1 uppercase tracking-wider">Dew Point</p>
              <p className="text-white text-3xl font-bold">{dewPoint}°C</p>
              <p className="text-white/40 text-xs mt-1">
                {dewPoint !== null
                  ? dewPoint < 10 ? "Dry and comfortable"
                  : dewPoint < 16 ? "Comfortable"
                  : dewPoint < 21 ? "Slightly humid"
                  : "Humid and muggy"
                  : ""}
              </p>
            </div>

            {/* 12-hour temperature bar chart */}
            <div className="glass-card p-4">
              <p className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider">Temperature — Next 12 Hours</p>
              {(() => {
                const indices = Array.from({ length: 12 }, (_, i) => curIdx + i).filter(i => i < hourly.temperature_2m.length);
                const temps   = indices.map(i => hourly.temperature_2m[i]);
                const tMin    = Math.min(...temps);
                const tMax    = Math.max(...temps);
                const tSpan   = tMax - tMin || 1;
                return (
                  <div className="flex items-end gap-1 h-20">
                    {indices.map((hi, i) => {
                      const h = Math.max(8, ((hourly.temperature_2m[hi] - tMin) / tSpan) * 56 + 8);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <span className="text-white/60 text-xs leading-none">{Math.round(hourly.temperature_2m[hi])}°</span>
                          <div className="w-full rounded-t bg-blue-400/60" style={{ height: `${h}px` }} />
                          <span className="text-white/30 text-xs">{i === 0 ? "Now" : `${new Date(hourly.time[hi] + ":00").getHours()}h`}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* 12-hour precipitation chart */}
            <div className="glass-card p-4">
              <p className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider">Precipitation Chance — Next 12 Hours</p>
              {(() => {
                const indices = Array.from({ length: 12 }, (_, i) => curIdx + i).filter(i => i < hourly.time.length);
                return (
                  <div className="flex items-end gap-1 h-20">
                    {indices.map((hi, i) => {
                      const pct = hourly.precipitation_probability[hi];
                      const h   = Math.max(2, (pct / 100) * 60 + 2);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <span className={`text-xs leading-none ${pct > 20 ? "text-blue-400" : "text-transparent"}`}>{pct}%</span>
                          <div
                            className="w-full rounded-t"
                            style={{ height: `${h}px`, background: pct > 50 ? "rgba(59,130,246,0.8)" : "rgba(59,130,246,0.35)" }}
                          />
                          <span className="text-white/30 text-xs">{i === 0 ? "Now" : `${new Date(hourly.time[hi] + ":00").getHours()}h`}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Humidity */}
            <div className="glass-card p-4">
              <p className="text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">Humidity</p>
              <p className="text-white text-3xl font-bold">{humidity}%</p>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-400/60 transition-all" style={{ width: `${humidity}%` }} />
              </div>
              <p className="text-white/40 text-xs mt-1">
                {humidity < 30 ? "Very dry" : humidity < 50 ? "Comfortable" : humidity < 70 ? "Moderately humid" : "Very humid"}
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════ SKY TAB ════════════════════ */}
        {!loading && tab === "sky" && (
          <div className="flex flex-col gap-4">

            {/* Moon phase */}
            <div className="glass-card p-5 text-center">
              <p className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider">Moon Phase</p>
              <div className="text-7xl mb-2 leading-none">{moon.emoji}</div>
              <p className="text-white font-bold text-xl">{moon.name}</p>
              <p className="text-white/40 text-sm mt-0.5">{moon.illumination}% illuminated</p>
            </div>

            {/* Today's sunrise/sunset */}
            {todaySunrise && todaySunset && (
              <div className="glass-card p-4">
                <p className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider">Today's Sun</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl leading-none mb-1">🌅</p>
                    <p className="text-white/40 text-xs">Sunrise</p>
                    <p className="text-white font-bold">{fmtTime(todaySunrise)}</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl leading-none mb-1">🌇</p>
                    <p className="text-white/40 text-xs">Sunset</p>
                    <p className="text-white font-bold">{fmtTime(todaySunset)}</p>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <p className="text-white/30 text-xs">Day length</p>
                  <p className="text-white/70 font-semibold text-sm">{dayLength(todaySunrise, todaySunset)}</p>
                </div>
              </div>
            )}

            {/* UV Index */}
            {daily && (
              <div className="glass-card p-4">
                <p className="text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">UV Index Today</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-white font-bold text-3xl">{Math.round(daily.uv_index_max[0])}</span>
                  <span className="text-white/50 text-sm pb-1">{uvLabel(daily.uv_index_max[0])}</span>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden"
                  style={{ background: "linear-gradient(to right,#22c55e,#eab308,#f97316,#ef4444,#a855f7)" }}>
                  <div
                    className="absolute top-0 w-2 h-2 rounded-full bg-white shadow"
                    style={{ left: `${Math.min(daily.uv_index_max[0] / 11, 1) * 92}%` }}
                  />
                </div>
                <div className="flex justify-between text-white/30 text-xs mt-1">
                  <span>Low</span><span>Moderate</span><span>High</span><span>Extreme</span>
                </div>
              </div>
            )}

            {/* 7-day sunrise/sunset table */}
            {daily && (
              <div className="glass-card p-4">
                <p className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider">7-Day Sunrise &amp; Sunset</p>
                <div className="flex flex-col gap-2">
                  {daily.time.map((day, i) => (
                    <div key={day} className="flex items-center justify-between text-xs">
                      <span className="text-white/50 w-16 flex-shrink-0">{fmtDay(day)}</span>
                      <span className="text-yellow-300/80">🌅 {fmtTime(daily.sunrise[i])}</span>
                      <span className="text-orange-300/80">🌇 {fmtTime(daily.sunset[i])}</span>
                      <span className="text-white/30">{dayLength(daily.sunrise[i], daily.sunset[i])}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
