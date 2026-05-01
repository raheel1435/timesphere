// ─────────────────────────────────────────────────────────────────────────────
// src/utils/weatherUtils.ts
//
// Translates raw weather API data + time-of-day into visual properties:
//   • Background gradient colors for the app and the clock face
//   • Whether to show sun, moon, clouds, rain, snow, stars
//   • Moon phase calculation
// ─────────────────────────────────────────────────────────────────────────────

import type { ClockBackground, SkyCondition, AppTheme } from "../types";

// ─── Sky gradient colors ──────────────────────────────────────────────────────
// Returns two CSS color strings [topColor, bottomColor] for the background
// gradient at the given sky condition and weather.
export function getSkyGradient(sky: SkyCondition, condition: string): [string, string] {
  const isRainy  = condition === "Rain" || condition === "Drizzle" || condition === "Thunderstorm";
  const isSnowy  = condition === "Snow";
  const isCloudy = condition === "Clouds" || condition === "Mist" || condition === "Fog";

  // If it's raining, everything is a bit greyer
  if (isRainy) {
    if (sky === "night")     return ["#1a1a2e", "#16213e"]; // dark rainy night
    if (sky === "day")       return ["#4a5568", "#718096"]; // grey overcast day
    return                          ["#374151", "#4b5563"]; // default grey
  }

  if (isSnowy) {
    if (sky === "night")     return ["#1e2a3a", "#2d3e50"]; // dark snowy night
    return                          ["#b0c4de", "#e8edf5"]; // light snowy day
  }

  // Clear / partly cloudy gradients by time of day
  switch (sky) {
    case "night":     return ["#0a0a1a", "#0d1b2a"];         // deep dark blue-black
    case "dawn":      return ["#1a1a3e", "#2d1b4e"];         // very dark purple
    case "sunrise":   return ["#ff6b35", "#f7c59f"];         // orange-peach sunrise
    case "morning":   return ["#87ceeb", "#ffe4b5"];         // light blue to warm yellow
    case "day":       return isCloudy ? ["#708090","#a9b7c6"] : ["#1e90ff", "#87ceeb"]; // blue sky or grey
    case "afternoon": return ["#4fc3f7", "#ffab40"];         // afternoon blue to orange tint
    case "sunset":    return ["#ff4500", "#ff8c00"];         // deep orange-red sunset
    case "dusk":      return ["#2c1654", "#6b2fa0"];         // purple dusk
    case "moonrise":  return ["#0d1b2a", "#1a2a4a"];         // dark blue moonrise
    default:          return ["#1e3a5f", "#0a1628"];         // generic night
  }
}

// ─── App background gradient ──────────────────────────────────────────────────
// Returns a CSS gradient string for the whole app background
export function getAppBackground(sky: SkyCondition, condition: string): string {
  const [top, bottom] = getSkyGradient(sky, condition);
  return `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`; // top-to-bottom gradient
}

// ─── Theme-aware background ───────────────────────────────────────────────────
// Returns the CSS gradient respecting the user's chosen theme.
// "auto" falls back to the real sky/weather gradient; all other themes are static.
export function getThemeBackground(theme: AppTheme, sky: SkyCondition, condition: string): string {
  switch (theme) {
    case "dark":    return "linear-gradient(180deg, #0a0a1a 0%, #0d1b2a 100%)";
    case "light":   return "linear-gradient(180deg, #b0d4f5 0%, #deeefb 100%)";
    case "nature":  return "linear-gradient(180deg, #1a4a2e 0%, #2d6e45 100%)";
    case "space":   return "linear-gradient(180deg, #0d0a1e 0%, #1a0a3e 100%)";
    case "auto":
    default:        return getAppBackground(sky, condition);
  }
}

// ─── Build ClockBackground object ────────────────────────────────────────────
export function buildClockBackground(
  sky:       SkyCondition,
  condition: string,
  nowMs:     number
): ClockBackground {
  return {
    skyCondition:  sky,
    weatherEffect: mapWeatherEffect(condition),
    moonPhase:     getMoonPhase(nowMs),
    showSun:       false,
    showMoon:      false
  };
}

