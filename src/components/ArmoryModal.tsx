import React, { useState, useEffect } from 'react';
import { Weapon, GearItem, PlayerStats } from '../types/game';
import { Crosshair, Shield, Zap, Flame, Sparkles, ArrowUpCircle, CheckCircle2, Lock, ShoppingBag, Eye, Target, Bomb, X, Play, RefreshCw, Layers, ChevronLeft } from 'lucide-react';
import { soundManager } from '../services/audio';

interface ArmoryModalProps {
  weapons: Weapon[];
  gear: GearItem[];
  playerStats: PlayerStats;
  equippedWeaponIds: [string, string | null];
  inBattle?: boolean;
  theme?: 'dark' | 'light';
  onEquipWeapon: (weaponId: string, slot: 0 | 1) => void;
  onUpgradeWeapon: (weaponId: string) => void;
  onBuyWeapon: (weapon: Weapon) => void;
  onEquipGear: (gearId: string) => void;
  onBuyGear: (gear: GearItem) => void;
  onResumeBattle?: () => void;
  onClose: () => void;
  onOpenFreeRewards?: () => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  weapons,
  gear,
  playerStats,
  equippedWeaponIds,
  inBattle = false,
  theme = 'dark',
  onEquipWeapon,
  onUpgradeWeapon,
  onBuyWeapon,
  onEquipGear,
  onBuyGear,
  onResumeBattle,
  onClose,
  onOpenFreeRewards
}) => {
  const isLight = theme === 'light';

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inBattle && onResumeBattle) {
          onResumeBattle();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inBattle, onResumeBattle, onClose]);

  const [activeTab, setActiveTab] = useState<'weapons' | 'gear'>('weapons');
  const [selectedWeaponType, setSelectedWeaponType] = useState<string>('all');
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(weapons[0]?.id || 'starter_pistol');
  const [selectedGearId, setSelectedGearId] = useState<string>(gear[0]?.id || 'light_kevlar');

  // Mobile specific view switching ('catalog' vs 'details')
  const [mobileWeaponView, setMobileWeaponView] = useState<'catalog' | 'details'>('catalog');
  const [mobileGearView, setMobileGearView] = useState<'catalog' | 'details'>('catalog');

  // Keep selected weapon and gear reactive
  const selectedWeapon = weapons.find((w) => w.id === selectedWeaponId) || weapons[0];
  const selectedGear = gear.find((g) => g.id === selectedGearId) || gear[0];

  const filteredWeapons = weapons.filter((w) => {
    if (selectedWeaponType === 'all') return true;
    return w.type === selectedWeaponType;
  });

  const isEquippedSlot0 = equippedWeaponIds[0] === selectedWeapon?.id;
  const isEquippedSlot1 = equippedWeaponIds[1] === selectedWeapon?.id;

  const handleSelectWeapon = (weaponId: string) => {
    soundManager.playClick();
    setSelectedWeaponId(weaponId);
    setMobileWeaponView('details');
  };

  const handleSelectGear = (gearId: string) => {
    soundManager.playClick();
    setSelectedGearId(gearId);
    setMobileGearView('details');
  };

  const handleUpgradeWeapon = () => {
    if (!selectedWeapon || !selectedWeapon.unlocked) return;
    if (playerStats.gold >= selectedWeapon.upgradeCost && selectedWeapon.level < selectedWeapon.maxLevel) {
      soundManager.playLevelUp();
      onUpgradeWeapon(selectedWeapon.id);
    }
  };

  const handleBuyWeapon = () => {
    if (!selectedWeapon || selectedWeapon.unlocked) return;
    if (playerStats.gold >= selectedWeapon.cost) {
      soundManager.playCoin();
      onBuyWeapon(selectedWeapon);
    }
  };

  const handleCloseOrResume = () => {
    if (inBattle && onResumeBattle) {
      onResumeBattle();
    } else {
      onClose();
    }
  };

  const getElementBadge = (element: string) => {
    switch (element) {
      case 'fire':
        return { label: 'FIRE', icon: '🔥', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
      case 'ice':
        return { label: 'CRYO', icon: '❄️', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 'lightning':
        return { label: 'SHOCK', icon: '⚡', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
      case 'plasma':
        return { label: 'PLASMA', icon: '🌌', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'holy':
        return { label: 'HOLY', icon: '✨', color: 'text-amber-300 bg-amber-400/10 border-amber-400/30' };
      case 'dark':
        return { label: 'VOID', icon: '🌑', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
      default:
        return { label: 'KINETIC', icon: '🎯', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' };
    }
  };

  return (
    <div
      id="armory-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseOrResume();
      }}
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 ${
        isLight ? 'bg-slate-900/60' : 'bg-black/85'
      }`}
    >
      <div
        className={`border rounded-3xl w-full max-w-6xl h-[94vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0c0c0e] border-white/15 text-zinc-100'
        }`}
      >
        {/* Top Header */}
        <div
          className={`shrink-0 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b ${
            isLight ? 'bg-white border-slate-200' : 'bg-black/70 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-2xl border ${
              isLight ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-black uppercase tracking-wide">Military Armory & Arsenal</h2>
                {inBattle && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase animate-pulse">
                    Paused
                  </span>
                )}
              </div>
              <p className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {weapons.length} Combat weapons & defense systems ready
              </p>
            </div>
          </div>

          {/* Resources Bar & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border flex items-center gap-2 sm:gap-2.5 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/60 border-white/10'
            }`}>
              <div className="flex items-center gap-1.5 text-amber-500 text-xs sm:text-sm font-bold font-mono">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full border border-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                <span>{playerStats.gold.toLocaleString()} G</span>
              </div>
              <div className={`w-[1px] h-4 hidden xs:block ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />
              <span className="text-xs sm:text-sm font-bold text-rose-500 font-mono hidden xs:inline">💎 {playerStats.rubies}</span>
            </div>

            {/* Quick Watch Ad for Free Supplies */}
            {onOpenFreeRewards && (
              <button
                id="armory-free-rewards-btn"
                onClick={() => {
                  soundManager.playClick();
                  onOpenFreeRewards();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-black text-[11px] rounded-xl transition cursor-pointer shadow-md active:scale-95 uppercase tracking-wide"
                title="Watch Ad for +5,000 Gold or +5 Gems"
              >
                <span>📺</span>
                <span>+FREE CASH</span>
              </button>
            )}

            {inBattle && (
              <button
                id="armory-resume-battle-btn"
                onClick={onResumeBattle || onClose}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition cursor-pointer border border-emerald-400/50 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                title="Resume Current Battle"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="uppercase tracking-wider">RESUME</span>
              </button>
            )}

            <button
              id="armory-close-btn"
              onClick={handleCloseOrResume}
              className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 hover:text-red-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition cursor-pointer border border-red-500/40 active:scale-95 shadow-md"
              title="Close Armory"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span className="uppercase">{inBattle ? 'BACK' : 'EXIT'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Weapons vs Gear) */}
        <div className={`shrink-0 flex items-center justify-between px-3 sm:px-6 pt-1.5 border-b ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/10'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('weapons');
                setMobileWeaponView('catalog');
              }}
              className={`px-3.5 sm:px-5 py-2 rounded-t-xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'weapons'
                  ? isLight
                    ? 'bg-white text-amber-600 border-t-2 border-amber-500 shadow-sm'
                    : 'bg-[#18181b] text-amber-400 border-t-2 border-amber-500 shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>WEAPONS ({weapons.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('gear');
                setMobileGearView('catalog');
              }}
              className={`px-3.5 sm:px-5 py-2 rounded-t-xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'gear'
                  ? isLight
                    ? 'bg-white text-cyan-600 border-t-2 border-cyan-500 shadow-sm'
                    : 'bg-[#18181b] text-cyan-400 border-t-2 border-cyan-500 shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>ARMOR & GEAR ({gear.length})</span>
            </button>
          </div>

          {/* Quick Slot Preview on Desktop */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono pb-1">
            <span className="text-zinc-400">Equipped:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              P1: {weapons.find((w) => w.id === equippedWeaponIds[0])?.name || 'Empty'}
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              P2: {weapons.find((w) => w.id === equippedWeaponIds[1])?.name || 'Empty'}
            </span>
          </div>
        </div>

        {/* Mobile View Switcher (Only visible on screens below md) */}
        {activeTab === 'weapons' ? (
          <div className={`md:hidden shrink-0 flex items-center justify-between p-1.5 border-b gap-1.5 ${
            isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-black/40 border-white/5'
          }`}>
            <button
              onClick={() => setMobileWeaponView('catalog')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                mobileWeaponView === 'catalog'
                  ? 'bg-amber-500 text-black shadow-md'
                  : isLight ? 'bg-white text-slate-700' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. Choose Weapon ({filteredWeapons.length})</span>
            </button>
            <button
              onClick={() => setMobileWeaponView('details')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                mobileWeaponView === 'details'
                  ? 'bg-amber-500 text-black shadow-md'
                  : isLight ? 'bg-white text-slate-700' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. Upgrade & Equip</span>
            </button>
          </div>
        ) : (
          <div className={`md:hidden shrink-0 flex items-center justify-between p-1.5 border-b gap-1.5 ${
            isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-black/40 border-white/5'
          }`}>
            <button
              onClick={() => setMobileGearView('catalog')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                mobileGearView === 'catalog'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : isLight ? 'bg-white text-slate-700' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. Gear Items ({gear.length})</span>
            </button>
            <button
              onClick={() => setMobileGearView('details')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
                mobileGearView === 'details'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : isLight ? 'bg-white text-slate-700' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. Armor Specs & Equip</span>
            </button>
          </div>
        )}

        {/* Modal Main Content: 50/50 Desktop Split & Dynamic Mobile Full View */}
        {activeTab === 'weapons' ? (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            {/* WEAPON CATALOG: Left 50% on Desktop, Full on Mobile when catalog view active */}
            <div className={`w-full md:w-1/2 md:border-r flex flex-col min-h-0 overflow-hidden ${
              mobileWeaponView === 'catalog' ? 'flex flex-1' : 'hidden md:flex'
            } ${isLight ? 'bg-slate-100/50 border-slate-200' : 'bg-black/30 border-white/10'}`}>
              {/* Category Filter Pills */}
              <div className={`shrink-0 p-2 sm:p-3 border-b flex items-center gap-1.5 overflow-x-auto touch-pan-x overscroll-x-contain ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/60 border-white/5'
              }`}>
                {['all', 'pistol', 'smg', 'shotgun', 'rifle', 'sniper', 'heavy', 'launcher', 'magic', 'bow'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedWeaponType(t);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase transition cursor-pointer whitespace-nowrap border ${
                      selectedWeaponType === t
                        ? 'bg-amber-500 text-black font-extrabold border-amber-400 shadow-sm'
                        : isLight
                        ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 border-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Weapons List Grid (Touch Scrollable) */}
              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-2.5 sm:p-3 grid grid-cols-2 gap-2"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {filteredWeapons.map((weapon) => {
                  const isUnlocked = weapon.unlocked;
                  const isSelected = selectedWeapon?.id === weapon.id;
                  const isEquippedPrimary = equippedWeaponIds[0] === weapon.id;
                  const isEquippedSecondary = equippedWeaponIds[1] === weapon.id;
                  const elemBadge = getElementBadge(weapon.element);

                  return (
                    <div
                      key={weapon.id}
                      onClick={() => handleSelectWeapon(weapon.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative select-none ${
                        isSelected
                          ? isLight
                            ? 'border-amber-500 bg-white shadow-md ring-2 ring-amber-400/40 scale-[1.01]'
                            : 'border-amber-500 bg-zinc-900 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-[1.01]'
                          : !isUnlocked
                          ? isLight ? 'border-slate-200 bg-slate-200/50 opacity-60' : 'border-white/5 bg-black/50 opacity-60'
                          : isLight
                          ? 'border-slate-200 bg-white hover:border-slate-300'
                          : 'border-white/5 bg-zinc-900/50 hover:border-white/15'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/30 font-mono uppercase">
                          T{weapon.tier}
                        </span>

                        <div className="flex items-center gap-1">
                          {isEquippedPrimary && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-500 text-black rounded font-mono">
                              P1
                            </span>
                          )}
                          {isEquippedSecondary && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 bg-cyan-500 text-black rounded font-mono">
                              P2
                            </span>
                          )}
                          {!isUnlocked && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-red-500/20 text-red-400 rounded flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Weapon Name */}
                      <div className="my-0.5">
                        <h4 className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                          {weapon.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <span className="capitalize">{weapon.type}</span>
                          <span>•</span>
                          <span className={elemBadge.color}>{elemBadge.icon} {elemBadge.label}</span>
                        </div>
                      </div>

                      {/* Bottom Damage / Cost */}
                      <div className={`mt-1.5 pt-1.5 border-t flex items-center justify-between text-[10px] font-mono ${
                        isLight ? 'border-slate-200' : 'border-white/5'
                      }`}>
                        <span className="text-red-500 font-bold">DMG {weapon.damage}</span>
                        {isUnlocked ? (
                          <span className="text-amber-500 font-bold">LV.{weapon.level}</span>
                        ) : (
                          <span className="text-amber-500 font-bold">💰 {weapon.cost.toLocaleString()}G</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WEAPON DETAILS: Right 50% on Desktop, Full on Mobile when details view active */}
            <div className={`w-full md:w-1/2 flex flex-col justify-between min-h-0 overflow-y-auto p-3.5 sm:p-6 ${
              mobileWeaponView === 'details' ? 'flex flex-1' : 'hidden md:flex'
            } ${isLight ? 'bg-white' : 'bg-black/60'}`}>
              {/* Mobile Back Button */}
              <div className="flex md:hidden items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
                <button
                  onClick={() => setMobileWeaponView('catalog')}
                  className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-400 py-1 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Weapons List</span>
                </button>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Weapon Blueprint</span>
              </div>

              {selectedWeapon && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Top Weapon Identity & Tier */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          getElementBadge(selectedWeapon.element).color
                        }`}>
                          {getElementBadge(selectedWeapon.element).icon} Tier {selectedWeapon.tier} {selectedWeapon.type}
                        </span>
                        {isEquippedSlot0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500 text-black font-mono">
                            PRIMARY (P1)
                          </span>
                        )}
                        {isEquippedSlot1 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-cyan-500 text-black font-mono">
                            SECONDARY (P2)
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg sm:text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                        {selectedWeapon.name}
                      </h3>
                    </div>

                    {selectedWeapon.unlocked ? (
                      <span className="text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-xl font-mono shrink-0">
                        LV. {selectedWeapon.level} / {selectedWeapon.maxLevel}
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl font-mono flex items-center gap-1 shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>

                  {/* Weapon Description & Special Elemental Perk */}
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                    {selectedWeapon.description}
                  </p>

                  {selectedWeapon.specialEffect && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                      isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
                    }`}>
                      <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span><strong>Perk:</strong> {selectedWeapon.specialEffect}</span>
                    </div>
                  )}

                  {/* Detailed Gun Stat Bars */}
                  <div className="space-y-2 font-mono text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Damage Output</span>
                        <span className="font-bold text-red-500">{selectedWeapon.damage} DPS</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
                        <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.min(100, (selectedWeapon.damage / 300) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Fire Rate</span>
                        <span className="font-bold text-amber-500">{selectedWeapon.fireRate} shots/sec</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
                        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${Math.min(100, (selectedWeapon.fireRate / 14) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Magazine Capacity</span>
                        <span className="font-bold text-cyan-500">{selectedWeapon.magazineSize} rounds</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
                        <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${Math.min(100, (selectedWeapon.magazineSize / 100) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Reload Speed</span>
                        <span className="font-bold text-emerald-500">{selectedWeapon.reloadTime}s</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, (1 - selectedWeapon.reloadTime / 3) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>Critical Strike</span>
                        <span className="font-bold text-purple-500">{Math.round(selectedWeapon.critChance * 100)}% ({selectedWeapon.critMultiplier}x)</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
                        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${Math.min(100, (selectedWeapon.critChance / 0.5) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons: Unlock / Upgrade / Equip P1 & P2 */}
              <div className={`pt-3 sm:pt-4 border-t space-y-2.5 mt-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                {!selectedWeapon.unlocked ? (
                  /* Unlock Weapon Button */
                  <div className="space-y-1.5">
                    <button
                      id="buy-weapon-btn"
                      onClick={handleBuyWeapon}
                      disabled={playerStats.gold < selectedWeapon.cost}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 border-b-4 border-amber-700 disabled:opacity-40 text-black font-black rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                    >
                      <Lock className="w-4 h-4 text-black" />
                      <span>
                        {playerStats.gold < selectedWeapon.cost
                          ? `NEED ${(selectedWeapon.cost - playerStats.gold).toLocaleString()} MORE GOLD`
                          : `UNLOCK WEAPON (${selectedWeapon.cost.toLocaleString()} G)`}
                      </span>
                    </button>
                    <p className={`text-[10px] text-center ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                      Unlock weapon to equip in Primary (P1) or Secondary (P2) slots.
                    </p>
                  </div>
                ) : (
                  /* Upgrade & Equip Controls */
                  <div className="space-y-2">
                    <button
                      id="upgrade-weapon-btn"
                      onClick={handleUpgradeWeapon}
                      disabled={selectedWeapon.level >= selectedWeapon.maxLevel || playerStats.gold < selectedWeapon.upgradeCost}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border-b-4 border-red-950 disabled:opacity-40 text-white font-black rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>
                        {selectedWeapon.level >= selectedWeapon.maxLevel
                          ? 'MAX LEVEL REACHED'
                          : `UPGRADE TO LV.${selectedWeapon.level + 1} (${selectedWeapon.upgradeCost.toLocaleString()} G)`}
                      </span>
                    </button>

                    {/* Dual Equip Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="equip-p1-btn"
                        onClick={() => onEquipWeapon(selectedWeapon.id, 0)}
                        className={`py-2 px-2 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                          isEquippedSlot0
                            ? 'bg-amber-500 text-black border-amber-400 shadow-md ring-2 ring-amber-400/40'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEquippedSlot0 ? 'EQUIPPED (P1)' : 'EQUIP P1'}</span>
                      </button>

                      <button
                        id="equip-p2-btn"
                        onClick={() => onEquipWeapon(selectedWeapon.id, 1)}
                        className={`py-2 px-2 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                          isEquippedSlot1
                            ? 'bg-cyan-500 text-black border-cyan-400 shadow-md ring-2 ring-cyan-400/40'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEquippedSlot1 ? 'EQUIPPED (P2)' : 'EQUIP P2'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* GEAR TAB: 50/50 Desktop Split & Mobile Responsive View */
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            {/* GEAR LIST: Left 50% on Desktop, Full on Mobile when catalog view active */}
            <div className={`w-full md:w-1/2 md:border-r p-3 overflow-y-auto space-y-2 min-h-0 ${
              mobileGearView === 'catalog' ? 'flex-1' : 'hidden md:block'
            } ${isLight ? 'bg-slate-100/50 border-slate-200' : 'bg-black/30 border-white/10'}`}>
              {gear.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectGear(item.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedGear?.id === item.id
                      ? isLight
                        ? 'border-cyan-500 bg-white shadow-md ring-2 ring-cyan-400/40'
                        : 'border-cyan-500 bg-zinc-900 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : isLight
                      ? 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-white/5 bg-zinc-900/40 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl border border-cyan-500/20">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>{item.name}</h4>
                      <p className="text-[10px] text-zinc-400 capitalize">{item.type} • Tier {item.tier}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {item.equipped ? (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-cyan-500 text-black rounded">
                        EQUIPPED
                      </span>
                    ) : item.unlocked ? (
                      <span className="text-[10px] text-zinc-400 font-bold">READY</span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-bold font-mono">💰 {item.cost.toLocaleString()} G</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* GEAR DETAIL: Right 50% on Desktop, Full on Mobile when details view active */}
            <div className={`w-full md:w-1/2 flex flex-col justify-between min-h-0 overflow-y-auto p-3.5 sm:p-6 ${
              mobileGearView === 'details' ? 'flex flex-1' : 'hidden md:flex'
            } ${isLight ? 'bg-white' : 'bg-black/60'}`}>
              {/* Mobile Back to Gear List */}
              <div className="flex md:hidden items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
                <button
                  onClick={() => setMobileGearView('catalog')}
                  className="flex items-center gap-1 text-xs font-bold text-cyan-500 hover:text-cyan-400 py-1 px-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Gear List</span>
                </button>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Armor Spec</span>
              </div>

              {selectedGear && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                      {selectedGear.type} • Tier {selectedGear.tier}
                    </span>
                    <h3 className={`text-lg sm:text-xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                      {selectedGear.name}
                    </h3>
                  </div>

                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                    {selectedGear.description}
                  </p>

                  {/* Stat Bonuses */}
                  <div className="space-y-2 font-mono text-xs">
                    {selectedGear.hpBonus > 0 && (
                      <div className={`flex justify-between p-2 rounded-lg border ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-white/5'
                      }`}>
                        <span>Max HP Bonus</span>
                        <span className="text-emerald-500 font-bold">+{selectedGear.hpBonus} HP</span>
                      </div>
                    )}
                    {selectedGear.defBonus > 0 && (
                      <div className={`flex justify-between p-2 rounded-lg border ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-white/5'
                      }`}>
                        <span>Defense Bonus</span>
                        <span className="text-cyan-500 font-bold">+{selectedGear.defBonus} DEF</span>
                      </div>
                    )}
                    {selectedGear.speedBonus > 0 && (
                      <div className={`flex justify-between p-2 rounded-lg border ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-white/5'
                      }`}>
                        <span>Move Speed</span>
                        <span className="text-amber-500 font-bold">+{selectedGear.speedBonus} SPD</span>
                      </div>
                    )}
                    {selectedGear.critBonus > 0 && (
                      <div className={`flex justify-between p-2 rounded-lg border ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-white/5'
                      }`}>
                        <span>Critical Strike</span>
                        <span className="text-purple-500 font-bold">+{Math.round(selectedGear.critBonus * 100)}% CRIT</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gear Action Button */}
              <div className={`pt-3 sm:pt-4 border-t mt-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                {selectedGear.unlocked ? (
                  <button
                    onClick={() => onEquipGear(selectedGear.id)}
                    className={`w-full py-3 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                      selectedGear.equipped
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{selectedGear.equipped ? 'CURRENTLY EQUIPPED' : 'EQUIP GEAR'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onBuyGear(selectedGear)}
                    disabled={playerStats.gold < selectedGear.cost}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border-b-4 border-red-950 disabled:opacity-40 text-white font-black rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>PURCHASE GEAR ({selectedGear.cost.toLocaleString()} G)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
