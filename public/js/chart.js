document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("exerciseChart").getContext("2d");

  // 🔹 ฟังก์ชันกำหนดสีของแท่งกราฟตามระดับความเข้มข้น
  const getExerciseLevelColor = (minutes) => {
      if (minutes <= 10) return "rgba(255, 99, 132, 0.7)"; // 🔴 น้อย
      if (minutes <= 30) return "rgba(255, 205, 86, 0.7)"; // 🟡 ปานกลาง
      if (minutes <= 60) return "rgba(54, 162, 235, 0.7)"; // 🔵 สูง
      return "rgba(75, 192, 192, 0.7)"; // 🟢 สูงมาก
  };

  // 🔹 แปลงข้อมูลจากเซิร์ฟเวอร์ให้เป็นรูปแบบที่ใช้งานได้กับ Chart.js
  const colors = chartData.data.map(value => getExerciseLevelColor(value));

  new Chart(ctx, {
      type: "bar",
      data: {
          labels: chartData.labels,
          datasets: [{
              label: "Total Exercise Time (mins)",
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
                  font: {
                      size: 16
                  }
              },
              tooltip: {
                  callbacks: {
                      label: function (tooltipItem) {
                          return ` ${tooltipItem.raw} mins - ${tooltipItem.label}`;
                      }
                  }
              }
          },
          scales: {
              y: {
                  beginAtZero: true,
                  title: {
                      display: true,
                      text: "Minutes"
                  }
              },
              x: {
                  title: {
                      display: true,
                      text: "Date"
                  }
              }
          }
      }
  });
});
