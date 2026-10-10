# WristAI Project Dataset Documentation

This document contains the complete dataset information for the **WristAI** clinical decision support system, including the internal mock dataset used by the frontend application and the public machine learning datasets used for model training and benchmark evaluation.

---

## 1. Internal Application Mock Dataset

The application's mock database is defined in [`src/data/mockCases.ts`](file:///c:/Users/retik/OneDrive/%E5%9B%BE%E7%89%87/certificates/mini%20project/src/data/mockCases.ts). Below is the raw JSON representation of all mock cases included in the project.

```json
[
  {
    "id": "WR-024",
    "patient": {
      "caseId": "WR-024",
      "patientId": "PT-8942",
      "age": 48,
      "sex": "F",
      "xrayView": "AP",
      "date": "Today, 14:20"
    },
    "imageUrl": "/assets/wrist_fracture.jpg",
    "status": "Review Required",
    "createdDate": "2026-08-30",
    "isDemo": true,
    "aiResult": {
      "prediction": "Fracture Suspected",
      "confidence": 94,
      "confidenceLevel": "High Confidence",
      "suspectedRegion": "Distal Radius (Dorsal Displacement)",
      "anatomicalStructure": "Distal Radius / Radiocarpal Joint",
      "interpretation": "Suspicious imaging features detected in the distal radius region. Cortical line discontinuity and localized bony trabecular disruption suggest an acute non-displaced or mildly displaced fracture.",
      "radiologicalFindings": [
        "Cortical discontinuity along distal radial metaphysis",
        "Mild dorsal tilt of distal radial articular surface",
        "No carpal dislocation observed",
        "Ulnar styloid intact"
      ],
      "regionsOfInterest": [
        {
          "x": 48,
          "y": 46,
          "radius": 14,
          "intensity": 0.95,
          "label": "Primary Cortical Disruption (Distal Radius)"
        },
        {
          "x": 42,
          "y": 50,
          "radius": 10,
          "intensity": 0.68,
          "label": "Trabecular Impaction Zone"
        }
      ],
      "imageQuality": "Suitable for analysis"
    },
    "clinicianReview": {
      "agreement": "Pending",
      "notes": "",
      "clinicianName": "Dr. Clinician",
      "timestamp": "",
      "isSaved": false
    }
  },
  {
    "id": "WR-023",
    "patient": {
      "caseId": "WR-023",
      "patientId": "PT-6109",
      "age": 34,
      "sex": "M",
      "xrayView": "PA",
      "date": "Today, 11:45"
    },
    "imageUrl": "/assets/wrist_normal.jpg",
    "status": "Reviewed",
    "createdDate": "2026-08-30",
    "isDemo": true,
    "aiResult": {
      "prediction": "No Fracture Detected",
      "confidence": 91,
      "confidenceLevel": "High Confidence",
      "suspectedRegion": "None (Unremarkable Radiocarpal Joint)",
      "anatomicalStructure": "Wrist / Carpal Architecture",
      "interpretation": "Normal bone alignment and intact cortical margins across radius, ulna, and proximal carpal row. No fracture line or traumatic osseous defect detected.",
      "radiologicalFindings": [
        "Smooth cortical contours of distal radius and ulna",
        "Normal carpal spaces and Gilula lines alignment",
        "No soft tissue swelling in pronator quadratus plane"
      ],
      "regionsOfInterest": [],
      "imageQuality": "Suitable for analysis"
    },
    "clinicianReview": {
      "agreement": "Agree",
      "notes": "Concur with AI analysis. Radiocarpal and distal radioulnar joints are within normal limits.",
      "clinicianName": "Dr. Clinician",
      "timestamp": "Today, 12:10",
      "isSaved": true
    }
  },
  {
    "id": "WR-022",
    "patient": {
      "caseId": "WR-022",
      "patientId": "PT-3021",
      "age": 62,
      "sex": "F",
      "xrayView": "Lateral",
      "date": "Yesterday, 16:30"
    },
    "imageUrl": "/assets/wrist_fracture.jpg",
    "status": "Reviewed",
    "createdDate": "2026-08-29",
    "isDemo": true,
    "aiResult": {
      "prediction": "Fracture Suspected",
      "confidence": 87,
      "confidenceLevel": "Moderate Confidence",
      "suspectedRegion": "Ulnar Styloid Process & Radial Metaphysis",
      "anatomicalStructure": "Distal Ulna / Radius Metaphysis",
      "interpretation": "Irregularity identified along the ulnar styloid base with associated radial articular surface lucency.",
      "radiologicalFindings": [
        "Possible non-displaced ulnar styloid fracture line",
        "Mild dorsal periarticular soft tissue prominent shadow",
        "Normal scapholunate interval"
      ],
      "regionsOfInterest": [
        {
          "x": 45,
          "y": 48,
          "radius": 12,
          "intensity": 0.82,
          "label": "Ulnar Styloid Base"
        }
      ],
      "imageQuality": "Suitable for analysis"
    },
    "clinicianReview": {
      "agreement": "Agree",
      "notes": "Confirmed non-displaced ulnar styloid fracture. Conservative splinting initiated.",
      "clinicianName": "Dr. Clinician",
      "timestamp": "Yesterday, 17:05",
      "isSaved": true
    }
  },
  {
    "id": "WR-021",
    "patient": {
      "caseId": "WR-021",
      "patientId": "PT-1188",
      "age": 55,
      "sex": "F",
      "xrayView": "AP",
      "date": "28 Aug 2026"
    },
    "imageUrl": "/assets/wrist_fracture.jpg",
    "status": "Reviewed",
    "createdDate": "2026-08-28",
    "isDemo": true,
    "aiResult": {
      "prediction": "Fracture Suspected",
      "confidence": 96,
      "confidenceLevel": "High Confidence",
      "suspectedRegion": "Distal Radius Metaphysis (Colles Type)",
      "anatomicalStructure": "Distal Radius Articular Surface",
      "interpretation": "High-confidence AI activation indicating transverse distal radius metaphysis fracture with extra-articular involvement.",
      "radiologicalFindings": [
        "Transverse fracture line across distal radius metaphysis",
        "Classic Colles deformative displacement",
        "Intact distal radioulnar joint"
      ],
      "regionsOfInterest": [
        {
          "x": 48,
          "y": 47,
          "radius": 15,
          "intensity": 0.98,
          "label": "Metaphyseal Fracture Discontinuity"
        }
      ],
      "imageQuality": "Suitable for analysis"
    },
    "clinicianReview": {
      "agreement": "Agree",
      "notes": "Closed reduction performed. Plaster cast applied.",
      "clinicianName": "Dr. Clinician",
      "timestamp": "28 Aug 2026, 18:00",
      "isSaved": true
    }
  }
]
```

