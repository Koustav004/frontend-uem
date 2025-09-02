// ---------- LOGIN CREDENTIALS ----------
// (Handled by backend, so no hardcoded credentials here)

// ---------- LOGIN PAGE LOGIC ----------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const message = document.getElementById("message");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // Send request to backend API
      const response = await fetch("/requestlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save role for OTP step
        localStorage.setItem("role", role);

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

// Store generated OTP (fallback for frontend-only mode)
let generatedOTP = null;

// Function to generate random 4-digit OTP (local fallback)
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Handle "Get OTP" button click
if (getOtpBtn) {
  getOtpBtn.addEventListener("click", async () => {
    try {
      // ---- Call backend API ----
      const res = await fetch("/getotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Store backend OTP (⚠️ only for testing/demo)
          generatedOTP = data.otp;
          alert("Your OTP is: " + data.otp); // Replace with SMS/Email API later
          otpMessage.style.color = "green";
          otpMessage.textContent = "OTP has been sent!";
        }
      } else {
        throw new Error("Failed to fetch OTP from server");
      }
    } catch (err) {
      console.warn("Backend not available, using local OTP generator.");
      // ---- Fallback to frontend OTP ----
      generatedOTP = generateOTP();
      alert("Your OTP is: " + generatedOTP);
      otpMessage.style.color = "green";
      otpMessage.textContent = "OTP has been sent! (Local)";
    }
  });
}

// Handle OTP verification
if (otpForm) {
  otpForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const role = localStorage.getItem("role");
    const enteredOTP = otpInput.value.trim();

    try {
      // ---- Verify via backend API ----
      const res = await fetch("/verifyotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: enteredOTP })
      });

      if (res.ok) {
        const data = await res.json();
        otpMessage.textContent = data.message;
        otpMessage.style.color = data.success ? "green" : "red";

        if (data.success) {
          setTimeout(() => {
            if (role === "admin") {
              window.location.href = "adminDashboard.html";
            } else {
              window.location.href = "userDashboard.html";
            }
          }, 1000);
        }
      } else {
        throw new Error("Failed to verify OTP with server");
      }
    } catch (err) {
      console.warn("Backend not available, using local OTP check.");
      // ---- Fallback to frontend OTP check ----
      if (enteredOTP === generatedOTP && generatedOTP !== null) {
        otpMessage.style.color = "green";
        otpMessage.textContent = "OTP Verified ✅ Redirecting...";
        setTimeout(() => {
          if (role === "admin") {
            window.location.href = "adminDashboard.html";
          } else {
            window.location.href = "userDashboard.html";
          }
        }, 1000);
      } else {
        otpMessage.style.color = "red";
        otpMessage.textContent = "Invalid OTP ❌";
      }
    }
  });
}


// Handle OTP verification
if (otpForm) {
  otpForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const enteredOTP = otpInput.value.trim();
    const role = localStorage.getItem("role");

    if (enteredOTP === generatedOTP && generatedOTP !== null) {
      otpMessage.style.color = "green";
      otpMessage.textContent = "OTP Verified ✅ Redirecting...";

      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "adminDashboard.html";
        } else {
          window.location.href = "userDashboard.html";
        }
      }, 1000);
    } else {
      otpMessage.style.color = "red";
      otpMessage.textContent = "Invalid OTP ❌";
    }
  });
}

// Auto render previous users + admin profile on dashboard load
window.onload = () => {
  renderAddedUsers();
  loadAdminProfile();
};
// ---------- PROFILE (Dynamic) ----------


document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Show loading state
        showLoadingState();

        // Get the email from sessionStorage
        const email = sessionStorage.getItem("otpEmail");

        if (!email) {
            throw new Error("No email found in session. Please login again.");
        }

        console.log("Making API call at:", new Date().toISOString());

        // Send email in request body using POST
        const response = await fetch("http://localhost:8000/auth/profile", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.user) {
            populateProfile(data.user);
            hideLoadingState();
        } else {
            throw new Error(data.message || "Failed to load profile data");
        }

    } catch (err) {
        console.error("Error fetching profile:", err);
        showErrorState(err.message);
    }
});

function showLoadingState() {
    // Show loading indicators
    document.getElementById("fullName").textContent = "Loading...";
    document.getElementById("designation").textContent = "Loading...";
    document.getElementById("department").textContent = "Loading...";
}

function hideLoadingState() {
    // Loading state will be replaced by actual data
    console.log("Profile loaded successfully");
}

