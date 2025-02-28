const Session = require('../models/session');

// ✅ **Render หน้า Summary (EJS)**
exports.renderSummary = async (req, res) => {
    try {
        res.render("summary", { totalWorkoutTime: 0, labels: [], workoutTimes: [] });
    } catch (error) {
        console.error('❌ Error rendering summary page:', error);
        res.status(500).render("error", { message: 'Failed to load summary page' });
    }
};

// ✅ **API ดึงข้อมูลสรุปการออกกำลังกาย**
exports.getSummaryData = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const sessions = await Session.find({
            user_id: req.user.id,
            start_time: { $gte: startDate }
        }).sort({ start_time: 1 }); // ✅ เรียงจากเก่าไปใหม่

        if (!sessions.length) {
            return res.json({ totalWorkoutTime: 0, labels: [], workoutTimes: [] });
        }

        // ✅ คำนวณเวลาทั้งหมดที่ออกกำลังกาย
        const totalWorkoutTime = sessions.reduce((sum, session) => sum + session.total_time, 0);

        // ✅ สร้างข้อมูลสำหรับ Chart.js
        const labels = sessions.map(session => new Date(session.start_time).toLocaleDateString());
        const workoutTimes = sessions.map(session => session.total_time);

        res.json({ totalWorkoutTime, labels, workoutTimes });

    } catch (error) {
        console.error('❌ Error fetching summary data:', error);
        res.status(500).json({ message: 'Failed to fetch summary data' });
    }
};
