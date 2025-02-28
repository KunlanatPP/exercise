document.addEventListener("DOMContentLoaded", () => {
    // โหลดค่าตั้งค่าปัจจุบัน
    fetch("/settings")
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById("inactivityDays").value = data.reminders || 3;
                document.getElementById("theme").value = data.theme || "light";
                document.body.setAttribute("data-theme", data.theme || "light"); // ✅ อัปเดตธีมของหน้า
            }
        })
        .catch(error => console.error("❌ Error fetching settings:", error));

    // ✅ อัปเดตการแจ้งเตือน
    document.getElementById("saveSettings").addEventListener("click", async () => {
        const inactivityDays = document.getElementById("inactivityDays").value;

        try {
            const response = await fetch("/settings/update-notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reminders: parseInt(inactivityDays) }),
            });

            const result = await response.json();
            document.getElementById("statusMessage").innerText = result.message;
        } catch (error) {
            console.error("❌ Error updating settings:", error);
            document.getElementById("statusMessage").innerText = "Failed to update settings.";
        }
    });

    // ✅ อัปเดตธีม
    document.getElementById("saveTheme").addEventListener("click", async () => {
        const theme = document.getElementById("theme").value;
    
        try {
            const response = await fetch("/settings/update-theme", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ theme }),
            });
    
            const result = await response.json();
            document.getElementById("themeStatus").innerText = result.message;
            document.body.setAttribute("data-theme", theme); // ✅ อัปเดตธีมบน DOM
    
            // ✅ บันทึกธีมไว้ใน Cookie & LocalStorage
            document.cookie = `theme=${theme}; path=/; max-age=31536000`; // เก็บไว้ 1 ปี
            localStorage.setItem("theme", theme);
    
        } catch (error) {
            console.error("❌ Error updating theme:", error);
            document.getElementById("themeStatus").innerText = "Failed to update theme.";
        }
    });
    

    // ✅ ลบบัญชีผู้ใช้
    document.getElementById("deleteAccount").addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

        try {
            await fetch("/settings/delete-account", { method: "DELETE" });
            alert("Account deleted successfully.");
            window.location.href = "/";
        } catch (error) {
            alert("Error deleting account.");
        }
    });

    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    const savedTheme = getCookie("theme") || localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
});
