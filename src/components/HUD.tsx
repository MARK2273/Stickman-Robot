import React from 'react';
import { PlayerState, HeroData, Enemy } from '../types/game';
import { Shield, Zap, Sparkles, RefreshCw, Bomb, Sun, Moon, Flame, Wind, Cpu, Heart, Smartphone } from 'lucide-react';
import { soundManager } from '../services/audio';

interface HUDProps {
  player: PlayerState;
  hero: HeroData;
  bossEnemy: Enemy | null;
  wave: number;
  totalWaves: number;
  enemiesRemaining: number;
  combo: number;
  sessionGold: number;
  onPause: () => void;
  onSkillPress: (index: number) => void;
  onReloadPress: () => void;
  onSwapWeapon: () => void;
  isMobileTouch: boolean;
  showTouchControls: boolean;
  onToggleTouchControls: () => void;
  isLight?: boolean;
  onToggleTheme?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  hero,
  bossEnemy,
  wave,
  totalWaves,
  enemiesRemaining,
  combo,
  sessionGold,
  onPause,
  onSkillPress,
  onReloadPress,
  onSwapWeapon,
  isMobileTouch,
  showTouchControls,
  onToggleTouchControls,
  isLight = false,
  onToggleTheme
}) => {
  const activeWeapon = player.equippedWeapons[player.selectedWeaponSlot] || player.equippedWeapons[0];
  const secondaryWeapon = player.equippedWeapons[player.selectedWeaponSlot === 0 ? 1 : 0];

  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const manaPercent = Math.max(0, Math.min(100, (player.mana / player.maxMana) * 100));

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

  // Ammo pips (up to 8 pips visual representation)
  const totalPips = 8;
  const filledPips = Math.ceil((player.currentAmmo / Math.max(1, activeWeapon.magazineSize)) * totalPips);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 select-none z-30">
      {/* TOP BAR: Health, Mana, Stage/Wave info, Gold, Theme Toggle, Touch Toggle, Pause */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* Player Status Card */}
        <div className={`backdrop-blur-md border rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center gap-2.5 sm:gap-3.5 min-w-[220px] sm:min-w-[280px] pointer-events-auto ${
          isLight
            ? 'bg-white/90 border-slate-300 shadow-slate-400/30 text-slate-900'
            : 'bg-black/70 border-white/10 text-zinc-100'
        }`}>
          {/* Avatar frame */}
          <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-inner relative overflow-hidden ${
            isLight
              ? 'bg-gradient-to-br from-slate-200 to-slate-100 border-slate-300'
              : 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-black border-white/20'
          }`}>
            <div className="w-3.5 h-3.5 rounded-full absolute -top-1 -right-1 shadow-sm" style={{ backgroundColor: hero.color }} />
            <div className="flex flex-col items-center">
              <span className={`text-[10px] sm:text-xs uppercase font-black tracking-tighter ${
                isLight ? 'text-slate-800' : 'text-zinc-300'
              }`}>
                {hero.name.substring(0, 3)}
              </span>
              <span className={`text-[8px] sm:text-[9px] font-bold uppercase ${
                isLight ? 'text-slate-500' : 'text-zinc-500'
              }`}>
                {hero.headGearType}
              </span>
            </div>
          </div>

          {/* Level, Name & Dual Health/Mana Bars */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border font-mono ${
                  isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-white/5 text-zinc-400 border-white/10'
                }`}>
                  LV.{hero.id === 'gunner' ? '42' : '28'}
                </span>
                <h2 className={`font-black text-xs uppercase tracking-tight truncate max-w-[90px] sm:max-w-[120px] ${
                  isLight ? 'text-slate-900' : 'text-zinc-100'
                }`}>
                  {hero.name}
                </h2>
              </div>
              <span className={`text-[9px] sm:text-[10px] font-mono font-bold ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                {Math.round(player.hp)}/{player.maxHp}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:gap-1.5">
              {/* HP Bar */}
              <div className={`w-full h-2 sm:h-2.5 rounded-full overflow-hidden border p-[1px] ${
                isLight ? 'bg-slate-200 border-slate-300' : 'bg-zinc-900 border-white/5'
              }`}>
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 rounded-full transition-all duration-150"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              {/* Mana Bar */}
              <div className={`w-full h-1.5 rounded-full overflow-hidden border p-[1px] ${
                isLight ? 'bg-slate-200 border-slate-300' : 'bg-zinc-900 border-white/5'
              }`}>
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-150"
                  style={{ width: `${manaPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TOP CENTER: Wave Progress or Boss Health Bar */}
        <div className="flex flex-col items-center">
          {bossEnemy ? (
            <div className={`border rounded-2xl px-3 sm:px-5 py-2 backdrop-blur-md flex flex-col items-center min-w-[200px] sm:min-w-[320px] animate-pulse ${
              isLight
                ? 'bg-white/95 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'bg-black/85 border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
            }`}>
              <div className="flex items-center gap-1.5 text-red-500 font-black text-[10px] sm:text-xs uppercase tracking-widest mb-1">
                <Shield className="w-3.5 h-3.5 text-red-500" />
                <span className="truncate max-w-[180px]">BOSS: {bossEnemy.name}</span>
              </div>
              <div className={`w-full h-2.5 sm:h-3.5 rounded-full overflow-hidden p-0.5 border ${
                isLight ? 'bg-slate-200 border-red-400' : 'bg-zinc-950 border-red-800'
              }`}>
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-150"
                  style={{ width: `${Math.max(0, (bossEnemy.hp / bossEnemy.maxHp) * 100)}%` }}
                />
              </div>
              <span className={`text-[9px] sm:text-[10px] font-mono mt-0.5 font-bold ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                {Math.round(bossEnemy.hp)} / {bossEnemy.maxHp} HP
              </span>
            </div>
          ) : (
            <div className={`backdrop-blur-md border rounded-2xl px-3 sm:px-5 py-1.5 sm:py-2 shadow-xl flex items-center gap-2.5 sm:gap-4 ${
              isLight
                ? 'bg-white/90 border-slate-300 text-slate-900'
                : 'bg-black/60 border-white/10 text-zinc-100'
            }`}>
              <div className="text-center">
                <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest font-bold block ${
                  isLight ? 'text-slate-500' : 'text-zinc-500'
                }`}>
                  WAVE
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-500 font-mono">{wave} / {totalWaves}</span>
              </div>
              <div className={`w-[1px] h-5 sm:h-6 ${isLight ? 'bg-slate-300' : 'bg-white/10'}`} />
              <div className="text-center">
                <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest font-bold block ${
                  isLight ? 'text-slate-500' : 'text-zinc-500'
                }`}>
                  HOSTILES
                </span>
                <span className={`text-xs sm:text-sm font-black font-mono ${
                  isLight ? 'text-slate-900' : 'text-zinc-100'
                }`}>
                  {enemiesRemaining}
                </span>
              </div>
            </div>
          )}

          {/* Combo Multiplier Popup */}
          {combo > 1 && (
            <div className="mt-2 bg-gradient-to-r from-red-600 to-amber-500 border-b-2 border-red-950 text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-[0_5px_20px_rgba(220,38,38,0.4)] animate-bounce">
              🔥 {combo}x COMBO!
            </div>
          )}
        </div>

        {/* TOP RIGHT: Gold & Theme Toggle & Controls Toggle & Pause Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Gold Counter */}
          <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border backdrop-blur-md flex items-center gap-2 shadow-lg ${
            isLight
              ? 'bg-white/90 border-slate-300 text-slate-800'
              : 'bg-black/60 border-white/10 text-zinc-100'
          }`}>
            <span className="text-amber-500 font-mono font-black text-xs sm:text-sm">+{sessionGold}</span>
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-500 rounded-full border-2 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex-shrink-0" />
          </div>

          {/* Quick In-Game Theme Toggle Button */}
          {onToggleTheme && (
            <button
              id="hud-theme-toggle-btn"
              onClick={() => {
                soundManager.playClick();
                onToggleTheme();
              }}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-lg active:scale-95 cursor-pointer border ${
                isLight
                  ? 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-black/60 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
              }`}
              title={isLight ? 'Switch to Dark OLED Theme' : 'Switch to White / Light Theme'}
            >
              {isLight ? (
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              )}
            </button>
          )}

          {/* Touch Controls Toggle */}
          <button
            onClick={onToggleTouchControls}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer border ${
              showTouchControls
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : isLight
                ? 'bg-white/90 hover:bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-black/60 hover:bg-white/10 text-zinc-400 border-white/10'
            }`}
            title="Toggle On-Screen Touch Controls"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-mono hidden md:inline">TOUCH</span>
            <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded ${
              showTouchControls ? 'bg-emerald-500 text-black' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {showTouchControls ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className={`border backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-lg active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-white/90 hover:bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-black/60 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
            }`}
          >
            <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-mono">PAUSE</span>
          </button>
        </div>
      </div>

      {/* BOTTOM DESKTOP HUD (shown when on-screen touch controls are OFF) */}
      {!showTouchControls && (
        <div className="flex items-end justify-between w-full">
          {/* Active Weapon Card & Quick Swap */}
          <div className="flex items-end gap-3 pointer-events-auto">
            {/* Weapon Box with Top Gold Strip & Ammo Pips */}
            <div className={`w-48 rounded-3xl border-2 p-3 relative overflow-hidden backdrop-blur-md shadow-2xl ${
              isLight
                ? 'bg-white/95 border-slate-300 text-slate-900'
                : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-100'
            }`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/60" />

              <div className="flex justify-between items-start mb-1">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${
                  isLight ? 'text-slate-500' : 'text-zinc-500'
                }`}>
                  WEAPON
                </span>
                <span className="text-[10px] font-extrabold text-amber-500 uppercase truncate max-w-[90px]">
                  {activeWeapon.name}
                </span>
              </div>

              {/* Large Ammo Numbers */}
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1 font-mono">
                  {player.activeBuffs['bullet_storm'] ? (
                    <h3 className="text-3xl font-black italic tracking-tighter text-cyan-500 animate-pulse">
                      ∞ <span className={`not-italic text-sm font-sans ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>INF</span>
                    </h3>
                  ) : (
                    <h3 className={`text-3xl font-black italic tracking-tighter ${
                      player.currentAmmo <= 3 ? 'text-red-500 animate-pulse' : isLight ? 'text-slate-900' : 'text-zinc-100'
                    }`}>
                      {player.currentAmmo}
                      <span className={`not-italic text-lg font-normal ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                        /{activeWeapon.magazineSize}
                      </span>
                    </h3>
                  )}
                </div>

                {/* Reload Button */}
                <button
                  onClick={onReloadPress}
                  disabled={player.isReloading || player.currentAmmo === activeWeapon.magazineSize}
                  className={`disabled:opacity-30 border px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10'
                  }`}
                  title="Reload Ammo (R)"
                >
                  <RefreshCw className={`w-3 h-3 ${player.isReloading ? 'animate-spin text-amber-500' : ''}`} />
                  <span>{player.isReloading ? '...' : 'R'}</span>
                </button>
              </div>

              {/* Ammo Pips Grid */}
              <div className="mt-2 flex gap-1 items-center">
                {Array.from({ length: totalPips }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-3.5 rounded-xs transition-colors duration-150 ${
                      i < filledPips
                        ? 'bg-amber-500/90 shadow-[0_0_5px_rgba(245,158,11,0.4)]'
                        : isLight
                        ? 'bg-slate-200'
                        : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Secondary Weapon Swap Button */}
            {secondaryWeapon && (
              <button
                onClick={onSwapWeapon}
                className={`border backdrop-blur-md rounded-2xl p-2.5 shadow-xl flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer min-w-[70px] ${
                  isLight
                    ? 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-black/60 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                }`}
                title="Swap Weapon (TAB / 1 / 2)"
              >
                <span className={`text-[9px] uppercase tracking-wider font-extrabold ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  SWAP (TAB)
                </span>
                <span className="text-xs font-black truncate max-w-[80px]">{secondaryWeapon.name.split(' ')[0]}</span>
                <span className="text-[10px] text-cyan-500 font-mono font-bold">
                  {player.ammoBySlot ? player.ammoBySlot[player.selectedWeaponSlot === 0 ? 1 : 0] : secondaryWeapon.magazineSize} / {secondaryWeapon.magazineSize}
                </span>
              </button>
            )}
          </div>

          {/* Active Skills Buttons (Q, E, F) */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {hero.skills.map((skill, index) => {
              const isReady = skill.currentCooldown <= 0;

              return (
                <button
                  key={skill.id}
                  onClick={() => onSkillPress(index)}
                  disabled={!isReady}
                  className={`relative group rounded-2xl p-3 flex flex-col items-center justify-center w-16 h-16 transition-all cursor-pointer ${
                    isReady
                      ? isLight
                        ? 'bg-white border-2 border-blue-500 text-slate-900 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95'
                        : 'bg-zinc-800/90 border-2 border-blue-500/60 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95'
                      : isLight
                      ? 'bg-slate-100 border border-slate-300 opacity-50 text-slate-400'
                      : 'bg-zinc-900/80 border border-white/10 opacity-50 text-zinc-600'
                  }`}
                >
                  <div className={`${isReady ? (isLight ? 'text-blue-600' : 'text-cyan-300') : isLight ? 'text-slate-400' : 'text-zinc-600'}`}>
                    {getSkillIcon(skill.icon)}
                  </div>

                  <span className={`absolute -top-2 -right-2 border text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800'
                      : 'bg-black border-white/20 text-zinc-300'
                  }`}>
                    {skill.key}
                  </span>

                  {!isReady && (
                    <div className={`absolute inset-0 rounded-2xl flex items-center justify-center ${
                      isLight ? 'bg-slate-900/60' : 'bg-black/80'
                    }`}>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {skill.currentCooldown.toFixed(1)}s
                      </span>
                    </div>
                  )}

                  <div className={`absolute -top-10 border text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-900 border-white/15 text-zinc-100'
                  }`}>
                    {skill.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* COMPACT WEAPON STATUS (shown when Touch Controls are ON, positioned at center-bottom) */}
      {showTouchControls && (
        <div className="flex justify-center w-full pointer-events-none mb-1">
          <div className={`border backdrop-blur-md rounded-2xl px-4 py-1.5 flex items-center gap-3 shadow-lg ${
            isLight
              ? 'bg-white/90 border-slate-300 text-slate-900'
              : 'bg-black/60 border-white/10 text-zinc-100'
          }`}>
            <span className={`text-[9px] font-extrabold uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {activeWeapon.name}
            </span>
            <span className="text-sm font-mono font-black text-amber-500">
              {player.activeBuffs['bullet_storm'] ? '∞ INF' : `${player.currentAmmo}/${activeWeapon.magazineSize}`}
            </span>
            {player.isReloading && (
              <span className="text-[9px] text-amber-500 font-bold animate-pulse">RELOADING...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};



