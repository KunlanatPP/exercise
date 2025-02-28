document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ history.js Loaded");

    const filterDays = document.getElementById("filterDays");
    const searchDate = document.getElementById("searchDate");
    const searchBtn = document.getElementById("searchBtn");
    const historyTableBody = document.getElementById("history-table-body");

    function displayHistory() {
        document.querySelectorAll(".delete-account-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const sessionId = event.target.getAttribute("data-id");
                if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเซสชันนี้?")) {
                    await deleteHistory(sessionId);
                }
            });
        });
    }

    async function deleteHistory(sessionId) {
        try {
            const response = await fetch(`/history/${sessionId}`, { method: "DELETE" });
            const result = await response.json();
            console.log("✅ Delete response:", result);

            if (response.ok) {
                alert("✅ ลบเซสชันสำเร็จ!");
                document.querySelector(`button[data-id="${sessionId}"]`).closest("tr").remove();
            } else {
                alert("❌ ไม่สามารถลบได้: " + result.message);
            }
        } catch (error) {
            console.error("❌ Error deleting session:", error);
            alert("❌ ไม่สามารถลบได้");
        }
    }

    filterDays.addEventListener("change", function () {
        window.location.href = `/history?days=${filterDays.value}`;
    });

    searchBtn.addEventListener("click", function () {
        if (!searchDate.value) {
            alert("❌ กรุณาเลือกวันที่ก่อนกดค้นหา");
            return;
        }
        window.location.href = `/history?searchDate=${searchDate.value}`;
    });

    displayHistory();
    
    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    const savedTheme = getCookie("theme") || localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
});
