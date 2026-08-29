import React, { useState, useEffect } from 'react';
import {
  GameScreen,
  HeroData,
  Stage,
  Weapon,
  GearItem,
  PlayerStats,
  GameSettings,
  Pet
} from './types/game';
import { HERO_CLASSES } from './data/heroes';
import { INITIAL_WEAPONS } from './data/weapons';
import { INITIAL_GEAR } from './data/gear';
import { STAGES } from './data/stages';
import { INITIAL_PETS } from './data/pets';
import { soundManager } from './services/audio';

import { GameCanvas } from './components/GameCanvas';
import { ArmoryModal } from './components/ArmoryModal';
import { StatsUpgradeModal } from './components/StatsUpgradeModal';
import { HeroSelectModal } from './components/HeroSelectModal';
import { StageSelectModal } from './components/StageSelectModal';
import { PetModal } from './components/PetModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { VictoryDefeatModal } from './components/VictoryDefeatModal';
import { DailyBonusModal, DAILY_REWARDS } from './components/DailyBonusModal';
import { FreeRewardsModal } from './components/FreeRewardsModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { MonetizationModal } from './components/MonetizationModal';
import { InstallPwaPrompt } from './components/InstallPwaPrompt';

import {
  Play,
  Crosshair,
  Shield,
  Award,
  Users,
  MapPin,
  Settings as SettingsIcon,
  Flame,
  Zap,
  Sparkles,
  Volume2,
  Skull,
  Radio,
  Sun,
  Moon,
  Bot,
  Gift,
  Film,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const SAVE_KEY = 'stickman_gun_2_save_v1';

export default function App() {
  // Game Screen Flow
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');

  // Persistence State
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem(SAVE_KEY + '_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      level: 1,
      exp: 0,
      maxExp: 500,
      gold: 1200, // Starter bonus gold
      rubies: 20, // Starter bonus rubies for pets
      statPoints: 3,
      strength: 1,
      vitality: 1,
      agility: 1,
      intellect: 1,
      defense: 1
    };
  });

  const [heroes, setHeroes] = useState<HeroData[]>(() => {
    const saved = localStorage.getItem(SAVE_KEY + '_heroes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return HERO_CLASSES;
  });

  const [selectedHeroId, setSelectedHeroId] = useState<string>('gunner');

  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem(SAVE_KEY + '_pets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return INITIAL_PETS.map((initP) => {
            const found = parsed.find((p: any) => p.id === initP.id);
            if (found) {
              return {
                ...initP,
                ...found,
                unlocked: found.unlocked ?? (initP.id === 'cyber_dog')
              };
            }
            return initP;
          });
        }
      } catch (e) {}
    }
    return INITIAL_PETS;
  });

  const [equippedPetId, setEquippedPetId] = useState<string | null>(() => {
    const saved = localStorage.getItem(SAVE_KEY + '_equipped_pet');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return 'cyber_dog'; // Starter pet equipped by default
  });

  const [weapons, setWeapons] = useState<Weapon[]>(() => {
    const saved = localStorage.getItem(SAVE_KEY + '_weapons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return INITIAL_WEAPONS.map((initW) => {
            const found = parsed.find((p: any) => p.id === initW.id);
            if (found) {
              return {
                ...initW,
                ...found,
                unlocked: found.unlocked ?? (initW.id === 'starter_pistol')
              };
            }
            return initW;
          });
        }
      } catch (e) {}
    }
    return INITIAL_WEAPONS;
  });

  const [equippedWeaponIds, setEquippedWeaponIds] = useState<[string, string | null]>(['starter_pistol', null]);

  const [gear, setGear] = useState<GearItem[]>(() => {
    const saved = localStorage.getItem(SAVE_KEY + '_gear');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_GEAR;
  });

  const [stages, setStages] = useState<Stage[]>(() => {
    const saved = localStorage.getItem(SAVE_KEY + '_stages');
    if (saved) {
      try {
        const parsed: Stage[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with all 50 stages to ensure S1 through S10 (Stages 1-50) always exist
          return STAGES.map((baseStage) => {
            const savedStage = parsed.find((s) => s.id === baseStage.id);
            if (savedStage) {
              return {
                ...baseStage,
                unlocked: savedStage.unlocked ?? (baseStage.id === 1),
                stars: savedStage.stars ?? 0
              };
            }
            return baseStage;
          });
        }
      } catch (e) {}
    }
    return STAGES;
  });

  const [selectedStageId, setSelectedStageId] = useState<number>(1);

  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem(SAVE_KEY + '_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.7,
      musicVolume: 0.5,
      screenShake: true,
      bloodEffects: true,
      damageNumbers: true,
      showFps: false,
      controlScheme: 'mouse_keyboard',
      theme: 'dark'
    };
  });

  // Modals Visibility
  const [showArmory, setShowArmory] = useState(false);
  const [showPets, setShowPets] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHeroSelect, setShowHeroSelect] = useState(false);
  const [showStageSelect, setShowStageSelect] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showFreeRewards, setShowFreeRewards] = useState(false);
  const [showMonetization, setShowMonetization] = useState(false);

  // Rewarded Video Ad Modal State
  const [activeRewardedAd, setActiveRewardedAd] = useState<{
    type: 'daily_2x' | 'free_gold' | 'free_gems';
    title: string;
    icon: string;
  } | null>(null);

  // Daily Sign-in Bonus State
  const [dailyBonusState, setDailyBonusState] = useState<{
    currentDay: number;
    lastClaimDate: string;
  }>(() => {
    const saved = localStorage.getItem(SAVE_KEY + '_daily_bonus');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      currentDay: 1,
      lastClaimDate: ''
    };
  });

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; icon: string } | null>(null);

  const showToast = (text: string, icon: string = '🎉') => {
    setToastMessage({ text, icon });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Victory / Defeat Session State
  const [endGameResult, setEndGameResult] = useState<{
    isVictory: boolean;
    loot: { gold: number; rubies: number; exp: number };
  } | null>(null);

  // Save Daily Bonus to LocalStorage
  useEffect(() => {
    localStorage.setItem(SAVE_KEY + '_daily_bonus', JSON.stringify(dailyBonusState));
  }, [dailyBonusState]);

  // Check if today's bonus has been claimed
  const todayDateStr = new Date().toISOString().split('T')[0];
  const hasClaimedToday = dailyBonusState.lastClaimDate === todayDateStr;

  // Daily Sign-In Bonus Claim Handler
  const handleClaimDailyBonus = (multiplier: 1 | 2) => {
    const currentReward = DAILY_REWARDS.find((r) => r.day === dailyBonusState.currentDay) || DAILY_REWARDS[0];
    
    if (multiplier === 2) {
      // Trigger Rewarded Video Ad
      setActiveRewardedAd({
        type: 'daily_2x',
        title: `2X Double Day ${dailyBonusState.currentDay} Bounty (${currentReward.gold * 2}G / ${currentReward.rubies * 2}💎)`,
        icon: '🎬'
      });
      setShowDailyBonus(false);
      return;
    }

    // 1X Claim
    const goldToAdd = currentReward.gold;
    const rubiesToAdd = currentReward.rubies;

    setPlayerStats((prev) => ({
      ...prev,
      gold: prev.gold + goldToAdd,
      rubies: prev.rubies + rubiesToAdd
    }));

    const nextDay = dailyBonusState.currentDay >= 7 ? 1 : dailyBonusState.currentDay + 1;
    setDailyBonusState({
      currentDay: nextDay,
      lastClaimDate: todayDateStr
    });

    showToast(`Claimed Day ${dailyBonusState.currentDay} Reward! +${goldToAdd.toLocaleString()} G, +${rubiesToAdd} 💎`, '🎁');
    setShowDailyBonus(false);
  };

  // Rewarded Video Ad Completion Handler
  const handleRewardedAdComplete = () => {
    if (!activeRewardedAd) return;

    if (activeRewardedAd.type === 'daily_2x') {
      const currentReward = DAILY_REWARDS.find((r) => r.day === dailyBonusState.currentDay) || DAILY_REWARDS[0];
      const goldToAdd = currentReward.gold * 2;
      const rubiesToAdd = currentReward.rubies * 2;

      setPlayerStats((prev) => ({
        ...prev,
        gold: prev.gold + goldToAdd,
        rubies: prev.rubies + rubiesToAdd
      }));

      const nextDay = dailyBonusState.currentDay >= 7 ? 1 : dailyBonusState.currentDay + 1;
      setDailyBonusState({
        currentDay: nextDay,
        lastClaimDate: todayDateStr
      });

      showToast(`2X DOUBLE REWARD CLAIMED! +${goldToAdd.toLocaleString()} G, +${rubiesToAdd} 💎`, '👑');
    } else if (activeRewardedAd.type === 'free_gold') {
      const goldAwarded = 5000;
      setPlayerStats((prev) => ({
        ...prev,
        gold: prev.gold + goldAwarded
      }));
      showToast(`+${goldAwarded.toLocaleString()} Free Gold Transferred!`, '💰');
    } else if (activeRewardedAd.type === 'free_gems') {
      const gemsAwarded = 5;
      setPlayerStats((prev) => ({
        ...prev,
        rubies: prev.rubies + gemsAwarded
      }));
      showToast(`+${gemsAwarded} Free Gems (Rubies) Added!`, '💎');
    }

    setActiveRewardedAd(null);
  };

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(SAVE_KEY + '_stats', JSON.stringify(playerStats));
  }, [playerStats]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY + '_heroes', JSON.stringify(heroes));
  }, [heroes]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY + '_pets', JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY + '_equipped_pet', JSON.stringify(equippedPetId));
  }, [equippedPetId]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY + '_weapons', JSON.stringify(weapons));
  }, [weapons]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY + '_gear', JSON.stringify(gear));
  }, [gear]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY + '_stages', JSON.stringify(stages));
  }, [stages]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY + '_settings', JSON.stringify(settings));
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#f8fafc');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#0a0a0a');
    }
  }, [settings]);

  // Shared quick theme toggle handler
  const handleToggleTheme = () => {
    soundManager.playClick();
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  // Current active Hero, Pet, and Stage objects
  const activeHero = heroes.find((h) => h.id === selectedHeroId) || heroes[0];
  const activePet = pets.find((p) => p.id === equippedPetId) || null;
  const activeStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  const primaryWeapon = weapons.find((w) => w.id === equippedWeaponIds[0]) || weapons[0];
  const secondaryWeapon = weapons.find((w) => w.id === equippedWeaponIds[1]) || null;

  // Handlers for Pets
  const handleEquipPet = (petId: string | null) => {
    setEquippedPetId(petId);
  };

  const handleUnlockPet = (pet: Pet) => {
    if (playerStats.rubies < pet.costRubies) return;
    setPlayerStats((s) => ({ ...s, rubies: s.rubies - pet.costRubies }));
    setPets((prev) =>
      prev.map((p) => (p.id === pet.id ? { ...p, unlocked: true } : p))
    );
    setEquippedPetId(pet.id);
  };

  const handleUpgradePet = (petId: string) => {
    const pet = pets.find((p) => p.id === petId);
    if (!pet || pet.level >= pet.maxLevel || playerStats.rubies < pet.upgradeCostRubies) return;

    setPlayerStats((s) => ({ ...s, rubies: s.rubies - pet.upgradeCostRubies }));
    setPets((prev) =>
      prev.map((p) => {
        if (p.id !== petId) return p;
        const nextLvl = p.level + 1;
        return {
          ...p,
          level: nextLvl,
          upgradeCostRubies: Math.round(p.upgradeCostRubies * 1.4),
          damage: Math.round(p.damage * 1.25),
          playerHpBonusPercent: p.playerHpBonusPercent + 2,
          playerDamageBonusPercent: p.playerDamageBonusPercent + 2
        };
      })
    );
  };

  // Handlers for Weapons & Upgrades
  const handleEquipWeapon = (weaponId: string, slot: 0 | 1) => {
    const target = weapons.find((w) => w.id === weaponId);
    if (!target || !target.unlocked) return;

    soundManager.playSkill();
    setEquippedWeaponIds((prev) => {
      if (slot === 0) {
        return [weaponId, prev[1] === weaponId ? null : prev[1]];
      } else {
        // If already equipped in secondary slot, toggle it off/unequip
        if (prev[1] === weaponId) {
          return [prev[0], null];
        }
        return [prev[0], prev[0] === weaponId ? null : weaponId];
      }
    });
  };

  const handleUpgradeWeapon = (weaponId: string) => {
    setWeapons((prev) =>
      prev.map((w) => {
        if (w.id === weaponId) {
          const cost = w.upgradeCost;
          setPlayerStats((s) => ({ ...s, gold: Math.max(0, s.gold - cost) }));
          return {
            ...w,
            level: w.level + 1,
            damage: Math.round(w.damage * 1.18),
            fireRate: Number((w.fireRate * 1.05).toFixed(1)),
            magazineSize: Math.round(w.magazineSize * 1.1),
            critChance: Number(Math.min(0.6, w.critChance + 0.02).toFixed(2)),
            upgradeCost: Math.round(w.upgradeCost * 1.4)
          };
        }
        return w;
      })
    );
  };

  const handleBuyWeapon = (weapon: Weapon) => {
    if (playerStats.gold >= weapon.cost) {
      setPlayerStats((s) => ({ ...s, gold: s.gold - weapon.cost }));
      setWeapons((prev) =>
        prev.map((w) => (w.id === weapon.id ? { ...w, unlocked: true, level: 1 } : w))
      );
    }
  };

  const handleEquipGear = (gearId: string) => {
    soundManager.playSkill();
    setGear((prev) =>
      prev.map((g) => {
        if (g.id === gearId) {
          return { ...g, equipped: !g.equipped };
        }
        // unequip other same type gear
        const target = prev.find((i) => i.id === gearId);
        if (target && g.type === target.type) {
          return { ...g, equipped: false };
        }
        return g;
      })
    );
  };

  const handleBuyGear = (gearItem: GearItem) => {
    if (playerStats.gold >= gearItem.cost) {
      setPlayerStats((s) => ({ ...s, gold: s.gold - gearItem.cost }));
      setGear((prev) =>
        prev.map((g) => (g.id === gearItem.id ? { ...g, unlocked: true, equipped: true } : g))
      );
    }
  };

  // Stat allocation
  const handleAllocateStat = (statKey: 'strength' | 'vitality' | 'agility' | 'intellect' | 'defense') => {
    if (playerStats.statPoints > 0) {
      setPlayerStats((prev) => ({
        ...prev,
        statPoints: prev.statPoints - 1,
        [statKey]: prev[statKey] + 1
      }));
    }
  };

  // Hero class unlock
  const handleUnlockHero = (hero: HeroData) => {
    if (playerStats.gold >= hero.cost) {
      setPlayerStats((s) => ({ ...s, gold: s.gold - hero.cost }));
      setHeroes((prev) =>
        prev.map((h) => (h.id === hero.id ? { ...h, unlocked: true } : h))
      );
      setSelectedHeroId(hero.id);
    }
  };

  // Hero leveling & upgrades
  const handleUpgradeHero = (heroId: string) => {
    const hero = heroes.find((h) => h.id === heroId);
    if (!hero || hero.level >= hero.maxLevel) return;
    if (playerStats.gold < hero.upgradeCost) return;

    setPlayerStats((s) => ({ ...s, gold: s.gold - hero.upgradeCost }));
    setHeroes((prev) =>
      prev.map((h) => {
        if (h.id !== heroId) return h;
        const nextLevel = h.level + 1;
        return {
          ...h,
          level: nextLevel,
          upgradeCost: Math.round(h.upgradeCost * 1.5),
          baseStats: {
            ...h.baseStats,
            health: Math.round(h.baseStats.health * 1.15),
            mana: Math.round(h.baseStats.mana * 1.1),
            damage: Math.round(h.baseStats.damage * 1.12),
            speed: Math.round((h.baseStats.speed + 0.1) * 10) / 10,
            defense: Math.round(h.baseStats.defense * 1.15)
          }
        };
      })
    );
  };

  // Hero Skill upgrades
  const handleUpgradeHeroSkill = (heroId: string, skillId: string) => {
    const hero = heroes.find((h) => h.id === heroId);
    if (!hero) return;
    const skill = hero.skills.find((s) => s.id === skillId);
    if (!skill || skill.level >= skill.maxLevel) return;
    if (playerStats.gold < skill.upgradeCost) return;

    setPlayerStats((s) => ({ ...s, gold: s.gold - skill.upgradeCost }));
    setHeroes((prev) =>
      prev.map((h) => {
        if (h.id !== heroId) return h;
        return {
          ...h,
          skills: h.skills.map((s) => {
            if (s.id !== skillId) return s;
            const nextLvl = s.level + 1;
            return {
              ...s,
              level: nextLvl,
              upgradeCost: Math.round(s.upgradeCost * 1.5),
              damage: s.damage ? Math.round(s.damage * 1.2) : undefined,
              cooldown: Math.max(2, Math.round(s.cooldown * 0.95 * 10) / 10)
            };
          })
        };
      })
    );
  };

  // Combat Callbacks
  const handleGameOver = () => {
    soundManager.stopMusic();
    setEndGameResult({
      isVictory: false,
      loot: { gold: 50, rubies: 0, exp: 40 }
    });
    setCurrentScreen('game_over');
  };

  const handleVictory = (loot: { gold: number; rubies: number; exp: number }) => {
    soundManager.stopMusic();

    // Reward player
    setPlayerStats((prev) => {
      let newExp = prev.exp + loot.exp;
      let newLevel = prev.level;
      let newMaxExp = prev.maxExp;
      let newPoints = prev.statPoints;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel++;
        newMaxExp = Math.round(newMaxExp * 1.35);
        newPoints += 3; // +3 stat points per level up
      }

      return {
        ...prev,
        gold: prev.gold + loot.gold,
        rubies: prev.rubies + loot.rubies,
        exp: newExp,
        level: newLevel,
        maxExp: newMaxExp,
        statPoints: newPoints
      };
    });

    // Unlock next stage & mark 3 stars
    setStages((prev) =>
      prev.map((st) => {
        if (st.id === selectedStageId) {
          return { ...st, stars: 3 };
        }
        if (st.id === selectedStageId + 1) {
          return { ...st, unlocked: true };
        }
        return st;
      })
    );

    setEndGameResult({
      isVictory: true,
      loot
    });
    setCurrentScreen('victory');
  };

  const handleStartGame = () => {
    soundManager.init();
    soundManager.playSkill();
    setCurrentScreen('playing');
  };

  const isLight = settings.theme === 'light';

  return (
    <div className={`fixed inset-0 w-full h-[100dvh] font-sans overflow-hidden select-none flex flex-col justify-between ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0a0a] text-zinc-100'
    }`}>
      {/* GAMEPLAY ACTIVE CANVAS */}
      {(currentScreen === 'playing' || currentScreen === 'paused') && (
        <GameCanvas
          hero={activeHero}
          stage={activeStage}
          playerStats={playerStats}
          equippedWeapons={[primaryWeapon, secondaryWeapon]}
          equippedPet={activePet}
          settings={settings}
          isPaused={currentScreen === 'paused' || showArmory || showPets || showSettings || showStats || showHeroSelect}
          onGameOver={handleGameOver}
          onVictory={handleVictory}
          onPause={() => setCurrentScreen('paused')}
          onToggleTheme={handleToggleTheme}
          onStatsUpdate={(delta) => {
            if (delta.gold || delta.exp) {
              setPlayerStats((prev) => ({
                ...prev,
                gold: prev.gold + (delta.gold ? 1 : 0),
                exp: prev.exp + (delta.exp ? 1 : 0)
              }));
            }
          }}
        />
      )}

      {/* TITLE SCREEN & HUB */}
      {currentScreen === 'title' && (
        <div
          id="main-title-screen"
          className={`relative w-full h-full max-h-[100dvh] flex flex-col justify-between p-2 sm:p-3 md:p-4 overflow-y-auto sm:overflow-hidden select-none ${
            isLight
              ? 'bg-gradient-to-b from-slate-100 via-sky-50 to-slate-200'
              : 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617]'
          }`}
        >
          {/* Ambient Lighting Background Accents */}
          <div className={`absolute top-1/4 left-1/4 w-[240px] sm:w-[380px] h-[240px] sm:h-[380px] blur-[90px] pointer-events-none rounded-full ${
            isLight ? 'bg-cyan-400/20' : 'bg-indigo-600/15'
          }`} />
          <div className={`absolute bottom-1/4 right-1/4 w-[240px] sm:w-[380px] h-[240px] sm:h-[380px] blur-[90px] pointer-events-none rounded-full ${
            isLight ? 'bg-rose-400/15' : 'bg-red-600/15'
          }`} />
          <div className={`absolute inset-0 [background-size:16px_16px] pointer-events-none ${
            isLight
              ? 'bg-[radial-gradient(#0000000d_1px,transparent_1px)] opacity-60'
              : 'bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] opacity-40'
          }`} />

          {/* TOP SECTION: Header Bar & Player Stats */}
          <div className="z-10 w-full max-w-4xl mx-auto shrink-0 flex flex-col gap-1 sm:gap-1.5">
            {/* Player Stats & Header Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-1 w-full">
              {/* Player Level & Currency Tag */}
              <div className={`flex items-center gap-1.5 sm:gap-2.5 backdrop-blur-md border px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-2xl shadow-sm ${
                isLight
                  ? 'bg-white/90 border-slate-300 shadow-slate-300/40 text-slate-800'
                  : 'bg-black/75 border-white/10 text-zinc-100'
              }`}>
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md font-black text-[8px] sm:text-[10px] flex items-center justify-center border font-mono ${
                  isLight ? 'bg-slate-100 text-amber-600 border-slate-300' : 'bg-white/10 text-amber-400 border-white/10'
                }`}>
                  LV.{playerStats.level}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-mono font-bold">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                    <span>{playerStats.gold.toLocaleString()}G</span>
                  </div>
                  <span className={isLight ? 'text-slate-300' : 'text-zinc-700'}>|</span>
                  <span className="text-rose-500">💎{playerStats.rubies}</span>
                  {playerStats.statPoints > 0 && (
                    <span className={`px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-bold animate-pulse border ${
                      isLight
                        ? 'bg-purple-100 text-purple-700 border-purple-300'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      +{playerStats.statPoints}P
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Action Icons & Rewards (Daily Bonus, Free Rewards, Theme, Audio, Settings) */}
              <div className="flex items-center gap-1">
                {/* Install Mobile PWA Button */}
                <InstallPwaPrompt isLight={isLight} />

                {/* Daily Bonus Button */}
                <button
                  id="main-daily-bonus-btn"
                  onClick={() => {
                    soundManager.playClick();
                    setShowDailyBonus(true);
                  }}
                  className={`relative px-1.5 sm:px-2.5 py-0.5 sm:py-1 border rounded-lg sm:rounded-xl transition backdrop-blur-md cursor-pointer shadow-sm active:scale-95 flex items-center gap-1 font-bold text-[9px] sm:text-xs ${
                    !hasClaimedToday
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse'
                      : isLight
                      ? 'bg-white/90 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-black/75 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                  title="Daily Sign-In Bonus (2X with Ad!)"
                >
                  <Calendar className="w-3 h-3 text-amber-900 sm:text-amber-500" />
                  <span>DAILY</span>
                  {!hasClaimedToday && (
                    <span className="text-[7px] sm:text-[8px] bg-red-600 text-white font-black px-0.5 rounded uppercase">
                      2X
                    </span>
                  )}
                </button>

                {/* Free Rewards Button */}
                <button
                  id="main-free-rewards-btn"
                  onClick={() => {
                    soundManager.playClick();
                    setShowFreeRewards(true);
                  }}
                  className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 border rounded-lg sm:rounded-xl transition backdrop-blur-md cursor-pointer shadow-sm active:scale-95 flex items-center gap-1 font-bold text-[9px] sm:text-xs bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white border-rose-400/40"
                  title="Watch Ads for Free +5,000 Gold & +5 Gems"
                >
                  <Film className="w-3 h-3" />
                  <span>FREE</span>
                </button>

                {/* Quick Theme Toggle Button */}
                <button
                  id="main-theme-toggle-btn"
                  onClick={handleToggleTheme}
                  className={`p-1 sm:p-1.5 border rounded-lg sm:rounded-xl transition backdrop-blur-md cursor-pointer shadow-sm active:scale-95 flex items-center gap-0.5 font-bold text-[9px] sm:text-xs ${
                    isLight
                      ? 'bg-white/90 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-black/75 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                  title="Toggle White / Dark Screen Theme"
                >
                  {isLight ? (
                    <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500" />
                  ) : (
                    <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 fill-cyan-400" />
                  )}
                </button>

                <button
                  id="main-audio-toggle-btn"
                  onClick={() => {
                    soundManager.init();
                    const next = !settings.soundEnabled;
                    setSettings((prev) => ({ ...prev, soundEnabled: next }));
                    soundManager.setSoundSettings(next, settings.soundVolume);
                  }}
                  className={`p-1 sm:p-1.5 border rounded-lg sm:rounded-xl transition backdrop-blur-md cursor-pointer shadow-sm active:scale-95 ${
                    isLight
                      ? 'bg-white/90 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-black/75 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                  title="Toggle Audio"
                >
                  <Volume2 className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${settings.soundEnabled ? 'text-amber-500' : isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
                </button>

                <button
                  id="main-settings-btn"
                  onClick={() => setShowSettings(true)}
                  className={`p-1 sm:p-1.5 border rounded-lg sm:rounded-xl transition backdrop-blur-md cursor-pointer shadow-sm active:scale-95 ${
                    isLight
                      ? 'bg-white/90 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-black/75 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                  }`}
                  title="Open Game Settings"
                >
                  <SettingsIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* HERO DISPLAY / GAME LOGO / CENTER PIECE */}
          <div className="flex flex-col items-center justify-center my-auto z-10 text-center py-1 sm:py-2 shrink-0">
            {/* Sub-badge */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] sm:text-[9px] font-black tracking-widest uppercase mb-1 shadow-sm backdrop-blur-md ${
              isLight
                ? 'bg-white/90 border-slate-300 text-red-600'
                : 'bg-white/5 border-white/10 text-amber-400'
            }`}>
              <Bot className="w-2.5 h-2.5 text-cyan-500 animate-pulse" />
              <span>CYBER ROBOT DEFENSE RPG</span>
            </div>

            {/* Main Title - Scaled for Mobile Viewports */}
            <h1 className={`text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text drop-shadow-md leading-tight ${
              isLight
                ? 'bg-gradient-to-r from-slate-900 via-red-600 to-indigo-900'
                : 'bg-gradient-to-r from-zinc-100 via-amber-200 to-zinc-400 drop-shadow-[0_4px_14px_rgba(0,0,0,0.8)]'
            }`}>
              STICKMAN GUNNER: ROBOT WARS
            </h1>
            <p className={`text-[10px] sm:text-xs max-w-sm sm:max-w-md mt-0.5 leading-tight font-normal px-2 hidden xs:block ${
              isLight ? 'text-slate-600 font-medium' : 'text-zinc-400'
            }`}>
              Equip weapons, level up cybernetic skills, and defend against rogue combat mechs.
            </p>

            {/* Hero & Pet Companion Showcase Row */}
            <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-xl">
              {/* Selected Hero Showcase Pill */}
              <div className={`flex items-center gap-1.5 border px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-sm backdrop-blur-md ${
                isLight
                  ? 'bg-white/90 border-slate-300 text-slate-900'
                  : 'bg-black/75 border-white/10 text-zinc-100'
              }`}>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeHero.color }} />
                <div className="text-left">
                  <span className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-wider block leading-none ${
                    isLight ? 'text-slate-500' : 'text-zinc-500'
                  }`}>
                    HERO (LV.{activeHero.level})
                  </span>
                  <span className="text-[11px] sm:text-xs font-black leading-tight">{activeHero.name}</span>
                </div>
                <button
                  id="main-change-hero-btn"
                  onClick={() => setShowHeroSelect(true)}
                  className={`ml-1 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold rounded transition cursor-pointer border active:scale-95 ${
                    isLight
                      ? 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border-cyan-300'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  HEROES
                </button>
              </div>

              {/* Active Pet Companion Showcase Pill */}
              {activePet ? (
                <div className={`flex items-center gap-1.5 border px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-sm backdrop-blur-md ${
                  isLight
                    ? 'bg-white/90 border-slate-300 text-slate-900'
                    : 'bg-black/75 border-white/10 text-zinc-100'
                }`}>
                  <div
                    className="w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 border"
                    style={{ backgroundColor: `${activePet.color}25`, borderColor: activePet.color }}
                  >
                    {activePet.icon}
                  </div>
                  <div className="text-left">
                    <span className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-wider block leading-none ${
                      isLight ? 'text-slate-500' : 'text-zinc-500'
                    }`}>
                      PET (LV.{activePet.level}) +{activePet.playerHpBonusPercent}%HP
                    </span>
                    <span className="text-[11px] sm:text-xs font-black text-rose-400 leading-tight">{activePet.name}</span>
                  </div>
                  <button
                    id="main-change-pet-btn"
                    onClick={() => setShowPets(true)}
                    className={`ml-1 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold rounded transition cursor-pointer border active:scale-95 ${
                      isLight
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
                        : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    PETS 🐾
                  </button>
                </div>
              ) : (
                <button
                  id="main-open-pets-btn"
                  onClick={() => setShowPets(true)}
                  className={`flex items-center gap-1 border px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-sm backdrop-blur-md transition cursor-pointer active:scale-95 ${
                    isLight
                      ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800'
                      : 'bg-rose-950/40 hover:bg-rose-950/60 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <span className="text-xs">🐾</span>
                  <span className="text-[9px] sm:text-[10px] font-bold">EQUIP PET (+HP)</span>
                </button>
              )}
            </div>
          </div>

          {/* BOTTOM MENU NAVIGATION BAR: Responsive 1+5 Layout for Mobile & Desktop */}
          <div className="flex flex-col gap-1 sm:gap-1.5 z-10 max-w-3xl mx-auto w-full shrink-0 pb-1">
            {/* Primary Action: START BATTLE Button */}
            <button
              id="main-start-battle-btn"
              onClick={handleStartGame}
              className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 border-b-3 border-red-950 text-white font-black rounded-xl sm:rounded-2xl shadow-[0_4px_16px_rgba(220,38,38,0.35)] transition active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              <span>START BATTLE (DEPLOY)</span>
            </button>

            {/* Secondary 5 Nav Options Grid */}
            <div className="grid grid-cols-5 gap-1">
              {/* Campaign Map */}
              <button
                id="main-campaign-map-btn"
                onClick={() => setShowStageSelect(true)}
                className={`py-1.5 sm:py-2 px-1 border backdrop-blur-md rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-sm min-w-0 ${
                  isLight
                    ? 'bg-white/90 hover:bg-slate-50 border-slate-300 hover:border-amber-500 text-slate-800'
                    : 'bg-black/75 hover:bg-white/10 border-white/10 hover:border-amber-400/40 text-zinc-300 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-tight truncate">MAP</span>
              </button>

              {/* Armory & Guns */}
              <button
                id="main-armory-btn"
                onClick={() => setShowArmory(true)}
                className={`py-1.5 sm:py-2 px-1 border backdrop-blur-md rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-sm min-w-0 ${
                  isLight
                    ? 'bg-white/90 hover:bg-slate-50 border-slate-300 hover:border-cyan-500 text-slate-800'
                    : 'bg-black/75 hover:bg-white/10 border-white/10 hover:border-cyan-400/40 text-zinc-300 hover:text-white'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-tight truncate">ARMORY</span>
              </button>

              {/* Pets & Companions */}
              <button
                id="main-pets-btn"
                onClick={() => setShowPets(true)}
                className={`py-1.5 sm:py-2 px-1 border backdrop-blur-md rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-sm relative min-w-0 ${
                  isLight
                    ? 'bg-white/90 hover:bg-slate-50 border-slate-300 hover:border-rose-500 text-slate-800'
                    : 'bg-black/75 hover:bg-white/10 border-white/10 hover:border-rose-400/40 text-zinc-300 hover:text-white'
                }`}
              >
                <span className="text-xs sm:text-sm shrink-0 leading-none">🐾</span>
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-tight text-rose-400 truncate">PETS</span>
                {activePet && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-black text-[6px] w-3 h-3 rounded-full flex items-center justify-center shadow">
                    ✓
                  </span>
                )}
              </button>

              {/* Stats & Upgrades */}
              <button
                id="main-stats-btn"
                onClick={() => setShowStats(true)}
                className={`py-1.5 sm:py-2 px-1 border backdrop-blur-md rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-sm relative min-w-0 ${
                  isLight
                    ? 'bg-white/90 hover:bg-slate-50 border-slate-300 hover:border-purple-500 text-slate-800'
                    : 'bg-black/75 hover:bg-white/10 border-white/10 hover:border-purple-400/40 text-zinc-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-tight truncate">STATS</span>
                {playerStats.statPoints > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white font-black text-[6px] w-3 h-3 rounded-full flex items-center justify-center shadow animate-pulse">
                    +{playerStats.statPoints}
                  </span>
                )}
              </button>

              {/* Hero Classes & Upgrades */}
              <button
                id="main-heroes-btn"
                onClick={() => setShowHeroSelect(true)}
                className={`py-1.5 sm:py-2 px-1 border backdrop-blur-md rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-sm min-w-0 ${
                  isLight
                    ? 'bg-white/90 hover:bg-slate-50 border-slate-300 hover:border-emerald-500 text-slate-800'
                    : 'bg-black/75 hover:bg-white/10 border-white/10 hover:border-emerald-400/40 text-zinc-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-tight truncate">HEROES</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {currentScreen === 'paused' && !showArmory && !showSettings && (
        <PauseModal
          isLight={isLight}
          onResume={() => setCurrentScreen('playing')}
          onRestart={() => {
            soundManager.playSkill();
            setCurrentScreen('title');
            setTimeout(() => setCurrentScreen('playing'), 50);
          }}
          onOpenArmory={() => {
            setShowArmory(true);
          }}
          onOpenSettings={() => setShowSettings(true)}
          onToggleTheme={handleToggleTheme}
          onQuitToMenu={() => {
            soundManager.stopMusic();
            setCurrentScreen('title');
          }}
        />
      )}

      {/* VICTORY & DEFEAT RESULTS */}
      {(currentScreen === 'victory' || currentScreen === 'game_over') && endGameResult && (
        <VictoryDefeatModal
          isVictory={endGameResult.isVictory}
          stageName={activeStage.name}
          loot={endGameResult.loot}
          isLight={isLight}
          onRetry={() => {
            soundManager.playSkill();
            setCurrentScreen('playing');
          }}
          onNextStage={
            selectedStageId < stages.length
              ? () => {
                  setSelectedStageId((prev) => prev + 1);
                  soundManager.playSkill();
                  setCurrentScreen('playing');
                }
              : undefined
          }
          onOpenArmory={() => {
            setCurrentScreen('title');
            setShowArmory(true);
          }}
        />
      )}

      {/* MODALS */}
      {showArmory && (
        <ArmoryModal
          weapons={weapons}
          gear={gear}
          playerStats={playerStats}
          equippedWeaponIds={equippedWeaponIds}
          inBattle={currentScreen === 'playing' || currentScreen === 'paused'}
          theme={settings.theme}
          onEquipWeapon={handleEquipWeapon}
          onUpgradeWeapon={handleUpgradeWeapon}
          onBuyWeapon={handleBuyWeapon}
          onEquipGear={handleEquipGear}
          onBuyGear={handleBuyGear}
          onOpenFreeRewards={() => setShowFreeRewards(true)}
          onResumeBattle={() => {
            setShowArmory(false);
            setCurrentScreen('playing');
          }}
          onClose={() => setShowArmory(false)}
        />
      )}

      {showDailyBonus && (
        <DailyBonusModal
          currentDay={dailyBonusState.currentDay}
          hasClaimedToday={hasClaimedToday}
          isLight={isLight}
          onClaim={handleClaimDailyBonus}
          onClose={() => setShowDailyBonus(false)}
        />
      )}

      {showFreeRewards && (
        <FreeRewardsModal
          isLight={isLight}
          onWatchAdForGold={() => {
            setShowFreeRewards(false);
            setActiveRewardedAd({
              type: 'free_gold',
              title: 'Free 5,000 Gold Bounty',
              icon: '💰'
            });
          }}
          onWatchAdForGems={() => {
            setShowFreeRewards(false);
            setActiveRewardedAd({
              type: 'free_gems',
              title: 'Free 5 Gems (Rubies)',
              icon: '💎'
            });
          }}
          onClose={() => setShowFreeRewards(false)}
        />
      )}

      {activeRewardedAd && (
        <RewardedAdModal
          rewardTitle={activeRewardedAd.title}
          rewardIcon={activeRewardedAd.icon}
          onRewardComplete={handleRewardedAdComplete}
          onClose={() => setActiveRewardedAd(null)}
        />
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/90 border border-amber-500/50 text-white px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none"
        >
          <span className="text-lg">{toastMessage.icon}</span>
          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono tracking-wide">
            {toastMessage.text}
          </span>
        </div>
      )}

      {showStats && (
        <StatsUpgradeModal
          playerStats={playerStats}
          theme={settings.theme}
          onAllocateStat={handleAllocateStat}
          onClose={() => setShowStats(false)}
        />
      )}

      {showPets && (
        <PetModal
          pets={pets}
          equippedPetId={equippedPetId}
          playerStats={playerStats}
          theme={settings.theme}
          onEquipPet={handleEquipPet}
          onUnlockPet={handleUnlockPet}
          onUpgradePet={handleUpgradePet}
          onClose={() => setShowPets(false)}
        />
      )}

      {showHeroSelect && (
        <HeroSelectModal
          heroes={heroes}
          selectedHeroId={selectedHeroId}
          playerStats={playerStats}
          theme={settings.theme}
          onSelectHero={(id) => {
            setSelectedHeroId(id);
            const h = heroes.find((hero) => hero.id === id);
            if (h) {
              setWeapons((prev) =>
                prev.map((w) => (w.id === h.startingWeaponId ? { ...w, unlocked: true } : w))
              );
              setEquippedWeaponIds([h.startingWeaponId, null]);
            }
          }}
          onUnlockHero={handleUnlockHero}
          onUpgradeHero={handleUpgradeHero}
          onUpgradeHeroSkill={handleUpgradeHeroSkill}
          onClose={() => setShowHeroSelect(false)}
        />
      )}

      {showStageSelect && (
        <StageSelectModal
          stages={stages}
          selectedStageId={selectedStageId}
          theme={settings.theme}
          onSelectStage={(stage) => {
            setSelectedStageId(stage.id);
            setShowStageSelect(false);
            handleStartGame();
          }}
          onClose={() => setShowStageSelect(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
          onClose={() => setShowSettings(false)}
          onOpenMonetization={() => setShowMonetization(true)}
        />
      )}

      {showMonetization && (
        <MonetizationModal
          theme={settings.theme}
          onClose={() => setShowMonetization(false)}
          onTestRewardedAd={() => {
            setShowMonetization(false);
            setActiveRewardedAd({
              type: 'free_gold',
              title: 'AdSense Rewarded Video Test',
              icon: '💰'
            });
          }}
        />
      )}
    </div>
  );
}
