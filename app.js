const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const KEY = "studyGlow";

const SUBJECTS = {
  Math: "#c9b8ff", Science: "#bdeedb", English: "#ffcfb8",
  History: "#fff1a8", Art: "#ffc8e6", Other: "#d6e4ff"
};
const POINTS = { easy: 5, medium: 10, hard: 15 };
const UNLOCKS = [
  { at: 0, icon: "⭐", name: "Starry" },
  { at: 30, icon: "🎀", name: "Bow" },
  { at: 80, icon: "🎩", name: "Top hat" },
  { at: 150, icon: "🕶️", name: "Cool shades" },
  { at: 250, icon: "👑", name: "Crown" },
  { at: 400, icon: "🌈", name: "Rainbow theme" }
];
const CHEERS = [
  "You’ve got this!", "One small step is still a step.", "Look at you glowing!",
  "Nice work. Take a sip of water!", "Tiny steps add up.", "Proud of you!"
];
const MOODS = {
  great: "Love that energy! Let’s make today shine.",
  okay: "Steady and calm. That works.",
  tired: "Rest counts too. Here’s a lighter list for you.",
  stressed: "Take a breath. I’ve shrunk your list to just 3 things.",
  sad: "Be gentle with yourself. Start with just one tiny task."
};
const STEPS = [
  ["Gather what you need", "Do the first small part", "Do the next part", "Check your work"],
  ["Pick a quiet spot", "Work for one focus round", "Finish the rest", "Give yourself a high five"]
];

const ymd = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const todayStr = () => ymd(new Date());
const esc = t => { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; };

const fresh = () => ({
  tasks: [], glow: 0, days: [], mood: null,
  dark: matchMedia("(prefers-color-scheme: dark)").matches, focus: 25, brk: 5
});
let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

/* ---------- Navigation ---------- */
function show(view) {
  $$(".view").forEach(v => v.classList.toggle("active", v.id === view));
  $("#nav").hidden = view === "welcome" || view === "add";
  $$("#nav button").forEach(b => b.classList.toggle("on", b.dataset.go === view));
  ({ home: renderHome, calendar: renderCal, rewards: renderRewards, settings: renderSettings, add: renderAdd }[view] || (() => {}))();
  window.scrollTo(0, 0);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-go]");
  if (b) show(b.dataset.go);
});

/* ---------- Helpers ---------- */
const level = () => UNLOCKS.filter(u => S.glow >= u.at).length;
const outfit = () => UNLOCKS.filter(u => S.glow >= u.at).slice(-1)[0].icon;
const cheer = () => CHEERS[Math.floor(Math.random() * CHEERS.length)];

