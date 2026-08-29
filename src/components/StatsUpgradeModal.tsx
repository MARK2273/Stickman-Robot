import React, { useEffect } from 'react';
import { PlayerStats } from '../types/game';
import { Shield, Zap, Heart, Sparkles, Plus, Award, Swords, X, Check } from 'lucide-react';
import { soundManager } from '../services/audio';

interface StatsUpgradeModalProps {
  playerStats: PlayerStats;
  theme?: 'dark' | 'light';
  onAllocateStat: (statKey: 'strength' | 'vitality' | 'agility' | 'intellect' | 'defense') => void;
  onClose: () => void;
}

export const StatsUpgradeModal: React.FC<StatsUpgradeModalProps> = ({
  playerStats,
  theme = 'dark',
  onAllocateStat,
  onClose
}) => {
  const isLight = theme === 'light';

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const expPercent = Math.min(100, (playerStats.exp / playerStats.maxExp) * 100);

  const handleStatClick = (statKey: 'strength' | 'vitality' | 'agility' | 'intellect' | 'defense') => {
    if (playerStats.statPoints > 0) {
      soundManager.playLevelUp();
      onAllocateStat(statKey);
    }
  };

  const statItems = [
    {
      key: 'strength' as const,
      name: 'Strength (ATK)',
      value: playerStats.strength,
      bonusText: `+${playerStats.strength * 4}% Weapon Damage Output`,
      desc: 'Amplifies all physical, explosive, and projectile weapon damage.',
      icon: <Swords className="w-5 h-5 text-red-500" />,
      color: 'red'
    },
    {
      key: 'vitality' as const,
      name: 'Vitality (HP)',
      value: playerStats.vitality,
      bonusText: `+${playerStats.vitality * 15} Max Health Points`,
      desc: 'Increases maximum survivability and resistance to lethal burst damage.',
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      color: 'rose'
    },
    {
      key: 'agility' as const,
      name: 'Agility (SPD & CRIT)',
      value: playerStats.agility,
      bonusText: `+${playerStats.agility * 8} Movement Speed, +${(playerStats.agility * 1.5).toFixed(1)}% Critical Rate`,
      desc: 'Enhances sprint speed, tactical roll recovery, and critical strike frequency.',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      color: 'amber'
    },
    {
      key: 'intellect' as const,
      name: 'Intellect (MANA & SKILL)',
      value: playerStats.intellect,
      bonusText: `+${playerStats.intellect * 10} Mana, +${playerStats.intellect * 2}% Faster Skill Cooldowns`,
      desc: 'Empowers magic reserves and reduces recharge timers on active combat skills.',
      icon: <Sparkles className="w-5 h-5 text-cyan-500" />,
      color: 'cyan'
    },
    {
      key: 'defense' as const,
      name: 'Defense (ARMOR)',
      value: playerStats.defense,
      bonusText: `+${playerStats.defense * 2} Armor Rating (Mitigates incoming damage)`,
      desc: 'Provides flat and percentage damage reduction against hostile projectiles.',
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      color: 'emerald'
    }
  ];

  return (
    <div
      id="stats-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 ${
        isLight ? 'bg-slate-900/60' : 'bg-black/85'
      }`}
    >
      <div
        className={`border rounded-3xl w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-900'
            : 'bg-[#0c0c0e] border-white/10 text-zinc-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${
            isLight ? 'bg-white border-slate-200' : 'bg-black/70 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-2xl border ${
              isLight ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-white/5 text-purple-400 border-white/10'
            }`}>
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-wide">Hero Attributes & Skill Points</h2>
              <p className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Allocate unspent stat points to empower your stickman
              </p>
            </div>
          </div>

          <button
            id="stats-close-btn"
            onClick={onClose}
            className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 hover:text-red-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition cursor-pointer border border-red-500/40 active:scale-95 shadow-md"
            title="Exit Stats"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span className="uppercase">EXIT</span>
          </button>
        </div>

        {/* Level & Points Banner */}
        <div
          className={`shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between gap-3 ${
            isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-black/40 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-red-600 to-red-800 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-lg sm:text-xl flex flex-col items-center justify-center shadow-lg shadow-red-900/30 border border-red-500/30 shrink-0">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold leading-none text-red-200">LVL</span>
              <span>{playerStats.level}</span>
            </div>

            <div>
              <div className={`flex justify-between text-[11px] sm:text-xs font-mono mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                <span>EXPERIENCE</span>
                <span className="text-amber-500 font-bold">{playerStats.exp} / {playerStats.maxExp}</span>
              </div>
              <div className={`w-36 sm:w-64 h-2 sm:h-2.5 rounded-full overflow-hidden border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-zinc-900 border-white/10'}`}>
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`text-[9px] sm:text-[10px] uppercase font-bold block tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              AVAILABLE
            </span>
            <span className={`text-xl sm:text-2xl font-black font-mono ${playerStats.statPoints > 0 ? 'text-amber-500 animate-pulse' : isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
              {playerStats.statPoints} PTS
            </span>
          </div>
        </div>

        {/* Stat Attributes List */}
        <div className={`flex-1 min-h-0 p-3.5 sm:p-6 space-y-2.5 sm:space-y-3 overflow-y-auto ${isLight ? 'bg-slate-100/40' : ''}`}>
          {statItems.map((stat) => (
            <div
              key={stat.key}
              className={`p-3 sm:p-4 rounded-2xl border flex items-center justify-between transition gap-2 ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                  : 'bg-zinc-900/40 border-white/5 hover:border-white/15 hover:bg-zinc-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
                }`}>
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm truncate">{stat.name}</h4>
                    <span className={`text-[10px] sm:text-xs font-mono font-bold shrink-0 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      LV.{stat.value}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-emerald-500 font-semibold mt-0.5 truncate">{stat.bonusText}</p>
                  <p className={`text-[10px] sm:text-[11px] mt-0.5 hidden xs:block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{stat.desc}</p>
                </div>
              </div>

              <button
                onClick={() => handleStatClick(stat.key)}
                disabled={playerStats.statPoints <= 0}
                className="p-2 sm:p-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-30 text-white font-black rounded-xl transition cursor-pointer shadow-lg active:scale-95 flex items-center gap-1 border-b-2 border-red-950 shrink-0"
                title="Upgrade Stat"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs font-black">+1</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t flex justify-end ${
            isLight ? 'bg-white border-slate-200' : 'bg-black/70 border-white/10'
          }`}
        >
          <button
            id="stats-footer-confirm-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs rounded-xl transition cursor-pointer border-b-2 border-red-950 active:scale-95 shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>CONFIRM & RETURN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
