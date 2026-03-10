function pad(n) {
  return String(n).padStart(2, "0");
}

function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (_e) {
    return "";
  }
}

// Map browser-returned timezone aliases to the IANA names used in the dropdowns.
var TZ_ALIASES = {
  "Asia/Calcutta": "Asia/Kolkata",
  "US/Eastern": "America/New_York",
  "US/Central": "America/Chicago",
  "US/Mountain": "America/Denver",
  "US/Pacific": "America/Los_Angeles",
  "Europe/Kiev": "Europe/Kyiv",
};

function applyLocalTimezone(selectEl, skip) {
  if (!selectEl || skip) return;

  var localTz = getBrowserTimezone();
  if (!localTz) return;

  // Resolve known aliases to dropdown values.
  var resolved = TZ_ALIASES[localTz] || localTz;

  var existing = Array.from(selectEl.options).find(
    function (opt) { return opt.value === resolved; },
  );
  if (existing) {
    selectEl.value = resolved;
  } else {
    // Timezone not in list at all — add it.
    var opt = document.createElement("option");
    opt.value = resolved;
    opt.textContent = resolved;
    selectEl.insertBefore(opt, selectEl.firstChild);
    selectEl.value = resolved;
  }
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

  // Default timezone follows the viewer's browser timezone.
  // Skip the select that belongs to the submitted direction (its value comes from the server).
  var params = new URLSearchParams(window.location.search);
  var submittedDir = params.has("timezone") ? params.get("direction") : null;
  applyLocalTimezone(document.getElementById("epoch-timezone"), submittedDir === "epoch_to_date");
  applyLocalTimezone(document.getElementById("date-timezone"), submittedDir === "date_to_epoch");

  // Keep submitted values after redirect; initialize with current local time only when empty.
  if (
    !fYr.value &&
    !fMon.value &&
    !fDay.value &&
    !fHr.value &&
    !fMin.value &&
    !fSec.value
  ) {
    const now = new Date();
    fYr.value = now.getFullYear();
    fMon.value = now.getMonth() + 1;
    fDay.value = now.getDate();
    fHr.value = now.getHours();
    fMin.value = now.getMinutes();
    fSec.value = now.getSeconds();
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

// --- Duration Calculator page ---
const tsDurForm = document.getElementById("ts-duration-form");
if (tsDurForm) {
  function formatDuration(totalSeconds) {
    const neg = totalSeconds < 0;
    let s = Math.abs(Math.floor(totalSeconds));
    const days = Math.floor(s / 86400);
    s %= 86400;
    const hrs = Math.floor(s / 3600);
    s %= 3600;
    const mins = Math.floor(s / 60);
    s %= 60;
    const parts = [];
    if (days) parts.push(days + (days === 1 ? " day" : " days"));
    if (hrs) parts.push(hrs + (hrs === 1 ? " hour" : " hours"));
    if (mins) parts.push(mins + (mins === 1 ? " minute" : " minutes"));
    parts.push(s + (s === 1 ? " second" : " seconds"));
    return (neg ? "−" : "") + parts.join(", ");
  }

  document.getElementById("ts-calc-btn").addEventListener("click", function () {
    const multipliers = {
      seconds: 1,
      milliseconds: 1000,
      microseconds: 1000000,
    };
    const unit = document.getElementById("ts-unit").value;
    const m = multipliers[unit];
    const a = parseFloat(document.getElementById("ts-start").value);
    const b = parseFloat(document.getElementById("ts-end").value);
    const el = document.getElementById("ts-duration-result");
    if (isNaN(a) || isNaN(b)) {
      el.className = "result result-error";
      el.innerHTML = "<p>Enter valid numbers.</p>";
      el.style.display = "flex";
      return;
    }
    const diffSec = (b - a) / m;
    const absDiff = Math.abs(b - a);
    el.className = "result";
    el.innerHTML = `<strong>${formatDuration(diffSec)}</strong><span class="result-sub">${absDiff.toLocaleString("en-US")} ${unit}</span>`;
    el.style.display = "flex";
  });

  document
    .getElementById("date-calc-btn")
    .addEventListener("click", function () {
      const a = document.getElementById("date-start").value;
      const b = document.getElementById("date-end").value;
      const el = document.getElementById("date-duration-result");
      if (!a || !b) {
        el.className = "result result-error";
        el.innerHTML = "<p>Select both dates.</p>";
        el.style.display = "flex";
        return;
      }
      const diffMs = new Date(b).getTime() - new Date(a).getTime();
      const diffSec = diffMs / 1000;
      el.className = "result";
      el.innerHTML = `<strong>${formatDuration(diffSec)}</strong><span class="result-sub">${Math.abs(Math.floor(diffSec)).toLocaleString("en-US")} seconds</span>`;
      el.style.display = "flex";
    });
}

// --- Common Events page ---
const evNowEl = document.getElementById("ev-now");
if (evNowEl) {
  function fmtUTC(d) {
    return d.toUTCString().replace("GMT", "UTC");
  }

  function populateEvents() {
    const now = new Date();

    // Start of today (UTC)
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    document.getElementById("ev-today").textContent = Math.floor(
      today.getTime() / 1000,
    );
    document.getElementById("ev-today-r").textContent = fmtUTC(today);

    // Start of week (Monday, UTC)
    const dayOfWeek = now.getUTCDay();
    const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - diffToMon,
      ),
    );
    document.getElementById("ev-week").textContent = Math.floor(
      monday.getTime() / 1000,
    );
    document.getElementById("ev-week-r").textContent = fmtUTC(monday);

    // Start of month (UTC)
    const month = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    document.getElementById("ev-month").textContent = Math.floor(
      month.getTime() / 1000,
    );
    document.getElementById("ev-month-r").textContent = fmtUTC(month);

    // Start of year (UTC)
    const year = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    document.getElementById("ev-year").textContent = Math.floor(
      year.getTime() / 1000,
    );
    document.getElementById("ev-year-r").textContent = fmtUTC(year);

    // End of today (UTC 23:59:59)
    const todayEnd = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
      ),
    );
    document.getElementById("ev-today-end").textContent = Math.floor(
      todayEnd.getTime() / 1000,
    );
    document.getElementById("ev-today-end-r").textContent = fmtUTC(todayEnd);

    // Right now
    document.getElementById("ev-now").textContent = Math.floor(
      now.getTime() / 1000,
    );
    document.getElementById("ev-now-r").textContent = fmtUTC(now);
  }

  populateEvents();
  setInterval(populateEvents, 1000);
}

