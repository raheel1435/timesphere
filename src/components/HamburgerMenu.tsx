// ─────────────────────────────────────────────────────────────────────────────
// src/components/HamburgerMenu.tsx
//
// Top-left hamburger (☰) menu that opens a side drawer with:
//   • Login / user info section
//   • Links to Settings, Calendar, Time Diff Calculator, Tools
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { FiMenu, FiX, FiUser, FiSettings, FiCalendar, FiClock, FiLogOut, FiCloud, FiImage } from "react-icons/fi";
import { MdInstallMobile } from "react-icons/md";
import type { User } from "firebase/auth";   // type-only import
import type { UserProfile } from "../types"; // type-only import

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  user:               User | null;
  profile:            UserProfile | null;
  onOpenAuth:         () => void;
  onOpenSettings:     () => void;
  onOpenCalendar:     () => void;
  onOpenTimeDiff:     () => void;
  onOpenWeather:      () => void;
  onOpenBackground:   () => void;
  onLogout:           () => void;
  canInstall:         boolean;
  onInstall:          () => void;
}

export default function HamburgerMenu({
  user, onOpenAuth, onOpenSettings, onOpenCalendar, onOpenTimeDiff,
  onOpenWeather, onOpenBackground, onLogout, canInstall, onInstall
}: Props) {

  // "isOpen" controls whether the drawer is visible
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Close the drawer and call an action
  function handleAction(fn: () => void) {
    setIsOpen(false); // close the menu
    fn();             // run the action (e.g. open settings)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Hamburger toggle button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}             // toggle open/close
        className="p-2.5 rounded-xl glass-card text-white hover:bg-white/20 transition-all z-50"
        aria-label="Open menu"
      >
        {/* Show X when open, ☰ when closed */}
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[998] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Side drawer ── */}
      <div
        className={`fixed top-0 left-0 h-full w-64 glass-card z-[999] flex flex-col p-5 gap-4
          transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        // translate-x-0 = visible, -translate-x-full = hidden off-screen to the left
      >
        {/* ── App title ── */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">TimeSphere</h2>
            <p className="text-white/40 text-xs">All-in-One Clock</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}         // X button to close
            className="text-white/50 hover:text-white transition-all"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-white/10" />

        {/* ── User section ── */}
        {user ? (
          // LOGGED IN: show user info + logout button
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {/* Profile picture (from Google) or default avatar */}
              {user.photoURL ? (
                <img src={user.photoURL} alt="profile" className="w-9 h-9 rounded-full" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <FiUser size={18} className="text-white/70" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                {/* Display name or phone number */}
                <span className="text-white text-sm font-semibold truncate">
                  {user.displayName ?? user.phoneNumber ?? "User"}
                </span>
                {/* Email if available */}
                {user.email && (
                  <span className="text-white/50 text-xs truncate">{user.email}</span>
                )}
              </div>
            </div>
            {/* Logout button */}
            <button
              onClick={() => handleAction(onLogout)}
              className="flex items-center gap-2 text-red-400/80 hover:text-red-400 text-sm mt-1 transition-all"
            >
              <FiLogOut size={14} /> Log out
            </button>
          </div>
        ) : (
          // NOT LOGGED IN: show login button
          <button
            onClick={() => handleAction(onOpenAuth)}  // open the auth modal
            className="flex items-center gap-2 px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-semibold transition-all"
          >
            <FiUser size={16} />
            Log in / Sign up
          </button>
        )}

        {/* ── Divider ── */}
        <div className="h-px bg-white/10" />

        {/* ── Navigation links ── */}
        <nav className="flex flex-col gap-1">

          {/* Settings */}
          <button
            onClick={() => handleAction(onOpenSettings)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-white/15 hover:text-white text-sm font-medium transition-all text-left"
          >
            <FiSettings size={16} /> Settings
          </button>

          {/* Background */}
          <button
            onClick={() => handleAction(onOpenBackground)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-white/15 hover:text-white text-sm font-medium transition-all text-left"
          >
            <FiImage size={16} /> Background
          </button>

          {/* Weather Details */}
          <button
            onClick={() => handleAction(onOpenWeather)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-white/15 hover:text-white text-sm font-medium transition-all text-left"
          >
            <FiCloud size={16} /> Weather Details
          </button>

          {/* Calendar */}
          <button
            onClick={() => handleAction(onOpenCalendar)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-white/15 hover:text-white text-sm font-medium transition-all text-left"
          >
            <FiCalendar size={16} /> Calendar
          </button>

          {/* Time Difference Calculator */}
          <button
            onClick={() => handleAction(onOpenTimeDiff)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:bg-white/15 hover:text-white text-sm font-medium transition-all text-left"
          >
            <FiClock size={16} /> Time Difference
          </button>

          {/* Install App — only shown when browser supports it */}
          {canInstall && (
            <button
              onClick={() => handleAction(onInstall)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-300/90 hover:bg-white/15 hover:text-emerald-200 text-sm font-medium transition-all text-left"
            >
              <MdInstallMobile size={16} /> Install App
            </button>
          )}
        </nav>

        {/* ── Bottom: version info ── */}
        <div className="mt-auto text-white/20 text-xs text-center">
          TimeSphere v1.0 {/* app version shown at the bottom of the drawer */}
        </div>
      </div>
    </>
  );
}
