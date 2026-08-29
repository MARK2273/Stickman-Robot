import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Stage } from '../types/game';
import { MapPin, Star, Play, Lock, ChevronRight, Zap, Target, X, ChevronDown, ChevronUp } from 'lucide-react';
import { soundManager } from '../services/audio';
import { getStageMapFeatures } from '../utils/terrain';

interface StageSelectModalProps {
  stages: Stage[];
  selectedStageId: number;
  theme?: 'dark' | 'light';
  onSelectStage: (stage: Stage) => void;
  onClose: () => void;
}

const SECTOR_DATA = [
  { id: 'all', name: 'All 50 Stages', range: '1 - 50', icon: '🌐' },
  { id: 1, name: 'S1: Scrap Foundry', range: '1 - 5', icon: '🏭' },
  { id: 2, name: 'S2: Neon Metropolis', range: '6 - 10', icon: '🌆' },
  { id: 3, name: 'S3: Reactor Core', range: '11 - 15', icon: '☢️' },
  { id: 4, name: 'S4: Bio-Mech Lab', range: '16 - 20', icon: '🧬' },
  { id: 5, name: 'S5: Magma Crucible', range: '21 - 25', icon: '🌋' },
  { id: 6, name: 'S6: Cryo Citadel', range: '26 - 30', icon: '❄️' },
  { id: 7, name: 'S7: Orbital Skyhook', range: '31 - 35', icon: '🛰️' },
  { id: 8, name: 'S8: Void Singularity', range: '36 - 40', icon: '🌌' },
  { id: 9, name: 'S9: Cyber Ruins', range: '41 - 45', icon: '🏛️' },
  { id: 10, name: 'S10: Apex Nexus', range: '46 - 50', icon: '👑' },
];

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  stages,
  selectedStageId,
  theme = 'dark',
  onSelectStage,
  onClose
}) => {
  const isLight = theme === 'light';
  const [activeSector, setActiveSector] = useState<string | number>('all');
  const stageListRef = useRef<HTMLDivElement>(null);

  // Automatically switch active sector tab to the currently selected stage's sector on open
  useEffect(() => {
    const currentStageSector = Math.ceil(selectedStageId / 5);
    if (currentStageSector >= 1 && currentStageSector <= 10) {
      setActiveSector(currentStageSector);
    }
  }, [selectedStageId]);

  // Scroll to top of list when sector changes
  useEffect(() => {
    if (stageListRef.current) {
      stageListRef.current.scrollTop = 0;
    }
  }, [activeSector]);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const currentSectorNumber = typeof activeSector === 'number' ? activeSector : 1;

  const handlePrevSector = () => {
    soundManager.playClick();
    if (activeSector === 'all') {
      setActiveSector(10);
    } else {
      const num = Number(activeSector);
      if (num <= 1) setActiveSector(10);
      else setActiveSector(num - 1);
    }
  };

  const handleNextSector = () => {
    soundManager.playClick();
    if (activeSector === 'all') {
      setActiveSector(1);
    } else {
      const num = Number(activeSector);
      if (num >= 10) setActiveSector(1);
      else setActiveSector(num + 1);
    }
  };

  const filteredStages = useMemo(() => {
    if (activeSector === 'all') return stages;
    const secNum = Number(activeSector);
    const startId = (secNum - 1) * 5 + 1;
    const endId = secNum * 5;
    return stages.filter((s) => s.id >= startId && s.id <= endId);
  }, [stages, activeSector]);

  const handleStageClick = (stage: Stage) => {
    if (stage.unlocked) {
      soundManager.playSkill();
      onSelectStage(stage);
    }
  };

  const highestUnlockedStage = useMemo(() => {
    const unlockedList = stages.filter((s) => s.unlocked);
    return unlockedList[unlockedList.length - 1] || stages[0];
  }, [stages]);

  return (
    <div
      id="stage-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-1.5 sm:p-4 ${
        isLight ? 'bg-slate-900/60' : 'bg-black/85'
      }`}
    >
      <div
        className={`border rounded-2xl sm:rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[92dvh] sm:h-[88dvh] max-h-[92dvh] animate-in fade-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-900'
            : 'bg-[#0c0c0e] border-white/10 text-zinc-100'
        }`}
      >
        {/* Header (Fixed shrink-0) */}
        <div
          className={`shrink-0 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b ${
            isLight ? 'bg-white border-slate-200' : 'bg-black/70 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border ${
              isLight ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white/5 text-amber-400 border-white/10'
            }`}>
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-lg font-black uppercase tracking-wide">50-Stage Campaign</h2>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                  10 Sectors
                </span>
              </div>
              <p className={`text-[9px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Deploy theater ({stages.filter((s) => s.unlocked).length}/50 Unlocked)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {highestUnlockedStage && (
              <button
                onClick={() => {
                  setActiveSector(Math.ceil(highestUnlockedStage.id / 5));
                  onSelectStage(highestUnlockedStage);
                }}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition cursor-pointer active:scale-95"
              >
                <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Stage {highestUnlockedStage.id}</span>
              </button>
            )}

            <button
              id="stage-modal-close-btn"
              onClick={onClose}
              className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 hover:text-red-700 px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black transition cursor-pointer border border-red-500/40 active:scale-95 shadow-md"
              title="Exit Mission Campaign"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              <span className="uppercase">EXIT</span>
            </button>
          </div>
        </div>

        {/* Mobile & Desktop Sector Navigation Controls */}
        <div className={`shrink-0 px-2 sm:px-6 py-1.5 sm:py-2 border-b flex items-center justify-between gap-1 sm:gap-2 ${
          isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-zinc-950/80 border-white/5'
        }`}>
          {/* Quick Prev Sector Button */}
          <button
            onClick={handlePrevSector}
            className={`p-1.5 sm:p-2 rounded-xl border font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition ${
              isLight ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700' : 'bg-zinc-900 border-white/10 hover:bg-zinc-800 text-zinc-300'
            }`}
            title="Previous Sector"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>

          {/* Sector Navigation Tabs with horizontal touch scrolling */}
          <div
            className="flex-1 overflow-x-auto flex items-center gap-1 sm:gap-1.5 no-scrollbar py-0.5"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x'
            }}
          >
            {SECTOR_DATA.map((sec) => {
              const isActive = activeSector === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveSector(sec.id);
                  }}
                  className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer border active:scale-95 ${
                    isActive
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black scale-105'
                      : isLight
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      : 'bg-zinc-900 text-zinc-300 border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs">{sec.icon}</span>
                  <span className="whitespace-nowrap">{sec.name}</span>
                  <span className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-black/20 text-black' : isLight ? 'bg-slate-100 text-slate-500' : 'bg-black/40 text-zinc-500'
                  }`}>
                    {sec.range}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Next Sector Button */}
          <button
            onClick={handleNextSector}
            className={`p-1.5 sm:p-2 rounded-xl border font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition ${
              isLight ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700' : 'bg-zinc-900 border-white/10 hover:bg-zinc-800 text-zinc-300'
            }`}
            title="Next Sector"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Stage List Grid (flex-1 min-h-0 with dedicated smooth touch/mouse scrolling) */}
        <div
          ref={stageListRef}
          id="stage-list-scrollable"
          className={`flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-2.5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 ${
            isLight ? 'bg-slate-100/40' : ''
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
        >
          {filteredStages.map((stage) => {
            const isCurrentSelected = selectedStageId === stage.id;
            const sectorNum = Math.ceil(stage.id / 5);
            const mapFeatures = getStageMapFeatures(stage);

            return (
              <div
                key={stage.id}
                onClick={() => handleStageClick(stage)}
                className={`p-3 sm:p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between select-none ${
                  !stage.unlocked
                    ? isLight ? 'border-slate-200 bg-slate-200/50 opacity-50' : 'border-white/5 bg-zinc-950/40 opacity-50'
                    : isCurrentSelected
                    ? isLight
                      ? 'border-amber-500 bg-white shadow-md ring-2 ring-amber-400/40 scale-[1.01] cursor-pointer'
                      : 'border-amber-500 bg-zinc-900 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.01] cursor-pointer'
                    : isLight
                    ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm cursor-pointer'
                    : 'border-white/5 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900/80 cursor-pointer'
                }`}
                style={{ touchAction: 'pan-y' }}
              >
                {/* Background Environment Glow */}
                <div
                  className="absolute top-0 right-0 w-36 h-36 blur-3xl opacity-20 pointer-events-none rounded-full"
                  style={{ backgroundColor: stage.accentColor }}
                />

                {/* Top: Stage Number & Stars */}
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-lg font-mono border ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-black/60 text-zinc-300 border-white/5'
                    }`}>
                      STAGE {stage.id}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded font-mono ${
                      isLight ? 'bg-slate-200 text-slate-600' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      SEC {sectorNum}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          starIdx <= stage.stars
                            ? 'text-amber-500 fill-amber-500'
                            : isLight ? 'text-slate-300' : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Stage Title & Info */}
                <div className="mb-2 sm:mb-4">
                  <h3 className={`text-xs sm:text-lg font-black mb-0.5 sm:mb-1 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                    {stage.name}
                  </h3>
                  <p className={`text-[11px] sm:text-xs leading-relaxed line-clamp-2 sm:line-clamp-none ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {stage.description}
                  </p>
                </div>

                {/* Intel: Waves & Rewards & Environmental Map Features */}
                <div className={`p-2 sm:p-3 rounded-xl border space-y-1.5 font-mono text-[11px] sm:text-xs mb-2.5 sm:mb-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'
                }`}>
                  <div className={`flex justify-between ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    <span>Waves:</span>
                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                      {stage.waves.length} Waves + Boss
                    </span>
                  </div>
                  <div className={`flex justify-between ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    <span>Target Bounty:</span>
                    <span className="text-amber-500 font-bold">💰 {stage.rewardGold} G • 💎 {stage.rewardRubies} • ⚡ {stage.rewardExp} XP</span>
                  </div>

                  {/* Terrain & Environmental Features Tags */}
                  <div className="pt-1 flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 capitalize">
                      ⛰️ {mapFeatures.terrain.type.replace('_', ' ')}
                    </span>
                    {mapFeatures.river && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 capitalize">
                        🌊 {mapFeatures.river.type.replace('_', ' ')}
                      </span>
                    )}
                    {mapFeatures.hazard && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 capitalize">
                        ⚠️ {mapFeatures.hazard.type.replace('_', ' ')}
                      </span>
                    )}
                    {mapFeatures.wind.weather !== 'none' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30 capitalize">
                        💨 {mapFeatures.wind.weather.replace('_', ' ')}
                      </span>
                    )}
                    {mapFeatures.rocks.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 capitalize">
                        🪨 {mapFeatures.rocks[0].style} rocks
                      </span>
                    )}
                  </div>
                </div>

                {/* Deploy Button */}
                {stage.unlocked ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStageClick(stage);
                    }}
                    className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-b-3 sm:border-b-4 border-red-950 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl shadow-[0_6px_16px_rgba(220,38,38,0.3)] transition active:scale-98 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                    <span>DEPLOY MISSION</span>
                  </button>
                ) : (
                  <div className={`w-full py-2 sm:py-2.5 font-bold text-[11px] sm:text-xs rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 border ${
                    isLight ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-zinc-900 text-zinc-500 border-white/5'
                  }`}>
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>LOCKED (CLEAR STAGE {stage.id - 1})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
