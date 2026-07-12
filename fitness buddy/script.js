/* ═══════════════════════════════════════════════════════════════════════════
   Fitness Buddy AI — script.js
   Complete frontend logic, IBM Granite API integration, all features
═══════════════════════════════════════════════════════════════════════════ */

"use strict";

// ── API Base URL (from config.js or fallback) ─────────────────────────────
const API_BASE = window.FITNESS_CONFIG?.apiBase ?? "";

// ── App State ──────────────────────────────────────────────────────────────
const state = {
  profile: null,
  habits:  { workout: false, water: false, sleep: false, meal: false },
  chatHistory: [],
  theme: localStorage.getItem("fb_theme") || "dark",
};

// ══════════════════════════════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════════════════════════════
function initTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const icon = document.getElementById("themeIcon");
  if (icon) icon.textContent = state.theme === "dark" ? "🌙" : "☀️";
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("fb_theme", state.theme);
  initTheme();
  showToast(state.theme === "dark" ? "🌙 Dark mode on" : "☀️ Light mode on", "success");
}

// ══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════════════════
function initNavigation() {
  const navbar    = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");
  const links     = document.querySelectorAll(".nav-link");

  // Sticky nav shadow
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
    updateActiveLink();
  });

  // Hamburger menu
  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  // Close menu on link click
  links.forEach(link => {
    link.addEventListener("click", () => {
      hamburger?.classList.remove("open");
      navLinks?.classList.remove("open");
    });
  });
}

