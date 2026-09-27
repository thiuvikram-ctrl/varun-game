import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Weapon, Vehicle } from '../types/game';
import { CharacterRosterItem, MapEnvironment, GameModeKey } from '../types/characterRoster';
import { FPSViewModel } from '../utils/fpsViewModel';
import { buildForestWorld, ForestObject } from '../utils/forestWorldBuilder';
import { RealisticAnimeCharacterModel, RealCharacterModel } from '../utils/characterModel3D';
import { FULL_250_CHARACTERS } from '../data/rosterData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { BackpackModal, BackpackSupplies } from './BackpackModal';
import { GameSettingsModal, GameGraphicsSettings } from './GameSettingsModal';
import { 
  Crosshair, Shield, Heart, Zap, RefreshCw, Car, 
  Flame, Award, Eye, RotateCcw, Home, Volume2, VolumeX,
  Target, Navigation, AlertTriangle, Users, Compass,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Package,
  Sparkles, Check, ChevronUp, ChevronDown, Sliders,
  Camera
} from 'lucide-react';

interface Battleground3DProps {
  mode: GameModeKey;
  character: CharacterRosterItem;
  primaryWeapon: Weapon;
  secondaryWeapon: Weapon;
  vehicle: Vehicle;
  mapEnv: MapEnvironment;
  onExitMatch: (results?: { kills: number; damage: number; won: boolean; place: number }) => void;
  onOpenStore: () => void;
}

interface Bullet3D {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  damage: number;
  life: number;
  isPlayer: boolean;
}

interface SparkParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
}

interface DamageNumberPopup {
  id: string;
  damage: number;
  isHeadshot: boolean;
  worldPos: THREE.Vector3;
  createdAt: number;
  screenPos: { x: number; y: number; visible: boolean };
}

export type ArsenalSlot = 'primary' | 'secondary' | 'sidearm' | 'melee' | 'grenade';

