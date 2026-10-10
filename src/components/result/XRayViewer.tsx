import React, { useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sliders,
  Sun,
  Crosshair,
  AlertTriangle,
  RefreshCw,
  UploadCloud
} from 'lucide-react';
import type { HeatmapRegion, ClinicianAnnotation } from '../../types';

interface XRayViewerProps {
  imageUrl: string;
  regions: HeatmapRegion[];
  showBoundingBox?: boolean;
  xrayViewLabel?: string;
  clinicianAnnotation?: ClinicianAnnotation;
  onImageErrorChange?: (isError: boolean) => void;
  onUpdateImage?: (newImageUrl: string) => void;
}

export const XRayViewer: React.FC<XRayViewerProps> = ({
  imageUrl,
  regions,
  showBoundingBox = true,
  xrayViewLabel = 'AP',
  clinicianAnnotation,
  onImageErrorChange,
  onUpdateImage,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(125);
  const [viewMode, setViewMode] = useState<'ORIGINAL' | 'BOX' | 'HEATMAP' | 'COMBINED'>('COMBINED');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageKey, setImageKey] = useState<number>(0);

  useEffect(() => {
    setImageError(false);
    if (onImageErrorChange) onImageErrorChange(false);
  }, [imageUrl, onImageErrorChange]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(125);
  };

  const handleImageError = () => {
    setImageError(true);
    if (onImageErrorChange) onImageErrorChange(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
    if (onImageErrorChange) onImageErrorChange(false);
  };

  const handleRetry = () => {
    setImageError(false);
    setImageKey((prev) => prev + 1);
  };

  const handleFileReplacement = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onUpdateImage(ev.target.result as string);
          setImageError(false);
          setImageKey((prev) => prev + 1);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-xl' : 'w-full'
      }`}
    >
      {/* Floating Header Controls Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 z-10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            WORKSTATION_CANVAS
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded text-[11px]">
            PROJECTION: {xrayViewLabel} / LATERAL
          </span>
        </div>

        {/* Top-Right Mode Selector */}
        {!imageError && (
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono">
            {(['ORIGINAL', 'BOX', 'HEATMAP', 'COMBINED'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Dark Viewer Canvas Container */}
      <div className="relative aspect-[4/3] bg-[#080C14] overflow-hidden flex items-center justify-center p-4">
        {imageError || !imageUrl ? (
          /* Image Failed / Missing Error Container (Requirement #2) */
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md mx-auto z-10">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-7 h-7 animate-pulse text-rose-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight font-sans">
                X-ray image could not be loaded
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                The image file for this case could not be retrieved, is unreadable, or was corrupted. Automated overlays have been suppressed.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer font-mono shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Retry Load</span>
              </button>

              <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md font-mono">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Replacement Image</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleFileReplacement}
                />
              </label>
            </div>
          </div>
        ) : (
          /* Normal Canvas Frame */
          <div
            className="relative transition-transform duration-200 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              key={imageKey}
              src={imageUrl}
              alt="Medical Wrist Radiograph"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className="max-h-[520px] w-auto object-contain transition-all"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            />

            {/* Grad-CAM Saliency Overlay (Only when image is valid) */}
            {(viewMode === 'HEATMAP' || viewMode === 'COMBINED') && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <radialGradient id="camHotSpot" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
                      <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {regions.map((region, idx) => (
                    <circle
                      key={idx}
                      cx={region.x}
                      cy={region.y}
                      r={region.radius * 1.2}
                      fill="url(#camHotSpot)"
                    />
                  ))}
                </svg>
              </div>
            )}

            {/* Candidate ROI Bounding Boxes (Only when image is valid) */}
            {(viewMode === 'BOX' || viewMode === 'COMBINED') &&
              showBoundingBox &&
              regions.map((roi, idx) => (
                <div
                  key={idx}
                  className="absolute border-2 border-cyan-400 rounded-lg bg-cyan-500/10 pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse"
                  style={{
                    left: `${roi.x - roi.radius}%`,
                    top: `${roi.y - roi.radius}%`,
                    width: `${roi.radius * 2}%`,
                    height: `${roi.radius * 2}%`,
                  }}
                >
                  <div className="absolute -top-7 left-0 bg-slate-900/90 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-md">
                    Candidate #{idx + 1}: Distal Radius • Conf: {(roi.intensity * 0.92).toFixed(2)} (Demo Overlay)
                  </div>
                </div>
              ))}

            {/* Clinician Annotation Overlay */}
            {clinicianAnnotation && (
              <div
                className="absolute border-2 border-emerald-500 rounded-lg bg-emerald-500/10 pointer-events-none shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                style={{
                  left: `${clinicianAnnotation.x}%`,
                  top: `${clinicianAnnotation.y}%`,
                  width: `${clinicianAnnotation.width}%`,
                  height: `${clinicianAnnotation.height}%`,
                }}
              >
                <div className="absolute -bottom-6 left-0 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-md">
                  CLINICIAN ANNOTATION: {clinicianAnnotation.label}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Bottom Toolbar (When image is valid) */}
        {!imageError && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-4 text-xs text-slate-300 shadow-xl z-10">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-12 text-center text-cyan-400 font-bold">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            {/* Brightness Control */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-16 accent-cyan-400 cursor-pointer"
                title="Brightness"
              />
            </div>

            {/* Contrast Control */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <input
                type="range"
                min="75"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-16 accent-cyan-400 cursor-pointer"
                title="Contrast"
              />
            </div>

            <div className="h-4 w-px bg-slate-800" />

            {/* Reset & Fullscreen */}
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Reset Controls"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Legend Footer Bar */}
      <div className="bg-slate-900 px-4 py-2 text-[11px] text-slate-400 border-t border-slate-800 flex items-center justify-between font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-3 h-3 rounded-xs border-2 border-cyan-400 bg-cyan-500/20 inline-block" />
            AI CANDIDATE
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-3 h-3 rounded-xs border-2 border-emerald-500 bg-emerald-500/20 inline-block" />
            CLINICIAN ANNOTATION
          </span>
        </div>

        <span className="text-slate-500 text-[10px]">DICOM View: High Dynamic Contrast</span>
      </div>
    </div>
  );
};
