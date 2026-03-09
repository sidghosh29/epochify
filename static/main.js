function pad(n) {
  return String(n).padStart(2, "0");
}

// --- Index page: live epoch bar ---
const liveEpochEl = document.getElementById("live-epoch");
if (liveEpochEl) {
  let paused = false;

  function updateEpoch() {
    if (!paused) {
      liveEpochEl.textContent = Math.floor(Date.now() / 1000);
    }
  }
  updateEpoch();
  setInterval(updateEpoch, 1000);

  liveEpochEl.addEventListener("mouseenter", () => {
    paused = true;
  });
  liveEpochEl.addEventListener("mouseleave", () => {
    paused = false;
    updateEpoch();
  });

  // Pre-populate epoch input
  const epochInput = document.getElementById("epoch-input");
  if (epochInput && !epochInput.value) {
    epochInput.value = Math.floor(Date.now() / 1000);
  }

  // Pre-populate date fields
  const fYr = document.getElementById("f-yr");
  const fMon = document.getElementById("f-mon");
  const fDay = document.getElementById("f-day");
  const fHr = document.getElementById("f-hr");
  const fMin = document.getElementById("f-min");
  const fSec = document.getElementById("f-sec");

  // Keep submitted values after redirect; initialize with current UTC only when empty.
  if (
    !fYr.value &&
    !fMon.value &&
    !fDay.value &&
    !fHr.value &&
    !fMin.value &&
    !fSec.value
  ) {
    const now = new Date();
    fYr.value = now.getUTCFullYear();
    fMon.value = now.getUTCMonth() + 1;
    fDay.value = now.getUTCDate();
    fHr.value = now.getUTCHours();
    fMin.value = now.getUTCMinutes();
    fSec.value = now.getUTCSeconds();
  }

  document.getElementById("date-form").addEventListener("submit", function () {
    const yr = document.getElementById("f-yr").value || "1970";
    const mon = String(document.getElementById("f-mon").value || "1").padStart(
      2,
      "0",
    );
    const day = String(document.getElementById("f-day").value || "1").padStart(
      2,
      "0",
    );
    const hr = String(document.getElementById("f-hr").value || "0").padStart(
      2,
      "0",
    );
    const min = String(document.getElementById("f-min").value || "0").padStart(
      2,
      "0",
    );
    const sec = String(document.getElementById("f-sec").value || "0").padStart(
      2,
      "0",
    );
    document.getElementById("date-value").value =
      `${yr}-${mon}-${day} ${hr}:${min}:${sec}`;
  });
}

// --- Epoch clock page ---
const clockEpochEl = document.getElementById("clock-epoch");
if (clockEpochEl) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function updateClock() {
    const now = new Date();
    const epoch = Math.floor(now.getTime() / 1000);

    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);
    const offsetStr = `GMT${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;

    document.getElementById("clock-local").textContent =
      `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${offsetStr}`;
    clockEpochEl.textContent = epoch.toLocaleString("en-US", {
      useGrouping: false,
    });
    document.getElementById("clock-hex").textContent = epoch
      .toString(16)
      .toUpperCase();
    document.getElementById("clock-ms").textContent = now
      .getTime()
      .toLocaleString("en-US", { useGrouping: false });
    document.getElementById("clock-gmt").textContent =
      `${days[now.getUTCDay()]}, ${now.getUTCDate()} ${months[now.getUTCMonth()]} ${now.getUTCFullYear()} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}
