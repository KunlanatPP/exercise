document.addEventListener("DOMContentLoaded", () => {
    // ✅ อัปเดตชื่อผู้ใช้
    document.getElementById("saveUsername").addEventListener("click", async () => {
        const username = document.getElementById("username").value;

        const response = await fetch("/profilesetting/update-username", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
        });

        const result = await response.json();
        document.getElementById("usernameStatus").innerText = result.message;
    });

    // ✅ เปลี่ยนรหัสผ่าน
    document.getElementById("savePassword").addEventListener("click", async () => {
        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;

        const response = await fetch("/profilesetting/update-password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        const result = await response.json();
        document.getElementById("passwordStatus").innerText = result.message;
    });

    // ✅ ตั้งเป้าหมายออกกำลังกาย
    document.getElementById("saveGoal").addEventListener("click", async () => {
        const dailyGoalMinutes = document.getElementById("goalMinutes").value;

        const response = await fetch("/profilesetting/update-goal", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dailyGoalMinutes: parseInt(dailyGoalMinutes) })
        });

        const result = await response.json();
        document.getElementById("goalStatus").innerText = result.message;
    });

    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    const savedTheme = getCookie("theme") || localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
});
