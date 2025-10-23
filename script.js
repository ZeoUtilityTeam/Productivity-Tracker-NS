// Items to track - change per department
const items = [
      "# of TDR Tickets", "# of Follow Ups", "# of Home Damage Tickets", "# of Site Visits Scheduled"
    ];
// Time in minutes per item - change per department
const timePerItem = {
      "# of TDR Tickets": 0, 
      "# of Follow Ups": 0, 
      "# of Home Damage Tickets": 45, 
      "# of Site Visits Scheduled": 0
  };

// DOM Elements
const tracker = document.getElementById("tracker");
const totalDisplay = document.getElementById("total-count");
const progressBar = document.getElementById("progress-bar");
const progressDisplay = document.getElementById("progress-display");
const shiftHoursInput = document.getElementById("shift-hours");
const darkModeToggle = document.getElementById("darkModeToggle");
const icon = darkModeToggle.querySelector(".icon");
const counters = {};
let confettiFired = false;

function loadFromStorage() {
  const saved = localStorage.getItem("trackerCounts");
  return saved ? JSON.parse(saved) : {
    "NEM sub": 0
  };
}

function saveToStorage() {
  const data = {};
  for (let label in counters)
    data[label] = parseInt(counters[label].textContent);
  localStorage.setItem("trackerCounts", JSON.stringify(data));
}

function updateTotal() {
  let totalMinutes = 0;
  for (let label in counters)
    totalMinutes += parseInt(counters[label].textContent) * (timePerItem[label] || 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  totalDisplay.textContent = `Total: ${totalMinutes} min (${hours} hr ${minutes} min)`;

  const shiftHours = parseFloat(shiftHoursInput.value);
  if (!isNaN(shiftHours) && shiftHours > 0) {
    const totalShiftMinutes = shiftHours * 60;
    const percentage = Math.round((totalMinutes / totalShiftMinutes) * 100);
    const capped = Math.min(100, percentage);

    progressBar.style.width = `${capped}%`;
    progressDisplay.textContent = `Progress: ${percentage}%`;

    // 🎉 Fire confetti once when reaching 90%
    if (percentage >= 90 && !confettiFired) {
      confettiFired = true;
      fireConfetti();
    }
  } else {
    progressBar.style.width = "0%";
    progressDisplay.textContent = "Enter shift hours to see progress";
  }
}

function fireConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#ff8800", "#ffffff", "#000000"]
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#ff8800", "#ffffff", "#000000"]
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

const values = loadFromStorage();
items.forEach(label => {
  const div = document.createElement("div");
  div.className = "item";

  const labelSpan = document.createElement("span");
  labelSpan.className = "label";
  labelSpan.textContent = label + ":";

  const controls = document.createElement("div");
  controls.className = "controls";

  const countSpan = document.createElement("span");
  countSpan.className = "count";
  countSpan.textContent = values[label] || 0;
  counters[label] = countSpan;

  const plusButton = document.createElement("button");
  plusButton.textContent = "+";
  plusButton.onclick = () => {
    countSpan.textContent = parseInt(countSpan.textContent) + 1;
    saveToStorage();
    updateTotal();
  };

  const minusButton = document.createElement("button");
  minusButton.textContent = "−";
  minusButton.onclick = () => {
    countSpan.textContent = Math.max(0, parseInt(countSpan.textContent) - 1);
    saveToStorage();
    updateTotal();
  };

  controls.append(minusButton, countSpan, plusButton);
  div.append(labelSpan, controls);
  tracker.append(div);
});

document.getElementById("reset").onclick = () => {
  if (confirm("Reset all counts?")) {
    for (let label in counters) counters[label].textContent = 0;
    saveToStorage();
    updateTotal();
    confettiFired = false;
  }
};

document.getElementById("submit").onclick = () => {
  const totalCount = Object.values(counters).reduce(
    (sum, el) => sum + parseInt(el.textContent),
    0
  );
  if (totalCount === 0) {
    alert("Please enter some values before submitting.");
    return;
  }

  // Your base Google Form URL - change per department form
  const baseUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScTaMqnBAfb_pWpq_2VDVBSDWdOjp0ICA2bksBOjm1A2CFfNg/viewform?usp=pp_url";

  // Map tracker labels → Google Form entry fields - change per department form
  const formMap = {
    "# of TDR Tickets": "entry.911755171", 
    "# of Follow Ups": "entry.1141601354", 
    "# of Home Damage Tickets": "entry.584360159", 
    "# of Site Visits Scheduled": "entry.1171141378"
  };

  // Build prefilled form query
  const params = new URLSearchParams();

  for (let label in counters) {
    const entryId = formMap[label];
    if (entryId) {
      params.append(entryId, counters[label].textContent);
    }
  }

  // Open the prefilled form for review
  const fullUrl = `${baseUrl}&${params.toString()}`;
  window.open(fullUrl, "_blank");
};


shiftHoursInput.addEventListener("input", updateTotal);

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  icon.textContent = "☀️";
}

darkModeToggle.onclick = () => {
  darkModeToggle.classList.add("spin");
  setTimeout(() => darkModeToggle.classList.remove("spin"), 400);
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDark);
  icon.textContent = isDark ? "☀️" : "🌙";
};

updateTotal();