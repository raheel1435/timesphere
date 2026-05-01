import { useState } from "react";
import { FiX, FiSearch, FiCheck } from "react-icons/fi";
import { MdInstallMobile, MdCheckCircle, MdPhoneIphone } from "react-icons/md";
import { ALL_TIMEZONES } from "../utils/timezones";
import type { UserProfile } from "../types";

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInstalled = window.matchMedia("(display-mode: standalone)").matches
  || ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

interface SettingsUpdate {
  homeTimezone?:      string;
  units?:             "metric" | "imperial";
  showWeatherWidget?: boolean;
  autoRefresh?:       boolean;
}

interface Props {
  profile:            UserProfile | null;
  units:              "metric" | "imperial";
  showWeatherWidget:  boolean;
  autoRefresh:        boolean;
  onClose:            () => void;
  onSave:             (updates: SettingsUpdate) => void;
  canInstall:         boolean;
  onInstall:          () => void;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? "bg-blue-500" : "bg-white/20"}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function Settings({ profile, units, showWeatherWidget, autoRefresh, onClose, onSave, canInstall, onInstall }: Props) {
  const [tzSearch,          setTzSearch]          = useState("");
  const [pendingTz,         setPendingTz]         = useState(profile?.homeTimezone ?? "Europe/Stockholm");
  const [pendingUnits,      setPendingUnits]       = useState<"metric" | "imperial">(units);
  const [pendingWeather,    setPendingWeather]     = useState(showWeatherWidget);
  const [pendingRefresh,    setPendingRefresh]     = useState(autoRefresh);

  const filtered = ALL_TIMEZONES.filter(tz =>
    tz.label.toLowerCase().includes(tzSearch.toLowerCase())
  );

  function handleSave() {
    onSave({
      homeTimezone:      pendingTz,
      units:             pendingUnits,
      showWeatherWidget: pendingWeather,
      autoRefresh:       pendingRefresh,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-4 px-4">
      <div className="glass-card w-full max-w-md p-5 fade-in-up my-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">⚙️ Settings</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-all">
            <FiX size={18} />
          </button>
        </div>

        {/* ── Home Timezone ── */}
        <section className="mb-5">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
            Home Timezone
          </h3>
          <p className="text-white/40 text-xs mb-3">
            Shown alongside local time when you're abroad.
          </p>
          <div className="relative mb-2">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search city or country…"
              value={tzSearch}
              onChange={e => setTzSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl text-sm focus:outline-none focus:border-white/50"
            />
          </div>
          <div className="overflow-y-auto rounded-xl border border-white/10" style={{ maxHeight: 160 }}>
            {filtered.map(tz => (
              <button
                key={tz.tz}
                onClick={() => setPendingTz(tz.tz)}
                className={`w-full text-left px-3 py-2 text-sm transition-all flex items-center justify-between
                  ${pendingTz === tz.tz ? "bg-blue-500/30 text-white font-semibold" : "text-white/70 hover:bg-white/10"}`}
              >
                <span>{tz.label}</span>
                {pendingTz === tz.tz && <FiCheck size={13} />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-white/40 text-xs text-center py-4">No timezone found</p>
            )}
          </div>
        </section>

        <div className="h-px bg-white/10 mb-5" />

        {/* ── Display & Units ── */}
        <section className="mb-5">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
            Display &amp; Units
          </h3>

          {/* Temperature units */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm font-medium">Temperature Unit</p>
              <p className="text-white/40 text-xs">How temperatures are displayed</p>
            </div>
            <div className="flex bg-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setPendingUnits("metric")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${pendingUnits === "metric" ? "bg-white/25 text-white" : "text-white/40"}`}
              >
                °C
              </button>
              <button
                onClick={() => setPendingUnits("imperial")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${pendingUnits === "imperial" ? "bg-white/25 text-white" : "text-white/40"}`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Show weather widget */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm font-medium">Weather Widget</p>
              <p className="text-white/40 text-xs">Show weather in the top bar</p>
            </div>
            <Toggle value={pendingWeather} onChange={setPendingWeather} />
          </div>

          {/* Auto-refresh */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Auto-Refresh Weather</p>
              <p className="text-white/40 text-xs">Update every 10 minutes</p>
            </div>
            <Toggle value={pendingRefresh} onChange={setPendingRefresh} />
          </div>
        </section>

        <div className="h-px bg-white/10 mb-5" />

        {/* ── Location & Privacy ── */}
        <section className="mb-5">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
            Location &amp; Privacy
          </h3>
          <div className="flex flex-col gap-2 text-xs text-white/40">
            <p>📍 Location is accessed via your device's GPS / browser. No location data is sent to our servers.</p>
            <p>🌦 Weather data is fetched from OpenWeatherMap and Open-Meteo using your coordinates.</p>
            <p>🔒 Reminders and preferences are stored locally on your device.</p>
          </div>
        </section>

        <div className="h-px bg-white/10 mb-5" />

        {/* ── About ── */}
        <section className="mb-5">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
            About
          </h3>
          <div className="flex flex-col gap-1 text-xs text-white/50">
            <p className="text-white/70 font-semibold">TimeSphere v1.0</p>
            <p>Weather: OpenWeatherMap · Open-Meteo</p>
            <p>Holidays: Nager.Date</p>
            <p>Space photos: NASA APOD</p>
            <p>Background photos: Unsplash</p>
          </div>
        </section>

        <div className="h-px bg-white/10 mb-5" />

        {/* ── Install App ── */}
        <section className="mb-5">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
            Install App
          </h3>

          {isInstalled ? (
            <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3">
              <MdCheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-white text-sm font-semibold">TimeSphere is installed</p>
                <p className="text-white/45 text-xs mt-0.5">Running as a standalone app on your device</p>
              </div>
            </div>
          ) : isIOS ? (
            <div className="flex flex-col gap-3">
              <p className="text-white/50 text-xs">Add TimeSphere to your iPhone / iPad home screen:</p>
              <ol className="flex flex-col gap-2">
                {[
                  "Open this page in Safari (not Chrome)",
                  "Tap the Share button (box with arrow ↑) at the bottom",
                  "Tap \"Add to Home Screen\"",
                  "Tap Add — done!",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                    <span className="bg-white/15 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-bold text-white text-[10px] mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-2 mt-1 bg-white/5 rounded-xl px-3 py-2">
                <MdPhoneIphone className="text-white/40" size={16} />
                <p className="text-white/35 text-xs">Opens full-screen with no browser bar</p>
              </div>
            </div>
          ) : canInstall ? (
            <div className="flex flex-col gap-3">
              <p className="text-white/50 text-xs">Install TimeSphere as a standalone app on your device — works offline too.</p>
              <button
                onClick={onInstall}
                className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500/80 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl transition-all"
              >
                <MdInstallMobile size={18} />
                Install TimeSphere
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-xs text-white/40">
              <p>To install TimeSphere as an app:</p>
              <p>• <strong className="text-white/60">Android:</strong> Chrome menu (⋮) → Add to Home screen</p>
              <p>• <strong className="text-white/60">iPhone:</strong> Safari Share (↑) → Add to Home Screen</p>
              <p>• <strong className="text-white/60">Desktop:</strong> Click the install icon in your browser's address bar</p>
            </div>
          )}
        </section>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-500/80 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
