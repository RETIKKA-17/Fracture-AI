/**
 * WristAI - Genuine ONNX Runtime Web Inference Service
 * Executes authentic ResNet-18 fracture detection directly on uploaded wrist radiographs.
 * Preprocesses image pixels (Resize 224x224, RGB extraction, ImageNet normalization)
 * and runs forward inference using WebAssembly / WebGL.
 */

import * as ort from 'onnxruntime-web';

export interface ModelPrediction {
  isModelReady: boolean;
  prediction: 'Fracture Suspected' | 'No Fracture Detected' | 'AI Model Not Ready';
  probability: number; // Raw model sigmoid output P(fracture|x) in [0.0, 1.0]
  confidencePct: number; // Confidence percentage (e.g. 72.4%)
  rawLogit: number;
  inferenceTimeMs: number;
  statusMessage: string;
}

let session: ort.InferenceSession | null = null;
let isLoadingSession = false;

// Configured ImageNet normalization constants
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

/**
 * Initializes the ONNX Runtime session with the trained model
 */
export async function getInferenceSession(): Promise<ort.InferenceSession | null> {
  if (session) return session;
  if (isLoadingSession) {
    // Wait for ongoing initialization
    while (isLoadingSession) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return session;
  }

  isLoadingSession = true;
  try {
    // Configure WASM paths if needed
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;

    // Load exported ResNet-18 model from public directory
    const modelUrl = '/models/wrist_model.onnx';
    console.info(`[WristAI ML] Initializing ONNX Runtime Web session from: ${modelUrl}`);

    session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all'
    });
    console.info('[WristAI ML] ONNX model successfully initialized and ready for inference.');
    return session;
  } catch (error) {
    console.warn('[WristAI ML] Failed to load ONNX model:', error);
    session = null;
    return null;
  } finally {
    isLoadingSession = false;
  }
}

/**
 * Preprocesses an image from URL / DataURL into a [1, 3, 224, 224] Float32Array tensor
 */
export async function preprocessImageToTensor(imageUrl: string): Promise<ort.Tensor> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = 224;
        const height = 224;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas 2D context creation failed');
        }

        // Draw and scale to 224x224
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData; // RGBA values

        // Allocate Float32Array for [1, 3, 224, 224] in NCHW format
        const floatData = new Float32Array(3 * width * height);
        const redOffset = 0;
        const greenOffset = width * height;
        const blueOffset = 2 * width * height;

        for (let i = 0; i < width * height; i++) {
          const r = data[i * 4] / 255.0;
          const g = data[i * 4 + 1] / 255.0;
          const b = data[i * 4 + 2] / 255.0;

          // Standard ImageNet normalization: (x - mean) / std
          floatData[redOffset + i] = (r - MEAN[0]) / STD[0];
          floatData[greenOffset + i] = (g - MEAN[1]) / STD[1];
          floatData[blueOffset + i] = (b - MEAN[2]) / STD[2];
        }

        const tensor = new ort.Tensor('float32', floatData, [1, 3, width, height]);
        resolve(tensor);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => reject(new Error(`Failed to load image for tensor processing: ${e}`));
    img.src = imageUrl;
  });
}

/**
 * Runs genuine forward inference using the trained ResNet-18 model
 */
export async function runGenuineInference(imageUrl: string): Promise<ModelPrediction> {
  const startTime = performance.now();
  const session = await getInferenceSession();

  if (!session) {
    return {
      isModelReady: false,
      prediction: 'AI Model Not Ready',
      probability: 0.0,
      confidencePct: 0.0,
      rawLogit: 0.0,
      inferenceTimeMs: 0,
      statusMessage: 'AI Model Not Ready — Model weights could not be loaded into the inference engine.'
    };
  }

  try {
    const inputTensor = await preprocessImageToTensor(imageUrl);
    const inputName = session.inputNames[0] || 'image_tensor';
    const outputName = session.outputNames[0] || 'fracture_logit';

    const feeds: Record<string, ort.Tensor> = {};
    feeds[inputName] = inputTensor;

    const results = await session.run(feeds);
    const outputTensor = results[outputName];

    if (!outputTensor || !outputTensor.data) {
      throw new Error('Missing output tensor from model inference');
    }

    const rawLogit = Number(outputTensor.data[0]);
    // Sigmoid function: P = 1 / (1 + e^(-z))
    const probability = 1.0 / (1.0 + Math.exp(-rawLogit));
    const inferenceTimeMs = Math.round(performance.now() - startTime);

    // Decision rule: Operating threshold 0.50
    const isFracture = probability >= 0.50;
    const confidencePct = Math.round((isFracture ? probability : 1.0 - probability) * 1000) / 10;

    return {
      isModelReady: true,
      prediction: isFracture ? 'Fracture Suspected' : 'No Fracture Detected',
      probability,
      confidencePct,
      rawLogit,
      inferenceTimeMs,
      statusMessage: `Genuine ResNet-18 forward pass completed in ${inferenceTimeMs}ms`
    };
  } catch (err) {
    console.error('[WristAI ML] Inference execution error:', err);
    return {
      isModelReady: false,
      prediction: 'AI Model Not Ready',
      probability: 0.0,
      confidencePct: 0.0,
      rawLogit: 0.0,
      inferenceTimeMs: Math.round(performance.now() - startTime),
      statusMessage: `Inference failed: ${err instanceof Error ? err.message : String(err)}`
    };
  }
}
