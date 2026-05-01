import { useState, useRef, useEffect } from "react";
import { FiX, FiUpload, FiCheck, FiTrash2 } from "react-icons/fi";
import type { AppTheme } from "../types";
import {
  loadCustomImages, saveCustomImage, deleteCustomImage,
  unsplashUrl, fetchNasaImages, fetchUnsplashThumb
} from "../utils/backgroundImages";

interface Props {
  currentTheme: AppTheme;
  onSelect:     (theme: AppTheme) => void;
  onClose:      () => void;
}

export default function BackgroundPicker({ currentTheme, onSelect, onClose }: Props) {
  const [selected,     setSelected]     = useState<AppTheme>(currentTheme);
  const [customs,      setCustoms]      = useState<string[]>(loadCustomImages);
  const [uploading,    setUploading]    = useState(false);
  const [nasaPreview,  setNasaPreview]  = useState(unsplashUrl("galaxy nebula cosmos", 3));
  const [autoPreview,  setAutoPreview]  = useState(unsplashUrl("blue sky clouds nature", 1));
  const [darkPreview,  setDarkPreview]  = useState(unsplashUrl("dark night cityscape",   5));
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNasaImages().then(imgs => { if (imgs.length > 0) setNasaPreview(imgs[0]); });
    fetchUnsplashThumb("clear blue sky sunny clouds landscape").then(u => { if (u) setAutoPreview(u); });
    fetchUnsplashThumb("dark night cityscape city lights").then(u => { if (u) setDarkPreview(u); });
  }, []);

  const THEMES: { value: AppTheme; label: string; emoji: string; preview: string }[] = [
    { value: "auto",   label: "Auto Sky",    emoji: "🌤",  preview: autoPreview },
    { value: "space",  label: "Space",       emoji: "🌌",  preview: nasaPreview },
    { value: "dark",   label: "Always Dark", emoji: "🌙",  preview: darkPreview },
    { value: "custom", label: "My Photos",   emoji: "📷",  preview: "" },
  ];

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      saveCustomImage(b64);
      setCustoms(loadCustomImages());
      setSelected("custom");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function removeCustom(i: number) {
    deleteCustomImage(i);
    setCustoms(loadCustomImages());
  }

  function apply() {
    onSelect(selected);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-4 px-4">
      <div className="glass-card w-full max-w-sm p-5 fade-in-up my-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">🖼 Background</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-all">
            <FiX size={18} />
          </button>
        </div>

        {/* Theme grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {THEMES.map(t => (
            <button
              key={t.value}
              onClick={() => setSelected(t.value)}
              className={`relative rounded-xl overflow-hidden h-24 flex items-end p-2 transition-all border-2 ${
                selected === t.value ? "border-blue-400" : "border-transparent"
              }`}
            >
              {/* Preview image */}
              {t.value === "custom" ? (
                customs[0]
                  ? <img src={customs[0]} alt="custom" className="absolute inset-0 w-full h-full object-cover" />
                  : <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-3xl">📷</div>
              ) : (
                <img
                  src={t.preview}
                  alt={t.label}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="absolute inset-0 bg-black/30" />

              {/* Label */}
              <div className="relative z-10 flex items-center gap-1.5 bg-black/50 rounded-lg px-2 py-0.5">
                <span className="text-sm">{t.emoji}</span>
                <span className="text-white text-xs font-semibold">{t.label}</span>
                {selected === t.value && <FiCheck size={11} className="text-blue-400 ml-1" />}
              </div>
            </button>
          ))}
        </div>

        {/* Upload section */}
        <div className="border-t border-white/10 pt-4 mb-4">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
          >
            <FiUpload size={14} />
            {uploading ? "Uploading…" : "Upload Your Own Image"}
          </button>

          {/* Custom image thumbnails */}
          {customs.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {customs.map((img, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={img}
                    alt={`custom ${i+1}`}
                    className={`w-14 h-14 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                      selected === "custom" ? "border-blue-400" : "border-transparent"
                    }`}
                    onClick={() => setSelected("custom")}
                  />
                  <button
                    onClick={() => removeCustom(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <FiTrash2 size={9} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-white/40 text-xs text-center mb-3">
          Images change automatically every minute
        </p>

        <button
          onClick={apply}
          className="w-full py-3 bg-blue-500/80 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
        >
          Apply Background
        </button>
      </div>
    </div>
  );
}
