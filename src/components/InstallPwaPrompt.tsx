import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle2, Monitor, ArrowDownToLine, Sparkles } from 'lucide-react';
import { soundManager } from '../services/audio';

interface InstallPwaPromptProps {
  isLight: boolean;
  variant?: 'header' | 'banner' | 'card';
}

export function InstallPwaPrompt({ isLight, variant = 'header' }: InstallPwaPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).deferredPwaPrompt || null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
  });

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const checkStandalone = () => {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    (window.navigator as any).standalone === true;
      setIsStandalone(isPWA);
    };

    checkStandalone();

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOSDevice);

    // If early listener caught the event
    if ((window as any).deferredPwaPrompt) {
      setDeferredPrompt((window as any).deferredPwaPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPwaPrompt = e;
      setDeferredPrompt(e);
    };

    const handlePwaReady = () => {
      if ((window as any).deferredPwaPrompt) {
        setDeferredPrompt((window as any).deferredPwaPrompt);
      }
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      (window as any).deferredPwaPrompt = null;
      setTimeout(() => setShowModal(false), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePwaReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePwaReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // If already installed and launched as standalone PWA, hide install prompts
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      soundManager.playClick();
    } catch {}

    const promptObj = deferredPrompt || (window as any).deferredPwaPrompt;
    if (promptObj && typeof promptObj.prompt === 'function') {
      try {
        await promptObj.prompt();
        const choice = await promptObj.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setInstalled(true);
          setDeferredPrompt(null);
          (window as any).deferredPwaPrompt = null;
          setTimeout(() => setShowModal(false), 2000);
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
        setShowModal(true);
      }
    } else {
      // Show manual instructions modal for iOS or browsers waiting for user engagement
      setShowModal(true);
    }
  };

  const handleDismissBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {/* VARIANT 1: Header Compact Install Button */}
      {variant === 'header' && (
        <button
          id="pwa-header-install-btn"
          onClick={handleInstallClick}
          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 border rounded-lg sm:rounded-xl transition backdrop-blur-md cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 font-black text-[9px] sm:text-xs ${
            isLight
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-emerald-400/50 shadow-emerald-500/20 animate-pulse'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border-emerald-400/40 shadow-[0_0_14px_rgba(16,185,129,0.4)] animate-pulse'
          }`}
          title="Install / Download Game as Native App (PWA)"
        >
          <ArrowDownToLine className="w-3 h-3 text-emerald-200 animate-bounce" />
          <span>INSTALL APP</span>
        </button>
      )}

      {/* VARIANT 2: Prominent Main Menu Download / Install Card */}
      {variant === 'card' && (
        <div
          onClick={handleInstallClick}
          className={`w-full p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shadow-md active:scale-98 flex items-center justify-between gap-2 group ${
            isLight
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 hover:from-emerald-100 hover:to-cyan-100 border-emerald-300 text-emerald-950 shadow-emerald-500/10'
              : 'bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-cyan-950/40 hover:from-emerald-900/50 hover:to-cyan-900/50 border-emerald-500/40 text-zinc-100 shadow-[0_4px_16px_rgba(16,185,129,0.2)]'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wide">
                  Download / Install App
                </span>
                <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500 text-white font-extrabold uppercase tracking-wider">
                  PWA
                </span>
              </div>
              <p className={`text-[9px] sm:text-[10px] ${isLight ? 'text-emerald-800' : 'text-zinc-400'}`}>
                Play full-screen with offline support & instant load
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-sm transition flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>INSTALL</span>
            <Sparkles className="w-3 h-3 text-emerald-200" />
          </button>
        </div>
      )}

      {/* VARIANT 3: Floating / Banner Notification */}
      {variant === 'banner' && !isDismissed && (
        <div className="fixed bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:bottom-4 z-40 max-w-sm w-full mx-auto animate-fade-in">
          <div
            className={`p-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 ${
              isLight
                ? 'bg-white/95 border-emerald-300 text-slate-900 shadow-emerald-500/20'
                : 'bg-zinc-900/95 border-emerald-500/50 text-zinc-100 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <ArrowDownToLine className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0 text-left">
                <h4 className="text-xs font-black uppercase tracking-wide truncate">
                  Install Robot Wars
                </h4>
                <p className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Install as PWA for fastest offline gaming!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider shadow transition cursor-pointer active:scale-95"
              >
                Install
              </button>
              <button
                onClick={handleDismissBanner}
                className={`p-1 rounded-lg transition ${
                  isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-white/10 text-zinc-400'
                }`}
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP / INSTRUCTIONS MODAL FOR ALL PLATFORMS */}
      {showModal && (
        <div
          id="pwa-install-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div
            className={`relative w-full max-w-md rounded-3xl border p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-center ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0f1115] border-white/15 text-zinc-100'
            }`}
          >
            {/* Close Button */}
            <button
              id="pwa-modal-close-btn"
              onClick={() => {
                soundManager.playClick();
                setShowModal(false);
              }}
              className={`absolute top-3.5 right-3.5 p-1.5 rounded-xl border transition cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Title Header */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-1 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                <img
                  src="/pwa-192x192.png"
                  alt="Robot Wars Icon"
                  className="w-full h-full rounded-xl object-cover bg-black"
                />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide">
                  Install Stickman Robot Wars
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Official Progressive Web App (PWA)
                </p>
              </div>
            </div>

            {/* If app is already marked installed */}
            {installed ? (
              <div className="flex flex-col items-center gap-2 py-4 text-emerald-500">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
                <span className="font-bold text-base">App Successfully Installed!</span>
                <p className="text-xs text-zinc-400">You can now launch it directly from your home screen or desktop.</p>
              </div>
            ) : deferredPrompt ? (
              /* Direct Chrome / Edge / Android Native 1-Click Install */
              <div className="space-y-3 pt-2">
                <div className={`p-3 rounded-2xl border text-xs text-left ${
                  isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                }`}>
                  ✨ <strong>Instant 1-Click Install Available:</strong> Click the button below to install directly to your device.
                </div>
                <button
                  id="pwa-modal-direct-install-btn"
                  onClick={async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') {
                        setInstalled(true);
                        setTimeout(() => setShowModal(false), 2000);
                      }
                      setDeferredPrompt(null);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Download className="w-5 h-5" />
                  Install App to Device
                </button>
              </div>
            ) : isIOS ? (
              /* iOS Safari Installation Steps */
              <div className={`p-3.5 rounded-2xl border text-left space-y-2.5 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
              }`}>
                <div className="font-black flex items-center gap-1.5 text-sky-400 uppercase tracking-wider text-[11px]">
                  <Smartphone className="w-4 h-4" />
                  <span>How to install on iPhone / iPad:</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-xs shrink-0">1</div>
                  <span>Tap the <Share className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> <strong>Share button</strong> in Safari toolbar.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-xs shrink-0">2</div>
                  <span>Scroll down & select <PlusSquare className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-xs shrink-0">3</div>
                  <span>Tap <strong>Add</strong> at top right to launch full-screen!</span>
                </div>
              </div>
            ) : (
              /* Chrome Desktop / Android Browser Steps */
              <div className={`p-3.5 rounded-2xl border text-left space-y-3 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/40 border-white/10 text-zinc-300'
              }`}>
                <div className="font-black flex items-center gap-1.5 text-emerald-400 uppercase tracking-wider text-[11px]">
                  <Monitor className="w-4 h-4" />
                  <span>Desktop & Android Chrome / Edge:</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">A</div>
                    <div>
                      <strong>Address Bar:</strong> Look for the <strong>Install App icon (🖥️ / ⬇️)</strong> on the right side of your browser URL bar.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">B</div>
                    <div>
                      <strong>Browser Menu:</strong> Click the <strong>⋮ (3 dots menu)</strong> at top right &rarr; select <strong>"Install Stickman Gunner"</strong> or <strong>"Install App"</strong>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PWA Advantages Features List */}
            <div className={`p-2.5 rounded-xl border text-[10px] sm:text-[11px] grid grid-cols-2 gap-2 text-left ${
              isLight ? 'bg-slate-100/70 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-zinc-400'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">⚡</span> Fast Offline Play
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sky-400">📱</span> Full-Screen Immersion
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">💾</span> Auto Local Save
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-purple-400">🚀</span> Zero App Store Lag
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
