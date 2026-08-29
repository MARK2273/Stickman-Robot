import { PlayerState, Enemy, Projectile, Particle, DamageNumber, HeroData, Stage, PetRuntimeState } from '../types/game';
import { getGroundY, getStageCelestialConfig, getStageMapFeatures } from '../utils/terrain';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(
    canvasWidth: number,
    canvasHeight: number,
    player: PlayerState,
    hero: HeroData,
    enemies: Enemy[],
    projectiles: Projectile[],
    particles: Particle[],
    damageNumbers: DamageNumber[],
    stage: Stage,
    cameraX: number,
    cameraShake: { x: number; y: number },
    gameTime: number,
    petRuntime?: PetRuntimeState | null,
    enemyHouses?: {
      left: { x: number; width: number; height: number; spawnTimer: number; shieldHitTimer: number; name: string };
      right: { x: number; width: number; height: number; spawnTimer: number; shieldHitTimer: number; name: string };
    } | null
  ) {
    const ctx = this.ctx;

    ctx.save();
    // Clear
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Apply Camera Shake & Follow
    ctx.translate(cameraShake.x, cameraShake.y);

    // 1. Draw Background Parallax
    this.drawBackground(canvasWidth, canvasHeight, stage, cameraX, gameTime);

    // World Coordinates translation
    ctx.save();
    ctx.translate(-cameraX + canvasWidth / 2, 0);

    // 2. Draw Floor & Arena boundaries with Hills, Valleys, Rivers, Mud Bogs & Rocks
    this.drawGround(canvasWidth, canvasHeight, stage);
    this.drawMapFeatures(canvasWidth, canvasHeight, stage, gameTime);

    // 3. Draw Fortified Enemy Houses at Arena Ends
    this.drawEnemyHouses(canvasWidth, canvasHeight, stage, gameTime, enemyHouses);

    // 4. Draw Particles (shell casings, ground dust, blood on floor)
    this.drawParticles(particles);

    // 5. Draw Projectiles
    this.drawProjectiles(projectiles);

    // 6. Draw Enemies & Bosses
    this.drawEnemies(enemies, gameTime);

    // 7. Draw Player (Stickman)
    this.drawStickman(player, hero, gameTime);

    // 8. Draw Companion Pet (Invulnerable Robotic Ally)
    if (petRuntime) {
      this.drawPet(petRuntime, gameTime);
    }

    // 9. Draw Floating Damage Numbers
    this.drawDamageNumbers(damageNumbers);

    ctx.restore(); // end world translate
    ctx.restore(); // end camera shake
  }

  private drawBackground(width: number, height: number, stage: Stage, cameraX: number, time: number) {
    const ctx = this.ctx;

    // 1. Deep Space Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#030712');
    skyGrad.addColorStop(0.35, stage.bgSkyColor);
    skyGrad.addColorStop(0.8, '#090d16');
    skyGrad.addColorStop(1, stage.bgGroundColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Cosmic Nebula Clouds
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const nebulaGrad = ctx.createRadialGradient(
      width * 0.45 - (cameraX * 0.02) % (width * 0.5),
      height * 0.35,
      10,
      width * 0.45 - (cameraX * 0.02) % (width * 0.5),
      height * 0.35,
      width * 0.65
    );
    nebulaGrad.addColorStop(0, `${stage.accentColor}33`);
    nebulaGrad.addColorStop(0.5, `${stage.bgSkyColor}22`);
    nebulaGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // 3. Twinkling Starfield with Multi-depth Parallax
    this.drawStarfield(width, height, stage, cameraX, time);

    // 4. Shooting Star / Cosmic Streak
    const meteorCycle = (time * 0.25) % 1;
    if (meteorCycle < 0.2) {
      const progress = meteorCycle / 0.2;
      const mStartX = (width * 0.85) - progress * (width * 0.4);
      const mStartY = (height * 0.08) + progress * (height * 0.25);
      const mLen = 60 * (1 - progress);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.sin(progress * Math.PI) * 0.85})`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mStartX, mStartY);
      ctx.lineTo(mStartX + mLen, mStartY - mLen * 0.6);
      ctx.stroke();
      ctx.restore();
    }

    // 5. High-Fidelity Celestial Body (Moon, Ringed Planet, Eclipse, Singularity)
    this.drawCelestialBody(width, height, stage, cameraX, time);

    // 6. Far Parallax Mountain / Skyline Silhouettes
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    const farOffset = (cameraX * 0.12) % 400;
    for (let x = -400; x < width + 400; x += 320) {
      const px = x - farOffset;
      ctx.beginPath();
      ctx.moveTo(px, height - 90);
      ctx.lineTo(px + 160, height - 280);
      ctx.lineTo(px + 320, height - 90);
      ctx.fill();
    }

    // 7. Midground Structures (Pillars, Towers, Crypts, Spires)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    const midOffset = (cameraX * 0.3) % 300;
    for (let x = -300; x < width + 300; x += 220) {
      const px = x - midOffset;
      if (stage.environment === 'forest') {
        // Spooky biomechanical trees
        ctx.fillRect(px + 40, height - 260, 12, 140);
        ctx.beginPath();
        ctx.arc(px + 46, height - 270, 42, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage.environment === 'crypt') {
        // Gothic arches / obelisks
        ctx.fillRect(px + 30, height - 290, 24, 180);
        ctx.beginPath();
        ctx.arc(px + 42, height - 290, 24, Math.PI, 0);
        ctx.fill();
      } else {
        // Cyberpunk power conduits / high-tech towers
        ctx.fillRect(px + 20, height - 280, 32, 160);
        ctx.fillRect(px + 32, height - 310, 8, 30);
      }
    }

    // 8. Dynamic Wind Streamlines & Atmospheric Weather Particles
    this.drawWindAndWeather(width, height, stage, cameraX, time);

    ctx.restore();
  }

  private drawStarfield(width: number, height: number, stage: Stage, cameraX: number, time: number) {
    const ctx = this.ctx;
    ctx.save();

    // Deterministic pseudo-random stars based on stage id
    const seedBase = (stage.id || 1) * 73;
    const numStars = 85;

    for (let i = 0; i < numStars; i++) {
      const rand1 = Math.sin(seedBase + i * 12.9898) * 43758.5453;
      const rand2 = Math.cos(seedBase + i * 78.233) * 23421.631;
      const rand3 = Math.sin(seedBase + i * 45.164) * 12948.182;
      
      const normX = (rand1 - Math.floor(rand1));
      const normY = (rand2 - Math.floor(rand2));
      const normSize = (rand3 - Math.floor(rand3));

      // Stars in the upper 70% of sky
      const baseStarX = normX * (width + 200) - 100;
      const starY = normY * (height * 0.65);
      const depthSpeed = 0.02 + normSize * 0.04;
      const starX = (baseStarX - (cameraX * depthSpeed) + width * 4) % (width + 100) - 50;

      const twinkle = 0.35 + 0.65 * Math.sin(time * (2 + normSize * 4) + i * 1.5);
      const starRadius = 0.8 + normSize * 1.6;

      // Star color variation
      let starColor = '#ffffff';
      if (i % 5 === 0) starColor = '#93c5fd'; // Ice blue
      else if (i % 7 === 0) starColor = '#fde047'; // Amber
      else if (i % 9 === 0) starColor = '#c084fc'; // Violet
      else if (i % 11 === 0) starColor = '#6ee7b7'; // Mint

      ctx.globalAlpha = twinkle * 0.85;
      ctx.fillStyle = starColor;
      ctx.beginPath();
      ctx.arc(starX, starY, starRadius, 0, Math.PI * 2);
      ctx.fill();

      // Cross diffraction spikes on large bright stars
      if (normSize > 0.85) {
        ctx.strokeStyle = starColor;
        ctx.lineWidth = 0.75;
        const spikeLen = starRadius * 3.5;
        ctx.beginPath();
        ctx.moveTo(starX - spikeLen, starY);
        ctx.lineTo(starX + spikeLen, starY);
        ctx.moveTo(starX, starY - spikeLen);
        ctx.lineTo(starX, starY + spikeLen);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private drawCelestialBody(width: number, height: number, stage: Stage, cameraX: number, time: number) {
    const ctx = this.ctx;
    const config = getStageCelestialConfig(stage);
    const { type, color: baseColor, glowColor, size } = config;

    // Celestial position in sky with subtle parallax
    const cx = (width * 0.76) - ((cameraX * 0.04) % (width * 0.6));
    const cy = height * 0.24;
    const radius = 48 * size;

    ctx.save();
    ctx.translate(cx, cy);

    switch (type) {
      case 'ringed_planet':
        this.renderRingedPlanet(ctx, radius, baseColor, glowColor, time);
        break;
      case 'cyber_moon':
        this.renderCyberMoon(ctx, radius, baseColor, glowColor, time);
        break;
      case 'blood_moon':
        this.renderBloodMoon(ctx, radius, baseColor, glowColor, time);
        break;
      case 'solar_eclipse':
        this.renderSolarEclipse(ctx, radius, glowColor, time);
        break;
      case 'terra_planet':
        this.renderTerraPlanet(ctx, radius, glowColor, time);
        break;
      case 'void_singularity':
        this.renderVoidSingularity(ctx, radius, glowColor, time);
        break;
      case 'binary_moons':
        this.renderBinaryMoons(ctx, radius, baseColor, glowColor, time);
        break;
      case 'gas_giant':
        this.renderGasGiant(ctx, radius, baseColor, glowColor, time);
        break;
      case 'crystal_moon':
        this.renderCrystalMoon(ctx, radius, baseColor, glowColor, time);
        break;
      default:
        this.renderCyberMoon(ctx, radius, baseColor, glowColor, time);
        break;
    }

    ctx.restore();
  }

  private renderRingedPlanet(ctx: CanvasRenderingContext2D, r: number, baseColor: string, glowColor: string, time: number) {
    const ringAngle = -0.38;

    // 1. Outer Glow Aura
    const aura = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 2.2);
    aura.addColorStop(0, `${glowColor}44`);
    aura.addColorStop(0.6, `${glowColor}15`);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 2. Back Half of Planetary Ring
    ctx.save();
    ctx.rotate(ringAngle);
    ctx.scale(1, 0.28);
    
    // Outer ring back
    ctx.strokeStyle = `${glowColor}88`;
    ctx.lineWidth = r * 0.45;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.9, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Inner bright ring back
    ctx.strokeStyle = `${baseColor}aa`;
    ctx.lineWidth = r * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3. Planet Sphere with Atmospheric Bands & 3D Shading
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    // Base body fill
    ctx.fillStyle = baseColor;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // Atmospheric gas bands
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(-r, -r * 0.6, r * 2, r * 0.25);
    ctx.fillRect(-r, 0, r * 2, r * 0.3);
    ctx.fillRect(-r, r * 0.5, r * 2, r * 0.2);

    ctx.fillStyle = `${glowColor}55`;
    ctx.fillRect(-r, -r * 0.25, r * 2, r * 0.15);
    ctx.fillRect(-r, r * 0.35, r * 2, r * 0.1);

    // 3D Spherical Shadow (Terminator)
    const sphereGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    sphereGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
    sphereGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
    sphereGrad.addColorStop(0.85, 'rgba(0,0,0,0.65)');
    sphereGrad.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = sphereGrad;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();

    // 4. Front Half of Planetary Ring (Over the planet)
    ctx.save();
    ctx.rotate(ringAngle);
    ctx.scale(1, 0.28);

    // Outer ring front
    ctx.strokeStyle = `${glowColor}cc`;
    ctx.lineWidth = r * 0.45;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.9, 0, Math.PI);
    ctx.stroke();

    // Inner ring front
    ctx.strokeStyle = `${baseColor}ee`;
    ctx.lineWidth = r * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI);
    ctx.stroke();

    // Cassini Division gap in ring
    ctx.strokeStyle = 'rgba(3, 7, 18, 0.85)';
    ctx.lineWidth = r * 0.05;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.65, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  private renderCyberMoon(ctx: CanvasRenderingContext2D, r: number, baseColor: string, glowColor: string, time: number) {
    // Outer Lunar Corona
    const glow = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 2.0);
    glow.addColorStop(0, `${glowColor}55`);
    glow.addColorStop(0.5, `${glowColor}18`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.0, 0, Math.PI * 2);
    ctx.fill();

    // Moon Disc
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = baseColor;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // Basalt Maria & Crater Textures
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.2, r * 0.38, 0, Math.PI * 2);
    ctx.arc(r * 0.25, r * 0.3, r * 0.32, 0, Math.PI * 2);
    ctx.arc(r * 0.4, -r * 0.35, r * 0.2, 0, Math.PI * 2);
    ctx.arc(-r * 0.15, r * 0.45, r * 0.24, 0, Math.PI * 2);
    ctx.fill();

    // Detailed Impact Craters with Rim Highlights
    const drawCrater = (cx: number, cy: number, cr: number) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx - 0.5, cy - 0.5, cr, Math.PI * 0.75, Math.PI * 1.75);
      ctx.stroke();
    };

    drawCrater(-r * 0.45, r * 0.15, r * 0.14);
    drawCrater(r * 0.1, -r * 0.4, r * 0.11);
    drawCrater(r * 0.35, 0, r * 0.16);
    drawCrater(-r * 0.1, -r * 0.1, r * 0.08);

    // Crescent Terminator Shadow
    const shadow = ctx.createRadialGradient(r * 0.35, -r * 0.3, r * 0.2, 0, 0, r);
    shadow.addColorStop(0, 'rgba(255,255,255,0.15)');
    shadow.addColorStop(0.65, 'rgba(0,0,0,0.1)');
    shadow.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = shadow;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    ctx.restore();

    // High-tech Cyan Rim Light
    ctx.strokeStyle = `${glowColor}aa`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI * 0.6, Math.PI * 0.4);
    ctx.stroke();
  }

  private renderBloodMoon(ctx: CanvasRenderingContext2D, r: number, baseColor: string, glowColor: string, time: number) {
    // Crimson Flare
    const flare = ctx.createRadialGradient(0, 0, r * 0.7, 0, 0, r * 2.4);
    flare.addColorStop(0, `${glowColor}77`);
    flare.addColorStop(0.4, 'rgba(220, 38, 38, 0.25)');
    flare.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flare;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Molten Sphere
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // Glowing Magma Fissures
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.3);
    ctx.lineTo(-r * 0.2, 0);
    ctx.lineTo(r * 0.3, -r * 0.2);
    ctx.lineTo(r * 0.6, r * 0.4);
    ctx.stroke();

    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.5);
    ctx.lineTo(0, -r * 0.1);
    ctx.lineTo(-r * 0.3, r * 0.4);
    ctx.stroke();

    // Shadow
    const shadow = ctx.createRadialGradient(r * 0.2, -r * 0.2, r * 0.2, 0, 0, r);
    shadow.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
    shadow.addColorStop(0.7, 'rgba(0,0,0,0.5)');
    shadow.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = shadow;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    ctx.restore();
  }

  private renderSolarEclipse(ctx: CanvasRenderingContext2D, r: number, glowColor: string, time: number) {
    // 1. Radiant Coronal Streamers
    ctx.save();
    const rays = 24;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2 + time * 0.15;
      const rayLen = r * (1.6 + 0.6 * Math.sin(i * 3 + time * 2));
      const grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
      grad.addColorStop(0, `${glowColor}aa`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3 + Math.sin(i * 2) * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Coronal Halo
    const halo = ctx.createRadialGradient(0, 0, r * 0.95, 0, 0, r * 1.8);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    halo.addColorStop(0.3, `${glowColor}88`);
    halo.addColorStop(0.7, `${glowColor}22`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 3. Occulting Black Moon
    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 4. Diamond Ring Flare on Rim
    const flareAngle = -Math.PI * 0.35;
    const fx = Math.cos(flareAngle) * r;
    const fy = Math.sin(flareAngle) * r;
    const flareGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, r * 0.6);
    flareGrad.addColorStop(0, '#ffffff');
    flareGrad.addColorStop(0.3, '#fef08a');
    flareGrad.addColorStop(0.7, `${glowColor}44`);
    flareGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(fx, fy, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderTerraPlanet(ctx: CanvasRenderingContext2D, r: number, glowColor: string, time: number) {
    // Atmospheric Blue Halo
    const halo = ctx.createRadialGradient(0, 0, r * 0.85, 0, 0, r * 1.6);
    halo.addColorStop(0, `${glowColor}66`);
    halo.addColorStop(0.6, `${glowColor}18`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Planet Globe
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    // Ocean blue
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // Continents
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.2, r * 0.5, 0, Math.PI * 2);
    ctx.arc(r * 0.4, r * 0.3, r * 0.45, 0, Math.PI * 2);
    ctx.arc(r * 0.2, -r * 0.4, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Swirling Clouds
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, -0.8, 1.2);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-r * 0.2, r * 0.2, r * 0.5, 1.0, 2.8);
    ctx.stroke();

    // Day/Night Terminator
    const shadow = ctx.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.1, 0, 0, r);
    shadow.addColorStop(0, 'rgba(255,255,255,0.2)');
    shadow.addColorStop(0.7, 'rgba(0,0,0,0.3)');
    shadow.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = shadow;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  private renderVoidSingularity(ctx: CanvasRenderingContext2D, r: number, glowColor: string, time: number) {
    // Swirling Gravitational Relativistic Accretion Disk
    ctx.save();
    ctx.rotate(time * 0.4);

    // Ultraviolet Accretion Disk Glow
    const disk = ctx.createRadialGradient(0, 0, r * 0.9, 0, 0, r * 2.6);
    disk.addColorStop(0, '#c084fc');
    disk.addColorStop(0.3, '#7c3aed');
    disk.addColorStop(0.6, `${glowColor}44`);
    disk.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = disk;
    ctx.scale(1, 0.35);
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Einstein Ring Gravitational Lensing Halo
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();

    // Absolute Black Hole Event Horizon
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderBinaryMoons(ctx: CanvasRenderingContext2D, r: number, baseColor: string, glowColor: string, time: number) {
    // Primary Moon
    this.renderCyberMoon(ctx, r * 0.85, baseColor, glowColor, time);

    // Orbiting Secondary Companion Moon
    const orbitAngle = time * 0.5;
    const ox = Math.cos(orbitAngle) * (r * 1.8);
    const oy = Math.sin(orbitAngle) * (r * 0.9);
    ctx.save();
    ctx.translate(ox, oy);
    this.renderBloodMoon(ctx, r * 0.38, '#f87171', '#ef4444', time);
    ctx.restore();
  }

  private renderGasGiant(ctx: CanvasRenderingContext2D, r: number, baseColor: string, glowColor: string, time: number) {
    // Outer Atmosphere
    const aura = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 1.8);
    aura.addColorStop(0, `${glowColor}55`);
    aura.addColorStop(0.6, `${glowColor}15`);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = baseColor;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // Banded Turbulence
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(-r, -r * 0.7, r * 2, r * 0.22);
    ctx.fillRect(-r, -r * 0.2, r * 2, r * 0.3);
    ctx.fillRect(-r, r * 0.4, r * 2, r * 0.25);

    ctx.fillStyle = `${glowColor}66`;
    ctx.fillRect(-r, -r * 0.45, r * 2, r * 0.18);
    ctx.fillRect(-r, r * 0.15, r * 2, r * 0.2);

    // Great Storm Vortex (Jupiter-style Oval Eye)
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(r * 0.25, r * 0.2, r * 0.3, r * 0.16, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 3D Shadow
    const shadow = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r);
    shadow.addColorStop(0, 'rgba(255,255,255,0.25)');
    shadow.addColorStop(0.7, 'rgba(0,0,0,0.4)');
    shadow.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = shadow;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    ctx.restore();
  }

  private renderCrystalMoon(ctx: CanvasRenderingContext2D, r: number, baseColor: string, glowColor: string, time: number) {
    // Prismatic Aura
    const aura = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 2.0);
    aura.addColorStop(0, `${glowColor}66`);
    aura.addColorStop(0.5, `${baseColor}22`);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.0, 0, Math.PI * 2);
    ctx.fill();

    // Crystalline faceted geometry
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = baseColor;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // Facet lines & Refractions
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.6, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(r * 0.6, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();

    ctx.restore();

    // Sparkling Highlights
    ctx.fillStyle = '#ffffff';
    const sparkleAngle = time * 2;
    const sx = Math.cos(sparkleAngle) * (r * 0.6);
    const sy = Math.sin(sparkleAngle) * (r * 0.6);
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawGround(width: number, height: number, stage: Stage) {
    const ctx = this.ctx;
    const baseGroundY = height - 120;
    const minX = -3200;
    const maxX = 3200;
    const step = 20;

    // 1. Solid Subterranean Terrain Fill (Curved Ground Polygon)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(minX, height + 400);
    ctx.lineTo(minX, getGroundY(stage, minX, baseGroundY));

    for (let x = minX; x <= maxX; x += step) {
      const gy = getGroundY(stage, x, baseGroundY);
      ctx.lineTo(x, gy);
    }

    ctx.lineTo(maxX, height + 400);
    ctx.closePath();

    // Deep Subterranean Gradient
    const groundGrad = ctx.createLinearGradient(0, baseGroundY - 80, 0, height + 300);
    groundGrad.addColorStop(0, stage.bgGroundColor);
    groundGrad.addColorStop(0.3, '#0f172a');
    groundGrad.addColorStop(1, '#020617');
    ctx.fillStyle = groundGrad;
    ctx.fill();

    // 2. High-Tech Subsurface Topographical Grid & Pylons
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = -3000; x <= 3000; x += 120) {
      const gy = getGroundY(stage, x, baseGroundY);
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x, gy + 160);
      ctx.stroke();

      // Small glowing cyber node along the surface
      ctx.fillStyle = `${stage.accentColor}88`;
      ctx.beginPath();
      ctx.arc(x, gy + 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Sub-surface Contour Resonance Line
    ctx.strokeStyle = `${stage.accentColor}33`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = minX; x <= maxX; x += step) {
      const gy = getGroundY(stage, x, baseGroundY) + 12;
      if (x === minX) ctx.moveTo(x, gy);
      else ctx.lineTo(x, gy);
    }
    ctx.stroke();

    // 4. Glowing Neon Surface Crest Line
    ctx.strokeStyle = stage.accentColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = stage.accentColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let x = minX; x <= maxX; x += step) {
      const gy = getGroundY(stage, x, baseGroundY);
      if (x === minX) ctx.moveTo(x, gy);
      else ctx.lineTo(x, gy);
    }
    ctx.stroke();

    ctx.restore();
  }

  private drawStickman(player: PlayerState, hero: HeroData, time: number) {
    const ctx = this.ctx;
    const pX = player.x;
    const pY = player.y;
    const isFacingLeft = player.facing === 'left';
    const activeWeapon = player.equippedWeapons[player.selectedWeaponSlot] || player.equippedWeapons[0];

    ctx.save();
    ctx.translate(pX, pY);

    // Invulnerability flashing
    if (player.isInvulnerable && Math.floor(time * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stickman Dimensions
    const headRadius = 11;
    const torsoLength = 32;
    const legLength = 26;
    const hipY = -legLength;
    const neckY = hipY - torsoLength;
    const headCenterY = neckY - headRadius;

    // Cape flutter
    if (hero.capeColor) {
      ctx.fillStyle = hero.capeColor;
      ctx.beginPath();
      ctx.moveTo(0, neckY);
      const capeFlutterX = (isFacingLeft ? 1 : -1) * (18 + Math.sin(time * 12) * 5 + Math.abs(player.vx) * 0.05);
      const capeFlutterY = hipY + 14 + Math.cos(time * 10) * 4;
      ctx.lineTo(capeFlutterX, capeFlutterY);
      ctx.lineTo(capeFlutterX * 0.5, hipY + 24);
      ctx.lineTo(0, hipY);
      ctx.closePath();
      ctx.fill();
    }

    // Legs animation
    const isMoving = Math.abs(player.vx) > 10 && player.isGrounded;
    const legAngle1 = isMoving ? Math.sin(player.walkFrame) * 0.6 : (player.isGrounded ? 0.15 : -0.4);
    const legAngle2 = isMoving ? -Math.sin(player.walkFrame) * 0.6 : (player.isGrounded ? -0.15 : 0.4);

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Back Leg
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    const foot1X = Math.sin(legAngle1) * legLength;
    const foot1Y = hipY + Math.cos(legAngle1) * legLength;
    ctx.lineTo(foot1X, foot1Y);
    ctx.stroke();

    // Front Leg
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    const foot2X = Math.sin(legAngle2) * legLength;
    const foot2Y = hipY + Math.cos(legAngle2) * legLength;
    ctx.lineTo(foot2X, foot2Y);
    ctx.stroke();

    // Torso (Spine)
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(0, neckY);
    ctx.stroke();

    // Armor plate / chest light
    ctx.fillStyle = hero.color;
    ctx.beginPath();
    ctx.arc(0, neckY + 14, 4, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, headCenterY, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing Eyes
    const eyeOffsetX = isFacingLeft ? -4 : 4;
    ctx.fillStyle = hero.color;
    ctx.beginPath();
    ctx.arc(eyeOffsetX, headCenterY - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Headgear / Hats
    this.drawHeadgear(ctx, hero.headGearType, headCenterY, headRadius, isFacingLeft, hero.color);

    // Arms & Weapon Aiming
    const shoulderY = neckY + 6;
    const aimAngle = player.aimAngle;
    const recoilKick = player.recoil;

    // Calculate Weapon position
    const handDistance = 24;
    const weaponX = Math.cos(aimAngle) * (handDistance - recoilKick);
    const weaponY = shoulderY + Math.sin(aimAngle) * (handDistance - recoilKick);

    // Back Arm
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(weaponX * 0.7, weaponY * 0.7 + 2);
    ctx.lineTo(weaponX, weaponY);
    ctx.stroke();

    // Draw Equipped Weapon
    this.drawWeapon(ctx, activeWeapon, weaponX, weaponY, aimAngle, recoilKick, player.isReloading);

    // Front Arm
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(weaponX * 0.6 - (isFacingLeft ? 4 : -4), weaponY * 0.5);
    ctx.lineTo(weaponX, weaponY);
    ctx.stroke();

    // Reloading indicator spinner
    if (player.isReloading) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, headCenterY - 24, 10, -Math.PI / 2, -Math.PI / 2 + player.reloadProgress * Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawHeadgear(
    ctx: CanvasRenderingContext2D,
    gear: HeroData['headGearType'],
    headY: number,
    radius: number,
    facingLeft: boolean,
    color: string
  ) {
    ctx.save();
    if (gear === 'goggles') {
      // Tactical Visor / Goggles
      ctx.fillStyle = color;
      ctx.fillRect(facingLeft ? -13 : -1, headY - 4, 14, 5);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(facingLeft ? -13 : -1, headY - 4, 14, 5);
    } else if (gear === 'hood') {
      // Wizard / Sorcerer Hood
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-radius - 3, headY + 3);
      ctx.lineTo(0, headY - radius - 12);
      ctx.lineTo(radius + 3, headY + 3);
      ctx.closePath();
      ctx.fill();
    } else if (gear === 'beret') {
      // Commando Beret
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(facingLeft ? -2 : 2, headY - radius + 2, 14, 6, facingLeft ? -0.2 : 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (gear === 'helmet') {
      // Heavy Steel Helmet
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(0, headY, radius + 2, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-radius - 1, headY - 1, (radius + 1) * 2, 4);
    } else if (gear === 'crown') {
      // Holy Radiant Crown
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-radius, headY - radius + 1);
      ctx.lineTo(-radius + 4, headY - radius - 8);
      ctx.lineTo(-radius + 8, headY - radius - 2);
      ctx.lineTo(0, headY - radius - 10);
      ctx.lineTo(radius - 8, headY - radius - 2);
      ctx.lineTo(radius - 4, headY - radius - 8);
      ctx.lineTo(radius, headY - radius + 1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private drawWeapon(
    ctx: CanvasRenderingContext2D,
    weapon: any,
    x: number,
    y: number,
    angle: number,
    recoil: number,
    isReloading: boolean
  ) {
    if (!weapon) return;
    ctx.save();
    ctx.translate(x, y);

    let drawAngle = angle;
    if (isReloading) {
      drawAngle += 0.8; // point down while reloading
    }
    ctx.rotate(drawAngle);

    const isFlip = Math.abs(angle) > Math.PI / 2;
    if (isFlip) {
      ctx.scale(1, -1);
    }

    // Render weapon based on type
    ctx.fillStyle = weapon.color || '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;

    switch (weapon.type) {
      case 'pistol':
        // Compact handgun barrel & grip
        ctx.fillRect(0, -3, 14, 6);
        ctx.fillRect(-2, 0, 5, 8);
        break;
      case 'smg':
        // Submachine gun with front grip & mag
        ctx.fillRect(-2, -4, 22, 7);
        ctx.fillRect(-2, 0, 5, 9);
        ctx.fillRect(8, 2, 4, 10);
        break;
      case 'shotgun':
        // Long double barrel shotgun
        ctx.fillRect(-4, -4, 28, 7);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-10, -3, 8, 6);
        break;
      case 'rifle':
        // Assault rifle with stock and curved magazine
        ctx.fillRect(-8, -4, 32, 7);
        ctx.fillStyle = '#334155';
        ctx.fillRect(-14, -3, 7, 7);
        ctx.fillRect(4, 2, 6, 11);
        break;
      case 'sniper':
        // Long sniper with scope
        ctx.fillRect(-12, -3, 44, 6);
        // Scope
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(2, -8, 16, 4);
        break;
      case 'heavy':
        // Massive multi-barrel Gatling
        ctx.fillRect(-8, -7, 36, 14);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(12, -6, 18, 12);
        break;
      case 'launcher':
        // Heavy Bazooka tube
        ctx.fillRect(-16, -7, 40, 14);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(26, 0, 7, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        break;
      case 'magic':
        // Arcane glowing staff
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-10, -2, 34, 4);
        ctx.fillStyle = weapon.color;
        ctx.beginPath();
        ctx.arc(26, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'bow':
        // Recurve bow
        ctx.strokeStyle = weapon.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(6, 0, 18, -Math.PI / 2.3, Math.PI / 2.3);
        ctx.stroke();
        // Bow string
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(6, -16);
        ctx.lineTo(-4, 0);
        ctx.lineTo(6, 16);
        ctx.stroke();
        break;
    }

    // Laser Sight for high-tier weapons
    if (weapon.tier >= 3 && !isReloading) {
      ctx.strokeStyle = weapon.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.lineTo(weapon.range, 0);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  private drawEnemies(enemies: Enemy[], time: number) {
    const ctx = this.ctx;

    // 1. Draw Tether Beams (Nanite Healer to targets)
    enemies.forEach((enemy) => {
      if (enemy.type === 'nanite_healer' && enemy.healTargetId) {
        const target = enemies.find((e) => e.id === enemy.healTargetId);
        if (target) {
          ctx.save();
          ctx.strokeStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = -time * 30;
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y - 20);
          ctx.lineTo(target.x, target.y - 25);
          ctx.stroke();
          ctx.restore();
        }
      }
    });

    // 2. Draw Enemies
    enemies.forEach((enemy) => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      const isFacingLeft = enemy.facing === 'left';
      const isAerial = enemy.type === 'bat' || enemy.type === 'emp_disrupter' || enemy.type === 'nanite_healer' || enemy.type === 'phantom_spectre';
      const scale = enemy.isBoss ? 2.3 : (enemy.type === 'golem' || enemy.type === 'minigun_juggernaut' ? 1.35 : 1.0);

      ctx.scale(scale * (isFacingLeft ? -1 : 1), scale);

      // Cloaked stealth transparency
      if (enemy.isCloaked) {
        ctx.globalAlpha = 0.35;
      }

      // Status effect color overlay
      if (enemy.frozenTimer && enemy.frozenTimer > 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      } else if (enemy.burnTimer && enemy.burnTimer > 0) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      }

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 0, isAerial ? 14 : (enemy.isBoss ? 35 : (enemy.type === 'plasma_tank' ? 26 : 18)), 5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (enemy.type === 'spider_drone') {
        // === ARACHNID 4-LEGGED SPIDER BOT ===
        const walkCycle = Math.sin(enemy.walkFrame || 0);
        
        // Spider Legs (Front and Back Pairs)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';

        // Leg 1 (Front Top)
        ctx.beginPath();
        ctx.moveTo(4, -10);
        ctx.lineTo(16 + walkCycle * 4, -20);
        ctx.lineTo(24 + walkCycle * 6, 0);
        ctx.stroke();

        // Leg 2 (Front Bot)
        ctx.beginPath();
        ctx.moveTo(6, -8);
        ctx.lineTo(14 - walkCycle * 4, -14);
        ctx.lineTo(18 - walkCycle * 6, 0);
        ctx.stroke();

        // Leg 3 (Back Top)
        ctx.beginPath();
        ctx.moveTo(-4, -10);
        ctx.lineTo(-16 - walkCycle * 4, -20);
        ctx.lineTo(-24 - walkCycle * 6, 0);
        ctx.stroke();

        // Leg 4 (Back Bot)
        ctx.beginPath();
        ctx.moveTo(-6, -8);
        ctx.lineTo(-14 + walkCycle * 4, -14);
        ctx.lineTo(-18 + walkCycle * 6, 0);
        ctx.stroke();

        // Spider Main Body Chassis
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -12, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Abdomen Egg Pod
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(-10, -15, 8, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing Spider Eyes (Multi-cluster)
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 6;
        ctx.fillRect(6, -14, 3, 2);
        ctx.fillRect(8, -11, 2, 2);
        ctx.fillRect(5, -9, 2, 2);
        ctx.shadowBlur = 0;

        // Acid Fangs
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.moveTo(10, -8);
        ctx.lineTo(15, -4);
        ctx.lineTo(12, -2);
        ctx.fill();

      } else if (enemy.type === 'plasma_tank') {
        // === HEAVY ARMORED PLASMA HOVER TANK ===
        const hoverY = -14 + Math.sin(time * 6 + enemy.x) * 2;

        // Tread Chassis / Hover Base
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-24, hoverY + 6, 48, 10, 4);
        ctx.fill();
        ctx.stroke();

        // Hover Thruster Blue Emitters
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fillRect(-18, hoverY + 16, 8, 2);
        ctx.fillRect(10, hoverY + 16, 8, 2);
        ctx.shadowBlur = 0;

        // Armored Turret Hull
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-16, hoverY - 8, 32, 14, 4);
        ctx.fill();
        ctx.stroke();

        // Heavy Plasma Cannon Barrel
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.fillRect(8, hoverY - 4, 24, 6);
        ctx.strokeRect(8, hoverY - 4, 24, 6);

        // Glowing Plasma Charge Chamber
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.fillRect(14, hoverY - 3, 12, 4);
        ctx.shadowBlur = 0;

      } else if (enemy.type === 'kamikaze_drone') {
        // === KAMIKAZE BOMB SENTRY ===
        const floatY = -24 + Math.sin(time * 12 + enemy.x) * 3;
        const isBlinking = enemy.isPrimed && Math.sin(time * 30) > 0;

        // Spiked Bomb Core
        ctx.fillStyle = isBlinking ? '#f87171' : '#1e293b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, floatY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Perimeter Spikes / Sensors
        [-Math.PI / 4, 0, Math.PI / 4, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((ang) => {
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * 12, floatY + Math.sin(ang) * 12);
          ctx.lineTo(Math.cos(ang) * 17, floatY + Math.sin(ang) * 17);
          ctx.stroke();
        });

        // Pulsing Warning Core
        ctx.fillStyle = isBlinking ? '#ffffff' : '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = enemy.isPrimed ? 14 : 6;
        ctx.beginPath();
        ctx.arc(0, floatY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (enemy.type === 'emp_disrupter') {
        // === EMP SHOCKWAVE LEVITATING CORE ===
        const hoverY = -28 + Math.sin(time * 6) * 4;

        // Gyroscopic Ring 1
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, hoverY, 18, 8, time * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Gyroscopic Ring 2
        ctx.strokeStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(0, hoverY, 18, 8, -time * 2.5, 0, Math.PI * 2);
        ctx.stroke();

        // Central Electric Plasma Orb
        ctx.fillStyle = '#bae6fd';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, hoverY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (enemy.type === 'nanite_healer') {
        // === MEDICAL REPAIR DRONE ===
        const hoverY = -32 + Math.sin(time * 7) * 4;

        // Quad Emitter Winglets
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, hoverY);
        ctx.lineTo(16, hoverY);
        ctx.moveTo(0, hoverY - 12);
        ctx.lineTo(0, hoverY + 12);
        ctx.stroke();

        // Medical Capsule Body
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-10, hoverY - 10, 20, 20, 4);
        ctx.fill();
        ctx.stroke();

        // Medical Green Cross
        ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 8;
        ctx.fillRect(-2, hoverY - 6, 4, 12);
        ctx.fillRect(-6, hoverY - 2, 12, 4);
        ctx.shadowBlur = 0;

      } else if (enemy.type === 'phantom_spectre') {
        // === VOID PHANTOM SPECTRE ===
        const hoverY = -28 + Math.sin(time * 5) * 5;

        // Dark Matter Cloak Body
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, hoverY - 18);
        ctx.lineTo(14, hoverY + 10);
        ctx.lineTo(6, hoverY + 6);
        ctx.lineTo(0, hoverY + 14);
        ctx.lineTo(-6, hoverY + 6);
        ctx.lineTo(-14, hoverY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing Void Eye Slit
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(3, hoverY - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Twin Energy Scythe Blades
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(8, hoverY);
        ctx.lineTo(20, hoverY - 10);
        ctx.lineTo(16, hoverY + 14);
        ctx.stroke();

      } else if (enemy.type === 'bat') {
        // === FLYING ATTACK DRONE / QUAD-ROTOR BOT ===
        const droneHoverY = -30 + Math.sin(time * 8 + enemy.x) * 4;

        // Drone Body (Metallic Capsule)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-16, droneHoverY - 8, 32, 16, 6);
        ctx.fill();
        ctx.stroke();

        // Twin Rotor Arms
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-16, droneHoverY);
        ctx.lineTo(-24, droneHoverY - 6);
        ctx.moveTo(16, droneHoverY);
        ctx.lineTo(24, droneHoverY - 6);
        ctx.stroke();

        // Spinning Rotor Blades
        const bladeW = Math.abs(Math.sin(time * 25)) * 14;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-24 - bladeW, droneHoverY - 6);
        ctx.lineTo(-24 + bladeW, droneHoverY - 6);
        ctx.moveTo(24 - bladeW, droneHoverY - 6);
        ctx.lineTo(24 + bladeW, droneHoverY - 6);
        ctx.stroke();

        // Glowing Drone Optic Lens
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(6, droneHoverY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Laser Underbelly Blaster
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, droneHoverY + 4, 12, 4);

        // Thruster glow
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.beginPath();
        ctx.arc(0, droneHoverY + 8, 3, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // === BIPEDAL COMBAT ROBOTS (Enforcers, Assassins, Snipers, Gatling Juggernaut, Mortar Mech, Boss) ===
        const isJuggernaut = enemy.type === 'minigun_juggernaut' || enemy.type === 'golem';
        const headRadius = isJuggernaut ? 12 : 9;
        const torsoLength = isJuggernaut ? 34 : 26;
        const legLength = isJuggernaut ? 26 : 22;
        const hipY = -legLength;
        const neckY = hipY - torsoLength;
        const headCenterY = neckY - headRadius;

        // Leg walk cycle
        const leg1 = Math.sin(enemy.walkFrame) * 0.55;
        const leg2 = -Math.sin(enemy.walkFrame) * 0.55;

        // Robotic Legs (Metallic Segments & Joints)
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = enemy.isBoss ? 6 : (isJuggernaut ? 5 : 3.5);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'miter';

        // Back Leg
        ctx.beginPath();
        ctx.moveTo(0, hipY);
        const k1X = Math.sin(leg1) * (legLength * 0.5);
        const k1Y = hipY + Math.cos(leg1) * (legLength * 0.5);
        const f1X = Math.sin(leg1) * legLength;
        const f1Y = hipY + Math.cos(leg1) * legLength;
        ctx.lineTo(k1X, k1Y);
        ctx.lineTo(f1X, f1Y);
        ctx.stroke();

        // Front Leg
        ctx.beginPath();
        ctx.moveTo(0, hipY);
        const k2X = Math.sin(leg2) * (legLength * 0.5);
        const k2Y = hipY + Math.cos(leg2) * (legLength * 0.5);
        const f2X = Math.sin(leg2) * legLength;
        const f2Y = hipY + Math.cos(leg2) * legLength;
        ctx.lineTo(k2X, k2Y);
        ctx.lineTo(f2X, f2Y);
        ctx.stroke();

        // Robotic Torso / Armored Chassis
        ctx.strokeStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(0, hipY);
        ctx.lineTo(0, neckY);
        ctx.stroke();

        // Armored Chestplate
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 1.5;
        ctx.fillRect(-7, neckY + 4, 14, 16);
        ctx.strokeRect(-7, neckY + 4, 14, 16);

        // Core Reactor Glow on Chest
        ctx.fillStyle = enemy.isBoss ? '#ef4444' : (enemy.type === 'stealth_assassin' ? '#ec4899' : (enemy.type === 'runner' ? '#eab308' : enemy.color));
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, neckY + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Robotic Head (Chassis & Antenna)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-8, headCenterY - headRadius, 16, headRadius * 2, 4);
        ctx.fill();
        ctx.stroke();

        // Robot Antenna / Sensor Horn
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, headCenterY - headRadius);
        ctx.lineTo(0, headCenterY - headRadius - 7);
        ctx.stroke();
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(0, headCenterY - headRadius - 8, 2, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Scanning Eye / Optical Visor Slit
        ctx.fillStyle = enemy.isBoss ? '#ef4444' : (enemy.type === 'runner' ? '#fbbf24' : '#ef4444');
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fillRect(1, headCenterY - 2, 7, 4);
        ctx.shadowBlur = 0;

        // Robotic Weapon / Laser Arm / Heavy Armaments
        const shoulderY = neckY + 6;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(12, shoulderY + 4);
        ctx.stroke();

        if (enemy.type === 'runner') {
          // Cyber Blade
          ctx.strokeStyle = '#facc15';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(12, shoulderY + 4);
          ctx.lineTo(24, shoulderY + 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (enemy.type === 'stealth_assassin') {
          // Dual High-Frequency Cyber Katanas
          ctx.strokeStyle = '#ec4899';
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(12, shoulderY + 4);
          ctx.lineTo(26, shoulderY - 4);
          ctx.moveTo(12, shoulderY + 4);
          ctx.lineTo(24, shoulderY + 12);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (enemy.type === 'minigun_juggernaut') {
          // 3-Barrel Rotary Gatling Cannon
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(10, shoulderY - 2, 22, 10);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(32, shoulderY - 1, 6, 8);
          // Ammo Pack on Back
          ctx.fillStyle = '#334155';
          ctx.fillRect(-16, neckY + 2, 10, 18);
        } else if (enemy.type === 'mortar_artillery') {
          // Upward Angled Siege Mortar Tube
          ctx.save();
          ctx.translate(10, shoulderY);
          ctx.rotate(-0.8);
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 1.5;
          ctx.fillRect(0, -6, 26, 12);
          ctx.strokeRect(0, -6, 26, 12);
          ctx.restore();
        } else if (enemy.type === 'sniper') {
          // Long Railgun Barrel
          ctx.fillStyle = '#334155';
          ctx.fillRect(10, shoulderY + 2, 22, 4);
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(30, shoulderY + 1, 4, 6);
        } else {
          // Standard Blaster Cannon
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(10, shoulderY + 2, 14, 5);
        }

        // Energy Forcefield Shield
        if (enemy.shieldActive || enemy.type === 'shielded') {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(16, headCenterY - 10, 10, 52, 5);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Boss Heavy Dreadnought Mecha Enhancements
        if (enemy.isBoss) {
          // Shoulder Rotary Gatling Cannon & Missile Pod
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.fillRect(-16, neckY - 10, 14, 14);
          ctx.strokeRect(-16, neckY - 10, 14, 14);

          // Rocket Pod Grid
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-14, neckY - 8, 3, 3);
          ctx.fillRect(-8, neckY - 8, 3, 3);
          ctx.fillRect(-14, neckY - 2, 3, 3);
          ctx.fillRect(-8, neckY - 2, 3, 3);

          // Heavy Twin Arm Cannon
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(12, shoulderY, 26, 8);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(36, shoulderY - 1, 4, 10);
        }
      }

      ctx.restore();

      // Overhead Health Bar
      const barWidth = enemy.isBoss ? 130 : 36;
      const barHeight = enemy.isBoss ? 8 : 4;
      const barY = enemy.y - (enemy.isBoss ? 130 : (isAerial ? 55 : 68));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);

      const hpPercent = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = enemy.isBoss ? '#ef4444' : (enemy.isCloaked ? '#ec4899' : '#38bdf8');
      ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth * hpPercent, barHeight);

      if (enemy.isBoss) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⚡ ${enemy.name}`, enemy.x, barY - 6);
      }
    });
  }

  private drawProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;

    projectiles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);

      const angle = Math.atan2(p.vy, p.vx);
      ctx.rotate(angle);

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.type === 'rocket') {
        // Rocket body
        ctx.fillRect(-10, -3, 20, 6);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(10, -4);
        ctx.lineTo(16, 0);
        ctx.lineTo(10, 4);
        ctx.fill();
      } else if (p.type === 'magic' || p.element === 'lightning') {
        // Glowing magic energy orb
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'bow') {
        // Arrow
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(12, 0);
        ctx.stroke();
        // Arrowhead
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(12, -4);
        ctx.lineTo(18, 0);
        ctx.lineTo(12, 4);
        ctx.fill();
      } else {
        // Bullet tracer line
        ctx.fillRect(-8, -p.radius, 16, p.radius * 2);
      }

      ctx.restore();
    });
  }

  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    particles.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.translate(pt.x, pt.y);

      if (pt.rotation) {
        ctx.rotate(pt.rotation);
      }

      ctx.fillStyle = pt.color;

      if (pt.shape === 'shell') {
        // Brass bullet casing
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-3, -1.5, 6, 3);
      } else if (pt.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (pt.shape === 'smoke') {
        ctx.beginPath();
        ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
      }

      ctx.restore();
    });
    ctx.globalAlpha = 1.0;
  }

  private drawDamageNumbers(damageNumbers: DamageNumber[]) {
    const ctx = this.ctx;

    damageNumbers.forEach((d) => {
      ctx.save();
      const alpha = Math.max(0, d.lifespan / d.maxLifespan);
      ctx.globalAlpha = alpha;

      if (d.isHeadshot) {
        ctx.font = '900 18px "Inter", sans-serif';
        ctx.textAlign = 'center';
        
        // Headshot text outline for high legibility
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.lineWidth = 3.5;
        ctx.strokeText(d.text, d.x, d.y);

        ctx.fillStyle = '#ff2a5f';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.fillText(d.text, d.x, d.y);
      } else {
        ctx.font = `${d.isCrit ? 'bold 18px' : 'bold 13px'} "Inter", sans-serif`;
        ctx.fillStyle = d.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(d.text, d.x, d.y);
      }

      ctx.restore();
    });
  }

  private drawPet(petState: PetRuntimeState, time: number) {
    const ctx = this.ctx;
    const pet = petState.pet;
    const isFacingLeft = petState.facing === 'left';
    const isPouncing = petState.state === 'pouncing';

    ctx.save();
    ctx.translate(petState.x, petState.y);

    // Subtle breathing / hover bob
    const hoverY = (pet.species === 'falcon' || pet.species === 'dragon') ? Math.sin(time * 6) * 4 : 0;
    ctx.translate(0, hoverY);

    // Flip horizontally if facing left
    ctx.scale(isFacingLeft ? -1 : 1, 1);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, pet.species === 'dragon' ? 24 : 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pouncing action trail
    if (isPouncing) {
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(-15, -10);
      ctx.lineTo(-30, -5);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    if (pet.species === 'dog') {
      // === CYBER PUP / ROBO DOG ===
      const legOffset1 = Math.sin(petState.animFrame) * 6;
      const legOffset2 = -Math.sin(petState.animFrame) * 6;

      // Legs (4 cyber puppy paws)
      ctx.fillStyle = '#475569';
      ctx.fillRect(-10 + legOffset1, -8, 4, 8);
      ctx.fillRect(-4 + legOffset2, -8, 4, 8);
      ctx.fillRect(4 + legOffset1, -8, 4, 8);
      ctx.fillRect(10 + legOffset2, -8, 4, 8);

      // Torso (Metallic Puppy Body)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-14, -20, 26, 14, 5);
      ctx.fill();
      ctx.stroke();

      // Cyber Collar
      ctx.fillStyle = pet.accentColor;
      ctx.fillRect(7, -19, 4, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(9, -13, 2, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(6, -28, 16, 14, 4);
      ctx.fill();
      ctx.stroke();

      // Floppy Cyber Ears
      ctx.fillStyle = pet.accentColor;
      ctx.beginPath();
      ctx.moveTo(8, -28);
      ctx.lineTo(4, -20 + Math.sin(time * 8) * 3);
      ctx.lineTo(11, -22);
      ctx.closePath();
      ctx.fill();

      // Glowing Eye Visor
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.fillRect(15, -25, 5, 4);
      ctx.shadowBlur = 0;

      // Cute Cyber Snout & Nose
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(19, -21, 5, 5);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(22, -22, 2, 2);

      // Wagging Antenna Tail
      const tailWag = Math.sin(time * 18) * 8;
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-14, -16);
      ctx.lineTo(-24, -26 + tailWag);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-24, -26 + tailWag, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (pet.species === 'cat') {
      // === MECHA KITTY / CYBER CAT ===
      const legOffset1 = Math.sin(petState.animFrame) * 7;
      const legOffset2 = -Math.sin(petState.animFrame) * 7;

      // Legs
      ctx.fillStyle = '#475569';
      ctx.fillRect(-10 + legOffset1, -7, 3, 7);
      ctx.fillRect(-4 + legOffset2, -7, 3, 7);
      ctx.fillRect(5 + legOffset1, -7, 3, 7);
      ctx.fillRect(10 + legOffset2, -7, 3, 7);

      // Sleek Body
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-12, -18, 24, 12, 6);
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(12, -16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pointy Triangular Ears
      ctx.fillStyle = pet.accentColor;
      ctx.beginPath();
      ctx.moveTo(8, -22);
      ctx.lineTo(10, -29);
      ctx.lineTo(14, -22);
      ctx.closePath();
      ctx.fill();

      // Glowing Feline Slit Eyes
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 6;
      ctx.fillRect(14, -18, 3, 4);
      ctx.shadowBlur = 0;

      // Curving S-Tail
      const tailWave = Math.sin(time * 10) * 4;
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, -14);
      ctx.quadraticCurveTo(-22, -26 + tailWave, -18, -32 + tailWave);
      ctx.stroke();

    } else if (pet.species === 'wolf') {
      // === BATTLE HOUND / MECHA WOLF ===
      const legOffset1 = Math.sin(petState.animFrame) * 8;
      const legOffset2 = -Math.sin(petState.animFrame) * 8;

      // Heavy Armored Legs
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 1.5;
      ctx.fillRect(-14 + legOffset1, -9, 5, 9);
      ctx.fillRect(-6 + legOffset2, -9, 5, 9);
      ctx.fillRect(6 + legOffset1, -9, 5, 9);
      ctx.fillRect(14 + legOffset2, -9, 5, 9);

      // Armored Chassis
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-18, -24, 34, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Armored Spine Plates
      ctx.fillStyle = pet.accentColor;
      for (let i = -14; i <= 8; i += 7) {
        ctx.beginPath();
        ctx.moveTo(i, -24);
        ctx.lineTo(i + 3, -29);
        ctx.lineTo(i + 6, -24);
        ctx.fill();
      }

      // Wolf Head & Jaws
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12, -26);
      ctx.lineTo(26, -20);
      ctx.lineTo(28, -14);
      ctx.lineTo(14, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fierce Red Visor
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 8;
      ctx.fillRect(18, -23, 6, 4);
      ctx.shadowBlur = 0;

      // Bushy Cyber Tail
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-18, -20);
      ctx.lineTo(-30, -16 + Math.sin(time * 8) * 4);
      ctx.stroke();

    } else if (pet.species === 'falcon') {
      // === AERO FALCON / RAPTOR DRONE ===
      // Hovering Drone Raptor Body
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -16, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Flapping Energy Wings
      const wingFlap = Math.sin(time * 14) * 14;
      ctx.fillStyle = pet.accentColor;
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -18);
      ctx.lineTo(-2, -32 + wingFlap);
      ctx.lineTo(10, -22 + wingFlap * 0.5);
      ctx.lineTo(6, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Beak Blaster Cannon
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(12, -18);
      ctx.lineTo(22, -15);
      ctx.lineTo(12, -12);
      ctx.closePath();
      ctx.fill();

      // Falcon Optical Sensor
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(8, -17, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Jet Thruster Tail Flames
      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.beginPath();
      ctx.moveTo(-14, -16);
      ctx.lineTo(-24 - Math.random() * 6, -16);
      ctx.lineTo(-14, -13);
      ctx.closePath();
      ctx.fill();

    } else if (pet.species === 'panther') {
      // === VOID PANTHER / SHADOW BEAST ===
      const legOffset1 = Math.sin(petState.animFrame) * 8;
      const legOffset2 = -Math.sin(petState.animFrame) * 8;

      // Prowling Stealth Legs
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2;
      ctx.fillRect(-14 + legOffset1, -8, 4, 8);
      ctx.fillRect(-6 + legOffset2, -8, 4, 8);
      ctx.fillRect(6 + legOffset1, -8, 4, 8);
      ctx.fillRect(14 + legOffset2, -8, 4, 8);

      // Sleek Obsidian Body
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, -20, 32, 13, 5);
      ctx.fill();
      ctx.stroke();

      // Dark Matter Aura Glow
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(-17, -21, 34, 15);

      // Panther Head
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(10, -26, 15, 13, 4);
      ctx.fill();
      ctx.stroke();

      // Glowing Cyan Eye Slits
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(17, -23, 6, 3);
      ctx.shadowBlur = 0;

      // Shadow Tail
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-16, -16);
      ctx.quadraticCurveTo(-26, -26, -22, -32 + Math.sin(time * 6) * 4);
      ctx.stroke();

    } else if (pet.species === 'dragon') {
      // === APEX MECHA DRAGON (Costliest Legendary Companion) ===
      const wingBeat = Math.sin(time * 8) * 16;

      // Dragon Serpentine Cyber Body
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-18, -26, 36, 18, 8);
      ctx.fill();
      ctx.stroke();

      // Chest Plasma Arc Reactor
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, -17, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Dragon Back Horns / Spines
      ctx.fillStyle = '#ea580c';
      for (let i = -12; i <= 10; i += 7) {
        ctx.beginPath();
        ctx.moveTo(i, -26);
        ctx.lineTo(i + 3, -34);
        ctx.lineTo(i + 6, -26);
        ctx.fill();
      }

      // Massive Articulated Plasma Wings
      ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-6, -24);
      ctx.lineTo(-12, -48 + wingBeat);
      ctx.lineTo(12, -42 + wingBeat * 0.8);
      ctx.lineTo(24, -30 + wingBeat * 0.4);
      ctx.lineTo(8, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dragon Armored Head & Horns
      ctx.fillStyle = '#0c0a09';
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(14, -28);
      ctx.lineTo(30, -22);
      ctx.lineTo(32, -14);
      ctx.lineTo(16, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dragon Flaming Horns
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(16, -28);
      ctx.lineTo(12, -38);
      ctx.lineTo(20, -26);
      ctx.fill();

      // Molten Fiery Eye
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.fillRect(22, -24, 6, 4);
      ctx.shadowBlur = 0;

      // Long Segmented Tail with Energy Blade
      const tailWave = Math.sin(time * 6) * 6;
      ctx.strokeStyle = pet.color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-18, -18);
      ctx.quadraticCurveTo(-32, -22 + tailWave, -40, -14 + tailWave);
      ctx.stroke();

      // Tail Blade
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-40, -14 + tailWave);
      ctx.lineTo(-48, -20 + tailWave);
      ctx.lineTo(-44, -10 + tailWave);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore(); // end flip scale & translate

    // Floating Nameplate Tag (Always readable above pet)
    ctx.save();
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';

    const tagY = petState.y - (pet.species === 'dragon' ? 52 : (pet.species === 'falcon' ? 44 : 34));
    
    // Background pill
    const tagText = `${pet.icon} ${pet.name} Lv.${pet.level}`;
    const textWidth = ctx.measureText(tagText).width;
    
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = pet.color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(petState.x - textWidth / 2 - 6, tagY - 11, textWidth + 12, 15, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pet.color;
    ctx.fillText(tagText, petState.x, tagY);
    ctx.restore();
  }

  private drawEnemyHouses(
    width: number,
    height: number,
    stage: Stage,
    time: number,
    enemyHouses?: {
      left: { x: number; width: number; height: number; spawnTimer: number; shieldHitTimer: number; name: string };
      right: { x: number; width: number; height: number; spawnTimer: number; shieldHitTimer: number; name: string };
    } | null
  ) {
    const ctx = this.ctx;
    const baseGroundY = height - 120;

    const leftHouse = enemyHouses?.left || {
      x: -1100,
      width: 220,
      height: 280,
      spawnTimer: 0,
      shieldHitTimer: 0,
      name: 'OUTPOST ALPHA (WEST BASE)'
    };

    const rightHouse = enemyHouses?.right || {
      x: 1100,
      width: 220,
      height: 280,
      spawnTimer: 0,
      shieldHitTimer: 0,
      name: 'OUTPOST OMEGA (EAST BASE)'
    };

    const houses = [
      { side: 'left' as const, data: leftHouse, boundaryX: -980 },
      { side: 'right' as const, data: rightHouse, boundaryX: 980 }
    ];

    for (const h of houses) {
      const house = h.data;
      const isLeft = h.side === 'left';
      const groundY = getGroundY(stage, house.x, baseGroundY);
      const isSpawning = house.spawnTimer > 0;
      const isShieldHit = house.shieldHitTimer > 0;

      ctx.save();
      ctx.translate(house.x, groundY);

      // Mirror for right fortress
      if (!isLeft) {
        ctx.scale(-1, 1);
      }

      // 1. Impassable Laser Boundary Sky Grid (Terminates the arena at the fortress wall)
      ctx.save();
      const wallAlpha = 0.4 + Math.sin(time * 6) * 0.15 + (isShieldHit ? 0.4 : 0);
      const boundaryLaserGrad = ctx.createLinearGradient(120, -600, 120, 0);
      boundaryLaserGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      boundaryLaserGrad.addColorStop(0.5, `rgba(239, 68, 68, ${wallAlpha * 0.7})`);
      boundaryLaserGrad.addColorStop(1, `rgba(239, 68, 68, ${wallAlpha})`);

      ctx.fillStyle = boundaryLaserGrad;
      ctx.fillRect(110, -600, 20, 600);

      // Boundary Laser Core Lines
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(120, -600);
      ctx.lineTo(120, 0);
      ctx.stroke();

      // Laser Fence Scan Lines
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 1;
      for (let ly = -550; ly < 0; ly += 40) {
        const offset = (time * 40) % 40;
        const lineY = ly + offset;
        if (lineY < 0) {
          ctx.beginPath();
          ctx.moveTo(80, lineY);
          ctx.lineTo(140, lineY);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 2. Heavy Foundation Sub-Structure / Blast Trench
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.rect(-120, 0, 240, 120);
      ctx.fill();

      // 3. Main Fortress Hull (Reinforced Sloped Titanium Bunker)
      const hullGrad = ctx.createLinearGradient(-110, -260, 110, 0);
      hullGrad.addColorStop(0, '#27272a');
      hullGrad.addColorStop(0.4, '#18181b');
      hullGrad.addColorStop(1, '#09090b');

      ctx.fillStyle = hullGrad;
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-110, 0);
      ctx.lineTo(-100, -220); // Front armor slope
      ctx.lineTo(-40, -260);  // Upper roof deck
      ctx.lineTo(100, -260);  // Roof deck
      ctx.lineTo(110, 0);     // Rear barrier wall
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Armor Plating Seams & Bolt Rivets
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-90, -110);
      ctx.lineTo(100, -110);
      ctx.moveTo(-70, -190);
      ctx.lineTo(100, -190);
      ctx.moveTo(20, -260);
      ctx.lineTo(20, 0);
      ctx.stroke();

      // Armor Rivets
      ctx.fillStyle = '#71717a';
      const rivets = [
        [-95, -20], [-95, -80], [-85, -130], [-65, -210],
        [95, -20], [95, -80], [95, -140], [95, -200],
        [-20, -250], [40, -250], [80, -250]
      ];
      for (const [rx, ry] of rivets) {
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Hazard Warning Chevrons on Lower Blast Skirt (Yellow / Black diagonal stripes)
      ctx.save();
      ctx.beginPath();
      ctx.rect(-105, -35, 100, 25);
      ctx.clip();
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-105, -35, 100, 25);
      ctx.fillStyle = '#09090b';
      for (let hx = -130; hx < 20; hx += 16) {
        ctx.beginPath();
        ctx.moveTo(hx, -10);
        ctx.lineTo(hx + 10, -35);
        ctx.lineTo(hx + 18, -35);
        ctx.lineTo(hx + 8, -10);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 5. Heavy Garrison Hangar Blast Gate (Where Enemies Emerge)
      const doorOpenOffset = isSpawning ? Math.min(35, (0.8 - house.spawnTimer) * 120) : 0;
      const doorX = -75;
      const doorY = -125;
      const doorW = 75;
      const doorH = 125;

      // Gate Frame
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(doorX - 6, doorY - 6, doorW + 12, doorH + 6);

      // Inner Core Glow (Behind the sliding blast doors)
      const coreGrad = ctx.createRadialGradient(
        doorX + doorW / 2,
        doorY + doorH / 2,
        5,
        doorX + doorW / 2,
        doorY + doorH / 2,
        60
      );
      if (isSpawning) {
        coreGrad.addColorStop(0, '#fef08a');
        coreGrad.addColorStop(0.3, '#f97316');
        coreGrad.addColorStop(0.7, '#dc2626');
        coreGrad.addColorStop(1, '#000000');
      } else {
        coreGrad.addColorStop(0, '#7f1d1d');
        coreGrad.addColorStop(0.6, '#450a0a');
        coreGrad.addColorStop(1, '#000000');
      }
      ctx.fillStyle = coreGrad;
      ctx.fillRect(doorX, doorY, doorW, doorH);

      // Sliding Blast Doors (Heavy reinforced segmented steel doors)
      const leftDoorW = (doorW / 2) - doorOpenOffset;
      if (leftDoorW > 0) {
        // Left Door Leaf
        ctx.fillStyle = '#27272a';
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 2;
        ctx.fillRect(doorX, doorY, leftDoorW, doorH);
        ctx.strokeRect(doorX, doorY, leftDoorW, doorH);

        // Right Door Leaf
        ctx.fillRect(doorX + doorW - leftDoorW, doorY, leftDoorW, doorH);
        ctx.strokeRect(doorX + doorW - leftDoorW, doorY, leftDoorW, doorH);
      }

      // Hangar Status Light & Warning Siren Beacon
      const sirenPulse = Math.sin(time * 12) * 0.5 + 0.5;
      const sirenColor = isSpawning
        ? `rgba(239, 68, 68, ${0.7 + sirenPulse * 0.3})`
        : 'rgba(245, 158, 11, 0.6)';

      ctx.save();
      ctx.fillStyle = sirenColor;
      ctx.shadowColor = isSpawning ? '#ef4444' : '#f59e0b';
      ctx.shadowBlur = isSpawning ? 20 : 8;
      ctx.beginPath();
      ctx.arc(doorX + doorW / 2, doorY - 14, 6, 0, Math.PI * 2);
      ctx.fill();

      // Emergency Beacon light cone when spawning
      if (isSpawning) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.beginPath();
        ctx.moveTo(doorX + doorW / 2, doorY - 14);
        ctx.lineTo(doorX - 60, doorY + doorH);
        ctx.lineTo(doorX + doorW + 60, doorY + doorH);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 6. Rooftop Drone Launch Silo & Comm Antenna / Radar Dish
      ctx.save();
      // Radar Dish
      const radarAngle = Math.sin(time * 2.5) * 0.4 - 0.2;
      ctx.translate(50, -260);
      ctx.rotate(radarAngle);

      ctx.fillStyle = '#3f3f46';
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -15, 16, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      // Radar Emitter Rod
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -24);
      ctx.stroke();

      // Blinking Sensor Light
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, -24, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Sweeping Red Perimeter Scanner Beam
      ctx.save();
      const scanAngle = Math.sin(time * 3) * 0.25 - 0.45;
      ctx.translate(-40, -230);
      ctx.rotate(scanAngle);

      const scannerGrad = ctx.createLinearGradient(0, 0, -240, 0);
      scannerGrad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
      scannerGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.15)');
      scannerGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = scannerGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-240, -30);
      ctx.lineTo(-240, 30);
      ctx.closePath();
      ctx.fill();

      // Laser Scanner Hub
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 7. Indestructible Hexagonal Energy Shield Dome
      ctx.save();
      const shieldBaseAlpha = isShieldHit ? 0.6 : (0.12 + Math.sin(time * 3) * 0.04);
      const shieldColor = isShieldHit ? '#38bdf8' : '#60a5fa';

      ctx.strokeStyle = `rgba(56, 189, 248, ${shieldBaseAlpha + 0.2})`;
      ctx.lineWidth = isShieldHit ? 3.5 : 1.5;
      ctx.shadowColor = shieldColor;
      ctx.shadowBlur = isShieldHit ? 25 : 10;

      // Main Shield Arc
      ctx.beginPath();
      ctx.arc(0, -80, 195, Math.PI * 0.95, Math.PI * 2.05);
      ctx.stroke();

      // Hexagonal Forcefield Patterns
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(56, 189, 248, ${shieldBaseAlpha * 0.7})`;
      const hexPoints = [
        [-120, -180], [-60, -220], [0, -235], [60, -220], [120, -180],
        [-140, -100], [-80, -140], [0, -160], [80, -140], [140, -100],
        [-150, -20], [-90, -60], [0, -75], [90, -60], [150, -20]
      ];
      for (const [hx, hy] of hexPoints) {
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          const px = hx + Math.cos(angle) * 14;
          const py = hy + Math.sin(angle) * 14;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Hit Ripple Animation
      if (isShieldHit) {
        const rippleR = 195 + (0.45 - house.shieldHitTimer) * 80;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -80, rippleR, Math.PI * 0.95, Math.PI * 2.05);
        ctx.stroke();
      }
      ctx.restore();

      ctx.restore(); // end flip & translate

      // 8. Floating Tactical HUD Nameplate (Always upright in world space)
      ctx.save();
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';

      const tagY = groundY - 295;
      const tagText = isLeft ? '⚡ OUTPOST ALPHA • ENEMY GARRISON' : '⚡ OUTPOST OMEGA • ENEMY GARRISON';
      const statusText = '🛡️ INDESTRUCTIBLE • CONTINUOUS SPAWNER';

      const w1 = ctx.measureText(tagText).width;
      const w2 = ctx.measureText(statusText).width;
      const boxW = Math.max(w1, w2) + 24;

      // Background Box
      ctx.fillStyle = 'rgba(9, 9, 11, 0.88)';
      ctx.strokeStyle = isShieldHit ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = isShieldHit ? '#ef4444' : '#f59e0b';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.roundRect(house.x - boxW / 2, tagY - 16, boxW, 36, 8);
      ctx.fill();
      ctx.stroke();

      // Text Lines
      ctx.fillStyle = isShieldHit ? '#f87171' : '#fbbf24';
      ctx.fillText(tagText, house.x, tagY - 2);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(statusText, house.x, tagY + 12);
      ctx.restore();
    }
  }

  private drawWindAndWeather(
    width: number,
    height: number,
    stage: Stage,
    cameraX: number,
    time: number
  ) {
    const ctx = this.ctx;
    const mapFeatures = getStageMapFeatures(stage);
    const wind = mapFeatures.wind;
    const isWindRight = wind.windDirection === 'right';
    const windSpeedNorm = wind.windSpeed;

    ctx.save();

    // 1. Atmospheric Wind Streamlines
    const streamCount = 7;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < streamCount; i++) {
      const baseY = ((i * 73 + time * 15) % (height * 0.75)) + 40;
      const streamLen = 140 + (i % 3) * 60;
      const speedFactor = 120 + (i % 4) * 30;
      const streamX = ((time * (isWindRight ? speedFactor : -speedFactor) + i * 220 - cameraX * 0.08) % (width + 400));
      const adjustedX = streamX < -200 ? streamX + width + 400 : streamX;

      const windGrad = ctx.createLinearGradient(
        adjustedX,
        baseY,
        adjustedX + (isWindRight ? streamLen : -streamLen),
        baseY + Math.sin(time * 2 + i) * 12
      );
      windGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      windGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
      windGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = windGrad;
      ctx.beginPath();
      ctx.moveTo(adjustedX, baseY);
      ctx.quadraticCurveTo(
        adjustedX + (isWindRight ? streamLen * 0.5 : -streamLen * 0.5),
        baseY + Math.sin(time * 3 + i) * 14,
        adjustedX + (isWindRight ? streamLen : -streamLen),
        baseY + Math.sin(time * 2 + i) * 8
      );
      ctx.stroke();
    }

    // 2. Dynamic Weather Environmental Particles
    const numParticles = wind.particleCount;
    for (let i = 0; i < numParticles; i++) {
      const seed = (stage.id * 97 + i * 43);
      const pxRaw = ((seed * 17.1 + time * windSpeedNorm - cameraX * 0.1) % (width + 200)) - 100;
      const px = pxRaw < -100 ? pxRaw + width + 200 : pxRaw;
      
      const fallSpeed = 30 + (i % 5) * 18;
      const py = ((seed * 31.7 + time * fallSpeed) % (height * 0.88));
      const pSize = 1.5 + (i % 4) * 1.2;
      const alpha = 0.25 + 0.5 * Math.sin(time * 2 + i);

      ctx.save();
      ctx.translate(px, py);
      ctx.globalAlpha = alpha;

      if (wind.ambientParticles === 'leaves') {
        // Drifting leaves
        ctx.fillStyle = (i % 2 === 0) ? '#10b981' : '#f59e0b';
        ctx.rotate(time * 3 + i);
        ctx.beginPath();
        ctx.ellipse(0, 0, pSize * 2.2, pSize * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (wind.ambientParticles === 'snow') {
        // Crystalline snow
        ctx.fillStyle = '#f0f9ff';
        ctx.beginPath();
        ctx.arc(0, 0, pSize, 0, Math.PI * 2);
        ctx.fill();
      } else if (wind.ambientParticles === 'embers') {
        // Fiery volcanic embers
        ctx.fillStyle = (i % 2 === 0) ? '#f97316' : '#ef4444';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, pSize, 0, Math.PI * 2);
        ctx.fill();
      } else if (wind.ambientParticles === 'sparks') {
        // High-tech cyber sparks
        ctx.fillStyle = stage.accentColor;
        ctx.shadowColor = stage.accentColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, pSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dust / sand / ash
        ctx.fillStyle = wind.particleColor;
        ctx.beginPath();
        ctx.arc(0, 0, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  private drawMapFeatures(
    width: number,
    height: number,
    stage: Stage,
    time: number
  ) {
    const ctx = this.ctx;
    const baseGroundY = height - 120;
    const mapFeatures = getStageMapFeatures(stage);

    // 1. Dynamic Swaying Grass / Reeds / Conduits along the Hillside Terrain
    ctx.save();
    const windDir = mapFeatures.wind.windDirection === 'right' ? 1 : -1;
    const swayBase = Math.sin(time * 3.5) * 6 * windDir + windDir * 4;

    for (let gx = -1000; gx <= 1000; gx += 35) {
      const gy = getGroundY(stage, gx, baseGroundY);
      
      // Skip foliage inside rivers or mud bogs
      if (mapFeatures.river && gx >= mapFeatures.river.startX && gx <= mapFeatures.river.endX) continue;
      if (mapFeatures.hazard && gx >= mapFeatures.hazard.startX && gx <= mapFeatures.hazard.endX) continue;

      const sway = swayBase + Math.sin(time * 4 + gx * 0.05) * 3;
      const bladeH = 10 + (Math.abs(gx * 13) % 12);

      if (stage.environment === 'forest' || stage.environment === 'wasteland') {
        ctx.strokeStyle = stage.environment === 'forest' ? '#15803d' : '#a16207';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.quadraticCurveTo(gx + sway * 0.5, gy - bladeH * 0.5, gx + sway, gy - bladeH);
        ctx.moveTo(gx + 4, gy);
        ctx.quadraticCurveTo(gx + 4 + sway * 0.4, gy - bladeH * 0.4, gx + 4 + sway * 0.8, gy - bladeH * 0.8);
        ctx.stroke();
      } else if (stage.environment === 'cyber' || stage.environment === 'factory') {
        // Glowing cyber conduits / neon antennas
        if (gx % 70 === 0) {
          ctx.strokeStyle = `${stage.accentColor}88`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx, gy - 16);
          ctx.stroke();
          ctx.fillStyle = stage.accentColor;
          ctx.beginPath();
          ctx.arc(gx, gy - 16, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();

    // 2. Mud, Sludge & Magma Bog Hazards ("mug" / mud pool)
    if (mapFeatures.hazard) {
      const h = mapFeatures.hazard;
      ctx.save();

      // Sunken Mud Basin
      ctx.beginPath();
      ctx.moveTo(h.startX, getGroundY(stage, h.startX, baseGroundY));
      
      const midX = (h.startX + h.endX) / 2;
      const hWidth = h.endX - h.startX;

      for (let x = h.startX; x <= h.endX; x += 10) {
        const norm = Math.sin(((x - h.startX) / hWidth) * Math.PI);
        const gy = getGroundY(stage, x, baseGroundY) + norm * h.depth;
        ctx.lineTo(x, gy);
      }
      ctx.lineTo(h.endX, getGroundY(stage, h.endX, baseGroundY));
      ctx.closePath();

      ctx.fillStyle = h.color;
      ctx.fill();
      ctx.strokeStyle = h.bubbleColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bubbling Mud & Toxic Gas Vents
      for (let b = 0; b < 5; b++) {
        const bubbleX = h.startX + 20 + ((b * 47 + time * 12) % (hWidth - 40));
        const bubbleNorm = Math.sin(((bubbleX - h.startX) / hWidth) * Math.PI);
        const surfaceY = getGroundY(stage, bubbleX, baseGroundY) + bubbleNorm * (h.depth * 0.6);
        
        const bubblePhase = (time * 2.5 + b * 1.3) % 1;
        const bRadius = 3 + bubblePhase * 5;
        const bAlpha = 1 - bubblePhase;

        ctx.fillStyle = h.bubbleColor;
        ctx.globalAlpha = bAlpha * 0.85;
        ctx.beginPath();
        ctx.arc(bubbleX, surfaceY - bubblePhase * 10, bRadius, 0, Math.PI * 2);
        ctx.fill();

        // Popping splash ring
        if (bubblePhase > 0.8) {
          ctx.strokeStyle = h.bubbleColor;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(bubbleX, surfaceY - 8, bRadius * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Mud shore splatter
      ctx.fillStyle = h.color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(h.startX - 8, getGroundY(stage, h.startX - 8, baseGroundY) + 2, 6, 0, Math.PI * 2);
      ctx.arc(h.endX + 8, getGroundY(stage, h.endX + 8, baseGroundY) + 2, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 3. Flowing Animated River & Water Stream ("river")
    if (mapFeatures.river) {
      const r = mapFeatures.river;
      const rWidth = r.endX - r.startX;
      ctx.save();

      // Excavated Riverbed
      ctx.beginPath();
      ctx.moveTo(r.startX - 10, getGroundY(stage, r.startX - 10, baseGroundY));

      for (let x = r.startX - 10; x <= r.endX + 10; x += 8) {
        const norm = Math.sin(Math.max(0, Math.min(1, (x - r.startX) / rWidth)) * Math.PI);
        const gy = getGroundY(stage, x, baseGroundY) + norm * r.depth;
        ctx.lineTo(x, gy);
      }
      ctx.lineTo(r.endX + 10, getGroundY(stage, r.endX + 10, baseGroundY));
      ctx.closePath();

      // Riverbed Deep Color
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Flowing Liquid Surface (Animated Wave Waves)
      const riverGrad = ctx.createLinearGradient(r.startX, baseGroundY, r.endX, baseGroundY);
      riverGrad.addColorStop(0, r.waterColor);
      riverGrad.addColorStop(0.5, r.glow ? '#f97316' : '#38bdf8');
      riverGrad.addColorStop(1, r.waterColor);

      ctx.fillStyle = riverGrad;
      if (r.glow) {
        ctx.shadowColor = r.waterColor;
        ctx.shadowBlur = 16;
      }

      ctx.beginPath();
      ctx.moveTo(r.startX, getGroundY(stage, r.startX, baseGroundY) + 4);

      for (let x = r.startX; x <= r.endX; x += 6) {
        const flowWave = Math.sin(x * 0.08 - time * (r.flowSpeed * 0.04)) * 3;
        const norm = Math.sin(((x - r.startX) / rWidth) * Math.PI);
        const y = getGroundY(stage, x, baseGroundY) + (norm * (r.depth * 0.75)) + flowWave;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(r.endX, getGroundY(stage, r.endX, baseGroundY) + 4);
      ctx.closePath();
      ctx.fill();

      // River Surface Foam Crests & Flow Streaks
      ctx.strokeStyle = r.foamColor;
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 0;

      for (let f = 0; f < 4; f++) {
        const foamOffsetX = ((time * r.flowSpeed + f * 70) % rWidth);
        const fx = r.startX + foamOffsetX;
        const fnorm = Math.sin(((fx - r.startX) / rWidth) * Math.PI);
        const fy = getGroundY(stage, fx, baseGroundY) + fnorm * (r.depth * 0.7);

        ctx.beginPath();
        ctx.moveTo(fx - 14, fy);
        ctx.quadraticCurveTo(fx, fy - 3, fx + 14, fy);
        ctx.stroke();
      }

      // River Shore Stones
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(r.startX - 6, getGroundY(stage, r.startX - 6, baseGroundY), 5, 0, Math.PI * 2);
      ctx.arc(r.endX + 6, getGroundY(stage, r.endX + 6, baseGroundY), 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 4. Rocks, Basalt Columns, Spires & Crystals along Hill Slopes
    ctx.save();
    for (const rock of mapFeatures.rocks) {
      const groundY = getGroundY(stage, rock.x, baseGroundY);

      ctx.save();
      ctx.translate(rock.x, groundY);
      ctx.rotate(rock.rotation);

      if (rock.style === 'boulder') {
        // 3D Rounded Rock Boulder
        ctx.fillStyle = rock.color;
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -rock.height * 0.45, rock.width * 0.5, rock.height * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shading facet & rock cracks
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(-rock.width * 0.15, -rock.height * 0.45, rock.width * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-rock.width * 0.3, -rock.height * 0.6);
        ctx.lineTo(rock.width * 0.1, -rock.height * 0.7);
        ctx.stroke();
      } else if (rock.style === 'spire') {
        // Jagged Angular Rock Spire
        ctx.fillStyle = rock.color;
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-rock.width * 0.5, 0);
        ctx.lineTo(-rock.width * 0.1, -rock.height);
        ctx.lineTo(rock.width * 0.2, -rock.height * 0.8);
        ctx.lineTo(rock.width * 0.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Facet Divider
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.moveTo(-rock.width * 0.1, -rock.height);
        ctx.lineTo(0, 0);
        ctx.stroke();
      } else if (rock.style === 'crystal') {
        // Glowing Neon Crystal Formation
        ctx.save();
        ctx.fillStyle = rock.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = rock.color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(-rock.width * 0.35, 0);
        ctx.lineTo(-rock.width * 0.2, -rock.height);
        ctx.lineTo(0, -rock.height * 1.15);
        ctx.lineTo(rock.width * 0.25, -rock.height * 0.85);
        ctx.lineTo(rock.width * 0.35, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Internal Refraction Lines
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.moveTo(0, -rock.height * 1.15);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.restore();
      } else if (rock.style === 'basalt') {
        // Hexagonal Volcanic Basalt Column
        ctx.fillStyle = rock.color;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(-rock.width * 0.4, -rock.height, rock.width * 0.8, rock.height);
        ctx.fill();
        ctx.stroke();

        // Molten fissure seam
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-rock.width * 0.2, -rock.height * 0.8);
        ctx.lineTo(rock.width * 0.1, -rock.height * 0.4);
        ctx.lineTo(-rock.width * 0.1, 0);
        ctx.stroke();
      } else {
        // Scrap Junkyard Debris Chunk
        ctx.fillStyle = rock.color;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-rock.width * 0.5, 0);
        ctx.lineTo(-rock.width * 0.35, -rock.height * 0.7);
        ctx.lineTo(rock.width * 0.2, -rock.height * 0.85);
        ctx.lineTo(rock.width * 0.45, -rock.height * 0.3);
        ctx.lineTo(rock.width * 0.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
    ctx.restore();
  }
}


