import type { CaseRecord } from '../types';

export const INITIAL_MOCK_CASES: CaseRecord[] = [
  {
    id: 'WR-025',
    patient: {
      caseId: 'WR-025',
      patientId: 'PT-9401',
      age: 52,
      sex: 'M',
      xrayView: 'AP',
      date: 'Today, 15:05',
      referralPhysician: 'Dr. S. Miller (Emergency Dept)',
      clinicalHistory: 'Subacute wrist trauma following sports collision. Radiograph exhibits severe motion blur artifact.'
    },
    imageUrl: '/assets/wrist_fracture.jpg',
    status: 'Quality Review Required',
    createdDate: '2026-08-30',
    isDemo: true,
    priority: 'High',
    reviewReason: 'Image quality concern — motion blur flagged',
    aiResult: {
      prediction: 'Analysis Not Performed',
      confidence: 0,
      confidenceLevel: 'Not Applicable',
      confidenceBand: 'N/A',
      suspectedRegion: 'None (Analysis Paused)',
      anatomicalStructure: 'Distal Radius / Radiocarpal Joint',
      interpretation: 'Automated fracture analysis paused. The quality screening stage identified severe image blur that exceeds acceptable diagnostic clarity thresholds for feature extraction.',
      radiologicalFindings: [
        'Quality screening heuristic: Motion blur detected',
        'Contrast modulation index below automated inference cut-off',
        'Automated model inference skipped to prevent false positive / negative outputs'
      ],
      regionsOfInterest: [],
      imageQuality: 'Unsuitable for automated analysis',
      analysisPerformed: false,
      analysisBlockedReason: 'Possible blur detected by quality screening heuristic',
      analysisMode: 'DEMO_MOCK',
      isDemoConfidence: true,
      qualityChecks: {
        resolution: true,
        fieldOfView: true,
        contrast: false,
        brightness: true,
        wristVisibility: true,
        imageIntegrity: false,
        screeningStatus: 'REVIEW_REQUIRED',
        qualityFlags: ['EXCESSIVE_BLUR', 'POOR_CONTRAST'],
        screeningReason: 'Possible blur detected by technical screening heuristic',
        status: 'QUALITY REVIEW REQUIRED'
      },
      uncertaintyReason: 'Image quality concern'
    },
    clinicianReview: {
      agreement: 'Pending',
      notes: '',
      clinicianName: 'Dr. Clinician',
      timestamp: '',
      isSaved: false
    },
    auditTrail: [
      { id: 'ev-501', timestamp: 'Today, 15:05:00', event: 'Case WR-025 ingested from emergency workstation', actor: 'System', details: 'File size: 3.4MB' },
      { id: 'ev-502', timestamp: 'Today, 15:05:02', event: 'Quality screening executed', actor: 'Quality Validator', details: 'Flagged: EXCESSIVE_BLUR — Screening status: REVIEW_REQUIRED' },
      { id: 'ev-503', timestamp: 'Today, 15:05:03', event: 'Automated fracture execution skipped', actor: 'System', details: 'Prediction suppressed due to quality concern' }
    ]
  },
  {
    id: 'WR-024',
    patient: {
      caseId: 'WR-024',
      patientId: 'PT-8942',
      age: 48,
      sex: 'F',
      xrayView: 'AP',
      date: 'Today, 14:20',
      referralPhysician: 'Dr. E. Vance (Emergency Dept)',
      clinicalHistory: 'Acute fall on outstretched hand (FOOSH). Severe localized pain at distal radius metaphysis with mild swelling.'
    },
    imageUrl: '/assets/wrist_fracture.jpg',
    status: 'Review Required',
    createdDate: '2026-08-30',
    isDemo: true,
    priority: 'Normal',
    reviewReason: 'Candidate fracture detected (Demo Analysis)',
    aiResult: {
      prediction: 'Fracture Suspected',
      confidence: 94,
      confidenceLevel: 'High Confidence',
      confidenceBand: 'HIGH',
      suspectedRegion: 'Distal Radius (Dorsal Displacement)',
      anatomicalStructure: 'Distal Radius / Radiocarpal Joint',
      interpretation: 'Suspicious imaging features detected in the distal radius region. Cortical line discontinuity and localized bony trabecular disruption suggest an acute non-displaced fracture. (Illustrative Demo Output)',
      radiologicalFindings: [
        'Cortical discontinuity along distal radial metaphysis',
        'Mild dorsal tilt of distal radial articular surface',
        'No carpal dislocation observed',
        'Ulnar styloid intact'
      ],
      regionsOfInterest: [
        {
          x: 48,
          y: 46,
          radius: 14,
          intensity: 0.95,
          label: 'Candidate #1: Distal Radius Metaphysis (Demo Overlay)'
        },
        {
          x: 42,
          y: 50,
          radius: 10,
          intensity: 0.68,
          label: 'Candidate #2: Trabecular Impaction Zone (Demo Overlay)'
        }
      ],
      imageQuality: 'Suitable for analysis',
      analysisPerformed: true,
      analysisMode: 'DEMO_MOCK',
      isDemoConfidence: true,
      qualityChecks: {
        resolution: true,
        fieldOfView: true,
        contrast: true,
        brightness: true,
        wristVisibility: true,
        imageIntegrity: true,
        screeningStatus: 'PASS',
        qualityFlags: [],
        status: 'GOOD'
      }
    },
    clinicianReview: {
      agreement: 'Pending',
      notes: '',
      clinicianName: 'Dr. Clinician',
      timestamp: '',
      isSaved: false
    },
    auditTrail: [
      { id: 'ev-101', timestamp: 'Today, 14:20:05', event: 'Case record created & radiograph ingested', actor: 'System', details: 'Case WR-024 assigned to queue' },
      { id: 'ev-102', timestamp: 'Today, 14:20:08', event: 'Quality screening passed', actor: 'Quality Validator', details: 'Resolution: 1024x1024, Exposure: Normal' },
      { id: 'ev-103', timestamp: 'Today, 14:20:12', event: 'Demo fracture analysis complete', actor: 'AI Saliency Engine', details: 'Demo Prediction: Fracture Suspected (Illustrative Score: 94%)' }
    ]
  },
  {
    id: 'WR-023',
    patient: {
      caseId: 'WR-023',
      patientId: 'PT-6109',
      age: 34,
      sex: 'M',
      xrayView: 'PA',
      date: 'Today, 11:45',
      referralPhysician: 'Dr. M. Ross (Orthopedics)',
      clinicalHistory: 'Post-sports wrist pain. Rule out scaphoid or distal radial fracture.'
    },
    imageUrl: '/assets/wrist_normal.jpg',
    status: 'Reviewed',
    createdDate: '2026-08-30',
    isDemo: true,
    priority: 'Normal',
    reviewReason: 'Clinician confirmed normal anatomy',
    aiResult: {
      prediction: 'No Fracture Detected',
      confidence: 91,
      confidenceLevel: 'High Confidence',
      confidenceBand: 'NORMAL',
      suspectedRegion: 'None (Unremarkable Radiocarpal Joint)',
      anatomicalStructure: 'Wrist / Carpal Architecture',
      interpretation: 'Normal bone alignment and intact cortical margins across radius, ulna, and proximal carpal row. No fracture line or traumatic osseous defect detected. (Illustrative Demo Output)',
      radiologicalFindings: [
        'Smooth cortical contours of distal radius and ulna',
        'Normal carpal spaces and Gilula lines alignment',
        'No soft tissue swelling in pronator quadratus plane'
      ],
      regionsOfInterest: [],
      imageQuality: 'Suitable for analysis',
      analysisPerformed: true,
      analysisMode: 'DEMO_MOCK',
      isDemoConfidence: true,
      qualityChecks: {
        resolution: true,
        fieldOfView: true,
        contrast: true,
        brightness: true,
        wristVisibility: true,
        imageIntegrity: true,
        screeningStatus: 'PASS',
        qualityFlags: [],
        status: 'GOOD'
      }
    },
    clinicianReview: {
      agreement: 'Agree',
      action: 'Confirm',
      notes: 'Concur with normal evaluation. Radiocarpal and distal radioulnar joints are within normal limits. Supportive wrist brace provided.',
      clinicianName: 'Dr. Clinician',
      timestamp: 'Today, 12:10',
      isSaved: true
    },
    auditTrail: [
      { id: 'ev-201', timestamp: 'Today, 11:45:00', event: 'Case record created', actor: 'System', details: 'Ingested via PACS interface' },
      { id: 'ev-202', timestamp: 'Today, 11:45:03', event: 'Demo Analysis completed', actor: 'AI Saliency Engine', details: 'No Fracture Detected (Illustrative Score: 91%)' },
      { id: 'ev-203', timestamp: 'Today, 12:10:14', event: 'Clinician review submitted', actor: 'Dr. Clinician', details: 'Agreement: Agree (Confirmed Normal)' }
    ]
  },
  {
    id: 'WR-022',
    patient: {
      caseId: 'WR-022',
      patientId: 'PT-3021',
      age: 62,
      sex: 'F',
      xrayView: 'Lateral',
      date: 'Yesterday, 16:30',
      referralPhysician: 'Dr. A. Gupta (Trauma Care)',
      clinicalHistory: 'Traumatic slip on ice. Tenderness over ulnar styloid and distal forearm.'
    },
    imageUrl: '/assets/wrist_fracture.jpg',
    status: 'Reviewed',
    createdDate: '2026-08-29',
    isDemo: true,
    priority: 'Medium',
    reviewReason: 'Clinician confirmed ulnar styloid fracture',
    aiResult: {
      prediction: 'Fracture Suspected',
      confidence: 87,
      confidenceLevel: 'Moderate Confidence',
      confidenceBand: 'MODERATE',
      suspectedRegion: 'Ulnar Styloid Process & Radial Metaphysis',
      anatomicalStructure: 'Distal Ulna / Radius Metaphysis',
      interpretation: 'Irregularity identified along the ulnar styloid base with associated radial articular surface lucency. (Illustrative Demo Output)',
      radiologicalFindings: [
        'Possible non-displaced ulnar styloid fracture line',
        'Mild dorsal periarticular soft tissue shadow',
        'Normal scapholunate interval'
      ],
      regionsOfInterest: [
        {
          x: 45,
          y: 48,
          radius: 12,
          intensity: 0.82,
          label: 'Candidate #1: Ulnar Styloid Base (Demo Overlay)'
        }
      ],
      imageQuality: 'Suitable for analysis',
      analysisPerformed: true,
      analysisMode: 'DEMO_MOCK',
      isDemoConfidence: true,
      qualityChecks: {
        resolution: true,
        fieldOfView: true,
        contrast: true,
        brightness: true,
        wristVisibility: true,
        imageIntegrity: true,
        screeningStatus: 'PASS',
        qualityFlags: [],
        status: 'GOOD'
      },
      uncertaintyReason: 'Ambiguous candidate'
    },
    clinicianReview: {
      agreement: 'Agree',
      action: 'Confirm',
      notes: 'Confirmed non-displaced ulnar styloid fracture. Conservative splinting initiated.',
      clinicianName: 'Dr. Clinician',
      timestamp: 'Yesterday, 17:05',
      isSaved: true
    },
    auditTrail: [
      { id: 'ev-301', timestamp: '2026-08-29 16:30:10', event: 'Case record created', actor: 'System', details: 'Case WR-022' },
      { id: 'ev-302', timestamp: '2026-08-29 16:30:14', event: 'Demo Analysis completed', actor: 'AI Saliency Engine', details: 'Fracture Suspected (Illustrative Score: 87%)' },
      { id: 'ev-303', timestamp: '2026-08-29 17:05:22', event: 'Clinician verification recorded', actor: 'Dr. Clinician', details: 'Confirmed' }
    ]
  },
  {
    id: 'WR-021',
    patient: {
      caseId: 'WR-021',
      patientId: 'PT-1188',
      age: 55,
      sex: 'F',
      xrayView: 'AP',
      date: '28 Aug 2026',
      referralPhysician: 'Dr. R. Chen (Urgent Care)',
      clinicalHistory: 'High-energy motor vehicle collision. Classic silver-fork deformity.'
    },
    imageUrl: '/assets/wrist_fracture.jpg',
    status: 'Reviewed',
    createdDate: '2026-08-28',
    isDemo: true,
    priority: 'Normal',
    reviewReason: 'Clinician confirmed Colles type fracture',
    aiResult: {
      prediction: 'Fracture Suspected',
      confidence: 96,
      confidenceLevel: 'High Confidence',
      confidenceBand: 'HIGH',
      suspectedRegion: 'Distal Radius Metaphysis (Colles Type)',
      anatomicalStructure: 'Distal Radius Articular Surface',
      interpretation: 'AI feature activation indicating transverse distal radius metaphysis fracture with extra-articular involvement. (Illustrative Demo Output)',
      radiologicalFindings: [
        'Transverse fracture line across distal radius metaphysis',
        'Colles deformative displacement',
        'Intact distal radioulnar joint'
      ],
      regionsOfInterest: [
        {
          x: 48,
          y: 47,
          radius: 15,
          intensity: 0.98,
          label: 'Candidate #1: Metaphyseal Fracture (Demo Overlay)'
        }
      ],
      imageQuality: 'Suitable for analysis',
      analysisPerformed: true,
      analysisMode: 'DEMO_MOCK',
      isDemoConfidence: true,
      qualityChecks: {
        resolution: true,
        fieldOfView: true,
        contrast: true,
        brightness: true,
        wristVisibility: true,
        imageIntegrity: true,
        screeningStatus: 'PASS',
        qualityFlags: [],
        status: 'GOOD'
      }
    },
    clinicianReview: {
      agreement: 'Agree',
      action: 'Confirm',
      notes: 'Closed reduction performed in ER. Plaster cast applied. Follow-up X-ray scheduled in 2 weeks.',
      clinicianName: 'Dr. Clinician',
      timestamp: '28 Aug 2026, 18:00',
      isSaved: true
    },
    auditTrail: [
      { id: 'ev-401', timestamp: '2026-08-28 17:40:00', event: 'Case record created', actor: 'System', details: 'Ingested ER emergency radiograph' },
      { id: 'ev-402', timestamp: '2026-08-28 17:40:06', event: 'Demo Analysis completed', actor: 'AI Saliency Engine', details: 'Illustrative Fracture Prediction (96%)' },
      { id: 'ev-403', timestamp: '2026-08-28 18:00:15', event: 'Clinician signed off', actor: 'Dr. Clinician', details: 'Case closed and report archived' }
    ]
  }
];
