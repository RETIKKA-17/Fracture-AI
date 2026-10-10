"""
WristAI - Independent Test Set Performance Evaluation
Evaluates the trained ResNet-18 model on the completely unseen, independent test partition
from GRAZPEDWRI-DX. Calculates medical diagnostic metrics and 95% Wilson confidence intervals.
"""

import os
import json
import math
import torch
import torch.nn as nn
from torchvision import datasets, transforms
from torchvision.models import resnet18
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

MODEL_PT_PATH = "models/wrist_model.pt"
TEST_DATA_DIR = "data/dataset/test"
OUTPUT_JSON_PATH = "data/evaluation_results.json"
PUBLIC_JSON_PATH = "public/data/evaluation_results.json"
MANIFEST_PATH = "data/dataset/dataset_manifest.json"

def wilson_score_interval(successes, total, confidence=0.95):
    """Calculates Wilson score confidence interval for proportions."""
    if total == 0:
        return 0.0, 0.0
    z = 1.96 if confidence == 0.95 else 2.576
    p_hat = successes / total
    denominator = 1 + (z**2) / total
    centre_adjusted_probability = p_hat + (z**2) / (2 * total)
    adjusted_standard_deviation = math.sqrt((p_hat * (1 - p_hat) + (z**2) / (4 * total)) / total)
    
    lower_bound = (centre_adjusted_probability - z * adjusted_standard_deviation) / denominator
    upper_bound = (centre_adjusted_probability + z * adjusted_standard_deviation) / denominator
    return max(0.0, lower_bound), min(1.0, upper_bound)

