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


// ---------- DASHBOARD LOGIC ----------
// Dummy Users DB
const usersDB = {
  "101": { id: "101", name: "Alice Johnson", email: "alice@example.com" },
  "102": { id: "102", name: "Bob Smith", email: "bob@example.com" },
  "103": { id: "103", name: "Charlie Brown", email: "charlie@example.com" }
};

// Load previous users from localStorage
let addedUsers = JSON.parse(localStorage.getItem("addedUsers")) || [];

// Search user by ID
function searchUser() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const searchId = searchInput.value.trim();
  const userDetails = document.getElementById("userDetails");

  if (usersDB[searchId]) {
    const user = usersDB[searchId];
    userDetails.innerHTML = `
      <h3>${user.name}</h3>
      <p>ID: ${user.id}</p>
      <p>Email: ${user.email}</p>
      <button onclick="addUser('${user.id}')">Add User</button>
    `;
    userDetails.classList.remove("hidden");
  } else {
    userDetails.innerHTML = "<p style='color:red;'>User not found!</p>";
    userDetails.classList.remove("hidden");
  }
}

// Add user to list
function addUser(userId) {
  const user = usersDB[userId];
  if (!addedUsers.find(u => u.id === user.id)) {
    addedUsers.push(user);
    saveUsers();
    renderAddedUsers();
  }
  document.getElementById("userDetails").classList.add("hidden");
  document.getElementById("searchInput").value = "";
}

// Remove user from list
function removeUser(userId) {
  addedUsers = addedUsers.filter(u => u.id !== userId);
  saveUsers();
  renderAddedUsers();
}

// Save users to localStorage
function saveUsers() {
  localStorage.setItem("addedUsers", JSON.stringify(addedUsers));
}

// Render users (current + previous)
function renderAddedUsers() {
  const addedUsersDiv = document.getElementById("addedUsers");
  if (!addedUsersDiv) return;

  addedUsersDiv.innerHTML = "";

  if (addedUsers.length === 0) {
    addedUsersDiv.innerHTML = "<p>No users added yet.</p>";
    return;
  }

  addedUsers.forEach(user => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <h3>${user.name}</h3>
      <p>Email: ${user.email}</p>
      <button class="remove-btn" onclick="removeUser('${user.id}')">Remove</button>
    `;
    addedUsersDiv.appendChild(div);
  });
}

// ---------- ADMIN PROFILE (Dynamic) ----------
const admin = {
  name: "John Doe",
  email: "admin@uem.edu.in",
  phone: "+91 9876543210",
  userId: "ADM001",
  image: "./assets/images/admin.png"
};

function loadAdminProfile() {
  if (document.getElementById("adminName")) {
    document.getElementById("adminName").textContent = "Admin Name: " + admin.name;
    document.getElementById("adminEmail").textContent = "Email: " + admin.email;
    document.getElementById("adminPhone").textContent = "Phone: " + admin.phone;
    document.getElementById("adminUserId").textContent = "User ID: " + admin.userId;
    document.getElementById("adminImage").src = admin.image;
  }
}

// Auto render previous users + admin profile on dashboard load
window.onload = () => {
  renderAddedUsers();
  loadAdminProfile();
};
