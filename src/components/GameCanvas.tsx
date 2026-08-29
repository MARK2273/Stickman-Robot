import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { GameRenderer } from '../engine/renderer';
import { HeroData, Stage, Weapon, GameSettings, PlayerStats, Enemy, Pet } from '../types/game';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { soundManager } from '../services/audio';

interface GameCanvasProps {
  hero: HeroData;
  stage: Stage;
  playerStats: PlayerStats;
  equippedWeapons: [Weapon, Weapon | null];
  equippedPet?: Pet | null;
  settings: GameSettings;
  isPaused?: boolean;
  onGameOver: () => void;
  onVictory: (loot: { gold: number; rubies: number; exp: number }) => void;
  onPause: () => void;
  onStatsUpdate: (stats: Partial<PlayerStats>) => void;
  onToggleTheme?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  hero,
  stage,
  playerStats,
  equippedWeapons,
  equippedPet,
  settings,
  isPaused = false,
  onGameOver,
  onVictory,
  onPause,
  onStatsUpdate,
  onToggleTheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const isPausedRef = useRef<boolean>(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Sync weapons if player changed loadout in armory
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateEquippedWeapons(equippedWeapons);
    }
  }, [equippedWeapons]);

  // Sync pet if player changed companion in Pet Sanctum
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateEquippedPet(equippedPet || null);
    }
  }, [equippedPet]);

  // React state for HUD updates
  const [hudState, setHudState] = useState({
    wave: 1,
    totalWaves: stage.waves.length,
    enemiesRemaining: stage.waves[0]?.totalEnemies || 15,
    combo: 0,
    sessionGold: 0,
    bossEnemy: null as Enemy | null
  });

  const isMobileTouch = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 1024
  );

  // Auto-enable touch controls on mobile or small screens or when selected in settings
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (settings.controlScheme === 'touch') return true;
    return isMobileTouch;
  });

  // Initialize Game Engine & Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const renderer = new GameRenderer(ctx);
    rendererRef.current = renderer;

    const engine = new GameEngine(
      hero,
      stage,
      playerStats,
      equippedWeapons,
      settings,
      {
        onGameOver,
        onVictory,
        onWaveChange: (wave, totalWaves) => {
          setHudState((prev) => ({
            ...prev,
            wave,
            totalWaves
          }));
        },
        onBossSpawn: (bossName) => {
          // boss tracked automatically in loop
        },
        onLevelUp: () => {},
        onStatsUpdate
      },
      equippedPet
    );
    engineRef.current = engine;

    // Start ambient synth music
    if (settings.musicEnabled) {
      soundManager.startBattleMusic();
    }

    // Animation Frame Loop
    lastTimeRef.current = performance.now();
    let isRunning = true;

    const loop = (time: number) => {
      if (!isRunning) return;
      const deltaTime = Math.min(0.1, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      if (engine && renderer && canvas) {
        if (!isPausedRef.current) {
          engine.update(deltaTime, canvas.width, canvas.height);
        }

        renderer.render(
          canvas.width,
          canvas.height,
          engine.player,
          engine.hero,
          engine.enemies,
          engine.projectiles,
          engine.particles,
          engine.damageNumbers,
          engine.stage,
          engine.cameraX,
          engine.cameraShake,
          engine.gameTime,
          engine.petRuntime,
          engine.enemyHouses
        );

        // Update HUD sync
        const currentWaveData = engine.stage.waves[engine.currentWaveIndex];
        const remaining = currentWaveData
          ? Math.max(0, currentWaveData.totalEnemies - engine.enemiesKilledInWave)
          : 0;

        const activeBoss = engine.enemies.find((e) => e.isBoss) || null;

        setHudState({
          wave: engine.currentWaveIndex + 1,
          totalWaves: engine.stage.waves.length,
          enemiesRemaining: remaining,
          combo: engine.comboCount,
          sessionGold: engine.sessionGold,
          bossEnemy: activeBoss
        });
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [hero, stage]);

  // Window Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onPause();
        return;
      }
      if (e.code === 'Tab') {
        e.preventDefault();
        engineRef.current?.toggleWeaponSlot();
        return;
      }
      if (engineRef.current && !isPausedRef.current) {
        engineRef.current.keys[e.code] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current) {
        engineRef.current.keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onPause]);

  // Mouse Handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    engineRef.current.hasManualMouseAim = true;
    engineRef.current.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    soundManager.init();
    if (engineRef.current) {
      engineRef.current.hasManualMouseAim = true;
      engineRef.current.isMouseDown = true;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.isMouseDown = false;
    }
  }, []);

  // Touch handlers on canvas (for aiming/tapping)
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || !canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    engineRef.current.mousePos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    soundManager.init();
    if (!engineRef.current || !canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    engineRef.current.mousePos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    engineRef.current.isMouseDown = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.isMouseDown = false;
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full block cursor-crosshair"
      />

      {/* HUD Layer */}
      {engineRef.current && (
        <HUD
          player={engineRef.current.player}
          hero={engineRef.current.hero}
          bossEnemy={hudState.bossEnemy}
          wave={hudState.wave}
          totalWaves={hudState.totalWaves}
          enemiesRemaining={hudState.enemiesRemaining}
          combo={hudState.combo}
          sessionGold={hudState.sessionGold}
          onPause={onPause}
          onSkillPress={(idx) => engineRef.current?.useSkill(idx)}
          onReloadPress={() => engineRef.current?.reloadWeapon()}
          onSwapWeapon={() => {
            engineRef.current?.toggleWeaponSlot();
          }}
          isMobileTouch={isMobileTouch}
          showTouchControls={showTouchControls}
          onToggleTouchControls={() => setShowTouchControls((prev) => !prev)}
          isLight={settings.theme === 'light'}
          onToggleTheme={onToggleTheme}
        />
      )}

      {/* Mobile On-Screen Touch Controls Overlay */}
      {showTouchControls && engineRef.current && (
        <TouchControls
          player={engineRef.current.player}
          hero={engineRef.current.hero}
          onMove={(dir) => engineRef.current?.setVirtualMove(dir)}
          onJump={() => engineRef.current?.triggerJump()}
          onRoll={() => engineRef.current?.triggerRoll()}
          onShoot={(shooting, angle) => engineRef.current?.setVirtualShooting(shooting, angle)}
          onSkillPress={(idx) => engineRef.current?.useSkill(idx)}
          onReloadPress={() => engineRef.current?.reloadWeapon()}
          onSwapWeapon={() => {
            engineRef.current?.toggleWeaponSlot();
          }}
        />
      )}
    </div>
  );
};
