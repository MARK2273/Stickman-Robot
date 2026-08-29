import React from 'react';
import { Film, Sparkles, X, Gift, Coins, Gem } from 'lucide-react';
import { soundManager } from '../services/audio';

interface FreeRewardsModalProps {
  onWatchAdForGold: () => void;
  onWatchAdForGems: () => void;
  onClose: () => void;
  isLight?: boolean;
}

export const FreeRewardsModal: React.FC<FreeRewardsModalProps> = ({
  onWatchAdForGold,
  onWatchAdForGems,
  onClose,
  isLight = false
}) => {
  return (
    <div
      id="free-rewards-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 select-none"
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col gap-4 ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-900'
            : 'bg-[#0b0f19] border-white/15 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
                FREE SUPPLY AIRDROP
              </h2>
              <p className="text-xs opacity-70">
                Watch sponsored video broadcasts to claim free money and gems anytime!
              </p>
            </div>
          </div>

          <button
            id="close-free-rewards-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-white/10 hover:bg-white/10 transition cursor-pointer text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2 Reward Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
          {/* Card 1: 5,000 Money */}
          <div
            className={`p-4 rounded-2xl border flex flex-col justify-between items-center text-center gap-3 transition ${
              isLight
                ? 'bg-amber-50 border-amber-200 shadow-sm'
                : 'bg-amber-950/20 border-amber-500/30 shadow-lg'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
              💰
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                INSTANT CASH
              </span>
              <h3 className="text-xl font-black text-amber-500 mt-0.5">
                +5,000 GOLD
              </h3>
              <p className="text-[11px] opacity-70 mt-1">
                Purchase high-tier firearms, armor parts, and skill upgrades.
              </p>
            </div>

            <button
              id="watch-ad-gold-btn"
              onClick={() => {
                soundManager.playClick();
                onWatchAdForGold();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black rounded-xl shadow-[0_4px_12px_rgba(245,158,11,0.35)] transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wide"
            >
              <Film className="w-4 h-4" />
              <span>WATCH AD (+5,000 G)</span>
            </button>
          </div>

          {/* Card 2: 5 Gems */}
          <div
            className={`p-4 rounded-2xl border flex flex-col justify-between items-center text-center gap-3 transition ${
              isLight
                ? 'bg-rose-50 border-rose-200 shadow-sm'
                : 'bg-rose-950/20 border-rose-500/30 shadow-lg'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-3xl shadow-inner">
              💎
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block">
                PREMIUM GEMS
              </span>
              <h3 className="text-xl font-black text-rose-500 mt-0.5">
                +5 GEMS (RUBIES)
              </h3>
              <p className="text-[11px] opacity-70 mt-1">
                Unlock robotic pet companions, mecha dragons, and elite augments.
              </p>
            </div>

            <button
              id="watch-ad-gems-btn"
              onClick={() => {
                soundManager.playClick();
                onWatchAdForGems();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white font-black rounded-xl shadow-[0_4px_12px_rgba(225,29,72,0.35)] transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wide"
            >
              <Film className="w-4 h-4" />
              <span>WATCH AD (+5 GEMS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
