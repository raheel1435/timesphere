import { useState, useEffect } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiPlus, FiTrash2 } from "react-icons/fi";

interface Props {
  onClose:     () => void;
  countryCode: string; // e.g. "SE", "US", "GB" — from weather API
}

interface Holiday {
  date:      string; // "YYYY-MM-DD"
  localName: string;
  name:      string;
}

interface Reminder {
  date:  string; // "YYYY-MM-DD"
  text:  string;
  color: string;
}

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const COLORS  = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#a855f7","#ec4899"];

const LS_KEY = "timesphere_reminders";

function loadReminders(): Reminder[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); }
  catch { return []; }
}
function saveReminders(r: Reminder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(r));
}

export default function Calendar({ onClose, countryCode }: Props) {
  const today = new Date();
  const [year,      setYear]      = useState(today.getFullYear());
  const [month,     setMonth]     = useState(today.getMonth());
  const [holidays,  setHolidays]  = useState<Holiday[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);
  const [addDay,    setAddDay]    = useState<string | null>(null); // date being edited
  const [newText,   setNewText]   = useState("");
  const [newColor,  setNewColor]  = useState(COLORS[4]);

  // Fetch public holidays from Nager.Date (free, no auth)
  useEffect(() => {
    const cc = countryCode.toUpperCase().slice(0, 2);
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${cc}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: Holiday[]) => setHolidays(data))
      .catch(() => setHolidays([]));
  }, [year, countryCode]);

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Build day grid (Monday-first)
  const firstDow    = new Date(year, month, 1).getDay();
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(d: number) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  function holidayFor(d: number): Holiday | undefined {
    return holidays.find(h => h.date === dateStr(d));
  }

  function remindersFor(d: number): Reminder[] {
    return reminders.filter(r => r.date === dateStr(d));
  }

  const isToday = (d: number | null) =>
    d !== null && d === today.getDate() &&
    month === today.getMonth() && year === today.getFullYear();

  function addReminder() {
    if (!addDay || !newText.trim()) return;
    const r: Reminder = { date: addDay, text: newText.trim(), color: newColor };
    const updated = [...reminders, r];
    setReminders(updated);
    saveReminders(updated);
    setNewText("");
    setAddDay(null);
  }

  function deleteReminder(date: string, idx: number) {
    let count = 0;
    const updated = reminders.filter(r => {
      if (r.date === date) { if (count === idx) { count++; return false; } count++; }
      return true;
    });
    setReminders(updated);
    saveReminders(updated);
  }

  // Selected day detail panel
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto py-4">
      <div className="glass-card w-full max-w-sm p-5 fade-in-up my-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">📅 Calendar</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white"><FiX size={18} /></button>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prev} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-all">
            <FiChevronLeft size={18} />
          </button>
          <span className="text-white font-semibold">{MONTHS[month]} {year}</span>
          <button onClick={next} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-all">
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d, i) => (
            <div key={d} className={`text-center text-xs font-semibold py-1 ${i >= 5 ? "text-red-400/70" : "text-white/40"}`}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const holiday  = holidayFor(day);
            const rems     = remindersFor(day);
            const weekend  = i % 7 >= 5;
            const todayDay = isToday(day);
            const selected = selectedDay === day;

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(selected ? null : day)}
                className={`relative text-center py-1 text-sm rounded-lg transition-all leading-tight ${
                  todayDay
                    ? "bg-blue-500 text-white font-bold"
                    : selected
                      ? "bg-white/25 text-white font-semibold"
                      : holiday
                        ? "text-red-400 font-semibold hover:bg-white/15"
                        : weekend
                          ? "text-red-300/70 hover:bg-white/15"
                          : "text-white/80 hover:bg-white/15"
                }`}
              >
                {day}
                {/* Dots for reminders */}
                {rems.length > 0 && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {rems.slice(0, 3).map((r, ri) => (
                      <span key={ri} className="w-1 h-1 rounded-full" style={{ background: r.color }} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day panel */}
        {selectedDay !== null && (() => {
          const ds      = dateStr(selectedDay);
          const holiday = holidayFor(selectedDay);
          const rems    = remindersFor(selectedDay);
          return (
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">
                  {MONTHS[month]} {selectedDay}, {year}
                </span>
                <button
                  onClick={() => { setAddDay(ds); setNewText(""); }}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-all"
                >
                  <FiPlus size={13} /> Add reminder
                </button>
              </div>

              {/* Holiday badge */}
              {holiday && (
                <div className="mb-2 px-3 py-1.5 bg-red-500/20 border border-red-400/30 rounded-xl">
                  <span className="text-red-300 text-xs font-semibold">🇸🇪 Public Holiday — {holiday.localName}</span>
                </div>
              )}

              {/* Reminders list */}
              {rems.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {rems.map((r, ri) => (
                    <div key={ri} className="flex items-start gap-2 px-3 py-1.5 rounded-xl bg-white/8">
                      <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: r.color }} />
                      <span className="text-white/80 text-xs flex-1">{r.text}</span>
                      <button onClick={() => deleteReminder(ds, ri)} className="text-white/30 hover:text-red-400 transition-all">
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                !holiday && <p className="text-white/30 text-xs">No events. Tap + to add a reminder.</p>
              )}
            </div>
          );
        })()}

        {/* Add reminder form */}
        {addDay && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="text-white/60 text-xs mb-2">New reminder for {addDay}</p>
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="What's the occasion?"
              rows={2}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-white/50 mb-2"
            />
            {/* Color picker */}
            <div className="flex gap-2 mb-3">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                  style={{ background: c, outline: c === newColor ? `2px solid white` : "none", outlineOffset: 2 }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAddDay(null)} className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 text-sm">Cancel</button>
              <button onClick={addReminder}           className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-semibold text-sm">Save</button>
            </div>
          </div>
        )}

        {/* Today button */}
        <div className="mt-3 text-center">
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()); }}
            className="text-xs text-white/40 hover:text-white/70 transition-all"
          >
            Jump to today
          </button>
        </div>
      </div>
    </div>
  );
}
