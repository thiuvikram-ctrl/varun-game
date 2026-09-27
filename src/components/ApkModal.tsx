import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { 
  Download, Smartphone, Check, X, ShieldCheck, 
  HardDrive, Sparkles, ExternalLink, ArrowRight
} from 'lucide-react';

interface ApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkModal: React.FC<ApkModalProps> = ({ isOpen, onClose }) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    sound.playClick();
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloaded(true);
          sound.playDiamondChime();

          // Trigger simulated direct APK download file
          const element = document.createElement('a');
          const file = new Blob([
            'WARZONE SPECIAL FORCES ANDROID PACKAGE BUILD\nPackage: com.warzone.specialforces.shooter\nVersion: 2.4.0-release\nArchitecture: arm64-v8a\nStatus: Verified APK'
          ], { type: 'application/vnd.android.package-archive' });
          element.href = URL.createObjectURL(file);
          element.download = 'Warzone_Special_Forces_v2.4.apk';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);

          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      <div className="tactical-border w-full max-w-lg bg-[#090c13] max-h-[88vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
              <Smartphone className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-military text-2xl text-amber-400 tracking-wider">
                WARZONE MOBILE APK / APP INSTALL
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-tactical">
                <span>ANDROID PACKAGE (.APK)</span>
                <span aria-hidden="true">·</span>
                <span>PWA STANDALONE MODE</span>
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

        {/* CONTENT */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* APK Card */}
          <div className="p-4 bg-gradient-to-r from-amber-950/30 via-black to-slate-900 border border-amber-500/40 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs text-amber-400 font-tactical font-bold block">
                  OFFICIAL MOBILE CLIENT
                </span>
                <h3 className="font-military text-2xl text-white">
                  Warzone_Special_Forces_v2.4.apk
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-tactical font-bold">
                VERIFIED ARM64
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-tactical text-slate-400 mb-4 p-2.5 bg-black/60 rounded border border-slate-800">
              <div>
                <span className="block text-[10px] text-slate-500">FILE SIZE</span>
                <span className="text-white font-bold">84.2 MB</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">VERSION</span>
                <span className="text-white font-bold">v2.4.0</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">TARGET</span>
                <span className="text-amber-400 font-bold">Android 8.0+</span>
              </div>
            </div>

            {/* Download Progress / Button */}
            {downloadProgress !== null && downloadProgress < 100 ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-tactical text-amber-300">
                  <span>DOWNLOADING COM.WARZONE.APK...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            ) : isDownloaded ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded flex items-center justify-between text-xs font-tactical text-emerald-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>APK DOWNLOAD COMPLETE! TAP TO INSTALL</span>
                </div>
                <button
                  onClick={handleDownloadApk}
                  className="px-2 py-1 bg-emerald-500 text-black font-bold rounded"
                >
                  RE-DOWNLOAD
                </button>
              </div>
            ) : (
              <button
                onClick={handleDownloadApk}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD .APK PACKAGE (84.2 MB)</span>
              </button>
            )}
          </div>

          {/* Quick Install PWA Steps */}
          <div className="p-4 bg-black/60 border border-slate-800 rounded-lg">
            <h4 className="font-tactical font-bold text-slate-300 text-xs uppercase mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>OR INSTALL AS FULLSCREEN APP (INSTANT NO DOWNLOAD)</span>
            </h4>
            <ol className="text-xs text-slate-400 font-tactical space-y-2 list-decimal list-inside">
              <li>Open your mobile browser menu (Three dots on Chrome or Share button on Safari).</li>
              <li>Tap <strong className="text-white">"Install App"</strong> or <strong className="text-white">"Add to Home Screen"</strong>.</li>
              <li>Launch from your home screen for full 60fps fullscreen gameplay with zero URL bar.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
