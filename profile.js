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