// --- API Playground page ---
const apiForm = document.getElementById("api-form");
if (apiForm) {
  applyLocalTimezone(document.getElementById("api-tz"), false);

  function updateReqPreview() {
    const dir = document.getElementById("api-direction").value;
    const val = document.getElementById("api-value").value || "1700000000";
    const tz = document.getElementById("api-tz").value;
    const u = document.getElementById("api-unit").value;
    document.querySelector("#api-req code").textContent =
      `POST /api/v1/convert\nContent-Type: application/json\n\n` +
      JSON.stringify(
        { direction: dir, value: val, timezone: tz, unit: u },
        null,
        2,
      );
  }

  document
    .querySelectorAll("#api-form select, #api-form input")
    .forEach(function (el) {
      el.addEventListener("input", updateReqPreview);
    });

  document
    .getElementById("api-send-btn")
    .addEventListener("click", function () {
      const dir = document.getElementById("api-direction").value;
      const val = document.getElementById("api-value").value;
      const tz = document.getElementById("api-tz").value;
      const u = document.getElementById("api-unit").value;

      updateReqPreview();

      const resEl = document.getElementById("api-res-body");
      resEl.textContent = "// Loading...";

      fetch("/api/v1/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: dir,
          value: val,
          timezone: tz,
          unit: u,
        }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          resEl.textContent = JSON.stringify(data, null, 2);
        })
        .catch(function (e) {
          resEl.textContent = "// Error: " + e.message;
        });
    });
}
