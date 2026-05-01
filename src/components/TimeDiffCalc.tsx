import { useState } from "react";
import { FiX } from "react-icons/fi";

interface Props {
  onClose: () => void;
}

type Tab = "time" | "dates";

export default function TimeDiffCalc({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>("time");

  // ── Time tab state ────────────────────────────────────────────────────────
  const [start, setStart] = useState("08:00");
  const [end,   setEnd]   = useState("16:30");

  function calcTimeDiff(): { hours: number; minutes: number } {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let startMin = sh * 60 + sm;
    let endMin   = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60;
    const diff = endMin - startMin;
    return { hours: Math.floor(diff / 60), minutes: diff % 60 };
  }

  // ── Dates tab state ───────────────────────────────────────────────────────
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  })();
  const [dateA, setDateA] = useState(todayStr);
  const [dateB, setDateB] = useState(todayStr);

  function calcDateDiff() {
    const a = new Date(dateA);
    const b = new Date(dateB);
    const msPerDay = 86_400_000;
    const diffMs   = b.getTime() - a.getTime();
    const days     = Math.round(diffMs / msPerDay);
    const absDays  = Math.abs(days);
    const weeks    = Math.floor(absDays / 7);
    const remDays  = absDays % 7;
    const months   = Math.abs(
      (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
    );
    return { days, absDays, weeks, remDays, months };
  }

  const { hours, minutes } = calcTimeDiff();
  const { days, absDays, weeks, remDays, months } = calcDateDiff();

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function fmtDate(iso: string): string {
    const d = new Date(iso);
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="glass-card w-full max-w-xs p-5 fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-base">⏱ Time Calculator</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-all">
            <FiX size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-4">
          {([ ["time", "Time Diff"], ["dates", "Days Between"] ] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === id ? "bg-white/20 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Time Difference tab ── */}
        {tab === "time" && (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-white/70 text-sm font-semibold">Start Time</label>
                <input
                  type="time"
                  value={start}
                  onChange={e => setStart(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-white/50"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white/70 text-sm font-semibold">End Time</label>
                <input
                  type="time"
                  value={end}
                  onChange={e => setEnd(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="h-px bg-white/10 my-4" />

            <div className="text-center">
              <p className="text-white/50 text-xs mb-1">Difference</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-white font-bold text-4xl">{hours}</span>
                <span className="text-blue-300 text-sm font-bold">H</span>
                <span className="text-white font-bold text-4xl">{String(minutes).padStart(2,"0")}</span>
                <span className="text-blue-300 text-sm font-bold">M</span>
              </div>
              <p className="text-white/50 text-xs mt-2">
                {hours > 0 && `${hours} hour${hours !== 1 ? "s" : ""} `}
                {minutes > 0 && `${minutes} minute${minutes !== 1 ? "s" : ""}`}
                {hours === 0 && minutes === 0 && "Same time"}
              </p>
            </div>
          </>
        )}

        {/* ── Days Between tab ── */}
        {tab === "dates" && (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-sm font-semibold">From</label>
                <input
                  type="date"
                  value={dateA}
                  onChange={e => setDateA(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-white/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-sm font-semibold">To</label>
                <input
                  type="date"
                  value={dateB}
                  onChange={e => setDateB(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="h-px bg-white/10 my-4" />

            <div className="text-center">
              {/* Main count */}
              <p className="text-white/50 text-xs mb-1">
                {fmtDate(dateA)} → {fmtDate(dateB)}
              </p>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className={`font-bold text-4xl ${days < 0 ? "text-red-400" : "text-white"}`}>
                  {days < 0 ? "-" : ""}{absDays}
                </span>
                <span className="text-blue-300 text-sm font-bold">
                  {absDays === 1 ? "day" : "days"}
                </span>
              </div>
              <p className="text-white/40 text-xs">
                {days < 0 ? `${absDays} day${absDays !== 1 ? "s" : ""} ago` : days === 0 ? "Same day" : `${absDays} day${absDays !== 1 ? "s" : ""} from now`}
              </p>

              {/* Breakdown */}
              {absDays > 0 && (
                <div className="mt-3 flex justify-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="text-white font-semibold">{weeks}</p>
                    <p className="text-white/40">{weeks === 1 ? "week" : "weeks"}</p>
                  </div>
                  {remDays > 0 && (
                    <div className="text-center">
                      <p className="text-white font-semibold">{remDays}</p>
                      <p className="text-white/40">{remDays === 1 ? "day" : "days"}</p>
                    </div>
                  )}
                  {months > 0 && (
                    <div className="text-center">
                      <p className="text-white font-semibold">~{months}</p>
                      <p className="text-white/40">{months === 1 ? "month" : "months"}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
