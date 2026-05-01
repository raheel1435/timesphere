// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useClock.ts
//
// Manages the clock's time state: ticking, pausing, editing, and resetting.
//
// KEY CONCEPTS:
//   • setInterval  → runs a function repeatedly every N milliseconds (our "tick")
//   • clearInterval → stops a setInterval timer
//   • useRef        → stores a value that doesn't cause a re-render when changed
//                     (perfect for storing the interval ID)
//   • new Date()    → creates a JavaScript Date object representing right now
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";

// useClock takes a timezone string like "Europe/Stockholm" or "America/New_York"
// and returns the current time in that timezone, plus controls (play/pause/edit/reset)
export function useClock(timezone: string) {

  // "time" is the Date object the clock displays.
  // We initialize it to right now using new Date()
  const [time,      setTime]      = useState<Date>(new Date());

  // "isPlaying" – when true the clock ticks every second; when false it's frozen
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // "isEditing" – when true the edit panel is shown so user can change the time
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // useRef stores the interval ID so we can clear it later.
  // Unlike useState, changing a ref doesn't re-render the component.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── startTicking ──────────────────────────────────────────────────────────
  // Creates a setInterval that fires every 1000ms (1 second) and advances the time.
  // useCallback memoizes this function so it doesn't get recreated on every render.
  const startTicking = useCallback(() => {
    clearInterval(intervalRef.current ?? undefined); // clear any existing interval first

    // setInterval returns an ID number; we save it in the ref so we can stop it
    intervalRef.current = setInterval(() => {
      // Update time: add 1 second to current displayed time
      setTime(prev => {
        const next = new Date(prev); // copy the previous Date so we don't mutate it
        next.setSeconds(next.getSeconds() + 1); // advance by 1 second
        return next; // return the new Date to setState
      });
    }, 1000); // 1000 milliseconds = 1 second
  }, []); // no dependencies – this function never changes

  // ── play ──────────────────────────────────────────────────────────────────
  // Resume the clock ticking from wherever it is now
  const play = useCallback(() => {
    setIsPlaying(true);   // mark as playing
    setIsEditing(false);  // close the edit panel if it was open
    startTicking();       // start the interval
  }, [startTicking]);

  // ── pause ─────────────────────────────────────────────────────────────────
  // Freeze the clock at the current moment
  const pause = useCallback(() => {
    setIsPlaying(false);  // mark as paused
    clearInterval(intervalRef.current ?? undefined); // stop the interval
  }, []);

  // ── openEdit ──────────────────────────────────────────────────────────────
  // Pause the clock AND open the edit panel
  const openEdit = useCallback(() => {
    clearInterval(intervalRef.current ?? undefined); // stop ticking
    setIsPlaying(false);  // mark as paused
    setIsEditing(true);   // show the edit panel
  }, []);

  // ── setManualTime ─────────────────────────────────────────────────────────
  // Called when the user types a new time in the edit panel.
  // "timeString" is in "HH:MM" format, e.g. "14:30"
  const setManualTime = useCallback((timeString: string) => {
    const [h, m] = timeString.split(":").map(Number); // split "14:30" into [14, 30]
    if (isNaN(h) || isNaN(m)) return; // ignore invalid input

    const newDate = new Date(time); // copy the current date
    newDate.setHours(h, m, 0, 0);  // set hours/minutes, reset seconds and ms to 0
    setTime(newDate);               // update the displayed time
  }, [time]);

  // ── reset ─────────────────────────────────────────────────────────────────
  // Reset the clock to the ACTUAL current time in the user's timezone
  const reset = useCallback(() => {
    setIsEditing(false); // close edit panel

    // Get the current real time as a string in the given timezone
    // Intl.DateTimeFormat is built into JavaScript and handles all timezones
    const nowStr = new Intl.DateTimeFormat("en-GB", {
      timeZone:   timezone, // e.g. "Europe/Stockholm"
      hour:       "2-digit",
      minute:     "2-digit",
      second:     "2-digit",
      hour12:     false     // use 24-hour format
    }).format(new Date()); // format the real current time

    // nowStr looks like "14:30:45" – parse it back into a Date object
    const [h, m, s] = nowStr.split(":").map(Number);
    const resetDate = new Date();
    resetDate.setHours(h, m, s, 0); // set to real current time
    setTime(resetDate);

    setIsPlaying(true); // start playing again
    startTicking();     // resume the interval
  }, [timezone, startTicking]);

  // ── Auto-start on mount ───────────────────────────────────────────────────
  // When the hook is first used, start ticking immediately
  useEffect(() => {
    startTicking();
    // Cleanup: when the component using this hook unmounts, clear the interval
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [startTicking]);

  // ── Sync time when timezone changes ──────────────────────────────────────
  // reset's identity changes whenever timezone changes (see its useCallback deps),
  // so depending on reset is equivalent to depending on timezone but correct.
  useEffect(() => {
    reset();
  }, [reset]);

  // Return everything the component needs to display and control the clock
  return {
    time,         // the current Date object to display
    isPlaying,    // whether the clock is currently ticking
    isEditing,    // whether the edit panel is open
    play,         // function to resume
    pause,        // function to freeze
    openEdit,     // function to open edit mode
    setManualTime,// function to set a specific time while editing
    reset         // function to snap back to real current time
  };
}
