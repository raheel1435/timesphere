import { useState, useEffect } from "react";
import { MdInstallMobile, MdClose, MdPhoneIphone } from "react-icons/md";

const DISMISSED_KEY = "ts_install_dismissed";
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches
  || ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

interface Props {
  canInstall: boolean;
  onInstall: () => Promise<boolean>;
}

export default function InstallPrompt({ canInstall, onInstall }: Props) {
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    const timer = setTimeout(() => {
      if (canInstall || isIOS) setVisible(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [canInstall]);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  async function handleInstall() {
    if (isIOS) { setShowIOSGuide(true); return; }
    const accepted = await onInstall();
    if (accepted) setVisible(false);
  }

  if (isInStandaloneMode || (!visible && !showIOSGuide)) return null;

  return (
    <>
      {/* ── iOS step-by-step guide ── */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <MdPhoneIphone size={20} /> Install on iPhone / iPad
              </div>
              <button onClick={() => { setShowIOSGuide(false); dismiss(); }} className="text-white/50 hover:text-white">
                <MdClose size={20} />
              </button>
            </div>
            <ol className="flex flex-col gap-3 text-white/80 text-sm">
              <li className="flex gap-3 items-start">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-white text-xs">1</span>
                Tap the <strong className="text-white">Share</strong> button (box with arrow) at the bottom of Safari
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-white text-xs">2</span>
                Scroll down and tap <strong className="text-white">Add to Home Screen</strong>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-white text-xs">3</span>
                Tap <strong className="text-white">Add</strong> — TimeSphere will appear on your home screen as a full-screen app
              </li>
            </ol>
            <p className="text-white/40 text-xs text-center">
              Opens full-screen with no browser bar, just like a native app.
            </p>
          </div>
        </div>
      )}

      {/* ── Install banner (Android / desktop) ── */}
      {visible && !showIOSGuide && (
        <div className="fixed bottom-24 left-3 right-3 z-[200] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
          <div className="bg-white/15 rounded-xl p-2 flex-shrink-0">
            <MdInstallMobile className="text-white" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight">Install TimeSphere</p>
            <p className="text-white/55 text-xs mt-0.5 leading-tight">
              {isIOS ? "Add to Home Screen for full-screen mode" : "Add to home screen — works offline too"}
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="bg-white/25 hover:bg-white/35 active:bg-white/40 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex-shrink-0"
          >
            Install
          </button>
          <button onClick={dismiss} className="text-white/40 hover:text-white/80 transition-all flex-shrink-0">
            <MdClose size={18} />
          </button>
        </div>
      )}
    </>
  );
}
