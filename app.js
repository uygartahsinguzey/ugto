const STORAGE_KEY = "berna-v7.1-state";

const initialState = {
  coins: 125,
  xp: 0,
  level: 1,
  pomodoros: 0,
  focusMinutes: 25,
  remainingSeconds: 25 * 60,
  timerRunning: false,
  soundEnabled: true,
  dayStarted: false,
  tasks: [
    { id: crypto.randomUUID(), title: "Psikoloji makalesi oku 🧠", minutes: 25, done: false },
    { id: crypto.randomUUID(), title: "Staj raporu yaz 📖", minutes: 25, done: false },
    { id: crypto.randomUUID(), title: "Almanca kelime çalış ✏️", minutes: 25, done: false },
    { id: crypto.randomUUID(), title: "Spor yap 💪", minutes: 25, done: false }
  ],
  ownedItems: []
};

const shopItems = [
  { id: "wallpaper", name: "Duvar Kağıdı", price: 50, image: "assets/wallpaper.png" },
  { id: "floor", name: "Zemin", price: 50, image: "assets/floor.png" },
  { id: "window", name: "Pencere", price: 60, image: "assets/window.png" },
  { id: "bed", name: "Yatak", price: 70, image: "assets/bed.png" },
  { id: "rug", name: "Halı", price: 40, image: "assets/rug.png" },
  { id: "plant", name: "Bitki", price: 30, image: "assets/plant.png" },
  { id: "shelf", name: "Raf", price: 60, image: "assets/shelf.png" },
  { id: "lamp", name: "Lamba", price: 40, image: "assets/lamp.png" },
  { id: "toy", name: "Oyuncak", price: 35, image: "assets/toy.png" }
];

let state = loadState();
let timerInterval = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(initialState);
    return {
      ...structuredClone(initialState),
      ...saved,
      tasks: Array.isArray(saved.tasks) && saved.tasks.length ? saved.tasks : structuredClone(initialState.tasks),
      ownedItems: Array.isArray(saved.ownedItems) ? saved.ownedItems : []
    };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderDate() {
  const formatter = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long"
  });
  const text = formatter.format(new Date());
  document.getElementById("todayDate").textContent = text.charAt(0).toUpperCase() + text.slice(1);
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  state.tasks.forEach(task => {
    const row = document.createElement("label");
    row.className = `task-row${task.done ? " completed" : ""}`;
    row.innerHTML = `
      <input class="task-check" type="checkbox" ${task.done ? "checked" : ""} aria-label="${escapeHtml(task.title)} tamamlandı" />
      <span class="task-title">${escapeHtml(task.title)}</span>
      <span class="task-time">${task.minutes}dk</span>`;
    row.querySelector("input").addEventListener("change", event => {
      task.done = event.target.checked;
      saveState();
      renderTasks();
    });
    list.appendChild(row);
  });

  const completed = state.tasks.filter(task => task.done).length;
  const total = state.tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  document.getElementById("taskDone").textContent = completed;
  document.getElementById("taskTotal").textContent = total;
  document.getElementById("taskPercent").textContent = `${percent}%`;
  document.getElementById("taskProgress").style.width = `${percent}%`;
}

function renderTimer() {
  const minutes = Math.floor(state.remainingSeconds / 60).toString().padStart(2, "0");
  const seconds = (state.remainingSeconds % 60).toString().padStart(2, "0");
  document.getElementById("timer").textContent = `${minutes}:${seconds}`;
  document.getElementById("timerButtonText").textContent = state.timerRunning ? "Duraklat" : (state.remainingSeconds === 0 ? "Yeniden" : "Başlat");
  document.getElementById("timerIcon").textContent = state.timerRunning ? "Ⅱ" : "▶";
}

function renderStats() {
  const xpInLevel = state.xp % 100;
  document.getElementById("topCoin").textContent = state.coins;
  document.getElementById("mikiXp").textContent = xpInLevel;
  document.getElementById("mikiLevel").textContent = state.level;
  document.getElementById("mikiProgress").style.width = `${xpInLevel}%`;
  document.getElementById("mikiStage").textContent = state.level >= 5 ? "Yetişkin" : state.level >= 3 ? "Genç" : "Yavru";
  document.getElementById("statLevel").textContent = state.level;
  document.getElementById("statXp").textContent = xpInLevel;
  document.getElementById("statCoin").textContent = state.coins;
  document.getElementById("statPomodoro").textContent = state.pomodoros;
}

function renderShop() {
  const grid = document.getElementById("shopGrid");
  grid.innerHTML = "";
  shopItems.forEach(item => {
    const owned = state.ownedItems.includes(item.id);
    const button = document.createElement("button");
    button.className = `shop-item${owned ? " owned" : ""}`;
    button.innerHTML = `
      <h3>${escapeHtml(item.name)}</h3>
      <img src="${item.image}" alt="${escapeHtml(item.name)}" />
      <span class="level">Seviye 1</span>
      <span class="price">${owned ? "Alındı" : item.price}</span>`;
    button.addEventListener("click", () => buyItem(item));
    grid.appendChild(button);
  });
}

