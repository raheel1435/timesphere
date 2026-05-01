import { useState, useEffect, useRef, useCallback } from "react";

import { useGeolocation }  from "./hooks/useGeolocation";
import { useWeather }      from "./hooks/useWeather";
import { useClock }        from "./hooks/useClock";
import { useAuth }         from "./hooks/useAuth";

import AnalogClock       from "./components/AnalogClock";
import DigitalClock      from "./components/DigitalClock";
import WeatherWidget     from "./components/WeatherWidget";
import WeatherApp        from "./components/WeatherApp";
import LanguageBox       from "./components/LanguageBox";
import HamburgerMenu     from "./components/HamburgerMenu";
import AuthModal         from "./components/AuthModal";
import Settings          from "./components/Settings";
import TimeDiffCalc      from "./components/TimeDiffCalc";
import Calendar          from "./components/Calendar";
import BackgroundPicker  from "./components/BackgroundPicker";

import { getSkyCondition }                        from "./utils/timeUtils";
import { fallbackGradient, imageQuery, unsplashUrl, fetchUnsplashPhotos, fetchNasaImages, loadCustomImages } from "./utils/backgroundImages";
import { useInstallPrompt }                       from "./hooks/useInstallPrompt";
import InstallPrompt                              from "./components/InstallPrompt";
import type { AppTheme } from "./types";

const BG_INTERVAL = 60_000;

// Persistent app preferences (not synced to cloud)
function readPref<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) as T : fallback; }
  catch { return fallback; }
}

