// ---------- LOGIN CREDENTIALS ----------
// (Handled by backend, so no hardcoded credentials here)




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

