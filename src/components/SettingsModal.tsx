import React, { useEffect } from 'react';
import { GameSettings } from '../types/game';
import { Settings, Volume2, Music, Zap, Eye, Smartphone, Keyboard, X, Check, Sun, Moon, Palette, DollarSign } from 'lucide-react';
import { soundManager } from '../services/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
  onOpenMonetization?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onOpenMonetization
}) => {
  const isLight = settings.theme === 'light';

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSoundToggle = () => {
    const next = !settings.soundEnabled;
    onUpdateSettings({ soundEnabled: next });
    soundManager.setSoundSettings(next, settings.soundVolume);
  };

  const handleMusicToggle = () => {
    const next = !settings.musicEnabled;
    onUpdateSettings({ musicEnabled: next });
    soundManager.setMusicSettings(next, settings.musicVolume);
  };

  const handleThemeToggle = (theme: 'dark' | 'light') => {
    soundManager.playClick();
    onUpdateSettings({ theme });
  };

  return (
    <div
      id="settings-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 ${
        isLight ? 'bg-slate-900/60' : 'bg-black/85'
      }`}
    >
      <div
        className={`border rounded-3xl w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-900'
            : 'bg-[#0c0c0e] border-white/15 text-zinc-100'
        }`}
      >
        {/* Sticky Header with prominent Exit / Close Button */}
        <div
          className={`shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${
            isLight ? 'bg-white border-slate-200' : 'bg-black/80 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-2xl border ${
              isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-white/5 text-zinc-200 border-white/10'
            }`}>
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-wide">Settings & Controls</h2>
              <p className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Theme appearance, audio, visual performance, and ads
              </p>
            </div>
          </div>

          {/* Top-Right Exit Button */}
          <button
            id="settings-header-close-btn"
            onClick={onClose}
            className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 hover:text-red-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition cursor-pointer border border-red-500/40 active:scale-95 shadow-md"
            title="Exit Settings (ESC)"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span className="tracking-wider uppercase">EXIT</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4">
          {/* Theme Display (White Screen vs Dark Screen) */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 sm:space-y-3 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/5'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`}>
              <Palette className="w-4 h-4 text-cyan-500" />
              <span>Theme Appearance (White Screen / Dark Screen)</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              <button
                onClick={() => handleThemeToggle('light')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-center gap-2.5 font-black text-xs uppercase ${
                  isLight
                    ? 'bg-amber-500 text-black border-amber-600 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>WHITE / LIGHT SCREEN</span>
              </button>

              <button
                onClick={() => handleThemeToggle('dark')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-center gap-2.5 font-black text-xs uppercase ${
                  !isLight
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-md ring-2 ring-cyan-400/40'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Moon className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span>DARK OLED SCREEN</span>
              </button>
            </div>
          </div>

          {/* Audio Master Controls */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 sm:space-y-3 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/5'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Audio & Soundtrack
            </h3>

            {/* Sound FX */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Gunfire & Weapon Sound FX</span>
              </div>
              <button
                onClick={handleSoundToggle}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  settings.soundEnabled
                    ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : isLight
                    ? 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                {settings.soundEnabled ? 'ON' : 'MUTED'}
              </button>
            </div>

            {/* Music */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                <Music className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Battle Synth Background Music</span>
              </div>
              <button
                onClick={handleMusicToggle}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  settings.musicEnabled
                    ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : isLight
                    ? 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                {settings.musicEnabled ? 'ON' : 'MUTED'}
              </button>
            </div>
          </div>

          {/* Google & Unity Ads Monetization Section */}
          {onOpenMonetization && (
            <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2 ${
              isLight ? 'bg-amber-50/60 border-amber-200 shadow-sm' : 'bg-amber-950/20 border-amber-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Google & Unity Ads Monetization
                  </h3>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenMonetization();
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-[11px] rounded-lg shadow-sm transition active:scale-95 cursor-pointer uppercase"
                >
                  Configure Ads
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                Connect your Google AdSense Publisher ID (ca-pub-XXXXXXXX) to earn real money from live game ads.
              </p>
            </div>
          )}

          {/* Visual Effects */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 sm:space-y-3 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/5'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Visuals & Performance
            </h3>

            {/* Screen Shake */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                <span>Dynamic Screen Shake</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ screenShake: !settings.screenShake })}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  settings.screenShake
                    ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : isLight
                    ? 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                {settings.screenShake ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Blood / Sparks */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                <Eye className="w-4 h-4 text-red-500 shrink-0" />
                <span>Robot Sparks & Splatter Particles</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ bloodEffects: !settings.bloodEffects })}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  settings.bloodEffects
                    ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : isLight
                    ? 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                {settings.bloodEffects ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Progressive Web App / Offline Installation */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 sm:space-y-3 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/5'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>Progressive Web App (PWA)</span>
                </h3>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  Install as a standalone native app with offline caching and high-speed local assets.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-mono font-bold shrink-0">
                OFFLINE READY
              </span>
            </div>
          </div>

          {/* Control Scheme / Touch Settings */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 sm:space-y-3 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/5'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Controls & Mobile Touch
            </h3>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>On-Screen Touch Buttons (D-Pad, Jump, Shoot)</span>
              </div>
              <button
                onClick={() => onUpdateSettings({
                  controlScheme: settings.controlScheme === 'touch' ? 'mouse_keyboard' : 'touch'
                })}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  settings.controlScheme === 'touch'
                    ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : isLight
                    ? 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                {settings.controlScheme === 'touch' ? 'ENABLED' : 'AUTO / OFF'}
              </button>
            </div>
          </div>

          {/* Control Guide */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border space-y-2 text-xs ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/5'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`}>
              <Keyboard className="w-4 h-4 text-cyan-500" />
              <span>Keyboard & Mouse Shortcuts</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 font-mono pt-1">
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/50 border-white/5 text-zinc-300'}`}>
                <span className="text-amber-500 font-bold">A / D</span> - Run Left / Right
              </div>
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/50 border-white/5 text-zinc-300'}`}>
                <span className="text-amber-500 font-bold">W / Space</span> - Jump
              </div>
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/50 border-white/5 text-zinc-300'}`}>
                <span className="text-amber-500 font-bold">S / Shift</span> - Tactical Roll / Dash
              </div>
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/50 border-white/5 text-zinc-300'}`}>
                <span className="text-amber-500 font-bold">Mouse + Click</span> - 360° Shoot
              </div>
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/50 border-white/5 text-zinc-300'}`}>
                <span className="text-amber-500 font-bold">R</span> - Reload Magazine
              </div>
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/50 border-white/5 text-zinc-300'}`}>
                <span className="text-amber-500 font-bold">Q / E / F</span> - Cast Hero Skills
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div
          className={`shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t flex items-center justify-between gap-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-black/80 border-white/10'
          }`}
        >
          <span className={`text-[11px] font-mono hidden sm:inline ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
            Settings save automatically
          </span>
          <button
            id="settings-footer-exit-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs rounded-xl transition cursor-pointer border-b-2 border-red-950 active:scale-95 shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>EXIT & RETURN TO GAME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
