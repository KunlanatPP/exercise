const User = require('../models/user');

// ✅ **เปลี่ยนจาก `res.json()` เป็น `res.render()`**
exports.getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("settings");
        if (!user) {
            return res.status(404).render("error", { message: "User not found" });
        }

        // ✅ ตรวจสอบว่า `settings` มีค่าหรือไม่ ถ้าไม่มีให้กำหนดค่าเริ่มต้น
        const settings = user.settings || { theme: "light", reminders: 3 };

        // ✅ แทนที่จะส่ง JSON ให้ API, เราส่งข้อมูลให้ `settings.ejs`
        res.render("settings", { settings });
    } catch (error) {
        console.error('❌ Error fetching settings:', error);
        res.status(500).render("error", { message: 'Failed to load settings' });
    }
};



// ✅ **อัปเดตการตั้งค่าการแจ้งเตือน**
exports.updateNotifications = async (req, res) => {
    try {
        const { reminders } = req.body;

        await User.findByIdAndUpdate(req.user.id, { 'settings.reminders': reminders });

        res.json({ message: 'Notification settings updated successfully' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ message: 'Failed to update notification settings' });
    }
};

// ✅ **อัปเดตธีมของระบบ**
exports.updateTheme = async (req, res) => {
    try {
        const { theme } = req.body;
        if (!['light', 'dark'].includes(theme)) {
            return res.status(400).json({ message: "Invalid theme selection" });
        }

        await User.findByIdAndUpdate(req.user.id, { 'settings.theme': theme });

        res.json({ message: 'Theme updated successfully' });
    } catch (error) {
        console.error('Error updating theme:', error);
        res.status(500).json({ message: 'Failed to update theme' });
    }
};

// ✅ **ลบบัญชีผู้ใช้**
exports.deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Failed to delete account' });
    }
};
