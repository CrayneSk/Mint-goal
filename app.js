// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWVNHO-YCKX0xFMvVsAx2vByquADBMDrQ",
  authDomain: "goal-mint.firebaseapp.com",
  projectId: "goal-mint",
  storageBucket: "goal-mint.firebasestorage.app",
  messagingSenderId: "251716328908",
  appId: "1:251716328908:web:f268362ed2ba17ab9f5169",
  measurementId: "G-NMCQP75NL7"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global state
let currentUser = null;
let userDocRef = null;
let habits = [];
let userSettings = { theme: 'growth', trackingMode: 'intense' };

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');

// Auth UI
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const authError = document.getElementById('auth-error');

// Dashboard
const greetingText = document.getElementById('greeting-text');
const currentDateEl = document.getElementById('current-date');
const morningHabitsDiv = document.getElementById('morning-habits');
const eveningHabitsDiv = document.getElementById('evening-habits');
const generalHabitsDiv = document.getElementById('general-habits');
const addHabitBtn = document.getElementById('add-habit-btn');
const habitForm = document.getElementById('habit-form');

// Modals
const addHabitModal = document.getElementById('add-habit-modal');
const calendarModal = document.getElementById('calendar-modal');
const editProfileModal = document.getElementById('edit-profile-modal');
const achievementsModal = document.getElementById('achievements-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Settings
const themeSelect = document.getElementById('theme-select');
const trackingModeSelect = document.getElementById('tracking-mode-select');
const shareProgressBtn = document.getElementById('share-progress-btn');
const showAchievementsBtn = document.getElementById('show-achievements-btn');
const showPrivacyBtn = document.getElementById('show-privacy-btn');

// Profile
const logoutBtn = document.getElementById('logout-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileForm = document.getElementById('edit-profile-form');

// Calendar
const calendarHabitSelect = document.getElementById('calendar-habit-select');
const calendarGrid = document.getElementById('calendar-grid');

// ---------- AUTH ----------
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    userDocRef = db.collection('users').doc(user.uid);
    await loadUserData();
    loginScreen.classList.remove('active');
    appScreen.classList.add('active');
    initApp();
  } else {
    currentUser = null;
    appScreen.classList.remove('active');
    loginScreen.classList.add('active');
  }
});

// Show signup/login forms
showSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
  authError.textContent = '';
});
showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  authError.textContent = '';
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    authError.textContent = err.message;
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const username = document.getElementById('signup-username').value;
  const age = document.getElementById('signup-age').value;
  const weight = document.getElementById('signup-weight').value;
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('users').doc(cred.user.uid).set({
      username, email, age: age || '', weight: weight || '',
      totalXP: 0, level: 1, badges: [],
      settings: { theme: 'growth', trackingMode: 'intense' }
    });
  } catch (err) {
    authError.textContent = err.message;
  }
});

// ---------- USER DATA ----------
async function loadUserData() {
  const doc = await userDocRef.get();
  if (doc.exists) {
    const data = doc.data();
    userSettings = data.settings || { theme: 'growth', trackingMode: 'intense' };
    document.getElementById('profile-username').textContent = data.username || '';
    document.getElementById('profile-email').textContent = data.email || '';
    document.getElementById('profile-age').textContent = data.age || '-';
    document.getElementById('profile-weight').textContent = data.weight || '-';
    document.getElementById('user-level-display').textContent = `Lv.${data.level || 1}`;
    document.getElementById('xp-display').textContent = `${data.totalXP || 0} XP`;
  }
}

// ---------- INIT APP ----------
function initApp() {
  applyTheme(userSettings.theme);
  themeSelect.value = userSettings.theme;
  trackingModeSelect.value = userSettings.trackingMode;
  setGreeting();
  loadHabits();
  requestNotificationPermission();
  startReminderCheck();
  updateCurrentDate();
}

function setGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) greetingText.textContent = 'Good morning!';
  else if (hour < 18) greetingText.textContent = 'Good afternoon!';
  else greetingText.textContent = 'Good evening!';
}

function updateCurrentDate() {
  const now = new Date();
  currentDateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// ---------- THEMES ----------
function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('goalMintTheme', theme);
}

themeSelect.addEventListener('change', async () => {
  const newTheme = themeSelect.value;
  applyTheme(newTheme);
  if (currentUser) {
    userSettings.theme = newTheme;
    await userDocRef.update({ 'settings.theme': newTheme });
  }
});

trackingModeSelect.addEventListener('change', async () => {
  userSettings.trackingMode = trackingModeSelect.value;
  await userDocRef.update({ 'settings.trackingMode': userSettings.trackingMode });
});

// ---------- HABITS CRUD ----------
async function loadHabits() {
  const snapshot = await userDocRef.collection('habits').get();
  habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderDashboard();
}

