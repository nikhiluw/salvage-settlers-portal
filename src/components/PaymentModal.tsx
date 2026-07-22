import React, { useState } from 'react';
import { ShieldCheck, Loader2, CreditCard, Lock, CheckCircle2, Ticket, X } from 'lucide-react';
import { AuctionItem } from '../types';

interface PaymentModalProps {
  item: AuctionItem;
  onPaymentSuccess: (itemId: string, details: any) => void;
  onClose: () => void;
}

export default function PaymentModal({ item, onPaymentSuccess, onClose }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 16 || !cardName || cvc.length < 3) {
      alert("Please check card form requirements for secure TLS handshake.");
      return;
    }

    setLoading(true);
    // Latency for checkout gateway handshake
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      const res = await fetch(`/api/auctions/${item.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber,
          cardName,
          expiry,
          cvc,
          amount: item.currentPrice
        })
      });

      if (res.ok) {
        const payload = await res.json();
        setReceipt(payload);
        // Dispatch success callbacks
        onPaymentSuccess(item.id, payload);
      } else {
        alert("Transaction declined by credit network.");
      }
    } catch (err) {
      console.error(err);
      alert("Escrow checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" id="payment-modal-overlay">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-md w-full relative">
        
        {/* Header bar controls */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="font-display font-bold text-sm tracking-wide">SECURE ESCROW CHECKOUT</h4>
              <p className="text-[10px] text-slate-400 font-mono">Channel: TLS_AES_256_GCM</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 transition"
            id="close-payment-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-6">
          {!receipt ? (
            /* Bidding checkout setup form */
            <form onSubmit={handleSubmitCheckout} className="space-y-4">
              
              {/* Item cost review */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Acquired Lot</span>
                  <span className="text-xs font-bold text-slate-800 font-display line-clamp-1">{item.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount Due</span>
                  <span className="text-lg font-mono font-black text-slate-900">₹{item.currentPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Secure visa stripe inputs fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    id="cc-name-input"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Card Number</label>
                  <div className="relative">
                    <CreditCard className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={16}
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="4242 4242 4242 4242"
                      className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                      id="cc-number-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiration</label>
                    <input
                      type="text"
                      maxLength={5}
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono text-center"
                      id="cc-expiry-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Security Code (CVC)</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono text-center"
                      id="cc-cvc-input"
                    />
                  </div>
                </div>
              </div>

              {/* Secure compliance disclaimer banner */}
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-2 text-[10px] text-indigo-800">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">PCI-DSS Level 1 Encryption:</span> We do not store financial credentials in plaintext. Checkout syncs directly with secure escrow holding.
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-display font-medium text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                id="submit-payment-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Authorizing Escrow Capture...</span>
                  </>
                ) : (
                  <span>Capture Escrow Funds (₹{item.currentPrice.toLocaleString()})</span>
                )}
              </button>

            </form>
          ) : (
            /* Successful Checkout printable Receipt layout */
            <div className="space-y-5 text-center animate-fadeIn" id="payment-receipt-block">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-display font-black text-slate-800 text-base">TRANSACTION COMPLETE</h4>
                <p className="text-xs text-slate-500">Funds have completed security clearances successfully.</p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50 text-left font-mono space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 border-b border-dashed border-slate-200 pb-2">
                  <span>RECEIPT STATUS:</span>
                  <span className="text-indigo-600 font-bold">ESCROW SETTLED</span>
                </div>
                
                <div className="flex justify-between">
                  <span>ITEM ID:</span>
                  <span className="text-slate-800 font-bold">{item.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>TRANSACTION:</span>
                  <span className="text-slate-800 text-[10px] truncate max-w-[180px]" title={receipt.transactionId}>
                    {receipt.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ESCROW AGENT:</span>
                  <span className="text-slate-800 text-[10px] truncate max-w-[180px]">
                    {receipt.escrowAddress}
                  </span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold text-slate-900">
                  <span>TOTAL PAID:</span>
                  <span>₹{item.currentPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-display font-medium text-xs rounded-xl transition"
                id="receipt-done-btn"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
