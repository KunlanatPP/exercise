document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector(".menu-toggle");
    const menu = document.getElementById("hamburger-menu");

    if (!menuButton || !menu) {
        console.error("Menu button or menu element not found!");
        return;
    }

    menuButton.addEventListener("click", function () {
        menu.classList.toggle("hidden");
        menuButton.classList.toggle("active"); // เพิ่ม/ลบ class active

        if (!menu.classList.contains("hidden")) {
            menu.style.display = "block"; // แสดงเมนู
        } else {
            menu.style.display = "none"; // ซ่อนเมนู
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const tips = [
      "🏃 Keep moving! Even a short walk can boost your mood.",
      "💧 Stay hydrated! Drink enough water before and after exercise.",
      "😴 Rest is important! Get enough sleep to help your muscles recover.",
      "🥦 Eat healthy! Fuel your body with the right nutrients.",
      "🔥 Consistency is key! Even small workouts add up over time."
    ];
  
    const tipElement = document.getElementById("daily-tip");
    if (tipElement) {
      tipElement.innerText = tips[Math.floor(Math.random() * tips.length)];
    }
  });
  

    // 🔹 ปุ่มเริ่มออกกำลังกาย
    const startWorkoutBtn = document.getElementById("start-workout-btn");

    startWorkoutBtn.addEventListener("click", function () {
        window.location.href = "/session";

        const getCookie = (name) => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? match[2] : null;
        };
    
        const savedTheme = getCookie("theme") || localStorage.getItem("theme") || "light";
        document.body.setAttribute("data-theme", savedTheme);
    });


    