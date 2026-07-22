import React from 'react';
import { 
  Gavel, ShieldCheck, ArrowRight, Building2, Truck, Flame, 
  Cpu, Layers, CheckCircle2, Clock, MapPin, Sparkles, Award, FileText
} from 'lucide-react';
import { AuctionItem } from '../types';

interface HomePageProps {
  liveAuctions: AuctionItem[];
  onNavigateToAuction: (tab: 'live' | 'upcoming' | 'past') => void;
  onOpenAiAnalysis: (item: AuctionItem) => void;
  onDetailsClick: (item: AuctionItem) => void;
}

export default function HomePage({
  liveAuctions,
  onNavigateToAuction,
  onOpenAiAnalysis,
  onDetailsClick
}: HomePageProps) {
  return (
    <div className="space-y-12 pb-12 animate-fadeIn">
      
      {/* Hero Banner Section */}
      <section className="relative bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1600')` }}
        ></div>
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>

        <div className="relative z-10 max-w-5xl px-6 py-16 sm:py-20 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>India's Verified E-Auction Salvage Marketplace</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl leading-tight tracking-tight text-white max-w-3xl">
            Transparent Online E-Auction Portal for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300">Salvage, Industrial Scrap & Insurance Assets</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Empowering insurance underwriters, surveyors, corporate sellers, and certified salvage buyers across India. Place real-time competitive offers with Earnest Money Deposit (EMD) protection and full physical site inspection support.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigateToAuction('live')}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-display font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              id="hero-live-auctions-btn"
            >
              <Gavel className="w-4.5 h-4.5" />
              <span>Explore Live Salvage E-Auctions</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateToAuction('upcoming')}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition cursor-pointer"
              id="hero-upcoming-btn"
            >
              <span>View Upcoming Auctions</span>
            </button>
          </div>

        </div>

        {/* Bottom Banner Metrics Strip */}
        <div className="relative z-10 bg-slate-950/80 border-t border-slate-800/80 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">₹150+ Cr</span>
            <span className="text-[10px] text-slate-400 font-display font-semibold uppercase tracking-wider block">Salvage Settled</span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-mono font-black text-indigo-400">40+</span>
            <span className="text-[10px] text-slate-400 font-display font-semibold uppercase tracking-wider block">Insurer / Surveyor Partners</span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-mono font-black text-amber-400">12,500+</span>
            <span className="text-[10px] text-slate-400 font-display font-semibold uppercase tracking-wider block">Verified Bidders</span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-mono font-black text-teal-300">100%</span>
            <span className="text-[10px] text-slate-400 font-display font-semibold uppercase tracking-wider block">EMD & GST Compliant</span>
          </div>
        </div>

      </section>

      {/* Salvage Categories Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-display font-bold text-indigo-600 uppercase tracking-widest block">
              Asset Classifications
            </span>
            <h2 className="text-xl font-display font-extrabold text-slate-900">
              Browse Auctions by Salvage Category
            </h2>
          </div>
          <button 
            onClick={() => onNavigateToAuction('live')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-mono"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="category-cards-grid">
          
          <div 
            onClick={() => onNavigateToAuction('live')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition">
                Industrial Scrap
              </h3>
              <p className="text-xs text-slate-500 mt-1">HMS 1&2, Copper Wire, Aluminum Structural Scrap</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigateToAuction('live')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition">
                Fire & Water Inventory
              </h3>
              <p className="text-xs text-slate-500 mt-1">Raw Cotton, Soaked Textiles, Warehouse Stock</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigateToAuction('live')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition">
                Damaged Vehicles
              </h3>
              <p className="text-xs text-slate-500 mt-1">Accidental Trucks, Commercial Tippers & Fleet</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigateToAuction('live')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition">
                Machinery & Plant
              </h3>
              <p className="text-xs text-slate-500 mt-1">CNC Mills, Industrial Lathes, Plant Dismantling</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigateToAuction('live')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition">
                Electronics & Surplus
              </h3>
              <p className="text-xs text-slate-500 mt-1">Data Center Hardware, Surplus Office Equipment</p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Live Auctions Carousel/Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              <span className="text-xs font-display font-bold text-rose-600 uppercase tracking-widest">
                Active Bidding Events
              </span>
            </div>
            <h2 className="text-xl font-display font-extrabold text-slate-900 mt-0.5">
              Live Salvage Auctions
            </h2>
          </div>
          
          <button
            onClick={() => onNavigateToAuction('live')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-display font-bold rounded-xl transition flex items-center gap-1.5"
            id="view-all-live-btn"
          >
            <span>Go to Live Auction Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="home-live-grid">
          {liveAuctions.slice(0, 3).map(item => (
            <div 
              key={item.id}
              onClick={() => onDetailsClick(item)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-350 transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-slate-900/90 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase font-mono">
                  {item.category}
                </span>
                <span className="absolute top-3 right-3 bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono shadow">
                  EMD: ₹{item.emdAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mb-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{item.inspectionLocation}</span>
                  </div>
                  <h3 className="font-display font-bold text-slate-800 text-base line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Offer</span>
                    <span className="text-base font-extrabold font-mono text-slate-900">₹{item.currentPrice.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAiAnalysis(item);
                    }}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 transition flex items-center gap-1 animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>AI Strategy</span>
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetailsClick(item);
                  }}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-display font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Inspect & Place Bid</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How E-Auction Works Process Workflow */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-display font-bold text-emerald-400 uppercase tracking-widest block">
            Simple & Transparent Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            How Indian Salvage E-Auction Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A standardized, surveyor-audited workflow ensuring 100% security for buyers and insurance sellers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 relative">
            <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm rounded-lg flex items-center justify-center mb-3">
              01
            </div>
            <h3 className="font-display font-bold text-sm text-white">Register & Verification</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Create an account with GSTIN/PAN credentials for pre-qualification clearance.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 relative">
            <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm rounded-lg flex items-center justify-center mb-3">
              02
            </div>
            <h3 className="font-display font-bold text-sm text-white">Inspect Salvage Site</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Visit designated warehouse locations during specified inspection windows for "As Is" verification.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 relative">
            <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm rounded-lg flex items-center justify-center mb-3">
              03
            </div>
            <h3 className="font-display font-bold text-sm text-white">Deposit EMD Amount</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Submit Earnest Money Deposit (EMD) for specific salvage lots to unlock bidding access.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 relative">
            <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm rounded-lg flex items-center justify-center mb-3">
              04
            </div>
            <h3 className="font-display font-bold text-sm text-white">Live Bidding & Settle</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Place real-time bids with auto-extension safeguards. Win the lot and complete escrow payment.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
