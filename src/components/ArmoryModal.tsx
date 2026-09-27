import React, { useState } from 'react';
import { Weapon, WeaponSkin } from '../types/game';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Crosshair, Shield, Zap, Sparkles, X, Check, 
  Gem, Coins, Lock, Award, Eye
} from 'lucide-react';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  weapons: Weapon[];
  unlockedWeaponIds: string[];
  equippedWeaponSkins: Record<string, string>;
  selectedPrimaryWeaponId: string;
  selectedSecondaryWeaponId: string;
  diamonds: number;
  coins: number;
  onEquipWeapon: (weaponId: string, slot: 'primary' | 'secondary') => void;
  onEquipSkin: (weaponId: string, skinId: string) => void;
  onUnlockWeapon: (weaponId: string, costDiamonds: number, costCoins: number) => boolean;
  onUnlockSkin: (weaponId: string, skinId: string, costDiamonds: number) => boolean;
  onOpenStore: () => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  isOpen,
  onClose,
  weapons,
  unlockedWeaponIds,
  equippedWeaponSkins,
  selectedPrimaryWeaponId,
  selectedSecondaryWeaponId,
  diamonds,
  coins,
  onEquipWeapon,
  onEquipSkin,
  onUnlockWeapon,
  onUnlockSkin,
  onOpenStore,
}) => {
  const [activeWeaponId, setActiveWeaponId] = useState<string>(weapons[0]?.id || 'm4a1');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const currentWeapon = weapons.find(w => w.id === activeWeaponId) || weapons[0];
  const isUnlocked = unlockedWeaponIds.includes(currentWeapon.id);
  const equippedSkinId = equippedWeaponSkins[currentWeapon.id] || currentWeapon.skins[0]?.id;

  const isEquippedPrimary = selectedPrimaryWeaponId === currentWeapon.id;
  const isEquippedSecondary = selectedSecondaryWeaponId === currentWeapon.id;

  const filteredWeapons = selectedCategory === 'ALL' 
    ? weapons 
    : weapons.filter(w => w.category === selectedCategory);

  const handleBuyWeapon = () => {
    if (diamonds < currentWeapon.priceDiamonds && coins < currentWeapon.priceCoins) {
      onOpenStore();
      return;
    }
    const success = onUnlockWeapon(currentWeapon.id, currentWeapon.priceDiamonds, currentWeapon.priceCoins);
    if (success) {
      sound.playDiamondChime();
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const handleBuySkin = (skin: WeaponSkin) => {
    if (diamonds < skin.priceDiamonds) {
      onOpenStore();
      return;
    }
    const success = onUnlockSkin(currentWeapon.id, skin.id, skin.priceDiamonds);
    if (success) {
      sound.playDiamondChime();
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      <div className="tactical-border w-full max-w-5xl bg-[#090c13] max-h-[92vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
              <Crosshair className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-military text-2xl text-amber-400 tracking-wider">
                TACTICAL GUNSMITH & ARMORY
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-tactical">
                <span>MILITARY ARSENAL</span>
                <span aria-hidden="true">·</span>
                <span>CUSTOM WEAPON SKINS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Balances */}
            <div className="flex items-center gap-2 px-3 py-1 bg-black/70 border border-cyan-500/40 rounded text-cyan-300 font-tactical text-xs">
              <Gem className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold">{diamonds.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-black/70 border border-amber-500/40 rounded text-amber-300 font-tactical text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{coins.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WEAPON CATEGORY FILTER */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-black/30 flex items-center gap-2 overflow-x-auto">
          {['ALL', 'AR', 'Sniper', 'SMG', 'Shotgun', 'LMG', 'Pistol'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded font-tactical text-xs transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* MAIN BODY: WEAPON LIST (LEFT) & DETAIL / SKINS (RIGHT) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* WEAPON SELECTOR LIST (COL 1-4) */}
          <div className="md:col-span-4 p-4 border-r border-slate-800/80 overflow-y-auto space-y-2.5">
            {filteredWeapons.map(weapon => {
              const weaponUnlocked = unlockedWeaponIds.includes(weapon.id);
              const isSelected = weapon.id === currentWeapon.id;
              const isPrimary = selectedPrimaryWeaponId === weapon.id;
              const isSecondary = selectedSecondaryWeaponId === weapon.id;

              return (
                <div
                  key={weapon.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveWeaponId(weapon.id);
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-[#0f131c] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-tactical font-bold text-sm text-white">
                      {weapon.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-tactical px-1.5 py-0.5 bg-black/60 rounded">
                      {weapon.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-tactical">
                    <span>DMG: {weapon.damage} · RPM: {weapon.fireRate}</span>
                    <div className="flex items-center gap-1">
                      {isPrimary && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1 rounded font-bold">
                          PRIMARY
                        </span>
                      )}
                      {isSecondary && (
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1 rounded font-bold">
                          SIDEARM
                        </span>
                      )}
                      {!weaponUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WEAPON INSPECTOR & SKINS (COL 5-12) */}
          <div className="md:col-span-8 p-4 md:p-6 overflow-y-auto space-y-6">
            {/* WEAPON PREVIEW & STATS */}
            <div className="p-4 bg-gradient-to-r from-black/80 to-[#121622] border border-slate-800 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs text-amber-400 font-tactical font-bold">
                    {currentWeapon.category} SPEC-OPS FIREARM
                  </div>
                  <h3 className="font-military text-3xl text-white tracking-wide">
                    {currentWeapon.name}
                  </h3>
                </div>

                {/* Equip / Unlock Actions */}
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onEquipWeapon(currentWeapon.id, 'primary');
                        }}
                        className={`px-3 py-1.5 rounded font-tactical text-xs font-bold transition-all ${
                          isEquippedPrimary
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isEquippedPrimary ? 'EQUIPPED PRIMARY' : 'SET PRIMARY'}
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          onEquipWeapon(currentWeapon.id, 'secondary');
                        }}
                        className={`px-3 py-1.5 rounded font-tactical text-xs font-bold transition-all ${
                          isEquippedSecondary
                            ? 'bg-cyan-500 text-black shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isEquippedSecondary ? 'EQUIPPED SIDEARM' : 'SET SIDEARM'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleBuyWeapon}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow-lg"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>UNLOCK: {currentWeapon.priceDiamonds} 💎 OR {currentWeapon.priceCoins} 🪙</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Weapon Stats Bars */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-tactical">
                <div className="p-2.5 bg-black/60 border border-slate-800/80 rounded">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>DAMAGE</span>
                    <span className="text-white font-bold">{currentWeapon.damage}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (currentWeapon.damage / 140) * 100)}%` }} />
                  </div>
                </div>

                <div className="p-2.5 bg-black/60 border border-slate-800/80 rounded">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>FIRE RATE</span>
                    <span className="text-white font-bold">{currentWeapon.fireRate}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (currentWeapon.fireRate / 1000) * 100)}%` }} />
                  </div>
                </div>

                <div className="p-2.5 bg-black/60 border border-slate-800/80 rounded">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>RANGE</span>
                    <span className="text-white font-bold">{currentWeapon.range}m</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (currentWeapon.range / 850) * 100)}%` }} />
                  </div>
                </div>

                <div className="p-2.5 bg-black/60 border border-slate-800/80 rounded">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>MAGAZINE</span>
                    <span className="text-white font-bold">{currentWeapon.magazineSize} RNDS</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400" style={{ width: `${Math.min(100, (currentWeapon.magazineSize / 100) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* WEAPON SKINS SECTION (Dragonfire, Damascus, Cyber, etc.) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-tactical font-bold text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>WEAPON SKINS & CAMO</span>
                </h4>
                <span className="text-xs text-slate-400 font-tactical">
                  {currentWeapon.skins.length} SKINS AVAILABLE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentWeapon.skins.map(skin => {
                  const isSkinEquipped = equippedSkinId === skin.id;
                  const isSkinUnlocked = skin.unlockedByDefault || skin.priceDiamonds === 0;

                  return (
                    <div
                      key={skin.id}
                      className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                        isSkinEquipped
                          ? 'bg-amber-500/10 border-amber-500 shadow-md'
                          : 'bg-[#0f131c] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-tactical font-bold text-sm text-white">
                            {skin.name}
                          </span>
                          <span
                            className={`text-[10px] font-tactical uppercase font-bold px-1.5 py-0.5 rounded ${
                              skin.rarity === 'Legendary'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : skin.rarity === 'Mythic'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                                : skin.rarity === 'Epic'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {skin.rarity}
                          </span>
                        </div>

                        {/* Skin Color Palette Swatch */}
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-5 h-5 rounded border border-white/20 shadow-inner"
                            style={{ backgroundColor: skin.primaryColor }}
                          />
                          {skin.glowColor && (
                            <div
                              className="w-5 h-5 rounded border border-white/20 shadow-lg"
                              style={{ backgroundColor: skin.glowColor, boxShadow: `0 0 10px ${skin.glowColor}` }}
                            />
                          )}
                          <p className="text-[11px] text-slate-400 font-tactical line-clamp-1">
                            {skin.description}
                          </p>
                        </div>
                      </div>

                      {/* Skin CTA */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        {isSkinUnlocked ? (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onEquipSkin(currentWeapon.id, skin.id);
                            }}
                            className={`w-full py-1.5 rounded font-tactical text-xs font-bold transition-all ${
                              isSkinEquipped
                                ? 'bg-amber-500 text-black shadow'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {isSkinEquipped ? 'EQUIPPED SKIN' : 'EQUIP SKIN'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuySkin(skin)}
                            className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Gem className="w-3.5 h-3.5" />
                            <span>BUY SKIN: {skin.priceDiamonds} 💎</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
