import React, { useState } from 'react';
import { Weapon, Vehicle, Friend } from '../types/game';
import { CharacterRosterItem, MapEnvironment, GameModeKey } from '../types/characterRoster';
import { sound } from '../utils/audio';
import { LobbyCharacterViewer3D } from './LobbyCharacterViewer3D';
import { WEAPONS } from '../data/gameData';
import { 
  Play, Crosshair, Users, Gem, Coins, Car, Shield, 
  Smartphone, Volume2, VolumeX, Flame, Award, Radio, 
  Gift, Calendar, Target, Sparkles, ChevronRight, Zap,
  TreePine, Compass, Eye, Check, Layers, RotateCw
} from 'lucide-react';

interface LobbyProps {
  character: CharacterRosterItem;
  primaryWeapon: Weapon;
  secondaryWeapon: Weapon;
  vehicle: Vehicle;
  selectedMap: MapEnvironment;
  selectedMode: GameModeKey;
  onSelectMode: (mode: GameModeKey) => void;
  onStartMatch: () => void;
  diamonds: number;
  coins: number;
  friends: Friend[];
  lastMonthlyClaimTime: number;
  onOpenStore: () => void;
  onOpenArmory: () => void;
  onOpen250Roster: () => void;
  onOpenVehicles: () => void;
  onOpenFriends: () => void;
  onOpenApk: () => void;
  onOpenMapStudio: () => void;
  onEquipPrimaryWeapon?: (w: Weapon) => void;
  onEquipSecondaryWeapon?: (w: Weapon) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  character,
  primaryWeapon,
  secondaryWeapon,
  vehicle,
  selectedMap,
  selectedMode,
  onSelectMode,
  onStartMatch,
  diamonds,
  coins,
  friends,
  lastMonthlyClaimTime,
  onOpenStore,
  onOpenArmory,
  onOpen250Roster,
  onOpenVehicles,
  onOpenFriends,
  onOpenApk,
  onOpenMapStudio,
  onEquipPrimaryWeapon,
  onEquipSecondaryWeapon,
}) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [weaponRackFilter, setWeaponRackFilter] = useState<'ALL' | 'AR' | 'Sniper' | 'SMG' | 'Shotgun'>('ALL');

  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  const isMonthlyAvailable = Date.now() - lastMonthlyClaimTime > MONTH_MS;

  const weaponSkin = primaryWeapon.skins.find(s => s.id === primaryWeapon.equippedSkinId) || primaryWeapon.skins[0];

  const filteredWeapons = WEAPONS.filter(w => {
    if (weaponRackFilter === 'ALL') return true;
    return w.category === weaponRackFilter;
  });

  return (
    <div className="relative w-full h-screen bg-[#040507] text-slate-100 flex flex-col justify-between p-3 md:p-6 select-none overflow-hidden">
      {/* PURE BLACK MINIMALIST PLAIN BACKGROUND REQUESTED BY USER */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#040507]">
        {/* Subtle dark linear gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080b12] via-[#040507] to-[#020305]" />
        {/* Soft atmospheric halo behind weapon rack */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* TOP HEADER BAR */}
      <header className="relative z-20 flex items-center justify-between border-b border-slate-900 pb-3 bg-black/60 backdrop-blur-md -mx-3 -mt-3 md:-mx-6 md:-mt-6 px-4 py-3">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-military text-black text-xl font-bold shadow-md">
            FF
          </div>
          <div>
            <h1 className="font-military text-2xl md:text-3xl text-white tracking-wider leading-none">
              WARZONE <span className="text-amber-400">ROBLOX CHITRA 3D</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-tactical">
              <span>ROBLOX AVATARS & ILLUSTRATED DRESSES</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-mono">ALWAYS SUNNY MORNING MAPS</span>
            </div>
          </div>
        </div>

        {/* Currency & Quick Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onOpenStore();
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-tactical transition-all border ${
              isMonthlyAvailable
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                : 'bg-black/60 border-slate-800 text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{isMonthlyAvailable ? 'FREE 150 💎 READY!' : 'MONTHLY DROP'}</span>
          </button>

          {/* Diamonds */}
          <div className="flex items-center gap-1 px-3 py-1 bg-black/90 border border-cyan-500/40 rounded-lg">
            <Gem className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-tactical font-bold text-cyan-300 text-xs md:text-sm">
              {diamonds.toLocaleString()}
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onOpenStore();
              }}
              className="ml-1 w-4 h-4 rounded bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center text-xs font-bold"
              title="Top Up Diamonds"
            >
              +
            </button>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1 px-3 py-1 bg-black/90 border border-amber-500/40 rounded-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-tactical font-bold text-amber-300 text-xs md:text-sm">
              {coins.toLocaleString()}
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onOpenStore();
              }}
              className="ml-1 w-4 h-4 rounded bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center text-xs font-bold"
              title="Get Coins"
            >
              +
            </button>
          </div>

          {/* Sound & APK */}
          <button
            onClick={() => {
              sound.isMuted = !sound.isMuted;
              setIsMuted(sound.isMuted);
            }}
            className="p-2 bg-black/90 border border-slate-800 rounded-lg hover:border-amber-400 text-slate-300"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenApk();
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-tactical font-bold text-xs rounded-lg shadow-md"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>.APK APP</span>
          </button>
        </div>
      </header>

      {/* CENTER STAGE: WEAPONS SHOWCASE WALL IN THE BACK + REALISTIC 3D ANIME CHARACTER IN FRONT */}
      <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 items-center my-1 overflow-hidden">
        {/* LEFT COLUMN: GAME MODES (Battle Royale, Clash Squad, Team Deathmatch, Lone Wolf, Studio Room) */}
        <div className="md:col-span-3 space-y-2 z-20 max-h-[70vh] overflow-y-auto pr-1">
          <div className="text-xs text-amber-400 font-tactical font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              <span>GAME MODES</span>
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onOpenMapStudio();
              }}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-tactical underline"
            >
              MAPS STUDIO
            </button>
          </div>

          {/* 1. Battle Royale */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectMode('BATTLE_ROYALE');
            }}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              selectedMode === 'BATTLE_ROYALE'
                ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                : 'bg-black/80 border-slate-900 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-military text-base text-white">BATTLE ROYALE</span>
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] font-tactical font-bold rounded">
                20 PLAYERS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-tactical leading-tight">
              Dense romantic dating forest with Sakura blooms, shrinking safe zone, and military jeeps.
            </p>
          </div>

          {/* 2. Clash Squad */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectMode('CLASH_SQUAD');
            }}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              selectedMode === 'CLASH_SQUAD'
                ? 'bg-cyan-500/15 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                : 'bg-black/80 border-slate-900 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-military text-base text-white">CLASH SQUAD</span>
              <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-400 text-[9px] font-tactical font-bold rounded">
                4V4 ROUNDS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-tactical leading-tight">
              Tactical 4v4 squad rounds in forest compounds. Buy weapons and push enemy positions!
            </p>
          </div>

          {/* 3. Team Deathmatch */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectMode('TEAM_DEATHMATCH');
            }}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              selectedMode === 'TEAM_DEATHMATCH'
                ? 'bg-purple-500/15 border-purple-500 shadow-md ring-1 ring-purple-500/40'
                : 'bg-black/80 border-slate-900 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-military text-base text-white">TEAM DEATHMATCH</span>
              <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-400 text-[9px] font-tactical font-bold rounded">
                RESPAWN ARENA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-tactical leading-tight">
              Fast-paced combat with instant respawns. First squad to 20 eliminations wins.
            </p>
          </div>

          {/* 4. Lone Wolf */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectMode('LONE_WOLF');
            }}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              selectedMode === 'LONE_WOLF'
                ? 'bg-red-500/15 border-red-500 shadow-md ring-1 ring-red-500/40'
                : 'bg-black/80 border-slate-900 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-military text-base text-white">LONE WOLF</span>
              <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 text-[9px] font-tactical font-bold rounded">
                1V1 INTENSE DUEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-tactical leading-tight">
              Pure 1v1 close-range duel in the bamboo grove. Headshots only & pure reflex gunplay.
            </p>
          </div>

          {/* 5. Custom Room Match */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectMode('CUSTOM_ROOM');
              onOpenMapStudio();
            }}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
              selectedMode === 'CUSTOM_ROOM'
                ? 'bg-emerald-500/15 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                : 'bg-black/80 border-slate-900 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-military text-base text-white">ROOM MATCH (STUDIO)</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-tactical font-bold rounded">
                AUDIENCE MAPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-tactical leading-tight">
              Create, host and play custom maps published by the player audience community.
            </p>
          </div>
        </div>

        {/* CENTER STAGE: GUN COLLECTION RACK IN THE BACK + 3D REALISTIC ANIME OPERATIVE IN FRONT */}
        <div className="md:col-span-6 relative flex flex-col items-center justify-center min-h-[420px]">
          {/* WEAPON COLLECTION RACK WALL DIRECTLY IN THE BACK OF THE CHARACTER (USER REQUEST) */}
          <div className="absolute inset-0 z-0 flex flex-col justify-between p-2 pointer-events-none opacity-40 hover:opacity-90 transition-opacity duration-300">
            {/* Top Weapon Rack Row */}
            <div className="grid grid-cols-3 gap-2">
              {WEAPONS.slice(0, 3).map((w) => (
                <div key={w.id} className="p-2 bg-black/90 border border-slate-800/80 rounded flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-950 border border-slate-700 flex items-center justify-center text-amber-400 text-[10px] font-bold">
                    {w.category}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-white font-tactical font-bold block truncate">{w.name}</span>
                    <span className="text-[8px] text-amber-400 font-mono block">DMG: {w.damage} | MAG: {w.magazineSize}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Weapon Rack Row */}
            <div className="grid grid-cols-3 gap-2">
              {WEAPONS.slice(3, 6).map((w) => (
                <div key={w.id} className="p-2 bg-black/90 border border-slate-800/80 rounded flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-950 border border-slate-700 flex items-center justify-center text-cyan-400 text-[10px] font-bold">
                    {w.category}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-white font-tactical font-bold block truncate">{w.name}</span>
                    <span className="text-[8px] text-cyan-400 font-mono block">DMG: {w.damage} | MAG: {w.magazineSize}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REALISTIC 3D ANIME OPERATIVE SHOWROOM (IN FRONT OF WEAPONS WALL) */}
          <div className="relative z-10 w-full flex flex-col items-center">
            <LobbyCharacterViewer3D character={character} />

            {/* Character Info Plaque */}
            <div className="text-center mt-[-10px] z-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/90 border border-amber-500/50 rounded-full shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-tactical font-bold text-amber-400 uppercase tracking-wider">
                  {character.clan} • {character.name}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-xs text-slate-300 font-tactical font-bold">
                  {primaryWeapon.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FOREST MAP SELECTION & SQUAD */}
        <div className="md:col-span-3 space-y-2.5 z-20">
          {/* Active Forest Map Card */}
          <div 
            onClick={() => {
              sound.playClick();
              onOpenMapStudio();
            }}
            className="p-3 bg-black/90 border border-emerald-500/50 rounded-lg cursor-pointer hover:border-emerald-400 transition-all shadow-md"
          >
            <div className="flex items-center justify-between text-xs font-tactical text-emerald-400 mb-1">
              <span className="flex items-center gap-1 font-bold">
                <TreePine className="w-3.5 h-3.5" />
                <span>ACTIVE DATING FOREST</span>
              </span>
              <span className="text-[10px] text-slate-400 underline">CHANGE</span>
            </div>
            <div className="font-tactical font-bold text-white text-sm">
              {selectedMap.name}
            </div>
            <div className="text-[11px] text-slate-400 font-tactical line-clamp-1">
              Sakura blossoms, tranquil pond, arched bridge & tactical clearings
            </div>
          </div>

          {/* Squad Comms & Friends */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-amber-400 font-tactical font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>SQUAD TEAM (1/4)</span>
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onOpenFriends();
              }}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-tactical underline"
            >
              + INVITE
            </button>
          </div>

          <div className="space-y-1.5">
            {/* Player Leader Card */}
            <div className="p-2 bg-black/90 border border-amber-500/40 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs">
                  ★
                </div>
                <div>
                  <div className="text-xs font-tactical font-bold text-white leading-tight">
                    {character.name} <span className="text-[9px] text-amber-400 font-mono">[YOU]</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-tactical">
                    READY TO DEPLOY
                  </div>
                </div>
              </div>
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                LEADER
              </span>
            </div>

            {/* Empty Squad Slots with Invite Button */}
            {[2, 3, 4].map(slotNum => (
              <div
                key={slotNum}
                onClick={() => {
                  sound.playClick();
                  onOpenFriends();
                }}
                className="p-2 bg-black/60 border border-dashed border-slate-800 rounded-lg flex items-center justify-between text-slate-500 hover:text-slate-300 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-xs">
                    +
                  </div>
                  <span className="text-xs font-tactical">SLOT #{slotNum} (OPEN)</span>
                </div>
                <span className="text-[10px] font-tactical text-cyan-400 underline">INVITE</span>
              </div>
            ))}
          </div>

          {/* Quick Vehicle info */}
          <div 
            onClick={() => {
              sound.playClick();
              onOpenVehicles();
            }}
            className="p-2.5 bg-black/80 border border-slate-800 rounded-lg flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-tactical font-bold text-white block">{vehicle.name}</span>
                <span className="text-[10px] text-slate-400 font-tactical">Max Speed: {vehicle.maxSpeed * 20} km/h</span>
              </div>
            </div>
            <span className="text-[10px] text-amber-400 underline font-tactical">GARAGE</span>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROL DOCK & BIG DEPLOY BUTTON */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-900 bg-black/70 backdrop-blur-md -mx-3 -mb-3 md:-mx-6 md:-mb-6 px-4 py-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
          <button
            onClick={() => {
              sound.playClick();
              onOpenArmory();
            }}
            className="px-3 py-2 bg-black/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-400 rounded-lg text-xs font-tactical font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span>GUNS & SKINS</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpen250Roster();
            }}
            className="px-3 py-2 bg-black/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-400 rounded-lg text-xs font-tactical font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>250 OPERATIVES</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenStore();
            }}
            className="px-3 py-2 bg-black/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 rounded-lg text-xs font-tactical font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Gem className="w-4 h-4 text-cyan-400" />
            <span>TOP-UP VAULT</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenMapStudio();
            }}
            className="px-3 py-2 bg-black/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-400 rounded-lg text-xs font-tactical font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <TreePine className="w-4 h-4 text-purple-400" />
            <span>MAPS STUDIO</span>
          </button>
        </div>

        {/* BIG TACTICAL DEPLOY BUTTON */}
        <button
          onClick={() => {
            sound.playClick();
            onStartMatch();
          }}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-black font-military font-extrabold text-xl tracking-wider rounded-xl shadow-2xl border-2 border-amber-300 flex items-center justify-center gap-3 transition-transform"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>START {selectedMode.replace('_', ' ')}</span>
        </button>
      </footer>
    </div>
  );
};
