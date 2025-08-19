from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
from werkzeug.utils import secure_filename
from utils.geo import DirtinessIndex
from PIL import Image
from yolo_infer import classify_image
from reward_model import load_reward_model, compute_reward # Import reward model functions

# Setup Flask
app = Flask(__name__)
CORS(app)

# Paths
MODEL_PATH = os.path.join("backend", "reward", "model.pkl") # Correct path for reward model
DATA_PATH = os.path.join("backend", "data", "dirtiness_points.json")
UPLOAD_FOLDER = os.path.join("backend", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load the Reward Model at startup
reward_model = load_reward_model(model_path=MODEL_PATH)

# Dirtiness Index Service
try:
    dirtiness_service = DirtinessIndex(data_path=DATA_PATH)
except Exception as e:
    print(f"⚠️ Dirtiness service not loaded properly: {e}")
    dirtiness_service = None


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "API running"})


@app.route("/predict", methods=["POST"])
def predict():
    citizen_type = request.form.get("citizen_type")
    lat = request.form.get("lat")
    lng = request.form.get("lng")
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    # ... (file saving is the same)
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # ... (YOLO classification is the same)
    try:
        pil_img = Image.open(filepath)
        trash_type, confidence, detections = classify_image(pil_img)
    except Exception as e:
        print(f"Error during image classification: {e}")
        return jsonify({"error": "Could not classify image"}), 500

    # ... (Dirtiness score is the same)
    cleanliness_score = 0.5 # Default value
    if dirtiness_service and lat and lng:
        try:
            cleanliness_score = dirtiness_service.get_index(float(lat), float(lng))
        except Exception as e:
            print(f"Error calculating cleanliness score: {e}")
            cleanliness_score = 0.5

    # --- NEW: Dynamic Reward Calculation ---
    # Use the fallback rule from your reward model for a clear breakdown
    base_reward = 10 if trash_type.lower().startswith("recycl") else 5
    cleanliness_bonus = base_reward * cleanliness_score
    total_reward_value = base_reward + cleanliness_bonus
    
    reward_label_type = "Tax Credit" if citizen_type.lower().startswith("tax") else "Ration Subsidy"
    reward_label = f"₹{total_reward_value:.2f} {reward_label_type}"

    return jsonify({
        "reward": reward_label,
        "base_reward": base_reward,
        "cleanliness_bonus": round(cleanliness_bonus, 2),
        "lat": lat,
        "lng": lng,
        "cleanliness_score": cleanliness_score,
        "trash_type": trash_type,
        "detections": detections
    })

# ... (get_dirtiness_points function is the same)
@app.route("/api/dirtiness-points", methods=["GET"])
def get_dirtiness_points():
    if dirtiness_service:
        points = dirtiness_service.get_points()
        return jsonify(points)
    return jsonify({"error": "Dirtiness service not available"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)