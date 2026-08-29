import React, { useState } from 'react';
import { Calendar, CheckCircle2, Sparkles, Film, X, Gift, Clock, Award } from 'lucide-react';
import { soundManager } from '../services/audio';

export interface DailyBonusReward {
  day: number;
  gold: number;
  rubies: number;
  title: string;
  icon: string;
  isGrandPrize?: boolean;
}

export const DAILY_REWARDS: DailyBonusReward[] = [
  { day: 1, gold: 1500, rubies: 0, title: 'Day 1 Supply', icon: '💰' },
  { day: 2, gold: 0, rubies: 10, title: 'Day 2 Gems', icon: '💎' },
  { day: 3, gold: 3000, rubies: 5, title: 'Day 3 Cache', icon: '🎁' },
  { day: 4, gold: 5000, rubies: 15, title: 'Day 4 Arsenal', icon: '⚡' },
  { day: 5, gold: 8000, rubies: 25, title: 'Day 5 Cyber Core', icon: '🛡️' },
  { day: 6, gold: 12000, rubies: 40, title: 'Day 6 Nanite Vault', icon: '🔮' },
  { day: 7, gold: 25000, rubies: 100, title: 'Grand Apex Jackpot!', icon: '👑', isGrandPrize: true }
];

interface DailyBonusModalProps {
  currentDay: number; // 1 to 7
  hasClaimedToday: boolean;
  onClaim: (multiplier: 1 | 2) => void;
  onClose: () => void;
  isLight?: boolean;
}

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({
  currentDay,
  hasClaimedToday,
  onClaim,
  onClose,
  isLight = false
}) => {
  const activeReward = DAILY_REWARDS.find((r) => r.day === currentDay) || DAILY_REWARDS[0];

  return (
    <div
      id="daily-bonus-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col gap-4 ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-900'
            : 'bg-[#0b0f19] border-white/15 text-zinc-100'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-3 border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
                DAILY SIGN-IN REWARDS
              </h2>
              <p className="text-xs opacity-70">
                Log in daily to unlock escalating bounties. Watch an ad to get 2X Double rewards!
              </p>
            </div>
          </div>

          <button
            id="close-daily-bonus-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-white/10 hover:bg-white/10 transition cursor-pointer text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Day Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-2.5 my-1">
          {DAILY_REWARDS.map((reward) => {
            const isPastClaimed = reward.day < currentDay || (reward.day === currentDay && hasClaimedToday);
            const isToday = reward.day === currentDay;
            const isLocked = reward.day > currentDay;

            return (
              <div
                key={reward.day}
                className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border text-center transition ${
                  isToday && !hasClaimedToday
                    ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105 z-10 animate-pulse'
                    : isPastClaimed
                    ? isLight
                      ? 'border-emerald-300 bg-emerald-50 opacity-90'
                      : 'border-emerald-500/30 bg-emerald-950/20 opacity-80'
                    : isLight
                    ? 'border-slate-200 bg-white/60 opacity-60'
                    : 'border-white/5 bg-black/40 opacity-60'
                } ${reward.isGrandPrize ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                {/* Day Tag */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">
                    DAY {reward.day}
                  </span>
                  {isPastClaimed && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  {isToday && !hasClaimedToday && (
                    <span className="text-[8px] bg-amber-500 text-black font-black px-1 rounded-sm uppercase">
                      READY
                    </span>
                  )}
                </div>

                {/* Reward Icon */}
                <div className="text-2xl sm:text-3xl my-1 drop-shadow-sm">
                  {reward.icon}
                </div>

                {/* Reward Value Breakdown */}
                <div className="w-full font-mono text-[11px] font-bold space-y-0.5 mt-1">
                  {reward.gold > 0 && (
                    <div className="text-amber-400 truncate">+{reward.gold.toLocaleString()} G</div>
                  )}
                  {reward.rubies > 0 && (
                    <div className="text-rose-400 truncate">+{reward.rubies} 💎</div>
                  )}
                </div>

                {reward.isGrandPrize && (
                  <div className="mt-1 text-[8px] bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase">
                    JACKPOT
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Today's Active Claim Showcase & Action Area */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isLight
              ? 'bg-amber-50/80 border-amber-200'
              : 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-black/60 border-amber-500/30'
          }`}
        >
          <div className="flex items-center gap-3 text-left">
            <div className="text-3xl sm:text-4xl">{activeReward.icon}</div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase">
                  Day {currentDay} Bonus
                </span>
                {hasClaimedToday && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Claimed for Today!
                  </span>
                )}
              </div>
              <div className="text-sm font-black mt-0.5">
                {activeReward.gold > 0 && <span className="text-amber-400">+{activeReward.gold.toLocaleString()} Gold </span>}
                {activeReward.rubies > 0 && <span className="text-rose-400">+{activeReward.rubies} Gems</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasClaimedToday ? (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono bg-black/40 px-4 py-2.5 rounded-xl border border-white/10">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Next reward opens tomorrow!</span>
              </div>
            ) : (
              <>
                {/* Regular 1X Claim */}
                <button
                  id="daily-claim-1x-btn"
                  onClick={() => {
                    soundManager.playCoin();
                    onClaim(1);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl font-black text-xs transition active:scale-95 cursor-pointer border ${
                    isLight
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                      : 'bg-white/10 hover:bg-white/20 text-zinc-200 border-white/10'
                  }`}
                >
                  Claim 1X
                </button>

                {/* 2X Double Bonus With Ad */}
                <button
                  id="daily-claim-2x-ad-btn"
                  onClick={() => {
                    soundManager.playClick();
                    onClaim(2);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.4)] transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wide animate-pulse"
                >
                  <Film className="w-4 h-4" />
                  <span>WATCH AD (2X DOUBLE REWARD!)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
