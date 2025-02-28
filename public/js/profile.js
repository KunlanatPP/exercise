document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profile-form");
  const goalForm = document.getElementById("goal-form");
  const passwordForm = document.getElementById("password-form");
  const avatarUpload = document.getElementById("avatar-upload");

  // 🔹 อัปเดตข้อมูลโปรไฟล์
  document.getElementById("profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value; // ✅ ส่ง email ไปด้วย

    const response = await fetch("/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
    });

    const data = await response.json();
    if (response.ok) {
        alert("Profile updated successfully!");
        location.reload();
    } else {
        alert(data.message || "Failed to update profile.");
    }
});


  // 🔹 บันทึกเป้าหมายการออกกำลังกาย
  document.getElementById("goal-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    let daily_time = document.getElementById("goal-input").value.trim();

    // ✅ ถ้า goal เป็นค่าว่าง หรือ 0 → ใช้ค่าเริ่มต้น
    if (!daily_time || daily_time === "0") {
        daily_time = 0;
    }

    const goalData = { daily_time, target_exercises: [] };

    const response = await fetch("/profile/goal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: goalData }), // ✅ ส่ง goals เป็น Object
    });

    if (response.ok) {
        alert("Goal updated successfully!");
        location.reload();
    } else {
        alert("Failed to update goal.");
    }
});



  // 🔹 เปลี่ยนรหัสผ่าน
  // เปิด-ปิดฟอร์มเปลี่ยนรหัสผ่าน
document.getElementById("change-password-btn").addEventListener("click", () => {
    document.getElementById("password-form-container").classList.toggle("hidden");
});

// ส่งข้อมูลเปลี่ยนรหัสผ่านไปที่ Server
document.getElementById("password-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;

    if (newPassword.length < 6) {
        alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        return;
    }

    const response = await fetch("/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    if (response.ok) {
        alert("Password changed successfully!");
        location.reload();
    } else {
        alert(data.message || "Failed to change password.");
    }
});


  // 🔹 อัปโหลดรูปโปรไฟล์ (Avatar)
  avatarUpload.addEventListener("change", async () => {
      const file = avatarUpload.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/profile/avatar", {
          method: "POST",
          body: formData,
      });

      if (response.ok) {
          alert("Avatar updated successfully!");
          location.reload();
      } else {
          alert("Failed to upload avatar.");
      }
  });

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

const savedTheme = getCookie("theme") || localStorage.getItem("theme") || "light";
document.body.setAttribute("data-theme", savedTheme);
});
