// ─────────────────────────────────────────────────────────────────────────────
// src/types.ts
//
// TypeScript "types" describe the SHAPE of data in our app.
// Instead of guessing what fields an object has, TypeScript will warn you
// instantly if you try to use a field that doesn't exist.
//
// Think of types like a contract: "this object MUST have these fields."
// ─────────────────────────────────────────────────────────────────────────────

// ─── Weather data returned from OpenWeatherMap API ───────────────────────────
export interface WeatherData {
  city:        string;   // city name, e.g. "Stockholm"
  country:     string;   // 2-letter country code, e.g. "SE"
  condition:   string;   // main weather condition, e.g. "Clear", "Rain", "Clouds", "Snow"
  description: string;   // more detail, e.g. "light rain", "broken clouds"
  icon:        string;   // OpenWeatherMap icon code, e.g. "01d" (used to build icon URL)
  temp:        number;   // current temperature in Celsius
  humidity:    number;   // humidity percentage, e.g. 72
  sunrise:     number;   // Unix timestamp (seconds since 1970) for today's sunrise
  sunset:      number;   // Unix timestamp (seconds since 1970) for today's sunset
  lat:         number;   // latitude of the detected location
  lon:         number;   // longitude of the detected location
}

// ─── User's geographic position ──────────────────────────────────────────────
export interface GeoPosition {
  lat:     number;  // latitude  (positive = north, negative = south)
  lon:     number;  // longitude (positive = east,  negative = west)
  loading: boolean; // true while waiting for the browser to give us the position
  error:   string | null; // error message if the user denied location access
}

// ─── Clock state ──────────────────────────────────────────────────────────────
export interface ClockState {
  time:      Date;    // the Date object representing the currently displayed time
  isPlaying: boolean; // true = clock is ticking, false = clock is paused (edit mode)
  isEditing: boolean; // true = edit panel is open
}

// ─── A language/country option shown in the language selector box ─────────────
export interface LanguageOption {
  code:     string; // BCP-47 language code for Web Speech API, e.g. "sv-SE", "ar-SA"
  country:  string; // country name shown in the dropdown, e.g. "Sweden"
  language: string; // language name shown, e.g. "Swedish"
  flag:     string; // emoji flag, e.g. "🇸🇪"
  tz:       string; // IANA timezone for this country's main city, e.g. "Europe/Stockholm"
}

// ─── Firebase user profile (stored in Firestore under /users/{uid}) ──────────
export interface UserProfile {
  uid:         string;       // unique user ID from Firebase Auth
  displayName: string | null;// user's name (from Google login) or null
  phone:       string | null;// phone number if they used phone login
  homeTimezone:string;       // IANA timezone of their home, e.g. "Europe/Stockholm"
  homeCountry: string;       // 2-letter code of home country, e.g. "SE"
  theme:       AppTheme;     // chosen visual theme
  createdAt:   number;       // Unix timestamp when account was created
}

// ─── Visual theme options ─────────────────────────────────────────────────────
export type AppTheme = "auto" | "dark" | "space" | "custom";
// "auto"   = matches the real sky at the user's location (default)
// "dark"   = always dark
// "light"  = always light
// "nature" = green/forest tones
// "space"  = deep space / purple tones

// ─── Sky condition used to paint the clock background ────────────────────────
export type SkyCondition =
  | "night"       // after sunset until about 1 hour before sunrise
  | "dawn"        // ~1 hour before sunrise
  | "sunrise"     // the sunrise moment (±30 min)
  | "morning"     // after sunrise until ~10:00
  | "day"         // mid-day
  | "afternoon"   // after 14:00 until ~1 hour before sunset
  | "sunset"      // the sunset moment (±30 min)
  | "dusk"        // ~1 hour after sunset
  | "moonrise";   // night but moon is visible

// ─── What the clock background canvas should render ───────────────────────────
export interface ClockBackground {
  skyCondition:  SkyCondition; // which part of the day/night cycle we're in
  weatherEffect: string;       // "clear" | "cloudy" | "rain" | "snow" | "fog" | "storm"
  moonPhase:     number;       // 0=new moon, 0.5=full moon, 1=new moon again
  showSun:       boolean;      // whether to draw a sun icon on the clock face
  showMoon:      boolean;      // whether to draw a moon icon on the clock face
}

// ─── Props for a time zone entry in the full timezone list ────────────────────
export interface TimezoneEntry {
  tz:      string; // IANA timezone string, e.g. "America/New_York"
  label:   string; // human-readable label, e.g. "New York (UTC-5)"
  country: string; // country code, e.g. "US"
  offset:  number; // UTC offset in minutes (can be negative)
}
