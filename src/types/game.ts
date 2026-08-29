export type HeroClass = 'gunner' | 'mage' | 'archer' | 'heavy' | 'priest';

export type WeaponType = 'pistol' | 'smg' | 'shotgun' | 'rifle' | 'sniper' | 'heavy' | 'magic' | 'bow' | 'launcher';

export type ElementType = 'physical' | 'fire' | 'ice' | 'lightning' | 'plasma' | 'holy' | 'dark';

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  element: ElementType;
  description: string;
  tier: number; // 1 to 5
  cost: number;
  unlocked: boolean;
  damage: number;
  fireRate: number; // shots per second
  magazineSize: number;
  reloadTime: number; // in seconds
  range: number;
  bulletSpeed: number;
  bulletCount: number; // pellets per shot (e.g. 6 for shotgun)
  spread: number; // spread angle in radians
  pierce: number; // how many enemies it can pass through
  knockback: number;
  critChance: number; // 0 to 1
  critMultiplier: number;
  specialEffect?: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  iconName: string;
  color: string;
  soundType: 'pistol' | 'smg' | 'shotgun' | 'rifle' | 'sniper' | 'heavy' | 'laser' | 'rocket' | 'magic' | 'bow';
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number; // in seconds
  currentCooldown: number;
  duration?: number;
  icon: string;
  key: string;
  type: 'damage' | 'buff' | 'utility' | 'ultimate';
  element: ElementType;
  level?: number;
  maxLevel?: number;
  upgradeCost?: number;
}

export interface HeroData {
  id: HeroClass;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  baseHp: number;
  baseMana: number;
  baseSpeed: number;
  baseDef: number;
  baseCrit: number;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  unlocked: boolean;
  cost: number;
  startingWeaponId: string;
  skills: Skill[];
  headGearType: 'goggles' | 'beret' | 'hood' | 'helmet' | 'crown';
  capeColor?: string;
}

export interface GearItem {
  id: string;
  name: string;
  type: 'helmet' | 'armor' | 'accessory';
  tier: number;
  cost: number;
  hpBonus: number;
  defBonus: number;
  speedBonus: number;
  critBonus: number;
  damageBonus: number;
  description: string;
  icon: string;
  equipped: boolean;
  unlocked: boolean;
}

export type PetSpecies = 'dog' | 'cat' | 'wolf' | 'falcon' | 'panther' | 'dragon';
export type PetAttackType = 'melee_pounce' | 'melee_swipe' | 'ranged_laser' | 'ranged_aoe_shockwave' | 'ranged_aoe_dragon';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  description: string;
  tier: number; // 1 to 5
  costRubies: number; // Gem cost to unlock
  unlocked: boolean;
  level: number;
  maxLevel: number;
  upgradeCostRubies: number; // Gem cost to upgrade
  damage: number; // Pet separate damage (never dies)
  attackRate: number; // in seconds (cooldown between attacks)
  attackRange: number; // Detection/engagement range
  attackType: PetAttackType;
  aoeRadius?: number; // Area of effect radius for costliest/ranged pets
  color: string;
  accentColor: string;
  icon: string;
  playerHpBonusPercent: number; // e.g. 10 for +10% Player Max HP
  playerDamageBonusPercent: number; // e.g. 5 for +5% Player Damage
  specialTrait: string;
}

export interface PetRuntimeState {
  pet: Pet;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  state: 'idle' | 'follow' | 'pouncing' | 'attacking' | 'returning' | 'casting';
  attackTimer: number;
  targetEnemyId: string | null;
  pounceStartX: number;
  pounceStartY: number;
  pounceTargetX: number;
  pounceTargetY: number;
  pounceProgress: number; // 0 to 1
  animFrame: number;
}

export interface PlayerStats {
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  rubies: number;
  statPoints: number;
  // Attributes
  strength: number; // +Damage
  vitality: number; // +HP
  agility: number;  // +Speed & +Crit
  intellect: number;// +Mana & Skill CD
  defense: number;  // Damage reduction
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  aimAngle: number; // radians
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  isRolling: boolean;
  rollTimer: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  isReloading: boolean;
  reloadProgress: number;
  currentAmmo: number;
  ammoBySlot: [number, number];
  recoil: number;
  walkFrame: number;
  selectedWeaponSlot: 0 | 1;
  equippedWeapons: [Weapon, Weapon | null];
  activeBuffs: { [key: string]: number };
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  color: string;
  trailColor?: string;
  element: ElementType;
  pierceLeft: number;
  knockback: number;
  isCrit: boolean;
  isPlayer: boolean;
  type: WeaponType | 'magic' | 'rocket' | 'grenade' | 'flame' | 'enemy_bullet' | 'laser';
  lifespan: number;
  maxLifespan: number;
  explosionRadius?: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  lifespan: number;
  maxLifespan: number;
  shape?: 'circle' | 'square' | 'line' | 'spark' | 'smoke' | 'shell';
  rotation?: number;
  rotationSpeed?: number;
  gravity?: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  size: number;
  isCrit: boolean;
  isHeadshot?: boolean;
  lifespan: number;
  maxLifespan: number;
}

