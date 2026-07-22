import React from 'react';
import { ShieldCheck, Award, Building2, Users, MapPin, CheckCircle2, Lock, FileCheck } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="space-y-10 pb-12 animate-fadeIn">
      
      {/* Page Title Header */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="text-xs font-display font-bold text-emerald-400 uppercase tracking-widest block">
            About Our Company
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            India's Leading Virtual Marketplace for Insurance Salvage & Commercial Scrap E-Auctions
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Founded with the core objective of modernizing salvage disposal in India, our platform bridges the gap between insurance underwriters, loss surveyors, corporate asset disposers, and certified salvage buyers across the nation.
          </p>
        </div>
      </section>

      {/* Core Mission & Vision Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-display font-bold text-slate-900">Our Corporate Mission</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To provide an unbeatable, transparent, and legally compliant digital venue for conducting salvage and scrap e-auctions—ensuring maximum asset value recovery for insurers and seamless acquisition terms for buyers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-display font-bold text-slate-900">Our Strategic Vision</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To build India's largest data-driven salvage network where loss assessment, physical site inspection scheduling, EMD compliance, and escrow clearance happen in real-time with zero friction.
          </p>
        </div>

      </section>

      {/* Key Features & Value Pillars */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-display font-bold text-indigo-600 uppercase tracking-widest block">
            Why Choose Our Platform
          </span>
          <h2 className="text-xl font-display font-extrabold text-slate-900">
            Four Core Pillars of Trust & Security
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-slate-800">EMD Protection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Earnest Money Deposits (EMD) remain in secure vault holds and are refunded immediately if outbid.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-slate-800">Surveyor Verified</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every listing is backed by official loss surveyor reports, site coordinates, and inspection date windows.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-slate-800">Dynamic Anti-Snipe</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Auto-time extension algorithms trigger when bids land in closing seconds, protecting true market value.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-slate-800">GST & Tax Compliant</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full transparency on GST rates, TCS tax collections, and official salvage invoice generation.
            </p>
          </div>

        </div>
      </section>

      {/* Operational Hubs across India */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-display font-bold text-emerald-400 uppercase tracking-widest block">
            Nationwide Operational Presence
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Inspection & Salvage Yard Coverage Across India
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Our surveyor network spans across major industrial clusters in India to facilitate physical asset inspection.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-center space-y-1">
            <MapPin className="w-5 h-5 text-emerald-400 mx-auto" />
            <span className="font-display font-bold text-xs text-white block">Delhi NCR</span>
            <span className="text-[10px] text-slate-400">Mayapuri & Gurugram</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-center space-y-1">
            <MapPin className="w-5 h-5 text-emerald-400 mx-auto" />
            <span className="font-display font-bold text-xs text-white block">Maharashtra</span>
            <span className="text-[10px] text-slate-400">Bhiwandi & Taloja MIDC</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-center space-y-1">
            <MapPin className="w-5 h-5 text-emerald-400 mx-auto" />
            <span className="font-display font-bold text-xs text-white block">Gujarat</span>
            <span className="text-[10px] text-slate-400">Alang Yard & Ahmedabad</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-center space-y-1">
            <MapPin className="w-5 h-5 text-emerald-400 mx-auto" />
            <span className="font-display font-bold text-xs text-white block">Tamil Nadu</span>
            <span className="text-[10px] text-slate-400">Chennai & Sriperumbudur</span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-center space-y-1">
            <MapPin className="w-5 h-5 text-emerald-400 mx-auto" />
            <span className="font-display font-bold text-xs text-white block">Karnataka</span>
            <span className="text-[10px] text-slate-400">Bengaluru IT Hub</span>
          </div>
        </div>
      </section>

    </div>
  );
}
