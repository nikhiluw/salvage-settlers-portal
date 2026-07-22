import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, HelpCircle, Loader2 } from 'lucide-react';
import { ContactInquiry } from '../types';

export default function ContactUs() {
  const [formData, setFormData] = useState<ContactInquiry>({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'Buyer Registration',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setResponseMsg(data.message);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          inquiryType: 'Buyer Registration',
          message: ''
        });
      } else {
        alert("Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-fadeIn">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="text-xs font-display font-bold text-emerald-400 uppercase tracking-widest block">
            Contact Support Desk
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Get in Touch with Our E-Auction & Salvage Settlement Team
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Have questions regarding EMD deposits, site inspection permissions, surveyor registration, or active e-auction bidding? Reach out to our dedicated support desk.
          </p>
        </div>
      </section>

      {/* Main Grid: Form + Address Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Form (2 Cols on desktop) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          <div>
            <h2 className="text-xl font-display font-extrabold text-slate-900">
              Submit an Official Inquiry
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fill in your details below and our salvage coordinators will respond within 2 hours.
            </p>
          </div>

          {responseMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-medium animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{responseMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  id="contact-fullname"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@company.in"
                  className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  id="contact-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile / Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98100 00000"
                  className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  id="contact-phone"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Inquiry Type *</label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value as any })}
                  className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  id="contact-inquiry-type"
                >
                  <option value="Buyer Registration">Buyer Registration / Pre-Qualification</option>
                  <option value="Salvage Disposal">Insurer / Seller Salvage Listing</option>
                  <option value="EMD Refund">EMD Refund / Escrow Account</option>
                  <option value="Technical Support">Technical Support / Live Bidding</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Inquiry Details *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your inquiry or site inspection request details here..."
                className="w-full text-xs p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                id="contact-message"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-display font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              id="submit-contact-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message to Salvage Desk</span>
                </>
              )}
            </button>

          </form>

        </div>

        {/* Address & Helpline Info Card (1 Col) */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-5 shadow-lg">
            <h3 className="font-display font-bold text-base text-white border-b border-slate-800 pb-3">
              Headquarters & Contact Details
            </h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Registered Corporate Office</span>
                  <p className="text-slate-400 leading-relaxed">
                    Plot 18, Commercial Salvage Complex, Barakhamba Road, Connaught Place, New Delhi - 110001, India.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Helpline Phone</span>
                  <p className="text-slate-400 font-mono">+91 88003 35916 / +91 98100 07987</p>
                  <span className="text-[10px] text-slate-500">Mon - Sat: 9:30 AM to 7:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Email Support</span>
                  <p className="text-slate-400 font-mono">info@salvageportal.in</p>
                  <p className="text-slate-400 font-mono">support@salvageportal.in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm">
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Frequently Asked Questions
            </h3>

            <div className="space-y-3 text-xs text-slate-600 font-sans">
              <div>
                <span className="font-bold text-slate-800 block">Q: How do I get EMD refunded if outbid?</span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  EMD deposits are auto-refunded to your registered wallet within 24 hours of auction closing.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block">Q: Can I physically inspect salvage lots?</span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Yes! Each lot displays site addresses and surveyor contact numbers for scheduled visits.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
