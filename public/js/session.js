async function getCurrentUserId() {
  try {
    const response = await fetch("/session/current-user", { method: "GET", credentials: "include" });
    const data = await response.json();

    if (!response.ok) {
      console.warn("❌ Failed to fetch user ID:", data.message);
      return null;
    }

    if (data.user_id) {
      console.log("✅ User ID:", data.user_id);
      return data.user_id;
    } else {
      console.warn("❌ No user ID found.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching user ID:", error);
    return null;
  }
}


let stats = {
  sessionStartTime: null,
  exercises: {
    Plank: { count: 0, duration: 0 },
    "Jumping Jack": { count: 0 },
    Bridge: { count: 0 },
    "Push-Up": { count: 0 },
    "Sit-Up": { count: 0 },
  },
};

let isSessionActive = false;
let camera;
let pose;
let sessionStartTime = null;
let detectedPose = null;
let lastDetectedPose = null; // สำหรับเก็บท่าจาก frame ก่อนหน้า

// เมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", function () {
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

const savedTheme = getCookie("theme") || localStorage.getItem("theme") || "light";
document.body.setAttribute("data-theme", savedTheme);
  console.log("✅ session.js Loaded");

  const stopButton = document.getElementById("end-session");
  stopButton.disabled = false;

  startSession();

  stopButton.addEventListener("click", function () {
    console.log("🛑 Stop Button Clicked");
    endSession();
    stopButton.disabled = true;
  });
});

// ฟังก์ชันเริ่ม Session
function startSession() {
  console.log("📌 Exercise Session Started");
  isSessionActive = true;
  sessionStartTime = Date.now(); // บันทึกเวลาเริ่มต้นของ Session

  updateSessionTime(); // เริ่มจับเวลา

  const videoElement = document.getElementById("webcam");
  initializePoseDetection(videoElement);
}

// ฟังก์ชันอัปเดตเวลาของ Session ทุกวินาที
function updateSessionTime() {
  if (!isSessionActive || !sessionStartTime) return;

  const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
  document.getElementById("session-time").textContent = elapsedTime;

  setTimeout(updateSessionTime, 1000);
}

// ฟังก์ชันเริ่มกล้องและส่งภาพให้ Mediapipe ประมวลผล
async function startCamera(videoElement, pose) {
  try {
    console.log("📷 Opening Camera...");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
    videoElement.srcObject = stream;
    console.log("✅ Camera Ready");

    sessionStartTime = Date.now();
    updateSessionTime();

    camera = new Camera(videoElement, {
      onFrame: async () => {
        if (isSessionActive) {
          await pose.send({ image: videoElement });
        }
      },
      width: 1280,
      height: 720,
    });

    camera.start();
  } catch (error) {
    console.error("❌ Camera Error:", error);
    alert("ไม่สามารถเปิดกล้องได้: " + error.message);
  }
}

// ฟังก์ชันส่งข้อมูล landmarks ไปยัง Flask API เพื่อตรวจจับท่า
async function sendLandmarksToAPI(landmarks) {
  try {
    if (!landmarks || landmarks.length === 0) {
      console.warn("⚠️ No landmarks data, skipping API request.");
      return;
    }

    console.log("📌 Sending landmarks to server:", landmarks);

    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        landmarks: landmarks,
        pose_type: "Push-Up" // หรือค่าที่เหมาะสมกับการออกกำลังกายใน session นี้
      }),
    });
    
    const data = await response.json();

    if (data.prediction) {
      // รับค่าท่าปัจจุบันจากผลลัพธ์
      let currentPose = data.prediction[0];
      document.getElementById("current-pose").textContent = currentPose;

      // เพิ่ม rep เฉพาะเมื่อท่าปัจจุบันเปลี่ยนจาก frame ก่อนหน้า
      if (currentPose !== lastDetectedPose && stats.exercises[currentPose]) {
        stats.exercises[currentPose].count++;
      }
      // อัปเดต lastDetectedPose ให้เป็นท่าปัจจุบัน
      lastDetectedPose = currentPose;
    }
  } catch (error) {
    console.error("❌ Error sending landmarks:", error);
  }
}

// ฟังก์ชันหยุด Session และสรุปผล
function endSession() {
  console.log("📌 Stopping Exercise Session...");
  isSessionActive = false;
  clearTimeout(updateSessionTime);

  if (camera) {
    camera.stop();
    camera = null;
  }

  let videoElement = document.getElementById("webcam");
  if (videoElement.srcObject) {
    let tracks = videoElement.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    videoElement.srcObject = null;
  }

  if (pose) {
    pose = null;
  }

  let totalSessionTime = sessionStartTime
    ? Math.floor((Date.now() - sessionStartTime) / 1000)
    : 0;

  document.getElementById("stats-section").style.display = "none";

  showSummary(totalSessionTime);
  saveSessionData(totalSessionTime); // เรียกฟังก์ชันบันทึกข้อมูลเซสชัน

  console.log("📌 Session Ended Successfully!");
}

