import React, { useState, useEffect } from 'react';
import { ExternalLink, Info, X, DollarSign, Sparkles } from 'lucide-react';
import { monetizationService } from '../services/monetization';

interface AdBannerProps {
  type: 'google' | 'unity';
  position?: 'top' | 'bottom' | 'inline';
  isLight?: boolean;
  className?: string;
  onOpenMonetization?: () => void;
}

const GOOGLE_ADS = [
  {
    title: 'Google Pixel 9 Pro with Gemini AI',
    desc: 'Supercharge your mobile gaming & daily workflow with next-gen Gemini AI.',
    cta: 'Explore Pixel',
    domain: 'store.google.com',
    tag: 'Hardware'
  },
  {
    title: 'Google Cloud Vertex AI Platform',
    desc: 'Build, deploy, and scale generative AI models on Google Cloud infrastructure.',
    cta: 'Try Free Tier',
    domain: 'cloud.google.com',
    tag: 'Cloud & AI'
  },
  {
    title: 'Google Play Games on Desktop',
    desc: 'Play your favorite 2D/3D action and RPG titles on high-res PC monitors with mouse & keyboard.',
    cta: 'Download Beta',
    domain: 'play.google.com',
    tag: 'Gaming'
  }
];

const UNITY_ADS = [
  {
    title: 'Cyber Mecha 2088: Rogue Vanguard',
    desc: 'Unleash devastating plasma strikes in the premier 3D sci-fi mech shooter.',
    rating: '★ 4.9 (1.2M Reviews)',
    cta: 'Install Free',
    domain: 'unity.com',
    badge: 'Trending Game'
  },
  {
    title: 'Neon Droid Tactics: War of Steel',
    desc: 'Assemble supreme hero divisions and dominate the galactic leaderboards.',
    rating: '★ 4.8 (850K Reviews)',
    cta: 'Play Now',
    domain: 'unity.com',
    badge: 'Editor\'s Choice'
  }
];

export const AdBanner: React.FC<AdBannerProps> = ({
  type,
  position = 'inline',
  isLight = false,
  className = '',
  onOpenMonetization
}) => {
  const [closed, setClosed] = useState(false);
  const [adIndex] = useState(() => Math.floor(Math.random() * (type === 'google' ? GOOGLE_ADS.length : UNITY_ADS.length)));
  const config = monetizationService.getConfig();

  useEffect(() => {
    // Record impression for monetization tracker
    monetizationService.recordBannerImpression();

    // If live AdSense is enabled, attempt push
    if (config.isLiveMode && config.publisherId && (window as any).adsbygoogle) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push error:', e);
      }
    }
  }, [config.isLiveMode, config.publisherId]);

  if (closed) return null;

  // Real Google AdSense Live Element
  if (config.isLiveMode && config.publisherId) {
    return (
      <div
        id="google-adsense-live-banner"
        className={`w-full relative flex flex-col items-center justify-center p-1 rounded-xl border backdrop-blur-md overflow-hidden ${
          isLight ? 'bg-slate-100/90 border-slate-300' : 'bg-[#0d131f]/90 border-blue-500/20'
        } ${className}`}
      >
        <div className="flex items-center justify-between w-full px-2 py-0.5 text-[9px] text-zinc-500">
          <span className="font-mono">Google AdSense • Live Ads</span>
          {onOpenMonetization && (
            <button
              onClick={onOpenMonetization}
              className="text-amber-400 hover:underline flex items-center gap-0.5 font-bold"
            >
              <DollarSign className="w-2.5 h-2.5" />
              <span>Earnings</span>
            </button>
          )}
        </div>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '50px' }}
          data-ad-client={config.publisherId}
          data-ad-slot={config.bannerSlotId || '1029384756'}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Interactive High-Quality Google Ads / Unity Ads Banner (Test & Sandbox Mode)
  if (type === 'google') {
    const ad = GOOGLE_ADS[adIndex];
    return (
      <div
        id="google-ads-banner"
        className={`w-full relative flex items-center justify-between gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border backdrop-blur-md shadow-sm transition overflow-hidden text-left ${
          isLight
            ? 'bg-slate-100/95 border-slate-300 text-slate-800'
            : 'bg-[#0d131f]/90 border-blue-500/20 text-zinc-100'
        } ${className}`}
      >
        {/* Left Side: Google Ad Identifier & Content */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {/* Official Google G Logo Badge */}
          <div className="flex items-center gap-0.5 shrink-0 bg-blue-600/10 border border-blue-500/30 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold text-blue-400">
            <span className="font-black text-blue-500 text-[9px] sm:text-[10px]">G</span>
            <span>Ad</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] sm:text-xs font-bold truncate tracking-tight">{ad.title}</span>
              <span className="hidden sm:inline-block text-[8px] px-1 text-blue-400 font-mono opacity-80">
                {ad.domain}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] truncate opacity-70 leading-tight">
              {ad.desc}
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button, Monetize Settings & Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              monetizationService.recordClick();
              window.open(`https://${ad.domain}`, '_blank', 'noopener,noreferrer');
            }}
            className="px-2 py-0.5 sm:py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[9px] sm:text-[10px] font-bold rounded-lg transition active:scale-95 flex items-center gap-0.5 cursor-pointer shadow-sm"
          >
            <span>{ad.cta}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
          </button>

          {onOpenMonetization && (
            <button
              onClick={onOpenMonetization}
              className="p-1 text-amber-500 hover:text-amber-400 rounded transition cursor-pointer"
              title="Monetization Settings (Set your real ca-pub- ID to earn money!)"
            >
              <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}

          <button
            onClick={() => setClosed(true)}
            className="p-0.5 text-zinc-500 hover:text-zinc-300 rounded transition cursor-pointer"
            title="Dismiss Ad"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Unity Ads Format
  const ad = UNITY_ADS[adIndex];
  return (
    <div
      id="unity-ads-banner"
      className={`w-full relative flex items-center justify-between gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border backdrop-blur-md shadow-sm transition overflow-hidden text-left ${
        isLight
          ? 'bg-slate-100/95 border-slate-300 text-slate-800'
          : 'bg-[#150e24]/90 border-purple-500/20 text-zinc-100'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-0.5 shrink-0 bg-purple-600/10 border border-purple-500/30 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold text-purple-400">
          <span>Unity</span>
          <span>Ad</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-xs font-bold truncate tracking-tight">{ad.title}</span>
            <span className="text-[8px] text-amber-400 font-mono">{ad.rating}</span>
          </div>
          <p className="text-[9px] sm:text-[10px] truncate opacity-70 leading-tight">
            {ad.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => {
            monetizationService.recordClick();
            window.open(`https://${ad.domain}`, '_blank', 'noopener,noreferrer');
          }}
          className="px-2 py-0.5 sm:py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[9px] sm:text-[10px] font-bold rounded-lg transition active:scale-95 flex items-center gap-0.5 cursor-pointer shadow-sm"
        >
          <span>{ad.cta}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
        </button>

        {onOpenMonetization && (
          <button
            onClick={onOpenMonetization}
            className="p-1 text-amber-500 hover:text-amber-400 rounded transition cursor-pointer"
            title="Monetization Settings"
          >
            <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        )}

        <button
          onClick={() => setClosed(true)}
          className="p-0.5 text-zinc-500 hover:text-zinc-300 rounded transition cursor-pointer"
          title="Dismiss Ad"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
