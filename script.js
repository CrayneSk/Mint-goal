// script.js – GoaLMint Habit Tracker
// Make sure this script is loaded after the HTML body, or wrap in DOMContentLoaded.
// Firebase config – replace with your own if needed
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
let currentRoutine = 'morning'; // 'morning' or 'evening'
let editingHabitId = null;

// Wait until DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

  // ---------- DOM ELEMENTS (match the provided HTML) ----------
  const loginScreen        = document.getElementById('loginScreen');
  const registerScreen     = document.getElementById('registerScreen');
  const dashboardScreen    = document.getElementById('dashboardScreen');
  const habitFormScreen    = document.getElementById('habitFormScreen');
  const settingsScreen     = document.getElementById('settingsScreen');
  const loginEmail         = document.getElementById('loginEmail');
  const loginPassword      = document.getElementById('loginPassword');
  const loginBtn           = document.getElementById('loginBtn');
  const showRegisterBtn    = document.getElementById('showRegisterBtn');
  const regEmail           = document.getElementById('regEmail');
  const regUsername        = document.getElementById('regUsername');
  const regAge             = document.getElementById('regAge');
  const regWeight          = document.getElementById('regWeight');
  const regPassword        = document.getElementById('regPassword');
  const registerBtn        = document.getElementById('registerBtn');
  const backToLoginBtn     = document.getElementById('backToLoginBtn');
  const userGreeting       = document.getElementById('userGreeting');
  const totalHabitsSpan    = document.getElementById('totalHabits');
  const currentStreakSpan  = document.getElementById('currentStreak');
  const habitListContainer = document.getElementById('habitListContainer');
  const tabMorning         = document.getElementById('tabMorning');
  const tabEvening         = document.getElementById('tabEvening');
  const addHabitFAB        = document.getElementById('addHabitFAB');
  const goToSettingsBtn    = document.getElementById('goToSettingsBtn');
  const logoutBtn          = document.getElementById('logoutBtn');
  const habitName          = document.getElementById('habitName');
  const habitRepeat        = document.getElementById('habitRepeat');
  const habitTime          = document.getElementById('habitTime');
  const habitNotes         = document.getElementById('habitNotes');
  const habitRoutine       = document.getElementById('habitRoutine');
  const saveHabitBtn       = document.getElementById('saveHabitBtn');
  const cancelHabitBtn     = document.getElementById('cancelHabitBtn');
  const formTitle          = document.getElementById('formTitle');
  const trackingMode       = document.getElementById('trackingMode');
  const deleteAccountBtn   = document.getElementById('deleteAccountBtn');
  const backFromSettingsBtn= document.getElementById('backFromSettingsBtn');
  const themeOptions       = document.querySelectorAll('.theme-option');

  // ---------- SCREEN SWITCHING ----------
  function showScreen(screen) {
    loginScreen.classList.add('hidden');    // using hidden class to hide
    registerScreen.classList.add('hidden');
    dashboardScreen.classList.add('hidden');
    habitFormScreen.classList.add('hidden');
    settingsScreen.classList.add('hidden');
    screen.classList.remove('hidden');
  }
  // Alternatively, toggle 'active' if that's how the CSS works.
  // But the original HTML used .screen.active. We'll stick to that.
  function showScreenById(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // Override the above simple function with the correct one:
  function switchToScreen(screenElement) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screenElement.classList.add('active');
  }

  // ---------- AUTH ----------
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
      userDocRef = db.collection('users').doc(user.uid);
      await loadUserData();
      switchToScreen(dashboardScreen);
      await loadHabits();
      renderDashboard();
      applySavedTheme();
    } else {
      // clear fields
      if (loginEmail) loginEmail.value = '';
      if (loginPassword) loginPassword.value = '';
      switchToScreen(loginScreen);
    }
  });

  // Login / Register
  showRegisterBtn.addEventListener('click', () => switchToScreen(registerScreen));
  backToLoginBtn.addEventListener('click', () => switchToScreen(loginScreen));

  loginBtn.addEventListener('click', async () => {
    try {
      await auth.signInWithEmailAndPassword(loginEmail.value.trim(), loginPassword.value);
    } catch (err) {
      alert('Login error: ' + err.message);
    }
  });

  registerBtn.addEventListener('click', async () => {
    const email = regEmail.value.trim();
    const pass = regPassword.value;
    const username = regUsername.value.trim();
    const age = regAge.value;
    const weight = regWeight.value;
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      await db.collection('users').doc(cred.user.uid).set({
        email, username, age, weight,
        totalXP: 0, level: 1, badges: [],
        settings: { theme: 'midnight', trackingMode: 'normal' }
      });
      await db.collection('leaderboard').doc(cred.user.uid).set({ username, xp: 0 });
    } catch (err) {
      alert('Registration error: ' + err.message);
    }
  });

  logoutBtn.addEventListener('click', () => auth.signOut());

  // ---------- USER DATA ----------
  async function loadUserData() {
    const doc = await userDocRef.get();
    if (doc.exists) {
      const data = doc.data();
      userGreeting.textContent = `👋 ${data.username || 'User'}`;
      if (data.settings) {
        trackingMode.value = data.settings.trackingMode || 'normal';
        applyTheme(data.settings.theme || 'midnight');
      }
    }
  }

  // ---------- HABITS CRUD ----------
  async function loadHabits() {
    const snap = await userDocRef.collection('habits').get();
    habits = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  function getTodayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function isToday(dateStr) {
    return dateStr === getTodayStr();
  }

  function habitScheduledToday(habit) {
    const repeat = habit.repeat || 'daily';
    const day = new Date().getDay(); // 0=Sun
    if (repeat === 'daily') return true;
    if (repeat === 'mon-fri') return day >= 1 && day <= 5;
    if (repeat === 'weekly') return true; // simplified
    return false;
  }

  function renderDashboard() {
    const morningHabits = habits.filter(h => h.routine === 'morning' && habitScheduledToday(h));
    const eveningHabits = habits.filter(h => h.routine === 'evening' && habitScheduledToday(h));
    const displayHabits = currentRoutine === 'morning' ? morningHabits : eveningHabits;

    totalHabitsSpan.textContent = habits.length;
    let maxStreak = 0;
    habits.forEach(h => { if (h.streak > maxStreak) maxStreak = h.streak; });
    currentStreakSpan.textContent = maxStreak;

    habitListContainer.innerHTML = displayHabits.length ? displayHabits.map(h => {
      const completedToday = isToday(h.lastCompletedDate);
      return `
        <div class="habit-item">
          <div style="flex:1;">
            <strong>${h.name}</strong>
            <div style="font-size:0.8rem; color:var(--text-secondary);">${h.time || 'any'} • ${h.repeat}</div>
            ${h.notes ? `<small>${h.notes}</small>` : ''}
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <span class="streak-badge">${h.streak || 0}</span>
            <button class="btn complete-btn" data-id="${h.id}" ${completedToday ? 'disabled' : ''} style="width:auto; padding:0.4rem 0.8rem;">
              ${completedToday ? '✓' : 'Done'}
            </button>
            <button class="btn edit-btn" data-id="${h.id}" style="width:auto; padding:0.4rem;"><i class="fas fa-edit"></i></button>
          </div>
        </div>
      `;
    }).join('') : '<p style="color:var(--text-secondary); text-align:center;">No habits for this routine</p>';

    // Attach events
    document.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        await completeHabit(id);
      });
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openEditHabit(id);
      });
    });
  }

  async function completeHabit(habitId) {
    const habitRef = userDocRef.collection('habits').doc(habitId);
    const habit = habits.find(h => h.id === habitId);
    if (!habit || isToday(habit.lastCompletedDate)) return;

    const today = getTodayStr();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = (habit.streak || 0);
    if (habit.lastCompletedDate === yesterday) newStreak++;
    else newStreak = 1;

    await habitRef.update({ lastCompletedDate: today, streak: newStreak });

    // Update XP and leaderboard
    const userDoc = await userDocRef.get();
    const data = userDoc.data();
    const newXP = (data.totalXP || 0) + 10;
    const newLevel = Math.floor(newXP / 100) + 1;
    const badges = [...(data.badges || [])];
    if (newStreak === 7 && !badges.includes('7-day-streak')) badges.push('7-day-streak');
    if (newStreak === 30 && !badges.includes('30-day-streak')) badges.push('30-day-streak');
    if (newLevel > (data.level || 1)) badges.push(`level-${newLevel}`);
    await userDocRef.update({ totalXP: newXP, level: newLevel, badges });
    await db.collection('leaderboard').doc(currentUser.uid).set({ username: data.username, xp: newXP }, { merge: true });

    await loadHabits();
    renderDashboard();
  }

  function openEditHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    editingHabitId = id;
    formTitle.textContent = 'Edit Habit';
    habitName.value = habit.name;
    habitRepeat.value = habit.repeat || 'daily';
    habitTime.value = habit.time || '08:00';
    habitNotes.value = habit.notes || '';
    habitRoutine.value = habit.routine || 'morning';
    switchToScreen(habitFormScreen);
  }

  addHabitFAB.addEventListener('click', () => {
    editingHabitId = null;
    formTitle.textContent = 'New Habit';
    habitName.value = '';
    habitRepeat.value = 'daily';
    habitTime.value = '08:00';
    habitNotes.value = '';
    habitRoutine.value = 'morning';
    switchToScreen(habitFormScreen);
  });

  saveHabitBtn.addEventListener('click', async () => {
    const name = habitName.value.trim();
    if (!name) return alert('Please enter a habit name.');
    const habitData = {
      name,
      repeat: habitRepeat.value,
      time: habitTime.value,
      notes: habitNotes.value,
      routine: habitRoutine.value,
      streak: editingHabitId ? (habits.find(h => h.id === editingHabitId)?.streak || 0) : 0,
      lastCompletedDate: editingHabitId ? (habits.find(h => h.id === editingHabitId)?.lastCompletedDate || null) : null
    };
    if (editingHabitId) {
      await userDocRef.collection('habits').doc(editingHabitId).update(habitData);
    } else {
      await userDocRef.collection('habits').add(habitData);
    }
    switchToScreen(dashboardScreen);
    await loadHabits();
    renderDashboard();
  });

  cancelHabitBtn.addEventListener('click', () => switchToScreen(dashboardScreen));

  // Tabs
  tabMorning.addEventListener('click', () => {
    currentRoutine = 'morning';
    tabMorning.classList.add('active');
    tabEvening.classList.remove('active');
    renderDashboard();
  });
  tabEvening.addEventListener('click', () => {
    currentRoutine = 'evening';
    tabEvening.classList.add('active');
    tabMorning.classList.remove('active');
    renderDashboard();
  });

  // Settings
  goToSettingsBtn.addEventListener('click', () => switchToScreen(settingsScreen));
  backFromSettingsBtn.addEventListener('click', () => switchToScreen(dashboardScreen));

  trackingMode.addEventListener('change', async () => {
    if (currentUser) {
      await userDocRef.update({ 'settings.trackingMode': trackingMode.value });
    }
  });

  deleteAccountBtn.addEventListener('click', async () => {
    if (confirm('Delete your account and all data?')) {
      await userDocRef.delete();
      await db.collection('leaderboard').doc(currentUser.uid).delete();
      await currentUser.delete();
    }
  });

  // ---------- THEMES ----------
  function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    themeOptions.forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.theme === theme);
    });
    localStorage.setItem('goalMintTheme', theme);
  }

  function applySavedTheme() {
    const saved = localStorage.getItem('goalMintTheme') || 'midnight';
    applyTheme(saved);
  }

  themeOptions.forEach(opt => {
    opt.addEventListener('click', async () => {
      const theme = opt.dataset.theme;
      applyTheme(theme);
      if (currentUser) {
        await userDocRef.update({ 'settings.theme': theme });
      }
    });
  });

  // Initial theme load (before user logs in)
  applySavedTheme();

  // ---------- NOTIFICATIONS (optional) ----------
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  setInterval(() => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    habits.forEach(h => {
      if (h.time === timeStr && habitScheduledToday(h) && !isToday(h.lastCompletedDate)) {
        if (Notification.permission === 'granted') {
          new Notification(`⏰ ${h.name}`, { body: 'Time to complete your habit!' });
        }
      }
    });
  }, 60000);

}); // end DOMContentLoaded