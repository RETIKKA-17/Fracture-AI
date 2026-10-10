"""
WristAI - Balanced Patient-Level Split Partitioner
Partitions the 160 authentic GRAZPEDWRI-DX radiographs into balanced Train, Val, and Test sets
while maintaining 100% STRICT PATIENT ISOLATION (zero patient leakage).
"""

import os
import shutil
import json
import random
import pandas as pd

DATA_DIR = "data/dataset"
MANIFEST_PATH = os.path.join(DATA_DIR, "dataset_manifest.json")

def balance_splits(seed=42):
    with open(MANIFEST_PATH, "r") as f:
        manifest_data = json.load(f)
        
    df = pd.DataFrame(manifest_data["images"])
    print(f"Total images loaded: {len(df)}")
    
    # Group by patient and get patient label and total images
    patient_info = []
    for pid, group in df.groupby("patient_id"):
        label = group["label"].iloc[0]
        patient_info.append({
            "patient_id": pid,
            "label": label,
            "count": len(group),
            "filenames": group["filename"].tolist(),
            "records": group.to_dict("records")
        })
        
    frac_patients = [p for p in patient_info if p["label"] == 1]
    norm_patients = [p for p in patient_info if p["label"] == 0]
    
    rng = random.Random(seed)
    rng.shuffle(frac_patients)
    rng.shuffle(norm_patients)
    
    # Fracture split target: ~56 train, ~12 val, ~12 test
    def partition_patients(patients, target_val=12, target_test=12):
        val_patients = []
        test_patients = []
        train_patients = []
        
        val_count = 0
        test_count = 0
        
        for p in patients:
            if val_count < target_val:
                val_patients.append(p)
                val_count += p["count"]
            elif test_count < target_test:
                test_patients.append(p)
                test_count += p["count"]
            else:
                train_patients.append(p)
                
        return train_patients, val_patients, test_patients
        
    train_f, val_f, test_f = partition_patients(frac_patients, target_val=12, target_test=12)
    train_n, val_n, test_n = partition_patients(norm_patients, target_val=12, target_test=12)
    
    split_map = {}
    for p in train_f + train_n:
        for r in p["records"]:
            split_map[r["filename"]] = "train"
    for p in val_f + val_n:
        for r in p["records"]:
            split_map[r["filename"]] = "val"
    for p in test_f + test_n:
        for r in p["records"]:
            split_map[r["filename"]] = "test"
            
    # Verify patient isolation
    train_pids = set(p["patient_id"] for p in train_f + train_n)
    val_pids = set(p["patient_id"] for p in val_f + val_n)
    test_pids = set(p["patient_id"] for p in test_f + test_n)
    
    assert len(train_pids.intersection(val_pids)) == 0, "Leakage train-val!"
    assert len(train_pids.intersection(test_pids)) == 0, "Leakage train-test!"
    assert len(val_pids.intersection(test_pids)) == 0, "Leakage val-test!"
    
    print("[PASS] 100% Strict Patient Isolation Verified.")
    
    # Move files to clean split directories
    temp_dir = os.path.join(DATA_DIR, "temp_images")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Collect all image files into temp_dir first
    for split in ["train", "val", "test"]:
        for cat in ["0_normal", "1_fracture"]:
            dir_path = os.path.join(DATA_DIR, split, cat)
            if os.path.exists(dir_path):
                for fname in os.listdir(dir_path):
                    if fname.endswith(".png"):
                        src = os.path.join(dir_path, fname)
                        dst = os.path.join(temp_dir, fname)
                        shutil.move(src, dst)
                        
    # Recreate clean target directories
    for split in ["train", "val", "test"]:
        for cat in ["0_normal", "1_fracture"]:
            os.makedirs(os.path.join(DATA_DIR, split, cat), exist_ok=True)
            
    # Distribute files to new splits
    updated_records = []
    for r in manifest_data["images"]:
        fname = r["filename"]
        new_split = split_map[fname]
        cat = "1_fracture" if r["label"] == 1 else "0_normal"
        
        src = os.path.join(temp_dir, fname)
        dst = os.path.join(DATA_DIR, new_split, cat, fname)
        shutil.move(src, dst)
        
        r_updated = dict(r)
        r_updated["split"] = new_split
        r_updated["local_path"] = dst.replace("\\", "/")
        updated_records.append(r_updated)
        
    shutil.rmtree(temp_dir)
    
    # Counts
    df_new = pd.DataFrame(updated_records)
    print("\nBalanced Splits Summary:")
    print(df_new.groupby(["split", "label"])["filename"].count())
    
    # Save updated manifest
    train_df = df_new[df_new["split"] == "train"]
    val_df = df_new[df_new["split"] == "val"]
    test_df = df_new[df_new["split"] == "test"]
    
    with open(MANIFEST_PATH, "w") as f:
        json.dump({
            "dataset_name": "GRAZPEDWRI-DX",
            "source": "Medical University of Graz / Figshare",
            "license": "CC BY 4.0",
            "total_images": len(updated_records),
            "splits": {
                "train": len(train_df),
                "val": len(val_df),
                "test": len(test_df)
            },
            "class_counts": {
                "train": {"fracture": int((train_df['label'] == 1).sum()), "normal": int((train_df['label'] == 0).sum())},
                "val": {"fracture": int((val_df['label'] == 1).sum()), "normal": int((val_df['label'] == 0).sum())},
                "test": {"fracture": int((test_df['label'] == 1).sum()), "normal": int((test_df['label'] == 0).sum())}
            },
            "images": updated_records
        }, f, indent=2)
        
    print(f"[OK] Manifest updated successfully: {MANIFEST_PATH}")

if __name__ == "__main__":
    balance_splits(seed=42)