function sparkle(x, y) {
  for (let i = 0; i < 12; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = ["✨", "⭐", "💖", "🌟"][i % 4];
    s.style.left = x + "px"; s.style.top = y + "px";
    s.style.setProperty("--x", (Math.random() * 200 - 100) + "px");
    s.style.setProperty("--y", (Math.random() * -160 - 20) + "px");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

/* ---------- Home ---------- */
function renderHome() {
  const h = new Date().getHours();
  $("#greeting").textContent = (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening") + "! 🌸";
  $("#dateLine").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  $("#mascotSmall").textContent = outfit();
  $$("#moods button").forEach(b => b.classList.toggle("on", b.dataset.mood === S.mood));
  $("#moodMsg").textContent = S.mood ? MOODS[S.mood] : "";

  const open = S.tasks.filter(t => !t.done).sort((a, b) => a.due.localeCompare(b.due));
  const limit = (S.mood === "stressed" || S.mood === "tired" || S.mood === "sad") ? 3 : 5;
  const shown = open.slice(0, limit);
  const doneToday = S.tasks.filter(t => t.done && t.doneOn === todayStr());
  const list = $("#todayList");

  if (!shown.length && !doneToday.length) {
    list.innerHTML = '<li class="empty">Nothing here yet. Add a task and let’s get glowing ✨</li>';
  } else if (!shown.length) {
    list.innerHTML = '<li class="empty">All done for now. Time to rest! 🌙</li>';
  } else {
    list.innerHTML = "";
  }
  shown.concat(doneToday).forEach(t => list.appendChild(taskEl(t)));
  const extra = open.length - shown.length;
  $("#moreLine").textContent = extra > 0 ? extra + " more waiting for later. No rush!" : "";
}

function taskEl(t) {
  const li = document.createElement("li");
  li.className = "task" + (t.done ? " done" : "");
  li.style.setProperty("--c", SUBJECTS[t.subject] || SUBJECTS.Other);
  li.innerHTML = `<button class="tick" aria-label="Mark done">${t.done ? "✓" : ""}</button>
    <div class="info"><b>${esc(t.title)}</b><small>${esc(t.subject)} · due ${esc(t.due)} · ${esc(t.diff)}</small></div>`;
  li.querySelector(".tick").onclick = e => toggle(t.id, e);
  return li;
}

function toggle(id, e) {
  const t = S.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  if (t.done) {
    t.doneOn = todayStr();
    S.glow += POINTS[t.diff] || 10;
    if (!S.days.includes(todayStr())) S.days.push(todayStr());
    sparkle(e.clientX, e.clientY);
    try { window.Capacitor?.Plugins?.Haptics?.impact({ style: "MEDIUM" }); } catch {}
    $("#bubble").textContent = cheer();
  } else {
    S.glow = Math.max(0, S.glow - (POINTS[t.diff] || 10));
  }
  save();
  setTimeout(renderHome, t.done ? 500 : 0);
}

$("#moods").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  S.mood = b.dataset.mood; save(); renderHome();
});

/* ---------- Add task ---------- */
function renderAdd() {
  $("#tSubject").innerHTML = Object.keys(SUBJECTS).map(s => `<option>${s}</option>`).join("");
  if (!$("#tDue").value) $("#tDue").value = todayStr();
}
$("#taskForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("#tTitle").value.trim();
  const base = { subject: $("#tSubject").value, due: $("#tDue").value, diff: $("#tDiff").value, done: false };
  const mk = (ttl, i) => ({ ...base, title: ttl, id: Date.now() + i });
  if ($("#tBreak").checked && base.diff !== "easy") {
    const set = STEPS[title.length % 2];
    S.tasks.push(...set.map((s, i) => mk(`${title}: ${s}`, i)));
  } else {
    S.tasks.push(mk(title, 0));
  }
  save();
  $("#taskForm").reset();
  $("#tBreak").checked = true;
  $("#bubble").textContent = "Added! Small steps make big things easy.";
  show("home");
});

/* ---------- Calendar ---------- */
function renderCal() {
  const wrap = $("#weekList");
  wrap.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    const items = S.tasks.filter(t => !t.done && t.due === ymd(d));
    const div = document.createElement("div");
    div.className = "day" + (i === 0 ? " today" : "");
    div.innerHTML = `<h3>${d.toLocaleDateString(undefined, { weekday: "long" })}<span class="muted">${d.getDate()}/${d.getMonth() + 1}</span></h3>` +
      (items.length ? items.map(t => `<span class="pill" style="--c:${SUBJECTS[t.subject]}">${esc(t.title)}</span>`).join("") : '<span class="muted">Free day 🌤️</span>');
    wrap.appendChild(div);
  }
}

/* ---------- Rewards ---------- */
function renderRewards() {
  const lv = level();
  const cur = UNLOCKS[lv - 1].at, next = UNLOCKS[lv] ? UNLOCKS[lv].at : null;
  $("#mascotBig").textContent = outfit();
  $("#levelText").textContent = "Level " + lv;
  $("#meterFill").style.width = (next ? ((S.glow - cur) / (next - cur)) * 100 : 100) + "%";
  $("#meterText").textContent = next ? (next - S.glow) + " glow until the next surprise" : "You unlocked everything! 🎉";
  $("#streakText").textContent = "🌱 " + S.days.length + " glow day" + (S.days.length === 1 ? "" : "s") + " so far. Missing a day never resets this.";
  $("#unlocks").innerHTML = UNLOCKS.map(u =>
    `<div class="unlock ${S.glow >= u.at ? "" : "locked"}"><span>${u.icon}</span>${u.name}</div>`).join("");
}

