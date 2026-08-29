import { Stage } from '../types/game';

// 50-Stage Full Campaign for Stickman Gunner: Robot Wars
// Spanning 10 dynamic thematic sectors with progressive enemies, escalating waves, boss battles & bounties

export const STAGES: Stage[] = [
  // ==========================================
  // SECTOR 1: SCRAP FOUNDRY & RUSTLANDS (1 - 5)
  // ==========================================
  {
    id: 1,
    name: 'Sector 7 Scrap Foundry',
    environment: 'factory',
    description: 'An abandoned industrial munitions factory overrun by rogue scrap droids, blade runners, and the MK-1 Titan Mech Behemoth.',
    rewardGold: 900,
    rewardRubies: 6,
    rewardExp: 700,
    unlocked: true,
    stars: 0,
    bgSkyColor: '#0f172a',
    bgGroundColor: '#1e293b',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 14,
        spawnInterval: 1.5,
        enemyTypes: [
          { type: 'zombie', weight: 70 },
          { type: 'runner', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 22,
        spawnInterval: 1.2,
        enemyTypes: [
          { type: 'zombie', weight: 50 },
          { type: 'runner', weight: 30 },
          { type: 'bat', weight: 20 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 32,
        spawnInterval: 1.0,
        enemyTypes: [
          { type: 'zombie', weight: 40 },
          { type: 'runner', weight: 25 },
          { type: 'spider_drone', weight: 20 },
          { type: 'shielded', weight: 15 }
        ],
        boss: {
          type: 'boss',
          name: 'MK-1 Titan Mech Behemoth',
          hp: 1400,
          damage: 26,
          color: '#38bdf8'
        }
      }
    ]
  },
  {
    id: 2,
    name: 'Rustland Junkyard Perimeter',
    environment: 'wasteland',
    description: 'Debris-choked salvage dunes infested with rapid quad-legged spider drones and suicide bomb bots.',
    rewardGold: 1200,
    rewardRubies: 8,
    rewardExp: 950,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#1e1b18',
    bgGroundColor: '#2d241e',
    accentColor: '#fb923c',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 18,
        spawnInterval: 1.3,
        enemyTypes: [
          { type: 'zombie', weight: 50 },
          { type: 'spider_drone', weight: 35 },
          { type: 'runner', weight: 15 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 26,
        spawnInterval: 1.1,
        enemyTypes: [
          { type: 'spider_drone', weight: 40 },
          { type: 'kamikaze_drone', weight: 25 },
          { type: 'skeleton', weight: 35 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 36,
        spawnInterval: 0.95,
        enemyTypes: [
          { type: 'spider_drone', weight: 35 },
          { type: 'kamikaze_drone', weight: 25 },
          { type: 'shielded', weight: 25 },
          { type: 'sniper', weight: 15 }
        ],
        boss: {
          type: 'boss',
          name: 'Scrap Scavenger Warlord',
          hp: 1800,
          damage: 30,
          color: '#f97316'
        }
      }
    ]
  },
  {
    id: 3,
    name: 'Smelting Furnace Outpost',
    environment: 'factory',
    description: 'Superheated smelters churning out combat drones under the command of armored aegis sentinels.',
    rewardGold: 1500,
    rewardRubies: 10,
    rewardExp: 1200,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#1a1016',
    bgGroundColor: '#2b1b24',
    accentColor: '#f43f5e',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 20,
        spawnInterval: 1.2,
        enemyTypes: [
          { type: 'skeleton', weight: 50 },
          { type: 'runner', weight: 30 },
          { type: 'bat', weight: 20 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 30,
        spawnInterval: 1.0,
        enemyTypes: [
          { type: 'shielded', weight: 35 },
          { type: 'spider_drone', weight: 35 },
          { type: 'sniper', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 40,
        spawnInterval: 0.85,
        enemyTypes: [
          { type: 'shielded', weight: 30 },
          { type: 'kamikaze_drone', weight: 25 },
          { type: 'mutant', weight: 25 },
          { type: 'sniper', weight: 20 }
        ],
        boss: {
          type: 'boss',
          name: 'Furnace Warden Core',
          hp: 2200,
          damage: 34,
          color: '#f43f5e'
        }
      }
    ]
  },
  {
    id: 4,
    name: 'Conveyor Line Assembly',
    environment: 'factory',
    description: 'Automated assembly tracks churning out stealth infiltrator assassin bots and mortar artillery.',
    rewardGold: 1800,
    rewardRubies: 12,
    rewardExp: 1450,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#091522',
    bgGroundColor: '#132337',
    accentColor: '#0ea5e9',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 22,
        spawnInterval: 1.2,
        enemyTypes: [
          { type: 'zombie', weight: 40 },
          { type: 'stealth_assassin', weight: 30 },
          { type: 'runner', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 32,
        spawnInterval: 1.0,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 35 },
          { type: 'mortar_artillery', weight: 25 },
          { type: 'bat', weight: 20 },
          { type: 'spider_drone', weight: 20 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 44,
        spawnInterval: 0.85,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 30 },
          { type: 'mortar_artillery', weight: 25 },
          { type: 'golem', weight: 25 },
          { type: 'kamikaze_drone', weight: 20 }
        ],
        boss: {
          type: 'boss',
          name: 'Assembly Line Commander DX',
          hp: 2700,
          damage: 38,
          color: '#0ea5e9'
        }
      }
    ]
  },
  {
    id: 5,
    name: 'Sector 1 Excavator Colossus [BOSS]',
    environment: 'wasteland',
    description: 'The monumental industrial mining excavator has gone fully autonomous and is obliterating anything in its path.',
    rewardGold: 2500,
    rewardRubies: 20,
    rewardExp: 2000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#1f130b',
    bgGroundColor: '#382012',
    accentColor: '#eab308',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 24,
        spawnInterval: 1.1,
        enemyTypes: [
          { type: 'spider_drone', weight: 40 },
          { type: 'stealth_assassin', weight: 30 },
          { type: 'kamikaze_drone', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 36,
        spawnInterval: 0.9,
        enemyTypes: [
          { type: 'golem', weight: 30 },
          { type: 'mortar_artillery', weight: 25 },
          { type: 'sniper', weight: 25 },
          { type: 'kamikaze_drone', weight: 20 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 50,
        spawnInterval: 0.75,
        enemyTypes: [
          { type: 'plasma_tank', weight: 25 },
          { type: 'stealth_assassin', weight: 25 },
          { type: 'shielded', weight: 25 },
          { type: 'spider_drone', weight: 25 }
        ],
        boss: {
          type: 'boss',
          name: 'Giga-Drill Mining Colossus',
          hp: 3600,
          damage: 45,
          color: '#eab308'
        }
      }
    ]
  },

  // ==========================================
  // SECTOR 2: NEO-CYBER CITY GRID (6 - 10)
  // ==========================================
  {
    id: 6,
    name: 'Neo-Cyber City Grid',
    environment: 'city',
    description: 'Neon-lit metropolis under martial lockdown by combat androids, laser sniper droids, and the levitating Cyber Core X-90.',
    rewardGold: 2800,
    rewardRubies: 22,
    rewardExp: 2300,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#171226',
    bgGroundColor: '#251b3d',
    accentColor: '#a855f7',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 26,
        spawnInterval: 1.2,
        enemyTypes: [
          { type: 'skeleton', weight: 60 },
          { type: 'runner', weight: 40 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 36,
        spawnInterval: 1.0,
        enemyTypes: [
          { type: 'skeleton', weight: 40 },
          { type: 'sniper', weight: 30 },
          { type: 'shielded', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 48,
        spawnInterval: 0.85,
        enemyTypes: [
          { type: 'skeleton', weight: 30 },
          { type: 'necromancer', weight: 25 },
          { type: 'shielded', weight: 25 },
          { type: 'bat', weight: 20 }
        ],
        boss: {
          type: 'boss',
          name: 'Cyber Lich Core X-90',
          hp: 4200,
          damage: 48,
          color: '#c084fc'
        }
      }
    ]
  },
  {
    id: 7,
    name: 'Downtown Sky-Transit Overpass',
    environment: 'city',
    description: 'High-speed hover rail expressway with EMP shockwave disrupters and hover tanks firing plasma.',
    rewardGold: 3100,
    rewardRubies: 24,
    rewardExp: 2600,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#111827',
    bgGroundColor: '#1f2937',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 28,
        spawnInterval: 1.1,
        enemyTypes: [
          { type: 'emp_disrupter', weight: 35 },
          { type: 'plasma_tank', weight: 25 },
          { type: 'runner', weight: 40 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 40,
        spawnInterval: 0.95,
        enemyTypes: [
          { type: 'emp_disrupter', weight: 30 },
          { type: 'plasma_tank', weight: 30 },
          { type: 'sniper', weight: 25 },
          { type: 'spider_drone', weight: 15 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 52,
        spawnInterval: 0.8,
        enemyTypes: [
          { type: 'plasma_tank', weight: 30 },
          { type: 'emp_disrupter', weight: 25 },
          { type: 'stealth_assassin', weight: 25 },
          { type: 'kamikaze_drone', weight: 20 }
        ],
        boss: {
          type: 'boss',
          name: 'Sky-Transit Enforcer Prime',
          hp: 4800,
          damage: 52,
          color: '#38bdf8'
        }
      }
    ]
  },
  {
    id: 8,
    name: 'Cyber-Corp Datacenter Boulevard',
    environment: 'city',
    description: 'Corporate server hubs protected by nanite repair drones that continuously heal advancing robot battalions.',
    rewardGold: 3400,
    rewardRubies: 26,
    rewardExp: 2900,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0a192f',
    bgGroundColor: '#172a45',
    accentColor: '#10b981',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 30,
        spawnInterval: 1.1,
        enemyTypes: [
          { type: 'nanite_healer', weight: 30 },
          { type: 'shielded', weight: 40 },
          { type: 'skeleton', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 42,
        spawnInterval: 0.9,
        enemyTypes: [
          { type: 'nanite_healer', weight: 30 },
          { type: 'minigun_juggernaut', weight: 25 },
          { type: 'sniper', weight: 25 },
          { type: 'emp_disrupter', weight: 20 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 56,
        spawnInterval: 0.75,
        enemyTypes: [
          { type: 'nanite_healer', weight: 25 },
          { type: 'minigun_juggernaut', weight: 30 },
          { type: 'plasma_tank', weight: 25 },
          { type: 'stealth_assassin', weight: 20 }
        ],
        boss: {
          type: 'boss',
          name: 'Datacenter Mainframe AI Warden',
          hp: 5500,
          damage: 56,
          color: '#10b981'
        }
      }
    ]
  },
  {
    id: 9,
    name: 'Neon Skyscraper Rooftops',
    environment: 'city',
    description: 'Rooftop landing pads battered by aerial gunships, kamikaze drones, and elite rail snipers.',
    rewardGold: 3800,
    rewardRubies: 28,
    rewardExp: 3300,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#190a28',
    bgGroundColor: '#2b163d',
    accentColor: '#ec4899',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 32,
        spawnInterval: 1.0,
        enemyTypes: [
          { type: 'bat', weight: 40 },
          { type: 'sniper', weight: 35 },
          { type: 'kamikaze_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 46,
        spawnInterval: 0.85,
        enemyTypes: [
          { type: 'bat', weight: 30 },
          { type: 'mortar_artillery', weight: 25 },
          { type: 'stealth_assassin', weight: 25 },
          { type: 'emp_disrupter', weight: 20 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 60,
        spawnInterval: 0.7,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 30 },
          { type: 'mortar_artillery', weight: 25 },
          { type: 'nanite_healer', weight: 20 },
          { type: 'kamikaze_drone', weight: 25 }
        ],
        boss: {
          type: 'boss',
          name: 'Sky-Reaver Gunship Mech',
          hp: 6200,
          damage: 60,
          color: '#ec4899'
        }
      }
    ]
  },
  {
    id: 10,
    name: 'Sector 2 Apex: Aero-Fortress Zenith [BOSS]',
    environment: 'city',
    description: 'The supreme city-defense dreadnought aerial fortress descends to incinerate the stickman resistance.',
    rewardGold: 4500,
    rewardRubies: 35,
    rewardExp: 4000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0e1726',
    bgGroundColor: '#1b2a41',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 35,
        spawnInterval: 0.95,
        enemyTypes: [
          { type: 'plasma_tank', weight: 30 },
          { type: 'emp_disrupter', weight: 30 },
          { type: 'nanite_healer', weight: 20 },
          { type: 'stealth_assassin', weight: 20 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 50,
        spawnInterval: 0.8,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 30 },
          { type: 'mortar_artillery', weight: 25 },
          { type: 'kamikaze_drone', weight: 25 },
          { type: 'spider_drone', weight: 20 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 65,
        spawnInterval: 0.65,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 25 },
          { type: 'plasma_tank', weight: 25 },
          { type: 'nanite_healer', weight: 25 },
          { type: 'stealth_assassin', weight: 25 }
        ],
        boss: {
          type: 'boss',
          name: 'Aero-Fortress Dreadnought Zenith',
          hp: 7500,
          damage: 68,
          color: '#06b6d4'
        }
      }
    ]
  },

  // ==========================================
  // SECTOR 3: AUTOMATED ORDNANCE & WEAPONS FACTORY (11 - 15)
  // ==========================================
  {
    id: 11,
    name: 'Heavy Munitions Armory',
    environment: 'factory',
    description: 'High-caliber weapon production lines defended by rotary minigun juggernauts and heavy tank treads.',
    rewardGold: 4800,
    rewardRubies: 38,
    rewardExp: 4300,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#1c1917',
    bgGroundColor: '#292524',
    accentColor: '#f59e0b',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 34,
        spawnInterval: 1.0,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'mutant', weight: 35 },
          { type: 'runner', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 48,
        spawnInterval: 0.85,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 64,
        spawnInterval: 0.7,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'shielded', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Mecha Overlord Omega 3000',
          hp: 8200,
          damage: 72,
          color: '#f59e0b'
        }
      }
    ]
  },
  {
    id: 12,
    name: 'Laser Matrix Calibration Bay',
    environment: 'cyber',
    description: 'Prismatic laser testing chambers filled with precision rail snipers and photon phantom spectres.',
    rewardGold: 5200,
    rewardRubies: 40,
    rewardExp: 4700,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0f172a',
    bgGroundColor: '#1e293b',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 36,
        spawnInterval: 0.95,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'sniper', weight: 35 },
          { type: 'stealth_assassin', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 50,
        spawnInterval: 0.8,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'emp_disrupter', weight: 35 },
          { type: 'plasma_tank', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 66,
        spawnInterval: 0.65,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 30 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 35 }
        ],
        boss: {
          type: 'boss',
          name: 'Photon Array Colossus',
          hp: 8900,
          damage: 76,
          color: '#38bdf8'
        }
      }
    ]
  },
  {
    id: 13,
    name: 'Missile Silo Loading Deck',
    environment: 'factory',
    description: 'Heavy missile gantries where siege mortar mechs rain down carpet-bombing barrages.',
    rewardGold: 5600,
    rewardRubies: 42,
    rewardExp: 5100,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#1e1b18',
    bgGroundColor: '#302823',
    accentColor: '#ea580c',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 38,
        spawnInterval: 0.9,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 40 },
          { type: 'kamikaze_drone', weight: 35 },
          { type: 'shielded', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 54,
        spawnInterval: 0.75,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 70,
        spawnInterval: 0.6,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 30 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'stealth_assassin', weight: 35 }
        ],
        boss: {
          type: 'boss',
          name: 'Silo Ballistic Artillery Prime',
          hp: 9600,
          damage: 80,
          color: '#ea580c'
        }
      }
    ]
  },
  {
    id: 14,
    name: 'Kinetic Barrier Research Labs',
    environment: 'cyber',
    description: 'Advanced shield prototype sector where aegis barrier droids form invincible rolling walls.',
    rewardGold: 6000,
    rewardRubies: 45,
    rewardExp: 5500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0a192f',
    bgGroundColor: '#112240',
    accentColor: '#06b6d4',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 40,
        spawnInterval: 0.85,
        enemyTypes: [
          { type: 'shielded', weight: 45 },
          { type: 'emp_disrupter', weight: 30 },
          { type: 'nanite_healer', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 56,
        spawnInterval: 0.7,
        enemyTypes: [
          { type: 'shielded', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 74,
        spawnInterval: 0.55,
        enemyTypes: [
          { type: 'shielded', weight: 30 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'nanite_healer', weight: 35 }
        ],
        boss: {
          type: 'boss',
          name: 'Aegis Forcefield Over-Titan',
          hp: 10400,
          damage: 84,
          color: '#06b6d4'
        }
      }
    ]
  },
  {
    id: 15,
    name: 'Sector 3 Apex: Chrono-Phase Infiltrator Prime [BOSS]',
    environment: 'cyber',
    description: 'The master stealth-teleporting cyber assassin capable of warping across temporal dimensions.',
    rewardGold: 7000,
    rewardRubies: 55,
    rewardExp: 6500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#171226',
    bgGroundColor: '#2b1c42',
    accentColor: '#c084fc',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 42,
        spawnInterval: 0.8,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 40 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'kamikaze_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 60,
        spawnInterval: 0.65,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 80,
        spawnInterval: 0.5,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 30 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'mortar_artillery', weight: 35 }
        ],
        boss: {
          type: 'boss',
          name: 'Chrono-Phase Infiltrator Prime',
          hp: 11500,
          damage: 92,
          color: '#c084fc'
        }
      }
    ]
  },

  // ==========================================
  // SECTOR 4: TOXIC NANITE SEWERS & SUB-CORE (16 - 20)
  // ==========================================
  {
    id: 16,
    name: 'Toxic Sludge Filtration Conduit',
    environment: 'crypt',
    description: 'Flooded subterranean conduits overrun by corrosive acid spider bots and bio-mechanical horrors.',
    rewardGold: 7400,
    rewardRubies: 58,
    rewardExp: 6900,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0a1e14',
    bgGroundColor: '#142e20',
    accentColor: '#10b981',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 44,
        spawnInterval: 0.85,
        enemyTypes: [
          { type: 'spider_drone', weight: 50 },
          { type: 'mutant', weight: 30 },
          { type: 'kamikaze_drone', weight: 20 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 62,
        spawnInterval: 0.7,
        enemyTypes: [
          { type: 'spider_drone', weight: 40 },
          { type: 'necromancer', weight: 35 },
          { type: 'nanite_healer', weight: 25 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 82,
        spawnInterval: 0.55,
        enemyTypes: [
          { type: 'spider_drone', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Bio-Mech Pestilence Engine',
          hp: 12200,
          damage: 96,
          color: '#10b981'
        }
      }
    ]
  },
  {
    id: 17,
    name: 'Sub-City Corrosive Drainage',
    environment: 'crypt',
    description: 'Caustic waterways with stealth stalkers and relentless kamikaze bomb swarms.',
    rewardGold: 7800,
    rewardRubies: 60,
    rewardExp: 7300,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0e1f1a',
    bgGroundColor: '#183029',
    accentColor: '#2dd4bf',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 46,
        spawnInterval: 0.8,
        enemyTypes: [
          { type: 'spider_drone', weight: 40 },
          { type: 'kamikaze_drone', weight: 35 },
          { type: 'stealth_assassin', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 64,
        spawnInterval: 0.65,
        enemyTypes: [
          { type: 'kamikaze_drone', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 84,
        spawnInterval: 0.5,
        enemyTypes: [
          { type: 'spider_drone', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'emp_disrupter', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Corrosive Hydra Core',
          hp: 13000,
          damage: 100,
          color: '#2dd4bf'
        }
      }
    ]
  },
  {
    id: 18,
    name: 'Nanite Mutation Nursery',
    environment: 'crypt',
    description: 'Vats of self-replicating nanite fluid creating super-heavy cyber mutant monstrosities.',
    rewardGold: 8200,
    rewardRubies: 62,
    rewardExp: 7700,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#150f21',
    bgGroundColor: '#261b3b',
    accentColor: '#a855f7',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 48,
        spawnInterval: 0.75,
        enemyTypes: [
          { type: 'mutant', weight: 45 },
          { type: 'spider_drone', weight: 35 },
          { type: 'necromancer', weight: 20 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 66,
        spawnInterval: 0.6,
        enemyTypes: [
          { type: 'mutant', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 88,
        spawnInterval: 0.48,
        enemyTypes: [
          { type: 'mutant', weight: 30 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'plasma_tank', weight: 35 }
        ],
        boss: {
          type: 'boss',
          name: 'Nanite Behemoth Aberration',
          hp: 13800,
          damage: 104,
          color: '#a855f7'
        }
      }
    ]
  },
  {
    id: 19,
    name: 'Toxic Pump Station Gamma',
    environment: 'factory',
    description: 'Massive turbine pumps spewing bio-toxins while EMP disrupters scramble weapon targeting.',
    rewardGold: 8600,
    rewardRubies: 65,
    rewardExp: 8100,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0a1e1b',
    bgGroundColor: '#12302b',
    accentColor: '#14b8a6',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 50,
        spawnInterval: 0.75,
        enemyTypes: [
          { type: 'emp_disrupter', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'spider_drone', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 70,
        spawnInterval: 0.6,
        enemyTypes: [
          { type: 'emp_disrupter', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 92,
        spawnInterval: 0.45,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Turbine Overcharger Mech',
          hp: 14700,
          damage: 108,
          color: '#14b8a6'
        }
      }
    ]
  },
  {
    id: 20,
    name: 'Sector 4 Apex: Plasma Titan Overcharge 9000 [BOSS]',
    environment: 'crypt',
    description: 'The apex plasma-powered titan channeling the entire sewer grid electrical grid into catastrophic energy waves.',
    rewardGold: 9800,
    rewardRubies: 75,
    rewardExp: 9300,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#061727',
    bgGroundColor: '#0e263d',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 52,
        spawnInterval: 0.7,
        enemyTypes: [
          { type: 'plasma_tank', weight: 40 },
          { type: 'emp_disrupter', weight: 35 },
          { type: 'nanite_healer', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 74,
        spawnInterval: 0.55,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'stealth_assassin', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 96,
        spawnInterval: 0.42,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Plasma Titan Overcharge 9000',
          hp: 16000,
          damage: 115,
          color: '#0284c7'
        }
      }
    ]
  },

  // ==========================================
  // SECTOR 5: SUB-ZERO CRYO-STORAGE CITADEL (21 - 25)
  // ==========================================
  {
    id: 21,
    name: 'Cryo-Stasis Chamber Entrance',
    environment: 'cyber',
    description: 'Sub-zero containment sectors where cryo-drones freeze and slow down hero movement.',
    rewardGold: 10200,
    rewardRubies: 78,
    rewardExp: 9700,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#081726',
    bgGroundColor: '#122538',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 54,
        spawnInterval: 0.75,
        enemyTypes: [
          { type: 'skeleton', weight: 40 },
          { type: 'sniper', weight: 35 },
          { type: 'bat', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 76,
        spawnInterval: 0.6,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'shielded', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 98,
        spawnInterval: 0.45,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'stealth_assassin', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Cryo-Stalker Absolute Zero',
          hp: 17200,
          damage: 120,
          color: '#38bdf8'
        }
      }
    ]
  },
  {
    id: 22,
    name: 'Glacial Supercomputing Vault',
    environment: 'cyber',
    description: 'Liquid nitrogen cooled processor arrays guarded by teleporting void spectres and EMP cores.',
    rewardGold: 10600,
    rewardRubies: 80,
    rewardExp: 10100,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0a1d30',
    bgGroundColor: '#162e47',
    accentColor: '#7dd3fc',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 56,
        spawnInterval: 0.7,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 40 },
          { type: 'emp_disrupter', weight: 35 },
          { type: 'kamikaze_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 78,
        spawnInterval: 0.55,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 100,
        spawnInterval: 0.42,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Glacial Node Overmind',
          hp: 18400,
          damage: 125,
          color: '#7dd3fc'
        }
      }
    ]
  },
  {
    id: 23,
    name: 'Frostbite Heavy Defense Line',
    environment: 'cyber',
    description: 'Fortified ice trenches where heavy shield titans and mortar batteries pin down gunners.',
    rewardGold: 11000,
    rewardRubies: 82,
    rewardExp: 10500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0c1b2b',
    bgGroundColor: '#172c42',
    accentColor: '#67e8f9',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 58,
        spawnInterval: 0.7,
        enemyTypes: [
          { type: 'shielded', weight: 40 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'spider_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 80,
        spawnInterval: 0.52,
        enemyTypes: [
          { type: 'shielded', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 104,
        spawnInterval: 0.4,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Frost-Iron Aegis Dreadnought',
          hp: 19600,
          damage: 130,
          color: '#67e8f9'
        }
      }
    ]
  },
  {
    id: 24,
    name: 'Permafrost Nanite Incubator',
    environment: 'cyber',
    description: 'Cryo-nanites assembling relentless waves of stealth assassins and repair drones.',
    rewardGold: 11500,
    rewardRubies: 85,
    rewardExp: 11000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#071524',
    bgGroundColor: '#102236',
    accentColor: '#bae6fd',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 60,
        spawnInterval: 0.65,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 40 },
          { type: 'nanite_healer', weight: 35 },
          { type: 'kamikaze_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 84,
        spawnInterval: 0.5,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 108,
        spawnInterval: 0.38,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Cryo-Weaver Architect',
          hp: 20800,
          damage: 135,
          color: '#bae6fd'
        }
      }
    ]
  },
  {
    id: 25,
    name: 'Sector 5 Apex: Nanite Hive Queen Matrix [BOSS]',
    environment: 'cyber',
    description: 'The supreme intelligence orchestrating the cryo-vault nanite swarms with devastating multi-target beam cannons.',
    rewardGold: 13000,
    rewardRubies: 100,
    rewardExp: 12500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#061320',
    bgGroundColor: '#0e2033',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 62,
        spawnInterval: 0.6,
        enemyTypes: [
          { type: 'nanite_healer', weight: 35 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'plasma_tank', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 88,
        spawnInterval: 0.48,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 115,
        spawnInterval: 0.35,
        enemyTypes: [
          { type: 'nanite_healer', weight: 30 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'phantom_spectre', weight: 35 }
        ],
        boss: {
          type: 'boss',
          name: 'Nanite Hive Queen Matrix',
          hp: 22500,
          damage: 145,
          color: '#0284c7'
        }
      }
    ]
  },

  // ==========================================
  // SECTOR 6: MOLTEN CYBER-CORE & VOLCANIC FORGE (26 - 30)
  // ==========================================
  {
    id: 26,
    name: 'Molten Cyber Core & Forge',
    environment: 'inferno',
    description: 'The volcanic power generator where rogue automata build extinction weapons, guarded by the Inferno Cyber-Demon Mech Supreme.',
    rewardGold: 13500,
    rewardRubies: 105,
    rewardExp: 13000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#2b0c0c',
    bgGroundColor: '#3d1212',
    accentColor: '#ef4444',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 64,
        spawnInterval: 0.65,
        enemyTypes: [
          { type: 'golem', weight: 40 },
          { type: 'runner', weight: 30 },
          { type: 'sniper', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 90,
        spawnInterval: 0.5,
        enemyTypes: [
          { type: 'golem', weight: 35 },
          { type: 'shielded', weight: 35 },
          { type: 'necromancer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 118,
        spawnInterval: 0.38,
        enemyTypes: [
          { type: 'golem', weight: 35 },
          { type: 'mutant', weight: 35 },
          { type: 'necromancer', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Inferno Cyber-Demon Mech Supreme',
          hp: 24000,
          damage: 155,
          color: '#dc2626'
        }
      }
    ]
  },
  {
    id: 27,
    name: 'Lava-Fall Geothermal Tap',
    environment: 'inferno',
    description: 'Platforms suspended over roaring magma lakes with plasma tanks and mortar batteries firing incinerating rounds.',
    rewardGold: 14000,
    rewardRubies: 110,
    rewardExp: 13500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#330f0f',
    bgGroundColor: '#451616',
    accentColor: '#f97316',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 66,
        spawnInterval: 0.6,
        enemyTypes: [
          { type: 'plasma_tank', weight: 40 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'kamikaze_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 92,
        spawnInterval: 0.48,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 122,
        spawnInterval: 0.35,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Magma-Surge Behemoth',
          hp: 25500,
          damage: 162,
          color: '#f97316'
        }
      }
    ]
  },
  {
    id: 28,
    name: 'Crucible Armor Foundry',
    environment: 'inferno',
    description: 'Forges pounding out obsidian war-plating for ultra-armored minigun mechs and aegis tanks.',
    rewardGold: 14500,
    rewardRubies: 115,
    rewardExp: 14000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#260808',
    bgGroundColor: '#360e0e',
    accentColor: '#fb923c',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 68,
        spawnInterval: 0.6,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 40 },
          { type: 'shielded', weight: 35 },
          { type: 'spider_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 95,
        spawnInterval: 0.45,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 125,
        spawnInterval: 0.34,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Obsidian Forge Juggernaut',
          hp: 27000,
          damage: 170,
          color: '#fb923c'
        }
      }
    ]
  },
  {
    id: 29,
    name: 'Thermonuclear Exhaust Vents',
    environment: 'inferno',
    description: 'Thermal vents pulsating with EMP discharge and swarms of rapid suicide bomb drones.',
    rewardGold: 15000,
    rewardRubies: 120,
    rewardExp: 14500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#200707',
    bgGroundColor: '#300b0b',
    accentColor: '#f43f5e',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 70,
        spawnInterval: 0.55,
        enemyTypes: [
          { type: 'kamikaze_drone', weight: 40 },
          { type: 'emp_disrupter', weight: 35 },
          { type: 'stealth_assassin', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 98,
        spawnInterval: 0.42,
        enemyTypes: [
          { type: 'kamikaze_drone', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 130,
        spawnInterval: 0.32,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Thermonuclear Blast-Core',
          hp: 28500,
          damage: 178,
          color: '#f43f5e'
        }
      }
    ]
  },
  {
    id: 30,
    name: 'Sector 6 Apex: Heavy Armored Siege Rail-Cannon Mech [BOSS]',
    environment: 'inferno',
    description: 'The crowning achievement of volcanic robotics: an impregnable dreadnought equipped with dual ultra-railguns.',
    rewardGold: 16500,
    rewardRubies: 135,
    rewardExp: 16000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#1c0505',
    bgGroundColor: '#2b0808',
    accentColor: '#ef4444',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 72,
        spawnInterval: 0.52,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 102,
        spawnInterval: 0.4,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 135,
        spawnInterval: 0.3,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Heavy Armored Siege Rail-Cannon Mech',
          hp: 31000,
          damage: 188,
          color: '#b91c1c'
        }
      }
    ]
  },

  // ==========================================
  // SECTOR 7: ORBITAL SPACE ELEVATOR & SKY CITADEL (31 - 35)
  // ==========================================
  {
    id: 31,
    name: 'Orbital Elevator Base Platform',
    environment: 'cyber',
    description: 'The monumental tether ascending into low orbit, defended by zero-gravity drone swarms and rail snipers.',
    rewardGold: 17000,
    rewardRubies: 140,
    rewardExp: 16500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0a0f1d',
    bgGroundColor: '#131b2e',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 74,
        spawnInterval: 0.52,
        enemyTypes: [
          { type: 'bat', weight: 40 },
          { type: 'sniper', weight: 35 },
          { type: 'emp_disrupter', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 104,
        spawnInterval: 0.4,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 138,
        spawnInterval: 0.28,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Orbital Kinetic Strike Sentry',
          hp: 33000,
          damage: 195,
          color: '#38bdf8'
        }
      }
    ]
  },
  {
    id: 32,
    name: 'Stratosphere Ascent Ring',
    environment: 'cyber',
    description: 'Climbing through storm clouds at Mach 3 while repelling high-velocity aerial interceptor bots.',
    rewardGold: 17600,
    rewardRubies: 145,
    rewardExp: 17000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#050c17',
    bgGroundColor: '#0d1726',
    accentColor: '#60a5fa',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 76,
        spawnInterval: 0.5,
        enemyTypes: [
          { type: 'bat', weight: 35 },
          { type: 'kamikaze_drone', weight: 35 },
          { type: 'stealth_assassin', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 108,
        spawnInterval: 0.38,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 142,
        spawnInterval: 0.26,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'emp_disrupter', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Stratosphere Storm-Caller',
          hp: 35000,
          damage: 205,
          color: '#60a5fa'
        }
      }
    ]
  },
  {
    id: 33,
    name: 'Solar Array Maintenance Hub',
    environment: 'cyber',
    description: 'Miles of reflective solar mirrors focusing intense particle beams on advancing gunners.',
    rewardGold: 18200,
    rewardRubies: 150,
    rewardExp: 17600,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#08101e',
    bgGroundColor: '#101e33',
    accentColor: '#fbbf24',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 78,
        spawnInterval: 0.48,
        enemyTypes: [
          { type: 'sniper', weight: 40 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'spider_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 110,
        spawnInterval: 0.36,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 145,
        spawnInterval: 0.25,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'shielded', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Helios Beam Annihilator',
          hp: 37000,
          damage: 215,
          color: '#fbbf24'
        }
      }
    ]
  },
  {
    id: 34,
    name: 'Zero-G Docking Spire',
    environment: 'cyber',
    description: 'Weightless combat gantries where automated assault armadas dock and refuel.',
    rewardGold: 18800,
    rewardRubies: 155,
    rewardExp: 18200,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#030812',
    bgGroundColor: '#081324',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 80,
        spawnInterval: 0.45,
        enemyTypes: [
          { type: 'bat', weight: 35 },
          { type: 'emp_disrupter', weight: 35 },
          { type: 'kamikaze_drone', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 114,
        spawnInterval: 0.34,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 150,
        spawnInterval: 0.24,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Zero-G Armada Overseer',
          hp: 39000,
          damage: 225,
          color: '#38bdf8'
        }
      }
    ]
  },
  {
    id: 35,
    name: 'Sector 7 Apex: Volcanic Magma-Core Behemoth [BOSS]',
    environment: 'inferno',
    description: 'A rogue planetary defense orbital weapon with solar-powered plasma superweapons.',
    rewardGold: 20500,
    rewardRubies: 170,
    rewardExp: 20000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#000000',
    bgGroundColor: '#120404',
    accentColor: '#ef4444',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 82,
        spawnInterval: 0.42,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 118,
        spawnInterval: 0.32,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 155,
        spawnInterval: 0.22,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Orbital Planet-Cracker Behemoth',
          hp: 42000,
          damage: 238,
          color: '#ef4444'
        }
      }
    ]
  },

  // ==========================================
  // SECTOR 8: DARK MATTER VOID CORE & QUANTUM RIFT (36 - 40)
  // ==========================================
  {
    id: 36,
    name: 'Dark Matter Containment Breach',
    environment: 'crypt',
    description: 'Reality-bending void energy breaches spawning phased phantom spectres and dark laser batteries.',
    rewardGold: 21500,
    rewardRubies: 175,
    rewardExp: 21000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0f071a',
    bgGroundColor: '#1a0d2e',
    accentColor: '#a855f7',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 84,
        spawnInterval: 0.45,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 45 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'emp_disrupter', weight: 20 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 120,
        spawnInterval: 0.32,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 160,
        spawnInterval: 0.22,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'mortar_artillery', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Dark Rift Reaver',
          hp: 45000,
          damage: 250,
          color: '#a855f7'
        }
      }
    ]
  },
  {
    id: 37,
    name: 'Singularity Accelerator Chamber',
    environment: 'cyber',
    description: 'A gravitational vortex accelerating kamikaze bots and heavy plasma tanks into terminal velocity.',
    rewardGold: 22200,
    rewardRubies: 180,
    rewardExp: 21800,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0a0514',
    bgGroundColor: '#140a24',
    accentColor: '#c084fc',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 86,
        spawnInterval: 0.42,
        enemyTypes: [
          { type: 'kamikaze_drone', weight: 40 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'spider_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 124,
        spawnInterval: 0.3,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 165,
        spawnInterval: 0.2,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'emp_disrupter', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Singularity Core Crusher',
          hp: 48000,
          damage: 265,
          color: '#c084fc'
        }
      }
    ]
  },
  {
    id: 38,
    name: 'Anti-Matter Compression Ring',
    environment: 'cyber',
    description: 'Stabilizer rings crackling with dark lightning as aegis shield legions march forward.',
    rewardGold: 23000,
    rewardRubies: 185,
    rewardExp: 22500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#080310',
    bgGroundColor: '#100520',
    accentColor: '#e879f9',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 88,
        spawnInterval: 0.4,
        enemyTypes: [
          { type: 'shielded', weight: 40 },
          { type: 'emp_disrupter', weight: 35 },
          { type: 'phantom_spectre', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 128,
        spawnInterval: 0.28,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 170,
        spawnInterval: 0.18,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'kamikaze_drone', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Anti-Matter Aegis Overlord',
          hp: 51000,
          damage: 280,
          color: '#e879f9'
        }
      }
    ]
  },
  {
    id: 39,
    name: 'Event Horizon Gateway',
    environment: 'crypt',
    description: 'The edge of the black hole engine churning out endless warp-stalkers and artillery barrages.',
    rewardGold: 23800,
    rewardRubies: 190,
    rewardExp: 23200,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#05020a',
    bgGroundColor: '#0b0414',
    accentColor: '#9333ea',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 90,
        spawnInterval: 0.38,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 40 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'kamikaze_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 132,
        spawnInterval: 0.26,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 176,
        spawnInterval: 0.17,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'emp_disrupter', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Event Horizon Harbinger',
          hp: 54000,
          damage: 295,
          color: '#9333ea'
        }
      }
    ]
  },
  {
    id: 40,
    name: 'Sector 8 Apex: Oblivion Void Bringer MK-VI [BOSS]',
    environment: 'crypt',
    description: 'An ancient sentient entity made of pure condensed dark matter and heavy mechanized dreadnought chassis.',
    rewardGold: 26000,
    rewardRubies: 210,
    rewardExp: 25500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#020005',
    bgGroundColor: '#05000d',
    accentColor: '#7e22ce',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 92,
        spawnInterval: 0.35,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 136,
        spawnInterval: 0.24,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 180,
        spawnInterval: 0.16,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Oblivion Void Bringer MK-VI',
          hp: 58000,
          damage: 315,
          color: '#7e22ce'
        }
      }
    ]
  },

  // ==========================================
  // SECTOR 9: DEEP AUTOMATON HIGH-COMMAND (41 - 45)
  // ==========================================
  {
    id: 41,
    name: 'Automaton High-Command Neural Gates',
    environment: 'cyber',
    description: 'The outermost defensive gates to the central robot army neural brain, defended by elite death squads.',
    rewardGold: 27500,
    rewardRubies: 220,
    rewardExp: 27000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0a1526',
    bgGroundColor: '#12233f',
    accentColor: '#0ea5e9',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 94,
        spawnInterval: 0.34,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 40 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 140,
        spawnInterval: 0.22,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 185,
        spawnInterval: 0.15,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'emp_disrupter', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Neural Gatekeeper Sentinel',
          hp: 62000,
          damage: 335,
          color: '#0ea5e9'
        }
      }
    ]
  },
  {
    id: 42,
    name: 'Synapse Core Highway',
    environment: 'cyber',
    description: 'High-bandwidth fiber nerve trunks pulsing with military command algorithms and heavy mechanized batteries.',
    rewardGold: 28500,
    rewardRubies: 225,
    rewardExp: 28000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#061020',
    bgGroundColor: '#0d1d36',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 96,
        spawnInterval: 0.32,
        enemyTypes: [
          { type: 'emp_disrupter', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'kamikaze_drone', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 144,
        spawnInterval: 0.2,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 190,
        spawnInterval: 0.14,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'shielded', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Synaptic Highway Warden',
          hp: 66000,
          damage: 350,
          color: '#38bdf8'
        }
      }
    ]
  },
  {
    id: 43,
    name: 'Logic Gate Processing Core',
    environment: 'cyber',
    description: 'Quadrillions of calculation matrices coordinating artillery shell trajectories across the battlefield.',
    rewardGold: 29500,
    rewardRubies: 230,
    rewardExp: 29000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#040b17',
    bgGroundColor: '#08162b',
    accentColor: '#06b6d4',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 98,
        spawnInterval: 0.3,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 40 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'spider_drone', weight: 25 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 148,
        spawnInterval: 0.18,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 195,
        spawnInterval: 0.13,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'emp_disrupter', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Logic Matrix Prime Colossus',
          hp: 70000,
          damage: 368,
          color: '#06b6d4'
        }
      }
    ]
  },
  {
    id: 44,
    name: 'Neural Hive Queen Chambers',
    environment: 'cyber',
    description: 'The inner sanctum where robot commanders are forged with hyper-adaptive battle logic.',
    rewardGold: 30500,
    rewardRubies: 235,
    rewardExp: 30000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#030812',
    bgGroundColor: '#061021',
    accentColor: '#a855f7',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 100,
        spawnInterval: 0.28,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 35 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 152,
        spawnInterval: 0.16,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 200,
        spawnInterval: 0.12,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Neural Hive Overmind',
          hp: 75000,
          damage: 385,
          color: '#a855f7'
        }
      }
    ]
  },
  {
    id: 45,
    name: 'Sector 9 Apex: Quantum Supercomputer Sentinel [BOSS]',
    environment: 'cyber',
    description: 'The super-intelligent mainframe calculating every single hero bullet path to deploy impenetrable counter-measures.',
    rewardGold: 34000,
    rewardRubies: 260,
    rewardExp: 33500,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#010408',
    bgGroundColor: '#030812',
    accentColor: '#38bdf8',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 102,
        spawnInterval: 0.26,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 156,
        spawnInterval: 0.15,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 210,
        spawnInterval: 0.11,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Quantum Supercomputer Sentinel',
          hp: 82000,
          damage: 410,
          color: '#0284c7'
        }
      }
    ]
  },

  // ==========================================
  // SECTOR 10: APEX CITADEL OF THE ROBOT WARS (46 - 50)
  // ==========================================
  {
    id: 46,
    name: 'Ground Zero: Citadel Trench Lines',
    environment: 'inferno',
    description: 'The scorched planetary warzone where millions of robots march in apocalyptic formations.',
    rewardGold: 36000,
    rewardRubies: 275,
    rewardExp: 35000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#1c0303',
    bgGroundColor: '#2b0606',
    accentColor: '#ef4444',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 105,
        spawnInterval: 0.25,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 160,
        spawnInterval: 0.14,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 220,
        spawnInterval: 0.1,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Armored Vanguard Overlord',
          hp: 88000,
          damage: 435,
          color: '#dc2626'
        }
      }
    ]
  },
  {
    id: 47,
    name: 'Apex Citadel Outer Ramparts',
    environment: 'city',
    description: 'Colossal black-steel battlements armed with continuous plasma siege mortars and laser arrays.',
    rewardGold: 38000,
    rewardRubies: 290,
    rewardExp: 37000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#120202',
    bgGroundColor: '#1c0404',
    accentColor: '#f97316',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 108,
        spawnInterval: 0.24,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'emp_disrupter', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 165,
        spawnInterval: 0.13,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'stealth_assassin', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 230,
        spawnInterval: 0.09,
        enemyTypes: [
          { type: 'phantom_spectre', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Rampart Siege Destroyer',
          hp: 94000,
          damage: 460,
          color: '#f97316'
        }
      }
    ]
  },
  {
    id: 48,
    name: 'Throne Room Antechamber',
    environment: 'cyber',
    description: 'The golden cybernetic hall of royal automata bodyguards and tri-core death machines.',
    rewardGold: 41000,
    rewardRubies: 310,
    rewardExp: 40000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#0a000f',
    bgGroundColor: '#14001f',
    accentColor: '#eab308',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 110,
        spawnInterval: 0.22,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 35 },
          { type: 'phantom_spectre', weight: 35 },
          { type: 'nanite_healer', weight: 30 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 170,
        spawnInterval: 0.12,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'plasma_tank', weight: 35 },
          { type: 'mortar_artillery', weight: 30 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 240,
        spawnInterval: 0.08,
        enemyTypes: [
          { type: 'plasma_tank', weight: 35 },
          { type: 'minigun_juggernaut', weight: 35 },
          { type: 'phantom_spectre', weight: 30 }
        ],
        boss: {
          type: 'boss',
          name: 'Tri-Core Royal Annihilator',
          hp: 102000,
          damage: 490,
          color: '#eab308'
        }
      }
    ]
  },
  {
    id: 49,
    name: 'Final Doomsday Engine Core',
    environment: 'inferno',
    description: 'The countdown to planetary extinction has begun. The robot legions throw every single unit at you simultaneously.',
    rewardGold: 45000,
    rewardRubies: 330,
    rewardExp: 44000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#080000',
    bgGroundColor: '#120000',
    accentColor: '#ef4444',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 115,
        spawnInterval: 0.2,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 30 },
          { type: 'plasma_tank', weight: 30 },
          { type: 'mortar_artillery', weight: 20 },
          { type: 'nanite_healer', weight: 20 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 180,
        spawnInterval: 0.11,
        enemyTypes: [
          { type: 'stealth_assassin', weight: 25 },
          { type: 'phantom_spectre', weight: 25 },
          { type: 'kamikaze_drone', weight: 25 },
          { type: 'emp_disrupter', weight: 25 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 255,
        spawnInterval: 0.07,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 30 },
          { type: 'plasma_tank', weight: 30 },
          { type: 'mortar_artillery', weight: 20 },
          { type: 'nanite_healer', weight: 20 }
        ],
        boss: {
          type: 'boss',
          name: 'Doomsday Core Titan Prime',
          hp: 112000,
          damage: 520,
          color: '#b91c1c'
        }
      }
    ]
  },
  {
    id: 50,
    name: 'Sector 10 Apex: APEX GOD-ENGINE OMEGA: ROBOT WAR LORD [FINAL BOSS]',
    environment: 'cyber',
    description: 'The supreme mechanical god of the Robot Wars stands before you. Eliminate the War Lord once and for all to bring peace to the Stickman Universe!',
    rewardGold: 60000,
    rewardRubies: 500,
    rewardExp: 60000,
    unlocked: false,
    stars: 0,
    bgSkyColor: '#020004',
    bgGroundColor: '#06000a',
    accentColor: '#f43f5e',
    waves: [
      {
        waveNumber: 1,
        totalEnemies: 120,
        spawnInterval: 0.18,
        enemyTypes: [
          { type: 'plasma_tank', weight: 30 },
          { type: 'minigun_juggernaut', weight: 30 },
          { type: 'stealth_assassin', weight: 20 },
          { type: 'nanite_healer', weight: 20 }
        ]
      },
      {
        waveNumber: 2,
        totalEnemies: 190,
        spawnInterval: 0.1,
        enemyTypes: [
          { type: 'mortar_artillery', weight: 30 },
          { type: 'phantom_spectre', weight: 30 },
          { type: 'emp_disrupter', weight: 20 },
          { type: 'kamikaze_drone', weight: 20 }
        ]
      },
      {
        waveNumber: 3,
        totalEnemies: 280,
        spawnInterval: 0.06,
        enemyTypes: [
          { type: 'minigun_juggernaut', weight: 25 },
          { type: 'plasma_tank', weight: 25 },
          { type: 'mortar_artillery', weight: 25 },
          { type: 'nanite_healer', weight: 25 }
        ],
        boss: {
          type: 'boss',
          name: 'APEX GOD-ENGINE OMEGA: ROBOT WAR LORD',
          hp: 135000,
          damage: 580,
          color: '#f43f5e'
        }
      }
    ]
  }
];
