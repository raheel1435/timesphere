// ─────────────────────────────────────────────────────────────────────────────
// src/utils/timeUtils.ts
//
// Functions that convert a time (hours + minutes) into spoken phrases.
// Covers English and Swedish using the full Swedish clock system shown in the
// teaching chart (WhatsApp photo): hel, kvart, halv, över, i, etc.
// ─────────────────────────────────────────────────────────────────────────────

// ─── English time phrase ──────────────────────────────────────────────────────
// Returns a natural English sentence for any hour/minute combination.
// Examples:
//   getEnglishPhrase(3, 0)  → "It's three o'clock"
//   getEnglishPhrase(3, 15) → "It's quarter past three"
//   getEnglishPhrase(3, 30) → "It's half past three"
//   getEnglishPhrase(3, 45) → "It's quarter to four"
//   getEnglishPhrase(3, 20) → "It's twenty past three"
export function getEnglishPhrase(hours24: number, minutes: number): string {
  // Full 24-hour word list — indexed 0–23
  const words = [
    "midnight","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve",
    "thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen",
    "twenty","twenty-one","twenty-two","twenty-three"
  ];
  const nextHour = (hours24 + 1) % 24;
  const cur  = words[hours24];
  const next = words[nextHour];

  if (minutes === 0)  return hours24 === 12 ? `It's noon`          : `It's ${cur} o'clock`;
  if (minutes === 1)  return `It's one minute past ${cur}`;
  if (minutes === 5)  return `It's five past ${cur}`;
  if (minutes === 10) return `It's ten past ${cur}`;
  if (minutes === 15) return `It's quarter past ${cur}`;
  if (minutes === 20) return `It's twenty past ${cur}`;
  if (minutes === 25) return `It's twenty-five past ${cur}`;
  if (minutes === 30) return `It's half past ${cur}`;
  if (minutes === 35) return `It's twenty-five to ${next}`;
  if (minutes === 40) return `It's twenty to ${next}`;
  if (minutes === 45) return `It's quarter to ${next}`;
  if (minutes === 50) return `It's ten to ${next}`;
  if (minutes === 55) return `It's five to ${next}`;

  if (minutes < 30) return `It's ${minutes} minutes past ${cur}`;
  return             `It's ${60 - minutes} minutes to ${next}`;
}

// ─── English short format (for sub-text line) ────────────────────────────────
// Returns the 12-hour time with AM/PM, e.g. "3:30 PM"
export function getEnglishShort(hours24: number, minutes: number): string {
  const period = hours24 < 12 ? "AM" : "PM"; // before noon = AM, noon onward = PM
  const h12    = hours24 % 12 || 12;          // convert to 12-hour
  const mm     = String(minutes).padStart(2, "0"); // ensure 2 digits: "5" → "05"
  return `${h12}:${mm} ${period}`; // e.g. "3:05 PM"
}

// ─── Swedish time phrase ──────────────────────────────────────────────────────
// Returns the correct Swedish idiomatic time expression.
//
// THE SWEDISH CLOCK SYSTEM (from the teaching chart):
//   • "hel"  → exact hour, e.g. klockan är tre (it's three o'clock)
//   • "över" → minutes PAST the hour (for 1–29 min)
//   • "i"    → minutes TO the next hour (for 31–59 min)
//   • "halv" → half-hour BEFORE the next hour (X:30 = "halv X+1")
//   • "kvart" → quarter (X:15 = "kvart över X", X:45 = "kvart i X+1")
//   • "fem över halv" → 25 past (5 past the half-hour = X:25)
//   • "fem i halv"    → 35 past (5 before the half-hour = X:35)
//
// Examples:
//   getSweTime(3, 0)  → "Klockan är tre"
//   getSweTime(3, 15) → "Kvart över tre"
//   getSweTime(3, 30) → "Halv fyra"
//   getSweTime(3, 45) → "Kvart i fyra"
//   getSweTime(3, 25) → "Fem över halv fyra"
//   getSweTime(3, 35) → "Fem i halv fyra"
export function getSweTime(hours24: number, minutes: number): string {
  const sw24 = [
    "noll","ett","två","tre","fyra","fem","sex","sju","åtta","nio","tio","elva","tolv",
    "tretton","fjorton","femton","sexton","sjutton","arton","nitton","tjugo","tjugoen","tjugotvå","tjugotre"
  ];
  const cur  = sw24[hours24];
  const next = sw24[(hours24 + 1) % 24];

  if (minutes === 0)  return `Klockan är ${cur}`;
  if (minutes === 1)  return `En minut över ${cur}`;
  if (minutes === 5)  return `Fem över ${cur}`;
  if (minutes === 10) return `Tio över ${cur}`;
  if (minutes === 15) return `Kvart över ${cur}`;
  if (minutes === 20) return `Tjugo över ${cur}`;
  if (minutes === 25) return `Fem över halv ${next}`;
  if (minutes === 30) return `Halv ${next}`;
  if (minutes === 35) return `Fem i halv ${next}`;
  if (minutes === 40) return `Tjugo i ${next}`;
  if (minutes === 45) return `Kvart i ${next}`;
  if (minutes === 50) return `Tio i ${next}`;
  if (minutes === 55) return `Fem i ${next}`;

  if (minutes < 30) return `${minutes} minuter över ${cur}`;
  return             `${60 - minutes} minuter i ${next}`;
}

