const User = require('../models/user');
const bcrypt = require('bcrypt');

// ✅ **ดึงข้อมูลโปรไฟล์ผู้ใช้**
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).render("error", { message: "User not found" });
        }

        res.render('profile', {
            user: {
                username: user.username,
                email: user.email,
                streak: user.streak || { streakDays: 0, lastExerciseDate: null },
                goals: user.goals || { daily_time: 0, target_exercises: [] }
            }
        });
    } catch (error) {
        console.error("❌ Error loading profile:", error);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};

// ✅ **แสดงหน้า Profile Settings**
exports.getProfileSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).render("error", { message: "User not found" });
        }

        res.render('profilesetting', {
            user: {
                username: user.username,
                email: user.email,
                goals: user.goals || { daily_time: 0, target_exercises: [] }
            }
        });
    } catch (error) {
        console.error("❌ Error loading profile settings:", error);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};

// ✅ **อัปเดตชื่อผู้ใช้**
exports.updateUsername = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters long" });
        }

        await User.findByIdAndUpdate(req.user.id, { username });
        res.json({ message: "Username updated successfully" });
    } catch (error) {
        console.error("❌ Error updating username:", error);
        res.status(500).json({ message: "Failed to update username" });
    }
};

// ✅ **เปลี่ยนรหัสผ่าน**
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("❌ Error changing password:", error);
        res.status(500).json({ message: "Failed to change password" });
    }
};

// ✅ **ตั้งเป้าหมายการออกกำลังกาย**
exports.updateGoal = async (req, res) => {
    try {
        const { dailyGoalMinutes } = req.body;

        if (!dailyGoalMinutes || dailyGoalMinutes < 1) {
            return res.status(400).json({ message: "Invalid goal input" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ แก้ไขให้บันทึกค่าใหม่ลงไป
        user.goals.daily_time = dailyGoalMinutes;
        await user.save();

        console.log("✅ Goal updated:", user.goals.daily_time); // Debug log

        res.json({ message: "Workout goal updated successfully", daily_time: user.goals.daily_time });

    } catch (error) {
        console.error("❌ Error updating goal:", error);
        res.status(500).json({ message: "Failed to update goal" });
    }
};

