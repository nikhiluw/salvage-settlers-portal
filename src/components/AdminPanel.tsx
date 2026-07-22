import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, CheckCircle2, Loader2, LogOut, Upload, Image as ImageIcon, MapPin, Phone, Building } from 'lucide-react';
import { AuctionItem } from '../types';

interface AdminPanelProps {
  onAuctionCreated: () => void;
  onClose: () => void;
}

export default function AdminPanel({ onAuctionCreated, onClose }: AdminPanelProps) {
  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('salvage_admin_session') === 'true';
  });
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Industrial Scrap');
  const [startingPrice, setStartingPrice] = useState('500000');
  const [increment, setIncrement] = useState('20000');
  const [emdAmount, setEmdAmount] = useState('30000');
  
  // Timestamps (defaults to starting now, ending in 24 hours)
  const [startsAtOffset, setStartsAtOffset] = useState<'now' | 'custom'>('now');
  const [endsAtOffset, setEndsAtOffset] = useState<'10m' | '1h' | '24h' | 'custom'>('24h');
  const [customStartsAt, setCustomStartsAt] = useState('');
  const [customEndsAt, setCustomEndsAt] = useState('');

  const [seller, setSeller] = useState('National Insurance Co.');
  const [surveyorContact, setSurveyorContact] = useState('+91 88003 35916');
  const [inspectionLocation, setInspectionLocation] = useState('Alang MIDC Yard, Sector 4, Gujarat');
  const [inspectionDates, setInspectionDates] = useState('25-28 July 2026');
  const [state, setState] = useState('Gujarat');
  const [salvageCondition, setSalvageCondition] = useState('Accidental Material');

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Active Lots Table State
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Inventory
  const fetchInventory = async () => {
    setLotsLoading(true);
    try {
      const res = await fetch('/api/auctions');
      if (res.ok) {
        const data = await res.json();
        setAuctions(data);
      }
    } catch (err) {
      console.error('Failed to load auctions inventory:', err);
    } finally {
      setLotsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchInventory();
    }
  }, [isAdminLoggedIn]);

  // Handle Admin Login Submission
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    // Validate credentials
    if (adminId.trim() === 'admin@salvageportal.in' && adminPassword === 'adminpassword123') {
      localStorage.setItem('salvage_admin_session', 'true');
      setIsAdminLoggedIn(true);
    } else {
      setLoginError('Invalid Admin ID or Access Code.');
    }
    setLoginLoading(false);
  };

  // Handle Admin Log Out
  const handleAdminLogout = () => {
    localStorage.removeItem('salvage_admin_session');
    setIsAdminLoggedIn(false);
  };

  // Handle Image File Select & Base64 Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setUploading(true);
      setUploadError(null);

      // Read file to Base64 data string
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileData: base64Data
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setImageUrl(data.url);
          } else {
            setUploadError(data.error || 'Failed to upload image');
          }
        } catch (err) {
          setUploadError('Failed to upload image payload to python server.');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Lot Conclusion
  const handleConcludeLot = async (auctionId: string) => {
    setActionLoadingId(auctionId);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/auctions/conclude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Lot ${auctionId} successfully concluded! Awarded to: ${data.winner || 'None (No bids)'}`);
        fetchInventory();
        onAuctionCreated(); // Refresh main lists too
      } else {
        setErrorMsg(data.error || 'Failed to conclude bidding');
      }
    } catch (err) {
      setErrorMsg('Failed to dispatch conclusion request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Lot Deletion
  const handleDeleteLot = async (auctionId: string) => {
    if (!window.confirm(`Are you sure you want to delete Lot ${auctionId}? This is irreversible.`)) return;
    setActionLoadingId(auctionId);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/auctions/${auctionId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Lot ${auctionId} and associated bidding logs deleted successfully.`);
        fetchInventory();
        onAuctionCreated();
      } else {
        setErrorMsg(data.error || 'Deletion failed');
      }
    } catch (err) {
      setErrorMsg('Failed to delete lot.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Create Auction Submission
  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please upload a salvage image before submitting.');
      return;
    }

    setSuccessMsg(null);
    setErrorMsg(null);

    const now = Date.now();
    let startsAt = now;
    if (startsAtOffset === 'custom' && customStartsAt) {
      startsAt = new Date(customStartsAt).getTime();
    }

    let endsAt = now + 24 * 3600 * 1000; // 24 Hours
    if (endsAtOffset === '10m') {
      endsAt = now + 10 * 60 * 1000;
    } else if (endsAtOffset === '1h') {
      endsAt = now + 60 * 60 * 1000;
    } else if (endsAtOffset === 'custom' && customEndsAt) {
      endsAt = new Date(customEndsAt).getTime();
    }

    const payload = {
      title,
      description,
      category,
      imageUrl,
      startingPrice: parseFloat(startingPrice),
      increment: parseFloat(increment),
      emdAmount: parseFloat(emdAmount),
      startsAt,
      endsAt,
      seller,
      surveyorContact,
      inspectionLocation,
      inspectionDates,
      state,
      salvageCondition
    };

    try {
      const res = await fetch('/api/admin/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Salvage Lot successfully initialized with registry ID: ${data.auctionId}`);
        // Reset Form
        setTitle('');
        setDescription('');
        setImageUrl('');
        setImageFile(null);
        fetchInventory();
        onAuctionCreated();
      } else {
        setErrorMsg(data.error || 'Failed to create auction lot');
      }
    } catch (err) {
      setErrorMsg('Failed to post salvage lot metadata.');
    }
  };

  // If Admin is NOT logged in, show the clean Admin login screen
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Decorative glows */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-600/15 border border-indigo-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-display font-black text-white tracking-tight">
              SALVAGE <span className="text-indigo-400">SETTLERS</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
              Administrative Control Desk
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Admin ID (Email)
              </label>
              <input
                type="email"
                required
                placeholder="admin@salvageportal.in"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Access Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            {loginError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-center font-mono">
                ⚠ {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Authorize Console Access'
              )}
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-400 transition mt-6 font-mono border-t border-slate-800 pt-4"
          >
            ← Return to Public Homepage
          </button>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/35 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-sm tracking-wide text-white uppercase">
              SALVAGE SETTLERS <span className="text-indigo-400">ADMIN CONSOLE</span>
            </h1>
            <p className="text-[10px] font-mono text-emerald-400 mt-0.5">
              ● Server Online • SQLite Registry Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
          >
            Refresh List
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-3.5 py-1.5 bg-red-650/10 hover:bg-red-650/20 text-red-400 text-xs font-mono rounded-lg border border-red-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold rounded-lg transition"
          >
            Close Dashboard
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
        
        {/* Left: Create Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5 self-start">
          <div>
            <h3 className="font-display font-black text-sm text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Initialize New Salvage Lot
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Add new insurance/corporate salvage disposal lots with real-time image uploads.
            </p>
          </div>

          <form onSubmit={handleCreateAuction} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">LOT TITLE</label>
              <input
                type="text"
                required
                placeholder="e.g. Accidental 2023 Maruti Swift LXi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 text-white text-xs rounded-lg border border-slate-800 focus:border-indigo-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">LOT DESCRIPTION / PARTICULARS</label>
              <textarea
                required
                rows={3}
                placeholder="Provide physical condition details, engine specs, accident type, and inspection reserve values."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 text-white text-xs rounded-lg border border-slate-800 focus:border-indigo-500 transition"
              />
            </div>

            {/* Image Uploader */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">SALVAGE PHOTOGRAPH</label>
              <div className="flex gap-3 items-center">
                <label className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950 border border-dashed border-slate-800 rounded-lg hover:border-indigo-500 transition cursor-pointer text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  ) : imageUrl ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Photo Loaded!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-[10px] text-slate-500">Choose Salvage Image File</span>
                    </div>
                  )}
                </label>

                {imageUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-950 flex items-center justify-center relative">
                    <img src={imageUrl} alt="preview" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-650 rounded-full text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {uploadError && (
                <p className="text-[10px] text-red-400 mt-1 font-mono">{uploadError}</p>
              )}
            </div>

            {/* Price configs */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">START PRICE (₹)</label>
                <input
                  type="number"
                  required
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">MIN INCREMENT (₹)</label>
                <input
                  type="number"
                  required
                  value={increment}
                  onChange={(e) => setIncrement(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">EMD AMOUNT (₹)</label>
                <input
                  type="number"
                  required
                  value={emdAmount}
                  onChange={(e) => setEmdAmount(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                />
              </div>
            </div>

            {/* Time offsets */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">START DATE/TIME</label>
                <select
                  value={startsAtOffset}
                  onChange={(e) => setStartsAtOffset(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                >
                  <option value="now">Start Immediately (Live)</option>
                  <option value="custom">Custom Date</option>
                </select>
                {startsAtOffset === 'custom' && (
                  <input
                    type="datetime-local"
                    required
                    value={customStartsAt}
                    onChange={(e) => setCustomStartsAt(e.target.value)}
                    className="w-full mt-1.5 px-2 py-1 bg-slate-950 text-white text-xs rounded border border-slate-800"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">END DATE/TIME</label>
                <select
                  value={endsAtOffset}
                  onChange={(e) => setEndsAtOffset(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                >
                  <option value="10m">Conclude in 10 mins</option>
                  <option value="1h">Conclude in 1 hour</option>
                  <option value="24h">Conclude in 24 hours</option>
                  <option value="custom">Custom Date</option>
                </select>
                {endsAtOffset === 'custom' && (
                  <input
                    type="datetime-local"
                    required
                    value={customEndsAt}
                    onChange={(e) => setCustomEndsAt(e.target.value)}
                    className="w-full mt-1.5 px-2 py-1 bg-slate-950 text-white text-xs rounded border border-slate-800"
                  />
                )}
              </div>
            </div>

            {/* Other properties */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                >
                  <option value="Industrial Scrap">Industrial Scrap</option>
                  <option value="Damaged Vehicles">Damaged Vehicles</option>
                  <option value="Machinery & Equipment">Machinery & Equipment</option>
                  <option value="Electronics & Surplus">Electronics & Surplus</option>
                  <option value="Fire & Water Inventory">Fire & Water Inventory</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">STATE HUB</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">SELLER / INSURER</label>
                <input
                  type="text"
                  required
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">SURVEYOR CONTACT</label>
                <input
                  type="text"
                  required
                  value={surveyorContact}
                  onChange={(e) => setSurveyorContact(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">INSPECTION YARD LOCATION</label>
              <input
                type="text"
                required
                value={inspectionLocation}
                onChange={(e) => setInspectionLocation(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">INSPECTION DATES</label>
                <input
                  type="text"
                  required
                  value={inspectionDates}
                  onChange={(e) => setInspectionDates(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">LOT CONDITION</label>
                <input
                  type="text"
                  required
                  value={salvageCondition}
                  onChange={(e) => setSalvageCondition(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 text-white text-xs rounded-lg border border-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center"
            >
              Publish Salvage Lot & Start Auction
            </button>

          </form>
        </div>

        {/* Right: Active Lots Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4 self-stretch overflow-hidden">
          
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-display font-black text-sm text-indigo-300 uppercase tracking-wider">
                E-Auction Inventory registry
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Monitor bidding status, conclude active listings, or remove outdated lots.
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-mono text-[10px]">
              {auctions.length} Lots Registered
            </span>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono">
              ✓ {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-mono">
              ⚠ {errorMsg}
            </div>
          )}

          {/* Inventory Table Container */}
          <div className="flex-1 overflow-y-auto border border-slate-850 rounded-xl bg-slate-950">
            {lotsLoading ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs gap-2">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                Loading registry logs...
              </div>
            ) : auctions.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                No salvage lots currently registered.
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-850 font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-3">ID</th>
                    <th className="p-3">Salvage Material Description</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Current Price</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {auctions.map((auc) => {
                    const statusColors: Record<string, string> = {
                      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      upcoming: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      sold: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                      completed: 'bg-slate-500/15 text-slate-400 border-slate-700'
                    };
                    
                    return (
                      <tr key={auc.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-3 font-mono font-bold text-indigo-400">{auc.id}</td>
                        <td className="p-3 max-w-[200px]">
                          <div className="font-bold text-white truncate">{auc.title}</div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">{auc.seller}</div>
                        </td>
                        <td className="p-3 text-slate-300 font-medium">{auc.category}</td>
                        <td className="p-3 font-mono font-extrabold text-white">
                          ₹{auc.currentPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${statusColors[auc.status] || 'bg-slate-800'}`}>
                            {auc.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {actionLoadingId === auc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                            ) : (
                              <>
                                {(auc.status === 'active' || auc.status === 'upcoming') && (
                                  <button
                                    onClick={() => handleConcludeLot(auc.id)}
                                    title="Conclude Bidding immediately and award winner"
                                    className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 text-[10px] font-bold rounded transition cursor-pointer"
                                  >
                                    Conclude
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteLot(auc.id)}
                                  title="Delete lot permanently"
                                  className="p-1 bg-red-650/10 hover:bg-red-650 border border-red-500/20 hover:border-red-600 text-red-400 hover:text-white rounded transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
