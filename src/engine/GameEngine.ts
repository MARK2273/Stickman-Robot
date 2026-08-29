import {
  PlayerState,
  HeroData,
  Enemy,
  EnemyType,
  Projectile,
  Particle,
  DamageNumber,
  Stage,
  Weapon,
  GameSettings,
  PlayerStats,
  Pet,
  PetRuntimeState
} from '../types/game';
import { soundManager } from '../services/audio';
import { getGroundY, getStageMapFeatures } from '../utils/terrain';

export interface GameEngineCallbacks {
  onGameOver: () => void;
  onVictory: (loot: { gold: number; rubies: number; exp: number }) => void;
  onWaveChange: (wave: number, totalWaves: number) => void;
  onBossSpawn: (bossName: string) => void;
  onLevelUp: (newLevel: number) => void;
  onStatsUpdate: (stats: Partial<PlayerStats>) => void;
}

export class GameEngine {
  public player: PlayerState;
  public hero: HeroData;
  public stage: Stage;
  public petRuntime: PetRuntimeState | null = null;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];
  public sentryTurrets: Array<{ x: number; y: number; lifespan: number; fireCooldown: number }> = [];

  public currentWaveIndex: number = 0;
  public enemiesSpawnedInWave: number = 0;
  public enemiesKilledInWave: number = 0;
  public spawnTimer: number = 0;
  public isBossActive: boolean = false;
  public waveTransitionTimer: number = 0;

  public cameraX: number = 0;
  public cameraShake: { x: number; y: number; intensity: number } = { x: 0, y: 0, intensity: 0 };
  public gameTime: number = 0;
  public comboCount: number = 0;
  public comboTimer: number = 0;

  // Session session earned
  public sessionGold: number = 0;
  public sessionRubies: number = 0;
  public sessionExp: number = 0;

  // Input states
  public keys: { [key: string]: boolean } = {};
  public mousePos: { x: number; y: number } = { x: 0, y: 0 };
  public isMouseDown: boolean = false;
  public fireCooldownTimer: number = 0;

  // Mobile / Virtual touch input states
  public virtualMoveDir: number = 0;
  public isVirtualShooting: boolean = false;
  public virtualAimAngle: number | null = null;
  public hasManualMouseAim: boolean = false;

  // Settings
  public settings: GameSettings;
  public callbacks: GameEngineCallbacks;

  public arenaWidth: number = 2400;
  public groundY: number = 500; // calibrated with viewport

  // Indestructible Left & Right Enemy Fortress / Spawner Houses at the ends of the arena
  public enemyHouses = {
    left: {
      x: -1100,
      width: 220,
      height: 280,
      spawnTimer: 0,
      shieldHitTimer: 0,
      name: 'OUTPOST ALPHA (WEST BASE)'
    },
    right: {
      x: 1100,
      width: 220,
      height: 280,
      spawnTimer: 0,
      shieldHitTimer: 0,
      name: 'OUTPOST OMEGA (EAST BASE)'
    }
  };
  public lastHouseImmuneNoticeTimer: number = 0;

  constructor(
    hero: HeroData,
    stage: Stage,
    playerStats: PlayerStats,
    equippedWeapons: [Weapon, Weapon | null],
    settings: GameSettings,
    callbacks: GameEngineCallbacks,
    equippedPet?: Pet | null
  ) {
    this.hero = hero;
    this.stage = stage;
    this.settings = settings;
    this.callbacks = callbacks;

    const spawnGroundY = getGroundY(stage, 0, this.groundY);

    if (equippedPet) {
      this.petRuntime = {
        pet: equippedPet,
        x: 0,
        y: spawnGroundY,
        vx: 0,
        vy: 0,
        facing: 'right',
        state: 'follow',
        attackTimer: 0.5,
        targetEnemyId: null,
        pounceStartX: 0,
        pounceStartY: 0,
        pounceTargetX: 0,
        pounceTargetY: 0,
        pounceProgress: 0,
        animFrame: 0
      };
    }

    // Calculate initial player state with stat bonuses & pet HP bonus
    const petHpMultiplier = 1 + (equippedPet ? equippedPet.playerHpBonusPercent / 100 : 0);
    const maxHp = Math.round((hero.baseHp + playerStats.vitality * 15) * petHpMultiplier);
    const maxMana = hero.baseMana + playerStats.intellect * 10;

    const slot0Ammo = equippedWeapons[0] ? equippedWeapons[0].magazineSize : 0;
    const slot1Ammo = equippedWeapons[1] ? equippedWeapons[1].magazineSize : 0;

    this.player = {
      x: 0,
      y: spawnGroundY,
      vx: 0,
      vy: 0,
      width: 24,
      height: 60,
      isGrounded: true,
      facing: 'right',
      aimAngle: 0,
      hp: maxHp,
      maxHp: maxHp,
      mana: maxMana,
      maxMana: maxMana,
      isRolling: false,
      rollTimer: 0,
      isInvulnerable: false,
      invulnerableTimer: 0,
      isReloading: false,
      reloadProgress: 0,
      currentAmmo: slot0Ammo,
      ammoBySlot: [slot0Ammo, slot1Ammo],
      recoil: 0,
      walkFrame: 0,
      selectedWeaponSlot: 0,
      equippedWeapons: equippedWeapons,
      activeBuffs: {}
    };
  }

  public update(deltaTime: number, canvasWidth: number, canvasHeight: number) {
    this.gameTime += deltaTime;
    this.groundY = canvasHeight - 120;

    // Update Enemy Houses animation & shield timers
    if (this.enemyHouses.left.spawnTimer > 0) this.enemyHouses.left.spawnTimer -= deltaTime;
    if (this.enemyHouses.right.spawnTimer > 0) this.enemyHouses.right.spawnTimer -= deltaTime;
    if (this.enemyHouses.left.shieldHitTimer > 0) this.enemyHouses.left.shieldHitTimer -= deltaTime;
    if (this.enemyHouses.right.shieldHitTimer > 0) this.enemyHouses.right.shieldHitTimer -= deltaTime;
    if (this.lastHouseImmuneNoticeTimer > 0) this.lastHouseImmuneNoticeTimer -= deltaTime;

    // 1. Update Combo
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // 2. Update Camera Shake
    if (this.cameraShake.intensity > 0) {
      this.cameraShake.x = (Math.random() - 0.5) * this.cameraShake.intensity * 2;
      this.cameraShake.y = (Math.random() - 0.5) * this.cameraShake.intensity * 2;
      this.cameraShake.intensity = Math.max(0, this.cameraShake.intensity - deltaTime * 30);
    } else {
      this.cameraShake.x = 0;
      this.cameraShake.y = 0;
    }

    // Smooth Camera Follow Player
    const targetCamX = this.player.x;
    this.cameraX += (targetCamX - this.cameraX) * Math.min(1, deltaTime * 8);

    // 3. Update Player
    this.updatePlayer(deltaTime, canvasWidth, canvasHeight);

    // 4. Update Shooting & Weapon Logic
    this.updateCombat(deltaTime, canvasWidth, canvasHeight);

    // 5. Update Sentry Turrets & Companion Pet (Never Dies, attacks enemies)
    this.updateTurrets(deltaTime);
    this.updatePet(deltaTime);

    // 6. Update Projectiles
    this.updateProjectiles(deltaTime);

    // 7. Update Enemies & AI
    this.updateEnemies(deltaTime);

    // 8. Update Particles & Damage Numbers
    this.updateParticles(deltaTime);

    // 9. Update Wave Spawning
    this.updateWaveSpawner(deltaTime);
  }

  public setVirtualMove(dir: number) {
    this.virtualMoveDir = dir;
  }

  public triggerJump() {
    const p = this.player;
    if (p.isGrounded && !p.isRolling) {
      p.vy = -680;
      p.isGrounded = false;
      soundManager.playJump();
      this.addDustParticles(p.x, p.y, 6);
    }
  }

  public triggerRoll() {
    const p = this.player;
    if (p.isGrounded && !p.isRolling) {
      p.isRolling = true;
      p.rollTimer = 0.35;
      p.isInvulnerable = true;
      p.invulnerableTimer = 0.4;
      soundManager.playJump();
    }
  }

  public setVirtualShooting(shooting: boolean, angle?: number | null) {
    this.isVirtualShooting = shooting;
    if (angle !== undefined) {
      this.virtualAimAngle = angle;
    }
  }

  public findNearestEnemy(): Enemy | null {
    if (this.enemies.length === 0) return null;
    let nearest: Enemy | null = null;
    let minDist = Infinity;
    for (const e of this.enemies) {
      if (e.hp > 0) {
        const dx = e.x - this.player.x;
        const dy = e.y - this.player.y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          nearest = e;
        }
      }
    }
    return nearest;
  }

  private updatePlayer(deltaTime: number, canvasWidth: number, canvasHeight: number) {
    const p = this.player;

    // Movement Speeds
    let speed = this.hero.baseSpeed;
    if (p.activeBuffs['bullet_storm']) speed *= 1.15;
    if (p.activeBuffs['shadow_step']) speed *= 1.45;

    // Environmental map hazards (Mud/Bog slow & River splashing)
    const mapFeatures = getStageMapFeatures(this.stage);
    if (mapFeatures.hazard && p.isGrounded) {
      if (p.x >= mapFeatures.hazard.startX && p.x <= mapFeatures.hazard.endX) {
        speed *= mapFeatures.hazard.slowMultiplier;
        if (Math.abs(p.vx) > 20 && Math.random() < 0.25) {
          this.particles.push({
            id: `mud_splash_${Date.now()}_${Math.random()}`,
            x: p.x + (Math.random() - 0.5) * 16,
            y: p.y - 2,
            vx: -p.vx * 0.2 + (Math.random() - 0.5) * 40,
            vy: -40 - Math.random() * 40,
            size: 3 + Math.random() * 3,
            color: mapFeatures.hazard.bubbleColor,
            alpha: 0.8,
            lifespan: 0.35,
            maxLifespan: 0.35,
            shape: 'circle',
            gravity: 600
          });
        }
      }
    }

    if (mapFeatures.river && p.isGrounded) {
      if (p.x >= mapFeatures.river.startX && p.x <= mapFeatures.river.endX) {
        if (Math.abs(p.vx) > 20 && Math.random() < 0.3) {
          this.particles.push({
            id: `river_splash_${Date.now()}_${Math.random()}`,
            x: p.x + (Math.random() - 0.5) * 20,
            y: p.y - 4,
            vx: (Math.random() - 0.5) * 60,
            vy: -50 - Math.random() * 50,
            size: 2.5 + Math.random() * 2.5,
            color: mapFeatures.river.foamColor,
            alpha: 0.85,
            lifespan: 0.3,
            maxLifespan: 0.3,
            shape: 'circle',
            gravity: 700
          });
        }
      }
    }

    // Gravity
    const gravity = 1400;
    p.vy += gravity * deltaTime;

    // Key inputs (WASD / Arrows) + Virtual Analog / D-Pad
    let moveDir = this.virtualMoveDir;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir += 1;
    moveDir = Math.max(-1, Math.min(1, moveDir));

    // Rolling / Dashing
    if (p.isRolling) {
      p.rollTimer -= deltaTime;
      p.vx = (p.facing === 'left' ? -1 : 1) * speed * 1.8;
      if (p.rollTimer <= 0) {
        p.isRolling = false;
      }
    } else {
      p.vx = moveDir * speed;

      // Jump
      if ((this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space']) && p.isGrounded) {
        this.triggerJump();
      }

      // Roll Trigger (S or Down or Shift)
      if ((this.keys['KeyS'] || this.keys['ArrowDown'] || this.keys['ShiftLeft']) && p.isGrounded && Math.abs(p.vx) > 50) {
        this.triggerRoll();
      }
    }

    // Apply Position
    p.x += p.vx * deltaTime;
    p.y += p.vy * deltaTime;

    // Ground Collision with Dynamic Terrain
    const currentGroundY = getGroundY(this.stage, p.x, this.groundY);
    if (p.y >= currentGroundY) {
      p.y = currentGroundY;
      p.vy = 0;
      p.isGrounded = true;
    } else {
      p.isGrounded = false;
    }

    // Arena Boundaries & Enemy Fortress Physical Stop
    // The Left House is at x = -1100, Right House is at x = 1100.
    // Player CANNOT cross into or past the houses at the ends of the area.
    const fortressBoundaryLimit = 970;
    p.x = Math.max(-fortressBoundaryLimit, Math.min(fortressBoundaryLimit, p.x));

    // Walk animation frame
    if (Math.abs(p.vx) > 10 && p.isGrounded) {
      p.walkFrame += deltaTime * 12;
    }

    // Facing & Aim Angle calculation
    if (this.virtualAimAngle !== null) {
      p.aimAngle = this.virtualAimAngle;
      p.facing = Math.cos(p.aimAngle) < 0 ? 'left' : 'right';
    } else if (this.isVirtualShooting || !this.hasManualMouseAim) {
      const nearest = this.findNearestEnemy();
      if (nearest) {
        const targetX = nearest.x;
        const targetY = nearest.y - (nearest.isBoss ? 50 : 25);
        p.aimAngle = Math.atan2(targetY - (p.y - 45), targetX - p.x);
        p.facing = targetX < p.x ? 'left' : 'right';
      } else if (moveDir !== 0) {
        p.facing = moveDir < 0 ? 'left' : 'right';
        p.aimAngle = p.facing === 'left' ? Math.PI : 0;
      } else if (this.hasManualMouseAim) {
        const worldMouseX = this.mousePos.x + this.cameraX - canvasWidth / 2;
        const worldMouseY = this.mousePos.y;
        p.aimAngle = Math.atan2(worldMouseY - (p.y - 45), worldMouseX - p.x);
        p.facing = worldMouseX < p.x ? 'left' : 'right';
      }
    } else {
      const worldMouseX = this.mousePos.x + this.cameraX - canvasWidth / 2;
      const worldMouseY = this.mousePos.y;
      p.aimAngle = Math.atan2(worldMouseY - (p.y - 45), worldMouseX - p.x);
      p.facing = worldMouseX < p.x ? 'left' : 'right';
    }

    // Recoil recovery
    p.recoil = Math.max(0, p.recoil - deltaTime * 40);

    // Invulnerability timer
    if (p.isInvulnerable) {
      p.invulnerableTimer -= deltaTime;
      if (p.invulnerableTimer <= 0) {
        p.isInvulnerable = false;
      }
    }

    // Active buffs cooldown
    for (const buff in p.activeBuffs) {
      p.activeBuffs[buff] -= deltaTime;
      if (p.activeBuffs[buff] <= 0) {
        delete p.activeBuffs[buff];
      }
    }

    // Mana natural regeneration
    p.mana = Math.min(p.maxMana, p.mana + deltaTime * (8 + this.hero.baseMana * 0.05));

    // Skills cooldown countdown
    this.hero.skills.forEach((skill) => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime);
      }
    });

    // Handle Reloading
    const activeWeapon = p.equippedWeapons[p.selectedWeaponSlot] || p.equippedWeapons[0];
    if (p.isReloading) {
      p.reloadProgress += deltaTime / activeWeapon.reloadTime;
      if (p.reloadProgress >= 1.0) {
        p.isReloading = false;
        p.reloadProgress = 0;
        p.ammoBySlot[p.selectedWeaponSlot] = activeWeapon.magazineSize;
        p.currentAmmo = activeWeapon.magazineSize;
      }
    }
  }

  private updateCombat(deltaTime: number, canvasWidth: number, canvasHeight: number) {
    const p = this.player;
    const activeWeapon = p.equippedWeapons[p.selectedWeaponSlot] || p.equippedWeapons[0];

    this.fireCooldownTimer = Math.max(0, this.fireCooldownTimer - deltaTime);

    // Auto reload if empty
    if (p.currentAmmo <= 0 && !p.isReloading) {
      this.reloadWeapon();
    }

    // Manual reload key 'R'
    if (this.keys['KeyR'] && !p.isReloading && p.currentAmmo < activeWeapon.magazineSize) {
      this.reloadWeapon();
    }

    // Primary weapon swap (1, 2 or Q / Tab)
    if (this.keys['Digit1'] && p.selectedWeaponSlot !== 0) {
      this.switchWeaponSlot(0);
    } else if (this.keys['Digit2'] && p.equippedWeapons[1] && p.selectedWeaponSlot !== 1) {
      this.switchWeaponSlot(1);
    }

    // Skills activation
    if (this.keys['KeyQ']) this.useSkill(0);
    if (this.keys['KeyE']) this.useSkill(1);
    if (this.keys['KeyF']) this.useSkill(2);

    // Mouse / Touch / Virtual Button Shooting
    const isInfiniteAmmo = p.activeBuffs['bullet_storm'] !== undefined;
    const fireInterval = 1 / (activeWeapon.fireRate * (isInfiniteAmmo ? 2.0 : 1.0));

    if ((this.isMouseDown || this.isVirtualShooting) && this.fireCooldownTimer <= 0 && !p.isReloading && (p.currentAmmo > 0 || isInfiniteAmmo)) {
      this.fireWeapon(activeWeapon);
      this.fireCooldownTimer = fireInterval;
      if (!isInfiniteAmmo) {
        p.ammoBySlot[p.selectedWeaponSlot] = Math.max(0, p.ammoBySlot[p.selectedWeaponSlot] - 1);
        p.currentAmmo = p.ammoBySlot[p.selectedWeaponSlot];
      }
    }
  }

  public fireWeapon(weapon: Weapon) {
    const p = this.player;
    const angle = p.aimAngle;

    // Apply weapon recoil
    p.recoil = 8;
    this.addCameraShake(weapon.tier >= 4 ? 4 : 2);

    // Sound
    soundManager.playShoot(weapon.soundType);

    // Eject Brass Shell particle
    this.addShellParticle(p.x, p.y - 45, p.facing === 'left');

    // Spawn Projectiles based on weapon bulletCount (e.g., Shotguns fire multiple)
    const petDmgMultiplier = 1 + (this.petRuntime ? this.petRuntime.pet.playerDamageBonusPercent / 100 : 0);

    for (let i = 0; i < weapon.bulletCount; i++) {
      const spreadAngle = angle + (Math.random() - 0.5) * weapon.spread;
      const speed = weapon.bulletSpeed;

      const isCrit = Math.random() < weapon.critChance + (this.hero.baseCrit || 0);
      const baseDmg = weapon.damage * petDmgMultiplier;
      const damage = Math.round(baseDmg * (isCrit ? weapon.critMultiplier : 1.0));

      const proj: Projectile = {
        id: 'proj_' + Math.random(),
        x: p.x + Math.cos(angle) * 28,
        y: p.y - 45 + Math.sin(angle) * 28,
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed,
        damage: damage,
        radius: weapon.tier >= 4 ? 5 : 3.5,
        color: weapon.color,
        element: weapon.element,
        pierceLeft: weapon.pierce,
        knockback: weapon.knockback,
        isCrit: isCrit,
        isPlayer: true,
        type: weapon.type,
        lifespan: weapon.range / speed,
        maxLifespan: weapon.range / speed,
        explosionRadius: weapon.type === 'launcher' ? 180 : undefined
      };

      this.projectiles.push(proj);
    }
  }

  public reloadWeapon() {
    const p = this.player;
    if (p.isReloading) return;
    p.isReloading = true;
    p.reloadProgress = 0;
    soundManager.playReload();
  }

  public cancelReload() {
    this.player.isReloading = false;
    this.player.reloadProgress = 0;
  }

  public switchWeaponSlot(newSlot: 0 | 1) {
    const p = this.player;
    if (newSlot === 1 && !p.equippedWeapons[1]) return;
    if (p.selectedWeaponSlot === newSlot) return;

    this.cancelReload();
    p.selectedWeaponSlot = newSlot;
    p.currentAmmo = p.ammoBySlot[newSlot];
    soundManager.playSkill();
  }

  public toggleWeaponSlot() {
    const p = this.player;
    if (!p.equippedWeapons[1]) return;
    this.switchWeaponSlot(p.selectedWeaponSlot === 0 ? 1 : 0);
  }

  public updateEquippedWeapons(equippedWeapons: [Weapon, Weapon | null]) {
    const p = this.player;
    p.equippedWeapons = equippedWeapons;

    if (equippedWeapons[0]) {
      p.ammoBySlot[0] = Math.min(
        p.ammoBySlot[0] !== undefined ? p.ammoBySlot[0] : equippedWeapons[0].magazineSize,
        equippedWeapons[0].magazineSize
      );
    }
    if (equippedWeapons[1]) {
      p.ammoBySlot[1] = Math.min(
        p.ammoBySlot[1] !== undefined ? p.ammoBySlot[1] : equippedWeapons[1].magazineSize,
        equippedWeapons[1].magazineSize
      );
    } else {
      p.ammoBySlot[1] = 0;
      if (p.selectedWeaponSlot === 1) {
        p.selectedWeaponSlot = 0;
      }
    }
    p.currentAmmo = p.ammoBySlot[p.selectedWeaponSlot];
  }

  public updateEquippedPet(pet: Pet | null) {
    if (!pet) {
      this.petRuntime = null;
      return;
    }

    if (this.petRuntime) {
      this.petRuntime.pet = pet;
    } else {
      this.petRuntime = {
        pet: pet,
        x: this.player.x,
        y: getGroundY(this.stage, this.player.x, this.groundY),
        vx: 0,
        vy: 0,
        facing: 'right',
        state: 'follow',
        attackTimer: 0.5,
        targetEnemyId: null,
        pounceStartX: 0,
        pounceStartY: 0,
        pounceTargetX: 0,
        pounceTargetY: 0,
        pounceProgress: 0,
        animFrame: 0
      };
    }
  }

  public useSkill(index: number) {
    const skill = this.hero.skills[index];
    if (!skill || skill.currentCooldown > 0) return;

    // Check mana
    const manaCost = 25 + index * 20;
    if (this.player.mana < manaCost) return;

    this.player.mana -= manaCost;
    skill.currentCooldown = skill.cooldown;
    soundManager.playSkill();

    const p = this.player;

    if (skill.id === 'grenade_toss') {
      // Toss explosive grenade
      const grenade: Projectile = {
        id: 'grenade_' + Math.random(),
        x: p.x,
        y: p.y - 40,
        vx: Math.cos(p.aimAngle) * 550,
        vy: Math.sin(p.aimAngle) * 550 - 200,
        damage: 220,
        radius: 6,
        color: '#ef4444',
        element: 'fire',
        pierceLeft: 0,
        knockback: 120,
        isCrit: true,
        isPlayer: true,
        type: 'grenade',
        lifespan: 1.2,
        maxLifespan: 1.2,
        explosionRadius: 220
      };
      this.projectiles.push(grenade);
    } else if (skill.id === 'bullet_storm') {
      p.activeBuffs['bullet_storm'] = 5;
      p.currentAmmo = 999;
    } else if (skill.id === 'orbital_strike') {
      // Tactical Air Raid across whole field
      this.addCameraShake(14);
      soundManager.playExplosion();
      for (let i = -1000; i <= 1000; i += 180) {
        setTimeout(() => {
          const strikeX = i + p.x;
          const strikeY = getGroundY(this.stage, strikeX, this.groundY) - 10;
          this.createExplosion(strikeX, strikeY, 160, 280, '#f97316');
        }, Math.random() * 800);
      }
    } else if (skill.id === 'lightning_chain') {
      // Arcane Lightning Chain
      this.enemies.slice(0, 6).forEach((enemy, idx) => {
        setTimeout(() => {
          this.applyDamageToEnemy(enemy, 160, true, 'lightning');
          enemy.shockTimer = 3;
          this.addSparkParticles(enemy.x, enemy.y - 30, '#c084fc', 12);
        }, idx * 100);
      });
    } else if (skill.id === 'frost_nova') {
      // Blizzard Nova Freeze
      this.enemies.forEach((enemy) => {
        const dist = Math.abs(enemy.x - p.x);
        if (dist < 600) {
          enemy.frozenTimer = 3.5;
          this.applyDamageToEnemy(enemy, 90, false, 'ice');
          this.addSparkParticles(enemy.x, enemy.y - 30, '#38bdf8', 10);
        }
      });
    } else if (skill.id === 'meteor_shower') {
      this.addCameraShake(18);
      soundManager.playExplosion();
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const dropX = p.x + (Math.random() - 0.5) * 800;
          const dropY = getGroundY(this.stage, dropX, this.groundY) - 10;
          this.createExplosion(dropX, dropY, 220, 360, '#ef4444');
        }, i * 250);
      }
    } else if (skill.id === 'piercing_shot') {
      const arrow: Projectile = {
        id: 'arrow_' + Math.random(),
        x: p.x,
        y: p.y - 45,
        vx: (p.facing === 'left' ? -1 : 1) * 1400,
        vy: 0,
        damage: 280,
        radius: 6,
        color: '#4ade80',
        element: 'physical',
        pierceLeft: 99,
        knockback: 70,
        isCrit: true,
        isPlayer: true,
        type: 'bow',
        lifespan: 1.5,
        maxLifespan: 1.5
      };
      this.projectiles.push(arrow);
    } else if (skill.id === 'shadow_step') {
      p.activeBuffs['shadow_step'] = 3.5;
      p.isInvulnerable = true;
      p.invulnerableTimer = 3.5;
      p.x += (p.facing === 'left' ? -1 : 1) * 200;
      p.y = getGroundY(this.stage, p.x, this.groundY);
      this.addDustParticles(p.x, p.y, 16);
    } else if (skill.id === 'sentry_turret') {
      this.sentryTurrets.push({
        x: p.x,
        y: getGroundY(this.stage, p.x, this.groundY),
        lifespan: 14,
        fireCooldown: 0
      });
      this.addDustParticles(p.x, p.y, 8);
    } else if (skill.id === 'divine_grace') {
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.4);
      this.damageNumbers.push({
        id: 'heal_' + Math.random(),
        x: p.x,
        y: p.y - 60,
        vy: -40,
        text: `+${Math.round(p.maxHp * 0.4)} HP`,
        color: '#4ade80',
        size: 16,
        isCrit: true,
        lifespan: 1.5,
        maxLifespan: 1.5
      });
      this.addSparkParticles(p.x, p.y - 30, '#fde047', 20);
    }
  }

  private updateTurrets(deltaTime: number) {
    for (let i = this.sentryTurrets.length - 1; i >= 0; i--) {
      const turret = this.sentryTurrets[i];
      turret.lifespan -= deltaTime;
      turret.fireCooldown -= deltaTime;

      if (turret.lifespan <= 0) {
        this.sentryTurrets.splice(i, 1);
        continue;
      }

      if (turret.fireCooldown <= 0 && this.enemies.length > 0) {
        // Find closest enemy
        let closestEnemy: Enemy | null = null;
        let minDist = 700;
        this.enemies.forEach((e) => {
          const d = Math.abs(e.x - turret.x);
          if (d < minDist) {
            minDist = d;
            closestEnemy = e;
          }
        });

        if (closestEnemy) {
          const angle = Math.atan2((closestEnemy as Enemy).y - 30 - (turret.y - 20), (closestEnemy as Enemy).x - turret.x);
          soundManager.playShoot('smg');

          this.projectiles.push({
            id: 'turret_proj_' + Math.random(),
            x: turret.x,
            y: turret.y - 20,
            vx: Math.cos(angle) * 1100,
            vy: Math.sin(angle) * 1100,
            damage: 28,
            radius: 3.5,
            color: '#38bdf8',
            element: 'physical',
            pierceLeft: 0,
            knockback: 10,
            isCrit: false,
            isPlayer: true,
            type: 'smg',
            lifespan: 0.8,
            maxLifespan: 0.8
          });

          turret.fireCooldown = 0.15; // rapid fire
        }
      }
    }
  }

  private updatePet(deltaTime: number) {
    if (!this.petRuntime) return;
    const petState = this.petRuntime;
    const pet = petState.pet;
    const p = this.player;

    petState.animFrame += deltaTime * 8;
    petState.attackTimer -= deltaTime;

    const isGroundPet = pet.species === 'dog' || pet.species === 'cat' || pet.species === 'wolf';
    const isFlyingPet = pet.species === 'falcon' || pet.species === 'dragon';
    
    // Follow anchor relative to player
    const followOffsetX = p.facing === 'left' ? 48 : -48;
    const defaultTargetX = p.x + followOffsetX;
    const targetGroundY = getGroundY(this.stage, defaultTargetX, this.groundY);
    const defaultTargetY = isGroundPet ? targetGroundY : (targetGroundY - 60 + Math.sin(this.gameTime * 3.5) * 8);

    // If currently pouncing (melee attack)
    if (petState.state === 'pouncing') {
      petState.pounceProgress += deltaTime * 3.8;
      if (petState.pounceProgress >= 1.0) {
        petState.pounceProgress = 1.0;
        // Reach target enemy & strike!
        const target = this.enemies.find((e) => e.id === petState.targetEnemyId) || this.enemies[0];
        if (target) {
          if (pet.species === 'dog') {
            soundManager.playPetBite();
          } else if (pet.species === 'cat') {
            soundManager.playPetScratch();
          } else {
            soundManager.playPetBite();
          }

          this.addSparkParticles(target.x, target.y - 25, pet.color, 8);
          this.applyDamageToEnemy(target, pet.damage, true, 'physical');
        }
        petState.state = 'returning';
      } else {
        const t = petState.pounceProgress;
        petState.x = petState.pounceStartX + (petState.pounceTargetX - petState.pounceStartX) * t;
        const arcY = Math.sin(t * Math.PI) * -45;
        petState.y = petState.pounceStartY + (petState.pounceTargetY - petState.pounceStartY) * t + arcY;
        petState.facing = petState.pounceTargetX < petState.x ? 'left' : 'right';
      }
      return;
    }

    if (petState.state === 'returning') {
      const dx = defaultTargetX - petState.x;
      const dy = defaultTargetY - petState.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 25) {
        petState.state = 'follow';
      } else {
        petState.x += (defaultTargetX - petState.x) * Math.min(1, deltaTime * 8);
        petState.y += (defaultTargetY - petState.y) * Math.min(1, deltaTime * 8);
        petState.facing = defaultTargetX < petState.x ? 'left' : 'right';
      }
      return;
    }

    // Default follow physics
    const distToPlayer = Math.abs(p.x - petState.x);
    const speed = distToPlayer > 300 ? 14 : 7;
    petState.x += (defaultTargetX - petState.x) * Math.min(1, deltaTime * speed);
    petState.y += (defaultTargetY - petState.y) * Math.min(1, deltaTime * speed);
    petState.facing = p.x < petState.x ? 'left' : 'right';

    // Combat AI: Find enemy within attackRange
    if (petState.attackTimer <= 0 && this.enemies.length > 0) {
      let closestEnemy: Enemy | null = null;
      let minDistance = pet.attackRange;

      this.enemies.forEach((enemy) => {
        const d = Math.sqrt(Math.pow(enemy.x - petState.x, 2) + Math.pow(enemy.y - petState.y, 2));
        if (d < minDistance) {
          minDistance = d;
          closestEnemy = enemy;
        }
      });

      if (closestEnemy) {
        const target = closestEnemy as Enemy;
        petState.facing = target.x < petState.x ? 'left' : 'right';

        if (pet.attackType === 'melee_pounce' || pet.attackType === 'melee_swipe') {
          // Launch melee lunge on single enemy with pet attack voice!
          soundManager.playPetAttackVoice(pet.species);
          petState.state = 'pouncing';
          petState.targetEnemyId = target.id;
          petState.pounceStartX = petState.x;
          petState.pounceStartY = petState.y;
          petState.pounceTargetX = target.x;
          petState.pounceTargetY = target.y - 15;
          petState.pounceProgress = 0;
          petState.attackTimer = pet.attackRate;
        } else if (pet.attackType === 'ranged_laser') {
          // Aero Falcon: Play raptor screech voice & shoot twin laser darts!
          soundManager.playPetAttackVoice(pet.species);
          soundManager.playPetLaser();
          const angle = Math.atan2(target.y - 25 - petState.y, target.x - petState.x);
          [-6, 6].forEach((offsetY) => {
            this.projectiles.push({
              id: 'pet_laser_' + Math.random(),
              x: petState.x,
              y: petState.y + offsetY,
              vx: Math.cos(angle) * 1200,
              vy: Math.sin(angle) * 1200,
              damage: Math.round(pet.damage / 2),
              radius: 4,
              color: pet.color,
              element: 'plasma',
              pierceLeft: 1,
              knockback: 15,
              isCrit: true,
              isPlayer: true,
              type: 'laser',
              lifespan: 0.8,
              maxLifespan: 0.8
            });
          });
          petState.attackTimer = pet.attackRate;
          this.addSparkParticles(petState.x, petState.y, pet.color, 6);
        } else if (pet.attackType === 'ranged_aoe_shockwave') {
          // Void Panther: Play dark snarl voice & dark matter piercing shockwave!
          soundManager.playPetAttackVoice(pet.species);
          soundManager.playPetLaser();
          const angle = Math.atan2(target.y - 25 - petState.y, target.x - petState.x);
          this.projectiles.push({
            id: 'pet_shock_' + Math.random(),
            x: petState.x,
            y: petState.y - 5,
            vx: Math.cos(angle) * 950,
            vy: Math.sin(angle) * 950,
            damage: pet.damage,
            radius: 8,
            color: pet.color,
            element: 'dark',
            pierceLeft: 2,
            knockback: 35,
            isCrit: true,
            isPlayer: true,
            type: 'magic',
            lifespan: 1.0,
            maxLifespan: 1.0,
            explosionRadius: pet.aoeRadius || 110
          });
          petState.attackTimer = pet.attackRate;
          this.addSparkParticles(petState.x, petState.y, pet.color, 8);
        } else if (pet.attackType === 'ranged_aoe_dragon') {
          // Apex Mecha Dragon (Costliest Pet!): Epic dragon roar voice & long-range plasma fireball AOE!
          soundManager.playPetAttackVoice(pet.species);
          this.addCameraShake(8);
          const angle = Math.atan2(target.y - 25 - petState.y, target.x - petState.x);
          this.projectiles.push({
            id: 'pet_dragon_blast_' + Math.random(),
            x: petState.x,
            y: petState.y - 10,
            vx: Math.cos(angle) * 850,
            vy: Math.sin(angle) * 850,
            damage: pet.damage,
            radius: 12,
            color: '#f97316',
            trailColor: '#ea580c',
            element: 'fire',
            pierceLeft: 0,
            knockback: 70,
            isCrit: true,
            isPlayer: true,
            type: 'rocket',
            lifespan: 1.5,
            maxLifespan: 1.5,
            explosionRadius: pet.aoeRadius || 180
          });
          petState.attackTimer = pet.attackRate;
          this.addExplosionParticles(petState.x, petState.y - 10, '#f97316', 12);
        }
      }
    }
  }

  private updateProjectiles(deltaTime: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // Gravity for grenades
      if (p.type === 'grenade') {
        p.vy += 800 * deltaTime;
      }

      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.lifespan -= deltaTime;

      // Rocket / Grenade smoke trail
      if (p.type === 'rocket' || p.type === 'grenade') {
        this.addSmokeParticle(p.x, p.y);
      }

      // Check ground hit for grenade/rocket
      const projGroundY = getGroundY(this.stage, p.x, this.groundY);
      if (p.y >= projGroundY) {
        if (p.explosionRadius) {
          this.createExplosion(p.x, projGroundY - 5, p.explosionRadius, p.damage, p.color);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Lifespan expiry
      if (p.lifespan <= 0) {
        if (p.explosionRadius) {
          this.createExplosion(p.x, p.y, p.explosionRadius, p.damage, p.color);
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with enemies (if player projectile)
      if (p.isPlayer) {
        // Check collision with Indestructible Left & Right Enemy Fortress / Houses
        const hitLeftHouse = p.x <= -970;
        const hitRightHouse = p.x >= 970;
        if (hitLeftHouse || hitRightHouse) {
          const house = hitLeftHouse ? this.enemyHouses.left : this.enemyHouses.right;
          house.shieldHitTimer = 0.45;
          soundManager.playHit();
          this.addSparkParticles(p.x, p.y, '#38bdf8', 8);
          this.addSparkParticles(p.x, p.y, '#ef4444', 6);
          if (p.explosionRadius) {
            this.addExplosionParticles(p.x, p.y, '#38bdf8', 12);
          }
          if (this.lastHouseImmuneNoticeTimer <= 0) {
            this.lastHouseImmuneNoticeTimer = 0.9;
            this.damageNumbers.push({
              id: 'dmg_house_' + Math.random(),
              x: hitLeftHouse ? -950 : 950,
              y: p.y - 20,
              vy: -35,
              text: '🛡️ OUTPOST IMMUNE',
              color: '#38bdf8',
              size: 13,
              isCrit: false,
              lifespan: 0.8,
              maxLifespan: 0.8
            });
          }
          this.projectiles.splice(i, 1);
          continue;
        }

        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          const hitRadius = enemy.isBoss ? 45 : 24;

          const dx = p.x - enemy.x;
          const dy = p.y - (enemy.y - (enemy.isBoss ? 50 : 25));
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < hitRadius + p.radius) {
            // Shield reflection check
            const isFacingPlayer = (enemy.x > this.player.x && enemy.facing === 'left') || (enemy.x < this.player.x && enemy.facing === 'right');
            if (enemy.shieldActive && isFacingPlayer && p.x > enemy.x === (enemy.facing === 'right')) {
              // Shield Deflected
              this.addSparkParticles(p.x, p.y, '#38bdf8', 6);
              soundManager.playHit();
              this.projectiles.splice(i, 1);
              break;
            }

            // Hit Confirmed!
            if (p.explosionRadius) {
              this.createExplosion(p.x, p.y, p.explosionRadius, p.damage, p.color);
              this.projectiles.splice(i, 1);
              break;
            } else {
              // HEADSHOT CALCULATION: Top region of the enemy receives 2x damage & headshot feedback!
              const headThresholdY = enemy.isBoss
                ? (enemy.y - 68)
                : (enemy.type === 'bat' || enemy.type === 'emp_disrupter' || enemy.type === 'nanite_healer' || enemy.type === 'phantom_spectre')
                ? (enemy.y - 10)
                : (enemy.y - 34);

              const isDirectBullet = p.type !== 'grenade' && p.type !== 'rocket';
              const isHeadshot = isDirectBullet && p.y <= headThresholdY;

              const finalDamage = isHeadshot ? Math.round(p.damage * 2) : p.damage;

              if (isHeadshot) {
                soundManager.playHeadshot();
                this.addCameraShake(4);
                this.addSparkParticles(p.x, p.y, '#ff2a5f', 10);
                this.addSparkParticles(p.x, p.y, '#fbbf24', 8);
              }

              this.applyDamageToEnemy(enemy, finalDamage, p.isCrit || isHeadshot, p.element, isHeadshot);

              // Knockback
              const knockDir = p.vx > 0 ? 1 : -1;
              enemy.vx += knockDir * p.knockback * (isHeadshot ? 22 : 15);

              // Spark particles
              this.addSparkParticles(p.x, p.y, isHeadshot ? '#ff2a5f' : p.color, isHeadshot ? 8 : 4);

              p.pierceLeft--;
              if (p.pierceLeft < 0) {
                this.projectiles.splice(i, 1);
                break;
              }
            }
          }
        }
      } else {
        // Enemy Projectile hitting player
        const pState = this.player;
        const dx = p.x - pState.x;
        const dy = p.y - (pState.y - 30);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 22 && !pState.isInvulnerable) {
          this.applyDamageToPlayer(p.damage);
          this.projectiles.splice(i, 1);
          continue;
        }
      }
    }
  }

  public createExplosion(x: number, y: number, radius: number, damage: number, color: string) {
    soundManager.playExplosion();
    this.addCameraShake(radius > 180 ? 12 : 6);

    // Shockwave / fire particles
    this.addExplosionParticles(x, y, color, 30);

    // Damage all enemies in area
    this.enemies.forEach((enemy) => {
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        const falloff = 1 - (dist / radius) * 0.4;
        const dealDmg = Math.round(damage * falloff);
        this.applyDamageToEnemy(enemy, dealDmg, true, 'fire');
        // Massive radial knockback
        const dir = dx >= 0 ? 1 : -1;
        enemy.vx += dir * 280;
        enemy.vy -= 220;
      }
    });
  }

  private applyDamageToEnemy(enemy: Enemy, damage: number, isCrit: boolean, element: string, isHeadshot: boolean = false) {
    if (!isHeadshot) {
      soundManager.playHit();
    }
    enemy.hp -= damage;

    // Combo Counter
    this.comboCount++;
    this.comboTimer = 2.5;

    // Floating Damage Number
    let dmgColor = isHeadshot ? '#ff2a5f' : isCrit ? '#fbbf24' : '#ffffff';
    if (!isHeadshot) {
      if (element === 'fire') dmgColor = '#f97316';
      if (element === 'ice') dmgColor = '#38bdf8';
      if (element === 'lightning') dmgColor = '#c084fc';
    }

    const displayText = isHeadshot
      ? `🎯 HEADSHOT! ${damage}`
      : `${isCrit ? 'CRIT ' : ''}${damage}`;

    this.damageNumbers.push({
      id: 'dmg_' + Math.random(),
      x: enemy.x + (Math.random() - 0.5) * 20,
      y: enemy.y - (enemy.isBoss ? (isHeadshot ? 85 : 70) : (isHeadshot ? 50 : 40)),
      vy: isHeadshot ? -75 : -55,
      text: displayText,
      color: dmgColor,
      size: isHeadshot ? 22 : isCrit ? 18 : 13,
      isCrit: isCrit || isHeadshot,
      isHeadshot: isHeadshot,
      lifespan: isHeadshot ? 1.2 : 0.9,
      maxLifespan: isHeadshot ? 1.2 : 0.9
    });

    // Blood / Spark Splatter
    if (this.settings.bloodEffects) {
      this.addBloodParticles(enemy.x, enemy.y - 25, isHeadshot ? 12 : 6);
    }

    // Check Death
    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: Enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.enemies.splice(idx, 1);
    }

    // Rewards
    const goldEarned = enemy.goldValue || (enemy.isBoss ? 250 : 15);
    const expEarned = enemy.expValue || (enemy.isBoss ? 300 : 20);
    const rubiesEarned = enemy.isBoss ? 3 : (Math.random() < 0.1 ? 1 : 0);

    this.sessionGold += goldEarned;
    this.sessionExp += expEarned;
    this.sessionRubies += rubiesEarned;

    soundManager.playCoin();

    this.callbacks.onStatsUpdate({
      gold: this.sessionGold,
      exp: this.sessionExp,
      rubies: this.sessionRubies
    });

    // Death explosion of particles
    this.addExplosionParticles(enemy.x, enemy.y - 25, enemy.color, enemy.isBoss ? 45 : 16);

    this.enemiesKilledInWave++;
    if (enemy.isBoss) {
      this.isBossActive = false;
    }
  }

  private applyDamageToPlayer(damage: number) {
    const p = this.player;
    if (p.isInvulnerable) return;

    soundManager.playHit();
    this.addCameraShake(6);

    // Defense calculation
    const reduction = this.hero.baseDef / (this.hero.baseDef + 100);
    const finalDmg = Math.max(1, Math.round(damage * (1 - reduction)));

    p.hp -= finalDmg;
    p.isInvulnerable = true;
    p.invulnerableTimer = 0.6; // grace invulnerability period

    this.damageNumbers.push({
      id: 'dmg_player_' + Math.random(),
      x: p.x,
      y: p.y - 50,
      vy: -40,
      text: `-${finalDmg}`,
      color: '#ef4444',
      size: 16,
      isCrit: true,
      lifespan: 1.0,
      maxLifespan: 1.0
    });

    if (p.hp <= 0) {
      p.hp = 0;
      this.callbacks.onGameOver();
    }
  }

  private updateEnemies(deltaTime: number) {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Frozen status check
      if (enemy.frozenTimer && enemy.frozenTimer > 0) {
        enemy.frozenTimer -= deltaTime;
        continue; // immobilized while frozen
      }

      // DoT Burn status
      if (enemy.burnTimer && enemy.burnTimer > 0) {
        enemy.burnTimer -= deltaTime;
        if (Math.random() < 0.1) {
          this.applyDamageToEnemy(enemy, 15, false, 'fire');
        }
      }

      // Gravity for ground units
      const isFlying = enemy.type === 'bat' || enemy.type === 'emp_disrupter' || enemy.type === 'nanite_healer' || enemy.type === 'phantom_spectre';
      if (!isFlying) {
        enemy.vy += 1200 * deltaTime;
      }

      // AI Movement toward player
      const dx = p.x - enemy.x;
      const dy = (p.y - 30) - (enemy.y - 25);
      const dist = Math.abs(dx);
      enemy.facing = dx > 0 ? 'right' : 'left';

      // Friction / horizontal speed
      const moveSpeed = enemy.speed * (enemy.shockTimer && enemy.shockTimer > 0 ? 0.6 : 1.0);

      // ===================================
      // SPECIFIC ENEMY TYPE AI BEHAVIORS
      // ===================================
      if (enemy.type === 'bat') {
        // Aerial Laser Drone
        enemy.vx = (dx > 0 ? 1 : -1) * moveSpeed;
        enemy.vy = (p.y - 60 - enemy.y) * 1.5;
      } else if (enemy.type === 'spider_drone') {
        // Arachnid Quad-Walker Bot: Fast crawling + periodic leaping attack & acid spit
        enemy.jumpCooldown = (enemy.jumpCooldown || 2.5) - deltaTime;
        if (dist > 180 && enemy.jumpCooldown <= 0 && enemy.isGrounded) {
          enemy.vy = -420;
          enemy.vx = (dx > 0 ? 1 : -1) * 320;
          enemy.isGrounded = false;
          enemy.jumpCooldown = 3.0 + Math.random() * 1.5;
          // Spit acid projectile while airborne
          const angle = Math.atan2(p.y - 30 - enemy.y, p.x - enemy.x);
          this.projectiles.push({
            id: 'acid_spit_' + Math.random(),
            x: enemy.x,
            y: enemy.y - 20,
            vx: Math.cos(angle) * 420,
            vy: Math.sin(angle) * 420,
            damage: Math.round(enemy.damage * 0.8),
            radius: 5,
            color: '#10b981',
            element: 'fire',
            pierceLeft: 0,
            knockback: 12,
            isCrit: false,
            isPlayer: false,
            type: 'enemy_bullet',
            lifespan: 2.0,
            maxLifespan: 2.0
          });
        } else if (dist > enemy.attackRange) {
          enemy.vx = (dx > 0 ? 1 : -1) * moveSpeed;
        } else {
          enemy.vx = 0;
          enemy.attackCooldown -= deltaTime;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 0.9;
            this.applyDamageToPlayer(enemy.damage);
          }
        }
      } else if (enemy.type === 'kamikaze_drone') {
        // Kamikaze Bomb Sentry: Rushes directly at player, primes and detonates!
        enemy.vx = (dx > 0 ? 1 : -1) * (moveSpeed * (enemy.isPrimed ? 1.4 : 1.0));
        if (enemy.y > this.groundY - 30) {
          enemy.vy = -80;
        }

        if (dist < 65 || enemy.isPrimed) {
          if (!enemy.isPrimed) {
            enemy.isPrimed = true;
            enemy.kamikazeDetonateTimer = 0.55;
            soundManager.playBeep();
          } else {
            enemy.kamikazeDetonateTimer = (enemy.kamikazeDetonateTimer || 0.55) - deltaTime;
            if (enemy.kamikazeDetonateTimer <= 0) {
              // DETONATE!
              this.createExplosion(enemy.x, enemy.y - 20, 140, enemy.damage * 2, '#ef4444');
              if (dist < 100) {
                this.applyDamageToPlayer(enemy.damage);
              }
              this.killEnemy(enemy);
              continue;
            }
          }
        }
      } else if (enemy.type === 'stealth_assassin') {
        // Phased Cyber Assassin: Periodically activates optical camouflage
        enemy.cloakedTimer = (enemy.cloakedTimer || 4.0) - deltaTime;
        if (enemy.cloakedTimer <= 0) {
          enemy.isCloaked = !enemy.isCloaked;
          enemy.cloakedTimer = enemy.isCloaked ? 2.8 : 3.5;
          this.addSparkParticles(enemy.x, enemy.y - 25, '#c084fc', 8);
        }

        const stealthSpeed = enemy.isCloaked ? moveSpeed * 1.35 : moveSpeed;
        if (dist > enemy.attackRange) {
          enemy.vx = (dx > 0 ? 1 : -1) * stealthSpeed;
        } else {
          enemy.vx = 0;
          enemy.attackCooldown -= deltaTime;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 0.8;
            this.applyDamageToPlayer(enemy.damage);
            this.addSparkParticles(p.x, p.y - 30, '#f43f5e', 8);
          }
        }
      } else if (enemy.type === 'plasma_tank') {
        // Heavy Hover/Tread Tank: Medium range, fires heavy explosive plasma cannon
        if (dist < 280) {
          enemy.vx = (dx > 0 ? -1 : 1) * moveSpeed;
        } else if (dist > 450) {
          enemy.vx = (dx > 0 ? 1 : -1) * moveSpeed;
        } else {
          enemy.vx = 0;
        }

        enemy.attackCooldown -= deltaTime;
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 2.8;
          const angle = Math.atan2(p.y - 30 - (enemy.y - 25), p.x - enemy.x);
          soundManager.playShoot('heavy');
          this.projectiles.push({
            id: 'plasma_shell_' + Math.random(),
            x: enemy.x + (enemy.facing === 'right' ? 24 : -24),
            y: enemy.y - 25,
            vx: Math.cos(angle) * 520,
            vy: Math.sin(angle) * 520,
            damage: enemy.damage,
            radius: 8,
            color: '#06b6d4',
            trailColor: '#38bdf8',
            element: 'plasma',
            pierceLeft: 0,
            knockback: 25,
            isCrit: false,
            isPlayer: false,
            type: 'rocket',
            lifespan: 2.2,
            maxLifespan: 2.2,
            explosionRadius: 80
          });
        }
      } else if (enemy.type === 'emp_disrupter') {
        // Levitating EMP Core: Hovers above ground, emits expanding shockwave rings
        enemy.vx = (dx > 0 ? 1 : -1) * (moveSpeed * 0.7);
        enemy.vy = (p.y - 80 - enemy.y) * 1.2;

        enemy.empChargeTimer = (enemy.empChargeTimer || 3.0) - deltaTime;
        if (enemy.empChargeTimer <= 0) {
          enemy.empChargeTimer = 3.2;
          soundManager.playSkill();
          this.addExplosionParticles(enemy.x, enemy.y, '#38bdf8', 18);
          // EMP shock damage to player if nearby
          const distToP = Math.sqrt(Math.pow(p.x - enemy.x, 2) + Math.pow(p.y - 30 - enemy.y, 2));
          if (distToP <= 160) {
            this.applyDamageToPlayer(Math.round(enemy.damage * 0.9));
            p.vx *= 0.3; // EMP EMP shock stun
          }
        }
      } else if (enemy.type === 'minigun_juggernaut') {
        // Armored Rotary Gatling Walker: Slow march, fires 4-round rapid laser burst
        if (dist > 350) {
          enemy.vx = (dx > 0 ? 1 : -1) * moveSpeed;
        } else if (dist < 180) {
          enemy.vx = (dx > 0 ? -1 : 1) * moveSpeed;
        } else {
          enemy.vx = 0;
        }

        // Burst fire state handling
        if (enemy.burstCount && enemy.burstCount > 0) {
          enemy.burstTimer = (enemy.burstTimer || 0.1) - deltaTime;
          if (enemy.burstTimer <= 0) {
            enemy.burstTimer = 0.12;
            enemy.burstCount--;
            const angle = Math.atan2(p.y - 30 - (enemy.y - 35), p.x - enemy.x) + (Math.random() - 0.5) * 0.12;
            soundManager.playShoot('rifle');
            this.projectiles.push({
              id: 'gatling_bullet_' + Math.random(),
              x: enemy.x + (enemy.facing === 'right' ? 22 : -22),
              y: enemy.y - 35,
              vx: Math.cos(angle) * 650,
              vy: Math.sin(angle) * 650,
              damage: Math.round(enemy.damage / 3),
              radius: 4,
              color: '#fbbf24',
              element: 'physical',
              pierceLeft: 0,
              knockback: 8,
              isCrit: false,
              isPlayer: false,
              type: 'enemy_bullet',
              lifespan: 1.8,
              maxLifespan: 1.8
            });
          }
        } else {
          enemy.attackCooldown -= deltaTime;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 2.4;
            enemy.burstCount = 4;
            enemy.burstTimer = 0.05;
          }
        }
      } else if (enemy.type === 'mortar_artillery') {
        // Long-range Siege Mortar Mech: Stays back and arches mortar artillery shells
        if (dist < 380) {
          enemy.vx = (dx > 0 ? -1 : 1) * moveSpeed;
        } else if (dist > 600) {
          enemy.vx = (dx > 0 ? 1 : -1) * moveSpeed;
        } else {
          enemy.vx = 0;
        }

        enemy.attackCooldown -= deltaTime;
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 3.5;
          soundManager.playShoot('rocket');
          // Arch mortar upward toward player X
          const timeToTarget = 1.4;
          const targetVx = (p.x - enemy.x) / timeToTarget;
          const targetVy = -500;
          this.projectiles.push({
            id: 'mortar_shell_' + Math.random(),
            x: enemy.x,
            y: enemy.y - 40,
            vx: targetVx,
            vy: targetVy,
            damage: enemy.damage,
            radius: 7,
            color: '#ea580c',
            element: 'fire',
            pierceLeft: 0,
            knockback: 35,
            isCrit: true,
            isPlayer: false,
            type: 'grenade',
            lifespan: timeToTarget,
            maxLifespan: timeToTarget,
            explosionRadius: 110
          });
        }
      } else if (enemy.type === 'nanite_healer') {
        // Medical Repair Drone: Hovers behind frontline allies and restores their HP
        enemy.vx = (dx > 0 ? 1 : -1) * (moveSpeed * 0.8);
        enemy.vy = (p.y - 90 - enemy.y) * 1.2;

        // Find damaged robot to heal
        let healTarget: Enemy | null = null;
        let lowestHpRatio = 0.99;
        this.enemies.forEach((other) => {
          if (other !== enemy && other.hp < other.maxHp) {
            const ratio = other.hp / other.maxHp;
            if (ratio < lowestHpRatio) {
              lowestHpRatio = ratio;
              healTarget = other;
            }
          }
        });

        if (healTarget) {
          const targetEnemy = healTarget as Enemy;
          enemy.healTargetId = targetEnemy.id;
          targetEnemy.hp = Math.min(targetEnemy.maxHp, targetEnemy.hp + 28 * deltaTime);
          if (Math.random() < 0.2) {
            this.addSparkParticles(targetEnemy.x, targetEnemy.y - 25, '#10b981', 2);
          }
        } else {
          enemy.healTargetId = null;
        }
      } else if (enemy.type === 'phantom_spectre') {
        // Levitating Dark Matter Phantom: Hovers, phases & fires homing dark orbs
        enemy.vx = (dx > 0 ? 1 : -1) * moveSpeed;
        enemy.vy = (p.y - 60 - enemy.y) * 1.4;

        enemy.attackCooldown -= deltaTime;
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 2.4;
          soundManager.playShoot('magic');
          const angle = Math.atan2(p.y - 30 - enemy.y, p.x - enemy.x);
          this.projectiles.push({
            id: 'void_orb_' + Math.random(),
            x: enemy.x,
            y: enemy.y - 25,
            vx: Math.cos(angle) * 440,
            vy: Math.sin(angle) * 440,
            damage: enemy.damage,
            radius: 7,
            color: '#a855f7',
            element: 'dark',
            pierceLeft: 0,
            knockback: 15,
            isCrit: false,
            isPlayer: false,
            type: 'enemy_bullet',
            lifespan: 2.2,
            maxLifespan: 2.2
          });
        }
      } else if (enemy.type === 'sniper' || enemy.type === 'necromancer') {
        // Keep distance and shoot ranged projectiles
        if (dist < 320) {
          enemy.vx = (dx > 0 ? -1 : 1) * moveSpeed;
        } else if (dist > 550) {
          enemy.vx = (dx > 0 ? 1 : -1) * moveSpeed;
        } else {
          enemy.vx = 0;
        }

        // Ranged shooting attack
        enemy.attackCooldown -= deltaTime;
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 2.2;
          const angle = Math.atan2(p.y - 30 - enemy.y, p.x - enemy.x);
          soundManager.playShoot('magic');
          this.projectiles.push({
            id: 'enemy_proj_' + Math.random(),
            x: enemy.x,
            y: enemy.y - 30,
            vx: Math.cos(angle) * 450,
            vy: Math.sin(angle) * 450,
            damage: enemy.damage,
            radius: 4,
            color: '#c084fc',
            element: 'dark',
            pierceLeft: 0,
            knockback: 10,
            isCrit: false,
            isPlayer: false,
            type: 'enemy_bullet',
            lifespan: 2.0,
            maxLifespan: 2.0
          });
        }
      } else {
        // Standard melee rushers / golem / boss
        if (dist > enemy.attackRange) {
          enemy.vx = (dx > 0 ? 1 : -1) * moveSpeed;
        } else {
          enemy.vx = 0;
          // Melee attack
          enemy.attackCooldown -= deltaTime;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = enemy.isBoss ? 1.8 : 1.2;
            this.applyDamageToPlayer(enemy.damage);
            if (enemy.isBoss) {
              this.addCameraShake(8);
            }
          }
        }
      }

      // Apply positions
      enemy.x += enemy.vx * deltaTime;
      enemy.y += enemy.vy * deltaTime;

      // Ground clamp for non-flying units on dynamic terrain
      const enemyGroundY = getGroundY(this.stage, enemy.x, this.groundY);
      if (!isFlying && enemy.y >= enemyGroundY) {
        enemy.y = enemyGroundY;
        enemy.vy = 0;
        enemy.isGrounded = true;
      }

      // Walk cycle animation
      if (Math.abs(enemy.vx) > 5) {
        enemy.walkFrame += deltaTime * 10;
      }
    }
  }

  private updateWaveSpawner(deltaTime: number) {
    const waves = this.stage.waves;
    const currentWave = waves[this.currentWaveIndex];
    if (!currentWave) return;

    // Check if wave complete
    if (this.enemiesSpawnedInWave >= currentWave.totalEnemies && this.enemies.length === 0 && !this.isBossActive) {
      if (this.currentWaveIndex < waves.length - 1) {
        this.waveTransitionTimer += deltaTime;
        if (this.waveTransitionTimer >= 2.0) {
          this.currentWaveIndex++;
          this.enemiesSpawnedInWave = 0;
          this.enemiesKilledInWave = 0;
          this.waveTransitionTimer = 0;
          this.callbacks.onWaveChange(this.currentWaveIndex + 1, waves.length);
        }
      } else {
        // Stage Cleared! Victory!
        this.callbacks.onVictory({
          gold: this.stage.rewardGold + this.sessionGold,
          rubies: this.stage.rewardRubies + this.sessionRubies,
          exp: this.stage.rewardExp + this.sessionExp
        });
      }
      return;
    }

    // Spawn regular enemies
    if (this.enemiesSpawnedInWave < currentWave.totalEnemies) {
      this.spawnTimer -= deltaTime;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = currentWave.spawnInterval;
        this.spawnEnemy(currentWave);
        this.enemiesSpawnedInWave++;

        // If this is the last wave and we have spawned all minions, spawn the Boss!
        if (this.enemiesSpawnedInWave >= currentWave.totalEnemies && currentWave.boss && !this.isBossActive) {
          this.spawnBoss(currentWave.boss);
        }
      }
    }
  }

  private spawnEnemy(currentWave: any) {
    const types = currentWave.enemyTypes;
    const rand = Math.random() * 100;
    let accumulated = 0;
    let selectedType: EnemyType = types[0].type;

    for (const t of types) {
      accumulated += t.weight;
      if (rand <= accumulated) {
        selectedType = t.type;
        break;
      }
    }

    // Pick spawn side: Left Outpost House (-1000) or Right Outpost House (+1000)
    const isRight = Math.random() > 0.5;
    const spawnSide = isRight ? 1 : -1;
    const house = isRight ? this.enemyHouses.right : this.enemyHouses.left;
    house.spawnTimer = 0.8; // Trigger hangar door opening and siren beacon animation

    const isAerial = selectedType === 'bat' || selectedType === 'emp_disrupter' || selectedType === 'nanite_healer' || selectedType === 'phantom_spectre';
    const spawnX = isRight ? (isAerial ? 1040 : 960) : (isAerial ? -1040 : -960);
    const spawnGroundY = getGroundY(this.stage, spawnX, this.groundY);
    const spawnY = isAerial ? spawnGroundY - (140 + Math.random() * 40) : spawnGroundY;

    // Spawn FX: exhaust steam / warp flare from the fortress blast gate
    this.addExplosionParticles(spawnX, spawnY - 20, isRight ? '#ef4444' : '#f59e0b', 8);
    this.addSparkParticles(spawnX, spawnY - 20, '#06b6d4', 6);

    const sId = this.stage.id;
    let hp = 70 + sId * 40;
    let speed = 120 + Math.random() * 30;
    let damage = 12 + sId * 4;
    let color = '#38bdf8';
    let robotName = 'SCRAP DROID';
    let attackRange = 32;

    if (selectedType === 'runner') {
      hp = 45 + sId * 25;
      speed = 220;
      damage = 10 + sId * 3;
      color = '#eab308';
      robotName = 'CYBER BLADE-RUNNER';
    } else if (selectedType === 'skeleton') {
      hp = 90 + sId * 45;
      speed = 140;
      damage = 18 + sId * 4;
      color = '#94a3b8';
      robotName = 'PULSE ANDROID';
    } else if (selectedType === 'shielded') {
      hp = 180 + sId * 80;
      speed = 90;
      damage = 22 + sId * 5;
      color = '#06b6d4';
      robotName = 'AEGIS SHIELD DROID';
    } else if (selectedType === 'bat') {
      hp = 40 + sId * 20;
      speed = 180;
      damage = 14 + sId * 3;
      color = '#a855f7';
      robotName = 'LASER ATTACK DRONE';
    } else if (selectedType === 'sniper') {
      hp = 65 + sId * 30;
      speed = 110;
      damage = 26 + sId * 6;
      color = '#f43f5e';
      robotName = 'RAIL SNIPER BOT';
    } else if (selectedType === 'golem') {
      hp = 320 + sId * 140;
      speed = 70;
      damage = 35 + sId * 7;
      color = '#ea580c';
      robotName = 'SIEGE MECH TITAN';
      attackRange = 45;
    } else if (selectedType === 'necromancer') {
      hp = 120 + sId * 50;
      speed = 95;
      damage = 24 + sId * 5;
      color = '#c084fc';
      robotName = 'NANITE ASSEMBLER BOT';
    } else if (selectedType === 'mutant') {
      hp = 200 + sId * 70;
      speed = 130;
      damage = 28 + sId * 6;
      color = '#10b981';
      robotName = 'CYBER ENFORCER MECH';
    } else if (selectedType === 'spider_drone') {
      hp = 85 + sId * 35;
      speed = 210;
      damage = 16 + sId * 4;
      color = '#10b981';
      robotName = 'ARACHNID SPIDER-BOT';
    } else if (selectedType === 'plasma_tank') {
      hp = 350 + sId * 130;
      speed = 65;
      damage = 32 + sId * 7;
      color = '#06b6d4';
      robotName = 'PLASMA HOVER TANK';
      attackRange = 320;
    } else if (selectedType === 'stealth_assassin') {
      hp = 110 + sId * 45;
      speed = 240;
      damage = 30 + sId * 6;
      color = '#ec4899';
      robotName = 'PHASE INFILTRATOR BOT';
      attackRange = 36;
    } else if (selectedType === 'kamikaze_drone') {
      hp = 50 + sId * 25;
      speed = 240;
      damage = 40 + sId * 8;
      color = '#ef4444';
      robotName = 'KAMIKAZE BOMB SENTRY';
      attackRange = 50;
    } else if (selectedType === 'emp_disrupter') {
      hp = 140 + sId * 55;
      speed = 100;
      damage = 22 + sId * 5;
      color = '#38bdf8';
      robotName = 'EMP SHOCKWAVE CORE';
    } else if (selectedType === 'minigun_juggernaut') {
      hp = 380 + sId * 150;
      speed = 75;
      damage = 36 + sId * 8;
      color = '#fbbf24';
      robotName = 'ROTARY GATLING JUGGERNAUT';
      attackRange = 280;
    } else if (selectedType === 'mortar_artillery') {
      hp = 220 + sId * 80;
      speed = 65;
      damage = 34 + sId * 7;
      color = '#ea580c';
      robotName = 'SIEGE MORTAR MECH';
      attackRange = 450;
    } else if (selectedType === 'nanite_healer') {
      hp = 95 + sId * 35;
      speed = 125;
      damage = 10;
      color = '#10b981';
      robotName = 'NANITE REPAIR DRONE';
    } else if (selectedType === 'phantom_spectre') {
      hp = 150 + sId * 60;
      speed = 135;
      damage = 28 + sId * 6;
      color = '#a855f7';
      robotName = 'VOID PHANTOM SPECTRE';
    }

    const enemy: Enemy = {
      id: 'enemy_' + Math.random(),
      name: robotName,
      type: selectedType,
      x: spawnX,
      y: spawnY,
      vx: isRight ? -speed * 0.5 : speed * 0.5,
      vy: 0,
      width: selectedType === 'plasma_tank' ? 44 : (selectedType === 'minigun_juggernaut' || selectedType === 'golem' ? 36 : 24),
      height: selectedType === 'golem' || selectedType === 'minigun_juggernaut' ? 70 : 55,
      hp: hp,
      maxHp: hp,
      speed: speed,
      damage: damage,
      expValue: Math.round(hp * 0.35),
      goldValue: Math.round(hp * 0.2),
      isGrounded: !isAerial,
      facing: isRight ? 'left' : 'right',
      attackCooldown: 1.0,
      attackRange: attackRange,
      color: color,
      walkFrame: 0,
      shieldActive: selectedType === 'shielded'
    };

    this.enemies.push(enemy);
  }

  private spawnBoss(bossConfig: any) {
    this.isBossActive = true;
    this.callbacks.onBossSpawn(bossConfig.name);
    soundManager.playSkill();
    this.addCameraShake(14);

    // Boss emerges with heavy fortress warning sirens from the East or West outpost
    const isRight = Math.random() > 0.5;
    const house = isRight ? this.enemyHouses.right : this.enemyHouses.left;
    house.spawnTimer = 2.5;

    const spawnX = isRight ? 950 : -950;
    const bossGroundY = getGroundY(this.stage, spawnX, this.groundY);

    // Spawn massive shockwave & sparks at the fortress gate
    this.addExplosionParticles(spawnX, bossGroundY - 50, bossConfig.color || '#ef4444', 20);
    this.addSparkParticles(spawnX, bossGroundY - 50, '#fbbf24', 15);

    const boss: Enemy = {
      id: 'boss_' + Math.random(),
      name: bossConfig.name,
      type: 'boss',
      x: spawnX,
      y: bossGroundY,
      vx: isRight ? -40 : 40,
      vy: 0,
      width: 48,
      height: 110,
      hp: bossConfig.hp,
      maxHp: bossConfig.hp,
      speed: 85,
      damage: bossConfig.damage,
      expValue: 600,
      goldValue: 500,
      isGrounded: true,
      facing: isRight ? 'left' : 'right',
      attackCooldown: 2.0,
      attackRange: 60,
      color: bossConfig.color,
      isBoss: true,
      bossPhase: 1,
      walkFrame: 0
    };

    this.enemies.push(boss);
  }

  private updateParticles(deltaTime: number) {
    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.lifespan -= deltaTime;
      if (pt.lifespan <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      pt.alpha = pt.lifespan / pt.maxLifespan;
      pt.x += pt.vx * deltaTime;
      pt.y += pt.vy * deltaTime;

      if (pt.gravity) {
        pt.vy += pt.gravity * deltaTime;
      }
      if (pt.rotationSpeed && pt.rotation !== undefined) {
        pt.rotation += pt.rotationSpeed * deltaTime;
      }

      // Shell bounce on dynamic ground
      const ptGroundY = getGroundY(this.stage, pt.x, this.groundY);
      if (pt.shape === 'shell' && pt.y >= ptGroundY) {
        pt.y = ptGroundY;
        pt.vy = -pt.vy * 0.4;
        pt.vx *= 0.7;
      }
    }

    // Damage Numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.lifespan -= deltaTime;
      if (d.lifespan <= 0) {
        this.damageNumbers.splice(i, 1);
        continue;
      }
      d.y += d.vy * deltaTime;
    }
  }

  public addCameraShake(amount: number) {
    if (!this.settings.screenShake) return;
    this.cameraShake.intensity = Math.min(25, this.cameraShake.intensity + amount);
  }

  public addShellParticle(x: number, y: number, facingLeft: boolean) {
    this.particles.push({
      id: 'shell_' + Math.random(),
      x: x,
      y: y,
      vx: (facingLeft ? 1 : -1) * (60 + Math.random() * 80),
      vy: -(120 + Math.random() * 100),
      size: 3,
      color: '#eab308',
      alpha: 1.0,
      lifespan: 1.8,
      maxLifespan: 1.8,
      shape: 'shell',
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 15,
      gravity: 900
    });
  }

  public addSparkParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 180;
      this.particles.push({
        id: 'spark_' + Math.random(),
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        color: color,
        alpha: 1.0,
        lifespan: 0.35 + Math.random() * 0.3,
        maxLifespan: 0.65,
        shape: 'spark',
        gravity: 400
      });
    }
  }

  public addBloodParticles(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 120;
      this.particles.push({
        id: 'blood_' + Math.random(),
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: 2.5 + Math.random() * 2,
        color: '#dc2626',
        alpha: 1.0,
        lifespan: 0.5 + Math.random() * 0.4,
        maxLifespan: 0.9,
        shape: 'circle',
        gravity: 700
      });
    }
  }

  public addExplosionParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 320;
      this.particles.push({
        id: 'exp_' + Math.random(),
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 7,
        color: i % 2 === 0 ? color : '#f97316',
        alpha: 1.0,
        lifespan: 0.4 + Math.random() * 0.5,
        maxLifespan: 0.9,
        shape: 'spark',
        gravity: 200
      });
    }
  }

  public addDustParticles(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        id: 'dust_' + Math.random(),
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: (Math.random() - 0.5) * 80,
        vy: -(20 + Math.random() * 40),
        size: 3 + Math.random() * 3,
        color: '#94a3b8',
        alpha: 0.6,
        lifespan: 0.4,
        maxLifespan: 0.4,
        shape: 'smoke'
      });
    }
  }

  public addSmokeParticle(x: number, y: number) {
    this.particles.push({
      id: 'smoke_' + Math.random(),
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      size: 4 + Math.random() * 4,
      color: '#64748b',
      alpha: 0.5,
      lifespan: 0.4,
      maxLifespan: 0.4,
      shape: 'smoke'
    });
  }
}
