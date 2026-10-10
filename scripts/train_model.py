"""
WristAI - Authentic ResNet-18 Fracture Detection Training Pipeline
Trains a genuine PyTorch model on patient-split GRAZPEDWRI-DX wrist radiographs,
validates with rigorous medical metrics, and exports to ONNX for client-side / local inference.
"""

import os
import json
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from torchvision.models import resnet18, ResNet18_Weights
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def train_wrist_model(
    data_dir="data/dataset",
    output_dir="models",
    onnx_output_dir="public/models",
    epochs=10,
    batch_size=16,
    lr=1e-4,
    device=None
):
    print("=== Step 3: Training Authentic WristAI Fracture Classifier ===")
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(onnx_output_dir, exist_ok=True)
    
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Compute Device: {device}")
    
    # Standard medical image transformations matching ImageNet backbone
    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "val")
    
    train_dataset = datasets.ImageFolder(train_dir, transform=train_transforms)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transforms)
    
    print(f"Class to index mapping: {train_dataset.class_to_idx}")
    # Verify: '0_normal': 0, '1_fracture': 1
    assert train_dataset.class_to_idx.get("0_normal") == 0, "Normal class must be 0"
    assert train_dataset.class_to_idx.get("1_fracture") == 1, "Fracture class must be 1"
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    
    print(f"Training samples: {len(train_dataset)} in {len(train_loader)} batches")
    print(f"Validation samples: {len(val_dataset)} in {len(val_loader)} batches")
    
    # 2. Build Model Architecture
    print("Loading pretrained ResNet-18 backbone...")
    model = resnet18(weights=ResNet18_Weights.DEFAULT)
    
    # Freeze lower feature extractor initially or fine-tune with low lr
    in_features = model.fc.in_features  # 512
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 1)  # Single logit output
    )
    model = model.to(device)
    
    # Pos-weight for binary cross-entropy if slight imbalance exists
    train_labels = [label for _, label in train_dataset.samples]
    num_neg = sum(1 for l in train_labels if l == 0)
    num_pos = sum(1 for l in train_labels if l == 1)
    pos_weight_val = num_neg / max(1, num_pos)
    pos_weight = torch.tensor([pos_weight_val], dtype=torch.float32).to(device)
    print(f"Class distribution: Normal={num_neg}, Fracture={num_pos}. pos_weight={pos_weight_val:.3f}")
    
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)
    
    best_val_f1 = -1.0
    best_epoch = -1
    best_weights_path = os.path.join(output_dir, "wrist_model.pt")
    
    history = []
    start_time = time.time()
    
    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        # Train phase
        model.train()
        train_loss = 0.0
        train_preds, train_targets = [], []
        
        for images, targets in train_loader:
            images = images.to(device)
            targets = targets.float().unsqueeze(1).to(device)
            
            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * images.size(0)
            probs = torch.sigmoid(logits).detach().cpu().numpy()
            train_preds.extend((probs >= 0.5).astype(int).flatten())
            train_targets.extend(targets.cpu().numpy().flatten())
            
        train_loss /= len(train_dataset)
        train_acc = accuracy_score(train_targets, train_preds)
        train_f1 = f1_score(train_targets, train_preds, zero_division=0)
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        val_preds, val_targets, val_probs = [], [], []
        
        with torch.no_grad():
            for images, targets in val_loader:
                images = images.to(device)
                targets = targets.float().unsqueeze(1).to(device)
                
                logits = model(images)
                loss = criterion(logits, targets)
                val_loss += loss.item() * images.size(0)
                
                probs = torch.sigmoid(logits).cpu().numpy().flatten()
                val_probs.extend(probs)
                val_preds.extend((probs >= 0.5).astype(int))
                val_targets.extend(targets.cpu().numpy().flatten().astype(int))
                
        val_loss /= len(val_dataset)
        val_acc = accuracy_score(val_targets, val_preds)
        val_sens = recall_score(val_targets, val_preds, zero_division=0) # Sensitivity
        tn, fp, fn, tp = confusion_matrix(val_targets, val_preds, labels=[0, 1]).ravel()
        val_spec = tn / (tn + fp) if (tn + fp) > 0 else 0.0
        val_prec = precision_score(val_targets, val_preds, zero_division=0)
        val_f1 = f1_score(val_targets, val_preds, zero_division=0)
        
        scheduler.step(val_loss)
        epoch_time = time.time() - epoch_start
        
        print(
            f"Epoch {epoch:02d}/{epochs:02d} [{epoch_time:.1f}s] - "
            f"Train Loss: {train_loss:.4f}, Acc: {train_acc*100:.1f}%, F1: {train_f1*100:.1f}% | "
            f"Val Loss: {val_loss:.4f}, Acc: {val_acc*100:.1f}%, Sens: {val_sens*100:.1f}%, Spec: {val_spec*100:.1f}%, F1: {val_f1*100:.1f}%"
        )
        
        epoch_record = {
            "epoch": epoch,
            "train_loss": float(train_loss),
            "train_acc": float(train_acc),
            "train_f1": float(train_f1),
            "val_loss": float(val_loss),
            "val_acc": float(val_acc),
            "val_sensitivity": float(val_sens),
            "val_specificity": float(val_spec),
            "val_precision": float(val_prec),
            "val_f1": float(val_f1),
            "confusion_matrix": {"tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn)}
        }
        history.append(epoch_record)
        
        # Save best checkpoint
        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            best_epoch = epoch
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc": val_acc,
                "val_f1": val_f1,
                "val_sensitivity": val_sens,
                "val_specificity": val_spec,
                "class_mapping": {0: "No Fracture Detected", 1: "Fracture Suspected"}
            }, best_weights_path)
            print(f"  --> Saved new best checkpoint to {best_weights_path} (Val F1: {val_f1*100:.1f}%)")
            
    total_time = time.time() - start_time
    print(f"\nTraining completed in {total_time:.1f}s. Best Epoch: {best_epoch} with Val F1: {best_val_f1*100:.1f}%")
    
    # 3. Load Best Weights for ONNX Export
    checkpoint = torch.load(best_weights_path, map_location=device, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    
    # 4. Export to ONNX
    onnx_file_path = os.path.join(onnx_output_dir, "wrist_model.onnx")
    dummy_input = torch.randn(1, 3, 224, 224, device=device)
    
    print(f"\nExporting trained model to ONNX: {onnx_file_path}...")
    torch.onnx.export(
        model,
        dummy_input,
        onnx_file_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["image_tensor"],
        output_names=["fracture_logit"],
        dynamic_axes={
            "image_tensor": {0: "batch_size"},
            "fracture_logit": {0: "batch_size"}
        }
    )
    print(f"[OK] ONNX model successfully exported: {onnx_file_path} (Size: {os.path.getsize(onnx_file_path)/(1024*1024):.1f} MB)")
    
    # 5. Verify ONNX model with onnxruntime
    try:
        import onnxruntime as ort
        ort_session = ort.InferenceSession(onnx_file_path)
        ort_inputs = {ort_session.get_inputs()[0].name: dummy_input.cpu().numpy()}
        ort_outs = ort_session.run(None, ort_inputs)
        print(f"[OK] ONNX Runtime Verification: Output shape = {ort_outs[0].shape}, Sample logit = {ort_outs[0][0][0]:.4f}")
    except Exception as e:
        print(f"Note: ONNX verification warning: {e}")
        
    # 6. Save Training History & Configuration
    history_path = os.path.join(output_dir, "training_history.json")
    with open(history_path, "w") as hf:
        json.dump({
            "model_architecture": "ResNet-18 (ImageNet Pretrained)",
            "task": "Binary Fracture Detection",
            "class_mapping": {
                "0": "No Fracture Detected",
                "1": "Fracture Suspected"
            },
            "training_config": {
                "epochs": epochs,
                "batch_size": batch_size,
                "learning_rate": lr,
                "optimizer": "AdamW",
                "loss_function": "BCEWithLogitsLoss",
                "input_resolution": [224, 224],
                "normalization_mean": [0.485, 0.456, 0.406],
                "normalization_std": [0.229, 0.224, 0.225]
            },
            "best_epoch": best_epoch,
            "best_val_f1": float(best_val_f1),
            "training_time_seconds": float(total_time),
            "epochs_log": history
        }, hf, indent=2)
    print(f"[OK] Training history saved to: {history_path}")
    print("=== Step 3 Model Training and Export Complete! ===")

if __name__ == "__main__":
    train_wrist_model(epochs=10, batch_size=16, lr=1e-4)