export type EnemyType =
  | 'zombie'
  | 'runner'
  | 'skeleton'
  | 'shielded'
  | 'mutant'
  | 'bat'
  | 'sniper'
  | 'necromancer'
  | 'golem'
  | 'spider_drone'
  | 'plasma_tank'
  | 'stealth_assassin'
  | 'kamikaze_drone'
  | 'emp_disrupter'
  | 'minigun_juggernaut'
  | 'mortar_artillery'
  | 'nanite_healer'
  | 'phantom_spectre'
  | 'boss';

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  expValue: number;
  goldValue: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  attackCooldown: number;
  attackRange: number;
  color: string;
  headStyle?: string;
  isBoss?: boolean;
  bossPhase?: number;
  skills?: string[];
  bossSkillTimer?: number;
  walkFrame: number;
  shieldActive?: boolean;
  frozenTimer?: number;
  burnTimer?: number;
  shockTimer?: number;
  // Special Enemy Mechanics
  cloakedTimer?: number;
  isCloaked?: boolean;
  burstCount?: number;
  burstTimer?: number;
  kamikazeDetonateTimer?: number;
  isPrimed?: boolean;
  empRadius?: number;
  empChargeTimer?: number;
  healTargetId?: string | null;
  jumpCooldown?: number;
}

export interface StageWave {
  waveNumber: number;
  totalEnemies: number;
  spawnInterval: number; // in seconds
  enemyTypes: Array<{
    type: Enemy['type'];
    weight: number;
    hpMultiplier?: number;
    speedMultiplier?: number;
  }>;
  boss?: {
    type: Enemy['type'];
    name: string;
    hp: number;
    damage: number;
    color: string;
  };
}

export type WeatherType = 'none' | 'wind_storm' | 'blizzard' | 'sandstorm' | 'toxic_smog' | 'plasma_aurora' | 'meteor_shower' | 'ember_tempest' | 'cyber_rain' | 'ash_fall';
export type RiverType = 'none' | 'water_stream' | 'toxic_sludge' | 'molten_lava' | 'cyber_liquid' | 'cryo_river';
export type HazardType = 'none' | 'mud_bog' | 'tar_pit' | 'magma_fissure' | 'toxic_waste' | 'quicksand' | 'plasma_vent';
export type RockFormationType = 'none' | 'boulder_cluster' | 'jagged_spires' | 'basalt_columns' | 'crystal_pillars' | 'ruined_monoliths' | 'scrap_piles';

export interface Stage {
  id: number;
  name: string;
  environment: 'forest' | 'crypt' | 'wasteland' | 'inferno' | 'cyber' | 'factory' | 'city';
  description: string;
  rewardGold: number;
  rewardRubies: number;
  rewardExp: number;
  unlocked: boolean;
  stars: number; // 0-3
  waves: StageWave[];
  bgSkyColor: string;
  bgGroundColor: string;
  accentColor: string;
  terrainType?: 'flat' | 'sloped_up' | 'sloped_down' | 'rolling_hills' | 'valley' | 'arch_ridge' | 'dual_peaks' | 'crater_basin' | 'step_plateau' | 'undulating_dunes' | 'apex_canyon';
  terrainAmplitude?: number;
  terrainFrequency?: number;
  celestialBody?: 'ringed_planet' | 'blood_moon' | 'cyber_moon' | 'solar_eclipse' | 'terra_planet' | 'binary_moons' | 'void_singularity' | 'gas_giant' | 'crystal_moon';
  celestialScale?: number;
  // Dynamic Map & Environmental Features
  weather?: WeatherType;
  windSpeed?: number;
  windDirection?: 'left' | 'right';
  riverType?: RiverType;
  riverPositionX?: number;
  riverWidth?: number;
  hazardType?: HazardType;
  hazardPositionX?: number;
  hazardWidth?: number;
  rockType?: RockFormationType;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  screenShake: boolean;
  bloodEffects: boolean;
  damageNumbers: boolean;
  showFps: boolean;
  controlScheme: 'mouse_keyboard' | 'touch';
  theme: 'dark' | 'light';
}

export type GameScreen = 'title' | 'stage_select' | 'hero_select' | 'armory' | 'stats' | 'playing' | 'paused' | 'victory' | 'game_over';
