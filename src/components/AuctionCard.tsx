import React, { useState, useEffect } from 'react';
import { 
  Gavel, Clock, Sparkles, ShieldCheck, CheckCircle2, MapPin, Phone, 
  Calendar, Info, ChevronRight, Bookmark, X, Lock, AlertTriangle 
} from 'lucide-react';
import { AuctionItem, Bid } from '../types';

interface AuctionCardProps {
  key?: string | number;
  item: AuctionItem;
  onPlaceBid: (id: string, amount: number) => void;
  onOpenCheckout: (item: AuctionItem) => void;
  onOpenAiAnalysis: (item: AuctionItem) => void;
  userEmail: string;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onDetailsClick: (item: AuctionItem) => void;
}

export default function AuctionCard({
  item,
  onPlaceBid,
  onOpenCheckout,
  onOpenAiAnalysis,
  userEmail,
  isSaved,
  onToggleSave,
  onDetailsClick
}: AuctionCardProps) {
  const [customBid, setCustomBid] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isEndingSoon, setIsEndingSoon] = useState<boolean>(false);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [showInspectionModal, setShowInspectionModal] = useState<boolean>(false);

  // Dynamic Bid updates countdown timer logic
  useEffect(() => {
    const updateCountdown = () => {
      if (item.status === 'upcoming') {
        const diffStart = item.startsAt - Date.now();
        if (diffStart <= 0) {
          setTimeLeft('Starting Now');
        } else {
          const days = Math.floor(diffStart / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diffStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTimeLeft(days > 0 ? `Starts in ${days}d ${hours}h` : `Starts in ${hours}h`);
        }
        setHasEnded(false);
        setIsEndingSoon(false);
        return;
      }

      const difference = item.endsAt - Date.now();
      if (difference <= 0 || item.status === 'sold' || item.status === 'completed') {
        setTimeLeft('Concluded');
        setHasEnded(true);
        setIsEndingSoon(false);
        return;
      }

      setHasEnded(false);
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const hDisplay = hours > 0 ? `${hours}h ` : '';
      const mDisplay = minutes > 0 ? `${minutes}m ` : '';
      const sDisplay = `${seconds}s`;

      setTimeLeft(`${hDisplay}${mDisplay}${sDisplay}`);

      if (difference < 5 * 60 * 1000) {
        setIsEndingSoon(true);
      } else {
        setIsEndingSoon(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [item.endsAt, item.startsAt, item.status]);

  const minBid = item.currentPrice + item.increment;

  const handleQuickBidClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlaceBid(item.id, minBid);
  };

  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parsed = parseFloat(customBid);
    if (isNaN(parsed) || parsed < minBid) {
      alert(`Invalid offer amount. Minimum offer must be at least ₹${minBid.toLocaleString()}`);
      return;
    }
    onPlaceBid(item.id, parsed);
    setCustomBid('');
  };

  const sortedBids = [...(item.bids || [])].sort((a, b) => b.amount - a.amount);
  const highestBid = sortedBids[0];
  const userIsHighestBidder = highestBid && (highestBid.bidder === 'nikhiluw' || highestBid.bidder === userEmail);
  const userHasBid = item.bids && item.bids.some(b => b.bidder === 'nikhiluw' || b.bidder === userEmail);

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-sm relative ${
      hasEnded || item.status === 'sold'
        ? 'border-slate-200 bg-slate-50/50' 
        : isEndingSoon 
        ? 'border-rose-400 outline outline-1 outline-rose-400' 
        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
    }`} id={`auction-card-${item.id}`}>
      
      {/* Thumbnail Banner with Badges */}
      <div 
        onClick={() => onDetailsClick(item)}
        className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden group cursor-pointer"
      >
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Category Tag overlay Left */}
        <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm text-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase font-mono">
          {item.category}
        </span>

        {/* EMD Deposit Badge Right */}
        <span className="absolute top-3 right-12 bg-emerald-500 text-slate-950 px-2 py-1 rounded-lg text-[10px] font-black uppercase font-mono shadow">
          EMD: ₹{item.emdAmount?.toLocaleString() || '25,000'}
        </span>

        {/* Watchlist Bookmark */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(item.id);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all ${
            isSaved 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white'
          }`}
          title={isSaved ? "Saved to watchlist" : "Save to watchlist"}
          id={`save-btn-${item.id}`}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Live status timer indicator pill */}
        <div className={`absolute bottom-3 right-3 flex flex-col items-end px-3 py-1.5 rounded-xl text-right shadow border backdrop-blur ${
          item.status === 'upcoming'
            ? 'bg-indigo-900/95 border-indigo-700 text-indigo-200'
            : hasEnded
            ? 'bg-slate-900/95 border-slate-800 text-slate-300'
            : isEndingSoon
            ? 'bg-rose-600/95 border-rose-500 text-white animate-pulse'
            : 'bg-white/95 border-slate-200/60 text-slate-900'
        }`}>
          <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 block -mb-0.5">
            {item.status === 'upcoming' ? 'Status' : 'Time Left'}
          </span>
          <div className="flex items-center gap-1 text-xs font-black font-mono">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{timeLeft}</span>
          </div>
        </div>

        {/* Condition Badge */}
        <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm text-amber-300 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
          {item.salvageCondition || 'As Is Where Is'}
        </span>
      </div>

      {/* Main Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-400 font-bold truncate max-w-[180px]">
              Insurer/Disposer: {item.seller}
            </span>
            {userHasBid && (
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                userIsHighestBidder 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {userIsHighestBidder ? '★ Highest Offer' : 'Outbid Alert'}
              </span>
            )}
          </div>
          
          <h3 
            onClick={() => onDetailsClick(item)}
            className="font-display font-bold text-slate-800 text-base leading-snug line-clamp-1 cursor-pointer hover:text-indigo-650 hover:underline"
          >
            {item.title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
            {item.description}
          </p>
        </div>

        {/* Location & Inspection Quick Bar */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-slate-600 truncate max-w-[200px]" title={item.inspectionLocation}>
            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-mono truncate">{item.inspectionLocation || 'Delhi Yard'}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInspectionModal(true);
            }}
            className="text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-800 underline shrink-0 cursor-pointer"
            id={`inspect-btn-${item.id}`}
          >
            Site Info & Surveyor
          </button>
        </div>

        {/* Pricing Summary Box */}
        <div className="bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {item.status === 'upcoming' ? 'Starting Offer' : 'Current High Offer'}
            </p>
            <p className="text-lg font-extrabold text-emerald-400 font-mono" id={`price-display-${item.id}`}>
              ₹{item.currentPrice.toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">State / Hub</p>
            <p className="text-xs font-mono font-bold text-slate-200">{item.state || 'India'}</p>
          </div>
        </div>

        {/* AI Strategist Button */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAiAnalysis(item);
            }}
            className="flex-1 py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-display font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 border border-indigo-100 cursor-pointer"
            id={`ai-btn-${item.id}`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
            <span>Gemini AI Bid Strategist</span>
          </button>
        </div>

        {/* Action Controls for Live vs Upcoming vs Closed */}
        <div className="pt-2 border-t border-slate-100">
          {item.status === 'upcoming' ? (
            /* Upcoming State */
            <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-center space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-900 block">
                Upcoming E-Auction • Pre-Registration Open
              </span>
              <p className="text-[10px] text-indigo-700">
                Inspect physical lot & deposit EMD (₹{item.emdAmount?.toLocaleString()}) to participate.
              </p>
            </div>
          ) : !hasEnded && item.status === 'active' ? (
            /* Live Active Bidding State */
            <div className="space-y-2">
              <button
                onClick={handleQuickBidClick}
                className={`w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs transition-all shadow flex items-center justify-center gap-2 ${
                  userIsHighestBidder
                    ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01]'
                }`}
                disabled={userIsHighestBidder}
                id={`quick-bid-btn-${item.id}`}
              >
                <Gavel className="w-4 h-4" />
                <span>
                  {userIsHighestBidder 
                    ? '★ Highest Offer Holder' 
                    : `Quick Bid ₹${minBid.toLocaleString()}`}
                </span>
              </button>

              <form onSubmit={handleCustomBidSubmit} className="flex gap-1.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold font-mono">
                    ₹
                  </div>
                  <input
                    type="number"
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    placeholder={`Min offer: ${minBid}`}
                    className="w-full pl-6 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                    id={`custom-bid-input-${item.id}`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100 transition cursor-pointer"
                  id={`submit-custom-bid-${item.id}`}
                >
                  Submit
                </button>
              </form>
            </div>
          ) : (
            /* Concluded / Closed State */
            <div className="space-y-2">
              {item.status === 'sold' && item.winner === userEmail ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Concluded Lot - YOU WON!</span>
                  </div>
                  
                  {item.isPaid ? (
                    <span className="text-[11px] text-emerald-700 font-mono font-bold">✓ Settled in Escrow</span>
                  ) : (
                    <button
                      onClick={() => onOpenCheckout(item)}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-medium text-xs rounded-lg transition flex items-center justify-center gap-1 text-center shadow"
                      id={`pay-now-btn-${item.id}`}
                    >
                      <span>Complete Payment Settle (₹{item.currentPrice.toLocaleString()})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-center text-xs text-slate-500 font-medium">
                  {item.winner === userEmail ? '✓ Lot Awarded & Settled' : 'Closed Bidding Cycle'}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Site Inspection & Surveyor Details Popup Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowInspectionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="font-display font-bold text-sm text-slate-900">Physical Site Inspection Details</h4>
                <p className="text-[10px] text-slate-400 font-mono">Lot ID: {item.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Salvage Warehouse Location</span>
                <span className="font-bold text-slate-900 block">{item.inspectionLocation}</span>
                <span className="text-slate-500 text-[11px] block">State: {item.state}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Inspection Dates</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{item.inspectionDates}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Condition Term</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{item.salvageCondition}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 text-indigo-900 rounded-xl border border-indigo-100 space-y-1">
                <span className="text-[10px] text-indigo-600 font-bold uppercase block">Surveyor Contact</span>
                <span className="font-mono font-bold block">{item.surveyorContact}</span>
                <span className="text-[10px] text-indigo-700 block">Call during working hours to schedule physical site viewing.</span>
              </div>
            </div>

            <button
              onClick={() => setShowInspectionModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-xs rounded-xl transition"
            >
              Close Inspection Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
