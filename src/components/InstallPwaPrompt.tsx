import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../services/audio';

interface InstallPwaPromptProps {
  isLight: boolean;
}

export function InstallPwaPrompt({ isLight }: InstallPwaPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    setIsStandalone(isPWA);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOSDevice);

    // Listen for beforeinstallprompt event (Android / Chrome / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setShowModal(false), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // If already installed and launched as PWA standalone, no prompt needed
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    soundManager.playClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setTimeout(() => setShowModal(false), 2000);
      }
      setDeferredPrompt(null);
    } else {
      // If iOS or deferred prompt not fired, show instructions modal
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Top Header / Quick Install Button */}
      <button
        id="pwa-install-app-btn"
        onClick={handleInstallClick}
        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 border rounded-lg sm:rounded-xl transition backdrop-blur-md cursor-pointer shadow-sm active:scale-95 flex items-center gap-1 font-bold text-[9px] sm:text-xs ${
          isLight
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-emerald-400/50 shadow-emerald-500/20'
            : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
        }`}
        title="Install Robot Wars as Native Mobile App"
      >
        <Smartphone className="w-3 h-3 text-emerald-200 animate-bounce" />
        <span className="hidden xs:inline">INSTALL</span> APP
      </button>

      {/* Instructions Modal for Mobile / iOS / Manual Installation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className={`relative w-full max-w-sm rounded-2xl border p-5 shadow-2xl flex flex-col gap-4 text-center ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-900 border-white/15 text-zinc-100'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                setShowModal(false);
              }}
              className={`absolute top-3 right-3 p-1.5 rounded-lg border transition ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Header */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                <img
                  src="/pwa-192x192.svg"
                  alt="App Icon"
                  className="w-full h-full rounded-2xl object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">
                  Install Robot Wars
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Play offline with full-screen mobile controls
                </p>
              </div>
            </div>

            {installed ? (
              <div className="flex flex-col items-center gap-2 py-4 text-emerald-500">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
                <span className="font-bold text-sm">App Successfully Installed!</span>
              </div>
            ) : isIOS ? (
              /* iOS Safari Installation Steps */
              <div className={`p-3 rounded-xl border text-left space-y-2 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-sky-500">
                  <span>How to install on iOS Safari:</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-xs shrink-0">1</div>
                  <span>Tap the <Share className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> <strong>Share</strong> button in Safari's menu.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-xs shrink-0">2</div>
                  <span>Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-xs shrink-0">3</div>
                  <span>Tap <strong>Add</strong> at top right to launch full-screen.</span>
                </div>
              </div>
            ) : deferredPrompt ? (
              /* Direct Install Trigger */
              <div className="space-y-3">
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  Install directly onto your home screen for instantaneous loading and offline play.
                </p>
                <button
                  onClick={async () => {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                      setInstalled(true);
                      setTimeout(() => setShowModal(false), 2000);
                    }
                    setDeferredPrompt(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-black text-sm uppercase tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Install App Now
                </button>
              </div>
            ) : (
              /* Chrome / Android Fallback */
              <div className={`p-3 rounded-xl border text-left space-y-2 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
              }`}>
                <div className="font-bold text-sky-500">Android / Chrome Steps:</div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-[10px] shrink-0">1</div>
                  <span>Tap the <strong>3 vertical dots (⋮)</strong> menu in your browser.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-[10px] shrink-0">2</div>
                  <span>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
