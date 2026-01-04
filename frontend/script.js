// ---------------- STATE ----------------
let transportImpact = 0;
let plasticImpact = 0;
let electricityImpact = 0;
let streakDays = Number(localStorage.getItem("ecoStreak")) || 1;


// ---------------- TRANSPORT ----------------
function addTransport() {
  const vehicle = document.getElementById("vehicle").value;
  const distance = Number(document.getElementById("distance").value);

  const factors = {
    walking: 0,
    cycling: 0,
    bike: 1,
    car: 3
  };

  transportImpact += (factors[vehicle] || 0) * distance;
  updateScore();
}

// ---------------- PLASTIC ----------------
function addPlastic() {
  const impact = Number(document.getElementById("plasticType").value);
  plasticImpact += impact;
  updateScore();
}

// ---------------- ELECTRICITY ----------------
function addElectricity() {
  const unitRate = Number(document.getElementById("appliance").value);
  const hours = Number(document.getElementById("hours").value);

  electricityImpact += unitRate * hours * 10;
  updateScore();
}

// ---------------- SCORE LOGIC ----------------
function updateScore() {
  const totalImpact = transportImpact + plasticImpact + electricityImpact;
  const score = Math.max(0, Math.round(100 - totalImpact));

  document.getElementById("score").innerText = score;

  let feedback = "🌱 Eco Champion";
  if (score < 70) feedback = "🙂 Eco Saver";
  if (score < 40) feedback = "🚨 High Impact";

  document.getElementById("feedback").innerText = feedback;
  // 🔄 update category breakdown too
  updateCategoryBreakdown();
}

function updateCategoryBreakdown() {
  // Convert impacts → category scores
  const transportScore = Math.max(0, Math.round(100 - transportImpact));
  const plasticScore = Math.max(0, Math.round(100 - plasticImpact));
  const electricityScore = Math.max(0, Math.round(100 - electricityImpact));

  // Update numbers
  document.getElementById("transportScore").innerText = transportScore;
  document.getElementById("plasticScore").innerText = plasticScore;
  document.getElementById("electricityScore").innerText = electricityScore;

  // Update bar widths
  document.getElementById("transportBar").style.width = transportScore + "%";
  document.getElementById("plasticBar").style.width = plasticScore + "%";
  document.getElementById("electricityBar").style.width = electricityScore + "%";
}


// ---------------- SAVE / RESET ----------------
function saveProgress() {
  const today = new Date().toDateString();
  const lastSaved = localStorage.getItem("lastEcoDate");

  document.getElementById("ecoTipText").innerText = "Fetching personalized eco tip...";

  if (lastSaved !== today) {
    streakDays++;
    localStorage.setItem("ecoStreak", streakDays);
    localStorage.setItem("lastEcoDate", today);
  }

  localStorage.setItem("ecoScore", document.getElementById("score").innerText);
  updateStreakUI();

  alert("✅ Today's progress saved!");

  fetchEcoTip("Give me a personalized eco tip based on my EcoScore");
  updateWeeklyTrend(Number(document.getElementById("score").innerText));
}


function resetAll() {
  transportImpact = plasticImpact = electricityImpact = 0;
  streakDays = 1;

  localStorage.setItem("ecoStreak", streakDays);
  updateScore();
  updateStreakUI();
  updateCategoryBreakdown();
}


//-----------------Streak counter-----------------
function updateStreakUI() {
  document.getElementById("streakDays").innerText = streakDays;

  const progressPercent = Math.min((streakDays / 7) * 100, 100);
  document.getElementById("streakProgress").style.width = progressPercent + "%";
}


// ---------------- VOICE ASSISTANT ----------------
async function fetchEcoTip(query, speakOut = false) {
  try {
    const res = await fetch(`http://localhost:3001/?q=${encodeURIComponent(query)}`);
    const text = await res.text();

    // 🟢 Update Eco Tips card
    const tipEl = document.getElementById("ecoTipText");
    if (tipEl) tipEl.innerText = text;

    // 🔊 Speak only if required
    if (speakOut) speak(text);

    return text;
  } catch (err) {
    console.error(err);
    if (speakOut) speak("Sorry, I couldn't fetch an eco tip.");
  }
}

function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.onresult = function (event) {
    const query = event.results[0][0].transcript;

    // Same response → voice + Eco Tips card
    fetchEcoTip(query, true);
  };

  recognition.start();
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

updateStreakUI();

// ===============================
// 📈 WEEKLY TREND LOGIC
// ===============================

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let weeklyData = JSON.parse(localStorage.getItem("weeklyEcoScores")) || {
  Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
};

const ctx = document.getElementById("weeklyChart");

const weeklyChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: WEEK_DAYS,
    datasets: [{
      data: WEEK_DAYS.map(d => weeklyData[d]),
      borderColor: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.15)",
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#22c55e"
    }]
  },
  options: {
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 25 }
      }
    }
  }
});

// Update weekly graph when saving
function updateWeeklyTrend(score) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  weeklyData[today] = score;

  localStorage.setItem("weeklyEcoScores", JSON.stringify(weeklyData));

  weeklyChart.data.datasets[0].data = WEEK_DAYS.map(d => weeklyData[d]);
  weeklyChart.update();

  // Average
  const values = Object.values(weeklyData).filter(v => v > 0);
  const avg = values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 100;

  document.getElementById("weeklyAverage").innerText = avg;
}
