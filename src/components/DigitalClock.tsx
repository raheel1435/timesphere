import { useState } from "react";
import { FiEdit2, FiPlay, FiRefreshCw, FiX } from "react-icons/fi";
import { formatDigital, getHMS } from "../utils/timeUtils";

interface Props {
  time:         Date;
  isPlaying:    boolean;
  isEditing:    boolean;
  timezone:     string;
  homeTimezone: string;
  onEdit:       () => void;
  onPlay:       () => void;
  onReset:      () => void;
  onSetTime:    (t: string) => void;
}

export default function DigitalClock({
  time, isPlaying, isEditing, timezone, homeTimezone,
  onEdit, onPlay, onReset, onSetTime
}: Props) {
  const [editValue, setEditValue] = useState("");

  const localTime = formatDigital(time, timezone);
  const showHome  = timezone !== homeTimezone;
  const homeTime  = showHome ? formatDigital(time, homeTimezone) : "";

  function handleEditSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") onSetTime(editValue);
  }

  function handleEditOpen() {
    const { h: hh, m: mm } = getHMS(time, timezone);
    setEditValue(`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`);
    onEdit();
  }

  return (
    // relative so the absolute overlay anchors to this element
    <div className="relative flex flex-col items-center">

      {/* ── Main time row ── */}
      <div className="flex items-center gap-3">
        <span
          className="text-white font-bold tracking-widest drop-shadow-lg"
          style={{ fontSize: "clamp(36px,10vw,52px)", fontVariantNumeric: "tabular-nums" }}
        >
          {localTime.split(":").map((part, i) => (
            <span key={i} style={{ display: "contents" }}>
              {i > 0 && (
                <span className={`mx-0.5 ${isPlaying ? "animate-pulse" : "opacity-50"}`}>:</span>
              )}
              {part}
            </span>
          ))}
        </span>

        {/* Edit button — hidden while overlay is open */}
        {!isEditing ? (
          <button
            onClick={handleEditOpen}
            className="p-2 rounded-full glass-card text-white/70 hover:text-white hover:bg-white/20 transition-all"
            title="Edit time"
          >
            <FiEdit2 size={15} />
          </button>
        ) : (
          // X to dismiss the overlay without resetting
          <button
            onClick={onReset}
            className="p-2 rounded-full glass-card text-white/70 hover:text-white hover:bg-white/20 transition-all"
            title="Close edit"
          >
            <FiX size={15} />
          </button>
        )}
      </div>

      {/* ── Edit overlay — absolute, does NOT shift any other element ── */}
      {isEditing && (
        <div className="absolute top-full mt-2 z-20 flex items-center gap-2 glass-card px-3 py-2 fade-in-up shadow-2xl">
          <input
            type="time"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleEditSubmit}
            autoFocus
            className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1.5 text-base font-bold text-center focus:outline-none focus:border-white/60"
            style={{ fontVariantNumeric: "tabular-nums" }}
          />
          <button
            onClick={() => { onSetTime(editValue); onPlay(); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/80 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-all"
          >
            <FiPlay size={12} /> Play
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all"
          >
            <FiRefreshCw size={12} /> Reset
          </button>
        </div>
      )}

      {/* ── Home timezone — stays in normal flow ── */}
      {showHome && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg">🇸🇪</span>
          <div className="flex flex-col items-start">
            <span className="text-white/50 text-xs">Home (Sweden)</span>
            <span
              className="text-white/90 font-semibold tracking-widest"
              style={{ fontSize: 18, fontVariantNumeric: "tabular-nums" }}
            >
              {homeTime}
            </span>
          </div>
        </div>
      )}

      {/* ── Paused badge ── */}
      {!isPlaying && !isEditing && (
        <span className="text-xs text-yellow-400/80 mt-1 tracking-widest font-semibold">
          ⏸ PAUSED
        </span>
      )}
    </div>
  );
}
