"""
WristAI - GRAZPEDWRI-DX Dataset Preparation Pipeline
Downloads and prepares a balanced, patient-split dataset from official GRAZPEDWRI-DX on Figshare.
Enforces strict patient-level split isolation (Train / Val / Test) to prevent data leakage.
"""

import os
import io
import json
import random
import zipfile
import pandas as pd
import fsspec
from PIL import Image
from sklearn.model_selection import GroupShuffleSplit

FIGSHARE_PART1_URL = "https://ndownloader.figshare.com/files/34268828"
METADATA_CSV = "data/grazpedwri/dataset.csv"
OUTPUT_DIR = "data/dataset"

def prepare_dataset(num_fracture=80, num_normal=80, random_seed=42):
    print("=== Step 2: Preparing Genuine GRAZPEDWRI-DX Dataset ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 1. Load metadata
    df = pd.read_csv(METADATA_CSV)
    df["label"] = df["fracture_visible"].apply(lambda x: 1 if x == 1.0 else 0)
    
    print(f"Loaded {len(df)} total dataset records from {METADATA_CSV}")
    
    # 2. Inspect available images in Part 1 remote zip
    print(f"Connecting to Figshare repository: {FIGSHARE_PART1_URL}...")
    fs = fsspec.filesystem("http")
    with fs.open(FIGSHARE_PART1_URL, "rb") as remote_file:
        zf = zipfile.ZipFile(remote_file)
        available_files = set(zf.namelist())
        print(f"Total images accessible in Part 1 archive: {len(available_files)}")
        
        # Filter dataframe to available files in Part 1
        df["filename"] = df["filestem"].apply(lambda s: f"{s}.png")
        df_available = df[df["filename"].isin(available_files)].copy()
        print(f"Metadata rows matching available images: {len(df_available)}")
        
        # 3. Sample balanced cohorts of patients
        # Filter patients with fractures and patients with normal radiographs
        frac_df = df_available[df_available["label"] == 1]
        norm_df = df_available[df_available["label"] == 0]
        
        # Sample patients to meet target counts
        rng = random.Random(random_seed)
        
        frac_patients = list(frac_df["patient_id"].unique())
        norm_patients = list(norm_df["patient_id"].unique())
        rng.shuffle(frac_patients)
        rng.shuffle(norm_patients)
        
        selected_frac_records = []
        for pid in frac_patients:
            records = frac_df[frac_df["patient_id"] == pid]
            selected_frac_records.append(records)
            if sum(len(r) for r in selected_frac_records) >= num_fracture:
                break
        selected_frac_df = pd.concat(selected_frac_records).iloc[:num_fracture]
        
        selected_norm_records = []
        for pid in norm_patients:
            records = norm_df[norm_df["patient_id"] == pid]
            selected_norm_records.append(records)
            if sum(len(r) for r in selected_norm_records) >= num_normal:
                break
        selected_norm_df = pd.concat(selected_norm_records).iloc[:num_normal]
        
        cohort_df = pd.concat([selected_frac_df, selected_norm_df]).sample(frac=1.0, random_state=random_seed).reset_index(drop=True)
        print(f"Selected balanced cohort: {len(cohort_df)} images ({len(selected_frac_df)} fractures, {len(selected_norm_df)} normal)")
        print(f"Total unique patients in cohort: {cohort_df['patient_id'].nunique()}")
        
        # 4. Patient-level Splitting (Train: 70%, Val: 15%, Test: 15%)
        # Split 1: Train (70%) vs Temp (30%)
        gss1 = GroupShuffleSplit(n_splits=1, train_size=0.70, random_state=random_seed)
        train_idx, temp_idx = next(gss1.split(cohort_df, groups=cohort_df["patient_id"]))
        
        train_df = cohort_df.iloc[train_idx].copy()
        temp_df = cohort_df.iloc[temp_idx].copy()
        
        # Split 2: Val (50% of Temp = 15%) vs Test (50% of Temp = 15%)
        gss2 = GroupShuffleSplit(n_splits=1, train_size=0.50, random_state=random_seed)
        val_idx, test_idx = next(gss2.split(temp_df, groups=temp_df["patient_id"]))
        
        val_df = temp_df.iloc[val_idx].copy()
        test_df = temp_df.iloc[test_idx].copy()
        
        train_df["split"] = "train"
        val_df["split"] = "val"
        test_df["split"] = "test"
        
        final_df = pd.concat([train_df, val_df, test_df]).reset_index(drop=True)
        
        # Verify ZERO patient overlap
        train_pids = set(train_df["patient_id"])
        val_pids = set(val_df["patient_id"])
        test_pids = set(test_df["patient_id"])
        assert len(train_pids.intersection(val_pids)) == 0, "Patient leakage between train and val!"
        assert len(train_pids.intersection(test_pids)) == 0, "Patient leakage between train and test!"
        assert len(val_pids.intersection(test_pids)) == 0, "Patient leakage between val and test!"
        print("[OK] Verified Patient Isolation: ZERO patient overlap across Train, Val, and Test splits.")
        
        print(f"Train split: {len(train_df)} images (Patients: {len(train_pids)}, Fractures: {(train_df['label'] == 1).sum()}, Normal: {(train_df['label'] == 0).sum()})")
        print(f"Val split:   {len(val_df)} images (Patients: {len(val_pids)}, Fractures: {(val_df['label'] == 1).sum()}, Normal: {(val_df['label'] == 0).sum()})")
        print(f"Test split:  {len(test_df)} images (Patients: {len(test_pids)}, Fractures: {(test_df['label'] == 1).sum()}, Normal: {(test_df['label'] == 0).sum()})")
        
        # 5. Create directories
        for split in ["train", "val", "test"]:
            for cat in ["0_normal", "1_fracture"]:
                os.makedirs(os.path.join(OUTPUT_DIR, split, cat), exist_ok=True)
                
        # 6. Extract images from remote zip and save locally (resized to 224x224 for standard CNN input)
        manifest = []
        print("\nExtracting and saving authentic radiographs...")
        for idx, row in final_df.iterrows():
            filename = row["filename"]
            split = row["split"]
            label_str = "1_fracture" if row["label"] == 1 else "0_normal"
            out_path = os.path.join(OUTPUT_DIR, split, label_str, filename)
            
            # Read from zip
            img_bytes = zf.read(filename)
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            
            # Standardize resolution to 224x224 for consistent CNN training & inference
            img_resized = img.resize((224, 224), Image.Resampling.BILINEAR)
            img_resized.save(out_path, format="PNG")
            
            manifest.append({
                "filename": filename,
                "local_path": out_path.replace("\\", "/"),
                "patient_id": int(row["patient_id"]),
                "study_number": int(row["study_number"]) if pd.notna(row["study_number"]) else 1,
                "gender": str(row["gender"]) if pd.notna(row["gender"]) else "Unknown",
                "age": float(row["age"]) if pd.notna(row["age"]) else None,
                "projection": int(row["projection"]) if pd.notna(row["projection"]) else 1,
                "label": int(row["label"]),
                "class_name": "Fracture Suspected" if row["label"] == 1 else "No Fracture Detected",
                "split": split
            })
            
            if (idx + 1) % 20 == 0 or (idx + 1) == len(final_df):
                print(f"  Processed {idx + 1}/{len(final_df)} images...")
                
        manifest_path = os.path.join(OUTPUT_DIR, "dataset_manifest.json")
        with open(manifest_path, "w") as mf:
            json.dump({
                "dataset_name": "GRAZPEDWRI-DX",
                "source": "Medical University of Graz / Figshare",
                "license": "CC BY 4.0",
                "total_images": len(manifest),
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
                "images": manifest
            }, mf, indent=2)
            
        print(f"[OK] Manifest saved to: {manifest_path}")
        print("=== Step 2 Dataset Preparation Complete! ===")

if __name__ == "__main__":
    prepare_dataset(num_fracture=80, num_normal=80, random_seed=42)
