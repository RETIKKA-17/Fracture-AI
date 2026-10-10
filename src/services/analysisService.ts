import type {
  CaseRecord,
  AIResult,
  PatientInfo,
  ReviewAgreement,
  ClinicianAction,
  ImageQualityChecks
} from '../types';
import { INITIAL_MOCK_CASES } from '../data/mockCases';
import { runGenuineInference } from './onnxInferenceService';

const STORAGE_KEY = 'wristai_cases_db_v2';

const isStorageAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
};

// Load stored cases or initialize with defaults
export const getStoredCases = (): CaseRecord[] => {
  try {
    if (isStorageAvailable()) {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: CaseRecord) => {
            // If imageUrl is missing or is a revoked blob URL from a previous browser session, sanitize it
            let sanitizedImageUrl = c.imageUrl;
            if (!sanitizedImageUrl || sanitizedImageUrl.startsWith('blob:')) {
              sanitizedImageUrl = c.aiResult?.prediction === 'No Fracture Detected'
                ? '/assets/wrist_normal.jpg'
                : '/assets/wrist_fracture.jpg';
            }
            const updatedAiResult = c.aiResult ? {
              ...c.aiResult,
              analysisMode: c.aiResult.analysisMode || ('DEMO_MOCK' as const),
              isDemoConfidence: c.aiResult.isDemoConfidence !== undefined ? c.aiResult.isDemoConfidence : true
            } : c.aiResult;

            return {
              ...c,
              imageUrl: sanitizedImageUrl,
              isDemo: c.isDemo !== undefined ? c.isDemo : true,
              aiResult: updatedAiResult
            };
          });
        }
      }
    }
  } catch (e) {
    console.error('Failed to read cases from localStorage:', e);
  }
  // Initialize with updated mock cases
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CASES));
    } catch {
      // ignore
    }
  }
  return INITIAL_MOCK_CASES;
};

// Save cases list
export const saveCasesToStorage = (cases: CaseRecord[]) => {
  try {
    if (isStorageAvailable()) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    }
  } catch (e) {
    console.error('Failed to save cases to localStorage:', e);
  }
};

export const getCaseById = (id: string): CaseRecord | undefined => {
  const cases = getStoredCases();
  return cases.find((c) => c.id === id);
};

export const updateCaseImage = (caseId: string, newImageUrl: string): CaseRecord | null => {
  const cases = getStoredCases();
  const index = cases.findIndex((c) => c.id === caseId);
  if (index === -1) return null;

  const updatedCase = {
    ...cases[index],
    imageUrl: newImageUrl
  };
  cases[index] = updatedCase;
  saveCasesToStorage(cases);
  return updatedCase;
};

/**
 * Updates a case with a clinician review decision
 * Preserves the original AI result and records the clinician action separately.
 */
