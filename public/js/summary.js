document.addEventListener('DOMContentLoaded', () => {
    let chartType = 'bar'; // ค่าเริ่มต้นเป็น Bar Chart
    let exerciseChart;
    const ctx = document.getElementById('exerciseChart').getContext('2d');

    // 🔹 ฟังก์ชันกำหนดสีของแท่งกราฟตามระดับความเข้มข้น
    const getExerciseLevelColor = (minutes) => {
        if (minutes <= 10) return 'rgba(255, 99, 132, 0.7)';   // 🔴 ต่ำมาก
        if (minutes <= 30) return 'rgba(255, 205, 86, 0.7)';   // 🟡 ปานกลาง
        if (minutes <= 60) return 'rgba(54, 162, 235, 0.7)';   // 🔵 สูง
        return 'rgba(75, 192, 192, 0.7)';                     // 🟢 สูงมาก
    };

    // 🔹 ฟังก์ชันสร้างกราฟ
    function createChart(chartData) {
        if (!chartData || !chartData.labels || !chartData.data || chartData.data.length === 0) {
            console.error("Chart Data is missing or empty:", chartData);
            document.getElementById("chart-container").innerHTML = "<p>No exercise data available.</p>";
            return;
        }

        if (exerciseChart) {
            exerciseChart.destroy(); // ลบกราฟเก่า ก่อนสร้างใหม่
        }

        const colors = chartData.data.map(value => getExerciseLevelColor(value));

        exerciseChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Total Exercise Time (mins)',
                    data: chartData.data,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace("0.7", "1")),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Exercise Summary (Level by Color)",
                        font: { size: 16 }
                    },
                    tooltip: { // ✅ เพิ่ม Tooltip ให้ดูค่ารายละเอียด
                        callbacks: {
                            label: function(tooltipItem) {
                                return `Time: ${tooltipItem.raw} mins`;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // 🔹 ฟังก์ชันโหลดข้อมูลจาก API
    function fetchData(days) {
        fetch(`/summary/data?days=${days}`)
            .then(response => response.json())
            .then(data => {
                if (!data || !data.labels.length) {
                    document.getElementById('totalWorkoutTime').innerText = 'No workout data available';
                    return;
                }

                document.getElementById('totalWorkoutTime').innerText = `Total Workout Time: ${data.totalWorkoutTime} minutes`;
                createChart({ labels: data.labels, data: data.workoutTimes });
            })
            .catch(error => {
                console.error("❌ Error fetching summary data:", error);
                document.getElementById('totalWorkoutTime').innerText = 'Error loading workout data';
            });
    }

    // 🔹 ฟังก์ชันเปลี่ยนประเภทกราฟ
    document.getElementById("chart-toggle").addEventListener("change", (event) => {
        chartType = event.target.value;
        fetchData(document.getElementById("daysRange").value);
    });

    // 🔹 ฟังก์ชันเปลี่ยนช่วงเวลา
    document.getElementById("daysRange").addEventListener("change", (event) => {
        fetchData(event.target.value);
    });

    // 🔹 โหลดข้อมูล 7 วันล่าสุดเป็นค่าเริ่มต้น
    fetchData(7);

    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    const savedTheme = getCookie("theme") || localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
});
