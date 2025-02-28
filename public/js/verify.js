const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");
if (email) {
    document.getElementById("user-email").textContent = email;
}

document.getElementById("resend-verification-btn").addEventListener("click", async () => {
    const response = await fetch("/resend-verification", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }) 
    });

    if (response.ok) {
        document.getElementById("resend-message").style.display = "block";
    } else {
        alert("❌ Error resending verification email. Please try again.");
    }
});


document.getElementById("resend-verification-btn").addEventListener("click", async () => {
    const response = await fetch("/resend-verification", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "<%= email %>" }) 
    });

    if (response.ok) {
        document.getElementById("resend-message").style.display = "block";
    } else {
        alert("❌ Error resending verification email. Please try again.");
    }
});