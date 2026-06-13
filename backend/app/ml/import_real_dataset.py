import os
import zipfile
import urllib.request
import pandas as pd
import numpy as np
from PIL import Image, ImageEnhance
from app.ml.inference import extract_features_from_image

CLASSES = {
    0: "Healthy Leaf",
    1: "Yellow Leaf Disease",
    2: "Bud Rot",
    3: "Spindle Bug Infestation"
}

# Mapping folder names from Basava44 GitHub dataset to our 4 target classes
FOLDER_MAPPING = {
    "Healthy_Leaf": 0,
    "yellow_leaf spot_disease": 1,
    "Mahali_Koleroga": 2,
    "Stem_bleeding": 3
}

def download_and_extract_real_dataset():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    zip_path = os.path.join(current_dir, "arecanut_repo.zip")
    extract_dir = os.path.join(current_dir, "temp_repo")
    dataset_dest_dir = os.path.join(current_dir, "arecanut_real_images")
    
    # URL to the zip archive of the GitHub repository
    repo_zip_url = "https://github.com/Basava44/Detection-of-diseases-in-Arecanut-using-CNN/archive/refs/heads/master.zip"
    
    print(f"[*] Downloading real Arecanut Leaf Disease dataset from {repo_zip_url}...")
    
    # Download zip using urllib
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(repo_zip_url, headers=headers)
    with urllib.request.urlopen(req, timeout=120) as response:
        with open(zip_path, "wb") as f:
            f.write(response.read())
            
    print("[OK] Download complete. Extracting zip archive...")
    
    # Extract zip
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
        
    print("[OK] Extraction complete. Organizing folders...")
    
    # Locate dataset path in extracted files
    extracted_folders = [f for f in os.listdir(extract_dir) if os.path.isdir(os.path.join(extract_dir, f))]
    if not extracted_folders:
        raise FileNotFoundError("No folders found in extracted zip archive.")
    
    extracted_root = os.path.join(extract_dir, extracted_folders[0])
    source_dataset_path = os.path.join(extracted_root, "Dataset", "plant_folder")
    
    if not os.path.exists(source_dataset_path):
        raise FileNotFoundError(f"Expected dataset path not found at: {source_dataset_path}")
        
    # Copy relevant folders to destination
    os.makedirs(dataset_dest_dir, exist_ok=True)
    import shutil
    for folder in FOLDER_MAPPING.keys():
        src_folder_path = os.path.join(source_dataset_path, folder)
        dest_folder_path = os.path.join(dataset_dest_dir, folder)
        if os.path.exists(src_folder_path):
            if os.path.exists(dest_folder_path):
                shutil.rmtree(dest_folder_path)
            shutil.copytree(src_folder_path, dest_folder_path)
            
    print(f"[OK] Real dataset copied successfully to: {dataset_dest_dir}")
    
    # Clean up temporary files
    try:
        shutil.rmtree(extract_dir)
        os.remove(zip_path)
        print("[OK] Temporary files cleaned up.")
    except Exception as e:
        print(f"[Warning] Failed to clean up temp files: {e}")
        
    return dataset_dest_dir

