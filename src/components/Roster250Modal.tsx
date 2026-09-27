import React, { useState } from 'react';
import { CharacterRosterItem } from '../types/characterRoster';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Users, Search, Gem, Coins, Lock, Eye, Check, 
  Sparkles, Shield, Flame, Activity, X, ChevronLeft, ChevronRight
} from 'lucide-react';

interface Roster250ModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterRosterItem[];
  selectedCharacterId: string;
  diamonds: number;
  coins: number;
  onSelectCharacter: (char: CharacterRosterItem) => void;
  onUnlockCharacter: (charId: string, costDiamonds: number, costCoins: number) => boolean;
  onOpenStore: () => void;
}

export const Roster250Modal: React.FC<Roster250ModalProps> = ({
  isOpen,
  onClose,
  characters,
  selectedCharacterId,
  diamonds,
  coins,
  onSelectCharacter,
  onUnlockCharacter,
  onOpenStore,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  const [activeInspectChar, setActiveInspectChar] = useState<CharacterRosterItem>(
    characters.find(c => c.id === selectedCharacterId) || characters[0]
  );

  if (!isOpen) return null;

  const filtered = characters.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.clan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = styleFilter === 'ALL' || c.style === styleFilter;
    return matchesSearch && matchesStyle;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const handleBuy = (char: CharacterRosterItem) => {
    if (diamonds < char.costDiamonds && coins < char.costCoins) {
      onOpenStore();
      return;
    }
    const success = onUnlockCharacter(char.id, char.costDiamonds, char.costCoins);
    if (success) {
      sound.playDiamondChime();
      confetti({ particleCount: 90, spread: 60 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      <div className="tactical-border w-full max-w-6xl bg-[#090c13] max-h-[92vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-military text-2xl text-amber-400 tracking-wider">
                250 VISIBLE MALE ANIME OPERATIVE CORPS
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-tactical">
                <span>FULL FIRST-PERSON HANDS & DETAILED ANIME EYES</span>
                <span aria-hidden="true">·</span>
                <span>250 ACTIVE TACTICAL COMBATANTS</span>
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

        {/* SEARCH & FILTERS BAR */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-black/30 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
                placeholder="Search by name, clan or style..."
                className="w-full pl-8 pr-3 py-1.5 bg-black/70 border border-slate-800 rounded text-xs font-tactical text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={styleFilter}
              onChange={e => { setStyleFilter(e.target.value); setPage(0); }}
              className="px-3 py-1.5 bg-black/70 border border-slate-800 rounded text-xs font-tactical text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Anime Styles</option>
              <option value="tactical_ninja">Tactical Ninja</option>
              <option value="cyber_shonen">Cyber Shonen</option>
              <option value="military_specops">Military SpecOps</option>
              <option value="mecha_warrior">Mecha Warrior</option>
              <option value="desert_ronin">Desert Ronin</option>
              <option value="flame_alchemist">Flame Alchemist</option>
              <option value="shadow_assassin">Shadow Assassin</option>
              <option value="frost_vanguard">Frost Vanguard</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-tactical text-slate-400">
            <span>Showing {displayed.length} of {filtered.length} (Page {page + 1} of {Math.max(1, totalPages)})</span>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: ROSTER GRID (LEFT) & DETAILED INSPECT (RIGHT) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* CHARACTERS GRID (COL 1-8) */}
          <div className="md:col-span-8 p-4 border-r border-slate-800/80 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {displayed.map(char => {
              const isSelected = activeInspectChar.id === char.id;
              const isEquippedInGame = selectedCharacterId === char.id;

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveInspectChar(char);
                  }}
                  className={`p-2.5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 shadow-md'
                      : 'bg-[#0f131c] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Visual Anime Eyes Badge */}
                    <div className="h-10 rounded bg-black/60 border border-slate-800 flex items-center justify-around px-2 mb-2 relative overflow-hidden">
                      {/* Left Anime Eye */}
                      <div 
                        className="w-5 h-2.5 rounded-full border shadow-sm flex items-center justify-center"
                        style={{ borderColor: char.eyeStyle.color, backgroundColor: char.eyeStyle.glow }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      </div>
                      {/* Right Anime Eye */}
                      <div 
                        className="w-5 h-2.5 rounded-full border shadow-sm flex items-center justify-center"
                        style={{ borderColor: char.eyeStyle.color, backgroundColor: char.eyeStyle.glow }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      </div>
                    </div>

                    <div className="text-[11px] text-amber-400 font-tactical font-bold truncate">
                      {char.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-tactical truncate">
                      {char.clan}
                    </div>
                  </div>

                  <div className="mt-2 pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] font-tactical">
                    <span className="text-slate-500">#{char.index}</span>
                    {isEquippedInGame ? (
                      <span className="text-emerald-400 font-bold">DEPLOYED</span>
                    ) : char.unlocked ? (
                      <span className="text-slate-400">READY</span>
                    ) : (
                      <span className="text-amber-400 font-bold">{char.costDiamonds} 💎</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* INSPECTOR PANEL (COL 9-12): PERSPECTIVE EYE & ARMS */}
          <div className="md:col-span-4 p-4 md:p-6 overflow-y-auto space-y-4 bg-black/40">
            {/* ANIME EYE ZOOM CARD */}
            <div className="p-4 bg-gradient-to-r from-black/80 to-[#121622] border border-slate-800 rounded-lg text-center">
              <div className="text-xs text-amber-400 font-tactical font-bold mb-1">
                OPERATIVE EYE SIGHT & OCULAR PROFILE
              </div>
              <p className="text-[11px] text-slate-400 font-tactical mb-3">
                Visible glowing anime eyes rendered in character models.
              </p>

              {/* Expressive Eye Close-up Graphic */}
              <div className="h-16 rounded-lg bg-black border border-slate-700 flex items-center justify-center gap-6 px-4 shadow-inner mb-3">
                <div 
                  className="w-12 h-6 rounded-full border-2 flex items-center justify-center relative shadow-lg"
                  style={{ 
                    borderColor: activeInspectChar.eyeStyle.color, 
                    boxShadow: `0 0 16px ${activeInspectChar.eyeStyle.color}` 
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/40" />
                </div>

                <div 
                  className="w-12 h-6 rounded-full border-2 flex items-center justify-center relative shadow-lg"
                  style={{ 
                    borderColor: activeInspectChar.eyeStyle.color, 
                    boxShadow: `0 0 16px ${activeInspectChar.eyeStyle.color}` 
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/40" />
                </div>
              </div>

              {/* FIRST-PERSON HANDS PREVIEW BADGE */}
              <div className="p-2.5 bg-black/60 border border-slate-800 rounded text-left text-xs font-tactical space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Eye Hue:</span>
                  <span className="text-white font-bold" style={{ color: activeInspectChar.eyeStyle.color }}>
                    {activeInspectChar.eyeStyle.shape.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Glove Material:</span>
                  <span className="text-white font-bold">Tactical Carbon Knuckles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Combat Ability:</span>
                  <span className="text-amber-400 font-bold">{activeInspectChar.signatureAbility}</span>
                </div>
              </div>
            </div>

            {/* CHAR DETAILS & DEPLOY */}
            <div className="space-y-3">
              <div>
                <h3 className="font-military text-2xl text-white">
                  {activeInspectChar.name}
                </h3>
                <div className="text-xs text-amber-400 font-tactical">
                  {activeInspectChar.clan} · {activeInspectChar.gender}
                </div>
                <p className="text-xs italic text-slate-400 font-tactical mt-1">
                  {activeInspectChar.quote}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs font-tactical">
                <div className="p-2 bg-black/60 border border-slate-800 rounded">
                  <span className="text-slate-400 block text-[10px]">BASE HP</span>
                  <span className="text-emerald-400 font-bold">{activeInspectChar.hp} HP</span>
                </div>
                <div className="p-2 bg-black/60 border border-slate-800 rounded">
                  <span className="text-slate-400 block text-[10px]">SPEED RATING</span>
                  <span className="text-cyan-400 font-bold">{activeInspectChar.speed} m/s</span>
                </div>
              </div>

              {/* Action */}
              {activeInspectChar.unlocked ? (
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectCharacter(activeInspectChar);
                    onClose();
                  }}
                  className={`w-full py-2.5 rounded font-tactical text-xs font-bold transition-all shadow-md ${
                    selectedCharacterId === activeInspectChar.id
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {selectedCharacterId === activeInspectChar.id ? 'CURRENTLY DEPLOYED' : 'DEPLOY THIS CHARACTER'}
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(activeInspectChar)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>UNLOCK: {activeInspectChar.costDiamonds} 💎 OR {activeInspectChar.costCoins} 🪙</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
