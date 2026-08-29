import { Stage, WeatherType, RiverType, HazardType, RockFormationType } from '../types/game';

export type TerrainType =
  | 'flat'
  | 'sloped_up'
  | 'sloped_down'
  | 'rolling_hills'
  | 'valley'
  | 'arch_ridge'
  | 'dual_peaks'
  | 'crater_basin'
  | 'step_plateau'
  | 'undulating_dunes'
  | 'apex_canyon';

export type CelestialBodyType =
  | 'ringed_planet'
  | 'blood_moon'
  | 'cyber_moon'
  | 'solar_eclipse'
  | 'terra_planet'
  | 'binary_moons'
  | 'void_singularity'
  | 'gas_giant'
  | 'crystal_moon';

export interface RockFeature {
  x: number;
  width: number;
  height: number;
  style: 'boulder' | 'spire' | 'basalt' | 'crystal' | 'scrap';
  color: string;
  accentColor?: string;
  rotation: number;
}

export interface RiverFeature {
  type: RiverType;
  startX: number;
  endX: number;
  depth: number;
  surfaceYOffset: number;
  waterColor: string;
  foamColor: string;
  flowSpeed: number;
  glow: boolean;
}

export interface HazardFeature {
  type: HazardType;
  startX: number;
  endX: number;
  depth: number;
  color: string;
  bubbleColor: string;
  slowMultiplier: number; // e.g. 0.75 for mud
  damagePerSec: number;
}

export interface WindWeatherFeature {
  weather: WeatherType;
  windSpeed: number; // px per second
  windDirection: 'left' | 'right';
  particleCount: number;
  particleColor: string;
  gustiness: number;
  ambientParticles: 'leaves' | 'dust' | 'snow' | 'sparks' | 'embers' | 'ash' | 'rain';
}

export interface StageMapFeatures {
  terrain: {
    type: TerrainType;
    amplitude: number;
    frequency: number;
  };
  celestial: {
    type: CelestialBodyType;
    color: string;
    glowColor: string;
    size: number;
  };
  wind: WindWeatherFeature;
  river?: RiverFeature | null;
  hazard?: HazardFeature | null;
  rocks: RockFeature[];
}

/**
 * Procedural & Curated Map Features for all 50 Stages
 */
export function getStageTerrainConfig(stage: Stage): {
  type: TerrainType;
  amplitude: number;
  frequency: number;
} {
  if (stage.terrainType) {
    return {
      type: stage.terrainType,
      amplitude: stage.terrainAmplitude ?? 60,
      frequency: stage.terrainFrequency ?? 1.0
    };
  }

  const sId = stage.id;
  if (sId === 1) {
    return { type: 'flat', amplitude: 0, frequency: 1.0 };
  }

  // 10 Distinct Terrain Cycles across the 50 campaign levels
  const cycle = (sId - 2) % 10;
  const progression = Math.min(1.5, 0.65 + (sId / 50) * 0.85);

  switch (cycle) {
    case 0:
      return { type: 'rolling_hills', amplitude: Math.round(48 * progression), frequency: 1.0 };
    case 1:
      return { type: 'sloped_up', amplitude: Math.round(58 * progression), frequency: 1.0 };
    case 2:
      return { type: 'valley', amplitude: Math.round(68 * progression), frequency: 1.0 };
    case 3:
      return { type: 'arch_ridge', amplitude: Math.round(75 * progression), frequency: 1.0 };
    case 4:
      return { type: 'sloped_down', amplitude: Math.round(62 * progression), frequency: 1.0 };
    case 5:
      return { type: 'dual_peaks', amplitude: Math.round(72 * progression), frequency: 1.1 };
    case 6:
      return { type: 'crater_basin', amplitude: Math.round(82 * progression), frequency: 0.95 };
    case 7:
      return { type: 'step_plateau', amplitude: Math.round(78 * progression), frequency: 1.0 };
    case 8:
      return { type: 'undulating_dunes', amplitude: Math.round(65 * progression), frequency: 1.2 };
    case 9:
    default:
      return { type: 'apex_canyon', amplitude: Math.round(88 * progression), frequency: 1.25 };
  }
}

/**
 * Ground elevation math across all terrain types
 */
