// Dummy credentials
const users = {
  user: { email: "koustavrudra2004@gmail.com", password: "123456" },
  admin: { email: "koustavrudra2004@gmail.com", password: "123456" }
};

// Dummy OTP
const correctOTP = "1234";

// ---------- LOGIN PAGE LOGIC ----------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const message = document.getElementById("message");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (role && email === users[role].email && password === users[role].password) {
      // Save role for OTP verification
      localStorage.setItem("role", role);

      message.style.color = "green";
      message.textContent = "Login Successful ✅ Redirecting to OTP...";

      setTimeout(() => {
        window.location.href = "otp.html";
      }, 1000);
    } else {
      message.style.color = "red";
      message.textContent = "Invalid credentials ❌";
    }
  });
}

// ---------- OTP PAGE LOGIC ----------
const otpForm = document.getElementById("otpForm");
if (otpForm) {
  const otpMessage = document.getElementById("otpMessage");

  otpForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const otp = document.getElementById("otp").value;
    const role = localStorage.getItem("role"); // Retrieve saved role

    if (otp === correctOTP) {
      otpMessage.style.color = "green";
      otpMessage.textContent = "OTP Verified ✅ Redirecting...";

      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "admin_dashboard.html";
        } else {
          window.location.href = "user_dashboard.html";
        }
      }, 1000);
    } else {
      otpMessage.style.color = "red";
      otpMessage.textContent = "Invalid OTP ❌";
    }
  });
}