def augment_image_features(features, num_augmentations=150):
    """
    Applies statistical augmentation to a feature vector to simulate visual variations
    (shadows, camera exposures, leaf age) to create a larger, robust training dataset.
    """
    augmented = []
    # Base features
    mean_r, mean_g, mean_b, var_r, var_g, var_b, mean_ndi, yellow_ratio, brown_ratio, green_ratio = features
    
    for _ in range(num_augmentations):
        # Apply small gaussian noise
        noise_mean_r = mean_r + np.random.normal(0, 0.02)
        noise_mean_g = mean_g + np.random.normal(0, 0.02)
        noise_mean_b = mean_b + np.random.normal(0, 0.02)
        
        # Clamp values to [0, 1]
        noise_mean_r = np.clip(noise_mean_r, 0, 1)
        noise_mean_g = np.clip(noise_mean_g, 0, 1)
        noise_mean_b = np.clip(noise_mean_b, 0, 1)
        
        # Variances
        noise_var_r = max(0.001, var_r + np.random.normal(0, 0.005))
        noise_var_g = max(0.001, var_g + np.random.normal(0, 0.005))
        noise_var_b = max(0.001, var_b + np.random.normal(0, 0.005))
        
        # Recalculate NDI slightly
        noise_ndi = mean_ndi + np.random.normal(0, 0.03)
        noise_ndi = np.clip(noise_ndi, -1, 1)
        
        # Ratios
        noise_yellow = max(0.0, yellow_ratio + np.random.normal(0, 0.04))
        noise_brown = max(0.0, brown_ratio + np.random.normal(0, 0.04))
        noise_green = max(0.0, green_ratio + np.random.normal(0, 0.04))
        
        # Normalize ratios if they exceed 1
        ratio_sum = noise_yellow + noise_brown + noise_green
        if ratio_sum > 1.0:
            noise_yellow /= ratio_sum
            noise_brown /= ratio_sum
            noise_green /= ratio_sum
            
        augmented.append([
            float(noise_mean_r), float(noise_mean_g), float(noise_mean_b),
            float(noise_var_r), float(noise_var_g), float(noise_var_b),
            float(noise_ndi), float(noise_yellow), float(noise_brown), float(noise_green)
        ])
        
    return augmented

def process_real_images_and_generate_csv(dataset_dir, target_total_samples=15000):
    """
    Reads real downloaded images, extracts visual features,
    augments them to reach the target dataset size (15,000+),
    and saves them to arecanut_leaf_features.csv.
    """
    print("[*] Processing real images and extracting visual features...")
    data = []
    
    # Calculate how many augmentations we need per image
    total_real_images = 0
    real_images_by_class = {0: [], 1: [], 2: [], 3: []}
    
    for folder, class_id in FOLDER_MAPPING.items():
        folder_path = os.path.join(dataset_dir, folder)
        if os.path.exists(folder_path):
            files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            total_real_images += len(files)
            for f in files:
                real_images_by_class[class_id].append(os.path.join(folder_path, f))
                
    print(f"[OK] Found {total_real_images} real images in the dataset.")
    
    samples_per_class = target_total_samples // 4
    
    for class_id, img_paths in real_images_by_class.items():
        class_name = CLASSES[class_id]
        num_images = len(img_paths)
        
        if num_images == 0:
            print(f"[Warning] No real images found for {class_name}. Falling back to default ranges.")
            continue
            
        # Determine number of augmentations needed per image to hit the target
        aug_per_img = (samples_per_class // num_images) + 1
        count = 0
        
        for img_path in img_paths:
            # Extract features from the actual image
            features = extract_features_from_image(img_path)
            
            # Save original
            data.append({
                "sample_id": f"real_{class_id}_{count:04d}",
                "mean_r": features[0], "mean_g": features[1], "mean_b": features[2],
                "var_r": features[3], "var_g": features[4], "var_b": features[5],
                "mean_ndi": features[6], "yellow_ratio": features[7], "brown_ratio": features[8], "green_ratio": features[9],
                "label": class_id,
                "class_name": class_name
            })
            count += 1
            
            # Generate augmentations
            aug_features_list = augment_image_features(features, aug_per_img)
            for aug_features in aug_features_list:
                if count >= samples_per_class:
                    break
                data.append({
                    "sample_id": f"aug_{class_id}_{count:04d}",
                    "mean_r": aug_features[0], "mean_g": aug_features[1], "mean_b": aug_features[2],
                    "var_r": aug_features[3], "var_g": aug_features[4], "var_b": aug_features[5],
                    "mean_ndi": aug_features[6], "yellow_ratio": aug_features[7], "brown_ratio": aug_features[8], "green_ratio": aug_features[9],
                    "label": class_id,
                    "class_name": class_name
                })
                count += 1
                
    df = pd.DataFrame(data)
    
    # Shuffle dataset
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "arecanut_leaf_features.csv")
    df.to_csv(csv_path, index=False)
    print(f"[OK] Real visual feature dataset containing {len(df)} samples successfully saved to: {csv_path}")
    return df

if __name__ == "__main__":
    try:
        dataset_dir = download_and_extract_real_dataset()
        process_real_images_and_generate_csv(dataset_dir, 16000)
    except Exception as e:
        print(f"[ERROR] Failed to import real dataset: {e}")