export function getGroundY(stage: Stage, x: number, baseGroundY: number = 500): number {
  const config = getStageTerrainConfig(stage);
  if (config.type === 'flat' || config.amplitude === 0) {
    return baseGroundY;
  }

  const amp = config.amplitude;
  const freq = config.frequency;

  switch (config.type) {
    case 'sloped_up': {
      const ratio = Math.max(-1, Math.min(1, x / 1100));
      return baseGroundY - ratio * amp;
    }

    case 'sloped_down': {
      const ratio = Math.max(-1, Math.min(1, x / 1100));
      return baseGroundY + ratio * amp;
    }

    case 'rolling_hills': {
      const w1 = Math.sin(x * 0.0032 * freq) * amp * 0.75;
      const w2 = Math.cos(x * 0.0068 * freq) * amp * 0.25;
      return baseGroundY - (w1 + w2);
    }

    case 'valley': {
      const normX = Math.max(-1, Math.min(1, x / 700));
      const valleyCurve = Math.cos(normX * Math.PI * 0.5);
      return baseGroundY + valleyCurve * amp;
    }

    case 'arch_ridge': {
      const normX = Math.max(-1, Math.min(1, x / 750));
      const archCurve = Math.cos(normX * Math.PI * 0.5);
      return baseGroundY - archCurve * amp;
    }

    case 'dual_peaks': {
      const p1 = Math.sin(x * 0.0055 * freq) * amp * 0.7;
      const p2 = Math.cos(x * 0.0022 * freq) * amp * 0.3;
      return baseGroundY - (p1 + p2);
    }

    case 'crater_basin': {
      const normX = Math.max(-1, Math.min(1, x / 650));
      const basin = Math.cos(normX * Math.PI);
      return baseGroundY + basin * amp * 0.65;
    }

    case 'step_plateau': {
      const plateau = 1 / (1 + Math.pow(x / 450, 4));
      return baseGroundY - plateau * amp;
    }

    case 'undulating_dunes': {
      const d1 = Math.sin(x * 0.004 * freq) * amp * 0.65;
      const d2 = Math.cos(x * 0.0025 * freq) * amp * 0.35;
      return baseGroundY - (d1 + d2);
    }

    case 'apex_canyon': {
      const c1 = Math.sin(x * 0.0045 * freq) * amp * 0.6;
      const c2 = Math.sin(x * 0.002 * freq) * amp * 0.3;
      const c3 = Math.cos(x * 0.008 * freq) * amp * 0.1;
      return baseGroundY - (c1 + c2 + c3);
    }

    default:
      return baseGroundY;
  }
}

/**
 * Returns complete map details including rocks, flowing rivers, mud/sludge bogs, and wind flow for the given stage
 */
