// ─────────────────────────────────────────────────────────────────────────────
// src/utils/timezones.ts
//
// A complete list of all major IANA timezones for the Settings "Home timezone"
// dropdown. IANA timezones (like "Europe/Stockholm") are the standard way
// JavaScript handles time zones.
//
// We include the UTC offset so users can easily find their zone.
// ─────────────────────────────────────────────────────────────────────────────

import type { TimezoneEntry } from "../types"; // import our TypeScript shape

// Full list of major world timezones
export const ALL_TIMEZONES: TimezoneEntry[] = [
  // ── UTC / No offset ─────────────────────────────────────────────────────
  { tz: "UTC",                       label: "UTC+0  – Coordinated Universal Time",       country: "XX", offset: 0    },

  // ── Europe ───────────────────────────────────────────────────────────────
  { tz: "Europe/London",             label: "UTC+0  – London (UK)",                      country: "GB", offset: 0    },
  { tz: "Europe/Dublin",             label: "UTC+0  – Dublin (Ireland)",                 country: "IE", offset: 0    },
  { tz: "Europe/Lisbon",             label: "UTC+0  – Lisbon (Portugal)",                country: "PT", offset: 0    },
  { tz: "Atlantic/Reykjavik",        label: "UTC+0  – Reykjavik (Iceland)",              country: "IS", offset: 0    },
  { tz: "Europe/Paris",              label: "UTC+1  – Paris (France)",                   country: "FR", offset: 60   },
  { tz: "Europe/Berlin",             label: "UTC+1  – Berlin (Germany)",                 country: "DE", offset: 60   },
  { tz: "Europe/Amsterdam",          label: "UTC+1  – Amsterdam (Netherlands)",          country: "NL", offset: 60   },
  { tz: "Europe/Brussels",           label: "UTC+1  – Brussels (Belgium)",               country: "BE", offset: 60   },
  { tz: "Europe/Madrid",             label: "UTC+1  – Madrid (Spain)",                   country: "ES", offset: 60   },
  { tz: "Europe/Rome",               label: "UTC+1  – Rome (Italy)",                     country: "IT", offset: 60   },
  { tz: "Europe/Vienna",             label: "UTC+1  – Vienna (Austria)",                 country: "AT", offset: 60   },
  { tz: "Europe/Zurich",             label: "UTC+1  – Zurich (Switzerland)",             country: "CH", offset: 60   },
  { tz: "Europe/Stockholm",          label: "UTC+1  – Stockholm (Sweden) ★",             country: "SE", offset: 60   },
  { tz: "Europe/Oslo",               label: "UTC+1  – Oslo (Norway)",                    country: "NO", offset: 60   },
  { tz: "Europe/Copenhagen",         label: "UTC+1  – Copenhagen (Denmark)",             country: "DK", offset: 60   },
  { tz: "Europe/Helsinki",           label: "UTC+2  – Helsinki (Finland)",               country: "FI", offset: 120  },
  { tz: "Europe/Warsaw",             label: "UTC+1  – Warsaw (Poland)",                  country: "PL", offset: 60   },
  { tz: "Europe/Prague",             label: "UTC+1  – Prague (Czech Republic)",          country: "CZ", offset: 60   },
  { tz: "Europe/Budapest",           label: "UTC+1  – Budapest (Hungary)",               country: "HU", offset: 60   },
  { tz: "Europe/Bucharest",          label: "UTC+2  – Bucharest (Romania)",              country: "RO", offset: 120  },
  { tz: "Europe/Sofia",              label: "UTC+2  – Sofia (Bulgaria)",                 country: "BG", offset: 120  },
  { tz: "Europe/Athens",             label: "UTC+2  – Athens (Greece)",                  country: "GR", offset: 120  },
  { tz: "Europe/Istanbul",           label: "UTC+3  – Istanbul (Turkey)",                country: "TR", offset: 180  },
  { tz: "Europe/Moscow",             label: "UTC+3  – Moscow (Russia)",                  country: "RU", offset: 180  },
  { tz: "Europe/Kiev",               label: "UTC+2  – Kyiv (Ukraine)",                   country: "UA", offset: 120  },

  // ── Americas ─────────────────────────────────────────────────────────────
  { tz: "America/New_York",          label: "UTC-5  – New York (USA Eastern)",           country: "US", offset: -300 },
  { tz: "America/Chicago",           label: "UTC-6  – Chicago (USA Central)",            country: "US", offset: -360 },
  { tz: "America/Denver",            label: "UTC-7  – Denver (USA Mountain)",            country: "US", offset: -420 },
  { tz: "America/Los_Angeles",       label: "UTC-8  – Los Angeles (USA Pacific)",        country: "US", offset: -480 },
  { tz: "America/Anchorage",         label: "UTC-9  – Anchorage (Alaska)",               country: "US", offset: -540 },
  { tz: "Pacific/Honolulu",          label: "UTC-10 – Honolulu (Hawaii)",                country: "US", offset: -600 },
  { tz: "America/Toronto",           label: "UTC-5  – Toronto (Canada Eastern)",         country: "CA", offset: -300 },
  { tz: "America/Vancouver",         label: "UTC-8  – Vancouver (Canada Pacific)",       country: "CA", offset: -480 },
  { tz: "America/Mexico_City",       label: "UTC-6  – Mexico City (Mexico)",             country: "MX", offset: -360 },
  { tz: "America/Sao_Paulo",         label: "UTC-3  – São Paulo (Brazil)",               country: "BR", offset: -180 },
  { tz: "America/Buenos_Aires",      label: "UTC-3  – Buenos Aires (Argentina)",         country: "AR", offset: -180 },
  { tz: "America/Santiago",          label: "UTC-4  – Santiago (Chile)",                 country: "CL", offset: -240 },
  { tz: "America/Bogota",            label: "UTC-5  – Bogotá (Colombia)",                country: "CO", offset: -300 },
  { tz: "America/Lima",              label: "UTC-5  – Lima (Peru)",                      country: "PE", offset: -300 },
  { tz: "America/Caracas",           label: "UTC-4  – Caracas (Venezuela)",              country: "VE", offset: -240 },

  // ── Africa ───────────────────────────────────────────────────────────────
  { tz: "Africa/Cairo",              label: "UTC+2  – Cairo (Egypt)",                    country: "EG", offset: 120  },
  { tz: "Africa/Johannesburg",       label: "UTC+2  – Johannesburg (South Africa)",      country: "ZA", offset: 120  },
  { tz: "Africa/Lagos",              label: "UTC+1  – Lagos (Nigeria)",                  country: "NG", offset: 60   },
  { tz: "Africa/Nairobi",            label: "UTC+3  – Nairobi (Kenya)",                  country: "KE", offset: 180  },
  { tz: "Africa/Casablanca",         label: "UTC+1  – Casablanca (Morocco)",             country: "MA", offset: 60   },
  { tz: "Africa/Accra",              label: "UTC+0  – Accra (Ghana)",                    country: "GH", offset: 0    },
  { tz: "Africa/Addis_Ababa",        label: "UTC+3  – Addis Ababa (Ethiopia)",           country: "ET", offset: 180  },

  // ── Middle East ───────────────────────────────────────────────────────────
  { tz: "Asia/Riyadh",               label: "UTC+3  – Riyadh (Saudi Arabia)",            country: "SA", offset: 180  },
  { tz: "Asia/Dubai",                label: "UTC+4  – Dubai (UAE)",                      country: "AE", offset: 240  },
  { tz: "Asia/Qatar",                label: "UTC+3  – Doha (Qatar)",                     country: "QA", offset: 180  },
  { tz: "Asia/Kuwait",               label: "UTC+3  – Kuwait City (Kuwait)",             country: "KW", offset: 180  },
  { tz: "Asia/Baghdad",              label: "UTC+3  – Baghdad (Iraq)",                   country: "IQ", offset: 180  },
  { tz: "Asia/Tehran",               label: "UTC+3:30 – Tehran (Iran)",                  country: "IR", offset: 210  },
  { tz: "Asia/Jerusalem",            label: "UTC+2  – Jerusalem (Israel)",               country: "IL", offset: 120  },
  { tz: "Asia/Beirut",               label: "UTC+2  – Beirut (Lebanon)",                 country: "LB", offset: 120  },
  { tz: "Asia/Amman",                label: "UTC+2  – Amman (Jordan)",                   country: "JO", offset: 120  },

  // ── Asia ─────────────────────────────────────────────────────────────────
  { tz: "Asia/Karachi",              label: "UTC+5  – Karachi (Pakistan)",               country: "PK", offset: 300  },
  { tz: "Asia/Kolkata",              label: "UTC+5:30 – Mumbai/Delhi (India)",           country: "IN", offset: 330  },
  { tz: "Asia/Dhaka",                label: "UTC+6  – Dhaka (Bangladesh)",               country: "BD", offset: 360  },
  { tz: "Asia/Colombo",              label: "UTC+5:30 – Colombo (Sri Lanka)",            country: "LK", offset: 330  },
  { tz: "Asia/Kathmandu",            label: "UTC+5:45 – Kathmandu (Nepal)",              country: "NP", offset: 345  },
  { tz: "Asia/Bangkok",              label: "UTC+7  – Bangkok (Thailand)",               country: "TH", offset: 420  },
  { tz: "Asia/Jakarta",              label: "UTC+7  – Jakarta (Indonesia)",              country: "ID", offset: 420  },
  { tz: "Asia/Singapore",            label: "UTC+8  – Singapore",                        country: "SG", offset: 480  },
  { tz: "Asia/Kuala_Lumpur",         label: "UTC+8  – Kuala Lumpur (Malaysia)",          country: "MY", offset: 480  },
  { tz: "Asia/Shanghai",             label: "UTC+8  – Shanghai/Beijing (China)",         country: "CN", offset: 480  },
  { tz: "Asia/Hong_Kong",            label: "UTC+8  – Hong Kong",                        country: "HK", offset: 480  },
  { tz: "Asia/Taipei",               label: "UTC+8  – Taipei (Taiwan)",                  country: "TW", offset: 480  },
  { tz: "Asia/Tokyo",                label: "UTC+9  – Tokyo (Japan)",                    country: "JP", offset: 540  },
  { tz: "Asia/Seoul",                label: "UTC+9  – Seoul (South Korea)",              country: "KR", offset: 540  },
  { tz: "Asia/Tashkent",             label: "UTC+5  – Tashkent (Uzbekistan)",            country: "UZ", offset: 300  },
  { tz: "Asia/Almaty",               label: "UTC+6  – Almaty (Kazakhstan)",              country: "KZ", offset: 360  },
  { tz: "Asia/Yekaterinburg",        label: "UTC+5  – Yekaterinburg (Russia)",           country: "RU", offset: 300  },
  { tz: "Asia/Novosibirsk",          label: "UTC+7  – Novosibirsk (Russia)",             country: "RU", offset: 420  },

  // ── Oceania ───────────────────────────────────────────────────────────────
  { tz: "Australia/Sydney",          label: "UTC+10 – Sydney (Australia)",               country: "AU", offset: 600  },
  { tz: "Australia/Melbourne",       label: "UTC+10 – Melbourne (Australia)",            country: "AU", offset: 600  },
  { tz: "Australia/Brisbane",        label: "UTC+10 – Brisbane (Australia)",             country: "AU", offset: 600  },
  { tz: "Australia/Perth",           label: "UTC+8  – Perth (Australia)",                country: "AU", offset: 480  },
  { tz: "Australia/Adelaide",        label: "UTC+9:30 – Adelaide (Australia)",           country: "AU", offset: 570  },
  { tz: "Pacific/Auckland",          label: "UTC+12 – Auckland (New Zealand)",           country: "NZ", offset: 720  },
  { tz: "Pacific/Fiji",              label: "UTC+12 – Fiji",                             country: "FJ", offset: 720  },
];

// ─── Helper: get timezone entry by IANA string ────────────────────────────────
// Returns the full entry for a given IANA tz, or undefined if not found
export function findTimezone(tz: string): TimezoneEntry | undefined {
  return ALL_TIMEZONES.find(entry => entry.tz === tz); // find the matching entry
}

// ─── Helper: get UTC offset string for display ───────────────────────────────
// Returns a string like "UTC+1" or "UTC-5" for a given IANA timezone
export function getUtcOffsetLabel(tz: string): string {
  try {
    // Use the Intl API to get the current offset (accounts for daylight saving time)
    const now    = new Date();                         // current time
    const offset = new Intl.DateTimeFormat("en", {    // format with timeZoneName
      timeZone:     tz,
      timeZoneName: "shortOffset"                     // returns "GMT+1", "GMT-5", etc.
    }).formatToParts(now)
      .find(p => p.type === "timeZoneName")            // find the timezone part
      ?.value ?? "UTC";                                // default to "UTC" if not found
    return offset.replace("GMT", "UTC");               // rename GMT to UTC for clarity
  } catch {
    return "UTC"; // if the tz string is invalid, just show UTC
  }
}
