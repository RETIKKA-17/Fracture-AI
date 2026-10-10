/**
 * WristAI Medical Dataset Integration & Preprocessing Pipeline
 * Standardized data loading, patient-level split partitioning, and image preprocessing specifications
 * for GRAZPEDWRI-DX and MURA datasets.
 */

export interface BoundingBoxAnnotation {
  x: number; // Left coordinate
  y: number; // Top coordinate
  width: number;
  height: number;
  label: 'fracture' | 'bone_lesion' | 'periosteal_reaction' | 'pronator_fat_pad';
  confidence?: number;
}

export interface DatasetRecord {
  id: string;
  patientId: string;
  studyId: string;
  imagePath: string;
  projectionView: 'AP' | 'PA' | 'Lateral' | 'Oblique';
  hasFracture: boolean;
  fractureCategory?: 'Distal Radius' | 'Ulnar Styloid' | 'Scaphoid' | 'Colles' | 'Buckle';
  annotations: BoundingBoxAnnotation[];
  datasetSource: 'GRAZPEDWRI-DX' | 'MURA' | 'Kaggle_Bone_Fracture';
  split: 'train' | 'val' | 'test';
}

export interface PreprocessingConfig {
  targetResolution: [number, number]; // e.g. [512, 512]
  enableCLAHE: boolean; // Contrast Limited Adaptive Histogram Equalization
  normalizationMean: number[];
  normalizationStd: number[];
}

export const DEFAULT_PREPROCESSING_CONFIG: PreprocessingConfig = {
  targetResolution: [512, 512],
  enableCLAHE: true,
  normalizationMean: [0.485, 0.456, 0.406],
  normalizationStd: [0.229, 0.224, 0.225],
};

/**
 * Partition dataset records into Train (70%), Validation (15%), and Test (15%) splits
 * ENFORCES PATIENT-LEVEL SPLITTING to prevent data leakage between splits.
 */
export const partitionDatasetByPatient = (records: DatasetRecord[]): {
  train: DatasetRecord[];
  val: DatasetRecord[];
  test: DatasetRecord[];
} => {
  const patientGroups: Record<string, DatasetRecord[]> = {};

  records.forEach((record) => {
    if (!patientGroups[record.patientId]) {
      patientGroups[record.patientId] = [];
    }
    patientGroups[record.patientId].push(record);
  });

  const patientIds = Object.keys(patientGroups);
  const totalPatients = patientIds.length;

  const trainEnd = Math.floor(totalPatients * 0.7);
  const valEnd = Math.floor(totalPatients * 0.85);

  const trainPatients = new Set(patientIds.slice(0, trainEnd));
  const valPatients = new Set(patientIds.slice(trainEnd, valEnd));

  const train: DatasetRecord[] = [];
  const val: DatasetRecord[] = [];
  const test: DatasetRecord[] = [];

  records.forEach((record) => {
    if (trainPatients.has(record.patientId)) {
      train.push({ ...record, split: 'train' });
    } else if (valPatients.has(record.patientId)) {
      val.push({ ...record, split: 'val' });
    } else {
      test.push({ ...record, split: 'test' });
    }
  });

  return { train, val, test };
};

/**
 * Preprocesses a raw image matrix according to model input requirements.
 * (Spec for future WebGPU / ONNX Runtime WASM integration)
 */
export const preprocessRadiographMatrix = (
  imageWidth: number,
  imageHeight: number,
  config: PreprocessingConfig = DEFAULT_PREPROCESSING_CONFIG
) => {
  return {
    scaledWidth: config.targetResolution[0],
    scaledHeight: config.targetResolution[1],
    scaleX: config.targetResolution[0] / imageWidth,
    scaleY: config.targetResolution[1] / imageHeight,
    claheEnabled: config.enableCLAHE,
  };
};
