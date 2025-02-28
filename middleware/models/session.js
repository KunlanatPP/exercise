const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    total_time: { type: Number, required: true },
    exercises: [
        {
            name: { type: String, required: true },
            count: { type: Number, default: 0 },
            duration: { type: Number, default: 0 },
            calories_burned: { type: Number, default: 0 }
        }
    ],
    total_calories: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// ✅ ป้องกันการโหลดโมเดลซ้ำ
const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

module.exports = Session;
