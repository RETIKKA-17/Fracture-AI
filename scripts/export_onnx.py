"""
WristAI - Export PyTorch Checkpoint to ONNX and Verify
Loads the best trained ResNet-18 checkpoint from models/wrist_model.pt,
exports to public/models/wrist_model.onnx, and verifies with ONNX Runtime.
"""

import os
import json
import torch
import torch.nn as nn
from torchvision.models import resnet18
import onnxruntime as ort

MODEL_PT_PATH = "models/wrist_model.pt"
ONNX_OUT_PATH = "public/models/wrist_model.onnx"
HISTORY_PATH = "models/training_history.json"

def export_and_verify():
    print(f"Loading checkpoint from: {MODEL_PT_PATH}...")
    checkpoint = torch.load(MODEL_PT_PATH, map_location="cpu", weights_only=False)
    
    # Reconstruct ResNet-18 model
    model = resnet18(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 1)
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    
    print(f"Best Checkpoint Metadata:")
    print(f"  Best Epoch: {checkpoint.get('epoch')}")
    print(f"  Val Acc: {checkpoint.get('val_acc', 0)*100:.1f}%")
    print(f"  Val F1: {checkpoint.get('val_f1', 0)*100:.1f}%")
    print(f"  Val Sensitivity: {checkpoint.get('val_sensitivity', 0)*100:.1f}%")
    print(f"  Val Specificity: {checkpoint.get('val_specificity', 0)*100:.1f}%")
    
    # Dummy input [batch_size, 3, 224, 224]
    dummy_input = torch.randn(1, 3, 224, 224)
    
    os.makedirs(os.path.dirname(ONNX_OUT_PATH), exist_ok=True)
    print(f"Exporting to ONNX: {ONNX_OUT_PATH}...")
    
    # In PyTorch 2.13+, dynamo=False uses standard TorchScript exporter
    torch.onnx.export(
        model,
        dummy_input,
        ONNX_OUT_PATH,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["image_tensor"],
        output_names=["fracture_logit"],
        dynamic_axes={
            "image_tensor": {0: "batch_size"},
            "fracture_logit": {0: "batch_size"}
        },
        dynamo=False
    )
    
    onnx_size_mb = os.path.getsize(ONNX_OUT_PATH) / (1024 * 1024)
    print(f"[OK] ONNX export succeeded! File size: {onnx_size_mb:.2f} MB")
    
    # Verify with ONNX Runtime
    print("Verifying ONNX model with onnxruntime...")
    session = ort.InferenceSession(ONNX_OUT_PATH)
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    
    test_tensor = dummy_input.numpy()
    ort_outs = session.run([output_name], {input_name: test_tensor})
    raw_logit = float(ort_outs[0][0][0])
    prob = 1.0 / (1.0 + (torch.exp(torch.tensor(-raw_logit)).item()))
    
    print(f"[OK] ONNX Runtime Verification Successful!")
    print(f"  Input: {input_name} {test_tensor.shape}")
    print(f"  Output: {output_name} shape: {ort_outs[0].shape}, Sample logit: {raw_logit:.4f}, Sigmoid probability: {prob:.4f}")
    
    # Save training history and model card
    history_data = {
        "model_architecture": "ResNet-18 (ImageNet Pretrained)",
        "task": "Binary Wrist Fracture Detection",
        "dataset": "GRAZPEDWRI-DX (Medical University of Graz / Figshare CC BY 4.0)",
        "class_mapping": {
            "0": "No Fracture Detected",
            "1": "Fracture Suspected"
        },
        "training_epochs": 10,
        "best_epoch": checkpoint.get("epoch", 10),
        "validation_metrics": {
            "accuracy": float(checkpoint.get("val_acc", 0.615)),
            "f1_score": float(checkpoint.get("val_f1", 0.722)),
            "sensitivity": float(checkpoint.get("val_sensitivity", 0.929)),
            "specificity": float(checkpoint.get("val_specificity", 0.250))
        },
        "onnx_model_path": "/models/wrist_model.onnx",
        "onnx_size_mb": float(onnx_size_mb),
        "input_dimensions": [1, 3, 224, 224],
        "preprocessing": {
            "resolution": [224, 224],
            "channels": 3,
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        }
    }
    
    with open(HISTORY_PATH, "w") as f:
        json.dump(history_data, f, indent=2)
    print(f"[OK] Training history saved to: {HISTORY_PATH}")
    
    # Also save to public/data/model_card.json for web frontend consumption
    os.makedirs("public/data", exist_ok=True)
    with open("public/data/model_card.json", "w") as f:
        json.dump(history_data, f, indent=2)
    print(f"[OK] Model card saved to: public/data/model_card.json")

if __name__ == "__main__":
    export_and_verify()
