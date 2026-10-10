import React, { useState } from 'react';
import { Sliders, Info, ShieldAlert, Sparkles } from 'lucide-react';
import type { HeatmapRegion } from '../../types';

interface EvidenceMapViewerProps {
  imageUrl: string;
  regions: HeatmapRegion[];
}

export const EvidenceMapViewer: React.FC<EvidenceMapViewerProps> = ({ imageUrl, regions }) => {
  const [viewMode, setViewMode] = useState<'original' | 'heatmap' | 'overlay'>('overlay');
  const [opacity, setOpacity] = useState<number>(75);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      
      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-bold text-slate-900">AI Evidence Map (Grad-CAM)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual saliency mapping showing image regions that influenced the model prediction.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'original'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Original X-Ray
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'heatmap'
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Evidence Map
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'overlay'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overlay
          </button>
        </div>
      </div>

      {/* Main Heatmap Display Window */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Interactive Canvas Container */}
        <div className="md:col-span-8 bg-black rounded-xl overflow-hidden shadow-inner relative aspect-[4/3] flex items-center justify-center border border-slate-800">
          
          {/* Base X-Ray Layer */}
          <img
            src={imageUrl}
            alt="Original X-Ray"
            className={`w-full h-full object-contain transition-opacity duration-200 ${
              viewMode === 'heatmap' ? 'opacity-10 filter contrast-200' : 'opacity-100 filter contrast-125'
            }`}
          />

          {/* Grad-CAM Saliency Heatmap Layer */}
          {(viewMode === 'heatmap' || viewMode === 'overlay') && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-150"
              style={{
                opacity: viewMode === 'heatmap' ? 1 : opacity / 100,
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  {/* High activation gradient (Red -> Yellow -> Cyan -> Transparent) */}
                  <radialGradient id="gradCamHot" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                    <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.75" />
                    <stop offset="65%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>

                  {/* Secondary activation gradient */}
                  <radialGradient id="gradCamWarm" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {regions.map((region, idx) => (
                  <g key={idx}>
                    <circle
                      cx={region.x}
                      cy={region.y}
                      r={region.radius * 1.3}
                      fill={idx === 0 ? 'url(#gradCamHot)' : 'url(#gradCamWarm)'}
                    />
                    <circle
                      cx={region.x}
                      cy={region.y}
                      r={region.radius * 0.4}
                      fill="#ef4444"
                      fillOpacity="0.6"
                      className="animate-pulse"
                    />
                  </g>
                ))}
              </svg>
            </div>
          )}

          {/* Saliency Legend Banner inside canvas */}
          <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
            <span>LOW</span>
            <div className="w-20 h-2.5 rounded bg-gradient-to-r from-cyan-500 via-yellow-400 to-rose-600" />
            <span>HIGH ACTIVATION</span>
          </div>
        </div>

        {/* Right Controls & Interpretation Panel */}
        <div className="md:col-span-4 space-y-5">
          
          {/* Opacity Slider */}
          {viewMode === 'overlay' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  Overlay Heatmap Opacity
                </span>
                <span className="font-mono text-blue-700 font-bold">{opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          )}

          {/* Regions of Interest list */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Grad-CAM Activation Regions
            </h4>

            {regions.length > 0 ? (
              regions.map((roi, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {roi.label}
                    </span>
                    <span className="font-mono text-rose-600 font-bold">
                      {Math.round(roi.intensity * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Coordinates: ({roi.x}%, {roi.y}%) • Saliency Radius: {roi.radius}px
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No localized high-activation fracture zones detected.</p>
            )}
          </div>

          {/* Prompt Required Notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-blue-800">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              Saliency Interpretation Guide
            </p>
            <p className="text-[11px] text-slate-600 leading-snug">
              Highlighted region represents image areas that contributed strongly to the AI prediction.
            </p>
          </div>

          <div className="text-[10px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>Visual explanation only — clinical interpretation is required.</span>
          </div>

        </div>

      </div>

    </div>
  );
};