// ─── Swedish "number reading" (direct digit reading, like "femton trettio") ──
// This is how Swedes read times in 24-hour format: just say the numbers.
// E.g. 15:30 → "femton trettio"
export function getSweDirectReading(hours24: number, minutes: number): string {
  // Swedish numbers 0–59
  const swe: Record<number,string> = {
    0:"noll",1:"ett",2:"två",3:"tre",4:"fyra",5:"fem",6:"sex",7:"sju",8:"åtta",
    9:"nio",10:"tio",11:"elva",12:"tolv",13:"tretton",14:"fjorton",15:"femton",
    16:"sexton",17:"sjutton",18:"arton",19:"nitton",20:"tjugo",21:"tjugoen",
    22:"tjugotvå",23:"tjugotre",24:"tjugofyra",25:"tjugofem",26:"tjugosex",
    27:"tjugosju",28:"tjugoåtta",29:"tjugonio",30:"trettio",31:"trettioen",
    32:"trettiotvå",33:"trettiotre",34:"trettiofyra",35:"trettiofem",36:"trettiosex",
    37:"trettiojsju",38:"trettioåtta",39:"trettionio",40:"fyrtio",41:"fyrtioen",
    42:"fyrtiotvå",43:"fyrtiotre",44:"fyrtiofyra",45:"fyrtiofem",46:"fyrtiosex",
    47:"fyrtiojsju",48:"fyrtioåtta",49:"fyrtionio",50:"femtio",51:"femtioen",
    52:"femtiotvå",53:"femtiotre",54:"femtiofyra",55:"femtiofem",56:"femtiosex",
    57:"femtiojsju",58:"femtioåtta",59:"femtionio"
  };
  const h = swe[hours24] ?? String(hours24); // get word for hour (e.g. 15 → "femton")
  const m = swe[minutes] ?? String(minutes); // get word for minute (e.g. 30 → "trettio")
  if (minutes === 0) return h;               // "femton" (no need to say "noll")
  return `${h} ${m}`;                        // "femton trettio"
}

// ─── Sky condition calculator ─────────────────────────────────────────────────
// Given the current time (as a Unix timestamp in seconds) and the
// sunrise/sunset times (also Unix timestamps from the weather API),
// returns a string describing what the sky looks like right now.
export function getSkyCondition(
  nowMs:      number, // current time in milliseconds
  sunriseMs:  number, // sunrise time in milliseconds
  sunsetMs:   number  // sunset time in milliseconds
): string {
  const now     = nowMs;               // current time in ms
  const rise    = sunriseMs;           // sunrise in ms
  const set     = sunsetMs;            // sunset  in ms
  const hour    = 3600 * 1000;         // 1 hour  in ms

  if (now < rise - hour)         return "night";       // deep night, well before sunrise
  if (now < rise - 30*60*1000)   return "night";       // still night, 30–60 min before sunrise
  if (now < rise + 30*60*1000)   return "sunrise";     // ± 30 min around sunrise
  if (now < rise + 3 * hour)     return "morning";     // early morning, sun just up
  if (now < set  - 3 * hour)     return "day";         // mid-day
  if (now < set  - 30*60*1000)   return "afternoon";   // late afternoon
  if (now < set  + 30*60*1000)   return "sunset";      // ± 30 min around sunset
  if (now < set  + hour)         return "dusk";        // just after sunset
  return "night";                                       // nighttime
}

// ─── Format time for digital display ─────────────────────────────────────────
// Converts a Date object into a "HH:MM:SS" string in the given timezone.
export function formatDigital(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone, // e.g. "Europe/Stockholm"
    hour:     "2-digit",
    minute:   "2-digit",
    second:   "2-digit",
    hour12:   false    // 24-hour format: "14:30:05"
  }).format(date);
}

// ─── Get hours and minutes from a Date in a timezone ─────────────────────────
// Returns { h: number, m: number, s: number } for use in angle calculations
export function getHMS(date: Date, timezone: string): { h: number; m: number; s: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour:     "numeric",
    minute:   "numeric",
    second:   "numeric",
    hour12:   false
  }).formatToParts(date); // returns an array of { type, value } objects

  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? "0");
  return { h: get("hour"), m: get("minute"), s: get("second") };
}
