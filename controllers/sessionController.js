const User = require('../models/user');
const Session = require('../models/session');

// ✅ ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลที่ส่งมา
function validateSessionData(req, res) {
  const { start_time, end_time, exercises } = req.body;

  if (!start_time || !end_time || !exercises || exercises.length === 0) {
    console.error("❌ Missing or invalid session data");
    return res.status(400).json({ error: "Missing or invalid session data" });
  }

  return { start_time, end_time, exercises };
}

// ✅ ฟังก์ชันสร้าง Session ใหม่
const createSession = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const validatedData = validateSessionData(req, res);
    if (!validatedData) return;

    const { start_time, end_time, exercises } = validatedData;

    // ✅ ดึงข้อมูลผู้ใช้
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ คำนวณ streak ของผู้ใช้
    const today = new Date().setHours(0, 0, 0, 0);
    const lastExercise = user.streak?.lastExerciseDate
      ? new Date(user.streak.lastExerciseDate).setHours(0, 0, 0, 0)
      : null;

    if (!lastExercise || lastExercise < today - 86400000) {
      user.streak.streakDays = 1;
    } else if (lastExercise === today - 86400000) {
      user.streak.streakDays += 1;
    }

    user.streak.lastExerciseDate = new Date();
    await user.save();

    // ✅ คำนวณเวลารวมและแคลอรี่
    const total_time = (new Date(end_time) - new Date(start_time)) / 60000;
  

    // ✅ บันทึก Session ลงฐานข้อมูล
    const newSession = new Session({
      user_id: userId,
      start_time,
      end_time,
      exercises,
      total_time,
    });

    await newSession.save();
    res.status(201).json({ message: 'Session saved successfully', session: newSession, streakDays: user.streak.streakDays });

  } catch (error) {
    console.error('❌ Error in createSession:', error);
    res.status(500).json({ message: 'Failed to save session' });
  }
};

// ✅ ฟังก์ชันหยุด Session และบันทึกผลลัพธ์
const endSession = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const validatedData = validateSessionData(req, res);
    if (!validatedData) return;

    const { start_time, end_time, exercises } = validatedData;

    // ✅ ดึงข้อมูลผู้ใช้
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ คำนวณเวลาทั้งหมดและแคลอรี่
    const total_time = (new Date(end_time) - new Date(start_time)) / 60000;
    const total_calories = exercises.reduce((sum, exercise) => sum + exercise.calories_burned, 0);

    // ✅ ตรวจสอบว่าเป้าหมายสำเร็จหรือไม่
    const dailyTimeGoal = user.goals?.daily_time || 0;
    const targetExercises = user.goals?.target_exercises || [];

    const isTimeGoalMet = total_time >= dailyTimeGoal;
    const completedExercises = exercises.filter(exercise => targetExercises.includes(exercise.name));
    const isExerciseGoalMet = completedExercises.length === targetExercises.length;

    // ✅ บันทึกข้อมูล Session ลงฐานข้อมูล
    const newSession = new Session({
      user_id: userId,
      start_time,
      end_time,
      exercises,
      total_time,
    });

    await newSession.save();

    // ✅ ส่งข้อมูลสรุปกลับไปให้ client
    const summary = {
      total_time,
      exercises,
      isTimeGoalMet,
      isExerciseGoalMet,
    };

    res.status(200).json({ message: 'Session ended successfully', summary });

  } catch (error) {
    console.error('❌ Error in endSession:', error);
    res.status(500).json({ message: 'Failed to end session' });
  }
};

// ✅ ฟังก์ชันดึงประวัติการออกกำลังกาย
const getSessionHistory = async (req, res) => {
  try {
    const { days, date } = req.query;
    let filter = { user_id: req.user.id };

    if (days) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(days));
      filter.start_time = { $gte: fromDate };
    }

    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.start_time = { $gte: selectedDate, $lt: nextDay };
    }

    const history = await Session.find(filter).sort({ start_time: -1 });

    // ✅ ตรวจสอบว่า API ส่ง JSON เสมอ
    if (!history || history.length === 0) {
      return res.json([]); // ✅ ถ้าไม่มีข้อมูล ให้ส่ง Array ว่างกลับไป
    }

    // ✅ คำนวณเวลารวมจาก start_time และ end_time
    const formattedHistory = history.map(session => {
      const durationInSeconds = Math.floor((new Date(session.end_time) - new Date(session.start_time)) / 1000);
      return {
        id: session._id,
        start_time: session.start_time,
        end_time: session.end_time,
        total_time: durationInSeconds,
        exercises: session.exercises
      };
    });

    console.log("📌 History Data Sent:", formattedHistory);
    res.setHeader("Content-Type", "application/json"); // ✅ บังคับให้ส่ง JSON
    res.json(formattedHistory);
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
  }
};



// ✅ ฟังก์ชันดึงรายละเอียดของ Session
const getDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("❌ Error fetching session details:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ ดึงเป้าหมายของผู้ใช้
const getUserGoals = async (req, res) => {
  try {
    console.log("📌 Fetching user goals for user ID:", req.user.id);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ ตรวจสอบว่ามีค่า goals หรือไม่
    if (!user.goals || typeof user.goals.daily_time === "undefined") {
      return res.status(200).json({ daily_time: 0 });
    }

    res.status(200).json({ daily_time: user.goals.daily_time });

  } catch (error) {
    console.error("❌ Error fetching user goals:", error);
    res.status(500).json({ message: "Failed to retrieve user goals" });
  }
};


// ✅ เพิ่ม API เข้าไป
module.exports = { createSession, endSession, getSessionHistory, getDetail, getUserGoals };

