// ---------- LOGIN CREDENTIALS ----------
// (Handled by backend, so no hardcoded credentials here)

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

// ---------- PROFILE (Dynamic with Backend) ----------
document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("fullName")) {
    try {
      showLoadingState();

      const email = sessionStorage.getItem("otpEmail");
      if (!email) throw new Error("No email found in session. Please login again.");

      const response = await fetch("http://localhost:8000/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include"
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.success && data.user) {
        populateProfile(data.user);
        renderAchievements(data.user.achivementSchema || []);
        hideLoadingState();
      } else {
        throw new Error(data.message || "Failed to load profile data");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      showErrorState(err.message);
    }
  }
});

function showLoadingState() {
  document.getElementById("fullName").textContent = "Loading...";
  document.getElementById("designation").textContent = "Loading...";
  document.getElementById("department").textContent = "Loading...";
}
function hideLoadingState() { console.log("Profile loaded successfully"); }
function showErrorState(errorMessage) {
  document.getElementById("fullName").textContent = "Error loading profile";
  document.getElementById("designation").textContent = errorMessage;
}

// ---------- REDIRECT TO ACHIEVEMENTS ----------
const achievementBtn = document.getElementById("Achievement");
if (achievementBtn) {
  achievementBtn.addEventListener("click", function () {
    window.location.href = "achievement.html";
  });
}

// ---------- REDIRECT TO NEWUSER ----------
const addUserBtn = document.getElementById("addUser");
if (addUserBtn) {
  addUserBtn.addEventListener("click", function () {
    window.location.href = "upload.html";
  });
}

// ---------- ACHIEVEMENTS (API Driven) ----------
async function fetchAchievements() {
  try {
    const res = await fetch("http://localhost:8000/achievement"); // backend route
    const achievements = await res.json();

    const container = document.getElementById("achievements");
    if (!container) return;
    container.innerHTML = "";

    if (achievements.length > 0) {
      achievements.forEach(ach => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <h2><a href="achievement.html?id=${ach._id}" target="_blank">${ach.title}</a></h2>
          <span class="badge">${ach.achivementType}</span>
          <p class="info">${ach.description || "No description available."}</p>
        `;

        container.appendChild(card);
      });
    } else {
      container.innerHTML = `<p class="empty">No achievements available.</p>`;
    }
  } catch (err) {
    console.error("Error fetching achievements:", err);
  }
}

// Load achievements on page load
window.onload = fetchAchievements;

// ---------- USER UPLOAD SCRIPT ----------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(form);

    try {
      const res = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        body: formData, // formData handles text + file uploads
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      alert("✅ User uploaded successfully!");
      console.log("Server Response:", data);

      // Reset form after success
      form.reset();
    } catch (err) {
      console.error("Error uploading user:", err);
      alert("❌ Failed to upload user. Please try again.");
    }
  });
});