// ฟังก์ชันแสดงสรุปผลหลังจากหยุดเซสชัน
// ฟังก์ชันแสดงสรุปผลหลังจากหยุดเซสชัน
function showSummary(totalSessionTime) {
  document.getElementById("summary-section").style.display = "block";
  document.getElementById("time-summary").textContent = `Total Time: ${totalSessionTime} seconds`;

  let summaryList = document.getElementById("exercise-summary");
  summaryList.innerHTML = "";

  Object.keys(stats.exercises).forEach((exercise) => {
    let count = stats.exercises[exercise].count;
    if (count > 0) {
      let listItem = document.createElement("li");
      listItem.textContent = `${exercise}: ${count} times`;
      summaryList.appendChild(listItem);
    }
  });

  // ✅ เช็คว่าเป้าหมายสำเร็จหรือไม่
  checkGoalCompletion(totalSessionTime);
}

// ฟังก์ชันเช็คว่าเป้าหมายสำเร็จหรือไม่
async function checkGoalCompletion(totalSessionTime) {
  try {
    const response = await fetch("/session/user-goals", { method: "GET", credentials: "include" });
    const data = await response.json();

    if (!data || !data.daily_time) {
      document.getElementById("goal-summary").textContent = "⚠️ ไม่สามารถดึงข้อมูลเป้าหมายได้";
      return;
    }

    const goalTime = data.daily_time;
    const isGoalMet = totalSessionTime >= goalTime;

    document.getElementById("goal-summary").textContent = isGoalMet 
      ? "🎉 เป้าหมายสำเร็จ! ยอดเยี่ยมมาก!" 
      : `⏳ คุณออกกำลังกายไป ${totalSessionTime} วินาที จากเป้าหมาย ${goalTime} วินาที`;

  } catch (error) {
    console.error("❌ Error fetching goal data:", error);
    document.getElementById("goal-summary").textContent = "⚠️ เกิดข้อผิดพลาดในการดึงข้อมูลเป้าหมาย";
  }
}


// ฟังก์ชันส่งข้อมูลเซสชันไปยัง backend เพื่อบันทึก
async function saveSessionData(totalSessionTime) {
  const user_id = await getCurrentUserId();

  if (!user_id) {
    alert("❌ ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
    return;
  }

  const exercisesArray = Object.keys(stats.exercises).map((key) => ({
    name: key,
    count: stats.exercises[key].count || 0,
    duration: stats.exercises[key].duration || 0
  }));

  const data = {
    user_id: user_id,
    start_time: new Date(sessionStartTime).toISOString(),
    end_time: new Date().toISOString(),
    total_time: totalSessionTime,
    exercises: exercisesArray
  };

  fetch("http://localhost:4000/session/end", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log("✅ Session saved successfully:", result);
    if (result.session_id) {
      localStorage.setItem("lastSessionId", result.session_id); // ✅ เก็บ session_id
    }
  })
  .catch(error => console.error("❌ Error saving session data:", error));
}




// ฟังก์ชันตั้งค่าและเริ่มการตรวจจับท่าด้วย Mediapipe
function initializePoseDetection(videoElement) {
  pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8,
  });

  pose.onResults(async (results) => {
    if (!results.poseLandmarks || !isSessionActive) {
      return;
    }

    const canvasElement = document.getElementById("overlay");
    const canvasCtx = canvasElement.getContext("2d");

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    drawLandmarks(canvasCtx, results.poseLandmarks, { color: "red", radius: 5 });
    drawSkeleton(canvasCtx, results.poseLandmarks, { color: "blue", lineWidth: 3 });

    // แปลง landmarks เป็น array ของค่า x, y, z
    const landmarks = results.poseLandmarks.map(lm => [lm.x, lm.y, lm.z]).flat();

    sendLandmarksToAPI(landmarks);
  });

  startCamera(videoElement, pose);
}

// ฟังก์ชันวาดโครงกระดูก (skeleton)
function drawSkeleton(ctx, landmarks, { color = "blue", lineWidth = 3 } = {}) {
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 7],
    [0, 4], [4, 5], [5, 6], [6, 8],
    [9, 10], [11, 12], [11, 13], [13, 15],
    [15, 17], [12, 14], [14, 16], [16, 18],
    [11, 23], [12, 24], [23, 25], [25, 27],
    [27, 29], [24, 26], [26, 28], [28, 30]
  ];

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const [start, end] of connections) {
    if (landmarks[start] && landmarks[end]) {
      ctx.beginPath();
      ctx.moveTo(landmarks[start].x * ctx.canvas.width, landmarks[start].y * ctx.canvas.height);
      ctx.lineTo(landmarks[end].x * ctx.canvas.width, landmarks[end].y * ctx.canvas.height);
      ctx.stroke();
    }
  }
}