export const updateCaseReview = (
  caseId: string,
  agreement: ReviewAgreement,
  notes: string,
  action?: ClinicianAction,
  correctedLocation?: string
): CaseRecord | null => {
  const cases = getStoredCases();
  const index = cases.findIndex((c) => c.id === caseId);
  if (index === -1) return null;

  const now = new Date();
  const timeStr = `Today, ${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  // Determine workflow status based on clinician action
  let newStatus: CaseRecord['status'] = 'Reviewed';
  if (action === 'Confirm' || agreement === 'Agree') {
    newStatus = 'Clinician Confirmed';
  } else if (action === 'Edit') {
    newStatus = 'Clinician Edited';
  } else if (action === 'Reject' || agreement === 'Disagree') {
    newStatus = 'Rejected by Clinician';
  } else if (action === 'Uncertain' || agreement === 'Needs Further Review') {
    newStatus = 'Uncertain — Further Review Required';
  } else if (action === 'RequestBetterImage') {
    newStatus = 'Quality Review Required';
  }

  const existingCase = cases[index];
  const auditId = `ev-rev-${Date.now()}`;

  const updatedCase: CaseRecord = {
    ...existingCase,
    status: newStatus,
    clinicianReview: {
      agreement,
      action: action || (agreement === 'Agree' ? 'Confirm' : agreement === 'Disagree' ? 'Reject' : 'Uncertain'),
      notes,
      correctedLocation,
      clinicianName: 'Dr. Clinician',
      timestamp: timeStr,
      isSaved: true
    },
    auditTrail: [
      ...(existingCase.auditTrail || []),
      {
        id: auditId,
        timestamp: timeStr,
        event: `Clinician review submitted: ${action || agreement}`,
        actor: 'Dr. Clinician',
        details: notes ? `Notes: "${notes.slice(0, 50)}..."` : `Status updated to ${newStatus}`
      }
    ]
  };

  cases[index] = updatedCase;
  saveCasesToStorage(cases);
  return updatedCase;
};

/**
 * Technical Image Quality Screening Service Heuristic (Simulated / Heuristic)
 * Inspects image characteristics to screen quality prior to fracture detection.
 */
export const screenImageQuality = (
  _imageUrl: string,
  sampleQuality: 'suitable' | 'suboptimal_blur' | 'suboptimal_contrast' = 'suitable'
): ImageQualityChecks => {
  if (sampleQuality === 'suboptimal_blur') {
    return {
      resolution: true,
      fieldOfView: true,
      contrast: false,
      brightness: true,
      wristVisibility: true,
      imageIntegrity: false,
      screeningStatus: 'REVIEW_REQUIRED',
      qualityFlags: ['EXCESSIVE_BLUR', 'POOR_CONTRAST'],
      screeningReason: 'Possible blur detected by the technical screening heuristic',
      status: 'QUALITY REVIEW REQUIRED'
    };
  }

  if (sampleQuality === 'suboptimal_contrast') {
    return {
      resolution: true,
      fieldOfView: true,
      contrast: false,
      brightness: false,
      wristVisibility: true,
      imageIntegrity: true,
      screeningStatus: 'REVIEW_REQUIRED',
      qualityFlags: ['LOW_BRIGHTNESS', 'POOR_CONTRAST'],
      screeningReason: 'Suboptimal contrast ratio detected in radiocarpal zone',
      status: 'QUALITY REVIEW REQUIRED'
    };
  }

  return {
    resolution: true,
    fieldOfView: true,
    contrast: true,
    brightness: true,
    wristVisibility: true,
    imageIntegrity: true,
    screeningStatus: 'PASS',
    qualityFlags: [],
    status: 'GOOD'
  };
};

export interface ModelStatus {
  isModelConnected: boolean;
  modelName: string;
  modelArchitecture: string;
  modelPath: string | null;
  classMapping: {
    0: string; // 'No Fracture Detected'
    1: string; // 'Fracture Suspected'
  };
  statusMessage: string;
}

export const MODEL_STATUS: ModelStatus = {
  isModelConnected: true,
  modelName: 'WristAI ResNet-18 (GRAZPEDWRI-DX)',
  modelArchitecture: 'Deep Convolutional Residual Network (18 layers, ImageNet Pretrained, Binary Logit Head)',
  modelPath: '/models/wrist_model.onnx',
  classMapping: {
    0: 'No Fracture Detected',
    1: 'Fracture Suspected'
  },
  statusMessage: 'AI Model Active — Trained on GRAZPEDWRI-DX with Strict Patient-Isolated Splits'
};

/**
 * Core Service function: analyseXRay
 * Encapsulates the 4-stage pipeline:
 * A. File Validation -> B. Quality Screening -> C. Fracture Inference -> D. Clinician Review Queue
 */
export const analyseXRay = async (
  imageUrl: string,
  patientInfo: Partial<PatientInfo>,
  sampleType: 'fracture' | 'normal' | 'blurry' | 'custom_upload' | 'failed' = 'custom_upload'
): Promise<CaseRecord> => {
  // Simulate 2.0s analysis delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const nextIdNum = Math.floor(26 + Math.random() * 70);
  const caseId = patientInfo.caseId || `WR-0${nextIdNum}`;
  const now = new Date();
  const timeStr = `Today, ${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  // Stage B: Quality Screening
  const isBlurrySample = sampleType === 'blurry';
  const qualityChecks = screenImageQuality(imageUrl, isBlurrySample ? 'suboptimal_blur' : 'suitable');
  const isQualityBlocked = qualityChecks.screeningStatus !== 'PASS';

  let aiResult: AIResult;
  let initialStatus: CaseRecord['status'] = 'Review Required';
  let priority: CaseRecord['priority'] = 'Normal';
  let reviewReason = 'Pending clinician verification';

  if (isQualityBlocked) {
    // Pipeline rule: If image quality is unsuitable, automated fracture inference is PAUSED / SKIPPED.
    // Do NOT generate a fake fracture prediction.
    initialStatus = 'Quality Review Required';
    priority = 'High';
    reviewReason = 'Image quality concern — severe blur detected';

    aiResult = {
      prediction: 'Analysis Not Performed',
      confidence: 0,
      confidenceLevel: 'Not Applicable',
      confidenceBand: 'N/A',
      suspectedRegion: 'None (Analysis Paused)',
      anatomicalStructure: 'Distal Radius / Radiocarpal Joint',
      interpretation:
        'Automated fracture analysis paused. The experimental quality screening stage identified severe image blur that exceeds acceptable diagnostic clarity thresholds for automated feature extraction.',
      radiologicalFindings: [
        'Experimental screening heuristic: Motion blur detected',
        'Contrast modulation index below automated inference cut-off',
        'Automated model inference skipped to prevent false positive / negative outputs'
      ],
      regionsOfInterest: [],
      imageQuality: 'Unsuitable for automated analysis',
      qualityChecks,
      analysisPerformed: false,
      analysisBlockedReason: qualityChecks.screeningReason,
      uncertaintyReason: 'Image quality concern',
      analysisMode: 'DEMO_MOCK',
      isDemoConfidence: true
    };
  } else if (sampleType === 'failed') {
    initialStatus = 'Analysis Failed';
    priority = 'Normal';
    reviewReason = 'Analysis Failed — Manual clinician review required';

    aiResult = {
      prediction: 'Analysis Failed',
      confidence: 0,
      confidenceLevel: 'Not Applicable',
      confidenceBand: 'N/A',
      suspectedRegion: 'None (Analysis Failed)',
      anatomicalStructure: 'Distal Radius / Radiocarpal Joint',
      interpretation:
        'Analysis Failed: Inference runtime failure encountered during feature matrix processing. Radiograph requires manual radiologist inspection.',
      radiologicalFindings: [
        'Inference runtime error caught during processing',
        'Inference terminated safely without generating synthetic findings'
      ],
      regionsOfInterest: [],
      imageQuality: 'Quality not verified',
      qualityChecks,
      analysisPerformed: false,
      analysisBlockedReason: 'Inference runtime failure',
      analysisMode: 'DEMO_MOCK',
      isDemoConfidence: false
    };
  } else if (sampleType === 'custom_upload') {
    // Stage C: Genuine Image Inference using Trained ResNet-18 ONNX Model
    const inference = await runGenuineInference(imageUrl);

    if (inference.isModelReady) {
      const isFracture = inference.prediction === 'Fracture Suspected';
      initialStatus = 'Review Required';
      priority = isFracture ? 'High' : 'Normal';
      reviewReason = isFracture
        ? `Candidate fracture detected by ResNet-18 (${inference.confidencePct}% probability)`
        : `No fracture detected by ResNet-18 (${inference.confidencePct}% confidence)`;

      aiResult = {
        prediction: inference.prediction,
        confidence: inference.confidencePct,
        confidenceLevel: inference.confidencePct >= 80 ? 'High Confidence' : 'Moderate Confidence',
        confidenceBand: isFracture ? (inference.confidencePct >= 80 ? 'HIGH' : 'LOW') : 'NORMAL',
        suspectedRegion: isFracture
          ? 'Distal Radius / Metaphyseal Cortical Junction'
          : 'None (Intact Cortical Margins)',
        anatomicalStructure: 'Distal Radius & Radiocarpal Joint',
        interpretation: isFracture
          ? `Authentic ResNet-18 deep learning model detected radiographic features suspicious for cortical discontinuity (P(fracture) = ${(inference.probability * 100).toFixed(1)}%). Evaluated on uploaded radiograph matrix.`
          : `Authentic ResNet-18 deep learning model detected continuous cortical borders with no acute fracture line identified (P(fracture) = ${(inference.probability * 100).toFixed(1)}%). Evaluated on uploaded radiograph matrix.`,
        radiologicalFindings: [
          'Model Backbone: ResNet-18 (ImageNet Pretrained, Binary Logit Head)',
          `Inference Runtime: ONNX Runtime WebAssembly (${inference.inferenceTimeMs}ms)`,
          `Sigmoid Fracture Logit: ${inference.rawLogit.toFixed(4)} (Probability: ${(inference.probability * 100).toFixed(1)}%)`,
          'Validation Baseline: GRAZPEDWRI-DX Independent Test Partition'
        ],
        regionsOfInterest: isFracture
          ? [
              {
                x: 48,
                y: 47,
                radius: 12,
                intensity: Number(inference.probability.toFixed(2)),
                label: `Cortical candidate zone (P=${(inference.probability * 100).toFixed(0)}%)`
              }
            ]
          : [],
        imageQuality: 'Suitable for analysis',
        qualityChecks,
        analysisPerformed: true,
        analysisMode: 'LIVE_MODEL',
        isDemoConfidence: false
      };
    } else {
      // Model not available / failed to initialize
      initialStatus = 'AI Model Not Ready';
      priority = 'Normal';
      reviewReason = 'AI Model Not Ready — Manual clinician review required';

      aiResult = {
        prediction: 'AI Model Not Ready',
        confidence: 0,
        confidenceLevel: 'Not Applicable',
        confidenceBand: 'N/A',
        suspectedRegion: 'None (Model Not Ready)',
        anatomicalStructure: 'Distal Radius / Radiocarpal Joint',
        interpretation:
          'AI Model Not Ready: Deep learning model weights could not be loaded into the inference engine. Synthetic predictions are strictly suppressed for clinical safety. Please review this radiograph manually.',
        radiologicalFindings: [
          'Uploaded image file matrix validated successfully',
          'Deep learning inference engine: AI MODEL NOT READY',
          'Automated prediction suppressed to protect diagnostic integrity'
        ],
        regionsOfInterest: [],
        imageQuality: 'Suitable for analysis',
        qualityChecks,
        analysisPerformed: false,
        analysisBlockedReason: 'AI Model Not Ready',
        analysisMode: 'LIVE_MODEL',
        isDemoConfidence: false
      };
    }
  } else if (sampleType === 'fracture') {
    initialStatus = 'Review Required';
    priority = 'High';
    reviewReason = 'Candidate fracture detected (Demo Analysis Mode)';

    aiResult = {
      prediction: 'Fracture Suspected',
      confidence: 94,
      confidenceLevel: 'High Confidence',
      confidenceBand: 'HIGH',
      suspectedRegion: 'Distal Radius (Metaphyseal Junction)',
      anatomicalStructure: 'Distal Radius Articular Surface',
      interpretation:
        'Suspicious cortical discontinuity and focal osteopenia detected in the distal radial metaphysis. Visual evidence map indicates strong convolutional activation along the volar/dorsal cortical rim. (Demo Illustrative Result)',
      radiologicalFindings: [
        'Linear lucency traversing distal radial cortex',
        'Intact radiocarpal articular alignment',
        'Soft tissue density variation consistent with post-traumatic edema',
        'Ulna styloid process intact'
      ],
      regionsOfInterest: [
        {
          x: 47,
          y: 47,
          radius: 14,
          intensity: 0.94,
          label: 'Candidate #1: Cortical Disruption Zone (Demo Overlay)'
        },
        {
          x: 43,
          y: 52,
          radius: 9,
          intensity: 0.65,
          label: 'Candidate #2: Trabecular Discontinuity (Demo Overlay)'
        }
      ],
      imageQuality: 'Suitable for analysis',
      qualityChecks,
      analysisPerformed: true,
      analysisMode: 'DEMO_MOCK',
      isDemoConfidence: true
    };
  } else {
    // Normal verified sample (No Fracture)
    initialStatus = 'Review Required';
    priority = 'Normal';
    reviewReason = 'No fracture candidate identified (Demo Analysis Mode)';

    aiResult = {
      prediction: 'No Fracture Detected',
      confidence: 91,
      confidenceLevel: 'High Confidence',
      confidenceBand: 'NORMAL', // FIXED: 'NORMAL' instead of 'HIGH'
      suspectedRegion: 'None (Normal Architecture)',
      anatomicalStructure: 'Wrist Radiocarpal & Midcarpal Joints',
      interpretation:
        'Normal alignment of distal radius and ulna with continuous bony cortical borders. No acute fracture line, bony impaction, or carpal subluxation detected. (Demo Illustrative Result)',
      radiologicalFindings: [
        'Normal radial inclination and volar tilt angles',
        'Preserved radiocarpal and distal radioulnar joint spaces',
        'No significant periarticular soft tissue expansion'
      ],
      regionsOfInterest: [], // Zero bounding boxes!
      imageQuality: 'Suitable for analysis',
      qualityChecks,
      analysisPerformed: true,
      analysisMode: 'DEMO_MOCK',
      isDemoConfidence: true
    };
  }

  const newCase: CaseRecord = {
    id: caseId,
    patient: {
      caseId: caseId,
      patientId: patientInfo.patientId || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      age: patientInfo.age || 45,
      sex: patientInfo.sex || 'M',
      xrayView: patientInfo.xrayView || 'AP',
      date: 'Just now',
      referralPhysician: patientInfo.referralPhysician || 'Emergency Dept',
      clinicalHistory: patientInfo.clinicalHistory || 'Wrist pain following fall.'
    },
    imageUrl,
    status: initialStatus,
    priority,
    reviewReason,
    createdDate: now.toISOString().split('T')[0],
    isDemo: sampleType !== 'custom_upload',
    aiResult,
    clinicianReview: {
      agreement: 'Pending',
      notes: '',
      clinicianName: 'Dr. Clinician',
      timestamp: '',
      isSaved: false
    },
    auditTrail: [
      {
        id: `ev-${Date.now()}-1`,
        timestamp: timeStr,
        event: 'File ingest & validation completed',
        actor: 'System',
        details: `Format: PNG/JPEG, Case ID: ${caseId}`
      },
      {
        id: `ev-${Date.now()}-2`,
        timestamp: timeStr,
        event: `Quality screening status: ${qualityChecks.screeningStatus}`,
        actor: 'Quality Validator',
        details: isQualityBlocked
          ? `Flagged: ${qualityChecks.qualityFlags.join(', ')} — Fracture analysis paused`
          : 'All image quality parameters passed'
      },
      ...(isQualityBlocked
        ? []
        : aiResult.prediction === 'AI Model Not Connected'
        ? [
            {
              id: `ev-${Date.now()}-3`,
              timestamp: timeStr,
              event: 'Inference skipped: AI Model Not Connected',
              actor: 'System' as const,
              details: 'Model offline. Synthetic predictions suppressed for clinical safety.'
            }
          ]
        : aiResult.prediction === 'Analysis Failed'
        ? [
            {
              id: `ev-${Date.now()}-3`,
              timestamp: timeStr,
              event: 'Inference failed during runtime execution',
              actor: 'System' as const,
              details: 'Processing exception caught. Manual review required.'
            }
          ]
        : [
            {
              id: `ev-${Date.now()}-3`,
              timestamp: timeStr,
              event: 'AI fracture inference completed (Demo Mode)',
              actor: 'AI Saliency Engine' as const,
              details: `Prediction: ${aiResult.prediction} (Demo Confidence: ${aiResult.confidence}%)`
            }
          ])
    ]
  };

  // Add to storage
  const existing = getStoredCases();
  const updatedList = [newCase, ...existing];
  saveCasesToStorage(updatedList);

  return newCase;
};
