import os
import pandas as pd
import numpy as np

# Define classes
CLASSES = {
    0: "Healthy Leaf",
    1: "Yellow Leaf Disease",
    2: "Bud Rot",
    3: "Spindle Bug Infestation"
}

def generate_scientific_dataset(num_samples=1000, save_path=None):
    """
    Generates a realistic tabular dataset representing the visual and texture characteristics
    of Arecanut leaves across different health conditions based on agricultural research.
    """
    np.random.seed(42)
    
    samples_per_class = num_samples // len(CLASSES)
    data = []
    
    for class_id, class_name in CLASSES.items():
        for i in range(samples_per_class):
            sample_id = f"sample_{class_id}_{i:04d}"
            
            if class_id == 0:  # Healthy Leaf
                mean_r = np.random.uniform(0.18, 0.32)
                mean_g = np.random.uniform(0.55, 0.78)
                mean_b = np.random.uniform(0.18, 0.32)
                var_r = np.random.uniform(0.005, 0.015)
                var_g = np.random.uniform(0.005, 0.015)
                var_b = np.random.uniform(0.005, 0.015)
                mean_ndi = np.random.uniform(0.30, 0.58)
                yellow_ratio = np.random.uniform(0.00, 0.04)
                brown_ratio = np.random.uniform(0.00, 0.03)
                green_ratio = np.random.uniform(0.78, 0.96)
                
            elif class_id == 1:  # Yellow Leaf Disease (Chlorosis)
                mean_r = np.random.uniform(0.52, 0.72)
                mean_g = np.random.uniform(0.52, 0.72)
                mean_b = np.random.uniform(0.12, 0.28)
                var_r = np.random.uniform(0.012, 0.035)
                var_g = np.random.uniform(0.012, 0.035)
                var_b = np.random.uniform(0.008, 0.018)
                mean_ndi = np.random.uniform(-0.08, 0.08)
                yellow_ratio = np.random.uniform(0.55, 0.88)
                brown_ratio = np.random.uniform(0.00, 0.08)
                green_ratio = np.random.uniform(0.06, 0.26)
                
            elif class_id == 2:  # Bud Rot (Necrotic brown decay)
                mean_r = np.random.uniform(0.32, 0.52)
                mean_g = np.random.uniform(0.22, 0.38)
                mean_b = np.random.uniform(0.16, 0.28)
                var_r = np.random.uniform(0.035, 0.075)
                var_g = np.random.uniform(0.035, 0.075)
                var_b = np.random.uniform(0.012, 0.035)
                mean_ndi = np.random.uniform(-0.28, -0.06)
                yellow_ratio = np.random.uniform(0.06, 0.18)
                brown_ratio = np.random.uniform(0.48, 0.78)
                green_ratio = np.random.uniform(0.04, 0.22)
                
            elif class_id == 3:  # Spindle Bug Infestation (Many tiny brown/dark spots)
                mean_r = np.random.uniform(0.28, 0.42)
                mean_g = np.random.uniform(0.42, 0.58)
                mean_b = np.random.uniform(0.18, 0.32)
                var_r = np.random.uniform(0.042, 0.085)
                var_g = np.random.uniform(0.042, 0.085)
                var_b = np.random.uniform(0.022, 0.048)
                mean_ndi = np.random.uniform(0.06, 0.18)
                yellow_ratio = np.random.uniform(0.06, 0.22)
                brown_ratio = np.random.uniform(0.16, 0.32)
                green_ratio = np.random.uniform(0.42, 0.62)
                
            data.append({
                "sample_id": sample_id,
                "mean_r": float(mean_r),
                "mean_g": float(mean_g),
                "mean_b": float(mean_b),
                "var_r": float(var_r),
                "var_g": float(var_g),
                "var_b": float(var_b),
                "mean_ndi": float(mean_ndi),
                "yellow_ratio": float(yellow_ratio),
                "brown_ratio": float(brown_ratio),
                "green_ratio": float(green_ratio),
                "label": int(class_id),
                "class_name": class_name
            })
            
    df = pd.DataFrame(data)
    
    if save_path:
        # Create directories if they don't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        df.to_csv(save_path, index=False)
        print(f"Dataset containing {len(df)} samples saved to: {save_path}")
        
    return df

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "arecanut_leaf_features.csv")
    generate_scientific_dataset(16000, csv_path)
