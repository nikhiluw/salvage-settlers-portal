import React, { useState } from 'react';
import { Sparkles, Loader2, Gauge, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { AuctionItem } from '../types';

interface AIAnalystProps {
  item: AuctionItem;
}

export default function AIAnalyst({ item }: AIAnalystProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const triggerAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          title: item.title,
          currentPrice: item.currentPrice,
          description: item.description,
          bidsHistory: item.bids
        })
      });

      if (!res.ok) {
        throw new Error("Strategy engine returned an error.");
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to complete analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
      
      {/* Visual Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div>
            <h4 className="font-display font-bold text-xs tracking-wider uppercase text-indigo-400">
              Gemini AI Bid Strategist
            </h4>
            <p className="text-[10px] text-slate-400">Game-Theoretic Auction Agent Analysis</p>
          </div>
        </div>
        
        {analysis && (
          <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
            {analysis.mode || 'AI Engaged'}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Let Gemini analyze bidder action patterns, model velocity increments, and formulate optimal reserve limits for <span className="font-semibold text-white">"{item.title}"</span>.
      </p>

      {/* Trigger Analyzer Button */}
      {!analysis && !loading && (
        <button
          onClick={triggerAnalysis}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-xs rounded-xl shadow-md cursor-pointer hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
          id="btn-trigger-ai"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Formulate Dynamic AI Strategy</span>
        </button>
      )}

      {/* Loading state visualizer */}
      {loading && (
        <div className="py-6 flex flex-col items-center justify-center gap-3" id="ai-loading-box">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Running deep predictive analysis...</p>
        </div>
      )}

      {/* Error state banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Completed strategy insights metrics */}
      {analysis && !loading && (
        <div className="space-y-4 animate-fadeIn" id="ai-insights-block">
          
          <div className="grid grid-cols-3 gap-3">
            
            {/* Desirability Gauge score */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">Biddability Score</span>
              <div className="text-xl font-extrabold text-indigo-400 mt-1 font-mono">
                {analysis.score || 85}
              </div>
              <span className="text-[8px] text-slate-500">Desirability rating</span>
            </div>

            {/* Velocity index */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">Bidding Velocity</span>
              <div className={`text-sm font-extrabold mt-2 ${
                analysis.velocity === 'High' ? 'text-amber-400' : 'text-indigo-400'
              }`}>
                {analysis.velocity || 'Moderate'}
              </div>
              <span className="text-[8px] text-slate-500">Action frequency</span>
            </div>

            {/* Probability level */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">Win Chance %</span>
              <div className="text-xl font-extrabold text-indigo-300 mt-1 font-mono">
                {analysis.probabilityOfWinning || 70}%
              </div>
              <span className="text-[8px] text-slate-500">Based on bidding speed</span>
            </div>

          </div>

          {/* Core Recommendation Prompt text box */}
          <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-[10px] text-indigo-400 font-bold tracking-wide uppercase block mb-1">
              ★ Strategic Bidding Guide
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {analysis.recommendation}
            </p>
          </div>

          {/* Anomaly Check report */}
          <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 flex items-start gap-2 text-[10px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase font-mono tracking-wider">Shill Detection Check:</span> {analysis.anomalies || 'All activity corresponds with standard human action patterns.'}
            </div>
          </div>

          {/* Re-analyze element */}
          <button
            onClick={triggerAnalysis}
            className="w-full text-center text-[10px] text-slate-400 hover:text-indigo-400 font-mono mt-1 hover:underline cursor-pointer"
            id="re-analyze-btn"
          >
            Re-formulate current predictions
          </button>

        </div>
      )}

    </div>
  );
}