// ─── Map OpenWeatherMap condition to our internal effect name ─────────────────
function mapWeatherEffect(condition: string): string {
  switch (condition) {
    case "Rain":          return "rain";
    case "Drizzle":       return "rain";
    case "Thunderstorm":  return "storm";
    case "Snow":          return "snow";
    case "Clouds":        return "cloudy";
    case "Mist":          return "fog";
    case "Fog":           return "fog";
    case "Haze":          return "fog";
    default:              return "clear";
  }
}

// ─── Moon phase calculation ───────────────────────────────────────────────────
// Returns a value from 0 to 1 representing where in the lunar cycle we are.
// 0 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter, 1 = new moon
//
// The average lunar cycle is 29.53 days.
// We pick a known new moon date and calculate how far past it we are.
export function getMoonPhase(nowMs: number): number {
  const KNOWN_NEW_MOON_MS = new Date("2024-01-11").getTime(); // a known new moon date
  const LUNAR_CYCLE_MS    = 29.53 * 24 * 60 * 60 * 1000;    // 29.53 days in milliseconds
  const elapsed           = nowMs - KNOWN_NEW_MOON_MS;       // ms since that new moon
  const phase             = (elapsed % LUNAR_CYCLE_MS) / LUNAR_CYCLE_MS; // 0–1
  return phase < 0 ? phase + 1 : phase; // ensure positive result
}

// ─── Draw clock background on a Canvas element ───────────────────────────────
// This function is called inside the AnalogClock component to paint the sky
// background directly on the HTML <canvas> element inside the clock face.
export function drawClockBackground(
  ctx:    CanvasRenderingContext2D, // the 2D drawing context of the canvas
  size:   number,                   // diameter of the clock in pixels
  bg:     ClockBackground           // what to draw
): void {
  const cx = size / 2; // center X of the canvas
  const cy = size / 2; // center Y of the canvas
  const r  = size / 2; // radius of the clock

  // ── Draw sky gradient ────────────────────────────────────────────────────
  // createLinearGradient(x0,y0, x1,y1) creates a gradient from top to bottom
  const gradient = ctx.createLinearGradient(0, 0, 0, size);

  // Pick gradient colors based on sky condition and weather
  const isRainy  = bg.weatherEffect === "rain" || bg.weatherEffect === "storm";
  const isCloudy = bg.weatherEffect === "cloudy" || bg.weatherEffect === "fog";

  // addColorStop(position, color) — position is 0 (top) to 1 (bottom)
  switch (bg.skyCondition) {
    case "night":
      gradient.addColorStop(0, "#050510"); // near-black at the top
      gradient.addColorStop(1, "#0d1b2a"); // very dark blue at bottom
      break;
    case "dawn":
      gradient.addColorStop(0, "#1a1a3e"); // dark purple at top
      gradient.addColorStop(1, "#3a1c71"); // deep purple at bottom
      break;
    case "sunrise":
      gradient.addColorStop(0, "#ff6b35"); // warm orange top
      gradient.addColorStop(1, "#f7c59f"); // peach bottom
      break;
    case "morning":
      gradient.addColorStop(0, "#87ceeb"); // sky blue top
      gradient.addColorStop(1, "#ffe4b5"); // warm yellow bottom
      break;
    case "day":
      if (isRainy)       { gradient.addColorStop(0, "#4a5568"); gradient.addColorStop(1, "#718096"); }
      else if (isCloudy) { gradient.addColorStop(0, "#708090"); gradient.addColorStop(1, "#a9b7c6"); }
      else               { gradient.addColorStop(0, "#1e90ff"); gradient.addColorStop(1, "#87ceeb"); } // clear blue
      break;
    case "afternoon":
      gradient.addColorStop(0, "#4fc3f7"); // afternoon blue
      gradient.addColorStop(1, "#ffcc80"); // warm orange tinge
      break;
    case "sunset":
      gradient.addColorStop(0, "#ff4500"); // deep orange-red
      gradient.addColorStop(1, "#ff8c00"); // amber
      break;
    case "dusk":
      gradient.addColorStop(0, "#2c1654"); // deep purple
      gradient.addColorStop(1, "#6b2fa0"); // purple
      break;
    default:
      gradient.addColorStop(0, "#0d1b2a"); // default night
      gradient.addColorStop(1, "#1a2a4a");
  }

  // Fill the entire circle with the gradient
  ctx.save();                   // save current drawing state
  ctx.beginPath();              // start a new path
  ctx.arc(cx, cy, r, 0, Math.PI * 2); // draw a circle path
  ctx.clip();                   // clip drawing to this circle shape
  ctx.fillStyle = gradient;     // set the fill to our gradient
  ctx.fillRect(0, 0, size, size); // fill the entire canvas (clipped to circle)

  // ── Draw stars at night ──────────────────────────────────────────────────
  if (bg.skyCondition === "night" || bg.skyCondition === "dawn" || bg.skyCondition === "moonrise") {
    drawStars(ctx, size, 80); // draw 80 small white dots as stars
  }

  // ── Draw clouds ──────────────────────────────────────────────────────────
  if (bg.weatherEffect === "cloudy" || bg.weatherEffect === "fog") {
    drawClouds(ctx, size, bg.weatherEffect === "fog" ? 0.5 : 0.3); // fog is denser
  }

  // ── Draw rain ────────────────────────────────────────────────────────────
  if (bg.weatherEffect === "rain" || bg.weatherEffect === "storm") {
    drawRain(ctx, size, 30); // draw 30 rain streaks
  }

  // ── Draw snowflakes ───────────────────────────────────────────────────────
  if (bg.weatherEffect === "snow") {
    drawSnow(ctx, size, 25); // draw 25 snowflakes
  }

  ctx.restore(); // restore drawing state (removes the clip)
}

