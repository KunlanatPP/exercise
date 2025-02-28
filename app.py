import os
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ✅ เชื่อมต่อ MongoDB
MONGO_URI = "mongodb://localhost:27017/web"  # ✅ เปลี่ยนให้ตรงกับ MongoDB ของคุณ
client = MongoClient(MONGO_URI)
db = client.exercise_db
session_collection = db.sessions

# ✅ โหลดโมเดล
models = {
    "logistic_regression": "public\model\logistic_regression_pose_model.pkl",
    "random_forest": "public\model\random_forest_pose_model.pkl",
    "gradient_boosting": "public\model\gradient_boosting_pose_model.pkl"
}

model_mapping = {
    "logistic_regression": ["Squat", "Jumping Jack"],
    "random_forest": ["Plank"],
    "gradient_boosting": ["Push-Up", "Bridge"]
}

loaded_models = {}

for model_name, model_path in models.items():
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                loaded_models[model_name] = pickle.load(f)
            print(f"✅ Model loaded successfully: {model_name}")
        except Exception as e:
            print(f"❌ ERROR loading model {model_name}: {str(e)}")
            loaded_models[model_name] = None
    else:
        print(f"❌ ERROR: Model file not found: {model_path}")
        loaded_models[model_name] = None

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        landmarks = data.get('landmarks', [])
        pose_type = data.get('pose_type', None)

        if not landmarks or len(landmarks) == 0:
            return jsonify({'error': 'Invalid landmarks data'}), 400

        if not pose_type:
            return jsonify({'error': 'Pose type is required'}), 400

        selected_model = None
        for model_name, poses in model_mapping.items():
            if pose_type in poses:
                selected_model = loaded_models.get(model_name)
                break

        if selected_model is None:
            return jsonify({'error': 'No model available for this pose type'}), 400

        if selected_model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        features = np.array(landmarks).flatten()
        expected_features = selected_model.n_features_in_
        features = features[:expected_features].reshape(1, -1)

        prediction = selected_model.predict(features)

        return jsonify({'prediction': prediction.tolist()})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ API บันทึกข้อมูลลงฐานข้อมูล
@app.route('/save-session', methods=['POST'])
def save_session():
    try:
        data = request.get_json()
        user_id = data.get("user_id", None)  # ต้องได้รับ user_id มาจาก frontend
        exercises = data.get("exercises", {})
        total_time = data.get("total_time", 0)

        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # ✅ เตรียมข้อมูลบันทึกลง MongoDB
        session_data = {
            "user_id": user_id,
            "start_time": datetime.utcnow(),  # เวลาที่เริ่มต้น
            "end_time": datetime.utcnow(),  # เวลาที่จบ session
            "total_time": total_time,
            "exercises": [
                {"name": name, "count": ex["count"], "duration": ex.get("duration", 0), }
                for name, ex in exercises.items()
            ],
            "created_at": datetime.utcnow()
        }

        session_collection.insert_one(session_data)
        return jsonify({'message': 'Session saved successfully!', 'session_id': str(session_data["_id"])})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)

