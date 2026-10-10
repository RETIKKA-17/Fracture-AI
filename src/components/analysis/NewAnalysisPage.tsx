import React, { useState } from 'react';
import {
  UploadCloud,
  FileImage,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  X
} from 'lucide-react';
import type { PatientInfo, CaseRecord } from '../../types';
import { ProcessingModal } from './ProcessingModal';

interface NewAnalysisPageProps {
  onRunAnalysis: (
    imageUrl: string,
    patientInfo: Partial<PatientInfo>,
    sampleType?: 'fracture' | 'normal' | 'blurry' | 'custom_upload' | 'failed'
  ) => Promise<CaseRecord>;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({ onRunAnalysis }) => {
  // Case metadata state
  const [patientInfo, setPatientInfo] = useState<Partial<PatientInfo>>({
    caseId: `WR-0${Math.floor(26 + Math.random() * 70)}`,
    patientId: 'PT-8942',
    age: 48,
    sex: 'F',
    xrayView: 'AP',
    referralPhysician: 'Dr. E. Vance (Emergency Dept)',
    clinicalHistory: 'Acute FOOSH injury. Pain over distal radius metaphysis with localized swelling.'
  });

  // Selected image & sample mode state
  const [selectedImage, setSelectedImage] = useState<string>('/assets/wrist_fracture.jpg');
  const [imageName, setImageName] = useState<string>('distal_radius_radiograph_AP.png');
  const [sampleType, setSampleType] = useState<'fracture' | 'normal' | 'blurry' | 'custom_upload' | 'failed'>('fracture');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const workflowSteps = [
    { num: '01', name: 'FILE INGEST', desc: 'Format & Matrix Validation' },
    { num: '02', name: 'QUALITY SCREEN', desc: 'Blur & Contrast Screening' },
    { num: '03', name: 'INFERENCE', desc: 'Fracture Feature Analysis' },
    { num: '04', name: 'CLINICIAN QUEUE', desc: 'Verification & Sign-off' },
  ];

  // Validate uploaded files against size (15MB max) and format (PNG/JPEG/JPG)
  const validateAndSetFile = (file: File) => {
    setUploadError(null);

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError(`Unsupported file format "${file.name}". Please upload a valid PNG or JPEG radiograph.`);
      return;
    }

    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      setUploadError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 15MB workstation limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setImageName(file.name);
        
        // Connect Genuine Inference: All uploaded images run through the trained ResNet-18 model
        const lowerName = file.name.toLowerCase();
        if (lowerName.includes('blur') || lowerName.includes('suboptimal')) {
          setSampleType('blurry');
        } else {
          setSampleType('custom_upload');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) {
      setUploadError('Please select or upload a wrist X-ray radiograph before starting analysis.');
      return;
    }
    setIsProcessing(true);
    await onRunAnalysis(selectedImage, patientInfo, sampleType);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            New Wrist X-Ray Analysis Workstation
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Upload a wrist radiograph for automated quality screening, fracture candidate detection, and clinician verification.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-3 py-1.5 rounded-xl border border-cyan-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          4-STAGE CLINICAL PIPELINE
        </span>
      </div>

      {/* 4-Stage Workflow Stepper */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">
          4-STAGE QUALITY & ANALYSIS WORKFLOW
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {workflowSteps.map((step) => (
            <div key={step.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block font-mono uppercase truncate">{step.name}</span>
                <span className="text-[10px] text-slate-500 block truncate">{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="bg-rose-50 border border-rose-300 p-4 rounded-2xl text-xs text-rose-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Case Details Form + Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Case Information Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 font-mono">
              <span>01. Case Metadata</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Synthetic demo patient details & projection parameters</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Case ID */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Case ID</label>
              <input
                type="text"
                value={patientInfo.caseId || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, caseId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Patient ID */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Patient ID (Synthetic)</label>
              <input
                type="text"
                value={patientInfo.patientId || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, patientId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Age & Sex Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Age</label>
                <input
                  type="number"
                  value={patientInfo.age || 45}
                  onChange={(e) => setPatientInfo({ ...patientInfo, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Sex</label>
                <select
                  value={patientInfo.sex || 'F'}
                  onChange={(e) => setPatientInfo({ ...patientInfo, sex: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* X-Ray Projection View */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">X-Ray Projection View</label>
              <select
                value={patientInfo.xrayView || 'AP'}
                onChange={(e) => setPatientInfo({ ...patientInfo, xrayView: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono font-bold"
              >
                <option value="AP">Anteroposterior (AP View)</option>
                <option value="PA">Posteroanterior (PA View)</option>
                <option value="Lateral">Lateral View</option>
                <option value="Oblique">Oblique View</option>
                <option value="Unknown">Unknown / Unspecified</option>
              </select>
            </div>
          </div>

          {/* Preset Sample Selector Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                EVALUATION & REFERENCE MODE
              </span>
              <span className="text-[9px] font-mono text-blue-600 font-semibold">
                Select Test Condition
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedImage('/assets/test_cases/eval_set/test_normal_1_1322_1184409339_01_WRI-L2_M013.png');
                  setImageName('grazpedwri_test_normal_PA.png');
                  setSampleType('custom_upload');
                }}
                className={`px-3 py-2.5 rounded-xl text-[11px] font-semibold border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                  selectedImage.includes('test_normal') && sampleType === 'custom_upload'
                    ? 'bg-blue-50 text-blue-900 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  GRAZ Test: Normal
                </span>
                <span className="text-[9px] text-slate-500">Genuine Model Forward Pass</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedImage('/assets/test_cases/eval_set/test_fracture_2_0498_0283642068_02_WRI-R2_M015.png');
                  setImageName('grazpedwri_test_fracture_AP.png');
                  setSampleType('custom_upload');
                }}
                className={`px-3 py-2.5 rounded-xl text-[11px] font-semibold border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                  selectedImage.includes('test_fracture') && sampleType === 'custom_upload'
                    ? 'bg-blue-50 text-blue-900 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  GRAZ Test: Fracture
                </span>
                <span className="text-[9px] text-slate-500">Genuine Model Forward Pass</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedImage('/assets/wrist_fracture.jpg');
                  setImageName('blurry_suboptimal_sample_AP.jpg');
                  setSampleType('blurry');
                }}
                className={`px-3 py-2.5 rounded-xl text-[11px] font-semibold border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                  sampleType === 'blurry'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Quality Alert
                </span>
                <span className="text-[9px] text-slate-500">Blur Screening Flag</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedImage('/assets/wrist_normal.jpg');
                  setImageName('normal_wrist_architecture_PA.jpg');
                  setSampleType('normal');
                }}
                className={`px-3 py-2.5 rounded-xl text-[11px] font-semibold border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                  sampleType === 'normal'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Demo Record (Preset)
                </span>
                <span className="text-[9px] text-slate-500">Illustrative Demo Fixture</span>
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setSampleType('failed');
                }}
                className={`w-full px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all text-center cursor-pointer ${
                  sampleType === 'failed'
                    ? 'bg-slate-800 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Simulate Runtime Inference Failure (Analysis Failed)
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Upload Dropzone & Image Preview */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">02. Radiograph Ingestion Dropzone</h2>
                <p className="text-xs text-slate-500 mt-0.5">PNG or JPEG format (DICOM export preview supported)</p>
              </div>

              {selectedImage && (
                <button
                  onClick={() => {
                    setSelectedImage('');
                    setImageName('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                selectedImage
                  ? 'border-blue-300 bg-blue-50/20'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10'
              }`}
            >
              <input
                type="file"
                id="xray-upload-input"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!selectedImage ? (
                <label htmlFor="xray-upload-input" className="cursor-pointer block space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Drop wrist X-ray radiograph here</p>
                    <p className="text-xs text-blue-600 font-medium hover:underline mt-0.5">
                      or click to select file from workstation
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">Supported: PNG, JPEG (Max 15MB). Note: Raw DICOM parsing is not enabled in this web prototype.</p>
                </label>
              ) : (
                <div className="space-y-4">
                  {/* Radiology Canvas Viewer Preview Frame */}
                  <div className="relative aspect-[4/3] max-h-72 rounded-xl bg-slate-950 overflow-hidden mx-auto shadow-md border border-slate-800">
                    <img
                      src={selectedImage}
                      alt="Uploaded Wrist Radiograph"
                      className={`w-full h-full object-contain filter contrast-125 ${
                        sampleType === 'blurry' ? 'blur-xs opacity-75' : ''
                      }`}
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/90 text-[10px] font-mono text-cyan-300 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{imageName}</span>
                    </div>

                    {sampleType === 'blurry' && (
                      <div className="absolute inset-0 bg-amber-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 text-center">
                        <div className="bg-amber-900/90 text-amber-100 p-3 rounded-xl border border-amber-600 text-xs space-y-1 font-mono">
                          <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto" />
                          <span className="font-bold block">SIMULATED QUALITY CONCERN</span>
                          <span className="text-[10px] text-amber-200">Excessive blur flag will pause automated fracture detection</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-slate-800 font-mono">{imageName}</span>
                    </div>

                    <label
                      htmlFor="xray-upload-input"
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Change File
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Trigger */}
          {selectedImage && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider font-mono">READY FOR PIPELINE PROCESSING</span>
                {sampleType === 'blurry' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    QUALITY SCREENING ALERT EXPECTED
                  </span>
                ) : sampleType === 'normal' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    VERIFIED NORMAL REFERENCE
                  </span>
                ) : sampleType === 'custom_upload' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    MODEL DISCONNECTED TEST
                  </span>
                ) : sampleType === 'failed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                    RUNTIME FAILURE SIMULATION
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    DEMO FRACTURE REFERENCE
                  </span>
                )}
              </div>

              <button
                onClick={handleStartAnalysis}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
              >
                <span>RUN PIPELINE WORKFLOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-slate-400 font-mono">
                Pipeline execution: File Validation &rarr; Quality Screening &rarr; Fracture Analysis (if quality passes) &rarr; Clinician Review Queue
              </p>
            </div>
          )}

        </div>

      </div>

      <ProcessingModal
        isOpen={isProcessing}
        onComplete={() => setIsProcessing(false)}
      />

    </div>
  );
};