// ─── Helper: draw random stars ────────────────────────────────────────────────
function drawStars(ctx: CanvasRenderingContext2D, size: number, count: number) {
  for (let i = 0; i < count; i++) {
    const x    = Math.random() * size;         // random x position
    const y    = Math.random() * size;         // random y position
    const r    = Math.random() * 1.5 + 0.3;   // random radius between 0.3 and 1.8 px
    const alpha = Math.random() * 0.7 + 0.3;  // random opacity between 0.3 and 1.0
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2); // tiny circle = star
    ctx.fillStyle = `rgba(255,255,255,${alpha})`; // white with varying opacity
    ctx.fill();
  }
}

// ─── Helper: draw wispy clouds ────────────────────────────────────────────────
function drawClouds(ctx: CanvasRenderingContext2D, size: number, opacity: number) {
  ctx.fillStyle = `rgba(200,210,220,${opacity})`; // grey-white semi-transparent
  // Draw 3 cloud shapes using overlapping ellipses
  [[0.3,0.3,40,18],[0.6,0.4,55,20],[0.2,0.6,35,15]].forEach(([rx,ry,w,h]) => {
    ctx.beginPath();
    ctx.ellipse(rx*size, ry*size, w, h, 0, 0, Math.PI*2); // ellipse for each cloud puff
    ctx.fill();
  });
}

// ─── Helper: draw rain streaks ────────────────────────────────────────────────
function drawRain(ctx: CanvasRenderingContext2D, size: number, count: number) {
  ctx.strokeStyle = "rgba(150,180,220,0.5)"; // light blue semi-transparent
  ctx.lineWidth   = 1;                         // thin rain lines
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size; // random x position
    const y = Math.random() * size; // random y position
    ctx.beginPath();
    ctx.moveTo(x, y);               // start of rain drop
    ctx.lineTo(x - 2, y + 8);      // angled line going down-left
    ctx.stroke();
  }
}

// ─── Helper: draw snowflakes ──────────────────────────────────────────────────
function drawSnow(ctx: CanvasRenderingContext2D, size: number, count: number) {
  ctx.fillStyle = "rgba(255,255,255,0.7)"; // white semi-transparent
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size;        // random x
    const y = Math.random() * size;        // random y
    const r = Math.random() * 2 + 1;      // radius 1–3 px
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);     // tiny circle = snowflake
    ctx.fill();
  }
}
