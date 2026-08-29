import React, { useState, useEffect } from 'react';
import { DollarSign, ShieldCheck, HelpCircle, ExternalLink, RefreshCw, CheckCircle, AlertCircle, Play, Eye, X, Settings } from 'lucide-react';
import { monetizationService, MonetizationConfig } from '../services/monetization';
import { soundManager } from '../services/audio';

interface MonetizationModalProps {
  theme?: 'dark' | 'light';
  onClose: () => void;
  onTestRewardedAd?: () => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  theme = 'dark',
  onClose,
  onTestRewardedAd
}) => {
  const isLight = theme === 'light';
  const [config, setConfig] = useState<MonetizationConfig>(monetizationService.getConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'guide' | 'earnings'>('config');

  // Input states
  const [publisherId, setPublisherId] = useState(config.publisherId);
  const [bannerSlotId, setBannerSlotId] = useState(config.bannerSlotId);
  const [rewardedSlotId, setRewardedSlotId] = useState(config.rewardedSlotId);
  const [unityGameId, setUnityGameId] = useState(config.unityGameId);
  const [provider, setProvider] = useState(config.provider);
  const [isLiveMode, setIsLiveMode] = useState(config.isLiveMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    soundManager.playLevelUp();
    const updated = monetizationService.updateConfig({
      publisherId: publisherId.trim(),
      bannerSlotId: bannerSlotId.trim(),
      rewardedSlotId: rewardedSlotId.trim(),
      unityGameId: unityGameId.trim(),
      provider,
      isLiveMode
    });
    setConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div
      id="monetization-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 ${
        isLight ? 'bg-slate-900/60' : 'bg-black/85'
      }`}
    >
      <div
        className={`border rounded-3xl w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0c0c0e] border-white/15 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div
          className={`shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${
            isLight ? 'bg-white border-slate-200' : 'bg-black/80 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-2xl border ${
              isLight ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                  Google & Unity Ads Monetization
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono border ${
                  isLiveMode
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {isLiveMode ? 'LIVE MODE' : 'TEST/SANDBOX'}
                </span>
              </div>
              <p className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Connect your Google AdSense / AdMob or Unity account to earn real revenue from players
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 hover:text-red-700 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border border-red-500/40 active:scale-95"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span className="uppercase">CLOSE</span>
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 border-b overflow-x-auto ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950/80 border-white/5'
        }`}>
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'config'
                ? 'bg-amber-500 text-black shadow-md'
                : isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ad Network Credentials</span>
          </button>

          <button
            onClick={() => setActiveSubTab('earnings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'earnings'
                ? 'bg-amber-500 text-black shadow-md'
                : isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Live Revenue Tracker</span>
          </button>

          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'guide'
                ? 'bg-amber-500 text-black shadow-md'
                : isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Monetize Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeSubTab === 'config' && (
            <div className="space-y-4">
              {/* Ad Provider Selector */}
              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-white/5'
              }`}>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2 text-amber-500">
                  Select Primary Monetization Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'google_adsense', label: 'Google AdSense', icon: '🌐' },
                    { id: 'unity_ads', label: 'Unity Ads', icon: '🎮' },
                    { id: 'auto', label: 'Hybrid Auto', icon: '⚡' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                        provider === p.id
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-sm'
                          : isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/40 border-white/5 text-zinc-400'
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Google AdSense / AdMob Configuration */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-white/5'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-blue-500 text-sm">G</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider">Google AdSense Publisher Settings</h3>
                  </div>
                  <a
                    href="https://adsense.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Get Publisher ID</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Google AdSense Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ca-pub-1234567890123456"
                    value={publisherId}
                    onChange={(e) => setPublisherId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/60 border-white/10 text-zinc-100'
                    }`}
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Found in your Google AdSense Dashboard &gt; Account &gt; Settings &gt; Account Information.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Banner Ad Unit / Slot ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1029384756"
                      value={bannerSlotId}
                      onChange={(e) => setBannerSlotId(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/60 border-white/10 text-zinc-100'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Rewarded Video Slot ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5647382910"
                      value={rewardedSlotId}
                      onChange={(e) => setRewardedSlotId(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/60 border-white/10 text-zinc-100'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Unity Ads Settings */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-white/5'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">🎮</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider">Unity Ads Monetization Settings</h3>
                  </div>
                  <a
                    href="https://dashboard.unity3d.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Unity Monetize Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Unity Game ID (7-digit identifier)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5123456"
                    value={unityGameId}
                    onChange={(e) => setUnityGameId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/60 border-white/10 text-zinc-100'
                    }`}
                  />
                </div>
              </div>

              {/* Live vs Sandbox Switch */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-white/5'
              }`}>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Enable Live Production Ads</h4>
                  <p className="text-[11px] text-zinc-400">
                    Switch from test sandbox creatives to real Google AdSense ad network delivery
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition border cursor-pointer ${
                    isLiveMode
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                      : isLight ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-white/10 text-zinc-400 border-white/10'
                  }`}
                >
                  {isLiveMode ? '● LIVE ENABLED' : '○ TEST MODE'}
                </button>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Ad Monetization Configuration</span>
                </button>
                {savedSuccess && (
                  <p className="text-center text-xs font-bold text-emerald-400 mt-2 animate-bounce">
                    ✓ Configuration saved successfully!
                  </p>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'earnings' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-white/5'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3">
                  Developer Monetization Dashboard
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className={`p-3 rounded-xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'
                  }`}>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Estimated Earnings</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      ${config.estimatedEarnings.toFixed(3)}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'
                  }`}>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Banner Impressions</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {config.totalBannerImpressions}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'
                  }`}>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Rewarded Videos</span>
                    <span className="text-lg font-black text-rose-400 font-mono">
                      {config.totalRewardedImpressions}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'
                  }`}>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Est. eCPM</span>
                    <span className="text-lg font-black text-cyan-400 font-mono">
                      $12.50
                    </span>
                  </div>
                </div>
              </div>

              {/* Test Ad Player */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-white/5'
              }`}>
                <h4 className="text-xs font-bold uppercase tracking-wider">Test Monetization Placements</h4>
                <p className="text-xs text-zinc-400">
                  Verify that rewarded video ads and top banner ads award player gold & gems correctly.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {onTestRewardedAd && (
                    <button
                      onClick={() => {
                        onClose();
                        onTestRewardedAd();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Test Rewarded Video Ad</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'guide' && (
            <div className={`p-4 rounded-2xl border space-y-3 text-xs leading-relaxed ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-zinc-900/60 border-white/5 text-zinc-300'
            }`}>
              <h3 className="text-sm font-black uppercase text-amber-500">
                How to Earn Real Money from Stickman Gunner
              </h3>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                  <h4 className="font-bold text-zinc-200 mb-1">Step 1: Sign up for Google AdSense or AdMob</h4>
                  <p className="text-zinc-400 text-[11px]">
                    Create a free account at <a href="https://adsense.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">adsense.google.com</a> or <a href="https://admob.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">admob.google.com</a>.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                  <h4 className="font-bold text-zinc-200 mb-1">Step 2: Copy Your Publisher ID (`ca-pub-XXXXXXXX`)</h4>
                  <p className="text-zinc-400 text-[11px]">
                    In your AdSense dashboard, copy your Publisher ID (starts with <code className="text-amber-400 font-mono">ca-pub-</code>) and paste it in the Ad Network Credentials tab.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                  <h4 className="font-bold text-zinc-200 mb-1">Step 3: Create Ad Units & Deploy</h4>
                  <p className="text-zinc-400 text-[11px]">
                    Create a Responsive Banner Ad Unit and a Rewarded Video Ad Unit. When you deploy the game to your domain, Google will automatically serve real commercial ads and credit earnings to your bank account!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
