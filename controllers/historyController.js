const Session = require('../models/session');


// ✅ ฟังก์ชันลบประวัติที่เกิน 30 วันออกอัตโนมัติ
const deleteOldHistory = async () => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);

        const result = await Session.deleteMany({ start_time: { $lt: cutoffDate } });
        console.log(`🗑️ ลบข้อมูลเก่าแล้ว: ${result.deletedCount} รายการ`);
    } catch (error) {
        console.error("❌ Error deleting old history:", error);
    }
};

const getHistory = async (req, res) => {
    const userId = req.user.id;
    let { days, searchDate } = req.query;

    try {
        await deleteOldHistory(); // ✅ ลบข้อมูลเก่าทุกครั้งก่อนโหลด

        let query = { user_id: userId };

        if (searchDate) {
            const searchStart = new Date(searchDate);
            const searchEnd = new Date(searchDate);
            searchEnd.setHours(23, 59, 59, 999);
            query.start_time = { $gte: searchStart, $lte: searchEnd };
        } else {
            let filterDate = new Date();
            filterDate.setDate(filterDate.getDate() - (days ? parseInt(days) : 30)); // ✅ จำกัดที่ 30 วัน
            query.start_time = { $gte: filterDate };
        }

        const sessions = await Session.find(query).sort({ start_time: -1 });

        const history = sessions.map(session => ({
            id: session._id,
            date: new Date(session.start_time).toLocaleDateString("th-TH"),
            total_time: Math.floor((new Date(session.end_time) - new Date(session.start_time)) / 1000),
            exercises: session.exercises
        }));

        res.render("history", { history, selectedDays: days || 30, selectedDate: searchDate || "" });
    } catch (error) {
        console.error("❌ Error loading history:", error);
        res.status(500).send("ไม่สามารถโหลดข้อมูลได้");
    }
};



const deleteHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSession = await Session.findByIdAndDelete(id);
        if (!deletedSession) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting session:", error);
        res.status(500).json({ message: "Failed to delete session" });
    }
};

const getDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).send("Session not found");
        }

        const sessionDetail = {
            date: new Date(session.start_time).toLocaleDateString(),
            totalTime: session.total_time,
            exercises: session.exercises.map(exercise => ({
                name: exercise.name,
                count: exercise.count || null,
                duration: exercise.duration || null,
            })),
        };

        res.render("detail", { session: sessionDetail });
    } catch (error) {
        console.error("❌ Error loading session detail:", error);
        res.status(500).send("Error loading session detail");
    }
};

// ✅ ตรวจสอบว่า `module.exports` ถูกต้อง และ export ทุกฟังก์ชันที่ใช้ใน routes
module.exports = {
    getHistory,
    deleteHistory,
    getDetail,
};
