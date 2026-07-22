import React, { useState, useEffect, useCallback } from 'react';
import { 
  Gavel, Sparkles, Clock, TrendingUp, FolderLock, Bookmark, 
  User, ShieldAlert, Bell, LogOut, Lock, Shield, Info, X, 
  CheckCircle2, Grid, WifiOff, Volume2, VolumeX, AlertTriangle, ArrowRight, RefreshCw, KeyRound, Check
} from 'lucide-react';
import { AuctionItem, UserProfile, PushNotification, Bid } from './types';

// Import Components
import MobileSimulator from './components/MobileSimulator';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import RegisterModal from './components/RegisterModal';
import DashboardStats from './components/DashboardStats';
import AuctionCard from './components/AuctionCard';
import MediaManager from './components/MediaManager';
import AIAnalyst from './components/AIAnalyst';
import PaymentModal from './components/PaymentModal';
import MfaHandler from './components/MfaHandler';
import AdminPanel from './components/AdminPanel';
import AuctionDetailModal from './components/AuctionDetailModal';

// Audio Synthesizer Prompt
function playAudioChime(type: 'success' | 'outbid' | 'sync', isMuted: boolean) {
  if (isMuted) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'outbid') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'sync') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.06);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (err) {
    // Ignore context interaction blocks
  }
}

