import React, { useState } from 'react';
import { Character, CharacterId, Outfit } from '../types/game';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  UserCheck, Shield, Zap, Sparkles, X, Check, 
  Gem, Coins, Lock, Flame, Heart, Activity, Wind
} from 'lucide-react';

interface OperatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  unlockedCharacterIds: CharacterId[];
  equippedCharacterOutfit: Record<string, string>;
  selectedCharacterId: CharacterId;
  diamonds: number;
  coins: number;
  onSelectCharacter: (charId: CharacterId) => void;
  onEquipOutfit: (charId: string, outfitId: string) => void;
  onUnlockCharacter: (charId: CharacterId, costDiamonds: number, costCoins: number) => boolean;
  onUnlockOutfit: (charId: string, outfitId: string, costDiamonds: number, costCoins?: number) => boolean;
  onOpenStore: () => void;
}

export const OperatorsModal: React.FC<OperatorsModalProps> = ({
  isOpen,
  onClose,
  characters,
  unlockedCharacterIds,
  equippedCharacterOutfit,
  selectedCharacterId,
  diamonds,
  coins,
  onSelectCharacter,
  onEquipOutfit,
  onUnlockCharacter,
  onUnlockOutfit,
  onOpenStore,
}) => {
  const [activeCharId, setActiveCharId] = useState<CharacterId>(selectedCharacterId);

  if (!isOpen) return null;

  const currentCharacter = characters.find(c => c.id === activeCharId) || characters[0];
  const isCharacterUnlocked = unlockedCharacterIds.includes(currentCharacter.id);
  const isCurrentlySelected = selectedCharacterId === currentCharacter.id;
  const equippedOutfitId = equippedCharacterOutfit[currentCharacter.id] || currentCharacter.outfits[0]?.id;

  const handleBuyCharacter = () => {
    if (diamonds < currentCharacter.priceDiamonds && coins < currentCharacter.priceCoins) {
      onOpenStore();
      return;
    }
    const success = onUnlockCharacter(currentCharacter.id, currentCharacter.priceDiamonds, currentCharacter.priceCoins);
    if (success) {
      sound.playDiamondChime();
      confetti({ particleCount: 90, spread: 60 });
    }
  };

  const handleBuyOutfit = (outfit: Outfit) => {
    const costDiamonds = outfit.priceDiamonds || 0;
    const costCoins = outfit.priceCoins || 0;

    if (diamonds < costDiamonds && coins < costCoins) {
      onOpenStore();
      return;
    }
    const success = onUnlockOutfit(currentCharacter.id, outfit.id, costDiamonds, costCoins);
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
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-military text-2xl text-amber-400 tracking-wider">
                MALE OPERATOR TASK FORCE & COMBAT GEAR
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-tactical">
                <span>ALL-MALE SPEC-OPS CORPS</span>
                <span aria-hidden="true">·</span>
                <span>TACTICAL COMBAT UNIFORMS</span>
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

        {/* MAIN BODY: OPERATORS GRID (LEFT) & DETAIL / UNIFORMS (RIGHT) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* OPERATOR LIST (COL 1-4) */}
          <div className="md:col-span-4 p-4 border-r border-slate-800/80 overflow-y-auto space-y-2.5">
            <div className="text-xs text-amber-400 font-tactical font-bold mb-2">
              SELECT MALE OPERATIVE ({characters.length})
            </div>

            {characters.map(char => {
              const isUnlocked = unlockedCharacterIds.includes(char.id);
              const isSelected = char.id === currentCharacter.id;
              const isEquippedInGame = selectedCharacterId === char.id;

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveCharId(char.id);
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-[#0f131c] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-tactical font-bold text-sm text-white">
                      {char.name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-tactical px-1.5 py-0.5 bg-amber-950/60 rounded">
                      {char.gender}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-tactical">
                    <span>{char.callsign} · {char.role}</span>
                    <div className="flex items-center gap-1">
                      {isEquippedInGame && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded font-bold">
                          DEPLOYED
                        </span>
                      )}
                      {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* OPERATOR INSPECTOR & OUTFITS (COL 5-12) */}
          <div className="md:col-span-8 p-4 md:p-6 overflow-y-auto space-y-6">
            {/* OPERATOR PROFILE BANNER */}
            <div className="p-4 bg-gradient-to-r from-black/80 to-[#121622] border border-slate-800 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-tactical font-bold">
                    <span>{currentCharacter.callsign}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentCharacter.role.toUpperCase()}</span>
                  </div>
                  <h3 className="font-military text-3xl text-white tracking-wide">
                    {currentCharacter.name}
                  </h3>
                  <p className="text-xs italic text-slate-400 font-tactical mt-0.5">
                    {currentCharacter.quote}
                  </p>
                </div>

                {/* Equip / Unlock Actions */}
                <div className="flex items-center gap-2">
                  {isCharacterUnlocked ? (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectCharacter(currentCharacter.id);
                      }}
                      className={`px-4 py-2 rounded font-tactical text-xs font-bold transition-all shadow-md ${
                        isCurrentlySelected
                          ? 'bg-amber-500 text-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isCurrentlySelected ? 'DEPLOYED OPERATOR' : 'DEPLOY OPERATOR'}
                    </button>
                  ) : (
                    <button
                      onClick={handleBuyCharacter}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow-lg"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>UNLOCK: {currentCharacter.priceDiamonds} 💎 OR {currentCharacter.priceCoins} 🪙</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-300 font-tactical leading-relaxed mb-4">
                {currentCharacter.bio}
              </p>

              {/* Ability & Combat Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-tactical">
                <div className="p-3 bg-black/60 border border-slate-800 rounded flex items-start gap-3">
                  <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-amber-400 font-bold block">
                      SPECIAL: {currentCharacter.specialAbility.name}
                    </span>
                    <span className="text-slate-400 text-[11px] leading-tight block">
                      {currentCharacter.specialAbility.description}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/60 border border-slate-800 rounded flex items-center justify-around">
                  <div className="text-center">
                    <span className="text-slate-400 block text-[10px]">BASE HEALTH</span>
                    <span className="text-emerald-400 font-bold text-sm">{currentCharacter.baseHealth} HP</span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div className="text-center">
                    <span className="text-slate-400 block text-[10px]">SPEED RATING</span>
                    <span className="text-cyan-400 font-bold text-sm">{currentCharacter.baseSpeed} m/s</span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div className="text-center">
                    <span className="text-slate-400 block text-[10px]">COOLDOWN</span>
                    <span className="text-amber-400 font-bold text-sm">{currentCharacter.specialAbility.cooldownSeconds}s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TACTICAL UNIFORMS & DRESSES (Requested by user: outfits for characters!) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-tactical font-bold text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>TACTICAL UNIFORMS & SUITS</span>
                </h4>
                <span className="text-xs text-slate-400 font-tactical">
                  {currentCharacter.outfits.length} OUTFITS AVAILABLE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentCharacter.outfits.map(outfit => {
                  const isOutfitEquipped = equippedOutfitId === outfit.id;
                  const isOutfitUnlocked = outfit.unlockedByDefault || !outfit.priceDiamonds;

                  return (
                    <div
                      key={outfit.id}
                      className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                        isOutfitEquipped
                          ? 'bg-amber-500/10 border-amber-500 shadow-md'
                          : 'bg-[#0f131c] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-tactical font-bold text-sm text-white">
                            {outfit.name}
                          </span>
                          <span
                            className={`text-[10px] font-tactical uppercase font-bold px-1.5 py-0.5 rounded ${
                              outfit.rarity === 'Legendary'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : outfit.rarity === 'Epic'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {outfit.rarity}
                          </span>
                        </div>

                        {/* Uniform Color Swatch */}
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-5 h-5 rounded border border-white/20"
                            style={{ backgroundColor: outfit.colorScheme.primary }}
                          />
                          <div
                            className="w-5 h-5 rounded border border-white/20"
                            style={{ backgroundColor: outfit.colorScheme.secondary }}
                          />
                          <div
                            className="w-5 h-5 rounded border border-white/20"
                            style={{ backgroundColor: outfit.colorScheme.accent }}
                          />
                          <p className="text-[11px] text-slate-400 font-tactical line-clamp-1">
                            {outfit.description}
                          </p>
                        </div>
                      </div>

                      {/* Outfit CTA */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        {isOutfitUnlocked ? (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onEquipOutfit(currentCharacter.id, outfit.id);
                            }}
                            className={`w-full py-1.5 rounded font-tactical text-xs font-bold transition-all ${
                              isOutfitEquipped
                                ? 'bg-amber-500 text-black shadow'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {isOutfitEquipped ? 'EQUIPPED UNIFORM' : 'EQUIP UNIFORM'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyOutfit(outfit)}
                            className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Gem className="w-3.5 h-3.5" />
                            <span>BUY UNIFORM: {outfit.priceDiamonds} 💎</span>
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
