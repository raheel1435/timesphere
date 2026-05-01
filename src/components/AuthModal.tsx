import { useState } from "react";
import { FiX, FiPhone } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

interface Props {
  onClose:       () => void;
  onGoogle:      () => void;
  sendSmsCode:   (phone: string, containerId: string) => Promise<boolean>;
  verifySmsCode: (code: string) => Promise<boolean>;
  authError:     string | null;
}

export default function AuthModal({ onClose, onGoogle, sendSmsCode, verifySmsCode, authError }: Props) {
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState<"login" | "phone" | "otp">("login");
  const [phone,   setPhone]   = useState("");
  const [otp,     setOtp]     = useState("");

  function handleGoogle() {
    setLoading(true);
    onGoogle();
    onClose();
  }

  async function handleSendSms() {
    if (!phone.trim()) return;
    setLoading(true);
    const ok = await sendSmsCode(phone.trim(), "recaptcha-container");
    setLoading(false);
    if (ok) setStep("otp");
  }

  async function handleVerifyOtp() {
    if (otp.length < 6) return;
    setLoading(true);
    const ok = await verifySmsCode(otp.trim());
    setLoading(false);
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      {/* Invisible reCAPTCHA container — Firebase requires this element but shows nothing */}
      <div id="recaptcha-container" className="hidden" />

      <div className="glass-card w-full max-w-xs p-6 fade-in-up">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">
            {step === "otp" ? "Enter Code" : "Log in to TimeSphere"}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-all">
            <FiX size={18} />
          </button>
        </div>

        {step === "login" && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 rounded-xl font-semibold text-sm hover:bg-gray-100 disabled:opacity-60 transition-all"
            >
              <FcGoogle size={20} />
              {loading ? "Signing in…" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-xs">or</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <button
              onClick={() => setStep("phone")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm transition-all"
            >
              <FiPhone size={15} />
              Continue with Phone
            </button>
          </div>
        )}

        {step === "phone" && (
          <div className="flex flex-col gap-3">
            <p className="text-white/60 text-xs">Include country code, e.g. +46701234567</p>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendSms()}
              placeholder="+1 234 567 8900"
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/50 text-sm"
            />
            <button
              onClick={handleSendSms}
              disabled={loading || !phone.trim()}
              className="w-full py-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-all"
            >
              {loading ? "Sending…" : "Send Code"}
            </button>
            <button
              onClick={() => setStep("login")}
              className="text-white/40 text-xs text-center hover:text-white/70 transition-all"
            >
              ← Back
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="flex flex-col gap-3">
            <p className="text-white/60 text-xs">6-digit code sent to {phone}</p>
            <input
              type="number"
              value={otp}
              onChange={e => setOtp(e.target.value.slice(0, 6))}
              onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
              placeholder="123456"
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/50 text-lg text-center tracking-widest font-bold"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full py-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-all"
            >
              {loading ? "Verifying…" : "Verify Code"}
            </button>
            <button
              onClick={() => { setStep("phone"); setOtp(""); }}
              className="text-white/40 text-xs text-center hover:text-white/70 transition-all"
            >
              ← Change number
            </button>
          </div>
        )}

        {authError && (
          <p className="text-red-400 text-xs text-center mt-3">{authError}</p>
        )}

        <p className="text-white/20 text-xs text-center mt-4">
          Your data is stored securely. No spam, ever.
        </p>
      </div>
    </div>
  );
}
