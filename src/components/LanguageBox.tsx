// ─────────────────────────────────────────────────────────────────────────────
// src/components/LanguageBox.tsx
//
// A compact box that:
//   • Shows the current time in a selected country's language
//   • Has a dropdown to choose any country/language
//   • Has a 🔊 speaker button to hear the time spoken aloud
//   • Lets the user change the displayed time for practice
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";                      // React state hook
import { FiChevronDown, FiVolume2 } from "react-icons/fi"; // icons
import { LANGUAGES, getTimePhrase, speakText } from "../utils/languageUtils"; // language tools
import { getHMS } from "../utils/timeUtils";           // extract hours/minutes from Date
import type { LanguageOption } from "../types";          // type-only import

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  time:     Date;    // current clock time
  timezone: string;  // current location timezone
}

export default function LanguageBox({ time, timezone }: Props) {

  // "selected" is the currently chosen language/country
  // Default to Swedish (index 0 in our LANGUAGES list)
  const [selected, setSelected] = useState<LanguageOption>(LANGUAGES[0]);

  // "open" controls whether the language dropdown list is visible
  const [open, setOpen] = useState<boolean>(false);

  // "customHours" and "customMinutes" let the user pick a specific time for practice
  // null = use the real clock time; a number = use this override
  const [customHours,   setCustomHours]   = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState<number | null>(null);

  // ── Get hours + minutes to display ───────────────────────────────────────
  // Use the custom practice time if set, otherwise use the real clock time
  const { h: realH, m: realM } = getHMS(time, timezone); // real clock hours/minutes
  const h = customHours   ?? realH;  // use custom or real hours
  const m = customMinutes ?? realM;  // use custom or real minutes

  // ── Get the time phrase for the selected language ─────────────────────────
  const { main, sub } = getTimePhrase(h, m, selected.code);
  // main = the idiomatic phrase, e.g. "Halv fyra" or "It's half past three"
  // sub  = the short format, e.g. "femton trettio" or "3:30 PM"

  // ── Handle language selection ─────────────────────────────────────────────
  function selectLanguage(lang: LanguageOption) {
    setSelected(lang); // update the selected language
    setOpen(false);    // close the dropdown
  }

  // ── Handle speak button ───────────────────────────────────────────────────
  function handleSpeak() {
    speakText(main, selected.code); // speak only the idiomatic phrase
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm p-3 fade-in-up relative">

      {/* ── Top row: flag, language name, dropdown arrow, speaker ── */}
      <div className="flex items-center justify-between mb-2">

        {/* Left: flag + language/country name */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-white hover:text-white/80 transition-all drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
        >
          <span className="text-xl">{selected.flag}</span>           {/* emoji flag   */}
          <span className="font-semibold text-sm">{selected.language}</span> {/* language name */}
          <span className="text-white/50 text-xs">({selected.country})</span> {/* country */}
          <FiChevronDown
            size={14}
            className={`text-white/60 transition-transform ${open ? "rotate-180" : ""}`} // rotate when open
          />
        </button>

        {/* Right: speaker button */}
        <button
          onClick={handleSpeak}
          className="p-1.5 rounded-full glass-card text-white/70 hover:text-white hover:bg-white/20 transition-all"
          title={`Hear time in ${selected.language}`}
        >
          <FiVolume2 size={16} /> {/* speaker icon */}
        </button>
      </div>

      {/* ── Dropdown list of languages ── */}
      {open && (
        <div className="absolute top-12 left-0 right-0 z-50 glass-card overflow-y-auto fade-in-up"
             style={{ maxHeight: 220 }}> {/* scrollable list, max 220px tall */}
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}                         // unique key per language
              onClick={() => selectLanguage(lang)}    // select this language on click
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-all
                ${selected.code === lang.code
                  ? "bg-white/25 text-white font-semibold"  // highlighted if selected
                  : "text-white/80 hover:bg-white/15"       // normal state
                }`}
            >
              <span className="text-base">{lang.flag}</span>       {/* flag emoji */}
              <span className="font-medium">{lang.language}</span>  {/* language name */}
              <span className="text-white/40 text-xs ml-auto">{lang.country}</span> {/* country */}
            </button>
          ))}
        </div>
      )}

      {/* ── Main phrase display ── */}
      <div className="text-center py-1">
        <div className="text-white font-bold text-xl leading-tight drop-shadow-[0_1px_6px_rgba(0,0,0,1)]">{main}</div>
        <div className="text-white/80 text-xs mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{sub}</div>
      </div>

      {/* ── Practice time selector ── */}
      <div className="flex items-center gap-2 mt-2 border-t border-white/20 pt-2">
        <span className="text-white/70 text-xs drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">Practice:</span>

        {/* Hour selector */}
        <input
          type="number"
          min={0} max={23}                               // valid hour range
          value={customHours ?? h}                       // show custom or real hours
          onChange={e => setCustomHours(parseInt(e.target.value) || 0)} // update on change
          className="w-12 text-center bg-white/10 text-white border border-white/20 rounded px-1 py-0.5 text-sm focus:outline-none focus:border-white/50"
        />
        <span className="text-white/50">:</span>

        {/* Minute selector */}
        <input
          type="number"
          min={0} max={59}                               // valid minute range
          value={customMinutes ?? m}                     // show custom or real minutes
          onChange={e => setCustomMinutes(parseInt(e.target.value) || 0)} // update on change
          className="w-12 text-center bg-white/10 text-white border border-white/20 rounded px-1 py-0.5 text-sm focus:outline-none focus:border-white/50"
        />

        {/* Reset to real time button */}
        <button
          onClick={() => { setCustomHours(null); setCustomMinutes(null); }} // clear overrides
          className="text-xs text-white/50 hover:text-white/80 ml-auto"
        >
          Live ↺
        </button>
      </div>
    </div>
  );
}
