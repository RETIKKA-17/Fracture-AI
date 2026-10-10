export type CaseStatus =
  | 'Review Required'
  | 'Quality Review Required'
  | 'Analysis Completed — Review Pending'
  | 'Clinician Confirmed'
  | 'Clinician Edited'
  | 'Rejected by Clinician'
  | 'Uncertain — Further Review Required'
  | 'Reviewed'
  | 'Pending Analysis'
  | 'AI Model Not Connected'
  | 'AI Model Not Ready'
  | 'Analysis Failed';

export type PredictionResult =
  | 'Fracture Suspected'
  | 'No Fracture Detected'
  | 'No Fracture Candidate Identified'
  | 'Analysis Not Performed'
  | 'Indeterminate'
  | 'AI Model Not Connected'
  | 'AI Model Not Ready'
  | 'Analysis Failed';

export type ReviewAgreement = 'Agree' | 'Disagree' | 'Needs Further Review' | 'Pending';

export type ClinicianAction =
  | 'Confirm'
  | 'Edit'
  | 'Reject'
  | 'Uncertain'
  | 'RequestBetterImage'
  | 'RequestFurtherReview';

export type ConfidenceLevel =
  | 'High Confidence'
  | 'Moderate Confidence'
  | 'Low Confidence / Review Recommended'
  | 'Not Applicable';

export type ConfidenceBand = 'HIGH' | 'MODERATE' | 'LOW' | 'NORMAL' | 'N/A';

export type QualityScreeningStatus =
  | 'PASS'
  | 'REVIEW_REQUIRED'
  | 'UNSUITABLE_FOR_AUTOMATED_ANALYSIS'
  | 'UNKNOWN';

export type QualityFlag =
  | 'EXCESSIVE_BLUR'
  | 'LOW_BRIGHTNESS'
  | 'HIGH_BRIGHTNESS'
  | 'POOR_CONTRAST'
  | 'INCOMPLETE_ANATOMY'
  | 'ARTIFACTS'
  | 'UNSUITABLE_RESOLUTION'
  | 'UNKNOWN_SUITABILITY';

export type ErrorCategory =
  | 'False Positive'
  | 'False Negative'
  | 'Poor Quality'
  | 'Cast'
  | 'Artifact'
  | 'Old Fracture'
  | 'Minimally Displaced'
  | 'Other';

export interface PatientInfo {
  caseId: string;
  patientId: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  xrayView: 'AP' | 'PA' | 'Lateral' | 'Oblique' | 'Unknown';
  date: string;
  referralPhysician?: string;
  clinicalHistory?: string;
  additionalViewsAttached?: boolean;
}

export interface HeatmapRegion {
  x: number; // percentage from left
  y: number; // percentage from top
  radius: number; // percentage radius
  intensity: number; // 0 to 1
  label: string;
}

export interface ClinicianAnnotation {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface ImageQualityChecks {
  resolution: boolean;
  fieldOfView: boolean;
  contrast: boolean;
  brightness: boolean;
  wristVisibility: boolean;
  imageIntegrity: boolean;
  screeningStatus: QualityScreeningStatus;
  qualityFlags: QualityFlag[];
  screeningReason?: string;
  status: 'GOOD' | 'SUBOPTIMAL' | 'QUALITY REVIEW REQUIRED';
}

export interface AIResult {
  prediction: PredictionResult;
  confidence: number; // percentage 0 - 100
  confidenceLevel: ConfidenceLevel;
  confidenceBand: ConfidenceBand;
  suspectedRegion: string;
  anatomicalStructure: string;
  interpretation: string;
  radiologicalFindings: string[];
  regionsOfInterest: HeatmapRegion[];
  imageQuality: 'Suitable for analysis' | 'Suboptimal view' | 'High quality' | 'Unsuitable for automated analysis' | 'Quality not verified';
  qualityChecks?: ImageQualityChecks;
  uncertaintyReason?: 'Low model confidence' | 'Image quality concern' | 'Ambiguous candidate' | 'Technical screening heuristic flag';
  analysisPerformed: boolean;
  analysisBlockedReason?: string;
  analysisMode?: 'LIVE_MODEL' | 'DEMO_MOCK';
  isDemoConfidence?: boolean;
}

export interface ClinicianReview {
  agreement: ReviewAgreement;
  action?: ClinicianAction;
  notes: string;
  correctedLocation?: string;
  clinicianName: string;
  timestamp: string;
  isSaved: boolean;
  clinicianAnnotation?: ClinicianAnnotation;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  event: string;
  actor: 'System' | 'Dr. Clinician' | 'AI Saliency Engine' | 'Quality Validator';
  details: string;
}

export interface CaseRecord {
  id: string; // e.g. WR-024
  patient: PatientInfo;
  imageUrl: string;
  aiResult?: AIResult;
  clinicianReview?: ClinicianReview;
  auditTrail?: AuditEvent[];
  errorCategory?: ErrorCategory;
  status: CaseStatus;
  createdDate: string;
  isDemo?: boolean;
  priority?: 'High' | 'Medium' | 'Normal';
  reviewReason?: string;
}