function updateActiveLink() {
  const sections = document.querySelectorAll("section[id]");
  const scrollY  = window.scrollY + 80;
  let current    = "";

  sections.forEach(s => {
    if (scrollY >= s.offsetTop) current = s.getAttribute("id");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// ══════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ══════════════════════════════════════════════════════════════════════════
function saveProfile(evt) {
  evt.preventDefault();

  const profile = {
    name:         document.getElementById("userName").value.trim(),
    age:          document.getElementById("userAge").value,
    gender:       document.getElementById("userGender").value,
    height:       document.getElementById("userHeight").value,
    weight:       document.getElementById("userWeight").value,
    goal:         document.getElementById("userGoal").value,
    activity:     document.getElementById("userActivity").value,
    diet:         document.getElementById("userDiet").value,
    workout_time: document.getElementById("userWorkoutTime").value || "30",
  };

  state.profile = profile;
  localStorage.setItem("fb_profile", JSON.stringify(profile));

  // Pre-fill BMI fields from profile
  const bmiW = document.getElementById("bmiWeight");
  const bmiH = document.getElementById("bmiHeight");
  const bmiA = document.getElementById("bmiAge");
  if (bmiW) bmiW.value = profile.weight;
  if (bmiH) bmiH.value = profile.height;
  if (bmiA) bmiA.value = profile.age;

  const banner = document.getElementById("profileBanner");
  banner?.classList.remove("hidden");
  setTimeout(() => banner?.classList.add("hidden"), 4000);

  showToast("✅ Profile saved! AI features unlocked.", "success");
  refreshDashboard();
}

function clearProfile() {
  document.getElementById("profileForm").reset();
  state.profile = null;
  localStorage.removeItem("fb_profile");
  showToast("Profile cleared.", "success");
}

function loadSavedProfile() {
  const saved = localStorage.getItem("fb_profile");
  if (!saved) return;
  try {
    const p = JSON.parse(saved);
    state.profile = p;
    const fields = {
      userName:        p.name,
      userAge:         p.age,
      userGender:      p.gender,
      userHeight:      p.height,
      userWeight:      p.weight,
      userGoal:        p.goal,
      userActivity:    p.activity,
      userDiet:        p.diet,
      userWorkoutTime: p.workout_time,
    };
    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    });

    // Pre-fill BMI
    const bmiW = document.getElementById("bmiWeight");
    const bmiH = document.getElementById("bmiHeight");
    const bmiA = document.getElementById("bmiAge");
    if (bmiW) bmiW.value = p.weight;
    if (bmiH) bmiH.value = p.height;
    if (bmiA) bmiA.value = p.age;
  } catch (_) { /* ignore */ }
}

function loadSavedHabits() {
  const saved = localStorage.getItem("fb_habits_" + getTodayKey());
  if (!saved) return;
  try {
    const h = JSON.parse(saved);
    state.habits = h;
    Object.keys(h).forEach(k => { if (h[k]) applyHabitUI(k, true); });
    updateHabitsRing();
  } catch (_) { /* ignore */ }
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
async function refreshDashboard() {
  const date = document.getElementById("dashDate");
  if (date) date.textContent = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  if (!state.profile) {
    setDashDefault();
    return;
  }

  try {
    const res = await apiPost("/api/dashboard", {
      profile: state.profile,
      habits:  state.habits,
    });
    applyDashboard(res);
  } catch (err) {
    // Fallback: calculate client-side
    const clientData = calcDashboardClient();
    applyDashboard(clientData);
  }
}

function calcDashboardClient() {
  const p      = state.profile;
  const weight = parseFloat(p.weight) || 70;
  const height = parseFloat(p.height) / 100 || 1.75;
  const age    = parseInt(p.age) || 25;
  const gender = p.gender || "Other";
  const bmi    = +(weight / (height * height)).toFixed(1);

  const bmrMap = gender.toLowerCase().includes("male")
    ? 88.362 + 13.397*weight + 4.799*height*100 - 5.677*age
    : 447.593 + 9.247*weight + 3.098*height*100 - 4.330*age;

  const actMap = { Sedentary:1.2, Light:1.375, Moderate:1.55, Active:1.725, "Very Active":1.9 };
  const tdee   = Math.round(bmrMap * (actMap[p.activity] || 1.55));
  const goal   = p.goal || "";
  const cal    = goal.includes("Loss") ? tdee - 500 : goal.includes("Gain") || goal.includes("Muscle") ? tdee + 300 : tdee;

  const habitsDone  = Object.values(state.habits).filter(Boolean).length;
  const habitsTotal = Object.keys(state.habits).length || 4;

  return {
    bmi, calories_target: cal, water_ml: Math.round(weight*35),
    protein_g: Math.round(weight * (goal.includes("Muscle") ? 1.6 : 1.2)),
    habits_done: habitsDone, habits_total: habitsTotal,
    progress_pct: Math.round((habitsDone/habitsTotal)*100),
    date: new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" }),
  };
}

function applyDashboard(data) {
  setText("dashBMIVal",     data.bmi ?? "—");
  setText("dashBMICat",     getBMICategory(data.bmi));
  setText("dashCalVal",     data.calories_target ? data.calories_target.toLocaleString() : "—");
  setText("dashCalSub",     `TDEE: ${(data.tdee || 0).toLocaleString()} kcal`);
  setText("dashWaterVal",   data.water_ml ? data.water_ml.toLocaleString() : "—");
  setText("dashProteinVal", data.protein_g ?? "—");
  setText("dashGoalVal",    state.profile?.goal ?? "—");
  setText("dashProgressSub", `${data.habits_done ?? 0} of ${data.habits_total ?? 4} habits done today`);

  const bar = document.getElementById("dashProgressBar");
  if (bar) bar.style.width = (data.progress_pct ?? 0) + "%";
}

function setDashDefault() {
  ["dashBMIVal","dashCalVal","dashWaterVal","dashProteinVal"].forEach(id => setText(id, "—"));
  setText("dashBMICat",     "Set your profile");
  setText("dashCalSub",     "kcal / day");
  setText("dashGoalVal",    "—");
  setText("dashProgressSub","Complete your habits to track progress");
}

function getBMICategory(bmi) {
  if (!bmi || isNaN(bmi)) return "—";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25)   return "Normal weight";
  if (bmi < 30)   return "Overweight";
  return "Obese";
}

// ══════════════════════════════════════════════════════════════════════════
// WORKOUT PLAN
// ══════════════════════════════════════════════════════════════════════════
async function generateWorkout() {
  if (!requireProfile("generate a workout plan")) return;
  showLoader("workoutLoader");
  hideEl("workoutResult");

  try {
    const data = await apiPost("/api/workout", { profile: state.profile });
    displayResult("workoutResult", "workoutContent", data.result);
    showToast("💪 Workout plan ready!", "success");
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  } finally {
    hideLoader("workoutLoader");
  }
}

// ══════════════════════════════════════════════════════════════════════════
// NUTRITION
// ══════════════════════════════════════════════════════════════════════════
async function generateNutrition() {
  if (!requireProfile("generate a nutrition plan")) return;
  showLoader("nutritionLoader");
  hideEl("nutritionResult");

  try {
    const data = await apiPost("/api/nutrition", { profile: state.profile });
    displayResult("nutritionResult", "nutritionContent", data.result);
    showToast("🥗 Nutrition plan ready!", "success");
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  } finally {
    hideLoader("nutritionLoader");
  }
}

// ══════════════════════════════════════════════════════════════════════════
// DAILY MOTIVATION
// ══════════════════════════════════════════════════════════════════════════
async function generateMotivation() {
  showLoader("motivationLoader");
  hideEl("motivationResult");

  try {
    const data = await apiPost("/api/motivation", { profile: state.profile || {} });
    displayResult("motivationResult", "motivationContent", data.result);
    showToast("🌟 Daily motivation ready!", "success");
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  } finally {
    hideLoader("motivationLoader");
  }
}

// ══════════════════════════════════════════════════════════════════════════
// BMI CALCULATOR
// ══════════════════════════════════════════════════════════════════════════
async function calculateBMI() {
  const weight = parseFloat(document.getElementById("bmiWeight")?.value);
  const height = parseFloat(document.getElementById("bmiHeight")?.value);
  const age    = parseInt(document.getElementById("bmiAge")?.value)   || 25;
  const gender = document.getElementById("bmiGender")?.value          || "Other";
  const goal   = document.getElementById("bmiGoal")?.value            || "General Fitness";

  if (!weight || !height || weight <= 0 || height <= 0) {
    showToast("⚠️ Please enter valid weight and height.", "error");
    return;
  }

  // Client-side BMI calculation for instant gauge update
  const bmiVal  = +(weight / ((height / 100) ** 2)).toFixed(1);
  const category = getBMICategory(bmiVal);
  const minW    = +(18.5 * ((height / 100) ** 2)).toFixed(1);
  const maxW    = +(24.9 * ((height / 100) ** 2)).toFixed(1);

  updateGauge(bmiVal);
  showEl("bmiStatsRow");
  setText("bmiStatVal",   bmiVal);
  setText("bmiStatCat",   category);
  setText("bmiStatRange", `${minW} – ${maxW} kg`);

  showLoader("bmiLoader");
  hideEl("bmiAdvice");

  try {
    const data = await apiPost("/api/bmi", { weight, height, age, gender, goal });
    displayResult("bmiAdvice", "bmiAdviceContent", data.advice);
    showToast("⚖️ BMI analysis complete!", "success");
  } catch (err) {
    // Show basic advice if AI fails
    const fallback = `Your BMI is ${bmiVal} — ${category}. Healthy weight range for your height: ${minW}–${maxW} kg. Consider consulting a healthcare professional for personalized advice.`;
    displayResult("bmiAdvice", "bmiAdviceContent", fallback);
  } finally {
    hideLoader("bmiLoader");
  }
}

function updateGauge(bmi) {
  const arc     = document.getElementById("gaugeArc");
  const bmiText = document.getElementById("gaugeBMIText");
  const catText = document.getElementById("gaugeCatText");
  if (!arc) return;

  // Map BMI 10–40 to 0–251 (full arc)
  const pct      = Math.min(Math.max((bmi - 10) / 30, 0), 1);
  const offset   = 251 - pct * 251;
  arc.style.strokeDashoffset = offset;

  // Color based on category
  const colors = { "Underweight":"#3b82f6", "Normal weight":"#22c55e", "Overweight":"#f59e0b", "Obese":"#ef4444" };
  const cat    = getBMICategory(bmi);
  arc.style.stroke = colors[cat] || "#6366f1";

  bmiText.textContent = bmi;
  catText.textContent = cat;
}

// ══════════════════════════════════════════════════════════════════════════
// HABIT TRACKER
// ══════════════════════════════════════════════════════════════════════════
function toggleHabit(key) {
  state.habits[key] = !state.habits[key];
  applyHabitUI(key, state.habits[key]);
  updateHabitsRing();
  saveHabits();
  refreshDashboard();
}

function applyHabitUI(key, done) {
  const card  = document.getElementById("habit" + cap(key));
  const check = document.getElementById("check"  + cap(key));
  if (card)  card.classList.toggle("done", done);
  if (check) check.style.background = done ? "var(--accent-4)" : "";
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function updateHabitsRing() {
  const done  = Object.values(state.habits).filter(Boolean).length;
  const total = Object.keys(state.habits).length;
  const pct   = Math.round((done / total) * 100);

  const ring    = document.getElementById("habitRing");
  const pctText = document.getElementById("habitPctText");
  const count   = document.getElementById("habitsCount");

  if (ring)    ring.style.strokeDashoffset = 314 - (314 * done / total);
  if (pctText) pctText.textContent = pct + "%";
  if (count)   count.textContent   = `${done} / ${total} habits completed`;
}

function saveHabits() {
  localStorage.setItem("fb_habits_" + getTodayKey(), JSON.stringify(state.habits));
}

async function getHabitTip() {
  showLoader("habitLoader");
  hideEl("habitTipResult");

  try {
    const data = await apiPost("/api/habits/tip", {
      habits:  state.habits,
      profile: state.profile || {},
    });
    displayResult("habitTipResult", "habitTipContent", data.tip);
    showToast("💡 Habit tip received!", "success");
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  } finally {
    hideLoader("habitLoader");
  }
}

// ══════════════════════════════════════════════════════════════════════════
// AI CHAT
// ══════════════════════════════════════════════════════════════════════════
function handleChatKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
  // Auto-resize textarea
  const ta = document.getElementById("chatInput");
  if (ta) {
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }
}

function sendSuggestion(btn) {
  const input = document.getElementById("chatInput");
  if (input) {
    input.value = btn.textContent;
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const input   = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSendBtn");
  const message = input?.value.trim();
  if (!message) return;

  // Clear input
  if (input) { input.value = ""; input.style.height = "auto"; }
  if (sendBtn) sendBtn.disabled = true;

  // Add user message to UI
  appendChatMsg("user", message);

  // Add to history
  state.chatHistory.push({ role: "user", content: message });

  // Show typing indicator
  const typingId = appendTyping();

  try {
    const data = await apiPost("/api/chat", {
      message,
      profile: state.profile || {},
      history: state.chatHistory.slice(-8),
    });
    removeTyping(typingId);
    const reply = data.response || "I couldn't generate a response. Please try again.";
    appendChatMsg("ai", reply);
    state.chatHistory.push({ role: "assistant", content: reply });

    // Keep history trimmed
    if (state.chatHistory.length > 30) state.chatHistory = state.chatHistory.slice(-30);
  } catch (err) {
    removeTyping(typingId);
    appendChatMsg("ai", `Sorry, I couldn't connect to the AI right now. Please check your IBM Cloud credentials and try again.\n\nError: ${err.message}`);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    input?.focus();
  }
}

function appendChatMsg(role, text) {
  const messages = document.getElementById("chatMessages");
  if (!messages) return;

  const isAI    = role === "ai";
  const now     = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  const msgDiv  = document.createElement("div");
  msgDiv.className = `chat-msg ${isAI ? "ai-msg" : "user-msg"}`;

  msgDiv.innerHTML = `
    <div class="msg-avatar">${isAI ? "🤖" : "👤"}</div>
    <div class="msg-bubble">
      ${escapeHtml(text).replace(/\n/g, "<br>")}
      <div class="msg-time">${now}</div>
    </div>
  `;

  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
}

function appendTyping() {
  const messages = document.getElementById("chatMessages");
  if (!messages) return null;

  const id  = "typing-" + Date.now();
  const div = document.createElement("div");
  div.id        = id;
  div.className = "chat-msg ai-msg";
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="chat-typing">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

function clearChat() {
  const messages = document.getElementById("chatMessages");
  if (!messages) return;
  state.chatHistory = [];
  messages.innerHTML = `
    <div class="chat-msg ai-msg">
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">
        Hi again! How can I help you with your fitness goals today?
        <div class="msg-time">Just now</div>
      </div>
    </div>
  `;
  showToast("Chat cleared.", "success");
}

// ══════════════════════════════════════════════════════════════════════════
// API HELPERS
// ══════════════════════════════════════════════════════════════════════════
async function apiPost(endpoint, body) {
  const url = API_BASE + endpoint;
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ══════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════════════════════
function showLoader(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}
function hideLoader(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}
function showEl(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}
function hideEl(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function displayResult(containerId, contentId, text) {
  const container = document.getElementById(containerId);
  const content   = document.getElementById(contentId);
  if (container) container.classList.remove("hidden");
  if (content)   content.innerHTML = formatAIResponse(text);
}
function escapeHtml(str) {
  return str
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
function formatAIResponse(text) {
  if (!text) return "";
  return escapeHtml(text)
    // Bold **text**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Markdown-style headers
    .replace(/^#{1,3} (.+)$/gm, "<strong style='font-size:1rem;color:var(--text-primary)'>$1</strong>")
    // Bullet points
    .replace(/^[-•] (.+)$/gm, "• $1")
    // Newlines to <br>
    .replace(/\n/g, "<br>");
}

function requireProfile(action) {
  if (state.profile) return true;
  showToast(`⚠️ Please save your profile first to ${action}.`, "error");
  scrollToSection("profile");
  return false;
}

function copyResult(contentId) {
  const el = document.getElementById(contentId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text)
    .then(()  => showToast("📋 Copied to clipboard!", "success"))
    .catch(() => showToast("Copy failed.", "error"));
}

// ══════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════
function showToast(message, type = "success", duration = 3500) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === "success" ? "✅" : "❌"}</span> ${escapeHtml(message)}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove());
  }, duration);
}

// ══════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════
function init() {
  initTheme();
  initNavigation();
  loadSavedProfile();
  loadSavedHabits();
  refreshDashboard();

  // Theme toggle button
  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);

  // Set today's date in dashboard
  const dashDate = document.getElementById("dashDate");
  if (dashDate) {
    dashDate.textContent = new Date().toLocaleDateString("en-US", {
      weekday:"long", year:"numeric", month:"long", day:"numeric"
    });
  }

  // Auto-generate motivation on load if profile exists
  if (state.profile) {
    setTimeout(() => refreshDashboard(), 500);
  }
}

// Run on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
