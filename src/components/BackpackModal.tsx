import React from 'react';
import { Weapon } from '../types/game';
import { sound } from '../utils/audio';
import { 
  Package, X, Shield, Heart, Zap, Crosshair, Sparkles, 
  Flame, BatteryCharging, ChevronRight, Check
} from 'lucide-react';

export interface BackpackSupplies {
  medkits: number;
  armorPlates: number;
  adrenaline: number;
  energyDrinks: number;
  fragGrenades: number;
  smokeGrenades: number;
  ammo556: number;
  ammo300: number;
  ammo50AE: number;
  ammo12Gauge: number;
}

interface BackpackModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryWeapon: Weapon;
  secondaryWeapon: Weapon;
  activeWeaponSlot: 'primary' | 'secondary' | 'sidearm' | 'melee' | 'grenade';
  onSelectSlot: (slot: 'primary' | 'secondary' | 'sidearm' | 'melee' | 'grenade') => void;
  health: number;
  maxHealth: number;
  armor: number;
  supplies: BackpackSupplies;
  onUseMedkit: () => void;
  onUseArmorPlate: () => void;
  onUseAdrenaline: () => void;
  onUseEnergyDrink: () => void;
}

export const BackpackModal: React.FC<BackpackModalProps> = ({
  isOpen,
  onClose,
  primaryWeapon,
  secondaryWeapon,
  activeWeaponSlot,
  onSelectSlot,
  health,
  maxHealth,
  armor,
  supplies,
  onUseMedkit,
  onUseArmorPlate,
  onUseAdrenaline,
  onUseEnergyDrink,
}) => {
  if (!isOpen) return null;

  const totalUsedSlots = 
    2 + // primary and secondary
    1 + // sidearm
    1 + // melee
    (supplies.medkits > 0 ? 1 : 0) +
    (supplies.armorPlates > 0 ? 1 : 0) +
    (supplies.adrenaline > 0 ? 1 : 0) +
    (supplies.energyDrinks > 0 ? 1 : 0) +
    (supplies.fragGrenades > 0 ? 1 : 0) +
    4; // 4 ammo packs

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#090d14] border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-black/70 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-military text-xl text-white tracking-wide">
                  LEVEL 3 TACTICAL BACKPACK
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-tactical font-bold rounded">
                  {totalUsedSlots} / 25 SLOTS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-tactical">
                Manage your carried weapons, survival consumables, and combat supplies
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. CURRENT CARRIED WEAPONS */}
          <div>
            <div className="text-xs text-amber-400 font-tactical font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4" />
              <span>CARRIED WEAPONS ARSENAL (CLICK TO EQUIP)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* PRIMARY WEAPON */}
              <div
                onClick={() => {
                  sound.playClick();
                  onSelectSlot('primary');
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  activeWeaponSlot === 'primary'
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-black/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold rounded">
                      SLOT 1
                    </span>
                    <span className="font-tactical font-bold text-white text-sm">
                      {primaryWeapon.name}
                    </span>
                    {activeWeaponSlot === 'primary' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-tactical mt-1 flex items-center gap-3">
                    <span>DMG: <b className="text-white">{primaryWeapon.damage}</b></span>
                    <span>MAG: <b className="text-amber-300">{primaryWeapon.magazineSize}</b></span>
                    <span>ATTACH: <b className="text-cyan-400">4x ACOG Scope</b></span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                  AR
                </div>
              </div>

              {/* SECONDARY WEAPON */}
              <div
                onClick={() => {
                  sound.playClick();
                  onSelectSlot('secondary');
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  activeWeaponSlot === 'secondary'
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-black/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold rounded">
                      SLOT 2
                    </span>
                    <span className="font-tactical font-bold text-white text-sm">
                      {secondaryWeapon.name}
                    </span>
                    {activeWeaponSlot === 'secondary' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-tactical mt-1 flex items-center gap-3">
                    <span>DMG: <b className="text-white">{secondaryWeapon.damage}</b></span>
                    <span>MAG: <b className="text-amber-300">{secondaryWeapon.magazineSize}</b></span>
                    <span>ATTACH: <b className="text-cyan-400">8x Sniper Scope</b></span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  SR
                </div>
              </div>

              {/* SIDEARM PISTOL */}
              <div
                onClick={() => {
                  sound.playClick();
                  onSelectSlot('sidearm');
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  activeWeaponSlot === 'sidearm'
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-black/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 font-mono text-[10px] font-bold rounded">
                      SLOT 3
                    </span>
                    <span className="font-tactical font-bold text-white text-sm">
                      Desert Eagle .50 AE Gold
                    </span>
                    {activeWeaponSlot === 'sidearm' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-tactical mt-1 flex items-center gap-3">
                    <span>DMG: <b className="text-white">65</b></span>
                    <span>MAG: <b className="text-amber-300">7</b></span>
                    <span>ATTACH: <b className="text-amber-400">Laser Sight</b></span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-purple-400 font-bold text-xs">
                  HG
                </div>
              </div>

              {/* MELEE WEAPON */}
              <div
                onClick={() => {
                  sound.playClick();
                  onSelectSlot('melee');
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  activeWeaponSlot === 'melee'
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-black/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded">
                      SLOT 4
                    </span>
                    <span className="font-tactical font-bold text-white text-sm">
                      Tactical Damascus Katana
                    </span>
                    {activeWeaponSlot === 'melee' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-tactical mt-1 flex items-center gap-3">
                    <span>DMG: <b className="text-white">95</b></span>
                    <span>RANGE: <b className="text-slate-300">Close Melee</b></span>
                    <span>SPEED: <b className="text-emerald-400">Fast Slashing</b></span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  ME
                </div>
              </div>
            </div>
          </div>

          {/* 2. MEDICAL & SURVIVAL CONSUMABLES (CLICK TO HEAL/SHIELD) */}
          <div>
            <div className="text-xs text-emerald-400 font-tactical font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                <span>SURVIVAL CONSUMABLES & RECOVERY (INSTANT USE)</span>
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-red-400 font-mono">HP: {health}/{maxHealth}</span>
                <span className="text-blue-400 font-mono">ARMOR: {armor}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* MEDKIT */}
              <div className="p-3 bg-black/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded bg-red-500/20 text-red-400 flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                      x{supplies.medkits}
                    </span>
                  </div>
                  <h4 className="font-tactical font-bold text-white text-xs mt-2">
                    Combat Medkit
                  </h4>
                  <p className="text-[10px] text-slate-400 font-tactical mt-0.5">
                    Restores <span className="text-emerald-400">+50 Health</span>
                  </p>
                </div>
                <button
                  disabled={supplies.medkits <= 0 || health >= maxHealth}
                  onClick={() => {
                    sound.playHealSound();
                    onUseMedkit();
                  }}
                  className={`mt-2.5 w-full py-1 text-xs font-tactical font-bold rounded transition-all ${
                    supplies.medkits > 0 && health < maxHealth
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  USE (+50 HP)
                </button>
              </div>

              {/* CERAMIC ARMOR PLATE */}
              <div className="p-3 bg-black/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                      x{supplies.armorPlates}
                    </span>
                  </div>
                  <h4 className="font-tactical font-bold text-white text-xs mt-2">
                    Armor Plate
                  </h4>
                  <p className="text-[10px] text-slate-400 font-tactical mt-0.5">
                    Inserts <span className="text-blue-400">+50 Armor</span>
                  </p>
                </div>
                <button
                  disabled={supplies.armorPlates <= 0 || armor >= 100}
                  onClick={() => {
                    sound.playArmorEquip();
                    onUseArmorPlate();
                  }}
                  className={`mt-2.5 w-full py-1 text-xs font-tactical font-bold rounded transition-all ${
                    supplies.armorPlates > 0 && armor < 100
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  SLOT (+50 ARMOR)
                </button>
              </div>

              {/* ADRENALINE SHOT */}
              <div className="p-3 bg-black/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                      x{supplies.adrenaline}
                    </span>
                  </div>
                  <h4 className="font-tactical font-bold text-white text-xs mt-2">
                    Adrenaline Syringe
                  </h4>
                  <p className="text-[10px] text-slate-400 font-tactical mt-0.5">
                    <span className="text-amber-400">+35 HP</span> & +30% Sprint
                  </p>
                </div>
                <button
                  disabled={supplies.adrenaline <= 0 || health >= maxHealth}
                  onClick={() => {
                    sound.playHealSound();
                    onUseAdrenaline();
                  }}
                  className={`mt-2.5 w-full py-1 text-xs font-tactical font-bold rounded transition-all ${
                    supplies.adrenaline > 0 && health < maxHealth
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  INJECT (+35 HP)
                </button>
              </div>

              {/* ENERGY DRINK */}
              <div className="p-3 bg-black/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <BatteryCharging className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                      x{supplies.energyDrinks}
                    </span>
                  </div>
                  <h4 className="font-tactical font-bold text-white text-xs mt-2">
                    Energy Drink
                  </h4>
                  <p className="text-[10px] text-slate-400 font-tactical mt-0.5">
                    Replenishes <span className="text-cyan-400">+25 HP</span>
                  </p>
                </div>
                <button
                  disabled={supplies.energyDrinks <= 0 || health >= maxHealth}
                  onClick={() => {
                    sound.playHealSound();
                    onUseEnergyDrink();
                  }}
                  className={`mt-2.5 w-full py-1 text-xs font-tactical font-bold rounded transition-all ${
                    supplies.energyDrinks > 0 && health < maxHealth
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  DRINK (+25 HP)
                </button>
              </div>
            </div>
          </div>

          {/* 3. AMMUNITION RESERVES */}
          <div>
            <div className="text-xs text-amber-400 font-tactical font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>AMMUNITION MAGAZINE RESERVES</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-black/60 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-white font-tactical font-bold">5.56mm NATO</div>
                  <div className="text-[10px] text-slate-400">Assault Rifle Ammo</div>
                </div>
                <span className="font-mono text-amber-400 font-bold text-sm">
                  {supplies.ammo556}
                </span>
              </div>
              <div className="p-2.5 bg-black/60 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-white font-tactical font-bold">.300 Magnum</div>
                  <div className="text-[10px] text-slate-400">Sniper Armor-Piercing</div>
                </div>
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  {supplies.ammo300}
                </span>
              </div>
              <div className="p-2.5 bg-black/60 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-white font-tactical font-bold">.50 Action Exp.</div>
                  <div className="text-[10px] text-slate-400">Heavy Handgun Ammo</div>
                </div>
                <span className="font-mono text-purple-400 font-bold text-sm">
                  {supplies.ammo50AE}
                </span>
              </div>
              <div className="p-2.5 bg-black/60 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-white font-tactical font-bold">12-Gauge Pellets</div>
                  <div className="text-[10px] text-slate-400">Shotgun Shells</div>
                </div>
                <span className="font-mono text-red-400 font-bold text-sm">
                  {supplies.ammo12Gauge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 bg-black/70 border-t border-slate-800 flex items-center justify-between text-xs font-tactical text-slate-400">
          <span>Click any weapon slot to equip it immediately. Use items to restore HP and Armor.</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold rounded"
          >
            RETURN TO COMBAT
          </button>
        </div>
      </div>
    </div>
  );
};
