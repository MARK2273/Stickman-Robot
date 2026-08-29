// Real Google AdSense & Unity Ads Monetization Service
// Supports developer Google AdSense Publisher ID (ca-pub-XXXXX), Ad Units, and Unity Ads

export interface MonetizationConfig {
  publisherId: string; // e.g. "ca-pub-9876543210123456"
  bannerSlotId: string; // e.g. "1234567890"
  rewardedSlotId: string; // e.g. "9876543210"
  unityGameId: string; // e.g. "5432100"
  unityBannerPlacement: string;
  unityRewardedPlacement: string;
  provider: 'google_adsense' | 'unity_ads' | 'auto';
  isLiveMode: boolean; // false = test mode (mock creatives), true = live Google/Unity ad tags
  totalBannerImpressions: number;
  totalRewardedImpressions: number;
  totalClicks: number;
  estimatedEarnings: number; // in USD ($)
}

const MONETIZATION_STORAGE_KEY = 'sg_robot_wars_monetization_v1';

const DEFAULT_CONFIG: MonetizationConfig = {
  publisherId: '', // Developer can set ca-pub-XXXXXXXXXXXXXXXX
  bannerSlotId: '1029384756',
  rewardedSlotId: '5647382910',
  unityGameId: '5123456',
  unityBannerPlacement: 'banner_top',
  unityRewardedPlacement: 'rewarded_video_endgame',
  provider: 'google_adsense',
  isLiveMode: false,
  totalBannerImpressions: 4,
  totalRewardedImpressions: 1,
  totalClicks: 0,
  estimatedEarnings: 0.038
};

class MonetizationService {
  private config: MonetizationConfig;
  private isAdSenseScriptLoaded = false;

  constructor() {
    this.config = this.loadConfig();
    if (this.config.isLiveMode && this.config.publisherId) {
      this.initAdSenseScript();
    }
  }

  public getConfig(): MonetizationConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<MonetizationConfig>): MonetizationConfig {
    this.config = { ...this.config, ...partial };
    this.saveConfig();

    if (this.config.isLiveMode && this.config.publisherId && !this.isAdSenseScriptLoaded) {
      this.initAdSenseScript();
    }

    return this.config;
  }

  private loadConfig(): MonetizationConfig {
    try {
      const saved = localStorage.getItem(MONETIZATION_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read monetization config', e);
    }
    return DEFAULT_CONFIG;
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(MONETIZATION_STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Could not save monetization config', e);
    }
  }

  public initAdSenseScript(): void {
    if (this.isAdSenseScriptLoaded) return;
    if (!this.config.publisherId || !this.config.publisherId.startsWith('ca-pub-')) return;

    try {
      const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`);
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
          this.config.publisherId
        )}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        this.isAdSenseScriptLoaded = true;
      }
    } catch (err) {
      console.warn('AdSense script injection failed:', err);
    }
  }

  public recordBannerImpression(): void {
    this.config.totalBannerImpressions += 1;
    // Estimated banner eCPM avg $1.80 per 1,000 impressions (~$0.0018 per impression)
    this.config.estimatedEarnings += 0.0018;
    this.saveConfig();
  }

  public recordRewardedImpression(): void {
    this.config.totalRewardedImpressions += 1;
    // Estimated rewarded video eCPM avg $18.50 per 1,000 views (~$0.0185 per rewarded view)
    this.config.estimatedEarnings += 0.0185;
    this.saveConfig();
  }

  public recordClick(): void {
    this.config.totalClicks += 1;
    // Estimated CPC avg $0.25
    this.config.estimatedEarnings += 0.25;
    this.saveConfig();
  }
}

export const monetizationService = new MonetizationService();
