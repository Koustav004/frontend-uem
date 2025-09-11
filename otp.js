// ---------- OTP LOGIC ----------
const otpForm = document.getElementById("otpForm");
const getOtpBtn = document.getElementById("getOtpBtn");
const otpInput = document.getElementById("otp");
const otpMessage = document.getElementById("otpMessage");

if (getOtpBtn) {
  getOtpBtn.addEventListener("click", async () => {
    try {
      const email = sessionStorage.getItem("otpEmail");
      if (!email) {
        otpMessage.style.color = "red";
        otpMessage.textContent = "No email found. Please login again!";
        return;
      }

      const res = await fetch("http://localhost:8000/auth/getotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        otpMessage.style.color = "green";
        otpMessage.textContent = "OTP has been sent!";
        alert("Your OTP is: " + data.otp);
      } else {
        otpMessage.style.color = "red";
        otpMessage.textContent = data.message || "Failed to send OTP ❌";
      }
    } catch (err) {
      console.error("Error fetching OTP:", err);
      otpMessage.style.color = "red";
      otpMessage.textContent = "Server error while sending OTP ❌";
    }
  });
}

if (otpForm) {
  otpForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = sessionStorage.getItem("otpEmail");
    const enteredOTP = otpInput.value.trim();

    if (!email) {
      otpMessage.style.color = "red";
      otpMessage.textContent = "No email found. Please login again!";
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOTP })
      });

      const data = await res.json();
      otpMessage.textContent = data.message;
      otpMessage.style.color = data.success ? "green" : "red";

      if (res.ok && data.success) {
        localStorage.setItem("jwtToken", data.token);

        const payload = JSON.parse(atob(data.token.split(".")[1]));
        const role = payload.role || "user";

        setTimeout(() => {
          if (role === "admin") {
            window.location.href = "adminDashboard.html";
          } else {
            window.location.href = "profile.html";
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      otpMessage.style.color = "red";
      otpMessage.textContent = "Server error while verifying OTP ❌";
    }
  });
}
