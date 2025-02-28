const User = require('../models/user');
const Session = require('../models/session');

exports.getDashboard = async (req, res) => {
    try {
        console.log("🚀 Fetching user in Dashboard...");

        const user = await User.findById(req.user.id).lean();
        if (!user) {
            return res.status(404).render("error", { message: "User not found" });
        }

        // ✅ ดึงข้อมูลการออกกำลังกาย 7 วันล่าสุด
        const last7Days = await Session.find({ userId: req.user._id })
            .sort({ start_time: -1 })
            .limit(7)
            .lean();

        // ✅ คำนวณเวลารวมทั้งหมด
        const totalExerciseTime = last7Days.reduce((sum, session) => sum + session.total_time, 0);

        // ✅ คำนวณ Streak (จำนวนวันที่ออกกำลังกายต่อเนื่อง)
        const streakDays = user.streak?.streakDays ?? 0;

        // ✅ คำนวณ Progress Bar (% ของเป้าหมายรายวัน)
        const dailyGoal = user.goals?.daily_time ?? 30; // ถ้าไม่มีเป้าหมายใช้ค่าเริ่มต้น 30 นาที
        const progress = Math.min((totalExerciseTime / dailyGoal) * 100, 100); // จำกัดค่ามากสุด 100%

        console.log("🚀 Streak Days:", streakDays);
        console.log("🚀 Progress:", progress);

        // ✅ ส่งค่าทั้งหมดไปยัง Dashboard
        res.render('dashboard', { user, last7Days, totalExerciseTime, streakDays, progress });

    } catch (error) {
        console.error("❌ Error in getDashboard:", error);
        res.status(500).render('error', { message: "Internal Server Error" });
    }
};
