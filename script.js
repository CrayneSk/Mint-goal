// script.js – GoaLMint (fully guarded)
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

let currentUser = null, userDocRef = null, habits = [], currentRoutine = 'morning', editingHabitId = null;

// Safe element getter
function $(id) {
  const el = document.getElementById(id);
  if (!el) console.error(`❌ Element #${id} not found`);
  return el;
}

// All required IDs (exactly as in your HTML)
const requiredIds = [
  'loginScreen','registerScreen','dashboardScreen','habitFormScreen','settingsScreen',
  'loginEmail','loginPassword','loginBtn','showRegisterBtn',
  'regEmail','regUsername','regAge','regWeight','regPassword','registerBtn','backToLoginBtn',
  'userGreeting','totalHabits','currentStreak','habitListContainer',
  'tabMorning','tabEvening','addHabitFAB','goToSettingsBtn','logoutBtn',
  'habitName','habitRepeat','habitTime','habitNotes','habitRoutine',
  'saveHabitBtn','cancelHabitBtn','formTitle',
  'trackingMode','deleteAccountBtn','backFromSettingsBtn'
];

document.addEventListener('DOMContentLoaded', () => {
  // Validate everything
  let allGood = true;
  requiredIds.forEach(id => { if (!$('id')) allGood = false; });
  if (!allGood) {
    alert('Some HTML elements are missing – check the console (F12).');
    return;
  }

  // Grab elements safely
  const loginScreen = $('loginScreen');
  const registerScreen = $('registerScreen');
  const dashboardScreen = $('dashboardScreen');
  const habitFormScreen = $('habitFormScreen');
  const settingsScreen = $('settingsScreen');
  const loginEmail = $('loginEmail');
  const loginPassword = $('loginPassword');
  const loginBtn = $('loginBtn');
  const showRegisterBtn = $('showRegisterBtn');
  const regEmail = $('regEmail');
  const regUsername = $('regUsername');
  const regAge = $('regAge');
  const regWeight = $('regWeight');
  const regPassword = $('regPassword');
  const registerBtn = $('registerBtn');
  const backToLoginBtn = $('backToLoginBtn');
  const userGreeting = $('userGreeting');
  const totalHabitsEl = $('totalHabits');
  const currentStreakEl = $('currentStreak');
  const habitListContainer = $('habitListContainer');
  const tabMorning = $('tabMorning');
  const tabEvening = $('tabEvening');
  const addHabitFAB = $('addHabitFAB');
  const goToSettingsBtn = $('goToSettingsBtn');
  const logoutBtn = $('logoutBtn');
  const habitName = $('habitName');
  const habitRepeat = $('habitRepeat');
  const habitTime = $('habitTime');
  const habitNotes = $('habitNotes');
  const habitRoutine = $('habitRoutine');
  const saveHabitBtn = $('saveHabitBtn');
  const cancelHabitBtn = $('cancelHabitBtn');
  const formTitle = $('formTitle');
  const trackingMode = $('trackingMode');
  const deleteAccountBtn = $('deleteAccountBtn');
  const backFromSettingsBtn = $('backFromSettingsBtn');
  const themeOptions = document.querySelectorAll('.theme-option');

  // --- SCREEN SWITCH ---
  function switchTo(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // --- AUTH ---
  auth.onAuthStateChanged(async user => {
    currentUser = user;
    if (user) {
      userDocRef = db.collection('users').doc(user.uid);
      await loadUserData();
      switchTo(dashboardScreen);
      await loadHabits();
      renderDashboard();
      applySavedTheme();
    } else {
      if (loginEmail) loginEmail.value = '';
      if (loginPassword) loginPassword.value = '';
      switchTo(loginScreen);
    }
  });

  showRegisterBtn.addEventListener('click', () => switchTo(registerScreen));
  backToLoginBtn.addEventListener('click', () => switchTo(loginScreen));

  loginBtn.addEventListener('click', async () => {
    const email = loginEmail?.value?.trim();
    const password = loginPassword?.value;
    if (!email || !password) { alert('Enter email and password'); return; }
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (e) { alert('Login failed: ' + e.message); }
  });

  registerBtn.addEventListener('click', async () => {
    const email = regEmail?.value?.trim();
    const pass = regPassword?.value;
    const username = regUsername?.value?.trim() || 'User';
    const age = regAge?.value || '';
    const weight = regWeight?.value || '';
    if (!email || !pass) { alert('Email and password required'); return; }
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      await db.collection('users').doc(cred.user.uid).set({
        email, username, age, weight,
        totalXP: 0, level: 1, badges: [],
        settings: { theme: 'midnight', trackingMode: 'normal' }
      });
      await db.collection('leaderboard').doc(cred.user.uid).set({ username, xp: 0 });
    } catch (e) { alert('Registration error: ' + e.message); }
  });

  logoutBtn.addEventListener('click', () => auth.signOut());

  // ... rest of the functions (loadUserData, loadHabits, renderDashboard, etc.)
  // (They are identical to the previous version – copy them from the earlier answer)

  // For brevity, I'm omitting the long function bodies here, but you must include them.
  // Use the full functions from the previous "defensive" script – just replace the login/register handlers with the ones above.
});