export function getStageMapFeatures(stage: Stage): StageMapFeatures {
  const sId = stage.id;
  const sector = Math.ceil(sId / 5);
  const terrain = getStageTerrainConfig(stage);
  const celestial = getStageCelestialConfig(stage);

  // 1. Dynamic Wind & Weather Stream
  const windDir: 'left' | 'right' = stage.windDirection || (sId % 2 === 0 ? 'right' : 'left');
  let weather: WeatherType = stage.weather || 'none';
  let ambientParticles: WindWeatherFeature['ambientParticles'] = 'dust';
  let windSpeed = stage.windSpeed || (windDir === 'right' ? 80 + (sId % 5) * 20 : -80 - (sId % 5) * 20);
  let particleCount = 28;
  let particleColor = 'rgba(255, 255, 255, 0.4)';

  switch (sector) {
    case 1: // Scrap Foundry & Rustlands
      weather = stage.weather || 'sandstorm';
      ambientParticles = 'dust';
      particleColor = '#f59e0b';
      particleCount = 35;
      break;
    case 2: // Neon Metropolis
      weather = stage.weather || 'cyber_rain';
      ambientParticles = 'sparks';
      particleColor = '#38bdf8';
      particleCount = 32;
      break;
    case 3: // Nuclear Reactor Core
      weather = stage.weather || 'toxic_smog';
      ambientParticles = 'sparks';
      particleColor = '#10b981';
      particleCount = 36;
      break;
    case 4: // Bio-Mech Lab & Fungus Swamps
      weather = stage.weather || 'wind_storm';
      ambientParticles = 'leaves';
      particleColor = '#34d399';
      particleCount = 30;
      break;
    case 5: // Magma Crucible & Volcano
      weather = stage.weather || 'ember_tempest';
      ambientParticles = 'embers';
      particleColor = '#ef4444';
      particleCount = 45;
      break;
    case 6: // Cryo Citadel & Frozen Peaks
      weather = stage.weather || 'blizzard';
      ambientParticles = 'snow';
      particleColor = '#e0f2fe';
      particleCount = 45;
      break;
    case 7: // Orbital Skyhook High Winds
      weather = stage.weather || 'wind_storm';
      ambientParticles = 'sparks';
      particleColor = '#60a5fa';
      particleCount = 38;
      break;
    case 8: // Void Singularity
      weather = stage.weather || 'plasma_aurora';
      ambientParticles = 'sparks';
      particleColor = '#c084fc';
      particleCount = 40;
      break;
    case 9: // Cyber Ruins
      weather = stage.weather || 'ash_fall';
      ambientParticles = 'ash';
      particleColor = '#fbbf24';
      particleCount = 35;
      break;
    case 10: // Apex Nexus Core
    default:
      weather = stage.weather || 'meteor_shower';
      ambientParticles = 'embers';
      particleColor = '#f43f5e';
      particleCount = 50;
      break;
  }

  const wind: WindWeatherFeature = {
    weather,
    windSpeed,
    windDirection: windDir,
    particleCount,
    particleColor,
    gustiness: 1.2,
    ambientParticles
  };

  // 2. Dynamic River Feature (Water, Acid, Lava, Cyber Liquid, Ice Flow)
  let river: RiverFeature | null = null;
  const hasRiver = stage.riverType ? stage.riverType !== 'none' : (sId % 3 === 0 || sId % 5 === 2);

  if (hasRiver) {
    const rType: RiverType = stage.riverType || (
      sector === 5 ? 'molten_lava' :
      sector === 3 || sector === 4 ? 'toxic_sludge' :
      sector === 6 ? 'cryo_river' :
      sector === 2 || sector === 8 || sector === 10 ? 'cyber_liquid' :
      'water_stream'
    );

    const riverCenterX = stage.riverPositionX ?? ((sId % 4 - 1.5) * 220);
    const riverWidth = stage.riverWidth ?? (240 + (sId % 3) * 60);

    let waterColor = '#0284c7';
    let foamColor = '#7dd3fc';
    let flowSpeed = 120;
    let glow = false;

    if (rType === 'molten_lava') {
      waterColor = '#dc2626';
      foamColor = '#fef08a';
      flowSpeed = 60;
      glow = true;
    } else if (rType === 'toxic_sludge') {
      waterColor = '#15803d';
      foamColor = '#86efac';
      flowSpeed = 80;
      glow = true;
    } else if (rType === 'cryo_river') {
      waterColor = '#38bdf8';
      foamColor = '#ffffff';
      flowSpeed = 95;
      glow = false;
    } else if (rType === 'cyber_liquid') {
      waterColor = '#9333ea';
      foamColor = '#f0abfc';
      flowSpeed = 140;
      glow = true;
    }

    river = {
      type: rType,
      startX: riverCenterX - riverWidth / 2,
      endX: riverCenterX + riverWidth / 2,
      depth: 26,
      surfaceYOffset: 12,
      waterColor,
      foamColor,
      flowSpeed,
      glow
    };
  }

  // 3. Mud / Sludge / Magma Bog Hazards ("mug" / mud pool)
  let hazard: HazardFeature | null = null;
  const hasHazard = stage.hazardType ? stage.hazardType !== 'none' : (sId % 4 === 1 && sId > 1);

  if (hasHazard) {
    const hType: HazardType = stage.hazardType || (
      sector === 5 ? 'magma_fissure' :
      sector === 3 || sector === 4 ? 'toxic_waste' :
      sector === 1 ? 'tar_pit' :
      sector === 6 ? 'quicksand' :
      'mud_bog'
    );

    const hazardCenterX = stage.hazardPositionX ?? (((sId * 31) % 600) - 300);
    const hazardWidth = stage.hazardWidth ?? (200 + (sId % 3) * 50);

    let hColor = '#3e2723'; // Mud brown
    let bubbleColor = '#5d4037';
    let slowMultiplier = 0.65; // Walking speed reduced in mud
    let damagePerSec = 0;

    if (hType === 'magma_fissure') {
      hColor = '#7f1d1d';
      bubbleColor = '#f97316';
      damagePerSec = 15;
      slowMultiplier = 0.7;
    } else if (hType === 'toxic_waste') {
      hColor = '#064e3b';
      bubbleColor = '#22c55e';
      damagePerSec = 10;
      slowMultiplier = 0.68;
    } else if (hType === 'tar_pit') {
      hColor = '#18181b';
      bubbleColor = '#27272a';
      slowMultiplier = 0.5;
    }

    hazard = {
      type: hType,
      startX: hazardCenterX - hazardWidth / 2,
      endX: hazardCenterX + hazardWidth / 2,
      depth: 18,
      color: hColor,
      bubbleColor,
      slowMultiplier,
      damagePerSec
    };
  }

  // 4. Rocks & Boulders on terrain slopes
  const rocks: RockFeature[] = [];
  const numRocks = 6 + (sId % 4);
  const rockStyle: RockFeature['style'] =
    sector === 3 || sector === 6 || sector === 8 ? 'crystal' :
    sector === 1 || sector === 9 ? 'scrap' :
    sector === 5 ? 'basalt' :
    sId % 2 === 0 ? 'spire' : 'boulder';

  for (let i = 0; i < numRocks; i++) {
    const spread = (i / numRocks) * 1600 - 800 + ((sId * 17 + i * 37) % 80);
    // Don't place rocks directly in the middle of river
    if (river && spread >= river.startX - 30 && spread <= river.endX + 30) {
      continue;
    }

    const rockWidth = 24 + ((i * 19 + sId * 11) % 36);
    const rockHeight = 20 + ((i * 23 + sId * 13) % 45);
    const rotation = ((i * 31) % 40 - 20) * (Math.PI / 180);

    let rockColor = '#3f3f46';
    let accent = stage.accentColor;

    if (rockStyle === 'crystal') {
      rockColor = stage.accentColor;
    } else if (rockStyle === 'basalt') {
      rockColor = '#18181b';
    } else if (rockStyle === 'scrap') {
      rockColor = '#475569';
    } else {
      rockColor = sector === 5 ? '#450a0a' : sector === 6 ? '#334155' : '#27272a';
    }

    rocks.push({
      x: spread,
      width: rockWidth,
      height: rockHeight,
      style: rockStyle,
      color: rockColor,
      accentColor: accent,
      rotation
    });
  }

  return {
    terrain,
    celestial,
    wind,
    river,
    hazard,
    rocks
  };
}

