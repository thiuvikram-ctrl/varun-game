import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameMode, Character, Weapon, Vehicle } from '../types/game';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Crosshair, Shield, Heart, Zap, RefreshCw, Car, 
  Flame, Award, Eye, RotateCcw, Home, Volume2, VolumeX,
  Target, Navigation, AlertTriangle
} from 'lucide-react';
import { BOT_NAMES } from '../data/gameData';

interface BattlegroundCanvasProps {
  mode: GameMode;
  character: Character;
  primaryWeapon: Weapon;
  secondaryWeapon: Weapon;
  vehicle: Vehicle;
  onExitMatch: (results?: { kills: number; damage: number; won: boolean; place: number }) => void;
  onOpenStore: () => void;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  rangeRemaining: number;
  isPlayerBullet: boolean;
  color: string;
  isCritical?: boolean;
}

interface Bot {
  id: string;
  name: string;
  x: number;
  y: number;
  angle: number;
  health: number;
  maxHealth: number;
  team: 'enemy' | 'friendly';
  isAlive: boolean;
  lastShotTime: number;
  targetX: number;
  targetY: number;
  speed: number;
  weaponType: 'ar' | 'sniper' | 'smg' | 'shotgun';
  state: 'patrol' | 'engage' | 'flee' | 'loot';
}

interface LootItem {
  id: string;
  x: number;
  y: number;
  type: 'medkit' | 'ammo' | 'armor' | 'airdrop_weapon';
  name: string;
  color: string;
}

interface InGameVehicle {
  id: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  health: number;
  maxHealth: number;
  type: string;
  color: string;
  accentColor: string;
  occupied: boolean;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  isCrit?: boolean;
}

interface KillFeedEntry {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  time: number;
}

