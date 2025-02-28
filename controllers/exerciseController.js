const Exercise = require('../models/exercise');
const User = require('../models/user');
const Session = require('../models/session');

exports.getAllExercises = async (req, res) => {
  const exercises = await Exercise.find();
  res.json(exercises);
};

exports.logExercise = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const today = new Date().toISOString().split("T")[0]; // วันที่วันนี้
        const lastExercise = user.streak?.lastExerciseDate 
            ? new Date(user.streak.lastExerciseDate).toISOString().split("T")[0] 
            : null;

        // ✅ ถ้าผู้ใช้มีการออกกำลังกายวันต่อเนื่องให้เพิ่ม streakDays
        if (lastExercise === today) {
            // ออกกำลังกายแล้วในวันนี้ ไม่ต้องเพิ่ม streak
            console.log("✅ Already exercised today");
        } else if (lastExercise && (new Date(today) - new Date(lastExercise)) / (1000 * 60 * 60 * 24) === 1) {
            // ✅ ถ้าออกกำลังกายวันต่อเนื่อง
            user.streak.streakDays += 1;
        } else {
            // ✅ ถ้าหยุดไปหลายวัน รีเซ็ต streak
            user.streak.streakDays = 1;
        }

        user.streak.lastExerciseDate = new Date(); // อัปเดตวันที่ล่าสุด
        await user.save();

        res.json({ message: "Exercise logged successfully", streak: user.streak });
    } catch (error) {
        console.error("❌ Error logging exercise:", error);
        res.status(500).json({ message: "Failed to log exercise" });
    }
};

exports.logExercise = async (req, res) => {
  try {
      console.log("🚀 Exercise logging request received");

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const today = new Date().toISOString().split("T")[0]; // วันที่วันนี้
      const lastExercise = user.streak?.lastExerciseDate 
          ? new Date(user.streak.lastExerciseDate).toISOString().split("T")[0] 
          : null;

      console.log("✅ Last exercise date:", lastExercise);
      console.log("✅ Today’s date:", today);

      // ✅ ถ้าผู้ใช้มีการออกกำลังกายวันต่อเนื่องให้เพิ่ม streakDays
      if (lastExercise === today) {
          console.log("✅ Already exercised today");
      } else if (lastExercise && (new Date(today) - new Date(lastExercise)) / (1000 * 60 * 60 * 24) === 1) {
          console.log("🔥 Streak continued!");
          user.streak.streakDays += 1;
      } else {
          console.log("⚠️ Streak reset to 1");
          user.streak.streakDays = 1;
      }

      user.streak.lastExerciseDate = new Date(); // อัปเดตวันที่ล่าสุด
      await user.save();

      console.log("🚀 Updated Streak in DB:", user.streak);
      res.json({ message: "Exercise logged successfully", streak: user.streak });

  } catch (error) {
      console.error("❌ Error logging exercise:", error);
      res.status(500).json({ message: "Failed to log exercise" });
  }
};

