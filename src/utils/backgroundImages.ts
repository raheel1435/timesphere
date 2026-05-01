// Background image source logic.
// Primary source: Unsplash API (weather-matched photos).
// Space theme: NASA APOD. Custom: user uploads from localStorage.

import type { AppTheme } from "../types";

const UNSPLASH_KEY = "HnV0LkZ57RCEy_06XQs3ry1fSTzBoLLPTilFNIwcOhA";
const UNSPLASH_API = "https://api.unsplash.com";

// In-memory cache — avoids redundant API calls within the same session
const _cache = new Map<string, string[]>();

// Fetch full-res photo URLs from Unsplash API (weather-matched)
export async function fetchUnsplashPhotos(query: string, count = 8, orientation = "landscape"): Promise<string[]> {
  const cacheKey = `${query}:${orientation}`;
  if (_cache.has(cacheKey)) return _cache.get(cacheKey)!;
  try {
    const url = `${UNSPLASH_API}/photos/random`
      + `?query=${encodeURIComponent(query)}`
      + `&orientation=${orientation}&count=${count}`
      + `&client_id=${UNSPLASH_KEY}`;
    const res  = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json() as Array<{ urls: { regular: string } }>;
    const urls = data.map(p => p.urls.regular);
    _cache.set(cacheKey, urls);
    return urls;
  } catch {
    return [];
  }
}

// Fetch a single small preview photo for UI thumbnails
export async function fetchUnsplashThumb(query: string): Promise<string> {
  const key = `thumb:${query}`;
  if (_cache.has(key)) return _cache.get(key)![0] ?? "";
  try {
    const url = `${UNSPLASH_API}/photos/random`
      + `?query=${encodeURIComponent(query)}`
      + `&orientation=landscape&count=1`
      + `&client_id=${UNSPLASH_KEY}`;
    const res  = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json() as Array<{ urls: { small: string } }>;
    const thumb = data[0]?.urls.small ?? "";
    _cache.set(key, [thumb]);
    return thumb;
  } catch {
    return "";
  }
}

// Instant fallback URL while API loads (source.unsplash redirect, no key needed)
export function unsplashUrl(query: string, sig: number): string {
  const w = window.screen.width;
  const h = window.screen.height;
  return `https://source.unsplash.com/featured/${w}x${h}/?${encodeURIComponent(query)}&sig=${sig}`;
}

// ── Weather/sky → query strings ──────────────────────────────────────────────

const QUERIES = {
  space: [
    "galaxy nebula cosmos",
    "milky way stars universe",
    "aurora borealis northern lights",
    "hubble deep space stars",
    "planet stars astronomy",
    "night sky stars cosmos",
    "colorful nebula space",
    "solar system planets",
  ],
  skyMap: {
    night:     "night sky stars milky way",
    dawn:      "dawn early morning sky horizon",
    sunrise:   "sunrise golden hour sky",
    morning:   "morning blue sky sunshine",
    day:       "blue sky sunny clouds",
    afternoon: "afternoon sunny sky nature",
    sunset:    "sunset golden orange sky",
    dusk:      "dusk twilight purple sky",
    moonrise:  "moonrise night sky moon",
  } as Record<string, string>,
  weatherMap: {
    Rain:         "rainy day rain drops grey sky",
    Drizzle:      "light rain drizzle wet",
    Thunderstorm: "thunderstorm lightning dramatic sky",
    Snow:         "snow winter landscape white",
    Clouds:       "cloudy overcast grey sky",
    Mist:         "foggy misty morning landscape",
    Fog:          "foggy landscape mysterious",
    Haze:         "hazy sky atmosphere",
    Clear:        "clear blue sky sunny",
  } as Record<string, string>,
  dark: ["dark night cityscape lights", "dark moody landscape night", "dark dramatic sky"],
};

// Returns the best Unsplash query for the current conditions
export function imageQuery(
  theme: AppTheme,
  sky: string,
  condition: string,
  index: number
): string {
  if (theme === "dark" || theme === "custom") return QUERIES.dark[index % QUERIES.dark.length];
  if (theme === "space") return QUERIES.space[index % QUERIES.space.length];
  // "auto" — pick by weather first, then sky
  const weatherQ = QUERIES.weatherMap[condition];
  if (weatherQ) return weatherQ;
  return QUERIES.skyMap[sky] ?? "sky nature";
}

// ── NASA APOD ─────────────────────────────────────────────────────────────────
export async function fetchNasaImages(): Promise<string[]> {
  try {
    const res  = await fetch(
      "https://api.nasa.gov/planetary/apod?api_key=hAJ00O4AgPADMpCXX1jp8ipqBzJCsXSDoyn96GnF&count=8"
    );
    const data = await res.json();
    return (data as { media_type: string; hdurl?: string; url: string }[])
      .filter(d => d.media_type === "image")
      .map(d => d.hdurl ?? d.url);
  } catch {
    return [];
  }
}

// ── Custom / user-uploaded images ─────────────────────────────────────────────
const LS_KEY = "timesphere_custom_images";

export function loadCustomImages(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); }
  catch { return []; }
}

export function saveCustomImage(base64: string): void {
  const imgs = loadCustomImages();
  imgs.push(base64);
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(imgs.slice(-5)));
  } catch {
    try { localStorage.setItem(LS_KEY, JSON.stringify([base64])); } catch { /* ignore */ }
  }
}

export function deleteCustomImage(index: number): void {
  const imgs = loadCustomImages();
  imgs.splice(index, 1);
  localStorage.setItem(LS_KEY, JSON.stringify(imgs));
}

export function fallbackGradient(theme: AppTheme): string {
  switch (theme) {
    case "dark":  return "linear-gradient(180deg,#0a0a1a,#0d1b2a)";
    case "space": return "linear-gradient(180deg,#0d0a1e,#1a0a3e)";
    default:      return "linear-gradient(180deg,#1e3a5f,#0a1628)";
  }
}
