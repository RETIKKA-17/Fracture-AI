# FractureLens AI (WristAI)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime_Web-WASM-005CED.svg)](https://onnxruntime.ai/)
[![Dataset](https://img.shields.io/badge/Dataset-GRAZPEDWRI--DX_(CC_BY_4.0)-orange.svg)](https://doi.org/10.6084/m9.figshare.14825193)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **AI-Assisted Clinical Decision Support Research Prototype for Wrist Fracture Detection**  
> *Empirical deep learning inference running entirely in-browser via WebAssembly, validated with patient-isolated pediatric trauma radiographs.*

---

## 1. Project Overview

**FractureLens AI** (formerly known as WristAI) is an open-source clinical decision support research prototype designed to assist emergency clinicians and radiologists in identifying wrist fractures on X-ray radiographs. 

Unlike conventional prototypes that rely on hardcoded demo scores or cloud backend APIs with privacy risks, FractureLens AI integrates:
1. **End-to-End Deep Learning**: A fine-tuned **ResNet-18** convolutional neural network trained on authentic trauma radiographs from the **GRAZPEDWRI-DX** pediatric benchmark dataset.
2. **Client-Side WebAssembly Inference**: The trained model is exported to **ONNX** format (42.63 MB) and executes directly inside the web browser via **ONNX Runtime Web (`wasm`)**, ensuring zero patient image transmission over the network.
3. **Transparent Clinician Workstation**: A specialized radiologist interface providing high-resolution image viewing, cortical candidate localization, objective probability metrics, and separated clinician verification workflows.
4. **Empirical Benchmark Reporting**: Honest, non-fabricated reporting of independent test-set metrics ($N=29$) with Wilson 95% confidence intervals, alongside clinical failure mode analysis.

---

## 2. Problem Statement

Wrist injuries account for approximately **20% of all emergency department visits for extremity trauma**, with distal radius fractures being the most prevalent. Despite their frequency, diagnostic challenges remain acute:
- **Subtle & Non-Displaced Fractures**: Non-displaced micro-trabecular fractures and pediatric torus (buckle) fractures are easily overlooked during emergency triage, leading to delayed treatment, nonunion, or improper immobilization.
- **Pediatric Anatomical Ambiguity**: Open epiphyseal growth plates (physes) in children produce linear radiolucencies that mimic acute cortical fractures, causing frequent false-positive interpretations.
- **Misleading AI Benchmarks**: Many medical AI prototypes present fabricated demo confidence figures (e.g., hardcoded 94% scores) or rely on unverified string heuristics, eroding clinical trust and creating patient safety risks.

---

## 3. Proposed Solution

FractureLens AI addresses these limitations through:
- **Zero-Leakage Training**: Models trained using strict patient-level split isolation (ensuring all images from a patient remain solely in train, val, or test).
- **Edge / Client-Side Inference**: Executing PyTorch-trained neural networks in WebAssembly on the client device eliminates cloud latency, server hosting costs, and patient privacy (HIPAA/GDPR) compliance hurdles.
- **Clinician-in-the-Loop Safeguards**: AI predictions are strictly separated from clinician determinations. Clinicians can confirm, modify, or reject AI candidate regions, with full audit trail logging.
- **Quality-Gated Inference**: Pre-analysis screening automatically flags excessive motion blur, poor contrast, or incorrect orientation before neural network execution.

---

## 4. Key Features

### Implemented Features (Currently Active)
- [x] **Client-Side ONNX Neural Inference**: ResNet-18 forward pass executing locally via `onnxruntime-web` in 60–120ms.
- [x] **Dual-Role Medical Access**: Dedicated Doctor Portal and Administrator Portal with credential validation and demo presets.
- [x] **Clinical Review Workstation**: High-resolution X-ray viewer with zoom, pan, brightness/contrast adjustments, candidate region overlays, and side-by-side clinician review tools.
- [x] **Automated Image Quality Screening**: Detection of motion blur, contrast deficiencies, and unreadable formats prior to analysis.
- [x] **Empirical Validation Dashboard**: Interactive toggling between genuine measured test metrics ($N=29$) and published literature benchmarks ($N=3,049$).
- [x] **Case-Level Error Audit**: Complete transparency tables documenting every True Positive, False Positive, True Negative, and False Negative with anatomical root-cause explanations.
- [x] **HIPAA-Aligned Audit Trail**: Real-time event logging capturing sign-in events, analysis executions, and clinician agreement actions.
- [x] **Automated Safety Test Suite**: 10 automated unit and integration tests verifying disconnected model handling, quality holds, and false-positive prevention (`npx tsx src/services/medicalSafetyCheck.ts`).

### Planned Features (Future Roadmap)
- [ ] **Dual-View Multi-Input Fusion**: Concurrently analyzing paired Anteroposterior (AP/PA) and Lateral projections in a unified multi-stream architecture.
- [ ] **Full-Resolution Attention (1024x1024)**: Transitioning from $224 \times 224$ downsampling to high-resolution patch-based transformers (e.g., Swin Transformer) to preserve micro-trabecular detail.
- [ ] **Physis-Aware Pediatric Segmentation**: Auxiliary segmentation heads to explicitly identify open growth plates and suppress false-positive alerts.
- [ ] **DICOM PACS Connectivity**: Integration with PACS servers via DICOM Web (WADO-RS / STOW-RS / QIDO-RS).

---

## 5. Doctor Portal & Admin Portal

The application enforces role-based access control (RBAC):

```
                        ┌─────────────────────────────────────┐
                        │      FractureLens AI Login Gate     │
                        │   Role Selection: Doctor vs Admin   │
                        └──────────────────┬──────────────────┘
                                           │
                  ┌────────────────────────┴────────────────────────┐
                  ▼                                                 ▼
       ┌──────────────────────┐                          ┌──────────────────────┐
       │    DOCTOR PORTAL     │                          │     ADMIN PORTAL     │
       ├──────────────────────┤                          ├──────────────────────┤
       │ • Clinical Dashboard │                          │ • System Health      │
       │ • Priority Queues    │                          │ • User Management    │
       │ • New X-Ray Analysis │                          │ • Model Engine Status│
       │ • Review Workstation │                          │ • Activity Stream    │
       │ • Validation Matrix  │                          │ • Infrastructure     │
       │ • Patient History    │                          │ • Retention Policies │
       └──────────────────────┘                          └──────────────────────┘
```

### Doctor Portal
- **Dashboard**: Case workload metrics, priority review queues (Emergency, Pediatric, Routine), and quick actions.
- **New Analysis**: Upload custom radiograph files (PNG, JPG, DICOM preview) or load verified benchmark cases; executes quality screening and ONNX inference.
- **Analysis Workstation**: Displays raw probability, model logit, cortical candidate zones, and clinician sign-off actions (**Agree**, **Disagree**, **Edit**, **Request Better Image**).
- **Validation & Benchmarks**: Real-time inspection of empirical model metrics, confusion matrix, ROC curves, and test-case audits.
- **Case History**: Comprehensive case archive with multi-parameter filtering.

### Admin Portal
- **System Dashboard**: Monitored uptime, active clinician sessions, inference engine status (`onnxruntime-web WASM`), and memory metrics.
- **User Management**: Add, update, activate, and deactivate doctor and administrator accounts.
- **System Activity Stream**: Live feed of authentication, analysis, and clinical sign-off events.
- **Settings & Retention**: Configure audit logging thresholds, session timeouts, and clinical safety thresholds.

---

## 6. System Architecture & Inference Workflow

```
[Uploaded Radiograph (PNG/JPG)]
               │
               ▼
   [HTML5 Canvas Preprocessor]
   • Resolution: 224 x 224 pixels
   • Channels: 3 (RGB)
   • ImageNet Normalization (μ=[0.485, 0.456, 0.406], σ=[0.229, 0.224, 0.225])
               │
               ▼
     [ONNX Runtime WebAssembly]
   • Model: /models/wrist_model.onnx (42.63 MB)
   • Architecture: ResNet-18 (Opset 14)
   • Execution Provider: WASM (SIMD Single-Threaded)
               │
               ▼
      [Raw Scalar Logit z]
               │
               ▼
     [Sigmoid Transformation]
   • P(fracture) = 1 / (1 + e^(-z))
   • Classification Threshold: τ = 0.50
               │
               ▼
   [Clinical Review Workstation]
   • Candidate ROI localization
   • Dynamic confidence profile & radiological findings
   • Clinician review & agreement recording
```

---

## 7. Technologies & Dependencies

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.8` | Component-based clinical UI |
| **Build Tooling** | Vite | `^8.2.2` | Fast HMR dev server & production bundling |
| **Language** | TypeScript | `~6.0.2` | Static type safety across clinical data schemas |
| **Styling** | Tailwind CSS | `^4.3.3` | Modern, responsive clinical design system |
| **Icons** | Lucide React | `^1.37.0` | Accessible clinical and navigational iconography |
| **Client Inference** | ONNX Runtime Web | `^1.30.0` | WebAssembly in-browser deep learning engine |
| **ML Training** | PyTorch / Torchvision | `^2.0.0` | Deep learning backbone fine-tuning |
| **Model Format** | ONNX | `^1.14.0` | Portable cross-platform model graph representation |
| **Data Processing** | Pandas / Pillow / NumPy | `Latest` | Annotation parsing and radiograph processing |

---

## 8. Project Directory Structure

```
FractureLens-AI/
├── .env.example              # Environment variables template
├── .gitignore                # Production ignore rules (excludes >100MB checkpoints & build files)
├── .oxlintrc.json            # Fast JavaScript/TypeScript linter configuration
├── DATASET.md                # Detailed dataset documentation and mock data schemas
├── package.json              # NPM manifest (React 19, Vite 8, onnxruntime-web)
├── package-lock.json         # NPM dependency lockfile
├── requirements.txt          # Python dependencies for offline ML pipeline
├── tsconfig.json             # TypeScript root project configuration
├── vite.config.ts            # Vite bundler configuration with Tailwind plugin
│
├── data/                     # Dataset manifests and evaluation artifacts
│   ├── dataset_manifest.json # Complete metadata for 160 patient-isolated images
│   ├── evaluation_results.json # Full test-set predictions (N=29) and metrics
│   └── grazpedwri/           # Raw Figshare CSV metadata and annotations
│
├── models/                   # Model metadata and training history
│   └── training_history.json # 10-epoch training metrics and hyperparameters
│
├── public/                   # Static web assets served directly by Vite
│   ├── assets/               # Radiograph assets and test cases
│   │   ├── wrist_fracture.jpg
│   │   ├── wrist_normal.jpg
│   │   └── test_cases/       # Curated GRAZPEDWRI-DX test cases
│   ├── data/                 # Evaluation results and model cards for frontend
│   │   ├── evaluation_results.json
│   │   └── model_card.json
│   └── models/
│       └── wrist_model.onnx  # Exported ResNet-18 model (42.63 MB, WebAssembly-ready)
│
├── scripts/                  # Python machine learning pipeline
│   ├── prepare_dataset.py    # Downloads and extracts authentic GRAZPEDWRI-DX images
│   ├── balance_splits.py     # Creates patient-isolated train/val/test splits
│   ├── train_model.py        # Fine-tunes ResNet-18 on pediatric wrist radiographs
│   ├── export_onnx.py        # Exports PyTorch checkpoint to ONNX format
│   └── evaluate_model.py     # Measures test-set metrics and generates CIs
│
└── src/                      # Application source code
    ├── assets/               # Branding graphics and icons
    ├── components/           # Modular React components
    │   ├── admin/            # Admin Portal: dashboard, user management, activity
    │   ├── analysis/         # New Analysis upload and processing views
    │   ├── analytics/        # Clinical analytics and error analysis
    │   ├── audit/            # Global audit logging
    │   ├── auth/             # Role-based login page
    │   ├── dashboard/        # Doctor Portal clinical dashboard
    │   ├── evaluation/       # Benchmark and validation review pages
    │   ├── history/          # Case archive and search
    │   ├── layout/           # Header, sidebar, and navigation components
    │   ├── report/           # Clinical PDF/print report generation
    │   ├── result/           # Workstation viewer, evidence map, review actions
    │   ├── review/           # Prioritized review queues
    │   └── settings/         # Clinician preference settings
    ├── context/              # Global React state (AuthContext, RBAC sessions)
    ├── data/                 # Application mock data and case fixtures
    ├── services/             # Core application business logic
    │   ├── analysisService.ts        # Case routing, quality checks, fallback logic
    │   ├── onnxInferenceService.ts   # Canvas tensor preprocessing & ONNX execution
    │   └── medicalSafetyCheck.ts     # Automated safety verification test suite
    └── types/                # TypeScript interface and type declarations
```

---

## 9. Prerequisites & Installation

### Prerequisites
- **Node.js**: Version `18.x` or later (Node 20+ recommended).
- **npm**: Version `9.x` or later.
- *(Optional for ML training only)*: **Python**: Version `3.10` or later with `pip`.

### Step 1: Clone the Repository
```bash
git clone https://github.com/Madhesh-2907/FractureLens-AI.git
cd FractureLens-AI
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

---

## 10. Running the Application

### Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:5174/`** (or the port specified in terminal output).

### Production Build
Validate TypeScript types and compile the optimized production bundle:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

### Demo Accounts for Testing
When prompted on the Login Page, you can sign in with:
| Role | Email | Password | Preloaded Access |
| :--- | :--- | :--- | :--- |
| **Doctor** | `doctor.vance@wristai.org` | `DemoDoctor123!` | Complete clinical workstation, queue, and analysis |
| **Admin** | `admin@wristai.org` | `DemoAdmin123!` | User management, activity logs, engine telemetry |

*(Quick demo buttons are also available on the login page for instantaneous 1-click access).*

---

## 11. Testing & Validation

### Automated Medical Safety Test Suite
The repository includes an automated verification harness verifying 10 safety-critical requirements (including handling disconnected models, unreadable files, quality holds, and state isolation):
```bash
npx tsx src/services/medicalSafetyCheck.ts
```
**Verification Output:**
```
✓ PHASE8-TEST-01: Verified fracture-positive radiograph produces Fracture Suspected
✓ PHASE8-TEST-02: Verified fracture-negative radiograph displays No Fracture with zero boxes
✓ PHASE8-TEST-03: Uploading a different image clears previous predictions without bleed
✓ PHASE8-TEST-04: Unsupported file formats rejected before inference
✓ PHASE8-TEST-05: Inference failure displays Analysis Failed without fabricating positives
✓ PHASE8-TEST-06: Disconnected/unready model displays safe state with zero findings
✓ PHASE8-TEST-07: Workstation case-to-prediction mapping verified
✓ PHASE8-TEST-08: Evaluation metrics computed dynamically with zero-denominator safety
✓ PHASE8-TEST-09: Motion blur quality screening holds inference for manual review
✓ PHASE8-TEST-10: Clinician review decisions preserved separately from AI predictions
All passed: true (10/10 tests passed)
```

---

## 12. Machine Learning Pipeline (Python)

The repository includes the complete, reproducible Python pipeline used to prepare data, train ResNet-18, and export the ONNX model.

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Prepare the GRAZPEDWRI-DX Dataset
Extracts authentic radiograph PNGs from Figshare archives and parses Pascal VOC XML annotations:
```bash
python scripts/prepare_dataset.py
```

### 3. Generate Patient-Isolated Splits
Groups radiographs strictly by `patient_id` to guarantee zero patient overlap between train, validation, and test partitions:
```bash
python scripts/balance_splits.py
```

### 4. Train the Neural Network
Fine-tunes ResNet-18 on CPU/GPU with weighted BCE loss and data augmentation:
```bash
python scripts/train_model.py
```

### 5. Export to ONNX
Converts the best PyTorch checkpoint (`models/wrist_model.pt`) into the WebAssembly-ready ONNX model (`public/models/wrist_model.onnx`):
```bash
python scripts/export_onnx.py
```

### 6. Evaluate Held-Out Test Set
Computes the empirical confusion matrix and 95% confidence intervals:
```bash
python scripts/evaluate_model.py
```

---

## 13. Empirical Test-Set Performance ($N=29$)

Evaluated on the independent test split ($N=29$: 17 fractures, 12 normals) using standard classification threshold $\tau = 0.50$:

### Confusion Matrix
| | Ground Truth: Fracture ($N=17$) | Ground Truth: Normal ($N=12$) | Total |
| :--- | :---: | :---: | :---: |
| **Predicted Fracture** | **12** (True Positive) | **9** (False Positive) | 21 |
| **Predicted Normal** | **5** (False Negative) | **3** (True Negative) | 8 |
| **Total** | 17 | 12 | 29 |

### Empirical Metrics with Wilson 95% Confidence Intervals
| Metric | Empirical Score | 95% Confidence Interval |
| :--- | :---: | :---: |
| **Accuracy** | **51.72%** | **[34.4%, 68.6%]** |
| **Sensitivity (Recall)** | **70.59%** | **[46.9%, 86.7%]** |
| **Specificity** | **25.00%** | **[8.9%, 53.2%]** |
| **Precision (PPV)** | **57.14%** | **[36.5%, 75.5%]** |
| **Negative Predictive Value (NPV)** | **37.50%** | **[13.7%, 69.4%]** |
| **F1-Score** | **63.16%** | — |

> **Medical AI Transparency Notice**: Rather than presenting fabricated high confidence scores, FractureLens AI reports the actual measured metrics of the prototype model. In pediatric wrist trauma, open growth plates (physes) naturally create high false-positive rates at baseline thresholds without growth-plate-aware segmentation.

---

## 14. Dataset Source, Licensing & Privacy

- **Dataset**: GRAZPEDWRI-DX: A Pediatric Wrist Trauma Dataset ([DOI: 10.6084/m9.figshare.14825193](https://doi.org/10.6084/m9.figshare.14825193)).
- **Originating Institution**: Division of Pediatric Radiology, Department of Radiology, Medical University of Graz, Austria.
- **Licence**: Creative Commons Attribution 4.0 International ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).
- **Ethical Approval & De-Identification**: The dataset was approved by the institutional ethics committee (EK-Nr: 32-476 ex 19/20) and fully de-identified in compliance with HIPAA Safe Harbor and GDPR standards.

---

## 15. Medical Disclaimer

> ### ⚠️ CLINICAL SAFETY & REGULATORY DISCLAIMER
> **FractureLens AI is strictly a research and educational prototype.**  
> - It is **NOT** a certified medical device and has **NOT** received clearance from the US Food and Drug Administration (FDA 510(k)), the European Medicines Agency (CE Mark under EU MDR), or any other regulatory authority.  
> - It is **NOT** intended for autonomous diagnostic use, triage decision-making, or primary clinical interpretation.  
> - All outputs are advisory and must be verified by a qualified, licensed radiologist or physician before any clinical intervention.

---

## 16. Contributing

Contributions to FractureLens AI are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/clinical-enhancement`).
3. Commit your changes (`git commit -m 'Add multi-view projection support'`).
4. Push to the branch (`git push origin feature/clinical-enhancement`).
5. Open a Pull Request with detailed clinical rationale and test results.

---

## 17. License

- **Source Code**: Released under the [MIT License](LICENSE).
- **Dataset & Annotations**: Licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