export const BattlegroundCanvas: React.FC<BattlegroundCanvasProps> = ({
  mode,
  character,
  primaryWeapon,
  secondaryWeapon,
  vehicle: defaultVehicle,
  onExitMatch,
  onOpenStore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Match State
  const [matchOver, setMatchOver] = useState(false);
  const [matchWon, setMatchWon] = useState(false);
  const [playerKills, setPlayerKills] = useState(0);
  const [playerDamage, setPlayerDamage] = useState(0);
  const [alivePlayers, setAlivePlayers] = useState(mode === 'BATTLE_ROYALE' ? 20 : 8);
  const [playerPlace, setPlayerPlace] = useState(1);
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  // Weapon & Ammo
  const [activeWeaponSlot, setActiveWeaponSlot] = useState<'primary' | 'secondary'>('primary');
  const currentWeapon = activeWeaponSlot === 'primary' ? primaryWeapon : secondaryWeapon;
  const [ammoInMag, setAmmoInMag] = useState(currentWeapon.magazineSize);
  const [reserveAmmo, setReserveAmmo] = useState(180);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);

  // Ability Cooldown
  const [abilityCooldown, setAbilityCooldown] = useState(0);
  const [abilityActive, setAbilityActive] = useState(false);

  // Vehicle state
  const [inVehicle, setInVehicle] = useState(false);
  const [vehicleHealth, setVehicleHealth] = useState(defaultVehicle.durability);
  const [nearbyVehicle, setNearbyVehicle] = useState<InGameVehicle | null>(null);

  // Training Ground specific
  const [dps, setDps] = useState(0);
  const [hitsCount, setHitsCount] = useState(0);
  const [infiniteAmmo, setInfiniteAmmo] = useState(false);

  // Health & Armor
  const [health, setHealth] = useState(character.baseHealth);
  const [armor, setArmor] = useState(100);

  // Safe Zone
  const [zoneTimer, setZoneTimer] = useState(45);
  const [zonePhase, setZonePhase] = useState(1);
  const [inGasWarning, setInGasWarning] = useState(false);

  // Touch Controls
  const [touchAiming, setTouchAiming] = useState(false);
  const joystickRef = useRef<{ active: boolean; startX: number; startY: number; curX: number; curY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    curX: 0,
    curY: 0,
  });

  // Game internal mutable state
  const stateRef = useRef({
    worldWidth: mode === 'BATTLE_ROYALE' ? 2600 : mode === 'TEAM_DEATHMATCH' ? 1600 : 1200,
    worldHeight: mode === 'BATTLE_ROYALE' ? 2600 : mode === 'TEAM_DEATHMATCH' ? 1600 : 900,
    player: {
      x: 1300,
      y: 1300,
      angle: 0,
      vx: 0,
      vy: 0,
      isAlive: true,
      lastShotTime: 0,
    },
    camera: { x: 0, y: 0 },
    keys: {} as Record<string, boolean>,
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false },
    bullets: [] as Bullet[],
    bots: [] as Bot[],
    loots: [] as LootItem[],
    vehicles: [] as InGameVehicle[],
    floatingTexts: [] as FloatingText[],
    safeZone: {
      currentRadius: 1200,
      targetRadius: 750,
      centerX: 1300,
      centerY: 1300,
      speed: 0.15,
      isShrinking: false,
    },
    obstacles: [] as { x: number; y: number; w: number; h: number; type: 'building' | 'rock' | 'crate' }[],
    teamScores: { blue: 0, red: 0 },
    damageWindow: [] as { time: number; dmg: number }[],
    lastFrameTime: performance.now(),
  });

  // Initialize Game World
  useEffect(() => {
    const s = stateRef.current;
    if (mode === 'SHOOTING_RANGE') {
      s.worldWidth = 1400;
      s.worldHeight = 800;
      s.player.x = 200;
      s.player.y = 400;
    } else {
      s.player.x = s.worldWidth / 2;
      s.player.y = s.worldHeight / 2;
    }

    // Generate Obstacles (bunkers, crates, sandbags)
    const obs = [];
    const count = mode === 'BATTLE_ROYALE' ? 55 : 22;
    for (let i = 0; i < count; i++) {
      const w = 60 + Math.random() * 90;
      const h = 60 + Math.random() * 90;
      const x = 100 + Math.random() * (s.worldWidth - 200);
      const y = 100 + Math.random() * (s.worldHeight - 200);
      // Avoid player spawn
      if (Math.hypot(x - s.player.x, y - s.player.y) > 200) {
        obs.push({ x, y, w, h, type: i % 3 === 0 ? 'building' : i % 2 === 0 ? 'crate' : 'rock' } as const);
      }
    }
    s.obstacles = obs;

    // Generate Bots
    const botCount = mode === 'BATTLE_ROYALE' ? 19 : mode === 'TEAM_DEATHMATCH' ? 7 : 8;
    const generatedBots: Bot[] = [];
    for (let i = 0; i < botCount; i++) {
      let bx = 150 + Math.random() * (s.worldWidth - 300);
      let by = 150 + Math.random() * (s.worldHeight - 300);

      if (mode === 'SHOOTING_RANGE') {
        // Target dummies at fixed distances
        const dists = [180, 320, 480, 640, 800, 960, 1100];
        bx = 200 + (dists[i % dists.length] || 400);
        by = 220 + (i % 3) * 160;
      }

      const team = mode === 'TEAM_DEATHMATCH' && i < 3 ? 'friendly' : 'enemy';
      generatedBots.push({
        id: `bot_${i}`,
        name: BOT_NAMES[i % BOT_NAMES.length],
        x: bx,
        y: by,
        angle: Math.random() * Math.PI * 2,
        health: 100,
        maxHealth: 100,
        team,
        isAlive: true,
        lastShotTime: 0,
        targetX: bx,
        targetY: by,
        speed: mode === 'SHOOTING_RANGE' ? 0 : 2.2 + Math.random() * 1.2,
        weaponType: i % 4 === 0 ? 'sniper' : i % 3 === 0 ? 'shotgun' : i % 2 === 0 ? 'smg' : 'ar',
        state: 'patrol',
      });
    }
    s.bots = generatedBots;

    // Generate Vehicles
    const spawnedVehicles: InGameVehicle[] = [];
    const vCount = mode === 'BATTLE_ROYALE' ? 8 : mode === 'SHOOTING_RANGE' ? 2 : 2;
    for (let i = 0; i < vCount; i++) {
      spawnedVehicles.push({
        id: `veh_${i}`,
        x: mode === 'SHOOTING_RANGE' ? 300 + i * 200 : 250 + Math.random() * (s.worldWidth - 500),
        y: mode === 'SHOOTING_RANGE' ? 650 : 250 + Math.random() * (s.worldHeight - 500),
        angle: Math.random() * Math.PI * 2,
        speed: 0,
        health: defaultVehicle.durability,
        maxHealth: defaultVehicle.durability,
        type: defaultVehicle.name,
        color: defaultVehicle.skins[0]?.color || '#4d5b44',
        accentColor: defaultVehicle.skins[0]?.accentColor || '#1e293b',
        occupied: false,
      });
    }
    s.vehicles = spawnedVehicles;

    // Generate Loot
    const lootItems: LootItem[] = [];
    const lootCount = mode === 'BATTLE_ROYALE' ? 40 : 10;
    const types: ('medkit' | 'ammo' | 'armor' | 'airdrop_weapon')[] = ['medkit', 'ammo', 'armor', 'airdrop_weapon'];
    for (let i = 0; i < lootCount; i++) {
      const type = types[i % types.length];
      lootItems.push({
        id: `loot_${i}`,
        x: 100 + Math.random() * (s.worldWidth - 200),
        y: 100 + Math.random() * (s.worldHeight - 200),
        type,
        name: type === 'medkit' ? 'Military Medkit (+50 HP)' : type === 'ammo' ? 'Tactical Ammo (+60)' : type === 'armor' ? 'Kevlar Vest (+50 Armor)' : 'AWM Sniper Crate',
        color: type === 'medkit' ? '#22c55e' : type === 'ammo' ? '#f59e0b' : type === 'armor' ? '#38bdf8' : '#a855f7',
      });
    }
    s.loots = lootItems;

    setAmmoInMag(currentWeapon.magazineSize);
    setHealth(character.baseHealth);
    setArmor(100);
    setMatchOver(false);
    setPlayerKills(0);
    setPlayerDamage(0);
    setAlivePlayers(mode === 'BATTLE_ROYALE' ? 20 : 8);
  }, [mode, character, defaultVehicle]);

  // Handle Weapon Switch
  const switchWeapon = useCallback((slot: 'primary' | 'secondary') => {
    if (activeWeaponSlot === slot || isReloading) return;
    sound.playClick();
    setActiveWeaponSlot(slot);
    const w = slot === 'primary' ? primaryWeapon : secondaryWeapon;
    setAmmoInMag(w.magazineSize);
  }, [activeWeaponSlot, isReloading, primaryWeapon, secondaryWeapon]);

  // Handle Reload
  const triggerReload = useCallback(() => {
    if (isReloading || ammoInMag >= currentWeapon.magazineSize || (reserveAmmo <= 0 && !infiniteAmmo)) return;
    setIsReloading(true);
    sound.playReload();

    const reloadDuration = currentWeapon.reloadTime * 1000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / reloadDuration) * 100));
      setReloadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        const needed = currentWeapon.magazineSize - ammoInMag;
        const toLoad = infiniteAmmo ? needed : Math.min(needed, reserveAmmo);
        setAmmoInMag(prev => prev + toLoad);
        if (!infiniteAmmo) {
          setReserveAmmo(prev => prev - toLoad);
        }
        setIsReloading(false);
        setReloadProgress(0);
      }
    }, 50);
  }, [isReloading, ammoInMag, currentWeapon, reserveAmmo, infiniteAmmo]);

  // Handle Character Ability
  const triggerAbility = useCallback(() => {
    if (abilityCooldown > 0 || abilityActive) return;
    setAbilityActive(true);
    sound.playClick();

    const special = character.specialAbility;
    if (special.type === 'heal') {
      setHealth(prev => Math.min(character.baseHealth, prev + 45));
      sound.playDiamondChime();
    } else if (special.type === 'armor') {
      setArmor(prev => Math.min(100, prev + 50));
    } else if (special.type === 'sprint') {
      sound.playClick();
    } else if (special.type === 'grenade') {
      // Shrapnel burst around player
      const s = stateRef.current;
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        s.bullets.push({
          x: s.player.x,
          y: s.player.y,
          vx: Math.cos(angle) * 10,
          vy: Math.sin(angle) * 10,
          damage: 55,
          rangeRemaining: 240,
          isPlayerBullet: true,
          color: '#f97316',
          isCritical: true,
        });
      }
      sound.playGunshot('shotgun');
    }

    // Cooldown duration
    setTimeout(() => {
      setAbilityActive(false);
    }, special.durationSeconds * 1000);

    setAbilityCooldown(special.cooldownSeconds);
    const cdInterval = setInterval(() => {
      setAbilityCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cdInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [abilityCooldown, abilityActive, character]);

  // Handle Enter / Exit Vehicle
  const toggleVehicle = useCallback(() => {
    const s = stateRef.current;
    if (inVehicle) {
      // Exit vehicle
      setInVehicle(false);
      s.player.x += Math.cos(s.player.angle + Math.PI / 2) * 45;
      s.player.y += Math.sin(s.player.angle + Math.PI / 2) * 45;
      sound.playClick();
    } else if (nearbyVehicle) {
      // Enter vehicle
      setInVehicle(true);
      setVehicleHealth(nearbyVehicle.health);
      sound.playVehicleEngine();
    }
  }, [inVehicle, nearbyVehicle]);

  // Safe Zone contraction timer
  useEffect(() => {
    if (mode !== 'BATTLE_ROYALE' || matchOver) return;
    const interval = setInterval(() => {
      setZoneTimer(prev => {
        if (prev <= 1) {
          // Shrink phase triggers
          const s = stateRef.current;
          s.safeZone.isShrinking = true;
          s.safeZone.targetRadius = Math.max(120, s.safeZone.currentRadius * 0.65);
          sound.playZoneWarning();
          setZonePhase(p => p + 1);
          return 40;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, matchOver]);

  // Keyboard & Mouse Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.key.toLowerCase();
      stateRef.current.keys[code] = true;
      if (e.key === '1') switchWeapon('primary');
      if (e.key === '2') switchWeapon('secondary');
      if (code === 'r') triggerReload();
      if (code === 'f') triggerAbility();
      if (code === 'e') toggleVehicle();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.mouse.x = e.clientX - rect.left;
      s.mouse.y = e.clientY - rect.top;
      s.mouse.worldX = s.mouse.x + s.camera.x;
      s.mouse.worldY = s.mouse.y + s.camera.y;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.mouse.isDown = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.mouse.isDown = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [switchWeapon, triggerReload, triggerAbility, toggleVehicle]);

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const loop = (timestamp: number) => {
      const s = stateRef.current;
      const dt = Math.min(32, timestamp - s.lastFrameTime) / 1000;
      s.lastFrameTime = timestamp;

      // 1. UPDATE PLAYER MOVEMENT
      if (s.player.isAlive && !matchOver) {
        let speed = inVehicle 
          ? defaultVehicle.maxSpeed 
          : character.baseSpeed * (abilityActive && character.specialAbility.type === 'sprint' ? 1.35 : 1);

        if (s.keys['shift']) speed *= 1.25; // Tactical sprint

        let dx = 0;
        let dy = 0;

        if (s.keys['w'] || s.keys['arrowup']) dy -= 1;
        if (s.keys['s'] || s.keys['arrowdown']) dy += 1;
        if (s.keys['a'] || s.keys['arrowleft']) dx -= 1;
        if (s.keys['d'] || s.keys['arrowright']) dx += 1;

        // Touch Virtual Joystick input
        if (joystickRef.current.active) {
          const jdx = joystickRef.current.curX - joystickRef.current.startX;
          const jdy = joystickRef.current.curY - joystickRef.current.startY;
          const dist = Math.hypot(jdx, jdy);
          if (dist > 10) {
            dx = jdx / dist;
            dy = jdy / dist;
          }
        }

        if (dx !== 0 || dy !== 0) {
          const len = Math.hypot(dx, dy);
          s.player.x += (dx / len) * speed * 60 * dt;
          s.player.y += (dy / len) * speed * 60 * dt;

          // Sound effect when driving
          if (inVehicle && Math.random() < 0.05) {
            sound.playVehicleEngine();
          }
        }

        // Clamp inside world boundary
        s.player.x = Math.max(30, Math.min(s.worldWidth - 30, s.player.x));
        s.player.y = Math.max(30, Math.min(s.worldHeight - 30, s.player.y));

        // Aim angle towards mouse or touch
        if (touchAiming) {
          // Touch controls handle angle
        } else {
          s.player.angle = Math.atan2(s.mouse.worldY - s.player.y, s.mouse.worldX - s.player.x);
        }

        // Check proximity to vehicles
        let closestVeh: InGameVehicle | null = null;
        let minDist = 75;
        s.vehicles.forEach(v => {
          const dist = Math.hypot(v.x - s.player.x, v.y - s.player.y);
          if (dist < minDist) {
            minDist = dist;
            closestVeh = v;
          }
        });
        setNearbyVehicle(closestVeh);

        // Pick up nearby loot
        s.loots = s.loots.filter(loot => {
          const dist = Math.hypot(loot.x - s.player.x, loot.y - s.player.y);
          if (dist < 40) {
            sound.playClick();
            if (loot.type === 'medkit') {
              setHealth(h => Math.min(character.baseHealth, h + 50));
            } else if (loot.type === 'ammo') {
              setReserveAmmo(a => a + 90);
            } else if (loot.type === 'armor') {
              setArmor(a => Math.min(100, a + 50));
            } else if (loot.type === 'airdrop_weapon') {
              setReserveAmmo(a => a + 60);
              sound.playDiamondChime();
            }
            s.floatingTexts.push({
              id: Math.random().toString(),
              x: s.player.x,
              y: s.player.y - 20,
              text: `+ ${loot.name}`,
              color: loot.color,
              opacity: 1,
            });
            return false;
          }
          return true;
        });

        // Safe zone damage check
        if (mode === 'BATTLE_ROYALE') {
          const distFromZone = Math.hypot(s.player.x - s.safeZone.centerX, s.player.y - s.safeZone.centerY);
          if (distFromZone > s.safeZone.currentRadius) {
            setInGasWarning(true);
            // Takes periodic zone damage
            if (Math.random() < 0.08) {
              setHealth(prev => {
                const next = prev - 4;
                if (next <= 0) {
                  s.player.isAlive = false;
                  setMatchOver(true);
                  setMatchWon(false);
                }
                return Math.max(0, next);
              });
            }
          } else {
            setInGasWarning(false);
          }
        }
      }

      // 2. PLAYER SHOOTING
      if (s.player.isAlive && !matchOver && (s.mouse.isDown || touchAiming) && !inVehicle && !isReloading) {
        const fireInterval = 60000 / currentWeapon.fireRate;
        if (timestamp - s.player.lastShotTime >= fireInterval) {
          if (ammoInMag > 0) {
            s.player.lastShotTime = timestamp;
            setAmmoInMag(prev => (infiniteAmmo ? prev : prev - 1));
            sound.playGunshot(currentWeapon.soundType);

            // Recoil spread
            const spread = (Math.random() - 0.5) * currentWeapon.recoil * (s.keys['shift'] ? 1.8 : 1);
            const shootAngle = s.player.angle + spread;
            const muzzleX = s.player.x + Math.cos(s.player.angle) * 32;
            const muzzleY = s.player.y + Math.sin(s.player.angle) * 32;

            const isDeadeye = abilityActive && character.specialAbility.type === 'snipe';
            const bulletDmg = isDeadeye ? currentWeapon.damage * 1.5 : currentWeapon.damage;

            if (currentWeapon.category === 'Shotgun') {
              // Multi-pellet spread
              for (let p = -3; p <= 3; p++) {
                const pelletAngle = shootAngle + p * 0.06;
                s.bullets.push({
                  x: muzzleX,
                  y: muzzleY,
                  vx: Math.cos(pelletAngle) * currentWeapon.bulletSpeed,
                  vy: Math.sin(pelletAngle) * currentWeapon.bulletSpeed,
                  damage: bulletDmg / 6,
                  rangeRemaining: currentWeapon.range,
                  isPlayerBullet: true,
                  color: currentWeapon.skins[0]?.glowColor || '#f59e0b',
                });
              }
            } else {
              s.bullets.push({
                x: muzzleX,
                y: muzzleY,
                vx: Math.cos(shootAngle) * currentWeapon.bulletSpeed,
                vy: Math.sin(shootAngle) * currentWeapon.bulletSpeed,
                damage: bulletDmg,
                rangeRemaining: currentWeapon.range,
                isPlayerBullet: true,
                color: currentWeapon.skins[0]?.glowColor || '#f59e0b',
                isCritical: isDeadeye,
              });
            }
          } else {
            // Out of ammo click
            sound.playClick();
            triggerReload();
          }
        }
      }

      // 3. SAFE ZONE CONTRACTION
      if (s.safeZone.isShrinking) {
        if (s.safeZone.currentRadius > s.safeZone.targetRadius) {
          s.safeZone.currentRadius -= s.safeZone.speed * 60 * dt;
        } else {
          s.safeZone.isShrinking = false;
        }
      }

      // 4. UPDATE BULLETS
      s.bullets = s.bullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.rangeRemaining -= Math.hypot(b.vx, b.vy);

        if (b.rangeRemaining <= 0 || b.x < 0 || b.x > s.worldWidth || b.y < 0 || b.y > s.worldHeight) {
          return false;
        }

        // Bullet vs Obstacles
        for (const obs of s.obstacles) {
          if (b.x >= obs.x && b.x <= obs.x + obs.w && b.y >= obs.y && b.y <= obs.y + obs.h) {
            return false;
          }
        }

        // Player Bullets hitting Bots
        if (b.isPlayerBullet) {
          for (const bot of s.bots) {
            if (bot.isAlive && (bot.team === 'enemy' || mode === 'BATTLE_ROYALE' || mode === 'SHOOTING_RANGE')) {
              const dist = Math.hypot(b.x - bot.x, b.y - bot.y);
              if (dist < 22) {
                // Hit detected!
                const isHeadshot = Math.random() < 0.28 || b.isCritical;
                const finalDamage = Math.round(isHeadshot ? b.damage * 2.2 : b.damage);

                bot.health -= finalDamage;
                sound.playHitmarker(isHeadshot);

                setPlayerDamage(d => d + finalDamage);
                setHitsCount(h => h + 1);

                // Training Ground DPS register
                s.damageWindow.push({ time: timestamp, dmg: finalDamage });

                // Floating damage indicator
                s.floatingTexts.push({
                  id: Math.random().toString(),
                  x: bot.x + (Math.random() - 0.5) * 20,
                  y: bot.y - 25,
                  text: `${finalDamage}${isHeadshot ? ' CRIT' : ''}`,
                  color: isHeadshot ? '#ef4444' : '#facc15',
                  opacity: 1,
                  isCrit: isHeadshot,
                });

                if (bot.health <= 0) {
                  bot.isAlive = false;
                  bot.health = 0;
                  setPlayerKills(k => k + 1);
                  sound.playKillSound();

                  // Drop loot crate
                  s.loots.push({
                    id: Math.random().toString(),
                    x: bot.x,
                    y: bot.y,
                    type: Math.random() < 0.4 ? 'medkit' : 'ammo',
                    name: 'Tactical Bot Drop',
                    color: '#22c55e',
                  });

                  // Add to kill feed
                  setKillFeed(prev => [
                    {
                      id: Math.random().toString(),
                      killer: character.name.split(' ')[0],
                      victim: bot.name,
                      weapon: currentWeapon.name.split(' ')[0],
                      time: Date.now(),
                    },
                    ...prev.slice(0, 4),
                  ]);

                  // Update alive count
                  if (mode === 'BATTLE_ROYALE') {
                    setAlivePlayers(prev => {
                      const updated = prev - 1;
                      if (updated <= 1) {
                        // VICTORY ROYALE!
                        setMatchWon(true);
                        setMatchOver(true);
                        setPlayerPlace(1);
                        sound.playVictory();
                        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                      }
                      return updated;
                    });
                  } else if (mode === 'SHOOTING_RANGE') {
                    // Instantly respawn shooting range dummy
                    setTimeout(() => {
                      bot.health = bot.maxHealth;
                      bot.isAlive = true;
                    }, 1200);
                  }
                }
                return false;
              }
            }
          }
        } else {
          // Enemy bot bullets hitting Player
          if (s.player.isAlive) {
            const dist = Math.hypot(b.x - s.player.x, b.y - s.player.y);
            if (dist < 20) {
              // Player takes hit
              let dmg = b.damage;
              if (inVehicle) {
                // Vehicle absorbs damage
                setVehicleHealth(vh => {
                  const nvh = vh - dmg;
                  if (nvh <= 0) {
                    setInVehicle(false); // Vehicle destroyed!
                  }
                  return Math.max(0, nvh);
                });
              } else {
                // Apply Titan Boris armor defense
                if (abilityActive && character.specialAbility.type === 'armor') {
                  dmg *= 0.6;
                }
                setArmor(currArmor => {
                  if (currArmor > 0) {
                    const absorbed = Math.min(currArmor, dmg * 0.7);
                    const healthDmg = dmg - absorbed;
                    setHealth(h => {
                      const next = h - healthDmg;
                      if (next <= 0) {
                        s.player.isAlive = false;
                        setMatchOver(true);
                        setMatchWon(false);
                      }
                      return Math.max(0, next);
                    });
                    return Math.max(0, currArmor - absorbed);
                  } else {
                    setHealth(h => {
                      const next = h - dmg;
                      if (next <= 0) {
                        s.player.isAlive = false;
                        setMatchOver(true);
                        setMatchWon(false);
                      }
                      return Math.max(0, next);
                    });
                    return 0;
                  }
                });
              }
              sound.playHitmarker(false);
              return false;
            }
          }
        }

        return true;
      });

      // 5. UPDATE BOTS AI
      s.bots.forEach(bot => {
        if (!bot.isAlive || mode === 'SHOOTING_RANGE') return;

        // Check distance to player
        const distToPlayer = Math.hypot(s.player.x - bot.x, s.player.y - bot.y);

        if (distToPlayer < 400 && s.player.isAlive) {
          // Engage player
          bot.state = 'engage';
          bot.angle = Math.atan2(s.player.y - bot.y, s.player.x - bot.x);

          // Move closer if far, or back up if too close
          if (distToPlayer > 180) {
            bot.x += Math.cos(bot.angle) * bot.speed;
            bot.y += Math.sin(bot.angle) * bot.speed;
          }

          // Bot shooting
          if (timestamp - bot.lastShotTime > 1400) {
            bot.lastShotTime = timestamp;
            const spread = (Math.random() - 0.5) * 0.25;
            s.bullets.push({
              x: bot.x + Math.cos(bot.angle) * 20,
              y: bot.y + Math.sin(bot.angle) * 20,
              vx: Math.cos(bot.angle + spread) * 11,
              vy: Math.sin(bot.angle + spread) * 11,
              damage: 18,
              rangeRemaining: 360,
              isPlayerBullet: false,
              color: '#ef4444',
            });
            sound.playGunshot('ar');
          }
        } else {
          // Patrol wander
          bot.state = 'patrol';
          if (Math.hypot(bot.targetX - bot.x, bot.targetY - bot.y) < 30 || Math.random() < 0.01) {
            bot.targetX = 100 + Math.random() * (s.worldWidth - 200);
            bot.targetY = 100 + Math.random() * (s.worldHeight - 200);
          }
          const patrolAngle = Math.atan2(bot.targetY - bot.y, bot.targetX - bot.x);
          bot.angle = patrolAngle;
          bot.x += Math.cos(patrolAngle) * (bot.speed * 0.6);
          bot.y += Math.sin(patrolAngle) * (bot.speed * 0.6);
        }

        // Clamp inside bounds
        bot.x = Math.max(30, Math.min(s.worldWidth - 30, bot.x));
        bot.y = Math.max(30, Math.min(s.worldHeight - 30, bot.y));
      });

      // 6. UPDATE VEHICLE COLLISIONS (Roadkill mechanic!)
      if (inVehicle) {
        s.bots.forEach(bot => {
          if (bot.isAlive) {
            const dist = Math.hypot(bot.x - s.player.x, bot.y - s.player.y);
            if (dist < 42) {
              bot.health = 0;
              bot.isAlive = false;
              setPlayerKills(k => k + 1);
              sound.playHitmarker(true);
              sound.playKillSound();
              s.floatingTexts.push({
                id: Math.random().toString(),
                x: bot.x,
                y: bot.y,
                text: 'ROADKILL! 250',
                color: '#ef4444',
                opacity: 1,
                isCrit: true,
              });
            }
          }
        });
      }

      // Calculate recent DPS in Training Ground
      const cutoff = timestamp - 2000;
      s.damageWindow = s.damageWindow.filter(item => item.time > cutoff);
      const totalDmgInWindow = s.damageWindow.reduce((acc, curr) => acc + curr.dmg, 0);
      setDps(Math.round(totalDmgInWindow / 2));

      // 7. CAMERA POSITION
      s.camera.x = s.player.x - canvas.width / 2;
      s.camera.y = s.player.y - canvas.height / 2;
      s.camera.x = Math.max(0, Math.min(s.worldWidth - canvas.width, s.camera.x));
      s.camera.y = Math.max(0, Math.min(s.worldHeight - canvas.height, s.camera.y));

      // 8. RENDER WORLD TO CANVAS
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(-s.camera.x, -s.camera.y);

      // Draw Terrain Grid
      ctx.fillStyle = '#0d1017';
      ctx.fillRect(0, 0, s.worldWidth, s.worldHeight);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < s.worldWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, s.worldHeight);
        ctx.stroke();
      }
      for (let y = 0; y < s.worldHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s.worldWidth, y);
        ctx.stroke();
      }

      // Draw Safe Zone (Circle gas / electric ring)
      if (mode === 'BATTLE_ROYALE') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.safeZone.centerX, s.safeZone.centerY, s.safeZone.currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Warning Gas Overlay outside circle
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.beginPath();
        ctx.rect(0, 0, s.worldWidth, s.worldHeight);
        ctx.arc(s.safeZone.centerX, s.safeZone.centerY, s.safeZone.currentRadius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
      }

      // Draw Obstacles (Buildings, rocks, crates)
      s.obstacles.forEach(obs => {
        ctx.fillStyle = obs.type === 'building' ? '#1e2430' : obs.type === 'crate' ? '#334155' : '#171922';
        ctx.strokeStyle = obs.type === 'building' ? '#334155' : '#475569';
        ctx.lineWidth = 2;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

        // Tactical stripes on crates
        if (obs.type === 'crate') {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.moveTo(obs.x + obs.w, obs.y);
          ctx.lineTo(obs.x, obs.y + obs.h);
          ctx.stroke();
        }
      });

      // Draw Loots
      s.loots.forEach(loot => {
        ctx.save();
        ctx.translate(loot.x, loot.y);
        ctx.fillStyle = loot.color;
        ctx.shadowColor = loot.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-10, -10, 20, 20);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-10, -10, 20, 20);
        ctx.restore();
      });

      // Draw Vehicles
      s.vehicles.forEach(v => {
        if (inVehicle && v.id === nearbyVehicle?.id) return; // Drawn on player
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.rotate(v.angle);
        // Vehicle chassis
        ctx.fillStyle = v.color;
        ctx.strokeStyle = v.accentColor;
        ctx.lineWidth = 3;
        ctx.fillRect(-28, -16, 56, 32);
        ctx.strokeRect(-28, -16, 56, 32);
        // Wheels
        ctx.fillStyle = '#111827';
        ctx.fillRect(-24, -20, 12, 5);
        ctx.fillRect(12, -20, 12, 5);
        ctx.fillRect(-24, 15, 12, 5);
        ctx.fillRect(12, 15, 12, 5);
        ctx.restore();
      });

      // Draw Bots
      s.bots.forEach(bot => {
        if (!bot.isAlive) return;
        ctx.save();
        ctx.translate(bot.x, bot.y);
        ctx.rotate(bot.angle);

        // Bot body
        ctx.fillStyle = bot.team === 'friendly' ? '#0284c7' : '#991b1b';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        // Bot hands & gun
        ctx.fillStyle = '#475569';
        ctx.fillRect(8, 4, 16, 4);

        // Head / Helmet
        ctx.fillStyle = '#181b22';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Bot Health bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bot.x - 20, bot.y - 25, 40, 4);
        ctx.fillStyle = bot.team === 'friendly' ? '#38bdf8' : '#ef4444';
        ctx.fillRect(bot.x - 20, bot.y - 25, (bot.health / bot.maxHealth) * 40, 4);

        // Bot name label
        ctx.font = '10px Chakra Petch';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(bot.name, bot.x, bot.y - 30);
      });

      // Draw Player Character
      if (s.player.isAlive) {
        ctx.save();
        ctx.translate(s.player.x, s.player.y);
        ctx.rotate(s.player.angle);

        if (inVehicle) {
          // Render Combat Vehicle with player inside
          ctx.fillStyle = defaultVehicle.skins[0]?.color || '#4d5b44';
          ctx.strokeStyle = defaultVehicle.skins[0]?.accentColor || '#f59e0b';
          ctx.lineWidth = 3;
          ctx.fillRect(-32, -18, 64, 36);
          ctx.strokeRect(-32, -18, 64, 36);

          // Turret / Windshield
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-6, -12, 22, 24);
          // Head
          ctx.fillStyle = character.outfits[0]?.colorScheme.primary || '#181b22';
          ctx.beginPath();
          ctx.arc(2, 0, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Tactical Flashlight / Aim cone
          const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, 220, -0.3, 0.3);
          ctx.fill();

          // Operator Body & Vest
          const outfitColors = character.outfits.find(o => o.id === character.equippedOutfitId)?.colorScheme 
            || character.outfits[0]?.colorScheme;
          ctx.fillStyle = outfitColors?.primary || '#181b22';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();

          // Shoulder Armor
          ctx.fillStyle = outfitColors?.secondary || '#334155';
          ctx.beginPath();
          ctx.arc(2, -13, 6, 0, Math.PI * 2);
          ctx.arc(2, 13, 6, 0, Math.PI * 2);
          ctx.fill();

          // Tactical Helmet / Mask
          ctx.fillStyle = outfitColors?.accent || '#e2e8f0';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();

          // Equipped Weapon in hands
          ctx.fillStyle = currentWeapon.skins[0]?.primaryColor || '#475569';
          ctx.fillRect(8, 4, 22, 5);

          // Glowing skin accents on firearm
          if (currentWeapon.skins[0]?.glowColor) {
            ctx.shadowColor = currentWeapon.skins[0].glowColor;
            ctx.shadowBlur = 10;
            ctx.fillStyle = currentWeapon.skins[0].glowColor;
            ctx.fillRect(12, 4, 14, 2);
            ctx.shadowBlur = 0;
          }
        }
        ctx.restore();
      }

      // Draw Bullets
      s.bullets.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.isCritical ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Floating Texts
      s.floatingTexts = s.floatingTexts.filter(ft => {
        ft.y -= 0.6;
        ft.opacity -= 0.02;
        if (ft.opacity <= 0) return false;

        ctx.save();
        ctx.font = ft.isCrit ? 'bold 16px Chakra Petch' : '13px Chakra Petch';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        return true;
      });

      ctx.restore(); // Restore camera transform

      // Request next frame
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [
    currentWeapon, character, defaultVehicle, inVehicle, 
    abilityActive, ammoInMag, isReloading, touchAiming, 
    mode, matchOver, nearbyVehicle, infiniteAmmo
  ]);

  // Touch Handlers for Virtual Mobile Controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX < window.innerWidth / 2) {
      joystickRef.current = {
        active: true,
        startX: touch.clientX,
        startY: touch.clientY,
        curX: touch.clientX,
        curY: touch.clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (touch.clientX < window.innerWidth / 2 && joystickRef.current.active) {
        joystickRef.current.curX = touch.clientX;
        joystickRef.current.curY = touch.clientY;
      }
    }
  };

  const handleTouchEnd = () => {
    joystickRef.current.active = false;
  };

  return (
    <div 
      className="relative w-full h-screen bg-[#07090e] select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 2D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Gas Danger Vignette */}
      {inGasWarning && (
        <div className="absolute inset-0 pointer-events-none border-[12px] border-cyan-500/30 animate-pulse bg-cyan-900/10" />
      )}

      {/* TOP HUD BAR */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left: Mode & Alive Count */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-black/80 border border-amber-500/40 rounded flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-military text-lg text-amber-400">
              {mode === 'BATTLE_ROYALE' ? 'WARZONE ROYALE' : mode === 'TEAM_DEATHMATCH' ? 'TEAM DEATHMATCH' : 'FIRING RANGE'}
            </span>
          </div>

          {mode === 'BATTLE_ROYALE' && (
            <div className="px-3 py-1.5 bg-black/80 border border-slate-700 rounded flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase">Alive</span>
              <span className="font-tactical font-bold text-white text-base">{alivePlayers} / 20</span>
            </div>
          )}

          <div className="px-3 py-1.5 bg-black/80 border border-slate-700 rounded flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase">Kills</span>
            <span className="font-tactical font-bold text-amber-400 text-base">{playerKills}</span>
          </div>
        </div>

        {/* Center: Gas / Safe Zone Timer */}
        {mode === 'BATTLE_ROYALE' && (
          <div className="px-4 py-1.5 bg-black/85 border border-cyan-500/50 rounded flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            <div className="text-center">
              <div className="text-[10px] text-cyan-300 font-tactical">ZONE CLOSING IN</div>
              <div className="font-tactical font-bold text-cyan-400 text-sm">{zoneTimer}s</div>
            </div>
          </div>
        )}

        {/* Right: Sound, Mini stats & Exit */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              sound.isMuted = !sound.isMuted;
              setIsMuted(sound.isMuted);
            }}
            className="p-2 bg-black/80 border border-slate-700 rounded hover:border-amber-400 text-slate-300 transition-colors"
            title="Toggle Mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => onExitMatch({ kills: playerKills, damage: playerDamage, won: matchWon, place: playerPlace })}
            className="px-3 py-1.5 bg-red-950/80 border border-red-700/60 rounded text-red-200 font-tactical text-xs hover:bg-red-900 transition-colors flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>QUIT</span>
          </button>
        </div>
      </div>

      {/* KILL FEED (Top Right) */}
      <div className="absolute top-16 right-4 flex flex-col gap-1 pointer-events-none max-w-xs">
        {killFeed.map(feed => (
          <div key={feed.id} className="px-2.5 py-1 bg-black/75 border border-slate-800 rounded text-xs font-tactical flex items-center justify-between gap-3 text-slate-300">
            <span className="text-amber-400 font-semibold">{feed.killer}</span>
            <span className="text-[10px] text-slate-500">[{feed.weapon}]</span>
            <span className="text-red-400">{feed.victim}</span>
          </div>
        ))}
      </div>

      {/* TRAINING GROUND DPS & METRICS PANEL */}
      {mode === 'SHOOTING_RANGE' && (
        <div className="absolute top-16 left-4 p-3 bg-black/85 border border-amber-500/40 rounded max-w-xs pointer-events-auto">
          <div className="text-xs text-amber-400 font-tactical font-bold mb-1">TARGET METRICS</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">DPS: </span>
              <span className="font-bold text-white font-tactical">{dps}</span>
            </div>
            <div>
              <span className="text-slate-400">Hits: </span>
              <span className="font-bold text-white font-tactical">{hitsCount}</span>
            </div>
            <div>
              <span className="text-slate-400">Total Damage: </span>
              <span className="font-bold text-amber-400 font-tactical">{playerDamage}</span>
            </div>
            <div>
              <button
                onClick={() => setInfiniteAmmo(!infiniteAmmo)}
                className={`px-2 py-0.5 rounded text-[11px] font-tactical border ${infiniteAmmo ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                {infiniteAmmo ? 'INF AMMO: ON' : 'INF AMMO: OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACT PROMPT: VEHICLE */}
      {nearbyVehicle && !inVehicle && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={toggleVehicle}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-sm rounded shadow-lg flex items-center gap-2 animate-bounce"
          >
            <Car className="w-4 h-4" />
            <span>[E] DRIVE {nearbyVehicle.type.toUpperCase()}</span>
          </button>
        </div>
      )}

      {/* BOTTOM LEFT: HEALTH, ARMOR & CHARACTER STATS */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none">
        {/* Ability Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={triggerAbility}
            disabled={abilityCooldown > 0}
            className={`px-3 py-1.5 rounded font-tactical text-xs flex items-center gap-2 border transition-all ${
              abilityActive 
                ? 'bg-amber-500 text-black border-amber-300 animate-pulse font-bold'
                : abilityCooldown > 0 
                ? 'bg-slate-900/80 text-slate-500 border-slate-800' 
                : 'bg-black/85 text-amber-400 border-amber-500/50 hover:bg-amber-500/20'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>[F] {character.specialAbility.name.toUpperCase()}</span>
            {abilityCooldown > 0 && <span className="font-mono text-slate-400">({abilityCooldown}s)</span>}
          </button>
        </div>

        {/* Health & Armor Bars */}
        <div className="p-3 bg-black/85 border border-slate-700/80 rounded w-64 shadow-xl">
          <div className="flex items-center justify-between text-xs font-tactical mb-1">
            <span className="text-slate-300 font-bold">{character.name.toUpperCase()}</span>
            <span className="text-emerald-400 font-mono">{health} / {character.baseHealth} HP</span>
          </div>
          {/* Health Bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-emerald-500 transition-all duration-200"
              style={{ width: `${Math.max(0, (health / character.baseHealth) * 100)}%` }}
            />
          </div>

          {/* Armor Bar */}
          <div className="flex items-center justify-between text-xs font-tactical mb-1">
            <span className="text-cyan-400 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>VEST ARMOR</span>
            </span>
            <span className="text-cyan-400 font-mono">{armor} / 100</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-200"
              style={{ width: `${armor}%` }}
            />
          </div>

          {inVehicle && (
            <div className="mt-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-tactical text-amber-400 mb-1">
                <span>VEHICLE CHASSIS</span>
                <span className="font-mono">{vehicleHealth} / {defaultVehicle.durability}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400"
                  style={{ width: `${(vehicleHealth / defaultVehicle.durability) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM RIGHT: WEAPONS, AMMO & RELOAD */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Weapon Slots Selector (1 & 2) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => switchWeapon('primary')}
            className={`px-3 py-1.5 rounded font-tactical text-xs border transition-all ${
              activeWeaponSlot === 'primary'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-black/75 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            [1] {primaryWeapon.name}
          </button>
          <button
            onClick={() => switchWeapon('secondary')}
            className={`px-3 py-1.5 rounded font-tactical text-xs border transition-all ${
              activeWeaponSlot === 'secondary'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-black/75 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            [2] {secondaryWeapon.name}
          </button>
        </div>

        {/* Ammo Display & Reload Action */}
        <div className="p-3 bg-black/85 border border-slate-700/80 rounded w-52 flex items-center justify-between shadow-xl">
          <div>
            <div className="text-[10px] text-slate-400 font-tactical">{currentWeapon.category} CALIBER</div>
            <div className="flex items-baseline gap-1">
              <span className={`font-military text-3xl font-bold ${ammoInMag <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {ammoInMag}
              </span>
              <span className="text-slate-400 text-xs font-mono">
                / {infiniteAmmo ? '∞' : reserveAmmo}
              </span>
            </div>
          </div>

          <button
            onClick={triggerReload}
            disabled={isReloading}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-amber-400 transition-colors flex flex-col items-center"
            title="Reload [R]"
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin text-amber-300' : ''}`} />
            <span className="text-[9px] font-tactical mt-0.5 text-slate-400">R</span>
          </button>
        </div>

        {isReloading && (
          <div className="w-52 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${reloadProgress}%` }} />
          </div>
        )}
      </div>

      {/* MOBILE TOUCH CONTROLS (Only visible on touch screens or small devices) */}
      <div className="absolute inset-x-4 bottom-24 flex items-center justify-between pointer-events-none md:hidden">
        {/* Virtual Joystick visual guide */}
        <div className="w-24 h-24 rounded-full border-2 border-slate-700/60 bg-black/20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-amber-500/40" />
        </div>

        {/* Mobile Fire Button */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onTouchStart={() => setTouchAiming(true)}
            onTouchEnd={() => setTouchAiming(false)}
            onMouseDown={() => setTouchAiming(true)}
            onMouseUp={() => setTouchAiming(false)}
            className="w-16 h-16 rounded-full bg-red-600/80 active:bg-red-500 border-2 border-red-400 flex items-center justify-center shadow-lg"
          >
            <Target className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>

      {/* MATCH SUMMARY MODAL (Victory Royale or Elimination) */}
      {matchOver && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="tactical-border w-full max-w-md p-6 bg-[#0c0f17] text-center">
            {matchWon ? (
              <div className="mb-4">
                <Award className="w-16 h-16 text-amber-400 mx-auto mb-2 animate-bounce" />
                <h1 className="font-military text-4xl text-amber-400 tracking-wider">VICTORY ROYALE</h1>
                <p className="font-tactical text-xs text-slate-300">CHAMPION OF WARZONE SECTOR</p>
              </div>
            ) : (
              <div className="mb-4">
                <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-2" />
                <h1 className="font-military text-3xl text-red-500 tracking-wider">KIA - SQUAD ELIMINATED</h1>
                <p className="font-tactical text-xs text-slate-400">PLACED #{playerPlace} OF 20</p>
              </div>
            )}

            {/* Match Performance */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-black/60 border border-slate-800 rounded mb-6 text-xs font-tactical">
              <div>
                <span className="text-slate-400 block">Kills</span>
                <span className="text-base font-bold text-white">{playerKills}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Damage</span>
                <span className="text-base font-bold text-amber-400">{playerDamage}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Reward</span>
                <span className="text-base font-bold text-cyan-400">
                  {matchWon ? '+120 💎' : '+30 💎'}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onExitMatch({ kills: playerKills, damage: playerDamage, won: matchWon, place: playerPlace })}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>RETURN TO LOBBY</span>
              </button>

              <button
                onClick={onOpenStore}
                className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-tactical font-semibold text-xs rounded transition-colors"
              >
                TOP UP DIAMONDS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
