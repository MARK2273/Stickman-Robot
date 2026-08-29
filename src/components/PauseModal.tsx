import React, { useEffect } from 'react';
import { Play, RotateCcw, Home, Settings, ShoppingBag, Sun, Moon } from 'lucide-react';
import { soundManager } from '../services/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenArmory: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
  isLight?: boolean;
  onToggleTheme?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenArmory,
  onOpenSettings,
  onQuitToMenu,
  isLight = false,
  onToggleTheme
}) => {
  // Close/Resume with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onResume();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  return (
    <div
      id="pause-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onResume();
      }}
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto ${
        isLight ? 'bg-slate-900/60' : 'bg-black/85'
      }`}
    >
      <div className="w-full max-w-md flex flex-col gap-2.5 my-auto">
        {/* Tactical Pause Menu Container */}
        <div className={`border rounded-3xl w-full overflow-hidden shadow-2xl p-5 sm:p-6 text-center space-y-4 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
            : 'bg-[#0c0c0e] border-white/10 text-zinc-100'
        }`}>
          {/* Title */}
          <div>
            <h2 className={`text-2xl font-black uppercase tracking-wider ${
              isLight ? 'text-slate-900' : 'text-zinc-100'
            }`}>
              TACTICAL PAUSE
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Combat paused. Select an option.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              id="pause-resume-btn"
              onClick={onResume}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-b-4 border-red-950 text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>RESUME COMBAT</span>
            </button>

            {/* Quick In-Game Screen Theme Toggle */}
            {onToggleTheme && (
              <button
                id="pause-theme-toggle-btn"
                onClick={() => {
                  soundManager.playClick();
                  onToggleTheme();
                }}
                className={`w-full py-2.5 rounded-xl transition active:scale-98 flex items-center justify-between px-3.5 cursor-pointer text-xs uppercase tracking-wider border font-bold ${
                  isLight
                    ? 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-900 border-amber-300 shadow-sm'
                    : 'bg-zinc-900/90 hover:bg-zinc-800 text-cyan-300 border-cyan-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isLight ? (
                    <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                  )}
                  <span>SCREEN THEME</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  isLight ? 'bg-amber-400 text-slate-950 font-mono' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono'
                }`}>
                  {isLight ? 'LIGHT THEME' : 'DARK OLED'}
                </span>
              </button>
            )}

            <button
              id="pause-restart-btn"
              onClick={onRestart}
              className={`w-full py-2.5 font-bold rounded-xl transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-white/10'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART WAVE</span>
            </button>

            <button
              id="pause-armory-btn"
              onClick={onOpenArmory}
              className={`w-full py-2.5 font-bold rounded-xl transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-amber-400 border-white/10'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>MILITARY ARMORY</span>
            </button>

            <button
              id="pause-settings-btn"
              onClick={onOpenSettings}
              className={`w-full py-2.5 font-bold rounded-xl transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>AUDIO & SETTINGS</span>
            </button>

            <button
              id="pause-quit-btn"
              onClick={onQuitToMenu}
              className={`w-full py-2.5 font-bold rounded-xl transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border ${
                isLight
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-black/60 hover:bg-black/90 text-rose-400 border-rose-500/20'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>ABANDON TO MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