function showErrorState(errorMessage) {
    document.getElementById("fullName").textContent = "Error loading profile";
    document.getElementById("designation").textContent = errorMessage;

    // You could also show a proper error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = "background: #fee; color: #c33; padding: 10px; margin: 10px; border-radius: 4px;";
    errorDiv.textContent = `Error: ${errorMessage}. Please refresh the page or contact support.`;
    document.querySelector(".profile-container").prepend(errorDiv);
}

function populateProfile(user) {
    // Update department
    document.getElementById("department").textContent = user.department || "Department Name";

    // Update name - handle middle name properly
    const middleName = user.middleName ? ` ${user.middleName} ` : " ";
    document.getElementById("fullName").textContent = `${user.firstName || "Guest"}${middleName}${user.lastName || "User"}`;

    // Update designation/role
    document.getElementById("designation").textContent = user.role || "Faculty";

    // onine image pull if no image was there
    function getDefaultAvatar(firstName = "User", lastName = "") {
        const name = `${firstName} ${lastName}`.trim() || "User";
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=150&background=007bff&color=ffffff`;
    }

    // Update profile picture
    const profilePic = document.getElementById("profilePic");
    profilePic.src = user.profilePicURL || getDefaultAvatar(user.firstName, user.lastName);

    profilePic.onerror = () => {
        profilePic.src = getDefaultAvatar(user.firstName, user.lastName);
    };

    // Update address
    if (user.address && user.address.length > 0) {
        const addr = user.address[0];
        const addressParts = [
            addr.address_line_one,
            addr.district,
            addr.state,
            addr.country
        ].filter(part => part); // Remove empty parts

        document.getElementById("address").textContent = addressParts.join(", ");
    } else {
        document.getElementById("address").textContent = "Address not provided";
    }

    // Update contact info
    let contactInfo = "";

    // Handle email - check if it's an array or string
    if (user.email) {
        const emails = Array.isArray(user.email) ? user.email : [user.email];
        contactInfo += `Email: ${emails.join(", ")}`;
    }

    // Handle phone numbers
    if (user.phone && user.phone.length > 0) {
        const phones = user.phone.map(p => `+${p.countryCode}-${p.mobileNumber}`);
        contactInfo += contactInfo ? ` | Phone: ${phones.join(", ")}` : `Phone: ${phones.join(", ")}`;
    }

    document.getElementById("contact").textContent = contactInfo || "Contact info not provided";

    // Update date of birth
    if (user.date_of_birth) {
        const dob = new Date(user.date_of_birth);
        document.getElementById("dob").textContent = `Date of Birth: ${dob.toLocaleDateString()}`;
    } else {
        document.getElementById("dob").textContent = "Date of Birth: Not provided";
    }

    // Update gender
    document.getElementById("gender").textContent = `Gender: ${user.gender || "Prefer not to say"}`;

    // Update social links
    const githubElement = document.getElementById("github");
    if (user.githubURL) {
        githubElement.innerHTML = `<a href="${user.githubURL}" target="_blank" rel="noopener noreferrer">GitHub</a>`;
    } else {
        githubElement.innerHTML = "";
    }

    const linkedinElement = document.getElementById("linkedin");
    if (user.linkdinURL) {
        linkedinElement.innerHTML = `<a href="${user.linkdinURL}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`;
    } else {
        linkedinElement.innerHTML = "";
    }

    // Update achievements
    const achievementsList = document.getElementById("achievementsList");
    achievementsList.innerHTML = ""; // Clear existing content

    if (user.achivementSchema && user.achivementSchema.length > 0) {
        user.achivementSchema.forEach(achievement => {
            const li = document.createElement("li");
            li.textContent = achievement.title || "Untitled Achievement";
            achievementsList.appendChild(li);
        });
    } else {
        const li = document.createElement("li");
        li.textContent = "No achievements yet.";
        li.style.fontStyle = "italic";
        li.style.color = "#666";
        achievementsList.appendChild(li);
    }
}

// Optional: Add a retry function
function retryLoadProfile() {
    location.reload(); // Simple refresh, or you could call the load function again
}

const achievementsList = document.getElementById("achievementsList");
const addBtn = document.getElementById("addAchievementBtn");
const removeBtn = document.getElementById("removeAchievementBtn");

// Add achievement
addBtn.addEventListener("click", () => {
    const newAchievement = prompt("Enter a new achievement:");
    if (newAchievement && newAchievement.trim() !== "") {
        const li = document.createElement("li");
        li.textContent = newAchievement;
        achievementsList.appendChild(li);
    }
});

// Remove last achievement
removeBtn.addEventListener("click", () => {
    if (achievementsList.lastElementChild) {
        achievementsList.removeChild(achievementsList.lastElementChild);
    } else {
        alert("No achievements to remove!");
    }
});
