import React, { useState } from 'react';
import { X, Building, Phone, Calendar, MapPin, ShieldAlert, Award, FileText, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { AuctionItem } from '../types';

interface AuctionDetailModalProps {
  auction: AuctionItem;
  isLoggedIn: boolean;
  userMail: string;
  isOffline: boolean;
  onPlaceBid: (auctionId: string, amount: number) => Promise<void>;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function AuctionDetailModal({
  auction,
  isLoggedIn,
  userMail,
  isOffline,
  onPlaceBid,
  onClose,
  onOpenLogin,
  onOpenRegister
}: AuctionDetailModalProps) {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const minBidRequired = auction.currentPrice + auction.increment;

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) {
      setError('Please specify a valid bid amount.');
      return;
    }

    if (amount < minBidRequired) {
      setError(`Minimum bid required is ₹${minBidRequired.toLocaleString('en-IN')}`);
      return;
    }

    setLoading(true);
    try {
      await onPlaceBid(auction.id, amount);
      setSuccess('Bid successfully established!');
      setBidAmount('');
    } catch (err: any) {
      setError(err.message || 'Bid submission failed.');
    } finally {
      setLoading(false);
    }
  };

  // Status colors
  const statusLabels: Record<string, string> = {
    active: 'Bidding Live',
    upcoming: 'Upcoming Lot',
    sold: 'Closed / Lot Awarded',
    completed: 'Bidding Concluded'
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500 text-slate-950 font-bold',
    upcoming: 'bg-amber-500 text-slate-950 font-bold',
    sold: 'bg-indigo-600 text-white font-bold',
    completed: 'bg-slate-700 text-slate-300 font-bold'
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col max-h-[95vh] relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-950/50 hover:bg-slate-950 border border-white/10 hover:border-white/20 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1">
          {/* Header Banner */}
          <div className="h-48 sm:h-64 relative bg-slate-950">
            <img
              src={auction.imageUrl}
              alt={auction.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            
            {/* Badges */}
            <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end flex-wrap gap-2">
              <div>
                <span className={`px-3 py-1 rounded-full text-[10px] tracking-wider uppercase ${statusColors[auction.status]}`}>
                  {statusLabels[auction.status] || auction.status}
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-2 leading-tight">
                  {auction.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Info Details Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: Metadata & Yard Details (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Description */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Lot Details & Condition Summary
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                  {auction.description}
                </p>
              </div>

              {/* Physical Inspection Yard Details */}
              <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 space-y-3">
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Physical Inspection Yard Details
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex gap-2">
                    <Building className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-300">Yard Location</div>
                      <div className="text-slate-400 mt-0.5">{auction.inspectionLocation}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-300">Allowed Inspection Dates</div>
                      <div className="text-slate-400 mt-0.5">{auction.inspectionDates}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-300">Loss Surveyor Contact</div>
                      <div className="text-slate-400 mt-0.5">{auction.surveyorContact}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-300">Hub State</div>
                      <div className="text-slate-400 mt-0.5">{auction.state}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bid Security Specs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Lot EMD Deposit</div>
                  <div className="text-xs font-extrabold text-slate-200 mt-1">
                    ₹{auction.emdAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Bidding Increment</div>
                  <div className="text-xs font-extrabold text-slate-200 mt-1">
                    ₹{auction.increment.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Insurer Seller</div>
                  <div className="text-xs font-extrabold text-slate-200 mt-1 truncate" title={auction.seller}>
                    {auction.seller}
                  </div>
                </div>
              </div>

              {/* Bidding Log Board */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Bidding offering Log & SHA-256 Confirmations
                </h4>
                
                <div className="border border-slate-850 rounded-xl bg-slate-950 max-h-48 overflow-y-auto text-xs divide-y divide-slate-850">
                  {(!auction.bids || auction.bids.length === 0) ? (
                    <div className="p-4 text-center text-slate-500">
                      No bids currently submitted. Be the first to place an offer!
                    </div>
                  ) : (
                    [...auction.bids].reverse().map((bid, idx) => {
                      const isHigh = idx === 0;
                      return (
                        <div key={bid.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/40">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-200">{bid.bidder}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isHigh ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                {isHigh ? 'Highest Reserve Bid' : 'Outbid'}
                              </span>
                            </div>
                            {bid.transactionHash && (
                              <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px]" title={bid.transactionHash}>
                                {bid.transactionHash}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-white">
                              ₹{bid.amount.toLocaleString('en-IN')}
                            </span>
                            <div className="text-[9px] text-slate-500 mt-0.5">
                              {new Date(bid.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Right: Bidding Controls (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-4">
              
              {/* Pricing Box */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 text-center">
                <span className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase">
                  {auction.status === 'sold' ? 'Awarded Price Lot' : 'Current High Offer'}
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white mt-1">
                  ₹{auction.currentPrice.toLocaleString('en-IN')}
                </div>
                
                {auction.winner && (
                  <div className="mt-3 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                    🏆 Won by: {auction.winner}
                  </div>
                )}
              </div>

              {/* Bidding actions */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-4">
                
                {isOffline && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="font-sans leading-normal">
                      <strong>Offline Mode Active</strong>: Bids placed now will be securely queued and synchronized when internet returns.
                    </p>
                  </div>
                )}

                {auction.status !== 'active' ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-950 rounded-xl">
                    ⚠ Bidding on this lot is currently closed.
                  </div>
                ) : !isLoggedIn ? (
                  <div className="space-y-3 text-center">
                    <h5 className="text-xs font-semibold text-slate-300">
                      Bidding Eligibility Required
                    </h5>
                    <p className="text-[11px] text-slate-400 font-sans leading-normal">
                      Login or register a corporate account to obtain bidding credit & inspect files.
                    </p>
                    <div className="flex gap-2 justify-center pt-2">
                      <button
                        onClick={onOpenLogin}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Log In
                      </button>
                      <button
                        onClick={onOpenRegister}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBidSubmit} className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>MINIMUM BID REQUIRED</span>
                        <span className="text-emerald-400">₹{minBidRequired.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                        <input
                          type="number"
                          required
                          placeholder={minBidRequired.toString()}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-950 text-white font-mono font-bold rounded-xl border border-slate-800 focus:border-indigo-500 transition text-sm"
                        />
                      </div>
                    </div>

                    {success && (
                      <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-center font-mono">
                        ✓ {success}
                      </div>
                    )}

                    {error && (
                      <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-center font-mono">
                        ⚠ {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-850 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Submit Bidding Offer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
