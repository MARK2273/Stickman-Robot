import React, { useState, useEffect } from 'react';
import { HeroData, PlayerStats } from '../types/game';
import { CheckCircle2, Lock, Shield, Sparkles, Target, Zap, UserCheck, Bomb, Flame, Sun, Wind, Cpu, Heart, X, ArrowUpCircle, ChevronRight, Award } from 'lucide-react';
import { soundManager } from '../services/audio';

interface HeroSelectModalProps {
  heroes: HeroData[];
  selectedHeroId: string;
  playerStats: PlayerStats;
  theme?: 'dark' | 'light';
  onSelectHero: (heroId: string) => void;
  onUnlockHero: (hero: HeroData) => void;
  onUpgradeHero?: (heroId: string) => void;
  onUpgradeHeroSkill?: (heroId: string, skillId: string) => void;
  onClose: () => void;
}

export const HeroSelectModal: React.FC<HeroSelectModalProps> = ({
  heroes,
  selectedHeroId,
  playerStats,
  theme = 'dark',
  onSelectHero,
  onUnlockHero,
  onUpgradeHero,
  onUpgradeHeroSkill,
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

  const [selectedHero, setSelectedHero] = useState<HeroData>(
    heroes.find((h) => h.id === selectedHeroId) || heroes[0]
  );

  // Keep selectedHero reference synced with updated heroes prop
  useEffect(() => {
    const found = heroes.find((h) => h.id === selectedHero.id);
    if (found) {
      setSelectedHero(found);
    }
  }, [heroes]);

  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'upgrades'>('overview');

  const getSkillIcon = (icon: string) => {
    switch (icon) {
      case 'Bomb': return <Bomb className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'Sun': return <Sun className="w-4 h-4" />;
      case 'Wind': return <Wind className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Heart': return <Heart className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleUnlock = () => {
    if (playerStats.gold >= selectedHero.cost) {
      soundManager.playCoin();
      onUnlockHero(selectedHero);
    }
  };

  const handleChoose = () => {
    soundManager.playSkill();
    onSelectHero(selectedHero.id);
    onClose();
  };

  const heroLevel = selectedHero.level || 1;
  const maxHeroLevel = selectedHero.maxLevel || 20;
  const heroUpgradeCost = selectedHero.upgradeCost || Math.round(500 * Math.pow(1.3, heroLevel - 1));

  const handleLevelUpHero = () => {
    if (onUpgradeHero && heroLevel < maxHeroLevel && playerStats.gold >= heroUpgradeCost) {
      soundManager.playLevelUp();
      onUpgradeHero(selectedHero.id);
    }
  };

  // Stat growth calculations per level
  const currentHp = selectedHero.baseHp + (heroLevel - 1) * 25;
  const nextHp = currentHp + 25;
  const currentDef = selectedHero.baseDef + (heroLevel - 1) * 2;
  const nextDef = currentDef + 2;
  const currentSpeed = selectedHero.baseSpeed + (heroLevel - 1) * 4;
  const nextSpeed = currentSpeed + 4;
  const currentMana = selectedHero.baseMana + (heroLevel - 1) * 8;
  const nextMana = currentMana + 8;
  const currentCrit = (selectedHero.baseCrit + (heroLevel - 1) * 0.01) * 100;
  const nextCrit = currentCrit + 1;

  return (
    <div
      id="hero-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 ${
        isLight ? 'bg-slate-900/60' : 'bg-black/85'
      }`}
    >
      <div
        className={`border rounded-3xl w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-900'
            : 'bg-[#0c0c0e] border-white/10 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div
          className={`shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${
            isLight ? 'bg-white border-slate-200' : 'bg-black/70 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-2xl border ${isLight ? 'bg-cyan-50 text-cyan-600 border-cyan-200' : 'bg-white/5 text-cyan-400 border-white/10'}`}>
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-wide">Hero Barracks & Upgrades</h2>
              <p className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Upgrade stickman combat specialists, empower elemental skills, and switch classes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border font-mono text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                isLight ? 'bg-slate-100 text-amber-600 border-slate-300' : 'bg-black/60 text-amber-400 border-white/10'
              }`}
            >
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full border border-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              <span>{playerStats.gold.toLocaleString()} G</span>
            </div>
            <button
              id="hero-modal-close-btn"
              onClick={onClose}
              className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 hover:text-red-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition cursor-pointer border border-red-500/40 active:scale-95 shadow-md"
              title="Close Hero Selection"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span className="uppercase">EXIT</span>
            </button>
          </div>
        </div>

        {/* Hero Grid & Details */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Class List */}
          <div className={`col-span-5 sm:col-span-4 border-r p-3 sm:p-4 space-y-2.5 overflow-y-auto ${isLight ? 'border-slate-200 bg-white/70' : 'border-white/10 bg-black/30'}`}>
            {heroes.map((hero) => {
              const isSelected = selectedHero.id === hero.id;
              const isCurrentEquipped = selectedHeroId === hero.id;
              const hLevel = hero.level || 1;

              return (
                <div
                  key={hero.id}
                  onClick={() => setSelectedHero(hero)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? isLight
                        ? 'border-cyan-500 bg-cyan-50/80 shadow-md ring-1 ring-cyan-500/30'
                        : 'border-cyan-500 bg-zinc-900 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : isLight
                      ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-100'
                      : 'border-white/5 bg-zinc-900/40 hover:border-white/15 hover:bg-zinc-900/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow border border-white/20 shrink-0"
                      style={{ backgroundColor: hero.color }}
                    >
                      <span className="text-xs uppercase font-black">{hero.name.substring(0, 2)}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm truncate">{hero.name}</h4>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono font-semibold">
                        <span className="text-cyan-500">LV.{hLevel}</span>
                        <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>•</span>
                        <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>{hero.title.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isCurrentEquipped ? (
                      <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 bg-cyan-500/20 text-cyan-500 border border-cyan-500/40 rounded-lg">
                        ACTIVE
                      </span>
                    ) : hero.unlocked ? (
                      <span className={`text-[9px] sm:text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>READY</span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-amber-500">💰 {hero.cost} G</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hero Detail & Upgrade View */}
          <div className={`col-span-7 sm:col-span-8 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto ${isLight ? 'bg-slate-100/60' : 'bg-black/50'}`}>
            <div>
              {/* Hero Banner with Level & Upgrade Stats */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: selectedHero.color }}>
                      {selectedHero.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      selectedHero.unlocked
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                    }`}>
                      {selectedHero.unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black">{selectedHero.name}</h3>
                </div>

                {/* Hero Level Badge */}
                <div className={`px-3 py-1.5 rounded-2xl border flex flex-col items-center shrink-0 ${
                  isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-zinc-900 border-white/10 shadow-lg'
                }`}>
                  <span className="text-[8px] uppercase tracking-widest font-extrabold text-cyan-500">HERO LEVEL</span>
                  <span className="text-sm sm:text-base font-black font-mono">LV.{heroLevel} <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>/ {maxHeroLevel}</span></span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>{selectedHero.description}</p>

              {/* Navigation Tabs (Overview / Skills / Level Upgrades) */}
              <div className={`flex border-b mb-4 gap-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 px-3 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-cyan-500 text-cyan-500'
                      : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Stats & Level Up
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`pb-2 px-3 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer border-b-2 ${
                    activeTab === 'skills'
                      ? 'border-cyan-500 text-cyan-500'
                      : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Skills & EMP Abilities
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Hero Level Upgrade Action Box */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/90 border-white/10'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-black uppercase flex items-center gap-1.5">
                          <ArrowUpCircle className="w-4 h-4 text-cyan-500" />
                          <span>Upgrade Hero Attributes (Level {heroLevel} ➔ {heroLevel < maxHeroLevel ? heroLevel + 1 : 'MAX'})</span>
                        </h4>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          Boosts Max HP, Defense, Sprint Speed, Mana Capacity, and Crit Chance.
                        </p>
                      </div>

                      {selectedHero.unlocked && heroLevel < maxHeroLevel && (
                        <button
                          onClick={handleLevelUpHero}
                          disabled={playerStats.gold < heroUpgradeCost}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5 uppercase shrink-0"
                        >
                          <Award className="w-4 h-4" />
                          <span>UPGRADE (💰 {heroUpgradeCost.toLocaleString()} G)</span>
                        </button>
                      )}
                    </div>

                    {/* Stats Comparison Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                      {/* HP */}
                      <div className={`p-2.5 rounded-xl border flex flex-col ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}>
                        <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Max Health:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-red-500 font-bold">{currentHp} HP</span>
                          {heroLevel < maxHeroLevel && (
                            <span className="text-emerald-500 font-bold text-[11px]">➔ {nextHp}</span>
                          )}
                        </div>
                      </div>

                      {/* DEF */}
                      <div className={`p-2.5 rounded-xl border flex flex-col ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}>
                        <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Defense Rating:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-emerald-500 font-bold">{currentDef} DEF</span>
                          {heroLevel < maxHeroLevel && (
                            <span className="text-emerald-500 font-bold text-[11px]">➔ {nextDef}</span>
                          )}
                        </div>
                      </div>

                      {/* SPEED */}
                      <div className={`p-2.5 rounded-xl border flex flex-col ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}>
                        <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Move Speed:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-amber-500 font-bold">{currentSpeed}</span>
                          {heroLevel < maxHeroLevel && (
                            <span className="text-emerald-500 font-bold text-[11px]">➔ {nextSpeed}</span>
                          )}
                        </div>
                      </div>

                      {/* MANA */}
                      <div className={`p-2.5 rounded-xl border flex flex-col ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}>
                        <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Max Mana:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-cyan-500 font-bold">{currentMana} MP</span>
                          {heroLevel < maxHeroLevel && (
                            <span className="text-emerald-500 font-bold text-[11px]">➔ {nextMana}</span>
                          )}
                        </div>
                      </div>

                      {/* CRIT */}
                      <div className={`p-2.5 rounded-xl border flex flex-col ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}>
                        <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Crit Strike:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-rose-500 font-bold">{currentCrit.toFixed(1)}%</span>
                          {heroLevel < maxHeroLevel && (
                            <span className="text-emerald-500 font-bold text-[11px]">➔ {nextCrit.toFixed(1)}%</span>
                          )}
                        </div>
                      </div>

                      {/* Headgear */}
                      <div className={`p-2.5 rounded-xl border flex flex-col ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}>
                        <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Tactical Headgear:</span>
                        <span className="font-bold text-cyan-500 uppercase mt-0.5 text-[11px]">{selectedHero.headGearType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-2.5">
                  {selectedHero.skills.map((skill) => {
                    const skLevel = skill.level || 1;
                    const skMax = skill.maxLevel || 5;
                    const skUpgradeCost = skill.upgradeCost || (300 * skLevel);

                    return (
                      <div
                        key={skill.id}
                        className={`p-3 rounded-2xl border flex items-start justify-between gap-3 ${
                          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/90 border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl mt-0.5 border shrink-0 ${
                            isLight ? 'bg-cyan-50 text-cyan-600 border-cyan-200' : 'bg-zinc-800 text-cyan-400 border-white/10'
                          }`}>
                            {getSkillIcon(skill.icon)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs sm:text-sm">{skill.name}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-zinc-300'
                              }`}>
                                {skill.key} KEY • {skill.cooldown}s CD
                              </span>
                              <span className="text-[10px] font-mono font-bold text-cyan-500">
                                LV.{skLevel}/{skMax}
                              </span>
                            </div>
                            <p className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>{skill.description}</p>
                          </div>
                        </div>

                        {selectedHero.unlocked && onUpgradeHeroSkill && skLevel < skMax && (
                          <button
                            onClick={() => {
                              if (playerStats.gold >= skUpgradeCost) {
                                soundManager.playLevelUp();
                                onUpgradeHeroSkill(selectedHero.id, skill.id);
                              }
                            }}
                            disabled={playerStats.gold < skUpgradeCost}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-black font-black text-[10px] sm:text-xs rounded-xl shadow transition active:scale-95 cursor-pointer uppercase shrink-0"
                          >
                            +LVL (💰 {skUpgradeCost} G)
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Action Button */}
            <div className={`pt-4 border-t mt-4 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              {selectedHero.unlocked ? (
                <button
                  onClick={handleChoose}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-b-4 border-red-950 text-white font-black rounded-2xl shadow-[0_10px_25px_rgba(220,38,38,0.3)] transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>DEPLOY AS {selectedHero.name.toUpperCase()} (LV.{heroLevel})</span>
                </button>
              ) : (
                <button
                  onClick={handleUnlock}
                  disabled={playerStats.gold < selectedHero.cost}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-black font-black rounded-2xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm"
                >
                  <Lock className="w-5 h-5" />
                  <span>UNLOCK HERO CLASS ({selectedHero.cost.toLocaleString()} G)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
