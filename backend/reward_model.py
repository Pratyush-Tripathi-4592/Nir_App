import os
import pickle
import numpy as np

def load_reward_model(model_path="reward/model.pkl"):
    if os.path.exists(model_path):
        try:
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            return model
        except Exception:
            return None
    return None

def _encode_features(citizen_type, classification, dirtiness_index):
    """
    Flexible feature builder:
    X = [is_taxpayer, is_recyclable, dirtiness_index]
    """
    is_taxpayer = 1 if citizen_type.lower().startswith("tax") else 0
    is_recyclable = 1 if classification.lower().startswith("recycl") else 0
    return np.array([[is_taxpayer, is_recyclable, float(dirtiness_index)]])

def _fallback_rule(citizen_type, classification, dirtiness_index):
    base = 10 if classification.lower().startswith("recycl") else 5
    # Give more for dirtier areas (index 0..1 → +0..100%)
    value = base * (1.0 + float(dirtiness_index))
    label = "Tax Credits" if citizen_type.lower().startswith("tax") else "Ration Credits"
    return value, label

def compute_reward(model, citizen_type, classification, dirtiness_index):
    """
    Returns (value, label)
    """
    X = _encode_features(citizen_type, classification, dirtiness_index)

    if model is not None:
        try:
            pred = float(model.predict(X)[0])
            # Optional: clamp negatives
            pred = max(0.0, pred)
            label = "Tax Credits" if citizen_type.lower().startswith("tax") else "Ration Credits"
            return pred, label
        except Exception:
            # if model fails, use rule
            return _fallback_rule(citizen_type, classification, dirtiness_index)

    # No model.pkl → use rule
    return _fallback_rule(citizen_type, classification, dirtiness_index)