export default function App() {
  // Session Authentication & MFA States with LocalStorage Persistence
  const [userMail, setUserMail] = useState<string>(() => {
    return localStorage.getItem('salvage_user_email') || '';
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('salvage_user_email');
  });
  const [password, setPassword] = useState<string>('securepassword123');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);
  const [mfaMessage, setMfaMessage] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Modals for Login & Register
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  // Core App states
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);
  const [emailDispatchPayload, setEmailDispatchPayload] = useState<any | null>(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [selectedAuctionDetail, setSelectedAuctionDetail] = useState<AuctionItem | null>(null);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'auction' | 'contact' | 'watchlist' | 'analytics' | 'profile'>('home');
  const [auctionSubTab, setAuctionSubTab] = useState<'live' | 'upcoming' | 'past'>('live');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState<boolean>(false);

  // Offline capability state
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<{ id: string; auctionId: string; amount: number; timestamp: number }[]>([]);

  // Modals & Panels overlays state
  const [checkoutItem, setCheckoutItem] = useState<AuctionItem | null>(null);
  const [analyzingItem, setAnalyzingItem] = useState<AuctionItem | null>(null);

  // Dynamic Polling of live auctions
  const fetchAuctions = useCallback(async () => {
    if (isOffline) return;
    try {
      const res = await fetch('/api/auctions');
      if (res.ok) {
        const data = await res.json();
        setAuctions(data);
      }
    } catch (err) {
      console.error("Failed to sync auctions with portal:", err);
    }
  }, [isOffline]);

  // Dynamic fetch alerts & notifications 
  const fetchAlerts = useCallback(async () => {
    if (isOffline || !isLoggedIn) return;
    try {
      const res = await fetch(`/api/notifications?email=${userMail}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > notifications.length) {
          const latestAlert = data[data.length - 1];
          if (latestAlert && latestAlert.type === 'outbid') {
            playAudioChime('outbid', isMuted);
          }
        }
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to sync alerts:", err);
    }
  }, [isOffline, isLoggedIn, userMail, notifications.length, isMuted]);

  // Dynamic fetch user profile data
  const fetchProfile = useCallback(async () => {
    if (isOffline || !isLoggedIn) return;
    try {
      const res = await fetch(`/api/auth/profile?email=${userMail}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Failed to sync user profile:", err);
    }
  }, [isOffline, isLoggedIn, userMail]);

  // Watch URL path/hash router for hidden admin view access
  useEffect(() => {
    const handleRouteCheck = () => {
      const isHashAdmin = window.location.hash === '#admin';
      const isPathAdmin = window.location.pathname.endsWith('/admin');
      if (isHashAdmin || isPathAdmin) {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
      }
    };

    handleRouteCheck();

    window.addEventListener('hashchange', handleRouteCheck);
    return () => {
      window.removeEventListener('hashchange', handleRouteCheck);
    };
  }, []);

  // Initial Boot polling interval (every 2.5s for live auction updates)
  useEffect(() => {
    fetchAuctions();
    fetchProfile();
    fetchAlerts();

    const interval = setInterval(() => {
      fetchAuctions();
      fetchAlerts();
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchAuctions, fetchProfile, fetchAlerts]);

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userMail, password })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.mfaRequired) {
          setMfaRequired(true);
          setMfaMessage(data.message);
        } else {
          setIsLoggedIn(true);
          setProfile(data.user);
          localStorage.setItem('salvage_user_email', userMail);
          setShowLoginModal(false);
          playAudioChime('success', isMuted);
        }
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setAuthError('Connection failed to python database proxy server.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle MFA Verification Code Submission
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/mfa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userMail, code: mfaCode })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        setProfile(data.user);
        localStorage.setItem('salvage_user_email', userMail);
        setMfaRequired(false);
        setShowLoginModal(false);
        setMfaCode('');
        playAudioChime('success', isMuted);
      } else {
        setAuthError(data.error || 'Invalid MFA code');
      }
    } catch (err: any) {
      setAuthError('MFA Verification failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Registration Success
  const handleRegisterSuccess = (newUser: UserProfile, msg: string, welcomeGreeting?: string, emailDispatch?: any) => {
    setIsLoggedIn(true);
    setProfile(newUser);
    setUserMail(newUser.email);
    localStorage.setItem('salvage_user_email', newUser.email);
    setShowRegisterModal(false);
    playAudioChime('success', isMuted);
    setWelcomeBanner(welcomeGreeting || `Welcome to Salvage Settlers, ${newUser.username}! Your account is verified with ₹15,00,000 INR bidding credit.`);
    if (emailDispatch) {
      setEmailDispatchPayload(emailDispatch);
    }
    fetchAlerts();
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('salvage_user_email');
    setIsLoggedIn(false);
    setProfile(null);
    setUserMail('');
    setMfaRequired(false);
    setActiveTab('home');
  };

  // Place Bid Action
  const handlePlaceBid = async (auctionId: string, amount: number) => {
    if (isOffline) {
      const newQueueItem = {
        id: `offline-${Date.now()}`,
        auctionId,
        amount,
        timestamp: Date.now()
      };
      setOfflineQueue(prev => [...prev, newQueueItem]);
      
      setAuctions(prev => prev.map(auc => {
        if (auc.id === auctionId) {
          const newBid: Bid = {
            id: newQueueItem.id,
            auctionId,
            bidder: profile?.username || 'nikhiluw',
            amount,
            timestamp: Date.now(),
            status: 'confirmed'
          };
          return {
            ...auc,
            currentPrice: amount,
            bids: [...auc.bids, newBid]
          };
        }
        return auc;
      }));

      playAudioChime('sync', isMuted);
      return;
    }

    try {
      const res = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidderEmail: userMail,
          amount
        })
      });

      if (res.ok) {
        playAudioChime('success', isMuted);
        fetchAuctions();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Bid rejected');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to transmit bid to portal.');
    }
  };

  // Save/Unsave Auction Watchlist toggle
  const handleToggleSaveAuction = async (auctionId: string) => {
    if (!profile) return;
    const isCurrentlySaved = profile.savedAuctions.includes(auctionId);
    const updatedSaved = isCurrentlySaved
      ? profile.savedAuctions.filter(id => id !== auctionId)
      : [...profile.savedAuctions, auctionId];

    setProfile({ ...profile, savedAuctions: updatedSaved });

    if (!isOffline) {
      try {
        await fetch('/api/user/saved-auctions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userMail,
            savedAuctions: updatedSaved
          })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Toggle MFA Shield
  const handleToggleMfaInDatabase = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/user/mfa-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userMail, enabled })
      });

      if (res.ok) {
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Offline mode and force sync queue
  const handleToggleOffline = async () => {
    if (isOffline) {
      setIsOffline(false);
      if (offlineQueue.length > 0) {
        try {
          const res = await fetch('/api/offline-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userMail,
              bids: offlineQueue
            })
          });

          if (res.ok) {
            playAudioChime('sync', isMuted);
            setOfflineQueue([]);
            fetchAuctions();
          }
        } catch (err) {
          console.error("Failed offline sync:", err);
        }
      }
    } else {
      setIsOffline(true);
    }
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userMail })
      });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  // Payment Success Callback
  const handlePaymentSuccess = (itemId: string, payload: any) => {
    playAudioChime('success', isMuted);
    fetchAuctions();
  };

  // Derived Filtered Auctions
  const categories = ['All', 'Industrial Scrap', 'Damaged Vehicles', 'Fire & Water Inventory', 'Machinery & Equipment', 'Electronics & Surplus'];
  const states = ['All', 'Delhi', 'Maharashtra', 'Gujarat', 'Tamil Nadu', 'Karnataka', 'Haryana'];

  const filteredAuctions = auctions.filter(item => {
    // SubTab Filter
    if (auctionSubTab === 'live' && item.status !== 'active') return false;
    if (auctionSubTab === 'upcoming' && item.status !== 'upcoming') return false;
    if (auctionSubTab === 'past' && (item.status !== 'sold' && item.status !== 'completed')) return false;

    // Category Filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

    // State Filter
    if (selectedState !== 'All' && item.state !== selectedState) return false;

    return true;
  });

  const savedLots = auctions.filter(item => profile?.savedAuctions.includes(item.id));
  const liveAuctionsList = auctions.filter(item => item.status === 'active');

  if (isAdminMode) {
    return (
      <AdminPanel
        onAuctionCreated={fetchAuctions}
        onClose={() => {
          window.location.hash = '';
          setIsAdminMode(false);
        }}
      />
    );
  }

  return (
    <MobileSimulator 
      isOffline={isOffline} 
      onToggleOffline={handleToggleOffline} 
      syncQueueLength={offlineQueue.length}
    >
      <div className="flex-1 flex flex-col min-h-full bg-slate-50 font-sans">
        
        {/* Top Navbar Component */}
        <Navbar 
          activeTab={activeTab}
          auctionSubTab={auctionSubTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'auction') {
              setAuctionSubTab('live');
            }
          }}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenRegister={() => setShowRegisterModal(true)}
          isLoggedIn={isLoggedIn}
          userProfile={profile}
          onLogout={handleLogout}
          savedLotsCount={profile?.savedAuctions.length || 0}
        />

        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-bold shadow relative z-20 font-sans">
            <span className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 animate-bounce" />
              <span>Offline Bidding Queue active. {offlineQueue.length} cached bids queued. Go Online to sync!</span>
            </span>
            <button
              onClick={handleToggleOffline}
              className="bg-slate-950 text-white font-mono px-3 py-1 rounded-lg text-[10px] uppercase hover:bg-slate-800"
              id="force-sync-btn"
            >
              Force Sync Database
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          
          {/* Welcome Greeting Banner on New Registration */}
          {welcomeBanner && (
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-4 animate-fadeIn font-display" id="welcome-greeting-banner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                  🎉
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-emerald-200">
                    Welcome to Salvage Settlers E-Auction Portal
                  </h4>
                  <p className="text-xs sm:text-sm text-white font-sans mt-0.5 leading-snug">
                    {welcomeBanner}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {emailDispatchPayload && (
                  <button
                    onClick={() => setShowEmailPreviewModal(true)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-mono font-bold rounded-xl shadow border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    id="view-sent-welcome-email-btn"
                  >
                    <span>📨 View Dispatched Email</span>
                  </button>
                )}
                <button 
                  onClick={() => setWelcomeBanner(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shrink-0"
                  id="dismiss-welcome-banner-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* TAB 1: HOME PAGE */}
          {activeTab === 'home' && (
            <HomePage 
              liveAuctions={liveAuctionsList}
              onNavigateToAuction={(subTab) => {
                setActiveTab('auction');
                setAuctionSubTab(subTab);
              }}
              onOpenAiAnalysis={(lot) => setAnalyzingItem(lot)}
              onDetailsClick={(lot) => setSelectedAuctionDetail(lot)}
            />
          )}

          {/* TAB 2: ABOUT US PAGE */}
          {activeTab === 'about' && (
            <AboutUs />
          )}

          {/* TAB 3: AUCTION PAGE (Current/Live, Upcoming, Past/Closed) */}
          {activeTab === 'auction' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Bar with 3 Sub-Tabs */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-display font-extrabold text-slate-900">
                      Salvage & Industrial Scrap E-Auctions
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select auction state cycle below to view live bidding, upcoming inspections, or past settled lots.
                    </p>
                  </div>

                  {/* 3 Sub-Tabs: Live / Upcoming / Past */}
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 font-display text-xs" id="auction-subtabs">
                    <button
                      onClick={() => setAuctionSubTab('live')}
                      className={`px-4 py-2 rounded-xl font-bold transition ${
                        auctionSubTab === 'live'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      id="subtab-live"
                    >
                      Current / Live ({auctions.filter(a => a.status === 'active').length})
                    </button>

                    <button
                      onClick={() => setAuctionSubTab('upcoming')}
                      className={`px-4 py-2 rounded-xl font-bold transition ${
                        auctionSubTab === 'upcoming'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      id="subtab-upcoming"
                    >
                      Upcoming ({auctions.filter(a => a.status === 'upcoming').length})
                    </button>

                    <button
                      onClick={() => setAuctionSubTab('past')}
                      className={`px-4 py-2 rounded-xl font-bold transition ${
                        auctionSubTab === 'past'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      id="subtab-past"
                    >
                      Past / Closed ({auctions.filter(a => a.status === 'sold' || a.status === 'completed').length})
                    </button>
                  </div>

                </div>

                {/* Categories & State Filters */}
                <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1.5" id="category-filter-pills">
                    <span className="text-xs font-bold text-slate-400 font-mono py-1 mr-1">Category:</span>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold font-display transition ${
                          selectedCategory === cat
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* State Select Dropdown */}
                  <div className="flex items-center gap-2 text-xs font-bold font-mono">
                    <span className="text-slate-400">State Hub:</span>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="state-filter-select"
                    >
                      {states.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                </div>

              </div>

              {/* Auction Grid Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="auction-grid-section">
                {filteredAuctions.length > 0 ? (
                  filteredAuctions.map(item => (
                    <AuctionCard
                      key={item.id}
                      item={item}
                      onPlaceBid={handlePlaceBid}
                      onOpenCheckout={(lot) => setCheckoutItem(lot)}
                      onOpenAiAnalysis={(lot) => setAnalyzingItem(lot)}
                      userEmail={userMail}
                      isSaved={profile?.savedAuctions.includes(item.id) || false}
                      onToggleSave={handleToggleSaveAuction}
                      onDetailsClick={(lot) => setSelectedAuctionDetail(lot)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-24 bg-white border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm font-mono">
                    No salvage auctions found matching your category/state criteria in this section.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: CONTACT US PAGE */}
          {activeTab === 'contact' && (
            <ContactUs />
          )}

          {/* WATCHLIST TAB */}
          {activeTab === 'watchlist' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-indigo-600 fill-current" />
                  Your Saved Monitored Lots
                </h2>
                <p className="text-xs text-slate-500">
                  Quick tracker focusing on items you have bookmarked for EMD deposit & strategy optimization.
                </p>
              </div>

              {savedLots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {savedLots.map(item => (
                    <AuctionCard
                      key={item.id}
                      item={item}
                      onPlaceBid={handlePlaceBid}
                      onOpenCheckout={(lot) => setCheckoutItem(lot)}
                      onOpenAiAnalysis={(lot) => setAnalyzingItem(lot)}
                      userEmail={userMail}
                      isSaved={true}
                      onToggleSave={handleToggleSaveAuction}
                      onDetailsClick={(lot) => setSelectedAuctionDetail(lot)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-24 bg-white border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm font-mono">
                  Your watchlist is empty. Bookmark auctions in the Live/Upcoming tabs to track them here.
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Visual Wealth & Capital Outlay Analytics
                </h2>
                <p className="text-xs text-slate-500">
                  Insights tracing acquired salvage lots, category splits, and bidding velocity over time.
                </p>
              </div>
              <DashboardStats auctions={auctions} userEmail={userMail} />
            </div>
          )}

          {/* USER PROFILE TAB */}
          {activeTab === 'profile' && profile && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Salvage Bidder Account & Credentials
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Wallet Balance</span>
                    <span className="text-lg font-black text-slate-900">₹{profile.balance.toLocaleString()} INR</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Bidding Cap Capacity</span>
                    <span className="text-lg font-black text-slate-900">₹{profile.spendingLimit.toLocaleString()} INR</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Authorized Email</span>
                    <span className="text-xs font-bold text-slate-700 block truncate mt-1">{profile.email}</span>
                  </div>
                </div>
              </div>

              <MfaHandler profile={profile} onToggleMfa={handleToggleMfaInDatabase} />

              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <h3 className="font-display font-bold text-base text-slate-900">
                  Your Won & Acquired Lots Checklist
                </h3>

                <div className="space-y-3">
                  {auctions.filter(a => a.winner === userMail).length > 0 ? (
                    auctions.filter(a => a.winner === userMail).map(winningItem => (
                      <div 
                        key={winningItem.id} 
                        className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 bg-slate-50"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 font-display">
                            {winningItem.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Acquired Amount: ₹{winningItem.currentPrice.toLocaleString()} • Status:{' '} 
                            <span className={winningItem.isPaid ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                              {winningItem.isPaid ? 'Escrow Paid' : 'Requires Payment Settle'}
                            </span>
                          </span>
                        </div>

                        {winningItem.isPaid ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Settled</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCheckoutItem(winningItem)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                          >
                            Pay Settle
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs font-mono">
                      No won salvage lots cataloged to this address yet. Participate in active bidding events to win lots.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </main>

        {/* Floating AI Strategist Drawer */}
        {analyzingItem && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full relative">
              <button
                onClick={() => setAnalyzingItem(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 bg-slate-800 rounded-full z-10 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <AIAnalyst item={analyzingItem} />
            </div>
          </div>
        )}

        {/* Interactive Payment Escrow Modal */}
        {checkoutItem && (
          <PaymentModal
            item={checkoutItem}
            onPaymentSuccess={handlePaymentSuccess}
            onClose={() => setCheckoutItem(null)}
          />
        )}

        {/* Login Modal Overlay */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-md w-full relative p-6 space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-display font-extrabold text-base text-slate-900">MEMBER LOGIN</h4>
                </div>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!mfaRequired ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  
                  {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                      {authError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={userMail}
                      onChange={(e) => setUserMail(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-display font-bold text-xs rounded-xl shadow-md transition"
                  >
                    {authLoading ? 'Authenticating...' : 'Log In to Portal'}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-500">Need a bidding account? </span>
                    <button
                      type="button"
                      onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Register Now
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleMfaSubmit} className="space-y-4">
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs text-center space-y-1">
                    <KeyRound className="w-5 h-5 text-emerald-600 mx-auto" />
                    <span className="font-bold block">MFA CODE GENERATED</span>
                    <p>{mfaMessage}</p>
                  </div>

                  <div>
                    <label className="block text-center text-xs font-bold text-slate-600 uppercase">Enter 6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full text-center tracking-widest px-4 py-3 bg-slate-900 text-emerald-400 rounded-xl text-lg font-mono font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-emerald-500 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow"
                  >
                    Verify & Access Portal
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

        {/* Register Modal Overlay */}
        {showRegisterModal && (
          <RegisterModal
            onRegisterSuccess={handleRegisterSuccess}
            onClose={() => setShowRegisterModal(false)}
            onOpenLogin={() => setShowLoginModal(true)}
          />
        )}

        {/* Sent Welcome Email Preview Modal */}
        {showEmailPreviewModal && emailDispatchPayload && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 max-w-2xl w-full flex flex-col max-h-[90vh]">
              
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <span>📨 Official Dispatched Welcome Email</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono">
                      {emailDispatchPayload.sentViaSmtp ? '✓ Sent via SMTP Mailer' : 'Simulated Email Client'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    To: {emailDispatchPayload.to} • Subject: {emailDispatchPayload.subject}
                  </p>
                </div>
                <button
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 bg-slate-950">
                <iframe
                  srcDoc={emailDispatchPayload.html}
                  title="Sent Email Content"
                  className="w-full h-[500px] border-0 rounded-2xl bg-slate-900"
                ></iframe>
              </div>

              <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Configure SMTP settings in .env (SMTP_HOST, SMTP_USER, SMTP_PASS) for direct inbox delivery.</span>
                <button
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
                >
                  Close Email Window
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Auction Detail Modal Overlay */}
        {selectedAuctionDetail && (
          <AuctionDetailModal
            auction={selectedAuctionDetail}
            isLoggedIn={isLoggedIn}
            userMail={userMail}
            isOffline={isOffline}
            onPlaceBid={handlePlaceBid}
            onClose={() => setSelectedAuctionDetail(null)}
            onOpenLogin={() => {
              setSelectedAuctionDetail(null);
              setShowLoginModal(true);
            }}
            onOpenRegister={() => {
              setSelectedAuctionDetail(null);
              setShowRegisterModal(true);
            }}
          />
        )}

      </div>
    </MobileSimulator>
  );
}
