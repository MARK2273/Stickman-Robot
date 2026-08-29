import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, ArrowRight, ShoppingBag, Skull, Star } from 'lucide-react';
import { soundManager } from '../services/audio';

interface VictoryDefeatModalProps {
  isVictory: boolean;
  stageName: string;
  loot: { gold: number; rubies: number; exp: number };
  onRetry: () => void;
  onNextStage?: () => void;
  onOpenArmory: () => void;
  isLight?: boolean;
}

export const VictoryDefeatModal: React.FC<VictoryDefeatModalProps> = ({
  isVictory,
  stageName,
  loot,
  onRetry,
  onNextStage,
  onOpenArmory,
  isLight = false
}) => {
  useEffect(() => {
    if (isVictory) {
      soundManager.playLevelUp();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback safe
      }
    } else {
      soundManager.playHit();
    }
  }, [isVictory]);

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${
      isLight ? 'bg-slate-900/60' : 'bg-black/80'
    }`}>
      <div className={`border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-center p-6 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
          : 'bg-[#0c0c0e] border-white/10 text-zinc-100'
      }`}>
        {/* Victory or Defeat Icon */}
        <div className="flex justify-center mb-3">
          {isVictory ? (
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-bounce">
              <Award className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
              <Skull className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-black uppercase tracking-wider mb-1 ${
          isLight ? 'text-slate-900' : 'text-zinc-100'
        }`}>
          {isVictory ? 'MISSION ACCOMPLISHED!' : 'KIA - MISSION FAILED'}
        </h2>
        <p className={`text-xs mb-5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{stageName}</p>

        {/* Victory Stars */}
        {isVictory && (
          <div className="flex justify-center items-center gap-2 mb-5">
            {[1, 2, 3].map((s) => (
              <Star key={s} className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            ))}
          </div>
        )}

        {/* Loot Breakdown */}
        <div className={`p-4 rounded-2xl border space-y-2 mb-6 font-mono text-sm ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/50 border-white/5'
        }`}>
          <div className={`flex justify-between items-center ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
            <span>Gold Bounty:</span>
            <span className="text-amber-500 font-bold">+{loot.gold.toLocaleString()} G</span>
          </div>
          <div className={`flex justify-between items-center ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
            <span>Rubies:</span>
            <span className="text-rose-500 font-bold">+{loot.rubies} 💎</span>
          </div>
          <div className={`flex justify-between items-center ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
            <span>Experience:</span>
            <span className="text-cyan-600 font-bold">+{loot.exp} EXP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {isVictory && onNextStage && (
            <button
              onClick={onNextStage}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-b-4 border-red-950 text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
            >
              <span>DEPLOY NEXT MISSION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRetry}
            className={`w-full py-3 font-bold rounded-2xl transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-white/10'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY MISSION</span>
          </button>

          <button
            onClick={onOpenArmory}
            className={`w-full py-2.5 font-bold rounded-2xl transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300'
                : 'bg-black/60 hover:bg-black/90 text-amber-400 border-white/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>VISIT MILITARY ARMORY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
