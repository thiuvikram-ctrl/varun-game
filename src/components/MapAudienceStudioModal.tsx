import React, { useState } from 'react';
import { PublishedCommunityMap, MapEnvironment } from '../types/characterRoster';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Compass, MapPin, ThumbsUp, Play, Plus, X, 
  Sparkles, Check, TreePine, Shield, Car, Share2
} from 'lucide-react';

interface MapAudienceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  officialMaps: MapEnvironment[];
  communityMaps: PublishedCommunityMap[];
  selectedMap: MapEnvironment;
  onSelectMap: (map: MapEnvironment) => void;
  onPublishMap: (newMap: PublishedCommunityMap) => void;
  onUpvoteMap: (mapId: string) => void;
}

export const MapAudienceStudioModal: React.FC<MapAudienceStudioModalProps> = ({
  isOpen,
  onClose,
  officialMaps,
  communityMaps,
  selectedMap,
  onSelectMap,
  onPublishMap,
  onUpvoteMap,
}) => {
  const [activeTab, setActiveTab] = useState<'official' | 'community' | 'creator'>('official');

  // Creator state
  const [title, setTitle] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [desc, setDesc] = useState('');
  const [baseTheme, setBaseTheme] = useState<MapEnvironment['theme']>('deep_forest');
  const [treeDensity, setTreeDensity] = useState(65);
  const [bunkerDensity, setBunkerDensity] = useState(6);
  const [vehicleSpawns, setVehicleSpawns] = useState(4);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreateAndPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !creatorName.trim()) return;

    sound.playDiamondChime();
    confetti({ particleCount: 100, spread: 70 });

    const newMap: PublishedCommunityMap = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      creator: creatorName.trim(),
      environment: officialMaps.find(m => m.theme === baseTheme)?.name || 'Custom Deep Forest',
      treeCount: treeDensity,
      bunkerCount: bunkerDensity,
      vehicleSpawns,
      upvotes: 1,
      plays: 1,
      description: desc.trim() || 'Custom combat zone published by the community player audience.',
      date: 'Just now',
    };

    onPublishMap(newMap);
    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setActiveTab('community');
      setTitle('');
      setDesc('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      <div className="tactical-border w-full max-w-4xl bg-[#090c13] max-h-[90vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-military text-2xl text-emerald-400 tracking-wider">
                BATTLE MAPS & AUDIENCE CREATOR STUDIO
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-tactical">
                <span>FOREST MAPS · FREE FIRE STYLE</span>
                <span aria-hidden="true">·</span>
                <span>COMMUNITY PUBLISHING</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-black/30 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('official')}
            className={`px-4 py-1.5 rounded font-tactical text-xs font-bold transition-colors ${
              activeTab === 'official'
                ? 'bg-emerald-500 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            OFFICIAL FOREST MAPS ({officialMaps.length})
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-1.5 rounded font-tactical text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'bg-emerald-500 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>COMMUNITY PUBLISHED ({communityMaps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`px-4 py-1.5 rounded font-tactical text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'creator'
                ? 'bg-amber-500 text-black'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE & PUBLISH MAP</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: OFFICIAL MAPS */}
          {activeTab === 'official' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {officialMaps.map(m => {
                const isSelected = selectedMap.id === m.id;
                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/20 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-[#0f131c] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-tactical font-bold text-base text-white">
                          {m.name}
                        </span>
                        <span className="px-2 py-0.5 bg-black/60 text-emerald-400 text-[10px] font-tactical rounded border border-emerald-500/30">
                          FOREST ARENA
                        </span>
                      </div>
                      <div className="text-xs text-amber-400 font-tactical mb-2">
                        {m.subtitle}
                      </div>
                      <p className="text-xs text-slate-400 font-tactical leading-relaxed mb-4">
                        {m.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-tactical">
                        <TreePine className="w-4 h-4 text-emerald-500" />
                        <span>High Foliage Density</span>
                      </div>

                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectMap(m);
                        }}
                        className={`px-4 py-1.5 rounded font-tactical text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-black shadow'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isSelected ? 'SELECTED MAP' : 'SELECT MAP'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: AUDIENCE PUBLISHED MAPS */}
          {activeTab === 'community' && (
            <div className="space-y-3">
              {communityMaps.map(pub => (
                <div
                  key={pub.id}
                  className="p-4 bg-[#0d1017] border border-slate-800 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-tactical font-bold text-base text-white">
                        {pub.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-tactical px-1.5 py-0.5 bg-black/60 rounded">
                        by {pub.creator}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-tactical">
                      {pub.description}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-tactical pt-1">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <TreePine className="w-3.5 h-3.5" /> {pub.treeCount} Trees
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Car className="w-3.5 h-3.5" /> {pub.vehicleSpawns} Vehicles
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Shield className="w-3.5 h-3.5" /> {pub.bunkerCount} Bunkers
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpvoteMap(pub.id);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-tactical text-amber-400 flex items-center gap-1.5"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{pub.upvotes}</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        const base = officialMaps[0];
                        onSelectMap({
                          ...base,
                          name: pub.title,
                          description: pub.description,
                        });
                        onClose();
                      }}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-tactical font-bold text-xs rounded transition-colors"
                    >
                      DEPLOY HERE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: AUDIENCE MAP CREATOR & PUBLISHER ("audience can create some games and publish it") */}
          {activeTab === 'creator' && (
            <form onSubmit={handleCreateAndPublish} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className="block text-xs font-tactical text-slate-400 mb-1">
                  MAP TITLE
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Ronin Bamboo Sniper Ridge"
                  required
                  className="w-full px-3 py-2 bg-black/70 border border-slate-800 rounded text-xs font-tactical text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-tactical text-slate-400 mb-1">
                  CREATOR GAMERTAG
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={e => setCreatorName(e.target.value)}
                  placeholder="e.g. MasterGamer_Tamil"
                  required
                  className="w-full px-3 py-2 bg-black/70 border border-slate-800 rounded text-xs font-tactical text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-tactical text-slate-400 mb-1">
                  MAP THEME & BIOME
                </label>
                <select
                  value={baseTheme}
                  onChange={e => setBaseTheme(e.target.value as MapEnvironment['theme'])}
                  className="w-full px-3 py-2 bg-black/70 border border-slate-800 rounded text-xs font-tactical text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="deep_forest">Dense Rain Forest & Bermuda Pines</option>
                  <option value="bamboo_grove">Ronin Sacred Bamboo Grove (Stealth)</option>
                  <option value="pine_valley">Kalahari Highland Woodland</option>
                  <option value="cyber_jungle">Neo-Verdant Cyber Woods</option>
                  <option value="sunset_canopy">Golden Hour Autumn Forest</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-tactical text-slate-400 mb-1">
                    TREES: {treeDensity}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    value={treeDensity}
                    onChange={e => setTreeDensity(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-tactical text-slate-400 mb-1">
                    BUNKERS: {bunkerDensity}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="14"
                    value={bunkerDensity}
                    onChange={e => setBunkerDensity(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-tactical text-slate-400 mb-1">
                    VEHICLES: {vehicleSpawns}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={vehicleSpawns}
                    onChange={e => setVehicleSpawns(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-tactical text-slate-400 mb-1">
                  TACTICAL DESCRIPTION & OBJECTIVE
                </label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Describe choke points, vehicle ambush spots, sniper towers..."
                  rows={3}
                  className="w-full px-3 py-2 bg-black/70 border border-slate-800 rounded text-xs font-tactical text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {publishedSuccess ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500 rounded text-center text-xs font-tactical text-emerald-300 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>MAP PUBLISHED TO AUDIENCE SERVER SUCCESSFULLY!</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Share2 className="w-4 h-4" />
                  <span>PUBLISH MAP TO AUDIENCE COMMUNITY</span>
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
