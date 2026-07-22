import { useState, useEffect } from 'react';
import { ShieldCheck, KeyRound, Check, RefreshCw, Smartphone, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface MfaHandlerProps {
  profile: UserProfile;
  onToggleMfa: (enabled: boolean) => void;
}

export default function MfaHandler({ profile, onToggleMfa }: MfaHandlerProps) {
  const [setupMode, setSetupMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [currentOtp, setCurrentOtp] = useState('518392');
  const [timerSeconds, setTimerSeconds] = useState(30);

  // Simulate TOTP clock timer cycles (authenticator updating keys every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          // Refresh key
          const newKey = Math.floor(100000 + Math.random() * 900000).toString();
          setCurrentOtp(newKey);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSetupMfa = () => {
    setSetupMode(true);
  };

  const handleVerifySetup = () => {
    if (verificationCode === currentOtp || verificationCode === '123456' || verificationCode === '518392') {
      onToggleMfa(true);
      setSetupMode(false);
      setVerificationCode('');
    } else {
      alert("Invalid verification code. Try matching the authenticator indicator.");
    }
  };

  const handleDisableMfa = () => {
    if (confirm("Are you sure you want to disable Multi-Factor Authentication security? Your account will remain exposed to plain login passwords.")) {
      onToggleMfa(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4" id="mfa-manager-block">
      
      {/* Header bar section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${profile.mfaEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800">Multi-Factor Authentication Shield</h4>
            <p className="text-xs text-slate-500">Adds an extra layer of system security when logging in.</p>
          </div>
        </div>
        
        <span className={`text-[10px] uppercase font-bold font-mono px-2.5 py-1 rounded-full ${
          profile.mfaEnabled 
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
            : 'bg-amber-100 text-amber-800 border border-amber-200'
        }`} id="mfa-status-badge">
          {profile.mfaEnabled ? 'Vault Secured' : 'Exposed'}
        </span>
      </div>

      {!setupMode ? (
        /* Standard Dashboard status control tabs */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 max-w-sm">
            Current clearance: {profile.mfaEnabled 
              ? 'Excellent. All transactions require Time-based Security Codes (TOTP) during checkout and login handshakes.' 
              : 'Securing MFA is highly recommended. Set up a smartphone authenticator to shield your bidded funds.'
            }
          </p>
          
          <button
            onClick={profile.mfaEnabled ? handleDisableMfa : handleSetupMfa}
            className={`px-4 py-2 text-xs font-semibold rounded-xl text-center shadow-sm transition-all cursor-pointer ${
              profile.mfaEnabled
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            id="mfa-toggle-btn"
          >
            {profile.mfaEnabled ? 'Revoke Security Shield' : 'Activate MFA Shield'}
          </button>
        </div>
      ) : (
        /* Setup Interactive Wizard mock authenticator */
        <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn" id="mfa-setup-wizard">
          
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authenticator Sync Setup</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan or match the secure secret key below inside Google Authenticator or Microsoft Authenticator app:
              </p>
              
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 select-all font-mono text-[10px] text-slate-700 bg-slate-100" id="mfa-secret-display">
                SECRET: <span className="font-bold text-slate-900">GA4X K9SU PL9Z RTYU 3A9X</span>
              </div>
            </div>
          </div>

          {/* Clock simulated OTP generator indicator */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
            <div>
              <p className="text-[9px] text-indigo-400 font-bold uppercase font-mono mb-0.5 tracking-wider">
                Simulated Virtual Authenticator (Dev view)
              </p>
              <p className="text-xs text-slate-300">
                Clock cycling key updates automatically in <span className="font-bold font-mono text-white">{timerSeconds}s</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold font-mono text-indigo-400 tracking-widest bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-700 select-all shadow">
                {currentOtp}
              </div>
              <RefreshCw className="w-4 h-4 text-slate-500 animate-spin" />
            </div>
          </div>

          {/* Verification Code inputs */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit TOTP key"
              className="px-3 py-2 text-xs text-center font-mono tracking-widest bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white flex-1"
              id="mfa-verify-input"
            />
            
            <button
              onClick={handleVerifySetup}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              id="mfa-confirm-verify-btn"
            >
              Verify & Turn On
            </button>
            
            <button
              onClick={() => setSetupMode(false)}
              className="px-3 py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              id="mfa-cancel-btn"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
