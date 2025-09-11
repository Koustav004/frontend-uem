
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
