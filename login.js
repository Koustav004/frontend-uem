// ---------- LOGIN PAGE LOGIC ----------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const message = document.getElementById("message");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:8000/auth/requestlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem("otpEmail", email);

        message.style.color = "green";
        message.textContent = "Login Successful ✅ Redirecting to OTP...";

        setTimeout(() => {
          window.location.href = "otp.html";
        }, 1000);
      } else {
        message.style.color = "red";
        message.textContent = data.message || "Invalid credentials ❌";
      }
    } catch (error) {
      console.error("Error:", error);
      message.style.color = "red";
      message.textContent = "Something went wrong. Please try again!";
    }
  });
}