---

## 2. Sample Image Assets

The project includes sample X-ray images stored in the [`public/assets`](file:///c:/Users/retik/OneDrive/%E5%9B%BE%E7%89%87/certificates/mini%20project/public/assets) directory:

- **Fractured Wrist Sample**: `public/assets/wrist_fracture.jpg`
- **Normal Wrist Sample**: `public/assets/wrist_normal.jpg`

---

## 3. Public Machine Learning Training Datasets

For training and evaluating the deep learning models (ResNet-50 / DenseNet / YOLO) referenced in the system architecture:

1. **GRAZPEDWRI-DX Dataset**:
   - **Size**: 20,327 radiograph images from 10,505 studies.
   - **Focus**: Pediatric wrist trauma radiographs with detailed annotations for fractures, periosteal reactions, and bone lesions.
   - **Use Case**: Object detection and fracture localization bounding boxes.

2. **MURA (Musculoskeletal Radiographs)**:
   - **Size**: 40,561 multi-view radiograph studies from 14,863 patients.
   - **Focus**: Standard upper extremity radiographs (wrist, hand, elbow, shoulder).
   - **Source**: Stanford Machine Learning Group.

3. **Kaggle Bone Fracture Datasets**:
   - **Focus**: Open X-ray datasets for fracture vs. non-fracture binary classification.