export default function App() {

  const geo = useGeolocation();
  const { data: weather, loading: wxLoading } = useWeather(geo.lat, geo.lon);

  const [localTz] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [homeTz,   setHomeTz]   = useState("Europe/Stockholm");
  const [appTheme, setAppTheme] = useState<AppTheme>("auto");

  // ── App preferences ────────────────────────────────────────────────────────
  const [units,             setUnits]            = useState<"metric" | "imperial">(() => readPref("ts_units", "metric"));
  const [showWeatherWidget, setShowWeatherWidget] = useState<boolean>(() => readPref("ts_show_weather", true));
  const [autoRefresh,       setAutoRefresh]       = useState<boolean>(() => readPref("ts_auto_refresh", true));

  const { time, isPlaying, isEditing, play, openEdit, setManualTime, reset } = useClock(localTz);

  const { user, profile, authError, loginWithGoogle, sendSmsCode, verifySmsCode, logout, updateProfile } = useAuth();

  const { canInstall, install } = useInstallPrompt();

  useEffect(() => {
    if (profile?.homeTimezone) setHomeTz(profile.homeTimezone);
    if (profile?.theme)        setAppTheme(profile.theme);
  }, [profile]);

  // ── Modal flags ────────────────────────────────────────────────────────────
  const [showAuth,      setShowAuth]      = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [showTimeDiff,  setShowTimeDiff]  = useState(false);
  const [showWeather,   setShowWeather]   = useState(false);
  const [showCalendar,  setShowCalendar]  = useState(false);
  const [showBgPicker,  setShowBgPicker]  = useState(false);

  function handleSaveSettings(updates: {
    homeTimezone?:      string;
    units?:             "metric" | "imperial";
    showWeatherWidget?: boolean;
    autoRefresh?:       boolean;
  }) {
    if (updates.homeTimezone) {
      setHomeTz(updates.homeTimezone);
      if (user) updateProfile({ homeTimezone: updates.homeTimezone });
    }
    if (updates.units !== undefined) {
      setUnits(updates.units);
      localStorage.setItem("ts_units", JSON.stringify(updates.units));
    }
    if (updates.showWeatherWidget !== undefined) {
      setShowWeatherWidget(updates.showWeatherWidget);
      localStorage.setItem("ts_show_weather", JSON.stringify(updates.showWeatherWidget));
    }
    if (updates.autoRefresh !== undefined) {
      setAutoRefresh(updates.autoRefresh);
      localStorage.setItem("ts_auto_refresh", JSON.stringify(updates.autoRefresh));
    }
  }

  // ── Sky condition ──────────────────────────────────────────────────────────
  const sky = weather
    ? getSkyCondition(time.getTime(), weather.sunrise * 1000, weather.sunset * 1000)
    : "day";

  // ── Background image cycling ───────────────────────────────────────────────
  const [bgA,           setBgA]          = useState("");
  const [bgB,           setBgB]          = useState("");
  const [showB,         setShowB]        = useState(false);
  const [nasaImages,    setNasaImages]   = useState<string[]>([]);
  const [unsplashPool,  setUnsplashPool] = useState<string[]>([]);
  const cycleRef  = useRef(0);
  const layerRef  = useRef<"A" | "B">("A");

  useEffect(() => {
    fetchNasaImages().then(imgs => setNasaImages(imgs));
  }, []);

  // Pre-fetch a batch of Unsplash API photos when conditions change
  useEffect(() => {
    if (appTheme === "custom" || appTheme === "space") return;
    const query = imageQuery(appTheme, sky, weather?.condition ?? "Clear", 0);
    const orientation = window.innerHeight > window.innerWidth ? "portrait" : "landscape";
    fetchUnsplashPhotos(query, 8, orientation).then(urls => { if (urls.length > 0) setUnsplashPool(urls); });
  }, [appTheme, sky, weather?.condition]);

  const buildBgUrl = useCallback((index: number): string => {
    if (appTheme === "custom") {
      const customs = loadCustomImages();
      if (customs.length > 0) return customs[index % customs.length];
      return "";
    }
    if (appTheme === "space" && nasaImages.length > 0) {
      return nasaImages[index % nasaImages.length];
    }
    // Use API pool when available; fall back to source.unsplash while loading
    if (unsplashPool.length > 0) {
      return unsplashPool[index % unsplashPool.length];
    }
    const query = imageQuery(appTheme, sky, weather?.condition ?? "Clear", index);
    return unsplashUrl(query, index);
  }, [appTheme, sky, weather?.condition, nasaImages, unsplashPool]);

  useEffect(() => {
    cycleRef.current = Math.floor(Date.now() / 1000);
    setBgA(buildBgUrl(cycleRef.current));
    setShowB(false);
  }, [appTheme, buildBgUrl]);

  useEffect(() => {
    const timer = setInterval(() => {
      cycleRef.current += 1;
      const nextUrl = buildBgUrl(cycleRef.current);
      const img = new Image();
      img.onload = () => {
        if (layerRef.current === "A") {
          setBgB(nextUrl);
          setShowB(true);
          setTimeout(() => { setBgA(nextUrl); setShowB(false); layerRef.current = "B"; }, 2000);
        } else {
          setBgA(nextUrl);
          setShowB(false);
          layerRef.current = "A";
        }
      };
      img.onerror = () => setBgA(nextUrl);
      img.src = nextUrl;
    }, BG_INTERVAL);
    return () => clearInterval(timer);
  }, [buildBgUrl]);

  const fallback = fallbackGradient(appTheme);

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center relative overflow-x-hidden overflow-y-auto"
      style={{ background: fallback }}
    >
      {/* ── Background layers (fixed = always fills true viewport on all screen sizes) ── */}
      {bgA && (
        <div className="bg-layer bg-layer-fade" style={{ backgroundImage: `url(${bgA})`, opacity: showB ? 0 : 1 }} />
      )}
      {bgB && (
        <div className="bg-layer bg-layer-fade" style={{ backgroundImage: `url(${bgB})`, opacity: showB ? 1 : 0 }} />
      )}

      {/* Dark overlay for legibility */}
      <div className="fixed inset-0 bg-black/30 pointer-events-none z-[1]" />

      {/* Dot texture at night */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          opacity: sky === "night" || sky === "dawn" ? 0.12 : 0.03,
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "35px 35px"
        }}
      />

      {/* ── TOP BAR — z-[50] ensures the menu drawer always renders above all content ── */}
      <div className="relative z-[50] w-full max-w-sm sm:max-w-md flex items-start justify-between px-4 pt-5 flex-shrink-0">
        <HamburgerMenu
          user={user}
          profile={null}
          onOpenAuth={()       => setShowAuth(true)}
          onOpenSettings={()   => setShowSettings(true)}
          onOpenCalendar={()   => setShowCalendar(true)}
          onOpenTimeDiff={()   => setShowTimeDiff(true)}
          onOpenWeather={()    => setShowWeather(true)}
          onOpenBackground={() => setShowBgPicker(true)}
          onLogout={logout}
          canInstall={canInstall}
          onInstall={install}
        />
        {showWeatherWidget && (
          <WeatherWidget
            weather={weather}
            loading={wxLoading || geo.loading}
            units={units}
            onClick={() => weather && setShowWeather(true)}
          />
        )}
      </div>

      {/* ── DATE ── */}
      <div className="relative z-10 mt-2 text-center flex-shrink-0">
        <p className="text-white/60 text-xs tracking-widest font-medium drop-shadow">
          {time.toLocaleDateString("en-GB", {
            timeZone: localTz,
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          })}
        </p>
      </div>

      {/* ── ANALOG CLOCK — pushed slightly further down ── */}
      <div className="relative z-10 mt-8 sm:mt-10 flex-shrink-0">
        <AnalogClock time={time} timezone={localTz} />
      </div>

      {/* ── DIGITAL CLOCK ── */}
      <div className="relative z-10 mt-3 w-full max-w-sm sm:max-w-md px-4 flex-shrink-0">
        <DigitalClock
          time={time} isPlaying={isPlaying} isEditing={isEditing}
          timezone={localTz} homeTimezone={homeTz}
          onEdit={openEdit} onPlay={play} onReset={reset} onSetTime={setManualTime}
        />
      </div>

      {/* ── FLEX SPACER — pushes LanguageBox to the bottom ── */}
      <div className="flex-1 min-h-8" />

      {/* ── LANGUAGE BOX — pinned to bottom ── */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md px-4 pb-5 flex-shrink-0">
        <LanguageBox time={time} timezone={localTz} />
      </div>

      {/* ── MODALS ── */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onGoogle={loginWithGoogle}
          sendSmsCode={sendSmsCode}
          verifySmsCode={verifySmsCode}
          authError={authError}
        />
      )}
      {showSettings && (
        <Settings
          profile={profile}
          units={units}
          showWeatherWidget={showWeatherWidget}
          autoRefresh={autoRefresh}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          canInstall={canInstall}
          onInstall={install}
        />
      )}
      {showTimeDiff && (
        <TimeDiffCalc onClose={() => setShowTimeDiff(false)} />
      )}
      {showWeather && weather && (
        <WeatherApp weather={weather} lat={geo.lat} lon={geo.lon} onClose={() => setShowWeather(false)} />
      )}
      {showCalendar && (
        <Calendar
          onClose={() => setShowCalendar(false)}
          countryCode={weather?.country ?? "SE"}
        />
      )}
      {showBgPicker && (
        <BackgroundPicker
          currentTheme={appTheme}
          onSelect={theme => { setAppTheme(theme); if (user) updateProfile({ theme }); }}
          onClose={() => setShowBgPicker(false)}
        />
      )}

      {/* ── Install prompt — floats above content, self-manages visibility ── */}
      <InstallPrompt canInstall={canInstall} onInstall={install} />
    </div>
  );
}
