import React from 'react';
import { X, Sliders, Monitor, Eye, Volume2, VolumeX, Crosshair, Shield, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

export interface GameGraphicsSettings {
  graphicsQuality: number; // 1 to 10 (Roblox style)
  fov: number; // 60 to 95
  sensitivity: number; // 0.5 to 2.5
  cameraMode: 'first_person' | 'third_person';
  showDamageNumbers: boolean;
  particlesEnabled: boolean;
}

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameGraphicsSettings;
  onUpdateSettings: (newSettings: Partial<GameGraphicsSettings>) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  isMuted,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0a0e17] border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-black/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-military text-lg text-white tracking-wide">
                ROBLOX ENGINE SETTINGS
              </h3>
              <p className="text-[10px] text-slate-400 font-tactical">
                Configure graphics fidelity, camera perspective, and controls
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

        {/* SETTINGS BODY */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. ROBLOX GRAPHICS QUALITY (1 - 10 SLIDER) */}
          <div className="p-3.5 bg-black/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-tactical font-bold text-white flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-amber-400" />
                <span>GRAPHICS QUALITY</span>
              </span>
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs rounded">
                LEVEL {settings.graphicsQuality} / 10
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={settings.graphicsQuality}
              onChange={(e) => onUpdateSettings({ graphicsQuality: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-tactical mt-1.5">
              <span>Fast (Level 1)</span>
              <span>Balanced (Level 5)</span>
              <span>Ultra HD (Level 10)</span>
            </div>
          </div>

          {/* 2. CAMERA PERSPECTIVE: 1P vs 3P */}
          <div className="p-3.5 bg-black/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-tactical font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>CAMERA PERSPECTIVE [V]</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {settings.cameraMode === 'first_person' ? 'FIRST-PERSON FPS' : '3RD-PERSON OTS'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ cameraMode: 'first_person' });
                }}
                className={`py-2 px-3 rounded-lg text-xs font-tactical font-bold border transition-all ${
                  settings.cameraMode === 'first_person'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400/50'
                    : 'bg-black/50 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1ST PERSON (FPS)
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ cameraMode: 'third_person' });
                }}
                className={`py-2 px-3 rounded-lg text-xs font-tactical font-bold border transition-all ${
                  settings.cameraMode === 'third_person'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400/50'
                    : 'bg-black/50 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                3RD PERSON (ROBLOX OTS)
              </button>
            </div>
          </div>

          {/* 3. FIELD OF VIEW (FOV) */}
          <div className="p-3.5 bg-black/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-tactical font-bold text-white flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <span>FIELD OF VIEW (FOV)</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {settings.fov}°
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={95}
              step={1}
              value={settings.fov}
              onChange={(e) => onUpdateSettings({ fov: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-tactical mt-1.5">
              <span>60° (Focused)</span>
              <span>75° (Default)</span>
              <span>95° (Wide Arena)</span>
            </div>
          </div>

          {/* 4. MOUSE / TOUCH LOOK SENSITIVITY */}
          <div className="p-3.5 bg-black/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-tactical font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>LOOK SENSITIVITY</span>
              </span>
              <span className="text-xs font-mono font-bold text-purple-400">
                {settings.sensitivity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={settings.sensitivity}
              onChange={(e) => onUpdateSettings({ sensitivity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* 5. FLOATING DAMAGE NUMBERS & PARTICLES */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ showDamageNumbers: !settings.showDamageNumbers });
              }}
              className={`p-3 rounded-xl border text-xs font-tactical font-bold flex items-center justify-between ${
                settings.showDamageNumbers
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                  : 'bg-black/50 border-slate-800 text-slate-500'
              }`}
            >
              <span>3D DAMAGE NUMBERS</span>
              <span className="font-mono text-[10px]">{settings.showDamageNumbers ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ particlesEnabled: !settings.particlesEnabled });
              }}
              className={`p-3 rounded-xl border text-xs font-tactical font-bold flex items-center justify-between ${
                settings.particlesEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                  : 'bg-black/50 border-slate-800 text-slate-500'
              }`}
            >
              <span>HIT SPARKS & DUST</span>
              <span className="font-mono text-[10px]">{settings.particlesEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 bg-black/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onToggleMute()}
            className="flex items-center gap-1.5 text-xs font-tactical text-slate-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded-lg shadow-md"
          >
            APPLY & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
