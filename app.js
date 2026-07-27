(() => {
  "use strict";

  const STORAGE_KEY = "berna-v15-state";
  const QUOTES = [
    "Bugün yaptığın küçük çalışma, yarının sakinliğini kurar.",
    "Mükemmel olmak zorunda değilsin; başlaman yeterli.",
    "Dikkatini koruduğun her dakika kendine verdiğin bir sözdür.",
    "Yavaş ilerlemek, yerinde saymak değildir.",
    "Bir Pomodoro bazen bütün günün yönünü değiştirir.",
    "Kendinle yarış; dünkü senden bir adım öne geç.",
    "Zor olanı küçült: sadece sonraki yirmi beş dakikayı düşün."
  ];

  const DEFAULT_SUBJECTS = [
    { id: "psychology", name: "Psikoloji", icon: "🧠" },
    { id: "python", name: "Python", icon: "💻" },
    { id: "german", name: "Almanca", icon: "🇩🇪" },
    { id: "reading", name: "Okuma", icon: "📚" }
  ];

  const SHOP_ITEMS = [
    { id: "chef", type: "costume", name: "Şef Miki", icon: "🧑‍🍳", price: 140, description: "Miki mutfağın başına geçer." },
    { id: "student", type: "costume", name: "Öğrenci Miki", icon: "🎓", price: 180, description: "Ders çalışmaya hazır sade bir kep." },
    { id: "pirate", type: "costume", name: "Korsan Miki", icon: "🏴‍☠️", price: 240, description: "Odak hazinesinin peşinde." },
    { id: "wizard", type: "costume", name: "Büyücü Miki", icon: "🪄", price: 300, description: "Zamanı odak büyüsüne çevirir." },
    { id: "astronaut", type: "costume", name: "Astronot Miki", icon: "🚀", price: 380, description: "Dikkatin sınırlarını aşar." },
    { id: "desk", type: "room", name: "Çalışma Masası", icon: "🖥️", price: 160, description: "Odaya sıcak bir çalışma köşesi ekler." },
    { id: "plant", type: "room", name: "Salon Bitkisi", icon: "🪴", price: 90, description: "Odaya canlılık katar." },
    { id: "shelf", type: "room", name: "Kitaplık", icon: "📚", price: 210, description: "Çalıştıkça dolan küçük bir raf." },
    { id: "lamp", type: "room", name: "Ayaklı Lamba", icon: "💡", price: 120, description: "Gece odasını yumuşakça aydınlatır." },
    { id: "rug", type: "room", name: "Cozy Halı", icon: "🧶", price: 110, description: "Odanın ortasına sıcak bir doku ekler." },
    { id: "sakura", type: "theme", name: "Sakura Tema", icon: "🌸", price: 220, description: "Pembe ve sakin bahar tonları." },
    { id: "forest", type: "theme", name: "Forest Tema", icon: "🌲", price: 220, description: "Yeşil ve doğal bir çalışma alanı." },
    { id: "dark", type: "theme", name: "Dark Academia", icon: "🕯️", price: 260, description: "Koyu ahşap ve akademik atmosfer." },
    { id: "minimal", type: "theme", name: "Minimal Tema", icon: "◻️", price: 180, description: "Daha sade ve nötr bir görünüm." }
  ];

  const MISSION_POOL = [
    { id: "pomodoros", icon: "🍅", title: "2 Pomodoro tamamla", type: "pomodoros", target: 2, xp: 45, coins: 25 },
    { id: "focus45", icon: "⏱️", title: "45 dakika odaklan", type: "focusMinutes", target: 45, xp: 40, coins: 20 },
    { id: "tasks2", icon: "✅", title: "2 görev tamamla", type: "tasksCompleted", target: 2, xp: 35, coins: 20 },
    { id: "miki2", icon: "🐱", title: "Miki ile 2 kez ilgilen", type: "mikiInteractions", target: 2, xp: 25, coins: 15 },
    { id: "xp40", icon: "✨", title: "40 XP kazan", type: "xp", target: 40, xp: 30, coins: 15 }
  ];

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
  const pad = value => String(value).padStart(2, "0");
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  function localDate(date = new Date()) {
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    return `${y}-${m}-${d}`;
  }

  function dateShift(dateString, amount) {
    const [y, m, d] = dateString.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + amount);
    return localDate(date);
  }

  function prettyDate(dateString) {
    const [y, m, d] = dateString.split("-").map(Number);
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(y, m - 1, d));
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0);
  }

  function defaultState() {
    const today = localDate();
    return {
      version: 15,
      profile: {
        appName: "Berna",
        mikiName: "Miki",
        friendCode: `BER-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      },
      wallet: { coins: 250, xp: 0, level: 1 },
      streak: { current: 0, longest: 0, lastStudyDate: null },
      daily: {
        date: today,
        xp: 0,
        coins: 0,
        pomodoros: 0,
        focusMinutes: 0,
        tasksCompleted: 0,
        mikiInteractions: 0,
        missions: createDailyMissions(today)
      },
      settings: {
        theme: "cozy",
        focusMinutes: 25,
        shortMinutes: 5,
        longMinutes: 15,
        volume: 0.25
      },
      subjects: structuredClone(DEFAULT_SUBJECTS),
      tasks: [],
      sessions: [],
      miki: {
        love: 72,
        satiety: 68,
        sleep: 74,
        happiness: 76,
        ownedCostumes: ["classic"],
        equippedCostume: "classic",
        lastDecayDate: today
      },
      inventory: {
        roomOwned: [],
        roomEquipped: [],
        themesOwned: ["cozy"]
      },
      friends: []
    };
  }

  function createDailyMissions(dateString) {
    const seed = hashString(dateString);
    const pool = [...MISSION_POOL];
    const result = [];
    let n = seed;
    while (result.length < 3 && pool.length) {
      const index = n % pool.length;
      const picked = pool.splice(index, 1)[0];
      result.push({ ...picked, claimed: false });
      n = Math.floor(n / 7) + 17;
    }
    return result;
  }

  function mergeState(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== "object") return base;
    const merged = {
      ...base,
      ...raw,
      profile: { ...base.profile, ...(raw.profile || {}) },
      wallet: { ...base.wallet, ...(raw.wallet || {}) },
      streak: { ...base.streak, ...(raw.streak || {}) },
      daily: { ...base.daily, ...(raw.daily || {}) },
      settings: { ...base.settings, ...(raw.settings || {}) },
      miki: { ...base.miki, ...(raw.miki || {}) },
      inventory: { ...base.inventory, ...(raw.inventory || {}) }
    };
    merged.subjects = Array.isArray(raw.subjects) && raw.subjects.length ? raw.subjects : base.subjects;
    merged.tasks = Array.isArray(raw.tasks) ? raw.tasks : [];
    merged.sessions = Array.isArray(raw.sessions) ? raw.sessions : [];
    merged.friends = Array.isArray(raw.friends) ? raw.friends : [];
    merged.miki.ownedCostumes = Array.isArray(merged.miki.ownedCostumes) ? merged.miki.ownedCostumes : ["classic"];
    if (!merged.miki.ownedCostumes.includes("classic")) merged.miki.ownedCostumes.unshift("classic");
    merged.inventory.roomOwned = Array.isArray(merged.inventory.roomOwned) ? merged.inventory.roomOwned : [];
    merged.inventory.roomEquipped = Array.isArray(merged.inventory.roomEquipped) ? merged.inventory.roomEquipped : [];
    merged.inventory.themesOwned = Array.isArray(merged.inventory.themesOwned) ? merged.inventory.themesOwned : ["cozy"];
    if (!merged.inventory.themesOwned.includes("cozy")) merged.inventory.themesOwned.unshift("cozy");
    return merged;
  }

  let state = (() => {
    try {
      return mergeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return defaultState();
    }
  })();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function ensureDailyState() {
    const today = localDate();
    if (state.daily.date !== today) {
      const elapsed = state.miki.lastDecayDate ? Math.max(1, Math.round((new Date(today) - new Date(state.miki.lastDecayDate)) / 86400000)) : 1;
      state.miki.satiety = clamp(state.miki.satiety - elapsed * 7);
      state.miki.sleep = clamp(state.miki.sleep - elapsed * 4);
      state.miki.happiness = clamp(state.miki.happiness - elapsed * 5);
      state.miki.lastDecayDate = today;
      state.daily = {
        date: today,
        xp: 0,
        coins: 0,
        pomodoros: 0,
        focusMinutes: 0,
        tasksCompleted: 0,
        mikiInteractions: 0,
        missions: createDailyMissions(today)
      };
      save();
    }
    if (!Array.isArray(state.daily.missions) || state.daily.missions.length !== 3) {
      state.daily.missions = createDailyMissions(today);
      save();
    }
  }

  function reward(xp, coins, message) {
    state.wallet.xp += xp;
    state.wallet.coins += coins;
    state.daily.xp += xp;
    state.daily.coins += coins;
    const newLevel = Math.floor(state.wallet.xp / 200) + 1;
    if (newLevel > state.wallet.level) {
      state.wallet.level = newLevel;
      state.wallet.coins += 50;
      state.daily.coins += 50;
      toast(`Seviye ${newLevel}! Bonus 50 coin kazandın.`);
    } else if (message) {
      toast(message);
    }
    save();
  }

  function updateStreak() {
    const today = localDate();
    const previous = state.streak.lastStudyDate;
    if (previous === today) return;
    if (previous === dateShift(today, -1)) state.streak.current += 1;
    else state.streak.current = 1;
    state.streak.longest = Math.max(state.streak.longest, state.streak.current);
    state.streak.lastStudyDate = today;
  }

  function missionProgress(mission) {
    return clamp(Number(state.daily[mission.type] || 0), 0, mission.target);
  }

  function renderHeader() {
    $("#brandName").textContent = state.profile.appName;
    document.title = `${state.profile.appName} V15`;
    $("#coinCount").textContent = state.wallet.coins;
    $("#levelCount").textContent = state.wallet.level;
    $("#streakCount").textContent = state.streak.current;
    $("#shopCoins").textContent = state.wallet.coins;
    $("#totalXpTag").textContent = state.wallet.xp;
    $("#app").dataset.theme = state.settings.theme;
    const metaTheme = $("meta[name='theme-color']");
    if (metaTheme) metaTheme.content = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#b96f72";
  }

  function renderToday() {
    const quoteIndex = hashString(localDate()) % QUOTES.length;
    $("#dailyQuote").textContent = QUOTES[quoteIndex];
    $("#todayFocus").textContent = `${state.daily.focusMinutes} dk`;
    $("#todayPomodoros").textContent = state.daily.pomodoros;
    $("#todayXp").textContent = state.daily.xp;
    $("#todayCoins").textContent = state.daily.coins;
    $("#missionDate").textContent = prettyDate(state.daily.date);

    $("#dailyMissions").innerHTML = state.daily.missions.map(mission => {
      const progress = missionProgress(mission);
      const ready = progress >= mission.target;
      return `
        <div class="mission ${mission.claimed ? "completed" : ""}">
          <div class="mission-icon">${mission.icon}</div>
          <div>
            <h4>${mission.title}</h4>
            <p>${progress}/${mission.target} · +${mission.xp} XP · +${mission.coins} coin</p>
            <div class="progress-track"><span style="width:${(progress / mission.target) * 100}%"></span></div>
          </div>
          <button class="${ready && !mission.claimed ? "primary-btn" : "ghost-btn"} mission-claim" data-mission="${mission.id}" ${!ready || mission.claimed ? "disabled" : ""}>${mission.claimed ? "Alındı" : ready ? "Al" : "Devam"}</button>
        </div>`;
    }).join("");

    $$(".mission-claim").forEach(button => button.addEventListener("click", () => {
      const mission = state.daily.missions.find(item => item.id === button.dataset.mission);
      if (!mission || mission.claimed || missionProgress(mission) < mission.target) return;
      mission.claimed = true;
      reward(mission.xp, mission.coins, `Günlük görev tamamlandı: +${mission.xp} XP`);
      renderAll();
    }));

    const todays = state.tasks
      .filter(task => !task.completed && task.date <= localDate())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
    $("#todayTodoList").innerHTML = todays.length ? todays.map(task => {
      const subject = state.subjects.find(item => item.id === task.subjectId);
      return `<div class="task-item"><span>${subject?.icon || "•"}</span><div><h4>${escapeHtml(task.title)}</h4><p>${subject?.name || "Genel"} · ${task.minutes} dk · ${prettyDate(task.date)}</p></div><button class="icon-btn today-complete" data-id="${task.id}" aria-label="Tamamla">✓</button></div>`;
    }).join("") : `<div class="empty-state">Bugün için açık görev yok. Güzel bir nefes al.</div>`;
    $$(".today-complete").forEach(button => button.addEventListener("click", () => toggleTask(button.dataset.id, true)));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function renderSubjectSelects() {
    const options = state.subjects.map(subject => `<option value="${subject.id}">${subject.icon} ${escapeHtml(subject.name)}</option>`).join("");
    [$("#focusSubject"), $("#taskSubject")].forEach(select => {
      const current = select.value;
      select.innerHTML = options;
      if ([...select.options].some(option => option.value === current)) select.value = current;
    });
  }

  let taskFilter = "all";
  function renderAgenda() {
    const today = localDate();
    let tasks = [...state.tasks].sort((a, b) => Number(a.completed) - Number(b.completed) || a.date.localeCompare(b.date));
    if (taskFilter === "open") tasks = tasks.filter(task => !task.completed);
    if (taskFilter === "today") tasks = tasks.filter(task => task.date === today);
    if (taskFilter === "completed") tasks = tasks.filter(task => task.completed);
    $("#openTaskCount").textContent = state.tasks.filter(task => !task.completed).length;
    $("#taskList").innerHTML = tasks.length ? tasks.map(task => {
      const subject = state.subjects.find(item => item.id === task.subjectId);
      const priorityLabel = { low: "Düşük", medium: "Orta", high: "Yüksek" }[task.priority] || "Orta";
      return `<div class="task-item ${task.completed ? "done" : ""}">
        <input class="task-check" type="checkbox" data-id="${task.id}" ${task.completed ? "checked" : ""} aria-label="Görevi tamamla" />
        <div><h4>${escapeHtml(task.title)}</h4><p>${subject?.icon || "•"} ${subject?.name || "Genel"}</p><div class="task-meta"><span class="tag priority-${task.priority}">${priorityLabel}</span><span class="tag">${prettyDate(task.date)}</span><span class="tag">${task.minutes} dk</span></div></div>
        <button class="icon-btn task-delete" data-id="${task.id}" aria-label="Görevi sil">×</button>
      </div>`;
    }).join("") : `<div class="empty-state">Bu filtrede görev bulunmuyor.</div>`;
    $$(".task-check").forEach(input => input.addEventListener("change", () => toggleTask(input.dataset.id, input.checked)));
    $$(".task-delete").forEach(button => button.addEventListener("click", () => {
      state.tasks = state.tasks.filter(task => task.id !== button.dataset.id);
      save(); renderAll();
    }));
  }

  function toggleTask(id, completed) {
    const task = state.tasks.find(item => item.id === id);
    if (!task) return;
    task.completed = completed;
    if (completed && !task.rewarded) {
      task.rewarded = true;
      state.daily.tasksCompleted += 1;
      reward(8, 4, "Görev tamamlandı: +8 XP");
    }
    save(); renderAll();
  }

  function renderMiki() {
    $("#mikiNameTitle").textContent = state.profile.mikiName;
    const costume = state.miki.equippedCostume;
    const costumeName = costume === "classic" ? "Klasik" : SHOP_ITEMS.find(item => item.id === costume)?.name || costume;
    $("#equippedCostumeTag").textContent = costumeName;
    const cat = $("#pixelCat");
    cat.className = `pixel-cat costume-${costume} mood-happy`;
    cat.setAttribute("aria-label", `${state.profile.mikiName}, ${costumeName} kostümüyle özgün piksel kedi`);
    const stats = [
      ["❤️ Sevgi", state.miki.love], ["🍖 Tokluk", state.miki.satiety], ["😴 Uyku", state.miki.sleep], ["😊 Mutluluk", state.miki.happiness]
    ];
    $("#mikiStats").innerHTML = stats.map(([label, value]) => `<div class="meter-row"><strong>${label}</strong><div class="meter"><span style="width:${value}%"></span></div><small>${value}</small></div>`).join("");

    const costumeIds = ["classic", ...SHOP_ITEMS.filter(item => item.type === "costume").map(item => item.id)];
    $("#wardrobe").innerHTML = costumeIds.map(id => {
      const owned = state.miki.ownedCostumes.includes(id);
      const item = SHOP_ITEMS.find(entry => entry.id === id);
      const name = id === "classic" ? "Klasik Miki" : item.name;
      return `<button class="wardrobe-card ${owned ? "" : "locked"} ${costume === id ? "active" : ""}" data-costume="${id}" ${owned ? "" : "disabled"}><strong>${id === "classic" ? "🐱" : item.icon} ${name}</strong><small>${owned ? costume === id ? "Kuşanıldı" : "Kuşan" : "Mağazada kilitli"}</small></button>`;
    }).join("");
    $$(".wardrobe-card:not(.locked)").forEach(button => button.addEventListener("click", () => {
      state.miki.equippedCostume = button.dataset.costume;
      save();
      $("#mikiSpeech").textContent = `${state.profile.mikiName} yeni görünümünü çok sevdi!`;
      renderMiki(); renderRoom();
    }));
  }

  function interactWithMiki(action) {
    const cat = $("#pixelCat");
    const messages = {
      pet: `${state.profile.mikiName} mırıldıyor.`,
      feed: `${state.profile.mikiName} karnını doyurdu.`,
      play: `${state.profile.mikiName} oyuncağın peşinden zıpladı!`,
      rest: `${state.profile.mikiName} biraz kestiriyor...`
    };
    if (action === "pet") { state.miki.love = clamp(state.miki.love + 8); state.miki.happiness = clamp(state.miki.happiness + 4); }
    if (action === "feed") { state.miki.satiety = clamp(state.miki.satiety + 18); state.miki.happiness = clamp(state.miki.happiness + 2); }
    if (action === "play") { state.miki.happiness = clamp(state.miki.happiness + 14); state.miki.sleep = clamp(state.miki.sleep - 5); }
    if (action === "rest") { state.miki.sleep = clamp(state.miki.sleep + 18); }
    state.daily.mikiInteractions += 1;
    $("#mikiSpeech").textContent = messages[action];
    cat.classList.remove("mood-play", "mood-sleep");
    cat.classList.add(action === "rest" ? "mood-sleep" : "mood-play");
    setTimeout(() => { cat.classList.remove("mood-play", "mood-sleep"); }, 1600);
    save(); renderHeader(); renderToday(); renderMiki();
  }

  function renderRoom() {
    const hour = new Date().getHours();
    const isNight = hour < 7 || hour >= 19;
    $("#roomTimeTag").textContent = isNight ? "Gece ışığı" : hour < 12 ? "Sabah ışığı" : "Gün ışığı";
    $("#roomScene").classList.toggle("night", isNight);
    $$('[data-room-item]').forEach(item => item.classList.toggle("hidden-item", !state.inventory.roomEquipped.includes(item.dataset.roomItem)));
    const costume = state.miki.equippedCostume;
    const costumeIcon = { chef:"🧑‍🍳", student:"🎓", pirate:"🏴‍☠️", wizard:"🪄", astronaut:"🚀" }[costume] || "🐱";
    $("#roomCat").textContent = costumeIcon === "🐱" ? "ฅ^•ﻌ•^ฅ" : `${costumeIcon} ฅ^•ﻌ•^ฅ`;
  }

  let shopFilter = "all";
  function renderShop() {
    const items = SHOP_ITEMS.filter(item => shopFilter === "all" || item.type === shopFilter);
    $("#shopGrid").innerHTML = items.map(item => {
      const owned = item.type === "costume" ? state.miki.ownedCostumes.includes(item.id) : item.type === "room" ? state.inventory.roomOwned.includes(item.id) : state.inventory.themesOwned.includes(item.id);
      const equipped = item.type === "costume" ? state.miki.equippedCostume === item.id : item.type === "room" ? state.inventory.roomEquipped.includes(item.id) : state.settings.theme === item.id;
      let buttonLabel = owned ? equipped ? "Kuşanıldı" : "Kuşan" : `Satın al · ${item.price}`;
      if (item.type === "room" && owned && equipped) buttonLabel = "Odadan kaldır";
      return `<article class="shop-item" data-type="${item.type}"><div class="shop-art">${item.icon}</div><h3>${item.name}</h3><p>${item.description}</p><div class="shop-price">${owned ? "Sahipsin" : `🪙 ${item.price}`}</div><button class="${owned ? "secondary-btn" : "primary-btn"} shop-action" data-id="${item.id}" ${item.type !== "room" && equipped ? "disabled" : ""}>${buttonLabel}</button></article>`;
    }).join("");
    $$(".shop-action").forEach(button => button.addEventListener("click", () => handleShopAction(button.dataset.id)));
  }

  function handleShopAction(id) {
    const item = SHOP_ITEMS.find(entry => entry.id === id);
    if (!item) return;
    const owned = item.type === "costume" ? state.miki.ownedCostumes.includes(id) : item.type === "room" ? state.inventory.roomOwned.includes(id) : state.inventory.themesOwned.includes(id);
    if (!owned) {
      if (state.wallet.coins < item.price) return toast("Bu eşya için yeterli coinin yok.");
      state.wallet.coins -= item.price;
      if (item.type === "costume") state.miki.ownedCostumes.push(id);
      if (item.type === "room") { state.inventory.roomOwned.push(id); state.inventory.roomEquipped.push(id); }
      if (item.type === "theme") { state.inventory.themesOwned.push(id); state.settings.theme = id; }
      toast(`${item.name} satın alındı!`);
    } else if (item.type === "costume") {
      state.miki.equippedCostume = id;
      toast(`${item.name} kuşanıldı.`);
    } else if (item.type === "room") {
      const index = state.inventory.roomEquipped.indexOf(id);
      if (index >= 0) state.inventory.roomEquipped.splice(index, 1);
      else state.inventory.roomEquipped.push(id);
    } else if (item.type === "theme") {
      state.settings.theme = id;
      toast(`${item.name} etkinleştirildi.`);
    }
    save(); renderAll();
  }

  function renderFriends() {
    $("#friendCode").textContent = state.profile.friendCode;
    $("#friendList").innerHTML = state.friends.length ? state.friends.map(friend => {
      const seed = hashString(friend.code.toUpperCase());
      const poms = seed % 9;
      const level = 1 + (Math.floor(seed / 13) % 35);
      const streak = Math.floor(seed / 31) % 60;
      return `<article class="friend-card"><div class="friend-card-head"><div class="friend-avatar">${["🐱","🦊","🐼","🐰"][seed % 4]}</div><div><h3>${escapeHtml(friend.name)}</h3><small class="muted">${escapeHtml(friend.code.toUpperCase())}</small></div></div><div class="friend-stats"><div><strong>${poms}</strong><small>Bugün</small></div><div><strong>${level}</strong><small>Seviye</small></div><div><strong>${streak}</strong><small>Seri</small></div></div><div class="button-row"><button class="secondary-btn visit-room" data-code="${escapeHtml(friend.code)}" data-name="${escapeHtml(friend.name)}">Odasını gez</button><button class="ghost-btn remove-friend" data-id="${friend.id}">Sil</button></div></article>`;
    }).join("") : `<div class="empty-state">Henüz arkadaş eklemedin.</div>`;
    $$(".remove-friend").forEach(button => button.addEventListener("click", () => {
      state.friends = state.friends.filter(friend => friend.id !== button.dataset.id); save(); renderFriends();
    }));
    $$(".visit-room").forEach(button => button.addEventListener("click", () => visitFriendRoom(button.dataset.name, button.dataset.code)));
  }

  function visitFriendRoom(name, code) {
    const seed = hashString(code);
    const themes = ["Sakura", "Forest", "Cozy", "Dark Academia"];
    const theme = themes[seed % themes.length];
    $("#visitedRoom").innerHTML = `<p class="eyebrow">ODA ZİYARETİ</p><h2>${escapeHtml(name)}'in odası</h2><p class="muted">${theme} teması · Yerel önizleme</p><div class="visited-room-scene"><span>${["🐱","🦊","🐼","🐰"][seed % 4]} 🪴 📚 💡</span></div><p class="tiny muted">Gerçek eş zamanlı oda verileri V15'in statik GitHub Pages sürümünde bulunmaz. Bu görünüm arkadaş kodundan tutarlı biçimde üretilir.</p>`;
    $("#roomDialog").showModal();
  }

  function renderStats() {
    const focusSessions = state.sessions.filter(session => session.type === "focus");
    const totalMinutes = focusSessions.reduce((sum, session) => sum + session.minutes, 0);
    $("#totalPomodoros").textContent = focusSessions.length;
    $("#totalHours").textContent = `${(totalMinutes / 60).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} sa`;
    $("#averageFocus").textContent = `${focusSessions.length ? Math.round(totalMinutes / focusSessions.length) : 0} dk`;
    $("#longestStreak").textContent = `${state.streak.longest} gün`;

    const dates = Array.from({ length: 7 }, (_, index) => dateShift(localDate(), index - 6));
    const totals = dates.map(date => focusSessions.filter(session => session.date === date).reduce((sum, session) => sum + session.minutes, 0));
    const max = Math.max(...totals, 1);
    const formatter = new Intl.DateTimeFormat("tr-TR", { weekday: "short" });
    $("#weeklyChart").innerHTML = dates.map((date, index) => {
      const [y, m, d] = date.split("-").map(Number);
      return `<div class="bar-column"><div class="bar" style="height:${Math.max(4, (totals[index] / max) * 180)}px" title="${totals[index]} dakika"></div><strong>${totals[index]} dk</strong><small>${formatter.format(new Date(y, m - 1, d)).replace(".", "")}</small></div>`;
    }).join("");
    const bestIndex = totals.indexOf(Math.max(...totals));
    $("#bestDay").textContent = totals[bestIndex] ? `En iyi: ${prettyDate(dates[bestIndex])}` : "Henüz veri yok";

    const subjectMap = new Map();
    focusSessions.forEach(session => subjectMap.set(session.subjectId, (subjectMap.get(session.subjectId) || 0) + session.minutes));
    const subjectEntries = [...subjectMap.entries()].sort((a, b) => b[1] - a[1]);
    const subjectMax = Math.max(...subjectEntries.map(entry => entry[1]), 1);
    $("#subjectStats").innerHTML = subjectEntries.length ? subjectEntries.map(([id, minutes]) => {
      const subject = state.subjects.find(item => item.id === id);
      return `<div class="subject-row"><strong>${subject?.icon || "•"} ${escapeHtml(subject?.name || "Silinmiş ders")}</strong><div class="progress-track"><span style="width:${(minutes / subjectMax) * 100}%"></span></div><small>${minutes} dk</small></div>`;
    }).join("") : `<div class="empty-state">İlk odak seansından sonra ders dağılımın burada görünecek.</div>`;
  }

  function renderSettings() {
    $("#appNameInput").value = state.profile.appName;
    $("#mikiNameInput").value = state.profile.mikiName;
    $("#themeSelect").value = state.settings.theme;
    $$("#themeSelect option").forEach(option => { option.disabled = !state.inventory.themesOwned.includes(option.value); });
    $("#focusMinutesInput").value = state.settings.focusMinutes;
    $("#shortMinutesInput").value = state.settings.shortMinutes;
    $("#longMinutesInput").value = state.settings.longMinutes;
    $("#subjectList").innerHTML = state.subjects.map(subject => `<span class="chip">${subject.icon} ${escapeHtml(subject.name)}${DEFAULT_SUBJECTS.some(def => def.id === subject.id) ? "" : ` <button class="icon-btn remove-subject" data-id="${subject.id}" aria-label="Dersi sil">×</button>`}</span>`).join("");
    $$(".remove-subject").forEach(button => button.addEventListener("click", () => {
      if (state.tasks.some(task => task.subjectId === button.dataset.id) || state.sessions.some(session => session.subjectId === button.dataset.id)) return toast("Bu ders geçmiş kayıtlarda kullanıldığı için silinemez.");
      state.subjects = state.subjects.filter(subject => subject.id !== button.dataset.id); save(); renderAll();
    }));
  }

  function renderAll() {
    ensureDailyState();
    renderHeader();
    renderSubjectSelects();
    renderToday();
    renderAgenda();
    renderMiki();
    renderRoom();
    renderShop();
    renderFriends();
    renderStats();
    renderSettings();
    $("#focusTodayCount").textContent = state.daily.pomodoros;
  }

  // Timer
  const timer = { mode: "focus", total: 0, remaining: 0, running: false, interval: null };
  const modeToMinutes = mode => mode === "focus" ? state.settings.focusMinutes : mode === "short" ? state.settings.shortMinutes : state.settings.longMinutes;

  function setTimerMode(mode, preserveRunning = false) {
    if (!preserveRunning) stopTimerInterval();
    timer.mode = mode;
    timer.total = modeToMinutes(mode) * 60;
    timer.remaining = timer.total;
    $$(".mode-btn").forEach(button => button.classList.toggle("active", button.dataset.mode === mode));
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timer.remaining / 60);
    const seconds = timer.remaining % 60;
    $("#timerDisplay").textContent = `${pad(minutes)}:${pad(seconds)}`;
    const elapsed = timer.total ? ((timer.total - timer.remaining) / timer.total) * 100 : 0;
    $("#timerProgress").style.width = `${clamp(elapsed, 0, 100)}%`;
    document.title = timer.running ? `${pad(minutes)}:${pad(seconds)} · ${state.profile.appName}` : `${state.profile.appName} V15`;
  }

  function startTimer() {
    if (timer.running) return;
    timer.running = true;
    $("#timerStatus").textContent = timer.mode === "focus" ? "Odak seansı sürüyor." : "Molanın tadını çıkar.";
    timer.interval = setInterval(() => {
      timer.remaining -= 1;
      if (timer.remaining <= 0) completeTimer();
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimerInterval() {
    clearInterval(timer.interval);
    timer.interval = null;
    timer.running = false;
  }

  function pauseTimer() {
    stopTimerInterval();
    $("#timerStatus").textContent = "Sayaç duraklatıldı.";
    updateTimerDisplay();
  }

  function resetTimer() {
    stopTimerInterval();
    timer.total = modeToMinutes(timer.mode) * 60;
    timer.remaining = timer.total;
    $("#timerStatus").textContent = "Sayaç sıfırlandı.";
    updateTimerDisplay();
  }

  function completeTimer() {
    stopTimerInterval();
    beep();
    if (timer.mode === "focus") {
      const minutes = modeToMinutes("focus");
      const subjectId = $("#focusSubject").value || state.subjects[0]?.id;
      state.sessions.push({ id: uid("session"), type: "focus", date: localDate(), timestamp: Date.now(), minutes, subjectId });
      state.daily.pomodoros += 1;
      state.daily.focusMinutes += minutes;
      state.miki.love = clamp(state.miki.love + 2);
      state.miki.happiness = clamp(state.miki.happiness + 3);
      updateStreak();
      reward(20, 10, "Pomodoro tamamlandı: +20 XP, +10 coin");
      setTimerMode("short");
      $("#timerStatus").textContent = "Harika! Şimdi kısa bir mola.";
    } else {
      setTimerMode("focus");
      $("#timerStatus").textContent = "Mola bitti. Yeni bir odak turuna hazır mısın?";
    }
    save(); renderAll();
  }

  function beep() {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 660;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.55);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.6);
    } catch { /* ses zorunlu değil */ }
  }

  // Procedural ambient audio
  let audio = { context: null, source: null, nodes: [], gain: null, type: "off" };

  function stopAmbient() {
    try { audio.source?.stop(); } catch { /* already stopped */ }
    audio.nodes.forEach(node => { try { node.disconnect(); } catch { /* noop */ } });
    audio = { context: audio.context, source: null, nodes: [], gain: null, type: "off" };
  }

  function startAmbient(type) {
    stopAmbient();
    audio.type = type;
    if (type === "off") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return toast("Tarayıcın ortam sesini desteklemiyor.");
    audio.context ||= new AudioContext();
    if (audio.context.state === "suspended") audio.context.resume();
    const ctx = audio.context;
    const length = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      if (type === "fire") {
        const crackle = Math.random() > 0.995 ? (Math.random() * 2 - 1) * 2.5 : 0;
        data[i] = white * 0.18 + crackle;
      } else if (type === "wind" || type === "forest") {
        last = last * 0.985 + white * 0.015;
        data[i] = last * 3.2;
      } else {
        data[i] = white;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer; source.loop = true;
    const filter = ctx.createBiquadFilter();
    if (type === "rain") { filter.type = "highpass"; filter.frequency.value = 900; }
    if (type === "forest") { filter.type = "lowpass"; filter.frequency.value = 950; }
    if (type === "fire") { filter.type = "lowpass"; filter.frequency.value = 1800; }
    if (type === "wind") { filter.type = "bandpass"; filter.frequency.value = 420; filter.Q.value = 0.7; }
    if (type === "white") { filter.type = "allpass"; }
    const gain = ctx.createGain();
    gain.gain.value = state.settings.volume;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    audio.source = source; audio.nodes = [source, filter, gain]; audio.gain = gain;
  }

  function bindEvents() {
    $$(".nav-btn").forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
    $$('[data-go]').forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
    window.addEventListener("hashchange", () => navigate(location.hash.slice(1) || "today", false));

    $$(".mode-btn").forEach(button => button.addEventListener("click", () => setTimerMode(button.dataset.mode)));
    $("#startTimer").addEventListener("click", startTimer);
    $("#pauseTimer").addEventListener("click", pauseTimer);
    $("#resetTimer").addEventListener("click", resetTimer);

    $$(".sound-btn").forEach(button => button.addEventListener("click", () => {
      $$(".sound-btn").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      startAmbient(button.dataset.sound);
    }));
    $("#volumeControl").value = state.settings.volume;
    $("#volumeControl").addEventListener("input", event => {
      state.settings.volume = Number(event.target.value);
      if (audio.gain) audio.gain.gain.value = state.settings.volume;
      save();
    });

    $("#taskDate").value = localDate();
    $("#taskForm").addEventListener("submit", event => {
      event.preventDefault();
      state.tasks.push({
        id: uid("task"), title: $("#taskTitle").value.trim(), subjectId: $("#taskSubject").value,
        priority: $("#taskPriority").value, date: $("#taskDate").value, minutes: Number($("#taskMinutes").value) || 30,
        completed: false, rewarded: false, createdAt: Date.now()
      });
      event.target.reset(); $("#taskDate").value = localDate(); $("#taskMinutes").value = 30;
      save(); renderAll(); toast("Görev ajandaya eklendi.");
    });
    $$(".filter-btn").forEach(button => button.addEventListener("click", () => {
      taskFilter = button.dataset.filter; $$(".filter-btn").forEach(item => item.classList.toggle("active", item === button)); renderAgenda();
    }));

    $$(".pet-action").forEach(button => button.addEventListener("click", () => interactWithMiki(button.dataset.petAction)));
    $$(".shop-tab").forEach(button => button.addEventListener("click", () => {
      shopFilter = button.dataset.shopFilter; $$(".shop-tab").forEach(item => item.classList.toggle("active", item === button)); renderShop();
    }));

    $("#friendForm").addEventListener("submit", event => {
      event.preventDefault();
      const name = $("#friendName").value.trim();
      const code = $("#friendCodeInput").value.trim().toUpperCase();
      if (!/^[A-Z0-9]{2,5}-[A-Z0-9]{3,6}$/.test(code)) return toast("Kod biçimi UYG-7A93 gibi olmalı.");
      if (state.friends.some(friend => friend.code.toUpperCase() === code)) return toast("Bu arkadaş zaten listende.");
      state.friends.push({ id: uid("friend"), name, code });
      event.target.reset(); save(); renderFriends(); toast("Arkadaş eklendi.");
    });
    $("#closeRoomDialog").addEventListener("click", () => $("#roomDialog").close());

    $("#profileForm").addEventListener("submit", event => {
      event.preventDefault();
      state.profile.appName = $("#appNameInput").value.trim() || "Berna";
      state.profile.mikiName = $("#mikiNameInput").value.trim() || "Miki";
      const theme = $("#themeSelect").value;
      if (state.inventory.themesOwned.includes(theme)) state.settings.theme = theme;
      save(); renderAll(); toast("Kişiselleştirme kaydedildi.");
    });
    $("#timerSettingsForm").addEventListener("submit", event => {
      event.preventDefault();
      state.settings.focusMinutes = clamp(Number($("#focusMinutesInput").value), 1, 180);
      state.settings.shortMinutes = clamp(Number($("#shortMinutesInput").value), 1, 60);
      state.settings.longMinutes = clamp(Number($("#longMinutesInput").value), 1, 90);
      save(); setTimerMode(timer.mode); renderSettings(); toast("Sayaç süreleri kaydedildi.");
    });
    $("#subjectForm").addEventListener("submit", event => {
      event.preventDefault();
      const name = $("#subjectNameInput").value.trim();
      const icon = $("#subjectIconInput").value.trim() || "📘";
      if (state.subjects.some(subject => subject.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR"))) return toast("Bu ders zaten var.");
      state.subjects.push({ id: uid("subject"), name, icon });
      event.target.reset(); save(); renderAll(); toast("Ders eklendi.");
    });

    $("#exportData").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = `berna-yedek-${localDate()}.json`; link.click(); URL.revokeObjectURL(url);
    });
    $("#importData").addEventListener("change", async event => {
      const file = event.target.files?.[0]; if (!file) return;
      try { state = mergeState(JSON.parse(await file.text())); ensureDailyState(); save(); renderAll(); setTimerMode("focus"); toast("Yedek başarıyla içe aktarıldı."); }
      catch { toast("Bu JSON yedeği okunamadı."); }
      event.target.value = "";
    });
    $("#resetData").addEventListener("click", () => {
      if (!confirm("Tüm Berna verileri silinsin mi? Bu işlem geri alınamaz.")) return;
      state = defaultState(); save(); renderAll(); setTimerMode("focus"); toast("Berna sıfırlandı.");
    });
  }

  function navigate(page, updateHash = true) {
    const target = document.getElementById(page) ? page : "today";
    $$(".page").forEach(section => section.classList.toggle("active", section.id === target));
    $$(".nav-btn").forEach(button => button.classList.toggle("active", button.dataset.page === target));
    if (updateHash && location.hash !== `#${target}`) history.pushState(null, "", `#${target}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (target === "stats") renderStats();
  }

  let deferredInstallPrompt = null;
  function setupPwa() {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault(); deferredInstallPrompt = event; $("#installBtn").classList.remove("hidden");
    });
    $("#installBtn").addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice; deferredInstallPrompt = null; $("#installBtn").classList.add("hidden");
    });
  }

  function init() {
    ensureDailyState();
    bindEvents();
    renderAll();
    setTimerMode("focus");
    navigate(location.hash.slice(1) || "today", false);
    setupPwa();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