function renderAll() {
  renderDate();
  renderTasks();
  renderTimer();
  renderStats();
  renderShop();
  document.getElementById("focusMinutes").value = String(state.focusMinutes);
  document.getElementById("soundEnabled").checked = state.soundEnabled;
  document.getElementById("startDayButton").disabled = state.dayStarted;
  document.getElementById("startDayButton").style.opacity = state.dayStarted ? ".62" : "1";
}

function toggleTimer() {
  if (state.remainingSeconds === 0) {
    state.remainingSeconds = state.focusMinutes * 60;
  }
  state.timerRunning = !state.timerRunning;
  saveState();
  syncTimerInterval();
  renderTimer();
}

function syncTimerInterval() {
  clearInterval(timerInterval);
  timerInterval = null;
  if (!state.timerRunning) return;
  timerInterval = setInterval(() => {
    state.remainingSeconds -= 1;
    if (state.remainingSeconds <= 0) {
      state.remainingSeconds = 0;
      state.timerRunning = false;
      clearInterval(timerInterval);
      timerInterval = null;
      completePomodoro();
    }
    saveState();
    renderTimer();
  }, 1000);
}

function completePomodoro() {
  state.pomodoros += 1;
  state.coins += 10;
  state.xp += 15;
  state.level = Math.floor(state.xp / 100) + 1;
  saveState();
  renderAll();
  showToast("Pomodoro tamamlandı: +15 XP, +10 coin");
  showRoomStatus("Miki seninle gurur duyuyor ♥");
  if (state.soundEnabled) playCompletionSound();
}

function playCompletionSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + .25);
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.16, ctx.currentTime + .03);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .45);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + .48);
  } catch {}
}

function buyItem(item) {
  if (state.ownedItems.includes(item.id)) {
    showToast(`${item.name} zaten sende`);
    showRoomStatus(`${item.name} odada kullanılıyor`);
    return;
  }
  if (state.coins < item.price) {
    showToast("Yeterli coinin yok");
    return;
  }
  state.coins -= item.price;
  state.ownedItems.push(item.id);
  saveState();
  renderStats();
  renderShop();
  showToast(`${item.name} satın alındı`);
  showRoomStatus(`${item.name} odaya eklendi ✨`);
}

function startDay() {
  if (state.dayStarted) {
    showToast("Bugün Miki ile güne zaten başladın");
    return;
  }
  state.dayStarted = true;
  state.coins += 5;
  saveState();
  renderAll();
  showToast("Miki uyandı! Günlük +5 coin");
  showRoomStatus("Miki güne hazır ♥");
}

function saveTask() {
  const input = document.getElementById("newTaskTitle");
  const title = input.value.trim();
  const minutes = Number(document.getElementById("newTaskMinutes").value);
  if (!title) {
    input.focus();
    showToast("Görev adını yazmalısın");
    return;
  }
  state.tasks.push({ id: crypto.randomUUID(), title, minutes, done: false });
  input.value = "";
  saveState();
  renderTasks();
  closeModal("taskModal");
  showToast("Görev eklendi");
}

function saveSettings() {
  const minutes = Number(document.getElementById("focusMinutes").value);
  state.focusMinutes = minutes;
  state.remainingSeconds = minutes * 60;
  state.timerRunning = false;
  state.soundEnabled = document.getElementById("soundEnabled").checked;
  saveState();
  syncTimerInterval();
  renderTimer();
  closeModal("settingsModal");
  showToast("Pomodoro ayarları kaydedildi");
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2200);
}
function showRoomStatus(message) {
  const status = document.getElementById("roomStatus");
  status.textContent = message;
  status.classList.add("show");
  clearTimeout(showRoomStatus.timeout);
  showRoomStatus.timeout = setTimeout(() => status.classList.remove("show"), 2600);
}
function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.target).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
}

renderAll();
syncTimerInterval();
setupNavigation();
registerServiceWorker();

document.getElementById("timerButton").addEventListener("click", toggleTimer);
document.getElementById("settingsButton").addEventListener("click", () => openModal("settingsModal"));
document.getElementById("addTaskButton").addEventListener("click", () => openModal("taskModal"));
document.getElementById("saveTaskButton").addEventListener("click", saveTask);
document.getElementById("saveSettingsButton").addEventListener("click", saveSettings);
document.getElementById("startDayButton").addEventListener("click", startDay);
document.getElementById("goStoreButton").addEventListener("click", () => document.getElementById("storeSection").scrollIntoView({ behavior: "smooth" }));
document.getElementById("coinPill").addEventListener("click", () => {
  document.getElementById("storeSection").scrollIntoView({ behavior: "smooth" });
  showToast("Coinlerini mağazada kullanabilirsin");
});
document.getElementById("brandButton").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.dataset.close));
});
document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closeModal(backdrop.id);
  });
});
document.getElementById("newTaskTitle").addEventListener("keydown", event => {
  if (event.key === "Enter") saveTask();
});
