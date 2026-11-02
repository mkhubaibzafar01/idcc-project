// ---------- Tasks ----------
const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const stats = document.getElementById("stats");
const filterBtns = document.querySelectorAll(".filter");

let tasks = [];
let filter = "all";

try {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (e) {
  tasks = [];
}

function save() {
  try { localStorage.setItem("tasks", JSON.stringify(tasks)); } catch (e) {}
}

function render() {
  list.innerHTML = "";
  const visible = tasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  visible.forEach(t => {
    const li = document.createElement("li");
    if (t.done) li.classList.add("done");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.addEventListener("change", () => {
      t.done = cb.checked;
      save(); render();
    });

    const span = document.createElement("span");
    span.textContent = t.text;

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => {
      tasks = tasks.filter(x => x.id !== t.id);
      save(); render();
    });

    li.append(cb, span, del);
    list.appendChild(li);
  });

  const doneCount = tasks.filter(t => t.done).length;
  stats.textContent = tasks.length
    ? `${doneCount} of ${tasks.length} tasks completed`
    : "No tasks yet. Add your first one!";
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  input.value = "";
  save(); render();
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

// ---------- Timer ----------
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const timerMsg = document.getElementById("timerMsg");
const DURATION = 25 * 60;

let remaining = DURATION;
let interval = null;

function showTime() {
  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  timeEl.textContent = `${m}:${s}`;
  document.title = `${m}:${s} - FocusFlow`;
}

startBtn.addEventListener("click", () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
    startBtn.textContent = "Resume";
    timerMsg.textContent = "Paused.";
    return;
  }
  startBtn.textContent = "Pause";
  timerMsg.textContent = "Focus mode on!";
  interval = setInterval(() => {
    remaining--;
    showTime();
    if (remaining <= 0) {
      clearInterval(interval);
      interval = null;
      remaining = DURATION;
      startBtn.textContent = "Start";
      timerMsg.textContent = "Great job! Take a short break.";
      showTime();
      alert("Time's up! Take a 5 minute break.");
    }
  }, 1000);
});

resetBtn.addEventListener("click", () => {
  clearInterval(interval);
  interval = null;
  remaining = DURATION;
  startBtn.textContent = "Start";
  timerMsg.textContent = "Stay focused for 25 minutes.";
  showTime();
});

// ---------- Theme ----------
const themeBtn = document.getElementById("themeBtn");

function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeBtn.textContent = dark ? "☀️" : "🌙";
}

let isDark = false;
try { isDark = localStorage.getItem("theme") === "dark"; } catch (e) {}
applyTheme(isDark);

themeBtn.addEventListener("click", () => {
  isDark = !isDark;
  applyTheme(isDark);
  try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch (e) {}
});

// ---------- Init ----------
showTime();
render();