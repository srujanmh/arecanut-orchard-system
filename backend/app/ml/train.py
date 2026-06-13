import os
import json
import joblib
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# Class labels mapping
CLASSES = {
    0: "Healthy Leaf",
    1: "Yellow Leaf Disease",
    2: "Bud Rot",
    3: "Spindle Bug Infestation"
}

def train_disease_model(csv_path=None, model_save_path=None, metrics_save_path=None):
    """
    Loads the features dataset, trains a Random Forest Classifier,
    evaluates it, and serializes the model and metrics.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    if not csv_path:
        csv_path = os.path.join(current_dir, "arecanut_leaf_features.csv")
    if not model_save_path:
        model_save_path = os.path.join(current_dir, "disease_classifier.joblib")
    if not metrics_save_path:
        metrics_save_path = os.path.join(current_dir, "model_metrics.json")
        
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at: {csv_path}. Run dataset.py first.")
        
    # 1. Load Data
    df = pd.read_csv(csv_path)
    
    feature_cols = [
        "mean_r", "mean_g", "mean_b",
        "var_r", "var_g", "var_b",
        "mean_ndi", "yellow_ratio", "brown_ratio", "green_ratio"
    ]
    
    X = df[feature_cols]
    y = df["label"]
    
    # 2. Train Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 3. Train Model
    clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    clf.fit(X_train, y_train)
    
    # 4. Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # Generate classification report
    report_dict = classification_report(y_test, y_pred, output_dict=True)
    
    # Generate confusion matrix
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    # 5. Extract Feature Importances (SHAP replacement)
    importances = clf.feature_importances_
    feature_importance_dict = {feature_cols[i]: float(importances[i]) for i in range(len(feature_cols))}
    # Sort by importance descending
    feature_importance_sorted = dict(sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True))
    
    # 6. Save Model & Metrics
    joblib.dump(clf, model_save_path)
    
    metrics = {
        "accuracy": float(accuracy),
        "trained_at": datetime.utcnow().isoformat(),
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "class_report": {
            CLASSES[int(k)] if k.isdigit() else k: v 
            for k, v in report_dict.items()
        },
        "confusion_matrix": cm,
        "feature_importances": feature_importance_sorted
    }
    
    with open(metrics_save_path, "w") as f:
        json.dump(metrics, f, indent=4)
        
    print(f"Model trained successfully! Accuracy: {accuracy:.4f}")
    print(f"Model saved to: {model_save_path}")
    print(f"Metrics saved to: {metrics_save_path}")
    
    return metrics

if __name__ == "__main__":
    train_disease_model()
