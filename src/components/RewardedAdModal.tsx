import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, CheckCircle, Sparkles, X, Play, ExternalLink, ShieldCheck, DollarSign } from 'lucide-react';
import { soundManager } from '../services/audio';
import { monetizationService } from '../services/monetization';

interface RewardedAdModalProps {
  rewardTitle: string;
  rewardIcon: string;
  onRewardComplete: () => void;
  onClose: () => void;
}

const AD_CREATIVES = [
  {
    sponsor: 'Google Cloud Platform',
    title: 'Deploy Next-Gen Generative AI with Vertex AI',
    tagline: 'Train and scale machine learning models with industry-leading Google Cloud TPU clusters.',
    bgGradient: 'from-blue-900 via-indigo-950 to-slate-950',
    accentColor: '#3b82f6',
    domain: 'cloud.google.com',
    icon: '⚡'
  },
  {
    sponsor: 'Unity Technologies',
    title: 'Cyberpunk Mech Showdown 2088',
    tagline: 'Experience real-time raytraced physics and hyper-sonic 3D combat arenas.',
    bgGradient: 'from-purple-900 via-violet-950 to-slate-950',
    accentColor: '#a855f7',
    domain: 'unity.com',
    icon: '🤖'
  },
  {
    sponsor: 'Google Play Games',
    title: 'Stickman Gunner: Robot Wars Mobile',
    tagline: 'Join 5M+ players defending the galaxy against rogue synthetic cyber swarms.',
    bgGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    accentColor: '#10b981',
    domain: 'play.google.com',
    icon: '🎯'
  }
];

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  rewardTitle,
  rewardIcon,
  onRewardComplete,
  onClose
}) => {
  const [adCreative] = useState(() => AD_CREATIVES[Math.floor(Math.random() * AD_CREATIVES.length)]);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Record rewarded video impression
    monetizationService.recordRewardedImpression();

    // 5-second countdown timer for rewarded video ad
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          soundManager.playCoin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  const handleClaim = () => {
    soundManager.playLevelUp();
    onRewardComplete();
  };

  return (
    <div
      id="rewarded-ad-player-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-lg bg-[#09090e] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header: Ad Sponsor & Countdown Status */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-white/10 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              Google & Unity Ads
            </span>
            <span className="text-xs font-bold text-zinc-300 truncate">{adCreative.sponsor}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 text-zinc-400 hover:text-white rounded-lg transition"
              title="Toggle Ad Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Countdown / Skip / Close */}
            {isCompleted ? (
              <button
                id="rewarded-ad-close-btn"
                onClick={onClose}
                className="p-1 text-zinc-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                title="Close Ad"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Reward in {secondsRemaining}s
              </span>
            )}
          </div>
        </div>

        {/* Video / Creative Viewport Simulation */}
        <div className={`relative h-64 sm:h-72 bg-gradient-to-b ${adCreative.bgGradient} flex flex-col items-center justify-center p-6 text-center overflow-hidden`}>
          {/* Subtle Ambient Pulse */}
          <div
            className="absolute w-56 h-56 rounded-full blur-[70px] opacity-30 animate-pulse pointer-events-none"
            style={{ backgroundColor: adCreative.accentColor }}
          />

          {/* Animated Sponsor Icon & Sparks */}
          <div className="relative mb-3 flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border border-white/20 backdrop-blur-md"
              style={{ backgroundColor: `${adCreative.accentColor}30` }}
            >
              {adCreative.icon}
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-300 animate-spin" />
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white max-w-sm leading-snug drop-shadow-md">
            {adCreative.title}
          </h3>
          <p className="text-xs text-zinc-300 max-w-sm mt-1.5 leading-relaxed opacity-90">
            {adCreative.tagline}
          </p>

          {/* External Call to Action Button */}
          <button
            onClick={() => {
              monetizationService.recordClick();
              window.open(`https://${adCreative.domain}`, '_blank', 'noopener,noreferrer');
            }}
            className="mt-4 px-4 py-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <span>Learn More & Install</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Bar (Simulates 5s video playback) */}
        <div className="w-full h-1.5 bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottom Reward Action Bar */}
        <div className="p-4 bg-zinc-950 flex items-center justify-between gap-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
              {rewardIcon}
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-mono block">Pending Reward</span>
              <span className="text-xs font-black text-amber-400 leading-none">{rewardTitle}</span>
            </div>
          </div>

          {/* Claim Button (Active after countdown finishes) */}
          {isCompleted ? (
            <button
              id="claim-rewarded-ad-btn"
              onClick={handleClaim}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <CheckCircle className="w-4 h-4" />
              <span>COLLECT REWARD</span>
            </button>
          ) : (
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-500 text-xs font-mono font-bold flex items-center gap-1.5">
              <span>Watching ({secondsRemaining}s)...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
