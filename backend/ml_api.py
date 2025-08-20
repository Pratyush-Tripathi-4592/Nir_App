from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from PIL import Image

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/predict", methods=["POST"])
def predict():
    print("Request received:", request.files, request.form)  # Debug log
    
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    # Check file type
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400
        
    try:
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Process image (your existing logic)
        image = Image.open(filepath)
        
        # Get other form data
        citizen_type = request.form.get('citizen_type', 'regular')
        lat = request.form.get('lat')
        lng = request.form.get('lng')
        
        # Your existing prediction logic here
        # For now, return dummy data
        result = {
            "reward": "₹10.00 Ration Subsidy",
            "trash_type": "recyclable",
            "cleanliness_score": 0.8,
            "detections": []
        }
        
        return jsonify(result)
        
    except Exception as e:
        print("Error:", str(e))  # Debug log
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(debug=True, port=5000)