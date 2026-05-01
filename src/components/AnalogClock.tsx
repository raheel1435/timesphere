// ─────────────────────────────────────────────────────────────────────────────
// src/components/AnalogClock.tsx
//
// The main analog clock face with:
//   • Dynamic sky/weather background (canvas drawing)
//   • 12-hour numbers in white (outer ring)
//   • 24-hour numbers in red (inner ring)
//   • Three hands: hour (white), minute (white), second (red)
//   • Center dot
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { getHMS } from "../utils/timeUtils";

interface Props {
  time:     Date;
  timezone: string;
}

// ─── AnalogClock component ────────────────────────────────────────────────────
export default function AnalogClock({ time, timezone }: Props) {

  // Responsive clock size — shrinks on narrow screens, caps at 280px
  const [SIZE, setSIZE] = useState(() => Math.min(280, window.innerWidth - 32));
  useEffect(() => {
    const handler = () => setSIZE(Math.min(280, window.innerWidth - 32));
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { h, m, s } = getHMS(time, timezone);

  const hourDeg   = (h % 12) * 30 + m * 0.5 + s * (0.5 / 60);
  const minuteDeg = m * 6          + s * 0.1;
  const secondDeg = s * 6;

  // ── Build the 12 clock number positions ───────────────────────────────────
  // We calculate (x, y) for each number on the clock face
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const num     = i + 1;                             // 1 to 12
    const angle   = (num * 30 - 90) * (Math.PI / 180); // convert clock position to radians (-90 = 12 o'clock)
    const outerR  = SIZE / 2 - 22;                     // 12-hour numbers sit near the outer edge
    const innerR  = SIZE / 2 - 42;                     // 24-hour numbers sit slightly further in
    return {
      num,
      x12: SIZE/2 + outerR * Math.cos(angle),  // x position for 12-hour number
      y12: SIZE/2 + outerR * Math.sin(angle),  // y position for 12-hour number
      x24: SIZE/2 + innerR * Math.cos(angle),  // x position for 24-hour number
      y24: SIZE/2 + innerR * Math.sin(angle),  // y position for 24-hour number
      num24: num + 12 === 24 ? 0 : num + 12    // 24h number: 13–23, and 12+12=24 shows as 0
    };
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    // Outer container: fixed size circle with black border
    <div
      className="relative rounded-full shadow-2xl overflow-hidden"
      style={{ width: SIZE, height: SIZE }}
    >
      {/* Subtle dark overlay so numbers stay readable on any background */}
      <div className="absolute inset-0 bg-black/25 rounded-full" />

      {/* ── 12-hour numbers ── */}
      {numbers.map(({ num, x12, y12 }) => (
        <span
          key={`h${num}`}
          className="clock-number text-white"
          style={{ left: x12, top: y12, fontSize: SIZE * 0.054 }}
        >
          {num}
        </span>
      ))}

      {/* ── 24-hour numbers (inner ring, same white color, smaller) ── */}
      {numbers.map(({ num, x24, y24, num24 }) => (
        <span
          key={`h24${num}`}
          className="clock-number text-white"
          style={{ left: x24, top: y24, fontSize: SIZE * 0.032, opacity: 0.7 }}
        >
          {num24}
        </span>
      ))}

      {/* ── Tick marks around the clock edge ── */}
      {Array.from({ length: 60 }, (_, i) => {
        const angle    = (i * 6 - 90) * (Math.PI / 180); // 6° per minute mark
        const isHour   = i % 5 === 0;         // every 5th mark is an hour mark (longer)
        const outerTip = SIZE / 2 - 8;        // outer tip of the tick (px from center)
        return (
          <div
            key={i}
            style={{
              position:  "absolute",
              left:      SIZE/2 + outerTip * Math.cos(angle) - 0.5,  // center the tick
              top:       SIZE/2 + outerTip * Math.sin(angle) - 0.5,
              width:     isHour ? 2 : 1,               // thicker for hour marks
              height:    isHour ? 10 : 5,              // taller for hour marks
              background:"rgba(255,255,255,0.8)",       // white semi-transparent
              transform: `rotate(${i*6}deg)`,           // rotate to face outward
              transformOrigin: "top center",
              borderRadius: 1
            }}
          />
        );
      })}

      {/* ── Hour hand ── */}
      <div
        className="clock-hand bg-white"
        style={{
          width:    6,                                   // px wide
          height:   SIZE * 0.25,                        // 25% of clock diameter
          transform:`rotate(${hourDeg}deg)`,             // rotated by JS calculation
          marginLeft: -3,                               // center horizontally (half of width)
          boxShadow: "0 2px 6px rgba(0,0,0,0.5)"        // subtle shadow for depth
        }}
      />

      {/* ── Minute hand ── */}
      <div
        className="clock-hand bg-white"
        style={{
          width:    4,
          height:   SIZE * 0.36,                        // 36% of clock diameter (longer than hour)
          transform:`rotate(${minuteDeg}deg)`,
          marginLeft: -2,                               // center horizontally
          boxShadow: "0 2px 6px rgba(0,0,0,0.5)"
        }}
      />

      {/* ── Second hand ── */}
      <div
        className="clock-hand bg-red-500"
        style={{
          width:      2,
          height:     SIZE * 0.40,
          transform:  `rotate(${secondDeg}deg)`,
          marginLeft: -1,
          // At s=0 the hand jumps from 354° back to 0°; suppressing the transition
          // prevents it from visually spinning backwards through the full circle.
          transition: s === 0 ? "none" : "transform 0.25s cubic-bezier(0.4, 2.08, 0.55, 0.44)"
        }}
      />

      {/* ── Center cap dot ── */}
      {/* Covers the base of all three hands with a neat circle */}
      <div
        className="absolute rounded-full bg-white border-2 border-gray-300 z-10"
        style={{
          width:  12,                          // 12px diameter
          height: 12,
          top:    SIZE/2 - 6,                  // centered vertically
          left:   SIZE/2 - 6,                  // centered horizontally
          boxShadow: "0 0 4px rgba(0,0,0,0.6)"
        }}
      />
    </div>
  );
}
