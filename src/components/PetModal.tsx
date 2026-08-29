import React, { useState } from 'react';
import { Pet, PlayerStats } from '../types/game';
import { soundManager } from '../services/audio';
import {
  X,
  Sparkles,
  Shield,
  Zap,
  Crosshair,
  Flame,
  Check,
  Lock,
  ChevronUp,
  Heart,
  Sword,
  Radio,
  HelpCircle,
  Gem
} from 'lucide-react';

interface PetModalProps {
  pets: Pet[];
  equippedPetId: string | null;
  playerStats: PlayerStats;
  theme?: 'dark' | 'light';
  onEquipPet: (petId: string | null) => void;
  onUnlockPet: (pet: Pet) => void;
  onUpgradePet: (petId: string) => void;
  onClose: () => void;
}

export const PetModal: React.FC<PetModalProps> = ({
  pets,
  equippedPetId,
  playerStats,
  theme = 'dark',
  onEquipPet,
  onUnlockPet,
  onUpgradePet,
  onClose
}) => {
  const [selectedPetId, setSelectedPetId] = useState<string>(equippedPetId || pets[0]?.id || 'cyber_dog');
  const isLight = theme === 'light';

  const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0];
  const isEquipped = equippedPetId === selectedPet?.id;

  const canUnlock = selectedPet && !selectedPet.unlocked && playerStats.rubies >= selectedPet.costRubies;
  const canUpgrade =
    selectedPet &&
    selectedPet.unlocked &&
    selectedPet.level < selectedPet.maxLevel &&
    playerStats.rubies >= selectedPet.upgradeCostRubies;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div
        id="pet-modal-container"
        className={`relative w-full max-w-4xl h-[92vh] max-h-[720px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-slate-400/50'
            : 'bg-[#0f172a] border-white/10 text-zinc-100 shadow-black/80'
        }`}
      >
        {/* HEADER */}
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-xl shadow-lg">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                  CYBER PET SANCTUM
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  GEMS ONLY 💎
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Invulnerable combat companions • Upgrade with Gems for massive HP & Damage buffs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Player Rubies / Gems counter */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border font-mono font-bold text-xs shadow-inner ${
                isLight
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
              }`}
            >
              <Gem className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{playerStats.rubies} GEMS</span>
            </div>

            <button
              id="close-pet-modal-btn"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className={`p-2 rounded-xl border transition cursor-pointer active:scale-95 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY (Split: Left Grid Selector, Right Details Card) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT LIST: PET GRID */}
          <div
            className={`w-full md:w-5/12 p-3 sm:p-4 overflow-y-auto border-b md:border-b-0 md:border-r space-y-2.5 ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/40 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-1">
              <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>SELECT COMPANION</span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>{pets.length} AVAILABLE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2.5">
              {pets.map((pet) => {
                const isSelected = selectedPetId === pet.id;
                const isCurrentEquipped = equippedPetId === pet.id;

                return (
                  <button
                    key={pet.id}
                    id={`pet-select-${pet.id}`}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedPetId(pet.id);
                    }}
                    className={`relative p-3 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer group active:scale-98 ${
                      isSelected
                        ? isLight
                          ? 'bg-white border-rose-500 shadow-md ring-2 ring-rose-500/20'
                          : 'bg-slate-800/90 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                        : isLight
                        ? 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Pet Icon with glowing aura */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner border"
                        style={{
                          backgroundColor: `${pet.color}20`,
                          borderColor: `${pet.color}50`
                        }}
                      >
                        {pet.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm tracking-tight">{pet.name}</h4>
                          {isCurrentEquipped && (
                            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> ACTIVE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs font-mono">
                          {pet.unlocked ? (
                            <span className="text-amber-500 font-bold">LV.{pet.level}</span>
                          ) : (
                            <span className="text-rose-500 flex items-center gap-1 font-bold">
                              <Lock className="w-3 h-3" /> {pet.costRubies} 💎
                            </span>
                          )}
                          <span className={isLight ? 'text-slate-300' : 'text-zinc-600'}>•</span>
                          <span className="text-cyan-400 font-bold">{pet.damage} DMG</span>
                        </div>
                      </div>
                    </div>

                    {/* Attack Type badge */}
                    <div className="text-right shrink-0">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          pet.attackType.includes('aoe')
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        {pet.attackType.includes('aoe') ? 'AOE BLAST' : 'MELEE'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT DETAIL CARD: ACTIVE SELECTED PET STATS & ACTIONS */}
          <div
            className={`w-full md:w-7/12 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between ${
              isLight ? 'bg-white' : 'bg-slate-900/60'
            }`}
          >
            {selectedPet && (
              <div className="space-y-4">
                {/* Pet Hero Banner */}
                <div
                  className="p-4 sm:p-5 rounded-3xl border relative overflow-hidden flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
                  style={{
                    backgroundColor: `${selectedPet.color}10`,
                    borderColor: `${selectedPet.color}40`
                  }}
                >
                  {/* Glowing Icon Showcase */}
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shrink-0 border"
                    style={{
                      backgroundColor: `${selectedPet.color}25`,
                      borderColor: selectedPet.color
                    }}
                  >
                    {selectedPet.icon}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl font-black">{selectedPet.name}</h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase border"
                        style={{
                          backgroundColor: `${selectedPet.color}20`,
                          color: selectedPet.color,
                          borderColor: `${selectedPet.color}50`
                        }}
                      >
                        TIER {selectedPet.tier} • {selectedPet.species.toUpperCase()}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                      {selectedPet.description}
                    </p>

                    {/* Invulnerability Guarantee */}
                    <div className="pt-1 flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-bold text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Never Dies • Permanent Companion on Battlefield</span>
                    </div>
                  </div>
                </div>

                {/* PASSIVE PLAYER BUFFS (Guaranteed Health & Damage Boosts) */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    EQUIPPED BUFFS TO STICKMAN HERO
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div
                      className={`p-3 rounded-2xl border flex items-center gap-3 ${
                        isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/30 border-emerald-500/30'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 fill-emerald-500" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-emerald-500 block">MAX HEALTH</span>
                        <span className="text-base font-black font-mono text-emerald-400">
                          +{selectedPet.playerHpBonusPercent}% HP
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-2xl border flex items-center gap-3 ${
                        isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/30 border-rose-500/30'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <Sword className="w-5 h-5 fill-rose-500" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-rose-500 block">GUN DAMAGE</span>
                        <span className="text-base font-black font-mono text-rose-400">
                          +{selectedPet.playerDamageBonusPercent}% DMG
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PET COMBAT STATS */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    PET COMBAT CAPABILITIES
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    {/* Pet Separate Damage */}
                    <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                      <span className={`text-[10px] font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                        PET ATTACK DMG
                      </span>
                      <span className="text-sm font-black text-amber-400">{selectedPet.damage}</span>
                    </div>

                    {/* Attack Range */}
                    <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                      <span className={`text-[10px] font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                        ATTACK RANGE
                      </span>
                      <span className="text-sm font-black text-cyan-400">
                        {selectedPet.attackRange} px {selectedPet.attackRange >= 500 ? '(Far Distance)' : '(Melee)'}
                      </span>
                    </div>

                    {/* Attack Rate */}
                    <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                      <span className={`text-[10px] font-bold block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                        STRIKE COOLDOWN
                      </span>
                      <span className="text-sm font-black text-purple-400">{selectedPet.attackRate}s</span>
                    </div>
                  </div>

                  {/* Special Trait Description */}
                  <div
                    className={`p-3 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                      isLight
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black uppercase text-[10px] block mb-0.5">TACTICAL PROFILE</span>
                      {selectedPet.specialTrait}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION FOOTER BAR */}
            <div className={`pt-4 mt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
              isLight ? 'border-slate-200' : 'border-white/10'
            }`}>
              {/* Upgrade Button (Gems Only) */}
              {selectedPet?.unlocked && (
                <button
                  id="upgrade-pet-btn"
                  disabled={!canUpgrade}
                  onClick={() => {
                    if (canUpgrade) {
                      soundManager.playPetUpgrade();
                      onUpgradePet(selectedPet.id);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border shadow-lg ${
                    canUpgrade
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-400 active:scale-95 shadow-amber-500/30'
                      : 'bg-white/5 text-zinc-500 border-white/5 cursor-not-allowed'
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                  {selectedPet.level >= selectedPet.maxLevel ? (
                    <span>MAX LEVEL (10)</span>
                  ) : (
                    <span>
                      UPGRADE LV.{selectedPet.level + 1} ({selectedPet.upgradeCostRubies} 💎)
                    </span>
                  )}
                </button>
              )}

              {/* Equip / Unequip OR Unlock Button */}
              {selectedPet?.unlocked ? (
                <button
                  id="equip-pet-btn"
                  onClick={() => {
                    soundManager.playSkill();
                    onEquipPet(isEquipped ? null : selectedPet.id);
                  }}
                  className={`px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border shadow-lg active:scale-95 ${
                    isEquipped
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 shadow-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-emerald-500/30'
                  }`}
                >
                  {isEquipped ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>UNEQUIP COMPANION</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>EQUIP TO BATTLE</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  id="unlock-pet-btn"
                  disabled={!canUnlock}
                  onClick={() => {
                    if (canUnlock) {
                      soundManager.playPetUpgrade();
                      onUnlockPet(selectedPet);
                    }
                  }}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer border shadow-lg ${
                    canUnlock
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white border-rose-400 active:scale-95 shadow-rose-500/30'
                      : 'bg-white/5 text-zinc-500 border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>UNLOCK PET ({selectedPet.costRubies} GEMS 💎)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