export const Battleground3D: React.FC<Battleground3DProps> = ({
  mode,
  character,
  primaryWeapon,
  secondaryWeapon,
  vehicle: defaultVehicle,
  mapEnv,
  onExitMatch,
  onOpenStore,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Match & Countdown State
  const [countdown, setCountdown] = useState<number | null>(5);
  const [matchOver, setMatchOver] = useState(false);
  const [matchWon, setMatchWon] = useState(false);
  const [playerKills, setPlayerKills] = useState(0);
  const [killStreak, setKillStreak] = useState(0);
  const [playerDamage, setPlayerDamage] = useState(0);
  const [alivePlayers, setAlivePlayers] = useState(mode === 'LONE_WOLF' ? 2 : mode === 'CLASH_SQUAD' ? 8 : 20);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  // Roblox Elimination Banner popups
  const [eliminationBanner, setEliminationBanner] = useState<{
    killer: string;
    victim: string;
    streakName?: string;
    isHeadshot: boolean;
  } | null>(null);

  // Roblox 3D Damage Numbers
  const [damagePopups, setDamagePopups] = useState<DamageNumberPopup[]>([]);

  // Roblox Engine Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<GameGraphicsSettings>({
    graphicsQuality: 8,
    fov: 75,
    sensitivity: 1.0,
    cameraMode: 'first_person',
    showDamageNumbers: true,
    particlesEnabled: true,
  });

  // Health, Armor, Weapon
  const [health, setHealth] = useState(character.hp);
  const [armor, setArmor] = useState(100);
  const [activeWeaponSlot, setActiveWeaponSlot] = useState<ArsenalSlot>('primary');
  
  // Synthetic Sidearm & Melee weapons for complete arsenal carrying
  const sidearmWeapon: Weapon = {
    id: 'deagle_gold',
    name: 'Desert Eagle .50 AE Gold',
    category: 'Pistol',
    damage: 65,
    fireRate: 260,
    magazineSize: 7,
    reloadTime: 1.4,
    bulletSpeed: 16,
    range: 350,
    recoil: 0.16,
    soundType: 'pistol',
    priceDiamonds: 0,
    priceCoins: 0,
    isUnlocked: true,
    equippedSkinId: 'gold',
    skins: [{ id: 'gold', name: '24K Gold Plated', rarity: 'Legendary', priceDiamonds: 0, primaryColor: '#ca8a04', pattern: 'gold', description: 'Gilded hand cannon' }]
  };

  const meleeWeapon: Weapon = {
    id: 'katana_tactical',
    name: 'Tactical Damascus Katana',
    category: 'Shotgun',
    damage: 95,
    fireRate: 150,
    magazineSize: 1,
    reloadTime: 0.1,
    bulletSpeed: 25,
    range: 6,
    recoil: 0.02,
    soundType: 'shotgun',
    priceDiamonds: 0,
    priceCoins: 0,
    isUnlocked: true,
    equippedSkinId: 'damascus',
    skins: [{ id: 'damascus', name: 'Damascus Fold', rarity: 'Epic', priceDiamonds: 0, primaryColor: '#0284c7', pattern: 'damascus', description: 'Razor-sharp steel' }]
  };

  const grenadeWeapon: Weapon = {
    id: 'm67_frag',
    name: 'M67 Tactical Frag Grenade',
    category: 'Shotgun',
    damage: 160,
    fireRate: 80,
    magazineSize: 3,
    reloadTime: 1.5,
    bulletSpeed: 10,
    range: 45,
    recoil: 0.05,
    soundType: 'shotgun',
    priceDiamonds: 0,
    priceCoins: 0,
    isUnlocked: true,
    equippedSkinId: 'military',
    skins: [{ id: 'military', name: 'Pineapple Frag', rarity: 'Rare', priceDiamonds: 0, primaryColor: '#166534', pattern: 'olive', description: 'High-explosive frag' }]
  };

  const getActiveWeapon = useCallback((): Weapon => {
    switch (activeWeaponSlot) {
      case 'primary': return primaryWeapon;
      case 'secondary': return secondaryWeapon;
      case 'sidearm': return sidearmWeapon;
      case 'melee': return meleeWeapon;
      case 'grenade': return grenadeWeapon;
    }
  }, [activeWeaponSlot, primaryWeapon, secondaryWeapon]);

  const currentWeapon = getActiveWeapon();
  const [ammoInMag, setAmmoInMag] = useState(currentWeapon.magazineSize);
  const [reserveAmmo, setReserveAmmo] = useState(180);
  const [isReloading, setIsReloading] = useState(false);
  const [isAimingDownSights, setIsAimingDownSights] = useState(false);

  // Movement & Jump States
  const [isCrouching, setIsCrouching] = useState(false);
  const [isGrounded, setIsGrounded] = useState(true);

  // Backpack Modal State & Supplies
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [supplies, setSupplies] = useState<BackpackSupplies>({
    medkits: 3,
    armorPlates: 5,
    adrenaline: 2,
    energyDrinks: 4,
    fragGrenades: 3,
    smokeGrenades: 2,
    ammo556: 180,
    ammo300: 45,
    ammo50AE: 42,
    ammo12Gauge: 32,
  });

  // Safe zone in Forest
  const [zoneTimer, setZoneTimer] = useState(45);
  const [inGasWarning, setInGasWarning] = useState(false);

  // In-game vehicle driving
  const [inVehicle, setInVehicle] = useState(false);
  const [vehicleHealth, setVehicleHealth] = useState(defaultVehicle.durability);
  const [nearbyVehiclePrompt, setNearbyVehiclePrompt] = useState(false);

  // Airdrop Crate Interaction Prompt
  const [nearbyAirdropPrompt, setNearbyAirdropPrompt] = useState(false);

  // Killfeed
  const [killFeed, setKillFeed] = useState<Array<{ id: string; killer: string; victim: string; weapon: string }>>([]);

  // Internal mutable refs
  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    viewModel: null as FPSViewModel | null,
    playerModel: null as RealCharacterModel | null,
    playerPos: new THREE.Vector3(0, 1.7, 0),
    playerVelocity: new THREE.Vector3(),
    jumpVelocity: 0,
    isGrounded: true,
    isCrouching: false,
    cameraMode: 'first_person' as 'first_person' | 'third_person',
    pitch: 0,
    yaw: 0,
    keys: {} as Record<string, boolean>,
    worldObjects: [] as ForestObject[],
    enemyCharacters: [] as RealCharacterModel[],
    bullets: [] as Bullet3D[],
    sparks: [] as SparkParticle[],
    muzzleLight: null as THREE.PointLight | null,
    safeZone: {
      center: new THREE.Vector3(0, 0, 0),
      radius: 160,
      targetRadius: 70,
      isShrinking: false,
    },
    lastShotTime: 0,
    lastFrameTime: performance.now(),
    isPointerLocked: false,
    isFiringTouch: false,
    touchMoveVector: { x: 0, y: 0 },
    settings: {
      graphicsQuality: 8,
      fov: 75,
      sensitivity: 1.0,
      cameraMode: 'first_person' as 'first_person' | 'third_person',
      showDamageNumbers: true,
      particlesEnabled: true,
    },
  });

  // Keep stateRef settings synced
  useEffect(() => {
    stateRef.current.settings = settings;
    stateRef.current.cameraMode = settings.cameraMode;
    const cam = stateRef.current.camera;
    if (cam) {
      cam.fov = isAimingDownSights ? 40 : settings.fov;
      cam.updateProjectionMatrix();
    }
  }, [settings, isAimingDownSights]);

  // Countdown timer before match starts
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      sound.playClick();
      const timer = setTimeout(() => {
        setCountdown(c => (c !== null ? c - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      sound.playDiamondChime();
      const timer = setTimeout(() => {
        setCountdown(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Safe zone contraction timer
  useEffect(() => {
    if (mode !== 'BATTLE_ROYALE' || matchOver || countdown !== null) return;
    const interval = setInterval(() => {
      setZoneTimer(prev => {
        if (prev <= 1) {
          const s = stateRef.current;
          s.safeZone.isShrinking = true;
          s.safeZone.targetRadius = Math.max(25, s.safeZone.radius * 0.6);
          sound.playZoneWarning();
          return 40;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, matchOver, countdown]);

  // Weapon switch handler
  const switchWeapon = useCallback((slot: ArsenalSlot) => {
    if (activeWeaponSlot === slot || isReloading) return;
    sound.playClick();
    setActiveWeaponSlot(slot);

    let w: Weapon;
    switch (slot) {
      case 'primary': w = primaryWeapon; break;
      case 'secondary': w = secondaryWeapon; break;
      case 'sidearm': w = sidearmWeapon; break;
      case 'melee': w = meleeWeapon; break;
      case 'grenade': w = grenadeWeapon; break;
    }
    setAmmoInMag(w.magazineSize);

    // Rebuild 3D Viewmodel for new weapon
    const s = stateRef.current;
    if (s.camera && s.viewModel) {
      s.camera.remove(s.viewModel.root);
      s.viewModel = new FPSViewModel(character, w);
      s.camera.add(s.viewModel.root);
      if (s.cameraMode === 'third_person') {
        s.viewModel.root.visible = false;
      }
    }
  }, [activeWeaponSlot, isReloading, primaryWeapon, secondaryWeapon, character]);

  // Reload handler
  const triggerReload = useCallback(() => {
    if (isReloading || ammoInMag >= currentWeapon.magazineSize || reserveAmmo <= 0) return;
    setIsReloading(true);
    sound.playReload();

    setTimeout(() => {
      const needed = currentWeapon.magazineSize - ammoInMag;
      const toLoad = Math.min(needed, reserveAmmo);
      setAmmoInMag(a => a + toLoad);
      setReserveAmmo(r => r - toLoad);
      setIsReloading(false);
    }, currentWeapon.reloadTime * 1000);
  }, [isReloading, ammoInMag, currentWeapon, reserveAmmo]);

  // Roblox Jump Handler
  const triggerJump = useCallback(() => {
    const s = stateRef.current;
    if (s.isGrounded && !inVehicle) {
      s.jumpVelocity = 8.4;
      s.isGrounded = false;
      setIsGrounded(false);
      sound.playJumpSound();
    }
  }, [inVehicle]);

  // Roblox Crouch Handler
  const toggleCrouch = useCallback(() => {
    setIsCrouching(prev => {
      const next = !prev;
      stateRef.current.isCrouching = next;
      return next;
    });
    sound.playClick();
  }, []);

  // Camera perspective toggle (1P FPS / 3P OTS)
  const toggleCameraMode = useCallback(() => {
    setSettings(prev => {
      const nextMode = prev.cameraMode === 'first_person' ? 'third_person' : 'first_person';
      stateRef.current.cameraMode = nextMode;
      sound.playClick();
      return { ...prev, cameraMode: nextMode };
    });
  }, []);

  // Vehicle toggle handler
  const toggleVehicle = useCallback(() => {
    const s = stateRef.current;
    if (inVehicle) {
      setInVehicle(false);
      s.playerPos.y = 1.7;
      sound.playClick();
    } else {
      let foundVehicle = false;
      s.worldObjects.forEach(obj => {
        if (obj.type === 'vehicle') {
          const dist = s.playerPos.distanceTo(obj.position);
          if (dist < 5.0) {
            setInVehicle(true);
            setVehicleHealth(defaultVehicle.durability);
            sound.playVehicleEngine();
            foundVehicle = true;
          }
        }
      });
    }
  }, [inVehicle, defaultVehicle]);

  // Loot Airdrop Handler
  const lootNearbyAirdrop = useCallback(() => {
    const s = stateRef.current;
    s.worldObjects.forEach(obj => {
      if (obj.type === 'crate') {
        const dist = s.playerPos.distanceTo(obj.position);
        if (dist < 4.0) {
          sound.playDiamondChime();
          setArmor(100);
          setReserveAmmo(r => r + 90);
          setSupplies(sup => ({
            ...sup,
            medkits: sup.medkits + 2,
            armorPlates: sup.armorPlates + 2,
          }));
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
      }
    });
  }, []);

  // Medical & Consumables Handlers from Backpack
  const handleUseMedkit = useCallback(() => {
    if (supplies.medkits <= 0) return;
    setSupplies(s => ({ ...s, medkits: s.medkits - 1 }));
    setHealth(h => Math.min(character.hp, h + 50));
  }, [supplies.medkits, character.hp]);

  const handleUseArmorPlate = useCallback(() => {
    if (supplies.armorPlates <= 0) return;
    setSupplies(s => ({ ...s, armorPlates: s.armorPlates - 1 }));
    setArmor(a => Math.min(100, a + 50));
  }, [supplies.armorPlates]);

  const handleUseAdrenaline = useCallback(() => {
    if (supplies.adrenaline <= 0) return;
    setSupplies(s => ({ ...s, adrenaline: s.adrenaline - 1 }));
    setHealth(h => Math.min(character.hp, h + 35));
    stateRef.current.keys['shift'] = true;
    setTimeout(() => {
      stateRef.current.keys['shift'] = false;
    }, 10000);
  }, [supplies.adrenaline, character.hp]);

  const handleUseEnergyDrink = useCallback(() => {
    if (supplies.energyDrinks <= 0) return;
    setSupplies(s => ({ ...s, energyDrinks: s.energyDrinks - 1 }));
    setHealth(h => Math.min(character.hp, h + 25));
  }, [supplies.energyDrinks, character.hp]);

  // Pointer Lock Controls & Input Listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerLockChange = () => {
      stateRef.current.isPointerLocked = document.pointerLockElement === container;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isPointerLocked) return;
      const sensitivity = 0.0022 * stateRef.current.settings.sensitivity;
      const s = stateRef.current;
      s.yaw -= e.movementX * sensitivity;
      s.pitch -= e.movementY * sensitivity;
      s.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, s.pitch));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      stateRef.current.keys[k] = true;
      if (e.key === '1') switchWeapon('primary');
      if (e.key === '2') switchWeapon('secondary');
      if (e.key === '3') switchWeapon('sidearm');
      if (e.key === '4') switchWeapon('melee');
      if (e.key === '5' || k === 'g') switchWeapon('grenade');
      if (k === 'r') triggerReload();
      if (k === 'e') {
        toggleVehicle();
        lootNearbyAirdrop();
      }
      if (k === 'b' || k === 'tab') setIsBackpackOpen(prev => !prev);
      if (k === 'v') toggleCameraMode();
      if (e.code === 'Space') {
        e.preventDefault();
        triggerJump();
      }
      if (k === 'c') toggleCrouch();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.target && (e.target as HTMLElement).closest('button, .interactive-hud, input')) {
        return;
      }
      if (!stateRef.current.isPointerLocked) {
        container.requestPointerLock();
        return;
      }
      if (e.button === 0) {
        stateRef.current.keys['mouse0'] = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.keys['mouse0'] = false;
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [switchWeapon, triggerReload, toggleVehicle, lootNearbyAirdrop, toggleCameraMode, triggerJump, toggleCrouch]);

  // Main Three.js Scene Setup & 60fps Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    stateRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(settings.fov, container.clientWidth / container.clientHeight, 0.1, 800);
    camera.position.set(0, 1.7, 0);
    stateRef.current.camera = camera;
    scene.add(camera);

    // 2. ROBLOX FUTURE-LIGHTING RENDERER WITH ACES FILMIC TONE MAPPING
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // Dynamic Muzzle Light for illumination when firing
    const muzzleLight = new THREE.PointLight(0xf59e0b, 0, 18);
    scene.add(muzzleLight);
    stateRef.current.muzzleLight = muzzleLight;

    // 3. BUILD 3D DATING FOREST WORLD WITH ROBLOX SKY & BEACONS
    const worldObjects = buildForestWorld(scene, mapEnv);
    stateRef.current.worldObjects = worldObjects;

    // 4. ATTACH FIRST-PERSON VIEWMODEL (Hands & Gun)
    const viewModel = new FPSViewModel(character, currentWeapon);
    stateRef.current.viewModel = viewModel;
    camera.add(viewModel.root);

    // 5. ATTACH PLAYER 3D MODEL FOR ROBLOX THIRD-PERSON OVER-THE-SHOULDER PERSPECTIVE
    const playerModel = new RealCharacterModel(character, false);
    scene.add(playerModel.root);
    stateRef.current.playerModel = playerModel;
    if (stateRef.current.cameraMode === 'first_person') {
      playerModel.root.visible = false;
    }

    // 6. SPAWN VISIBLE 3D ANIME OPPONENTS IN THE FOREST
    const enemyCount = mode === 'LONE_WOLF' ? 1 : mode === 'CLASH_SQUAD' ? 7 : 19;
    const enemies: RealCharacterModel[] = [];

    for (let i = 0; i < enemyCount; i++) {
      const botChar = FULL_250_CHARACTERS[(i + 15) % FULL_250_CHARACTERS.length];
      const enemyModel = new RealCharacterModel(botChar, true);

      const angle = (Math.PI * 2 * i) / enemyCount;
      const dist = mode === 'LONE_WOLF' ? 28 : 35 + Math.random() * 85;
      const ex = Math.cos(angle) * dist;
      const ez = Math.sin(angle) * dist;

      enemyModel.root.position.set(ex, 0, ez);
      enemyModel.root.rotation.y = Math.atan2(-ex, -ez);
      scene.add(enemyModel.root);
      enemies.push(enemyModel);
    }
    stateRef.current.enemyCharacters = enemies;

    // 7. SAFE ZONE 3D CYLINDER
    const zoneGeom = new THREE.CylinderGeometry(160, 160, 120, 48, 1, true);
    const zoneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const zoneMesh = new THREE.Mesh(zoneGeom, zoneMat);
    zoneMesh.position.y = 50;
    scene.add(zoneMesh);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 8. GAME LOOP
    let animId: number;

    const gameLoop = (timestamp: number) => {
      const s = stateRef.current;
      const dt = Math.min(32, timestamp - s.lastFrameTime) / 1000;
      s.lastFrameTime = timestamp;

      // Only move & shoot once countdown is finished
      if (countdown === null && !matchOver) {
        // Player Movement in First-Person / Third-Person
        let moveSpeed = inVehicle ? defaultVehicle.maxSpeed * 2.2 : character.speed;
        if (s.isCrouching) moveSpeed *= 0.65;
        if (s.keys['shift']) moveSpeed *= 1.35; // Tactical sprint

        const moveDir = new THREE.Vector3();
        if (s.keys['w'] || s.keys['arrowup']) moveDir.z -= 1;
        if (s.keys['s'] || s.keys['arrowdown']) moveDir.z += 1;
        if (s.keys['a'] || s.keys['arrowleft']) moveDir.x -= 1;
        if (s.keys['d'] || s.keys['arrowright']) moveDir.x += 1;

        if (Math.abs(s.touchMoveVector.x) > 0.05 || Math.abs(s.touchMoveVector.y) > 0.05) {
          moveDir.x += s.touchMoveVector.x;
          moveDir.z += s.touchMoveVector.y;
        }

        const isMoving = moveDir.lengthSq() > 0;
        if (isMoving) {
          moveDir.normalize();
          moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), s.yaw);
          s.playerPos.x += moveDir.x * moveSpeed * dt;
          s.playerPos.z += moveDir.z * moveSpeed * dt;
        }

        // Jump & Gravity Physics
        const targetGroundY = s.isCrouching ? 1.2 : 1.7;
        if (!s.isGrounded || s.jumpVelocity !== 0) {
          s.playerPos.y += s.jumpVelocity * dt;
          s.jumpVelocity -= 22.0 * dt;
          if (s.playerPos.y <= targetGroundY) {
            s.playerPos.y = targetGroundY;
            if (!s.isGrounded) {
              sound.playLandSound();
            }
            s.isGrounded = true;
            s.jumpVelocity = 0;
            setIsGrounded(true);
          }
        } else {
          s.playerPos.y = targetGroundY;
        }

        // Clamp to forest bounds
        s.playerPos.x = Math.max(-165, Math.min(165, s.playerPos.x));
        s.playerPos.z = Math.max(-165, Math.min(165, s.playerPos.z));

        // Update Camera based on Roblox Perspective Mode (FPS vs OTS 3rd Person)
        if (s.cameraMode === 'third_person') {
          // Hide 1P viewmodel, show 3P player model
          if (s.viewModel) s.viewModel.root.visible = false;
          if (s.playerModel) {
            s.playerModel.root.visible = true;
            s.playerModel.root.position.set(s.playerPos.x, s.playerPos.y - 1.7, s.playerPos.z);
            s.playerModel.root.rotation.y = s.yaw;
            s.playerModel.updateAnimation(timestamp / 1000, isMoving, !s.isGrounded, s.isCrouching);
          }

          // Roblox OTS Over-the-shoulder Camera
          const shoulderRight = 0.55;
          const shoulderDist = 2.7;
          const shoulderHeight = 0.45;
          const camX = s.playerPos.x - Math.sin(s.yaw) * shoulderDist + Math.cos(s.yaw) * shoulderRight;
          const camZ = s.playerPos.z - Math.cos(s.yaw) * shoulderDist - Math.sin(s.yaw) * shoulderRight;
          const camY = s.playerPos.y + shoulderHeight - Math.sin(s.pitch) * 0.8;
          camera.position.set(camX, inVehicle ? 2.8 : camY, camZ);
          camera.rotation.order = 'YXZ';
          camera.rotation.y = s.yaw;
          camera.rotation.x = s.pitch;
        } else {
          // First-Person Mode
          if (s.playerModel) s.playerModel.root.visible = false;
          if (s.viewModel) {
            s.viewModel.root.visible = true;
            s.viewModel.update(dt, isMoving, s.pitch);
          }
          camera.position.set(s.playerPos.x, inVehicle ? 2.4 : s.playerPos.y, s.playerPos.z);
          camera.rotation.order = 'YXZ';
          camera.rotation.y = s.yaw;
          camera.rotation.x = s.pitch;
        }

        // Check if near any vehicle or airdrop crate for prompt
        let nearVeh = false;
        let nearCrate = false;
        s.worldObjects.forEach(obj => {
          const dist = s.playerPos.distanceTo(obj.position);
          if (obj.type === 'vehicle' && dist < 5.0) nearVeh = true;
          if (obj.type === 'crate' && dist < 4.0) nearCrate = true;
        });
        setNearbyVehiclePrompt(nearVeh);
        setNearbyAirdropPrompt(nearCrate);

        // Safe zone shrinkage & damage
        if (mode === 'BATTLE_ROYALE') {
          if (s.safeZone.isShrinking && s.safeZone.radius > s.safeZone.targetRadius) {
            s.safeZone.radius -= 0.15 * dt * 60;
            zoneMesh.scale.set(s.safeZone.radius / 160, 1, s.safeZone.radius / 160);
          }
          const distToCenter = Math.hypot(s.playerPos.x - s.safeZone.center.x, s.playerPos.z - s.safeZone.center.z);
          if (distToCenter > s.safeZone.radius) {
            setInGasWarning(true);
            if (Math.random() < 0.05) {
              setHealth(h => {
                const next = h - 3;
                if (next <= 0) {
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

        // Player Shooting
        const isTriggeringShoot = s.keys['mouse0'] || s.isFiringTouch || s.keys['f'];
        if (isTriggeringShoot && !inVehicle && !isReloading) {
          const fireInterval = 60000 / currentWeapon.fireRate;
          if (timestamp - s.lastShotTime >= fireInterval) {
            if (ammoInMag > 0) {
              s.lastShotTime = timestamp;
              setAmmoInMag(a => a - 1);
              sound.playGunshot(currentWeapon.soundType);

              if (s.viewModel && s.cameraMode === 'first_person') {
                s.viewModel.triggerRecoil();
              }

              // Dynamic Muzzle Flash Light
              if (s.muzzleLight) {
                s.muzzleLight.intensity = 4.0;
                s.muzzleLight.position.copy(camera.position);
                setTimeout(() => {
                  if (s.muzzleLight) s.muzzleLight.intensity = 0;
                }, 40);
              }

              // Fire forward ray / bullet from camera
              const shootDir = new THREE.Vector3();
              camera.getWorldDirection(shootDir);

              // Add recoil spread (reduced when crouching)
              const recoilFactor = s.isCrouching ? 0.55 : 1.0;
              shootDir.x += (Math.random() - 0.5) * currentWeapon.recoil * 0.18 * recoilFactor;
              shootDir.y += (Math.random() - 0.5) * currentWeapon.recoil * 0.18 * recoilFactor;
              shootDir.normalize();

              // Create glowing projectile with tracer trail
              const bulletGeom = new THREE.SphereGeometry(0.12, 8, 8);
              const bulletMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
              const bulletMesh = new THREE.Mesh(bulletGeom, bulletMat);
              bulletMesh.position.copy(camera.position).addScaledVector(shootDir, 0.8);
              scene.add(bulletMesh);

              s.bullets.push({
                mesh: bulletMesh,
                velocity: shootDir.multiplyScalar(currentWeapon.bulletSpeed * 4.5),
                damage: currentWeapon.damage,
                life: 3.5,
                isPlayer: true,
              });
            } else {
              sound.playClick();
              triggerReload();
            }
          }
        }

        // Update Bullets & Hit Impacts
        s.bullets = s.bullets.filter(b => {
          b.mesh.position.addScaledVector(b.velocity, dt);
          b.life -= dt;

          if (b.life <= 0) {
            scene.remove(b.mesh);
            return false;
          }

          // Bullet vs Enemy Characters
          if (b.isPlayer) {
            for (const enemy of s.enemyCharacters) {
              if (enemy.isAlive) {
                const enemyPos = enemy.root.position;
                if (b.mesh.position.distanceTo(enemyPos) < 1.6) {
                  // Hit!
                  const isHeadshot = b.mesh.position.y > 1.45;
                  const finalDmg = isHeadshot ? b.damage * 2.2 : b.damage;

                  enemy.health -= finalDmg;
                  sound.playDamageTick(isHeadshot);
                  setPlayerDamage(d => d + Math.round(finalDmg));

                  // Spawn Roblox-style 3D Floating Damage Numbers
                  if (s.settings.showDamageNumbers) {
                    setDamagePopups(prev => [
                      ...prev.slice(-10),
                      {
                        id: Math.random().toString(),
                        damage: Math.round(finalDmg),
                        isHeadshot,
                        worldPos: b.mesh.position.clone(),
                        createdAt: performance.now(),
                        screenPos: { x: 0, y: 0, visible: true },
                      }
                    ]);
                  }

                  // Spawn Roblox-style Hit Sparks
                  if (s.settings.particlesEnabled) {
                    for (let sp = 0; sp < 6; sp++) {
                      const sparkGeom = new THREE.SphereGeometry(0.04, 4, 4);
                      const sparkMat = new THREE.MeshBasicMaterial({ color: isHeadshot ? 0xef4444 : 0xfacc15 });
                      const sparkMesh = new THREE.Mesh(sparkGeom, sparkMat);
                      sparkMesh.position.copy(b.mesh.position);
                      scene.add(sparkMesh);

                      const sparkVel = new THREE.Vector3(
                        (Math.random() - 0.5) * 8,
                        Math.random() * 6 + 1,
                        (Math.random() - 0.5) * 8
                      );
                      s.sparks.push({ mesh: sparkMesh, velocity: sparkVel, life: 0.35 });
                    }
                  }

                  if (enemy.health <= 0) {
                    enemy.isAlive = false;
                    enemy.root.rotation.x = Math.PI / 2;
                    enemy.root.position.y = 0.2;

                    setPlayerKills(k => k + 1);
                    setKillStreak(st => {
                      const nextStreak = st + 1;
                      let streakName = undefined;
                      if (nextStreak === 2) streakName = 'DOUBLE KILL!';
                      else if (nextStreak === 3) streakName = 'TRIPLE KILL!';
                      else if (nextStreak === 4) streakName = 'MEGA KILL!';
                      else if (nextStreak >= 5) streakName = 'UNSTOPPABLE RAMPAGE!';

                      // Roblox Elimination Banner
                      setEliminationBanner({
                        killer: character.name,
                        victim: enemy.characterData.name,
                        streakName,
                        isHeadshot,
                      });
                      setTimeout(() => setEliminationBanner(null), 2400);

                      sound.playStreakFanfare();
                      return nextStreak;
                    });

                    setAlivePlayers(p => {
                      const next = p - 1;
                      if (next <= 1) {
                        setMatchOver(true);
                        setMatchWon(true);
                        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                        sound.playVictory();
                      }
                      return next;
                    });

                    // Add killfeed entry
                    setKillFeed(prev => [
                      {
                        id: Math.random().toString(),
                        killer: character.name,
                        victim: enemy.characterData.name,
                        weapon: currentWeapon.name,
                      },
                      ...prev.slice(0, 4),
                    ]);
                  }
                  scene.remove(b.mesh);
                  return false;
                }
              }
            }
          } else {
            // Enemy bullet hit player
            if (b.mesh.position.distanceTo(s.playerPos) < 1.2) {
              sound.playHitmarker(false);
              setArmor(currArmor => {
                if (currArmor > 0) {
                  const remaining = currArmor - b.damage * 0.7;
                  if (remaining < 0) {
                    setHealth(h => Math.max(0, h + remaining));
                  }
                  return Math.max(0, remaining);
                } else {
                  setHealth(h => {
                    const next = h - b.damage;
                    if (next <= 0) {
                      setMatchOver(true);
                      setMatchWon(false);
                      sound.playDefeatSound();
                    }
                    return Math.max(0, next);
                  });
                  return 0;
                }
              });
              scene.remove(b.mesh);
              return false;
            }
          }

          return true;
        });

        // Update Hit Sparks
        s.sparks = s.sparks.filter(spark => {
          spark.mesh.position.addScaledVector(spark.velocity, dt);
          spark.velocity.y -= 14 * dt; // gravity
          spark.life -= dt;
          if (spark.life <= 0) {
            scene.remove(spark.mesh);
            return false;
          }
          return true;
        });

        // Project Roblox 3D Damage Numbers to Screen
        if (s.settings.showDamageNumbers) {
          const now = performance.now();
          const winW = container.clientWidth;
          const winH = container.clientHeight;
          const tempVec = new THREE.Vector3();

          setDamagePopups(prev => {
            if (prev.length === 0) return prev;
            return prev
              .filter(p => now - p.createdAt < 1200)
              .map(p => {
                const elapsed = (now - p.createdAt) / 1000;
                tempVec.copy(p.worldPos);
                tempVec.y += elapsed * 1.8;
                tempVec.project(camera);

                const isBehind = tempVec.z > 1;
                const x = (tempVec.x * 0.5 + 0.5) * winW;
                const y = (-(tempVec.y * 0.5) + 0.5) * winH;

                return {
                  ...p,
                  screenPos: {
                    x,
                    y,
                    visible: !isBehind && tempVec.z >= -1 && tempVec.z <= 1,
                  },
                };
              });
          });
        }

        // AI Enemy Behaviors & Animation in Forest
        const timeSec = timestamp / 1000;
        s.enemyCharacters.forEach(enemy => {
          if (!enemy.isAlive) return;

          const dirToPlayer = new THREE.Vector3().subVectors(s.playerPos, enemy.root.position);
          const distToPlayer = dirToPlayer.length();

          enemy.root.rotation.y = Math.atan2(dirToPlayer.x, dirToPlayer.z);

          if (distToPlayer > 18) {
            dirToPlayer.normalize();
            enemy.root.position.x += dirToPlayer.x * 2.2 * dt;
            enemy.root.position.z += dirToPlayer.z * 2.2 * dt;
            enemy.updateAnimation(timeSec, true, false, false);
          } else {
            enemy.updateAnimation(timeSec, false, false, false);
            if (Math.random() < 0.02) {
              sound.playGunshot('ar');
              const enemyBulletGeom = new THREE.SphereGeometry(0.1, 6, 6);
              const enemyBulletMesh = new THREE.Mesh(
                enemyBulletGeom,
                new THREE.MeshBasicMaterial({ color: 0xef4444 })
              );
              enemyBulletMesh.position.set(
                enemy.root.position.x,
                1.5,
                enemy.root.position.z
              );
              scene.add(enemyBulletMesh);

              const bulletVel = dirToPlayer.normalize().multiplyScalar(35);
              s.bullets.push({
                mesh: enemyBulletMesh,
                velocity: bulletVel,
                damage: 14,
                life: 3.0,
                isPlayer: false,
              });
            }
          }
        });
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [countdown, matchOver, character, currentWeapon, defaultVehicle, mapEnv, mode, settings]);

  // Touch look on mobile right side
  const touchLookRef = useRef({ startX: 0, startY: 0, active: false });

  const handleTouchLookStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchLookRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        active: true,
      };
    }
  };

  const handleTouchLookMove = (e: React.TouchEvent) => {
    if (!touchLookRef.current.active || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - touchLookRef.current.startX;
    const dy = e.touches[0].clientY - touchLookRef.current.startY;
    touchLookRef.current.startX = e.touches[0].clientX;
    touchLookRef.current.startY = e.touches[0].clientY;

    const s = stateRef.current;
    s.yaw -= dx * 0.005 * s.settings.sensitivity;
    s.pitch -= dy * 0.005 * s.settings.sensitivity;
    s.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, s.pitch));
  };

  const handleTouchLookEnd = () => {
    touchLookRef.current.active = false;
  };

  // Virtual Joystick handlers for mobile moving controller
  const joystickCenterRef = useRef({ x: 0, y: 0 });
  const [joystickThumb, setJoystickThumb] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);

  const handleJoystickStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joystickCenterRef.current = { x: centerX, y: centerY };
    setIsJoystickActive(true);
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    if (!isJoystickActive || e.touches.length === 0) return;
    e.stopPropagation();
    const touch = e.touches[0];
    const dx = touch.clientX - joystickCenterRef.current.x;
    const dy = touch.clientY - joystickCenterRef.current.y;
    const maxRadius = 45;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    setJoystickThumb({ x: thumbX, y: thumbY });

    stateRef.current.touchMoveVector = {
      x: thumbX / maxRadius,
      y: thumbY / maxRadius,
    };
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsJoystickActive(false);
    setJoystickThumb({ x: 0, y: 0 });
    stateRef.current.touchMoveVector = { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full h-screen bg-black text-slate-100 select-none overflow-hidden font-sans">
      {/* 3D WEBGL CANVAS CONTAINER */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-crosshair"
        onTouchStart={handleTouchLookStart}
        onTouchMove={handleTouchLookMove}
        onTouchEnd={handleTouchLookEnd}
      />

      {/* ROBLOX FLOATING 3D DAMAGE NUMBERS OVERLAY */}
      {settings.showDamageNumbers && damagePopups.map(popup => {
        if (!popup.screenPos.visible) return null;
        return (
          <div
            key={popup.id}
            style={{
              left: `${popup.screenPos.x}px`,
              top: `${popup.screenPos.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
            className={`absolute pointer-events-none z-30 font-military font-extrabold tracking-wider animate-in fade-in zoom-in duration-100 ${
              popup.isHeadshot
                ? 'text-red-500 text-2xl md:text-3xl drop-shadow-[0_2px_10px_rgba(239,68,68,0.9)]'
                : 'text-amber-300 text-lg md:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]'
            }`}
          >
            {popup.isHeadshot ? `💥 -${popup.damage} CRITICAL!` : `-${popup.damage}`}
          </div>
        );
      })}

      {/* ROBLOX ELIMINATION & STREAK BANNER */}
      {eliminationBanner && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-1 animate-in zoom-in-95 slide-in-from-top-4 duration-150">
          <div className="px-5 py-2 rounded-xl bg-black/85 border-2 border-amber-400 shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <Award className="w-6 h-6 text-amber-400 animate-bounce" />
            <div className="text-center">
              <div className="text-xs font-tactical font-bold text-emerald-400 uppercase tracking-widest">
                +100 ELIMINATED
              </div>
              <div className="font-military text-lg md:text-xl text-white">
                {eliminationBanner.victim}
              </div>
            </div>
            {eliminationBanner.isHeadshot && (
              <span className="px-2 py-0.5 bg-red-600/30 border border-red-500 text-red-400 text-[10px] font-bold font-military rounded">
                🎯 HEADSHOT
              </span>
            )}
          </div>

          {eliminationBanner.streakName && (
            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white font-military text-sm font-extrabold shadow-lg animate-pulse">
              🔥 {eliminationBanner.streakName}
            </div>
          )}
        </div>
      )}

      {/* MATCH COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto">
          <div className="text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 font-tactical font-bold text-xs uppercase tracking-widest">
              DEPLOYING INTO SUNNY MORNING BATTLEGROUND
            </div>
            <h2 className="font-military text-4xl md:text-6xl text-white tracking-widest">
              {mode.replace('_', ' ')}
            </h2>
            <div className="text-8xl md:text-9xl font-military text-amber-400 font-extrabold animate-pulse">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-xs md:text-sm text-slate-300 font-tactical max-w-md mx-auto">
              Hold the on-screen <b className="text-amber-400">FORWARD [▲]</b> button or press <b className="text-amber-400">W</b>. Tap <b className="text-amber-400">[🦘 JUMP]</b> to leap, and press <b className="text-cyan-400">[V]</b> for 3rd-person Roblox OTS camera!
            </p>
          </div>
        </div>
      )}

      {/* IN-GAME TOP HUD: MATCH STATS, SAFE ZONE, ALIVE PLAYERS */}
      <div className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex items-center justify-between">
        {/* Left: Alive count & Game mode */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-black/75 backdrop-blur-md border border-slate-800 rounded-lg flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-tactical font-bold text-slate-300">ALIVE:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{alivePlayers}</span>
          </div>

          <div className="px-3 py-1.5 bg-black/75 backdrop-blur-md border border-slate-800 rounded-lg flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-tactical font-bold text-slate-300">KILLS:</span>
            <span className="text-sm font-mono font-bold text-amber-400">{playerKills}</span>
            {killStreak > 1 && (
              <span className="text-[10px] bg-red-600/30 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold">
                x{killStreak}
              </span>
            )}
          </div>
        </div>

        {/* Center: Safe zone timer & warning */}
        {mode === 'BATTLE_ROYALE' && (
          <div className="flex items-center gap-2">
            <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 backdrop-blur-md ${
              inGasWarning
                ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                : 'bg-black/75 border-slate-800 text-slate-300'
            }`}>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-tactical font-bold">
                {inGasWarning ? 'DANGER: OUTSIDE SAFE ZONE' : `SAFE ZONE: ${zoneTimer}s`}
              </span>
            </div>
          </div>
        )}

        {/* Right: Camera toggle, Roblox Settings, Audio mute, Exit Match */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* CAMERA PERSPECTIVE TOGGLE BUTTON (1P / 3P) */}
          <button
            onClick={toggleCameraMode}
            className={`px-3 py-1.5 rounded-lg border text-xs font-tactical font-bold flex items-center gap-1.5 transition-all ${
              settings.cameraMode === 'third_person'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                : 'bg-black/80 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Toggle between First Person (FPS) and Third Person (Roblox OTS) [V]"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>{settings.cameraMode === 'third_person' ? '3P OTS' : '1P FPS'}</span>
          </button>

          {/* ROBLOX ENGINE SETTINGS BUTTON */}
          <button
            onClick={() => {
              sound.playClick();
              setIsSettingsOpen(true);
            }}
            className="p-2 bg-black/80 border border-slate-800 hover:border-amber-400 rounded-lg text-slate-300 transition-colors"
            title="Open Roblox Engine & Graphics Settings"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => {
              sound.isMuted = !sound.isMuted;
              setIsMuted(sound.isMuted);
            }}
            className="p-2 bg-black/80 border border-slate-800 hover:border-amber-400 rounded-lg text-slate-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => onExitMatch({ kills: playerKills, damage: playerDamage, won: matchWon, place: alivePlayers })}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 border border-red-500/80 text-white font-tactical font-bold text-xs rounded-lg transition-colors"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* KILLFEED NOTIFICATIONS */}
      <div className="absolute top-16 right-4 z-30 pointer-events-none space-y-1.5 w-64">
        {killFeed.map(feed => (
          <div
            key={feed.id}
            className="px-3 py-1 bg-black/80 border border-slate-800 rounded-lg text-xs font-tactical flex items-center justify-between text-slate-300 animate-in slide-in-from-right duration-200"
          >
            <span className="font-bold text-amber-400">{feed.killer}</span>
            <span className="text-[10px] text-slate-500 font-mono">[{feed.weapon}]</span>
            <span className="text-red-400">{feed.victim}</span>
          </div>
        ))}
      </div>

      {/* CENTER CROSSHAIR */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute w-2.5 h-0.5 bg-amber-400 -left-2.5 rounded-full" />
          <div className="absolute w-2.5 h-0.5 bg-amber-400 -right-2.5 rounded-full" />
          <div className="absolute h-2.5 w-0.5 bg-amber-400 -top-2.5 rounded-full" />
          <div className="absolute h-2.5 w-0.5 bg-amber-400 -bottom-2.5 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-md" />
        </div>
      </div>

      {/* AIRDROP LOOT PROMPT */}
      {nearbyAirdropPrompt && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-6 z-30 pointer-events-auto">
          <button
            onClick={lootNearbyAirdrop}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-military font-bold text-sm rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border-2 border-amber-300"
          >
            <Package className="w-5 h-5 text-black" />
            <span>LOOT AIRDROP SUPPLY CRATE [E]</span>
          </button>
        </div>
      )}

      {/* VEHICLE ENTER PROMPT */}
      {nearbyVehiclePrompt && !inVehicle && !nearbyAirdropPrompt && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-14 z-30 pointer-events-auto">
          <button
            onClick={toggleVehicle}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded-full shadow-lg flex items-center gap-2 animate-bounce"
          >
            <Car className="w-4 h-4" />
            <span>PRESS [E] OR CLICK TO DRIVE JEEP</span>
          </button>
        </div>
      )}

      {inVehicle && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 z-30 pointer-events-auto">
          <button
            onClick={toggleVehicle}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-tactical font-bold text-xs rounded-full shadow-lg flex items-center gap-2"
          >
            <Car className="w-4 h-4" />
            <span>EXIT VEHICLE [E]</span>
          </button>
        </div>
      )}

      {/* BOTTOM LEFT CORNER: WHAT GUNS I AM HAVING + ACTIVE WEAPON + BACKPACK */}
      <div className="absolute bottom-3 left-3 z-30 pointer-events-auto max-w-sm md:max-w-md space-y-2">
        {/* ACTIVE GUN DETAILED HUD CARD */}
        <div className="p-3 bg-black/85 backdrop-blur-md border border-amber-500/50 rounded-xl shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-black border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-military text-sm shadow-inner">
              {currentWeapon.category}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-military text-base md:text-lg text-white tracking-wide">
                  {currentWeapon.name}
                </span>
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-tactical font-bold rounded">
                  {currentWeapon.skins[0]?.name || 'Standard'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-tactical text-slate-400 mt-0.5">
                <span>DMG: <b className="text-white">{currentWeapon.damage}</b></span>
                <span>MODE: <b className="text-emerald-400">AUTO</b></span>
                <span>RECOIL: <b className="text-slate-300">{isCrouching ? 'MINIMAL' : 'LOW'}</b></span>
              </div>
            </div>
          </div>

          {/* AMMO COUNTER & RELOAD BUTTON */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-baseline gap-1 font-mono">
              <span className={`text-2xl md:text-3xl font-extrabold ${ammoInMag <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                {ammoInMag}
              </span>
              <span className="text-xs text-slate-500 font-bold">/ {reserveAmmo}</span>
            </div>
            <button
              onClick={() => triggerReload()}
              disabled={isReloading || ammoInMag >= currentWeapon.magazineSize}
              className={`px-2 py-0.5 rounded text-[10px] font-tactical font-bold flex items-center gap-1 transition-all ${
                isReloading
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isReloading ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isReloading ? 'RELOADING...' : 'RELOAD [R]'}</span>
            </button>
          </div>
        </div>

        {/* ARSENAL STRIP + BACKPACK BUTTON */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => {
              sound.playClick();
              setIsBackpackOpen(true);
            }}
            className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black rounded-lg font-tactical font-bold text-xs flex items-center gap-1.5 shadow-lg border border-amber-400 transition-all hover:scale-105"
            title="Open Backpack & Inventory"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">BACKPACK</span>
            <span className="text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded">
              Lvl 3
            </span>
          </button>

          {/* SLOT 1 */}
          <button
            onClick={() => switchWeapon('primary')}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-tactical flex items-center gap-1.5 transition-all ${
              activeWeaponSlot === 'primary'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400'
                : 'bg-black/70 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="font-mono text-[10px] text-amber-400 font-bold">[1]</span>
            <span className="font-bold truncate max-w-[80px]">{primaryWeapon.name}</span>
          </button>

          {/* SLOT 2 */}
          <button
            onClick={() => switchWeapon('secondary')}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-tactical flex items-center gap-1.5 transition-all ${
              activeWeaponSlot === 'secondary'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400'
                : 'bg-black/70 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="font-mono text-[10px] text-cyan-400 font-bold">[2]</span>
            <span className="font-bold truncate max-w-[80px]">{secondaryWeapon.name}</span>
          </button>

          {/* SLOT 3 */}
          <button
            onClick={() => switchWeapon('sidearm')}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-tactical flex items-center gap-1.5 transition-all ${
              activeWeaponSlot === 'sidearm'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md ring-1 ring-purple-400'
                : 'bg-black/70 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="font-mono text-[10px] text-purple-400 font-bold">[3]</span>
            <span className="font-bold">Deagle</span>
          </button>

          {/* SLOT 4 */}
          <button
            onClick={() => switchWeapon('melee')}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-tactical flex items-center gap-1.5 transition-all ${
              activeWeaponSlot === 'melee'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md ring-1 ring-emerald-400'
                : 'bg-black/70 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="font-mono text-[10px] text-emerald-400 font-bold">[4]</span>
            <span className="font-bold">Katana</span>
          </button>

          {/* SLOT 5 */}
          <button
            onClick={() => switchWeapon('grenade')}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-tactical flex items-center gap-1.5 transition-all ${
              activeWeaponSlot === 'grenade'
                ? 'bg-red-500/20 border-red-400 text-red-300 shadow-md ring-1 ring-red-400'
                : 'bg-black/70 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="font-mono text-[10px] text-red-400 font-bold">[G]</span>
            <span className="font-bold">Frag x3</span>
          </button>
        </div>

        {/* HEALTH & ARMOR BARS */}
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm p-2 rounded-lg border border-slate-800">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-tactical mb-0.5">
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Heart className="w-3 h-3" /> HP
              </span>
              <span className="font-mono text-white">{health} / {character.hp}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-red-500/30">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                style={{ width: `${(health / character.hp) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-tactical mb-0.5">
              <span className="text-blue-400 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> ARMOR
              </span>
              <span className="font-mono text-white">{armor} / 100</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-blue-500/30">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-200"
                style={{ width: `${(armor / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CENTER BOTTOM: FORWARD BUTTON & ROBLOX MOVEMENT DOCK (JUMP, CROUCH, SPRINT) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-1.5">
        {/* BIG PROMINENT FORWARD BUTTON */}
        <div className="flex items-center gap-2">
          <button
            onMouseDown={() => { stateRef.current.keys['w'] = true; }}
            onMouseUp={() => { stateRef.current.keys['w'] = false; }}
            onMouseLeave={() => { stateRef.current.keys['w'] = false; }}
            onTouchStart={(e) => { e.preventDefault(); stateRef.current.keys['w'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys['w'] = false; }}
            className="px-6 py-3 bg-gradient-to-t from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 active:scale-95 text-black font-military font-extrabold text-base md:text-lg rounded-xl shadow-2xl border-2 border-amber-300 flex items-center gap-2 transition-transform select-none"
            title="Click and hold or press 'W' to move forward"
          >
            <ArrowUp className="w-6 h-6 stroke-[3]" />
            <span>FORWARD [W]</span>
          </button>
        </div>

        {/* Directional Pad Row with Roblox Jump & Crouch */}
        <div className="flex items-center gap-1">
          <button
            onMouseDown={() => { stateRef.current.keys['a'] = true; }}
            onMouseUp={() => { stateRef.current.keys['a'] = false; }}
            onMouseLeave={() => { stateRef.current.keys['a'] = false; }}
            onTouchStart={(e) => { e.preventDefault(); stateRef.current.keys['a'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys['a'] = false; }}
            className="w-10 h-9 bg-black/80 hover:bg-slate-800 active:bg-amber-500 active:text-black border border-slate-700 rounded text-slate-200 flex items-center justify-center font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onMouseDown={() => { stateRef.current.keys['s'] = true; }}
            onMouseUp={() => { stateRef.current.keys['s'] = false; }}
            onMouseLeave={() => { stateRef.current.keys['s'] = false; }}
            onTouchStart={(e) => { e.preventDefault(); stateRef.current.keys['s'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys['s'] = false; }}
            className="w-10 h-9 bg-black/80 hover:bg-slate-800 active:bg-amber-500 active:text-black border border-slate-700 rounded text-slate-200 flex items-center justify-center font-bold text-xs"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onMouseDown={() => { stateRef.current.keys['d'] = true; }}
            onMouseUp={() => { stateRef.current.keys['d'] = false; }}
            onMouseLeave={() => { stateRef.current.keys['d'] = false; }}
            onTouchStart={(e) => { e.preventDefault(); stateRef.current.keys['d'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys['d'] = false; }}
            className="w-10 h-9 bg-black/80 hover:bg-slate-800 active:bg-amber-500 active:text-black border border-slate-700 rounded text-slate-200 flex items-center justify-center font-bold text-xs"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* ROBLOX ENERGETIC JUMP BUTTON */}
          <button
            onClick={triggerJump}
            className="px-3 h-9 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 text-white border border-emerald-400 rounded-lg flex items-center justify-center font-military font-bold text-xs shadow-md"
            title="Jump [Space]"
          >
            🦘 JUMP
          </button>

          {/* CROUCH BUTTON */}
          <button
            onClick={toggleCrouch}
            className={`px-2.5 h-9 rounded-lg border text-xs font-military font-bold flex items-center justify-center transition-all ${
              isCrouching
                ? 'bg-amber-500 text-black border-amber-300'
                : 'bg-black/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Crouch [C]"
          >
            🧎 CROUCH
          </button>

          <button
            onMouseDown={() => { stateRef.current.keys['shift'] = true; }}
            onMouseUp={() => { stateRef.current.keys['shift'] = false; }}
            onMouseLeave={() => { stateRef.current.keys['shift'] = false; }}
            onTouchStart={(e) => { e.preventDefault(); stateRef.current.keys['shift'] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys['shift'] = false; }}
            className="px-2.5 h-9 bg-black/80 hover:bg-slate-800 active:bg-amber-500 active:text-black border border-slate-700 rounded text-amber-400 flex items-center justify-center font-bold text-[10px]"
          >
            <Zap className="w-3.5 h-3.5 mr-0.5" /> SPRINT
          </button>
        </div>
      </div>

      {/* BOTTOM RIGHT CORNER: DEDICATED SHOOT BUTTON & TACTICAL ACTIONS */}
      <div className="absolute bottom-4 right-4 z-30 pointer-events-auto flex flex-col items-end gap-3">
        <div className="flex items-center gap-2">
          {/* Aim Down Sights / Scope Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setIsAimingDownSights(prev => !prev);
              const cam = stateRef.current.camera;
              if (cam) {
                cam.fov = isAimingDownSights ? settings.fov : 40;
                cam.updateProjectionMatrix();
              }
            }}
            className={`p-3 rounded-full border shadow-lg transition-transform active:scale-90 ${
              isAimingDownSights
                ? 'bg-amber-500 text-black border-amber-300 scale-105'
                : 'bg-black/80 text-amber-400 border-amber-500/40 hover:bg-slate-900'
            }`}
            title="Toggle ADS Scope"
          >
            <Target className="w-6 h-6" />
          </button>

          {/* Quick Reload */}
          <button
            onClick={() => triggerReload()}
            className="p-3 bg-black/80 hover:bg-slate-900 active:scale-90 text-cyan-400 border border-cyan-500/40 rounded-full shadow-lg transition-transform"
            title="Reload Weapon [R]"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>

        {/* PROMINENT DEDICATED SHOOT / FIRE BUTTON */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            stateRef.current.keys['mouse0'] = true;
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            stateRef.current.keys['mouse0'] = false;
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            stateRef.current.isFiringTouch = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stateRef.current.isFiringTouch = false;
          }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-90 border-4 border-amber-300 shadow-2xl flex flex-col items-center justify-center text-white font-military tracking-wider transition-all cursor-pointer group"
          title="Shoot / Fire Weapon [Left Click]"
        >
          <Flame className="w-8 h-8 text-amber-300 group-hover:scale-110 transition-transform animate-pulse" />
          <span className="text-xs md:text-sm font-extrabold mt-0.5">SHOOT</span>
        </button>
      </div>

      {/* PHONE MOVING CONTROLLER (VIRTUAL JOYSTICK IN LEFT BOTTOM AREA) */}
      <div 
        className="absolute bottom-28 left-6 z-30 pointer-events-auto w-32 h-32 rounded-full border-2 border-slate-700/80 bg-black/40 backdrop-blur-sm flex items-center justify-center touch-none select-none"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
      >
        <div className="absolute w-full h-0.5 bg-slate-800/80" />
        <div className="absolute h-full w-0.5 bg-slate-800/80" />
        <span className="absolute top-1 text-[8px] font-tactical text-amber-400 font-bold uppercase">▲ FORWARD</span>
        
        <div 
          className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 border-2 border-white shadow-xl flex items-center justify-center transition-transform"
          style={{
            transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
          }}
        >
          <Navigation className="w-6 h-6 text-black fill-current" />
        </div>
      </div>

      {/* BACKPACK INTERACTIVE MODAL */}
      <BackpackModal
        isOpen={isBackpackOpen}
        onClose={() => setIsBackpackOpen(false)}
        primaryWeapon={primaryWeapon}
        secondaryWeapon={secondaryWeapon}
        activeWeaponSlot={activeWeaponSlot}
        onSelectSlot={(slot) => {
          switchWeapon(slot);
          setIsBackpackOpen(false);
        }}
        health={health}
        maxHealth={character.hp}
        armor={armor}
        supplies={supplies}
        onUseMedkit={handleUseMedkit}
        onUseArmorPlate={handleUseArmorPlate}
        onUseAdrenaline={handleUseAdrenaline}
        onUseEnergyDrink={handleUseEnergyDrink}
      />

      {/* ROBLOX ENGINE & GRAPHICS SETTINGS MODAL */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings(prev => ({ ...prev, ...newVals }))}
        isMuted={isMuted}
        onToggleMute={() => {
          sound.isMuted = !sound.isMuted;
          setIsMuted(sound.isMuted);
        }}
      />

      {/* MATCH OVER MODAL (VICTORY / DEFEAT) */}
      {matchOver && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#090d14] border-2 border-amber-500 rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              matchWon ? 'bg-amber-500/20 text-amber-400 border border-amber-400' : 'bg-red-500/20 text-red-400 border border-red-400'
            }`}>
              <Award className="w-10 h-10" />
            </div>

            <h2 className="font-military text-4xl text-white tracking-widest">
              {matchWon ? 'VICTORY ROYALE!' : 'DEFEATED IN ACTION'}
            </h2>

            <p className="text-xs text-slate-300 font-tactical">
              {matchWon
                ? 'Outstanding performance operative! The enchanted forest belongs to your squad.'
                : 'Eliminated by opposing forces. Regroup in the armory lobby and deploy again.'}
            </p>

            <div className="grid grid-cols-2 gap-3 py-2 bg-black/60 rounded-xl border border-slate-800">
              <div className="p-2">
                <span className="text-[10px] text-slate-400 font-tactical block">TOTAL KILLS</span>
                <span className="font-mono text-2xl font-bold text-amber-400">{playerKills}</span>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-slate-400 font-tactical block">DAMAGE DEALT</span>
                <span className="font-mono text-2xl font-bold text-white">{playerDamage}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onExitMatch({ kills: playerKills, damage: playerDamage, won: matchWon, place: alivePlayers })}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-military font-bold text-base rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>RETURN TO LOBBY</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