function getTodayDayNumber() {
  return new Date().getDay(); // 0-6
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function habitScheduledToday(habit) {
  return habit.repeatDays.includes(getTodayDayNumber());
}

function isCompletedToday(habit) {
  return habit.lastCompletedDate === getTodayString();
}

function renderDashboard() {
  const todayDay = getTodayDayNumber();
  const morningHabits = [];
  const eveningHabits = [];
  const generalHabitsList = [];

  habits.forEach(h => {
    if (!habitScheduledToday(h)) return;
    if (h.routine === 'morning') morningHabits.push(h);
    else if (h.routine === 'evening') eveningHabits.push(h);
    else generalHabitsList.push(h);
  });

  renderHabitList(morningHabitsDiv, morningHabits);
  renderHabitList(eveningHabitsDiv, eveningHabits);
  renderHabitList(generalHabitsDiv, generalHabitsList);
  updateOverallStreak();
}

function renderHabitList(container, habitsArr) {
  container.innerHTML = '';
  if (habitsArr.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary);">No habits yet</p>';
    return;
  }
  habitsArr.forEach(habit => {
    const card = document.createElement('div');
    card.className = 'habit-card';
    const completed = isCompletedToday(habit);
    card.innerHTML = `
      <div class="habit-info">
        <span class="habit-emoji">${habit.emoji || '✅'}</span>
        <span class="habit-name">${habit.name}</span>
        <span class="habit-streak">🔥${habit.streak || 0}</span>
      </div>
      <button class="habit-complete-btn" data-id="${habit.id}" ${completed ? 'disabled' : ''}>
        ${completed ? 'Done' : 'Complete'}
      </button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.habit-complete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const habitId = e.target.dataset.id;
      await completeHabit(habitId);
    });
  });
}

async function completeHabit(habitId) {
  const habitRef = userDocRef.collection('habits').doc(habitId);
  const habit = habits.find(h => h.id === habitId);
  if (!habit || isCompletedToday(habit)) return;

  const today = getTodayString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newStreak = habit.streak || 0;

  if (habit.lastCompletedDate === yesterday) {
    newStreak += 1;
  } else if (habit.lastCompletedDate !== today) {
    newStreak = 1;
  }

  const completedDates = habit.completedDates || [];
  if (!completedDates.includes(today)) completedDates.push(today);

  await habitRef.update({
    lastCompletedDate: today,
    streak: newStreak,
    completedDates: completedDates
  });

  // Add XP
  const userDoc = await userDocRef.get();
  const userData = userDoc.data();
  const xpGain = 10;
  const newXP = (userData.totalXP || 0) + xpGain;
  const newLevel = Math.floor(newXP / 100) + 1;
  const updates = { totalXP: newXP, level: newLevel };
  // Check achievements
  const newBadges = [...(userData.badges || [])];
  if (newStreak === 7 && !newBadges.includes('7-day-streak')) newBadges.push('7-day-streak');
  if (newStreak === 30 && !newBadges.includes('30-day-streak')) newBadges.push('30-day-streak');
  if (newLevel > (userData.level || 1) && !newBadges.includes(`level-${newLevel}`)) newBadges.push(`level-${newLevel}`);
  updates.badges = newBadges;

  await userDocRef.update(updates);
  document.getElementById('user-level-display').textContent = `Lv.${newLevel}`;
  document.getElementById('xp-display').textContent = `${newXP} XP`;

  loadHabits();
}

function updateOverallStreak() {
  // Show highest streak among today's habits
  let maxStreak = 0;
  habits.forEach(h => {
    if (habitScheduledToday(h) && h.streak > maxStreak) maxStreak = h.streak;
  });
  document.getElementById('current-streak').textContent = maxStreak;
}

// Add Habit
addHabitBtn.addEventListener('click', () => addHabitModal.style.display = 'block');
habitForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('habit-name').value;
  const description = document.getElementById('habit-description').value;
  const repeatDays = Array.from(document.querySelectorAll('#habit-form input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
  const reminderTimesRaw = document.getElementById('reminder-times').value;
  const reminderTimes = reminderTimesRaw ? reminderTimesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const routine = document.getElementById('habit-routine').value;
  const emoji = document.getElementById('habit-emoji').value || '✅';

  await userDocRef.collection('habits').add({
    name, description, repeatDays, reminderTimes, routine, emoji,
    streak: 0, lastCompletedDate: null, completedDates: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  habitForm.reset();
  addHabitModal.style.display = 'none';
  loadHabits();
});

// ---------- NAVIGATION ----------
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const viewId = btn.dataset.view;
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if (viewId === 'dashboard-view') loadHabits();
  });
});

// ---------- MODALS ----------
closeModalBtns.forEach(btn => btn.addEventListener('click', () => {
  addHabitModal.style.display = 'none';
  calendarModal.style.display = 'none';
  editProfileModal.style.display = 'none';
  achievementsModal.style.display = 'none';
}));
window.addEventListener('click', (e) => {
  if (e.target === addHabitModal) addHabitModal.style.display = 'none';
  if (e.target === calendarModal) calendarModal.style.display = 'none';
  if (e.target === editProfileModal) editProfileModal.style.display = 'none';
  if (e.target === achievementsModal) achievementsModal.style.display = 'none';
});

// ---------- CALENDAR ----------
document.querySelectorAll('.habit-card').forEach? // not needed, will add button to open calendar
// We'll add a button in dashboard header later. Quick fix: add a small calendar icon
// I'll add an event listener on dashboard: a floating button? Already fab. Let's add a long press on habit? Better: add a "📅" button on habit card dynamically.
// For brevity, we'll enable calendar modal via settings? I'll add a button in settings: "View Calendar"
// Actually, there's no direct button. I'll add one in dashboard next to greeting.
// Since we don't want to modify HTML, I'll add it via JS:
const dashboardView = document.getElementById('dashboard-view');
const calBtn = document.createElement('button');
calBtn.textContent = '📅 Calendar';
calBtn.style.marginBottom = '20px';
calBtn.addEventListener('click', openCalendar);
dashboardView.insertBefore(calBtn, dashboardView.firstChild);

async function openCalendar() {
  calendarHabitSelect.innerHTML = '';
  habits.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h.id;
    opt.textContent = h.name;
    calendarHabitSelect.appendChild(opt);
  });
  calendarModal.style.display = 'block';
  renderCalendar(habits[0]?.id);
}

calendarHabitSelect.addEventListener('change', () => renderCalendar(calendarHabitSelect.value));

function renderCalendar(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let html = '<div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>';
  for (let i = 0; i < firstDay; i++) html += '<div></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const completed = habit.completedDates?.includes(dateStr);
    html += `<div class="calendar-day${completed ? ' completed' : ''}">${d}</div>`;
  }
  calendarGrid.innerHTML = html;
}

// ---------- PROFILE ----------
logoutBtn.addEventListener('click', () => auth.signOut());
deleteAccountBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to delete your account and all data?')) {
    await userDocRef.delete();
    await currentUser.delete();
  }
});
editProfileBtn.addEventListener('click', () => {
  editProfileModal.style.display = 'block';
  document.getElementById('edit-username').value = document.getElementById('profile-username').textContent;
  document.getElementById('edit-age').value = document.getElementById('profile-age').textContent;
  document.getElementById('edit-weight').value = document.getElementById('profile-weight').textContent;
});
editProfileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await userDocRef.update({
    username: document.getElementById('edit-username').value,
    age: document.getElementById('edit-age').value,
    weight: document.getElementById('edit-weight').value
  });
  editProfileModal.style.display = 'none';
  loadUserData();
});

// ---------- ACHIEVEMENTS ----------
showAchievementsBtn.addEventListener('click', async () => {
  achievementsModal.style.display = 'block';
  const userDoc = await userDocRef.get();
  const badges = userDoc.data().badges || [];
  document.getElementById('achievements-list').innerHTML = badges.length
    ? badges.map(b => `<p>🏅 ${b.replace(/-/g, ' ')}</p>`).join('')
    : '<p>No achievements yet. Keep going!</p>';
});

// ---------- SHARE PROGRESS ----------
shareProgressBtn.addEventListener('click', async () => {
  const userDoc = await userDocRef.get();
  const data = userDoc.data();
  const text = `I'm level ${data.level} on GoaLMint with ${data.totalXP} XP! Join me in building better habits.`;
  if (navigator.share) {
    try { await navigator.share({ title: 'GoaLMint Progress', text }); } catch {}
  } else {
    alert('Sharing not supported on this browser. Copy: ' + text);
  }
});

// ---------- NOTIFICATIONS ----------
function requestNotificationPermission() {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function startReminderCheck() {
  setInterval(() => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    habits.forEach(habit => {
      if (!habitScheduledToday(habit) || isCompletedToday(habit)) return;
      if (habit.reminderTimes && habit.reminderTimes.includes(timeStr)) {
        if (Notification.permission === 'granted') {
          new Notification(`⏰ ${habit.name}`, { body: 'Time to complete your habit!', icon: '/icon.png' });
        }
      }
    });
  }, 60000); // check every minute
}

// Privacy policy button
showPrivacyBtn.addEventListener('click', () => {
  alert('Privacy Policy: We collect habit data and account info. No data is sold. Contact sakalatechnologies00@gmail.com for deletion.');
});

// Load theme from localStorage if any
const savedTheme = localStorage.getItem('goalMintTheme');
if (savedTheme) {
  applyTheme(savedTheme);
  if (themeSelect) themeSelect.value = savedTheme;
}