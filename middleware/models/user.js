const mongoose = require('mongoose');
const { DataTypes } = require('sequelize');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  goals: {
    type: Object,
    default: 'No goal set',
},
  streak: {
    streakDays: { type: Number, default: 0 }, // จำนวนวันต่อเนื่อง
    lastExerciseDate: { type: Date, default: null } // วันที่ออกกำลังกายล่าสุด
  },
  history: [
    {
      date: { type: Date, required: true },
      exercises: [
        {
          name: { type: String, required: true }, // ชื่อการออกกำลังกาย
          count: { type: Number, default: 0 }, // จำนวนครั้ง
          duration: { type: Number, default: 0 } // ระยะเวลา (วินาที)
        }
      ],
      total_time: { type: Number, default: 0 }, // เวลารวม (วินาที)
      calories_burned: { type: Number, default: 0 } // แคลอรี่รวม
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
