import React, { useState } from 'react';
import { X, ShieldCheck, Loader2, CheckCircle2, User, Building, FileText } from 'lucide-react';
import { UserProfile } from '../types';

interface RegisterModalProps {
  onRegisterSuccess: (user: UserProfile, message: string, welcomeGreeting?: string, emailDispatch?: any) => void;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function RegisterModal({
  onRegisterSuccess,
  onClose,
  onOpenLogin
}: RegisterModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'surveyor'>('buyer');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username: username || email.split('@')[0],
          companyName,
          gstin,
          userType
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onRegisterSuccess(data.user, data.message, data.welcomeGreeting, data.emailDispatch);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" id="register-modal-overlay">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-md w-full relative max-h-[90vh] flex flex-col">
        
        {/* Header bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="font-display font-bold text-sm tracking-wide uppercase">BIDDER & SELLER REGISTRATION</h4>
              <p className="text-[10px] text-slate-400 font-mono">India E-Auction Clearance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 transition"
            id="close-register-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content scrollable */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Account Role *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setUserType('buyer')}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition ${
                    userType === 'buyer' 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Salvage Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('seller')}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition ${
                    userType === 'seller' 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Insurer / Seller
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('surveyor')}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition ${
                    userType === 'surveyor' 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Loss Surveyor
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Full Name / Username *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                id="register-username"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@company.in"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                id="register-email"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Account Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                id="register-password"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Sharma Metals Ltd"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  id="register-company"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">GSTIN / PAN No.</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="07AAAAA0000A1Z5"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono uppercase"
                  id="register-gstin"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2 text-[10px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Registered accounts receive ₹15,00,000 INR pre-approved bidding credit capacity for verified live salvage auctions.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              id="submit-register-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Complete Registration & Unlock Bidding</span>
              )}
            </button>

          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Already registered? </span>
            <button
              onClick={() => { onClose(); onOpenLogin(); }}
              className="text-xs font-bold text-indigo-600 hover:underline"
              id="switch-to-login-btn"
            >
              Log in to your account
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