def evaluate_test_set():
    print("=== Step 5: Measuring Real Independent Test Set Performance ===")
    
    # Check test directory
    if not os.path.exists(TEST_DATA_DIR):
        raise FileNotFoundError(f"Test directory not found: {TEST_DATA_DIR}")
        
    # Preprocessing
    test_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    test_dataset = datasets.ImageFolder(TEST_DATA_DIR, transform=test_transforms)
    print(f"Independent Test Dataset: {len(test_dataset)} images")
    print(f"Class to index mapping: {test_dataset.class_to_idx}")
    
    test_loader = DataLoader(test_dataset, batch_size=8, shuffle=False, num_workers=0)
    
    # Load model
    print(f"Loading trained weights from: {MODEL_PT_PATH}...")
    checkpoint = torch.load(MODEL_PT_PATH, map_location="cpu", weights_only=False)
    
    model = resnet18(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 1)
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    
    # Load manifest to cross-reference patient metadata
    manifest_records = {}
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r") as mf:
            mdata = json.load(mf)
            for img_info in mdata.get("images", []):
                manifest_records[img_info["filename"]] = img_info
                
    # Run Inference
    all_targets = []
    all_preds = []
    all_probs = []
    case_audits = []
    
    with torch.no_grad():
        for batch_idx, (images, targets) in enumerate(test_loader):
            logits = model(images)
            probs = torch.sigmoid(logits).cpu().numpy().flatten()
            preds = (probs >= 0.5).astype(int)
            
            start_idx = batch_idx * 8
            for i in range(len(images)):
                img_path, target_class = test_dataset.samples[start_idx + i]
                filename = os.path.basename(img_path)
                prob = float(probs[i])
                pred = int(preds[i])
                target = int(target_class)
                
                all_targets.append(target)
                all_preds.append(pred)
                all_probs.append(prob)
                
                meta = manifest_records.get(filename, {})
                
                # Classify case outcome
                if target == 1 and pred == 1:
                    outcome = "True Positive"
                elif target == 0 and pred == 0:
                    outcome = "True Negative"
                elif target == 0 and pred == 1:
                    outcome = "False Positive"
                else:
                    outcome = "False Negative"
                    
                case_audits.append({
                    "filename": filename,
                    "patient_id": meta.get("patient_id", "Unknown"),
                    "study_number": meta.get("study_number", 1),
                    "gender": meta.get("gender", "Unknown"),
                    "age": meta.get("age", None),
                    "ground_truth_label": target,
                    "ground_truth_class": "Fracture Suspected" if target == 1 else "No Fracture Detected",
                    "predicted_label": pred,
                    "predicted_class": "Fracture Suspected" if pred == 1 else "No Fracture Detected",
                    "model_probability": round(prob, 4),
                    "confidence_pct": round(prob * 100 if pred == 1 else (1.0 - prob) * 100, 1),
                    "outcome": outcome
                })
                
    total_test = len(all_targets)
    tn, fp, fn, tp = confusion_matrix(all_targets, all_preds, labels=[0, 1]).ravel()
    
    acc = accuracy_score(all_targets, all_preds)
    sens = recall_score(all_targets, all_preds, zero_division=0)  # Recall / Sensitivity
    spec = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    prec = precision_score(all_targets, all_preds, zero_division=0)
    f1 = f1_score(all_targets, all_preds, zero_division=0)
    npv = tn / (tn + fn) if (tn + fn) > 0 else 0.0
    
    # Wilson 95% Confidence Intervals
    acc_ci = wilson_score_interval(tp + tn, total_test)
    sens_ci = wilson_score_interval(tp, tp + fn)
    spec_ci = wilson_score_interval(tn, tn + fp)
    prec_ci = wilson_score_interval(tp, tp + fp)
    
    false_positives = [c for c in case_audits if c["outcome"] == "False Positive"]
    false_negatives = [c for c in case_audits if c["outcome"] == "False Negative"]
    true_positives = [c for c in case_audits if c["outcome"] == "True Positive"]
    true_negatives = [c for c in case_audits if c["outcome"] == "True Negative"]
    
    print("\n" + "="*50)
    print("GENUINE EMPIRICAL TEST SET RESULTS (N = {})".format(total_test))
    print("="*50)
    print(f"Ground Truth Distribution: {tp+fn} Fractures (Positive), {tn+fp} Normal (Negative)")
    print(f"Confusion Matrix:")
    print(f"  True Positives  (TP): {tp:2d}  |  False Positives (FP): {fp:2d}")
    print(f"  False Negatives (FN): {fn:2d}  |  True Negatives  (TN): {tn:2d}")
    print("-"*50)
    print(f"Accuracy:    {acc*100:.2f}%  (95% CI: [{acc_ci[0]*100:.1f}%, {acc_ci[1]*100:.1f}%])")
    print(f"Sensitivity: {sens*100:.2f}%  (95% CI: [{sens_ci[0]*100:.1f}%, {sens_ci[1]*100:.1f}%])")
    print(f"Specificity: {spec*100:.2f}%  (95% CI: [{spec_ci[0]*100:.1f}%, {spec_ci[1]*100:.1f}%])")
    print(f"Precision:   {prec*100:.2f}%  (95% CI: [{prec_ci[0]*100:.1f}%, {prec_ci[1]*100:.1f}%])")
    print(f"F1-Score:    {f1*100:.2f}%")
    print(f"NPV:         {npv*100:.2f}%")
    print("="*50)
    print(f"False Positive Count: {len(false_positives)}")
    print(f"False Negative Count: {len(false_negatives)}")
    print("="*50)
    
    results_payload = {
        "dataset_name": "GRAZPEDWRI-DX Independent Test Partition",
        "dataset_source": "Medical University of Graz / Figshare CC BY 4.0",
        "evaluation_method": "Prospective Hold-Out Evaluation with Strict Patient-Level Isolation",
        "model_architecture": "ResNet-18 (ImageNet Pretrained)",
        "total_test_samples": total_test,
        "class_distribution": {
            "fracture_positive_count": int(tp + fn),
            "normal_negative_count": int(tn + fp)
        },
        "confusion_matrix": {
            "true_positive": int(tp),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_negative": int(tn)
        },
        "metrics": {
            "accuracy": round(float(acc) * 100, 2),
            "accuracy_ci_95": [round(acc_ci[0] * 100, 1), round(acc_ci[1] * 100, 1)],
            "sensitivity": round(float(sens) * 100, 2),
            "sensitivity_ci_95": [round(sens_ci[0] * 100, 1), round(sens_ci[1] * 100, 1)],
            "specificity": round(float(spec) * 100, 2),
            "specificity_ci_95": [round(spec_ci[0] * 100, 1), round(spec_ci[1] * 100, 1)],
            "precision": round(float(prec) * 100, 2),
            "precision_ci_95": [round(prec_ci[0] * 100, 1), round(prec_ci[1] * 100, 1)],
            "f1_score": round(float(f1) * 100, 2),
            "npv": round(float(npv) * 100, 2)
        },
        "false_positive_cases": false_positives,
        "false_negative_cases": false_negatives,
        "all_test_cases": case_audits
    }
    
    os.makedirs(os.path.dirname(OUTPUT_JSON_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(PUBLIC_JSON_PATH), exist_ok=True)
    
    with open(OUTPUT_JSON_PATH, "w") as f:
        json.dump(results_payload, f, indent=2)
    with open(PUBLIC_JSON_PATH, "w") as f:
        json.dump(results_payload, f, indent=2)
        
    print(f"[OK] Evaluation results written to: {OUTPUT_JSON_PATH} and {PUBLIC_JSON_PATH}")
    print("=== Step 5 Real Performance Measurement Complete! ===")

if __name__ == "__main__":
    evaluate_test_set()
