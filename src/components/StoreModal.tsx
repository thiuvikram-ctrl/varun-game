import React, { useState } from 'react';
import { TOP_UP_BUNDLES } from '../data/gameData';
import { TopUpBundle } from '../types/game';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Gem, Coins, Check, Gift, Sparkles, X, 
  CreditCard, ShieldCheck, Flame, Calendar, Clock
} from 'lucide-react';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  diamonds: number;
  coins: number;
  lastMonthlyClaimTime: number;
  lastDailyClaimTime: number;
  onTopUp: (diamonds: number, coins: number) => void;
  onClaimMonthly: () => void;
  onClaimDaily: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  diamonds,
  coins,
  lastMonthlyClaimTime,
  lastDailyClaimTime,
  onTopUp,
  onClaimMonthly,
  onClaimDaily,
}) => {
  const [purchasingBundle, setPurchasingBundle] = useState<TopUpBundle | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'select' | 'confirm' | 'success'>('select');

  if (!isOpen) return null;

  // Monthly claim availability check (30 days = 30 * 24 * 60 * 60 * 1000 ms)
  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  const isMonthlyAvailable = Date.now() - lastMonthlyClaimTime > MONTH_MS;
  const daysLeftMonthly = Math.max(0, Math.ceil((lastMonthlyClaimTime + MONTH_MS - Date.now()) / (24 * 60 * 60 * 1000)));

  // Daily claim availability (24 hours)
  const DAY_MS = 24 * 60 * 60 * 1000;
  const isDailyAvailable = Date.now() - lastDailyClaimTime > DAY_MS;

  const handleStartPurchase = (bundle: TopUpBundle) => {
    sound.playClick();
    setPurchasingBundle(bundle);
    setPurchaseStep('confirm');
  };

  const handleConfirmPurchase = () => {
    if (!purchasingBundle) return;
    sound.playDiamondChime();
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    onTopUp(purchasingBundle.diamonds, purchasingBundle.coins);
    setPurchaseStep('success');

    setTimeout(() => {
      setPurchaseStep('select');
      setPurchasingBundle(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      <div className="tactical-border w-full max-w-4xl bg-[#0a0d14] max-h-[90vh] flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
              <Gem className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-military text-2xl text-amber-400 tracking-wider">
                DIAMOND DEPOT & CURRENCY VAULT
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-tactical">
                <span>WARZONE QUARTERMASTER</span>
                <span aria-hidden="true">·</span>
                <span>INSTANT TACTICAL TOP-UP</span>
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

        {/* CONTENT BODY */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          {/* FREE REWARDS SECTION (Requested: Monthly Free Diamonds!) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Free Diamond Drop */}
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-black to-slate-900/60 border border-amber-500/50 rounded-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-black font-tactical font-bold text-[10px] rounded">
                SPECIAL PERK
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="font-tactical font-bold text-amber-300 text-sm">
                  MONTHLY FREE DIAMOND AIRDROP
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Claim 150 Diamonds + 5,000 Coins every month free of charge as an active combat operator!
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-tactical font-bold">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5" /> +150
                  </span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +5,000
                  </span>
                </div>

                <button
                  onClick={() => {
                    sound.playDiamondChime();
                    confetti({ particleCount: 90, spread: 60 });
                    onClaimMonthly();
                  }}
                  disabled={!isMonthlyAvailable}
                  className={`px-4 py-1.5 rounded font-tactical text-xs font-bold transition-all ${
                    isMonthlyAvailable
                      ? 'bg-amber-500 hover:bg-amber-400 text-black animate-pulse shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isMonthlyAvailable ? 'CLAIM 150 💎 FREE' : `LOCKED (${daysLeftMonthly}d)`}
                </button>
              </div>
            </div>

            {/* Daily Login Ration */}
            <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-black to-slate-900/60 border border-cyan-500/40 rounded-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-600 text-white font-tactical font-bold text-[10px] rounded">
                DAILY RATION
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-cyan-400" />
                <h3 className="font-tactical font-bold text-cyan-300 text-sm">
                  DAILY FIELD SUPPLY DROP
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Daily supply cache containing 25 Diamonds + 1,000 Coins. Refreshes every 24 hours.
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-tactical font-bold">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5" /> +25
                  </span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +1,000
                  </span>
                </div>

                <button
                  onClick={() => {
                    sound.playDiamondChime();
                    onClaimDaily();
                  }}
                  disabled={!isDailyAvailable}
                  className={`px-4 py-1.5 rounded font-tactical text-xs font-bold transition-all ${
                    isDailyAvailable
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isDailyAvailable ? 'CLAIM DAILY 💎' : 'CLAIMED TODAY'}
                </button>
              </div>
            </div>
          </div>

          {/* TOP UP BUNDLES (Featuring exact pricing requested: 500 Diamonds for 215, 10,000 Coins for 200) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-tactical font-bold text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>TACTICAL TOP-UP PACKS</span>
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-tactical">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SECURE INSTANT CREDITING</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TOP_UP_BUNDLES.map(bundle => (
                <div
                  key={bundle.id}
                  className={`relative p-4 rounded-lg border transition-all flex flex-col justify-between ${
                    bundle.isPopular
                      ? 'bg-gradient-to-b from-amber-950/30 to-black border-amber-500 shadow-lg shadow-amber-500/10'
                      : bundle.isBestValue
                      ? 'bg-gradient-to-b from-cyan-950/30 to-black border-cyan-500'
                      : 'bg-[#0f131c] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {bundle.tag && (
                    <div
                      className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded text-[10px] font-tactical font-bold uppercase tracking-wide ${
                        bundle.isPopular
                          ? 'bg-amber-500 text-black'
                          : bundle.isBestValue
                          ? 'bg-cyan-500 text-black'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {bundle.tag}
                    </div>
                  )}

                  <div>
                    <h4 className="font-tactical font-bold text-white text-base mb-1">
                      {bundle.name}
                    </h4>

                    {/* Diamond amount */}
                    <div className="flex items-center gap-2 my-2">
                      <Gem className="w-6 h-6 text-cyan-400 animate-pulse" />
                      <span className="font-military text-3xl font-bold text-white">
                        {bundle.diamonds.toLocaleString()}
                      </span>
                      <span className="text-xs text-cyan-300 font-tactical">DIAMONDS</span>
                    </div>

                    {/* Bonus Coins */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-tactical mb-2">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+ {bundle.coins.toLocaleString()} Bonus Gold Coins</span>
                    </div>

                    {/* Extra item bonus if applicable */}
                    {bundle.bonusItem && (
                      <div className="p-2 bg-black/60 border border-amber-500/30 rounded text-[11px] text-amber-300 font-tactical flex items-center gap-1.5 mb-3">
                        <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Included: {bundle.bonusItem}</span>
                      </div>
                    )}
                  </div>

                  {/* Purchase CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-tactical">PRICE</div>
                      <div className="font-military text-2xl text-amber-400">
                        {bundle.currencySymbol}{bundle.priceAmount}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartPurchase(bundle)}
                      className={`px-4 py-2 rounded font-tactical text-xs font-bold transition-all shadow-md ${
                        bundle.isPopular
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : bundle.isBestValue
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      TOP UP NOW
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PURCHASE CONFIRMATION MODAL OVERLAY */}
        {purchaseStep === 'confirm' && purchasingBundle && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="tactical-border w-full max-w-sm p-6 bg-[#0e111a] text-center">
              <CreditCard className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="font-military text-2xl text-white mb-1">CONFIRM TOP-UP</h3>
              <p className="text-xs text-slate-400 mb-4 font-tactical">
                Authorizing instant crediting of {purchasingBundle.diamonds} Diamonds + {purchasingBundle.coins} Coins
              </p>

              <div className="p-3 bg-black/60 border border-slate-800 rounded mb-5 flex items-center justify-between text-xs font-tactical">
                <span className="text-slate-300">{purchasingBundle.name}</span>
                <span className="font-bold text-amber-400 text-base">
                  {purchasingBundle.currencySymbol}{purchasingBundle.priceAmount}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPurchaseStep('select')}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-tactical text-xs"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors"
                >
                  CONFIRM & PAY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS NOTIFICATION OVERLAY */}
        {purchaseStep === 'success' && purchasingBundle && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="tactical-border w-full max-w-sm p-6 bg-[#0e111a] text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-military text-2xl text-emerald-400 mb-1">TOP-UP SUCCESSFUL!</h3>
              <p className="text-xs text-slate-300 font-tactical">
                +{purchasingBundle.diamonds} Diamonds and +{purchasingBundle.coins} Coins credited to your armory.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
