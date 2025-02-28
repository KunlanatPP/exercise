document.addEventListener("DOMContentLoaded", () => {
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("remember-me");
    const errorMessage = document.getElementById("error-message");

    if (sessionStorage.getItem("rememberedEmail")) {
        emailField.value = sessionStorage.getItem("rememberedEmail");
        rememberMeCheckbox.checked = true;
    }

    document.getElementById("login-form").addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = emailField.value.trim();
        const password = passwordField.value.trim();

        if (!email || !password) {
            showError("⚠️ Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include" // ✅ ต้องใช้ credentials เพื่อให้ Cookies ทำงาน
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed. Please try again.");
            }

            if (rememberMeCheckbox.checked) {
                sessionStorage.setItem("rememberedEmail", email);
            } else {
                sessionStorage.removeItem("rememberedEmail");
            }

            window.location.href = data.redirectTo;

        } catch (error) {
            showError(error.message);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }

     const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    const savedTheme = getCookie("theme") || localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
});
