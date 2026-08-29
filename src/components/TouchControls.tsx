import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PlayerState, HeroData } from '../types/game';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  RefreshCw,
  Repeat,
  Zap,
  Bomb,
  Flame,
  Sun,
  Wind,
  Cpu,
  Heart,
  Sparkles
} from 'lucide-react';

interface TouchControlsProps {
  player: PlayerState;
  hero: HeroData;
  onMove: (dir: number) => void;
  onJump: () => void;
  onRoll: () => void;
  onShoot: (shooting: boolean, aimAngle?: number | null) => void;
  onSkillPress: (index: number) => void;
  onReloadPress: () => void;
  onSwapWeapon: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  player,
  hero,
  onMove,
  onJump,
  onRoll,
  onShoot,
  onSkillPress,
  onReloadPress,
  onSwapWeapon
}) => {
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);
  const [isShooting, setIsShooting] = useState(false);

  // Joystick reference for right-stick manual aim
  const shootBtnRef = useRef<HTMLDivElement | null>(null);
  const shootTouchIdRef = useRef<number | null>(null);

  // Update movement direction when buttons change
  useEffect(() => {
    if (leftPressed && !rightPressed) {
      onMove(-1);
    } else if (rightPressed && !leftPressed) {
      onMove(1);
    } else {
      onMove(0);
    }
  }, [leftPressed, rightPressed, onMove]);

  // Skill Icon Resolver
  const getSkillIcon = (icon: string) => {
    switch (icon) {
      case 'Bomb': return <Bomb className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Sun': return <Sun className="w-5 h-5" />;
      case 'Wind': return <Wind className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  // Left D-Pad touch handlers
  const handleLeftDown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setLeftPressed(true);
  }, []);

  const handleLeftUp = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setLeftPressed(false);
  }, []);

  const handleRightDown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setRightPressed(true);
  }, []);

  const handleRightUp = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setRightPressed(false);
  }, []);

  // Jump handler
  const handleJumpPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onJump();
  }, [onJump]);

  // Roll handler
  const handleRollPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onRoll();
  }, [onRoll]);

  // Shoot button touch handlers (supports drag to aim or tap to auto-aim)
  const handleShootTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    shootTouchIdRef.current = touch.identifier;
    setIsShooting(true);
    onShoot(true, null); // Auto-aim by default
  }, [onShoot]);

  const handleShootTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!shootBtnRef.current || shootTouchIdRef.current === null) return;
    
    // Find matching touch
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (touch.identifier === shootTouchIdRef.current) {
        const rect = shootBtnRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 15) {
          const angle = Math.atan2(dy, dx);
          onShoot(true, angle);
        } else {
          onShoot(true, null);
        }
        break;
      }
    }
  }, [onShoot]);

  const handleShootTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    shootTouchIdRef.current = null;
    setIsShooting(false);
    onShoot(false, null);
  }, [onShoot]);

  // Mouse fallback for shoot button on PC testing
  const handleShootMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsShooting(true);
    onShoot(true, null);
  }, [onShoot]);

  const handleShootMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsShooting(false);
    onShoot(false, null);
  }, [onShoot]);

  const activeWeapon = player.equippedWeapons[player.selectedWeaponSlot] || player.equippedWeapons[0];
  const secondaryWeapon = player.equippedWeapons[player.selectedWeaponSlot === 0 ? 1 : 0];

  return (
    <div
      id="mobile-touch-controls"
      className="absolute inset-0 pointer-events-none z-40 flex justify-between items-end p-3 sm:p-5 select-none"
      style={{ touchAction: 'none' }}
    >
      {/* LEFT CLUSTER: Directional Movement (Left, Right) & Jump/Roll Quick Triggers */}
      <div className="flex flex-col gap-2 pointer-events-auto items-start pb-2">
        {/* Jump & Dash Action Aux buttons on left for two-hand fluid mobility */}
        <div className="flex items-center gap-1.5 mb-1">
          {/* Quick Dash / Roll */}
          <button
            id="mobile-dash-btn"
            onTouchStart={handleRollPress}
            onMouseDown={handleRollPress}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-black/75 active:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 active:scale-90 flex flex-col items-center justify-center shadow-md backdrop-blur-md transition-transform"
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-[8px] sm:text-[9px] font-black tracking-tighter uppercase">DASH</span>
          </button>

          {/* Quick Jump */}
          <button
            id="mobile-jump-left-btn"
            onTouchStart={handleJumpPress}
            onMouseDown={handleJumpPress}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-black/75 active:bg-amber-500/30 border border-amber-500/40 text-amber-300 active:scale-90 flex flex-col items-center justify-center shadow-md backdrop-blur-md transition-transform"
          >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 stroke-[3]" />
            <span className="text-[8px] sm:text-[9px] font-black tracking-tighter uppercase">JUMP</span>
          </button>
        </div>

        {/* Big D-PAD Horizontal Navigation (Left & Right) */}
        <div className="flex items-center gap-2 bg-black/60 p-1 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-md shadow-xl">
          {/* Left Button */}
          <button
            id="mobile-move-left-btn"
            onTouchStart={handleLeftDown}
            onTouchEnd={handleLeftUp}
            onTouchCancel={handleLeftUp}
            onMouseDown={handleLeftDown}
            onMouseUp={handleLeftUp}
            onMouseLeave={handleLeftUp}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all ${
              leftPressed
                ? 'bg-amber-500 text-black border-2 border-amber-300 scale-95 shadow-[0_0_16px_rgba(245,158,11,0.6)]'
                : 'bg-zinc-900/90 text-zinc-200 border border-white/10 active:bg-zinc-800'
            }`}
          >
            <ArrowLeft className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[3] ${leftPressed ? 'text-black' : 'text-zinc-100'}`} />
            <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase">LEFT</span>
          </button>

          {/* Right Button */}
          <button
            id="mobile-move-right-btn"
            onTouchStart={handleRightDown}
            onTouchEnd={handleRightUp}
            onTouchCancel={handleRightUp}
            onMouseDown={handleRightDown}
            onMouseUp={handleRightUp}
            onMouseLeave={handleRightUp}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all ${
              rightPressed
                ? 'bg-amber-500 text-black border-2 border-amber-300 scale-95 shadow-[0_0_16px_rgba(245,158,11,0.6)]'
                : 'bg-zinc-900/90 text-zinc-200 border border-white/10 active:bg-zinc-800'
            }`}
          >
            <ArrowRight className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[3] ${rightPressed ? 'text-black' : 'text-zinc-100'}`} />
            <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase">RIGHT</span>
          </button>
        </div>
      </div>

      {/* RIGHT CLUSTER: Skills Arc, Weapon Utilities & Main Fire Button */}
      <div className="flex flex-col items-end gap-1.5 sm:gap-2.5 pointer-events-auto pb-2">
        {/* Top Skill Row (Q, E, F) */}
        <div className="flex items-center gap-1.5 mb-0.5">
          {hero.skills.map((skill, index) => {
            const isReady = skill.currentCooldown <= 0;
            return (
              <button
                key={skill.id}
                id={`mobile-skill-btn-${index}`}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (isReady) onSkillPress(index);
                }}
                onClick={() => {
                  if (isReady) onSkillPress(index);
                }}
                disabled={!isReady}
                className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition active:scale-90 border ${
                  isReady
                    ? 'bg-zinc-900/90 border-blue-500/70 text-cyan-300 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                    : 'bg-zinc-950/80 border-white/5 opacity-50 text-zinc-600'
                }`}
              >
                <div className="scale-85">{getSkillIcon(skill.icon)}</div>
                <span className="text-[7px] sm:text-[8px] font-black tracking-tighter uppercase text-zinc-400 font-mono">
                  {skill.name.split(' ')[0]}
                </span>

                {/* Cooldown Number Overlay */}
                {!isReady && (
                  <div className="absolute inset-0 bg-black/85 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <span className="text-[10px] font-black text-amber-400 font-mono">
                      {skill.currentCooldown.toFixed(1)}s
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Middle Utility Row: Reload, Weapon Swap, Jump Button */}
        <div className="flex items-center gap-1.5">
          {/* Quick Reload Button */}
          <button
            id="mobile-reload-btn"
            onTouchStart={(e) => {
              e.preventDefault();
              onReloadPress();
            }}
            onClick={onReloadPress}
            disabled={player.isReloading || player.currentAmmo === activeWeapon.magazineSize}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-black/75 active:bg-amber-500/30 border border-white/15 text-zinc-200 active:scale-90 flex flex-col items-center justify-center shadow-md backdrop-blur-md transition-transform"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${player.isReloading ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
            <span className="text-[7px] sm:text-[8px] font-black tracking-tighter uppercase text-zinc-400">RELOAD</span>
          </button>

          {/* Quick Weapon Swap Button */}
          {secondaryWeapon && (
            <button
              id="mobile-swap-btn"
              onTouchStart={(e) => {
                e.preventDefault();
                onSwapWeapon();
              }}
              onClick={onSwapWeapon}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-black/75 active:bg-cyan-500/30 border border-white/15 text-zinc-200 active:scale-90 flex flex-col items-center justify-center shadow-md backdrop-blur-md transition-transform"
            >
              <Repeat className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[7px] sm:text-[8px] font-black tracking-tighter uppercase text-zinc-400">
                {player.ammoBySlot ? `${player.ammoBySlot[player.selectedWeaponSlot === 0 ? 1 : 0]}` : 'SWAP'}
              </span>
            </button>
          )}

          {/* Right Jump Trigger */}
          <button
            id="mobile-jump-right-btn"
            onTouchStart={handleJumpPress}
            onMouseDown={handleJumpPress}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-t from-amber-600 to-amber-500 border-2 border-amber-300 text-black active:scale-90 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-transform font-black"
          >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3] text-black" />
            <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase">JUMP</span>
          </button>
        </div>

        {/* Big Shoot / Fire Action Button */}
        <div
          ref={shootBtnRef}
          id="mobile-shoot-btn"
          onTouchStart={handleShootTouchStart}
          onTouchMove={handleShootTouchMove}
          onTouchEnd={handleShootTouchEnd}
          onTouchCancel={handleShootTouchEnd}
          onMouseDown={handleShootMouseDown}
          onMouseUp={handleShootMouseUp}
          onMouseLeave={handleShootMouseUp}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer border-3 sm:border-4 ${
            isShooting
              ? 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700 border-yellow-300 scale-95 shadow-[0_0_25px_rgba(239,68,68,0.8)]'
              : 'bg-gradient-to-br from-red-600 to-red-900 border-red-500/80 shadow-[0_6px_20px_rgba(220,38,38,0.4)]'
          }`}
        >
          <Crosshair className={`w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5] ${isShooting ? 'text-yellow-200 animate-spin' : 'text-white'}`} />
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white mt-0.5 drop-shadow">
            {isShooting ? 'FIRING!' : 'FIRE'}
          </span>
          <span className="text-[7px] sm:text-[8px] font-extrabold uppercase text-white/70 tracking-tighter">
            AUTO-AIM / 360°
          </span>
        </div>
      </div>
    </div>
  );
};
