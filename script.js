let selectedVehicle = "lorry";

function selectVehicle(vehicle) {
  selectedVehicle = vehicle;

  // Update active button
  document.querySelectorAll(".vehicle .btn").forEach(btn => {
    btn.classList.remove("btn-success");
    btn.classList.add("btn-outline-success");
  });

  event.target.classList.remove("btn-outline-success");
  event.target.classList.add("btn-success");

  updateImpact();
}

document.getElementById("distance").addEventListener("input", updateImpact);

function updateImpact() {
  const distance = Number(document.getElementById("distance").value);
  const impactText = document.getElementById("impactText");

  if (!distance || distance <= 0) {
    impactText.textContent = "Low Impact";
    impactText.className = "text-success fw-semibold";
    return;
  }

  let impactScore = 0;

  if (selectedVehicle === "bike") {
    impactScore = distance * 0.2;
  } 
  else if (selectedVehicle === "car") {
    impactScore = distance * 1;
  } 
  else if (selectedVehicle === "lorry") {
    impactScore = distance * 3; // High impact
  }

  if (impactScore <= 5) {
    impactText.textContent = "Low Impact 🙂";
    impactText.className = "text-success fw-semibold";
  } 
  else if (impactScore <= 20) {
    impactText.textContent = "Medium Impact ⚠️";
    impactText.className = "text-warning fw-semibold";
  } 
  else {
    impactText.textContent = "High Impact 🚨";
    impactText.className = "text-danger fw-semibold";
  }
}


const cards = document.querySelectorAll(".plastic-card");
const totalImpactEl = document.getElementById("totalImpact");

function updateTotalImpact() {
  let total = 0;
  cards.forEach(card => {
    const impact = parseInt(card.dataset.impact);
    const count = parseInt(card.querySelector(".count").textContent);
    total += impact * count;
  });
  totalImpactEl.textContent = total;
}

cards.forEach(card => {
  const minusBtn = card.querySelector(".minus");
  const plusBtn = card.querySelector(".plus");
  const countEl = card.querySelector(".count");

  plusBtn.addEventListener("click", () => {
    countEl.textContent = parseInt(countEl.textContent) + 1;
    updateTotalImpact();
  });

  minusBtn.addEventListener("click", () => {
    let current = parseInt(countEl.textContent);
    if (current > 0) {
      countEl.textContent = current - 1;
      updateTotalImpact();
    }
  });
});

let selectedPower = 10;
let hoursUsed = 1;
let electricityTotal = 0;

const applianceCards = document.querySelectorAll(".appliance-card");
const powerInput = document.querySelector(".input");
const hoursValue = document.querySelector(".hours-control span");
const calcValue = document.querySelector(".calc-value");
const addBtn = document.querySelector(".add-btn");
const electricityTotalEl = document.getElementById("electricityTotal");

function updateKwh() {
  const kwh = (selectedPower * hoursUsed) / 1000;
  calcValue.textContent = kwh.toFixed(3) + " kWh";
}

applianceCards.forEach(card => {
  card.addEventListener("click", () => {
    applianceCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedPower = parseInt(card.querySelector(".appliance-power").textContent);
    powerInput.textContent = selectedPower;
    updateKwh();
  });
});

document.querySelectorAll(".hours-control button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.textContent === "+") hoursUsed++;
    else if (btn.textContent === "−" && hoursUsed > 1) hoursUsed--;
    hoursValue.textContent = hoursUsed;
    updateKwh();
  });
});

addBtn.addEventListener("click", () => {
  const currentKwh = (selectedPower * hoursUsed) / 1000;
  electricityTotal += currentKwh;
  electricityTotalEl.textContent = electricityTotal.toFixed(3);
});