/**
 * Returns the celestial body configuration for a stage.
 */
export function getStageCelestialConfig(stage: Stage): {
  type: CelestialBodyType;
  color: string;
  glowColor: string;
  size: number;
} {
  if (stage.celestialBody) {
    return {
      type: stage.celestialBody,
      color: stage.accentColor || '#38bdf8',
      glowColor: stage.bgSkyColor || '#0f172a',
      size: stage.celestialScale || 1.0
    };
  }

  const sId = stage.id;
  const sector = Math.ceil(sId / 5);

  switch (sector) {
    case 1: // Scrap Foundry
      return { type: 'cyber_moon', color: '#38bdf8', glowColor: '#0284c7', size: 1.0 };
    case 2: // Neon Metropolis
      return { type: 'ringed_planet', color: '#a855f7', glowColor: '#7c3aed', size: 1.25 };
    case 3: // Nuclear Reactor Core
      return { type: 'crystal_moon', color: '#10b981', glowColor: '#059669', size: 1.1 };
    case 4: // Bio-Mech Lab
      return { type: 'binary_moons', color: '#34d399', glowColor: '#10b981', size: 1.0 };
    case 5: // Magma Crucible
      return { type: 'blood_moon', color: '#ef4444', glowColor: '#dc2626', size: 1.3 };
    case 6: // Cryo Citadel
      return { type: 'crystal_moon', color: '#38bdf8', glowColor: '#0284c7', size: 1.15 };
    case 7: // Orbital Skyhook
      return { type: 'terra_planet', color: '#60a5fa', glowColor: '#2563eb', size: 1.4 };
    case 8: // Void Singularity
      return { type: 'void_singularity', color: '#c084fc', glowColor: '#9333ea', size: 1.35 };
    case 9: // Cyber Ruins
      return { type: 'gas_giant', color: '#fbbf24', glowColor: '#d97706', size: 1.3 };
    case 10: // Apex Nexus Core
    default:
      return { type: 'solar_eclipse', color: '#f59e0b', glowColor: '#ea580c', size: 1.45 };
  }
}
