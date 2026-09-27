import React, { useState } from 'react';
import { Vehicle, VehicleSkin } from '../types/game';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Car, Shield, Zap, Sparkles, X, Check, 
  Gem, Coins, Lock, Award, Gauge
} from 'lucide-react';

interface VehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  unlockedVehicleIds: string[];
  equippedVehicleSkins: Record<string, string>;
  selectedVehicleId: string;
  diamonds: number;
  coins: number;
  onSelectVehicle: (vehicleId: string) => void;
  onEquipSkin: (vehicleId: string, skinId: string) => void;
  onUnlockVehicle: (vehicleId: string, costDiamonds: number, costCoins: number) => boolean;
  onUnlockSkin: (vehicleId: string, skinId: string, costDiamonds: number) => boolean;
  onOpenStore: () => void;
}

export const VehiclesModal: React.FC<VehiclesModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  unlockedVehicleIds,
  equippedVehicleSkins,
  selectedVehicleId,
  diamonds,
  coins,
  onSelectVehicle,
  onEquipSkin,
  onUnlockVehicle,
  onUnlockSkin,
  onOpenStore,
}) => {
  const [activeVehicleId, setActiveVehicleId] = useState<string>(selectedVehicleId);

  if (!isOpen) return null;

  const currentVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];
  const isUnlocked = unlockedVehicleIds.includes(currentVehicle.id);
  const isSelected = selectedVehicleId === currentVehicle.id;
  const equippedSkinId = equippedVehicleSkins[currentVehicle.id] || currentVehicle.skins[0]?.id;

  const handleBuyVehicle = () => {
    if (diamonds < currentVehicle.priceDiamonds && coins < currentVehicle.priceCoins) {
      onOpenStore();
      return;
    }
    const success = onUnlockVehicle(currentVehicle.id, currentVehicle.priceDiamonds, currentVehicle.priceCoins);
    if (success) {
      sound.playDiamondChime();
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const handleBuySkin = (skin: VehicleSkin) => {
    if (diamonds < skin.priceDiamonds) {
      onOpenStore();
      return;
    }
    const success = onUnlockSkin(currentVehicle.id, skin.id, skin.priceDiamonds);
    if (success) {
      sound.playDiamondChime();
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      <div className="tactical-border w-full max-w-4xl bg-[#090c13] max-h-[90vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
              <Car className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-military text-2xl text-amber-400 tracking-wider">
                TACTICAL VEHICLE MOTOR POOL & GARAGE
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-tactical">
                <span>COMBAT VEHICLES</span>
                <span aria-hidden="true">·</span>
                <span>CUSTOM VEHICLE SKINS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
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

        {/* MAIN BODY: VEHICLE SELECTOR & SKINS */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* VEHICLE LIST (COL 1-4) */}
          <div className="md:col-span-4 p-4 border-r border-slate-800/80 overflow-y-auto space-y-2.5">
            {vehicles.map(v => {
              const vehicleUnlocked = unlockedVehicleIds.includes(v.id);
              const isItemActive = v.id === currentVehicle.id;
              const isEquipped = selectedVehicleId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveVehicleId(v.id);
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isItemActive
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-[#0f131c] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-tactical font-bold text-sm text-white">
                      {v.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-tactical px-1.5 py-0.5 bg-black/60 rounded">
                      {v.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-tactical">
                    <span>SPD: {v.maxSpeed * 10} · HP: {v.durability}</span>
                    <div className="flex items-center gap-1">
                      {isEquipped && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1 rounded font-bold">
                          DEPLOYED
                        </span>
                      )}
                      {!vehicleUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VEHICLE INSPECTOR & SKINS (COL 5-12) */}
          <div className="md:col-span-8 p-4 md:p-6 overflow-y-auto space-y-6">
            <div className="p-4 bg-gradient-to-r from-black/80 to-[#121622] border border-slate-800 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs text-amber-400 font-tactical font-bold">
                    TACTICAL MOTOR ASSET
                  </div>
                  <h3 className="font-military text-3xl text-white tracking-wide">
                    {currentVehicle.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectVehicle(currentVehicle.id);
                      }}
                      className={`px-4 py-2 rounded font-tactical text-xs font-bold transition-all shadow-md ${
                        isSelected
                          ? 'bg-amber-500 text-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isSelected ? 'DEPLOYED VEHICLE' : 'DEPLOY VEHICLE'}
                    </button>
                  ) : (
                    <button
                      onClick={handleBuyVehicle}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow-lg"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>UNLOCK: {currentVehicle.priceDiamonds} 💎 OR {currentVehicle.priceCoins} 🪙</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Vehicle Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-tactical">
                <div className="p-2.5 bg-black/60 border border-slate-800/80 rounded">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>TOP SPEED</span>
                    <span className="text-white font-bold">{currentVehicle.maxSpeed * 12} KM/H</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${(currentVehicle.maxSpeed / 11) * 100}%` }} />
                  </div>
                </div>

                <div className="p-2.5 bg-black/60 border border-slate-800/80 rounded">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>DURABILITY</span>
                    <span className="text-white font-bold">{currentVehicle.durability} HP</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${(currentVehicle.durability / 650) * 100}%` }} />
                  </div>
                </div>

                <div className="p-2.5 bg-black/60 border border-slate-800/80 rounded">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>HANDLING</span>
                    <span className="text-white font-bold">{Math.round(currentVehicle.handling * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${currentVehicle.handling * 100}%` }} />
                  </div>
                </div>

                <div className="p-2.5 bg-black/60 border border-slate-800/80 rounded">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>CAPACITY</span>
                    <span className="text-white font-bold">{currentVehicle.capacity} SEATS</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400" style={{ width: `${(currentVehicle.capacity / 4) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* VEHICLE SKINS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-tactical font-bold text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>VEHICLE SKINS & LIVERIES</span>
                </h4>
                <span className="text-xs text-slate-400 font-tactical">
                  {currentVehicle.skins.length} SKINS AVAILABLE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentVehicle.skins.map(skin => {
                  const isSkinEquipped = equippedSkinId === skin.id;
                  const isSkinUnlocked = skin.unlockedByDefault || !skin.priceDiamonds;

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
                                : skin.rarity === 'Epic'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {skin.rarity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-5 h-5 rounded border border-white/20"
                            style={{ backgroundColor: skin.color }}
                          />
                          <div
                            className="w-5 h-5 rounded border border-white/20"
                            style={{ backgroundColor: skin.accentColor }}
                          />
                          <span className="text-xs text-slate-400 font-tactical">
                            Livery Scheme
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80">
                        {isSkinUnlocked ? (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onEquipSkin(currentVehicle.id, skin.id);
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
