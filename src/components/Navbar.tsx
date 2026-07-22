import React from 'react';
import { Gavel, User, LogOut, ShieldCheck, KeyRound, Bookmark, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'about' | 'auction' | 'contact' | 'watchlist' | 'analytics' | 'profile';
  auctionSubTab: 'live' | 'upcoming' | 'past';
  onSelectTab: (tab: 'home' | 'about' | 'auction' | 'contact' | 'watchlist' | 'analytics' | 'profile') => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  onLogout: () => void;
  savedLotsCount: number;
}

export default function Navbar({
  activeTab,
  onSelectTab,
  onOpenLogin,
  onOpenRegister,
  isLoggedIn,
  userProfile,
  onLogout,
  savedLotsCount
}: NavbarProps) {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
      
      {/* Top Disclaimer / Helpline Bar */}
      <div className="bg-slate-950 text-slate-400 px-4 py-1.5 text-[11px] border-b border-slate-800/80 flex justify-between items-center font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> India's Verified Salvage & Scrap E-Auction Platform
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">Helpline: +91 88003 35916 / info@salvageportal.in</span>
        </div>
        <div className="flex items-center gap-2">
          <span>EMD & GST Compliant</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="nav-logo"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Gavel className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-display font-black text-lg text-white tracking-wide uppercase leading-tight flex items-center gap-1">
              <span>SALVAGE</span>
              <span className="text-emerald-400 font-extrabold">SETTLERS</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase">
              E-AUCTION PORTAL
            </span>
          </div>
        </div>

        {/* 4 Main Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/60" id="main-4-nav">
          
          <button
            onClick={() => onSelectTab('home')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
              activeTab === 'home'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            id="nav-link-home"
          >
            Home
          </button>

          <button
            onClick={() => onSelectTab('about')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
              activeTab === 'about'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            id="nav-link-about"
          >
            About Us
          </button>

          <button
            onClick={() => onSelectTab('auction')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition-all flex items-center gap-1.5 ${
              activeTab === 'auction'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            id="nav-link-auction"
          >
            <span>Auction</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-extrabold">
              Live/Upcoming
            </span>
          </button>

          <button
            onClick={() => onSelectTab('contact')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
              activeTab === 'contact'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            id="nav-link-contact"
          >
            Contact Us
          </button>

        </nav>

        {/* Top Right Actions: Login & Register OR Logged In Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Watchlist Quick Button */}
          <button
            onClick={() => onSelectTab('watchlist')}
            className={`p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition relative ${
              activeTab === 'watchlist' ? 'ring-2 ring-indigo-500 text-white' : ''
            }`}
            title="Monitored Watchlist Lots"
            id="nav-watchlist-btn"
          >
            <Bookmark className="w-4 h-4 fill-current" />
            {savedLotsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {savedLotsCount}
              </span>
            )}
          </button>

          {/* Analytics Quick Button */}
          <button
            onClick={() => onSelectTab('analytics')}
            className={`p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition ${
              activeTab === 'analytics' ? 'ring-2 ring-indigo-500 text-white' : ''
            }`}
            title="Analytics & Capital Outlay Hub"
            id="nav-analytics-btn"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          {!isLoggedIn ? (
            /* Login & Register Buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                id="header-login-btn"
              >
                Login
              </button>

              <button
                onClick={onOpenRegister}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer hover:scale-[1.02]"
                id="header-register-btn"
              >
                Register
              </button>
            </div>
          ) : (
            /* Logged-In User Profile Menu */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('profile')}
                className={`flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl transition ${
                  activeTab === 'profile' ? 'border-indigo-500 bg-slate-800/90' : ''
                }`}
                id="header-profile-btn"
              >
                <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                  {userProfile?.username ? userProfile.username[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-slate-200 block leading-tight truncate max-w-[100px]">
                    {userProfile?.username || 'nikhiluw'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block">
                    ₹{userProfile?.balance.toLocaleString()} INR
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-800 transition"
                title="Log Out"
                id="header-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile 4-Item Tab Bar */}
      <div className="lg:hidden bg-slate-950 border-t border-slate-800 py-2 px-4 flex items-center justify-around font-display text-xs">
        <button
          onClick={() => onSelectTab('home')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'home' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Home
        </button>
        <button
          onClick={() => onSelectTab('about')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'about' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
        >
          About Us
        </button>
        <button
          onClick={() => onSelectTab('auction')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'auction' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Auction
        </button>
        <button
          onClick={() => onSelectTab('contact')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'contact' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Contact Us
        </button>
      </div>

    </header>
  );
}
