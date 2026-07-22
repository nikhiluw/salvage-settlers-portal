import React, { useState } from 'react';
import { Laptop, Smartphone, Wifi, WifiOff, Battery, Shield, Info } from 'lucide-react';

interface MobileSimulatorProps {
  children: React.ReactNode;
  isOffline: boolean;
  onToggleOffline: () => void;
  syncQueueLength: number;
}

export default function MobileSimulator({ 
  children, 
  isOffline, 
  onToggleOffline, 
  syncQueueLength 
}: MobileSimulatorProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Simulator Control Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" id="shield-icon" />
          <span className="font-display font-semibold text-sm tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            SECURE AUCTION PORTAL
          </span>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700 hidden sm:inline-block">
            DES-256 AES Encryption
          </span>
        </div>

        {/* Device Switcher Controls */}
        <div className="flex items-center gap-1.5 my-1 sm:my-0">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'desktop'
                ? 'bg-indigo-600 text-white shadow'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
            id="desktop-view-btn"
          >
            <Laptop className="w-4.5 h-4.5" />
            <span className="hidden md:inline">Web Workspace</span>
          </button>
          
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'mobile'
                ? 'bg-indigo-600 text-white shadow'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
            id="mobile-view-btn"
          >
            <Smartphone className="w-4.5 h-4.5" />
            <span className="hidden md:inline">Mobile App View</span>
          </button>
        </div>

        {/* Offline Simulation Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isOffline
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
            id="toggle-offline-btn"
            title="Toggle offline bidding queue mode"
          >
            {isOffline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
            <span>{isOffline ? 'Offline Mode' : 'Online State'}</span>
          </button>

          {syncQueueLength > 0 && (
            <span className="bg-amber-500 text-slate-900 font-bold px-2.5 py-0.5 rounded-full text-[10px] animate-pulse">
              {syncQueueLength} Pending Sync
            </span>
          )}
        </div>
      </div>

      {/* Render layout either as Web View or Smartphone Frame */}
      <div className="flex-1 flex items-center justify-center p-0 md:p-4 bg-slate-100 transition-all duration-300">
        {viewMode === 'desktop' ? (
          <div className="w-full h-full bg-slate-50 shadow-inner rounded-xl min-h-[calc(100vh-100px)]">
            {children}
          </div>
        ) : (
          /* High-Fidelity Mobile Smartphone Container */
          <div className="w-[390px] h-[844px] bg-slate-950 rounded-[48px] shadow-2xl border-[12px] border-slate-900 flex flex-col overflow-hidden relative my-4">
            
            {/* Phone Notch/Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 flex items-center justify-center">
              <div className="w-3 h-3 bg-slate-900 rounded-full absolute left-4"></div>
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full absolute right-8"></div>
            </div>

            {/* Mobile Status Bar */}
            <div className="h-10 bg-slate-900 text-slate-300 flex items-center justify-between px-6 text-xs select-none pt-2 font-mono">
              <span>9:41 AM</span>
              <div className="flex items-center gap-1.5">
                {isOffline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="text-[10px]">5G</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px]">88%</span>
                  <Battery className="w-4 h-4 text-emerald-400 rotate-0" />
                </div>
              </div>
            </div>

            {/* Device Screen Workspace */}
            <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col text-slate-900 scrollbar-none relative">
              {children}
            </div>

            {/* Home Indicator Bar */}
            <div className="h-6 bg-slate-950 flex items-center justify-center pb-2 select-none">
              <div className="w-28 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Encryption Indicator */}
      <div className="py-2.5 px-4 bg-white border-t border-slate-200 text-center text-slate-400 text-xs flex flex-wrap items-center justify-center gap-2">
        <span className="flex items-center gap-1 text-slate-500 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure Transport Protocol: 
        </span>
        <span className="font-mono bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 rounded">
          TLS_AES_256_GCM_SHA384
        </span>
        <span className="hidden sm:inline text-slate-300">|</span>
        <span className="hidden sm:inline">Active session validated via Multi-Factor Credential Engine</span>
      </div>
    </div>
  );
}
