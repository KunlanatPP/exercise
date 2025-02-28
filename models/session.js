const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  exercises: [
    {
      name: { type: String, required: true },
      count: { type: Number, default: 0 },
      duration: { type: Number, default: 0 }, // ระยะเวลา (วินาที)
    },
  ],
  total_time: { type: Number, required: true }, // เวลารวมทั้งหมด (วินาที)
  created_at: { type: Date, default: Date.now }, // วันที่สร้าง
});

module.exports = mongoose.model('Session', sessionSchema);