/* ---------- Settings ---------- */
function applyTheme() { document.documentElement.dataset.theme = S.dark ? "dark" : "light"; }
function renderSettings() {
  $("#darkToggle").checked = S.dark;
  $("#focusMin").value = S.focus;
  $("#breakMin").value = S.brk;
  $("#remindToggle").checked = !!S.remind;
}
$("#darkToggle").onchange = e => { S.dark = e.target.checked; applyTheme(); save(); };
$("#focusMin").onchange = e => { S.focus = Math.min(90, Math.max(5, +e.target.value || 25)); save(); resetTimer(); };
$("#breakMin").onchange = e => { S.brk = Math.min(30, Math.max(1, +e.target.value || 5)); save(); resetTimer(); };
$("#clearBtn").onclick = () => {
  if (confirm("This will erase your tasks and glow. Are you sure?")) {
    localStorage.removeItem(KEY); S = fresh(); applyTheme(); show("welcome");
  }
};

$("#remindToggle").onchange = async e => {
  const LN = window.Capacitor?.Plugins?.LocalNotifications;
  if (!LN) { e.target.checked = false; alert("Reminders work in the iPhone app version."); return; }
  try {
    if (e.target.checked) {
      const p = await LN.requestPermissions();
      if (p.display !== "granted") { e.target.checked = false; return; }
      await LN.schedule({ notifications: [{ id: 1, title: "Study Glow ✨", body: "You’ve got this! One tiny task today?",
        schedule: { on: { hour: 16, minute: 0 }, allowWhileIdle: true } }] });
    } else {
      await LN.cancel({ notifications: [{ id: 1 }] });
    }
    S.remind = e.target.checked; save();
  } catch { e.target.checked = false; }
};

/* ---------- Focus timer ---------- */
let mode = "focus", left = 0, total = 0, tick = null;
function resetTimer() {
  clearInterval(tick); tick = null;
  mode = "focus"; total = left = S.focus * 60;
  $("#startBtn").textContent = "Start";
  $("#ring").classList.remove("running");
  $("#modeText").textContent = "Focus";
  $("#timerMsg").textContent = "One small stretch. Then a little break.";
  drawTimer();
}
function drawTimer() {
  const m = String(Math.floor(left / 60)).padStart(2, "0"), s = String(left % 60).padStart(2, "0");
  $("#timeText").textContent = m + ":" + s;
  $("#ring").style.setProperty("--p", total ? ((total - left) / total) * 100 : 0);
}
$("#startBtn").onclick = () => {
  if (tick) { clearInterval(tick); tick = null; $("#startBtn").textContent = "Resume"; $("#ring").classList.remove("running"); return; }
  $("#startBtn").textContent = "Pause";
  $("#ring").classList.add("running");
  tick = setInterval(() => {
    left--; drawTimer();
    if (left <= 0) {
      clearInterval(tick); tick = null;
      if (mode === "focus") {
        S.glow += 5; save();
        mode = "break"; total = left = S.brk * 60;
        $("#modeText").textContent = "Break";
        $("#timerMsg").textContent = "Great focus! +5 glow. Stretch and sip some water 💧";
      } else {
        mode = "focus"; total = left = S.focus * 60;
        $("#modeText").textContent = "Focus";
        $("#timerMsg").textContent = "Break’s over. Ready when you are!";
      }
      $("#startBtn").textContent = "Start";
      $("#ring").classList.remove("running");
      drawTimer();
    }
  }, 1000);
};
$("#resetBtn").onclick = resetTimer;

/* ---------- Start ---------- */
applyTheme();
resetTimer();
show("welcome");

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
