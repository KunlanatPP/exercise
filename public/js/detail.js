document.addEventListener("DOMContentLoaded", async () => {
    const sessionId = window.location.pathname.split("/").pop();
    const detailContainer = document.getElementById("sessionDetail");

    try {
        const response = await fetch(`/session/detail/${sessionId}`);
        const data = await response.json();

        if (!response.ok || !data) {
            detailContainer.innerHTML = "<p class='error-message'>❌ Session details not found.</p>";
            return;
        }

        // ✅ แปลงวันที่ & เวลาให้เป็นโซนไทย
        const startDate = new Date(data.start_time).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        const startTime = new Date(data.start_time).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        const endTime = new Date(data.end_time).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        // ✅ คำนวณระยะเวลาการออกกำลังกายใหม่ (จาก end_time - start_time)
        const durationInSeconds = Math.floor((new Date(data.end_time) - new Date(data.start_time)) / 1000);
        const totalMinutes = Math.floor(durationInSeconds / 60);
        const totalSeconds = durationInSeconds % 60;
        const totalDuration = `${totalMinutes}:${totalSeconds.toString().padStart(2, "0")}`;

        detailContainer.innerHTML = `
            <div class="detail-card">
                <p><strong>📅 Date:</strong> ${startDate}</p>
                <p><strong>⏰ Start Time:</strong> ${startTime}</p>
                <p><strong>⏳ End Time:</strong> ${endTime}</p>
                <p><strong>⏳ Total Duration:</strong> ${totalDuration} minutes</p>

                <p><strong>🏃‍♂️ Exercises:</strong></p>
                <ul class="exercise-list">
                    ${data.exercises.map(e => `<li>▪️ ${e.name} - ${e.count ? e.count : "0"} reps</li>`).join('')}
                </ul>
                
            </div>
            <a href="/history" class="back-btn">Back to History</a>
        `;
    } catch (error) {
        console.error("❌ Error fetching session details:", error);
        detailContainer.innerHTML = "<p class='error-message'>❌ Error loading session details.</p>";
    }
    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    const savedTheme = getCookie("theme") || localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
});
