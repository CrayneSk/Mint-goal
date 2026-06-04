// Firebase config
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
let currentUser = null, userDocRef = null, habits = [];
let userSettings = { theme: 'growth', trackingMode: 'intense', customAccent: '#2f855a' };
const motivationalQuotes = [
  "Small steps every day lead to big results.",
  "Consistency is the secret of success.",
  "You are what you repeatedly do.",
  "Don't break the chain!",
  "One habit at a time, one day at a time."
];

// DOM references (abbreviated for brevity, full list in original)
const loadingOverlay = document.getElementById('loading-overlay');
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const authError = document.getElementById('auth-error');
const greetingText = document.getElementById('greeting-text');
const currentDateEl = document.getElementById('current-date');
const morningHabitsDiv = document.getElementById('morning-habits');
const eveningHabitsDiv = document.getElementById('evening-habits');
const generalHabitsDiv = document.getElementById('general-habits');
const addHabitBtn = document.getElementById('add-habit-btn');
const quickCalendarBtn = document.getElementById('quick-calendar-btn');
const habitForm = document.getElementById('habit-form');
const addHabitModal = document.getElementById('add-habit-modal');
const calendarModal = document.getElementById('calendar-modal');
const editProfileModal = document.getElementById('edit-profile-modal');
const achievementsModal = document.getElementById('achievements-modal');
const reportsModal = document.getElementById('reports-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');
const privacyModal = document.getElementById('privacy-modal');
const faqModal = document.getElementById('faq-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const themeSelect = document.getElementById('theme-select');
const toggleDarkBtn = document.getElementById('toggle-dark-mode');
const customAccentInput = document.getElementById('custom-accent-color');
const trackingModeSelect = document.getElementById('tracking-mode-select');
const shareProgressBtn = document.getElementById('share-progress-btn');
const showAchievementsBtn = document.getElementById('show-achievements-btn');
const showReportsBtn = document.getElementById('show-reports-btn');
const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
const showPrivacyBtn = document.getElementById('show-privacy-btn');
const showFaqBtn = document.getElementById('show-faq-btn');
const logoutBtn = document.getElementById('logout-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileForm = document.getElementById('edit-profile-form');
const calendarHabitSelect = document.getElementById('calendar-habit-select');
const calendarGrid = document.getElementById('calendar-grid');
const progressRing = document.getElementById('progress-ring-circle');
const progressPercent = document.getElementById('progress-percent');
const currentStreakSpan = document.getElementById('current-streak');
const motivationalQuoteDiv = document.getElementById('motivational-quote');

// ---------- AUTH with instant load ----------
let authReady = false;
auth.onAuthStateChanged(async (user) => {
  authReady = true;
  if (user) {
    currentUser = user;
    userDocRef = db.collection('users').doc(user.uid);
    await loadUserData();
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    appScreen.style.flexDirection = 'column';
    initApp();
  } else {
    currentUser = null;
    appScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
  }
  loadingOverlay.style.display = 'none'; // hide loading
});

// Pre-check if already logged in to avoid flash
if (auth.currentUser) {
  // already logged in, but onAuthStateChanged will fire anyway
} else {
  // show login after a tiny delay to avoid blank screen
  setTimeout(() => {
    if (!authReady) loadingOverlay.style.display = 'none';
  }, 1000);
}

// Auth forms
showSignup.addEventListener('click', e => { e.preventDefault(); loginForm.classList.add('hidden'); signupForm.classList.remove('hidden'); });
showLogin.addEventListener('click', e => { e.preventDefault(); signupForm.classList.add('hidden'); loginForm.classList.remove('hidden'); });
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  try { await auth.signInWithEmailAndPassword(loginForm.email.value, loginForm.password.value); } catch(err) { authError.textContent = err.message; }
});
signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const cred = await auth.createUserWithEmailAndPassword(signupForm.email.value, signupForm.password.value);
    await db.collection('users').doc(cred.user.uid).set({
      username: signupForm.username.value, email: signupForm.email.value, age: signupForm.age.value || '', weight: signupForm.weight.value || '',
      totalXP: 0, level: 1, badges: [], settings: { theme: 'growth', trackingMode: 'intense', customAccent: '#2f855a' }
    });
    // Update leaderboard
    await db.collection('leaderboard').doc(cred.user.uid).set({ username: signupForm.username.value, xp: 0 });
  } catch(err) { authError.textContent = err.message; }
});

// ---------- USER DATA ----------
async function loadUserData() {
  const doc = await userDocRef.get();
  if (doc.exists) {
    const data = doc.data();
    userSettings = data.settings || { theme: 'growth', trackingMode: 'intense', customAccent: '#2f855a' };
    document.getElementById('profile-username').textContent = data.username || '';
    document.getElementById('profile-email').textContent = data.email || '';
    document.getElementById('profile-age').textContent = data.age || '-';
    document.getElementById('profile-weight').textContent = data.weight || '-';
    document.getElementById('user-level-display').textContent = `Lv.${data.level || 1}`;
    document.getElementById('xp-display').textContent = `${data.totalXP || 0} XP`;
    if (userSettings.customAccent) {
      document.documentElement.style.setProperty('--custom-accent', userSettings.customAccent);
      customAccentInput.value = userSettings.customAccent;
    }
  }
}

function initApp() {
  applyTheme(userSettings.theme);
  themeSelect.value = userSettings.theme;
  trackingModeSelect.value = userSettings.trackingMode;
  setGreeting();
  loadHabits();
  requestNotificationPermission();
  startReminderCheck();
  scheduleMissedCheck();
  updateCurrentDate();
  showRandomQuote();
}

// ---------- THEMES ----------
function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('goalMintTheme', theme);
}
themeSelect.addEventListener('change', async () => {
  const newTheme = themeSelect.value;
  applyTheme(newTheme);
  if (currentUser) { userSettings.theme = newTheme; await userDocRef.update({ 'settings.theme': newTheme }); }
});
toggleDarkBtn.addEventListener('click', () => {
  const isDark = document.body.className.includes('midnight') || document.body.className.includes('darkmode') || document.body.className.includes('golden');
  const newTheme = isDark ? 'growth' : 'midnight';
  applyTheme(newTheme);
  themeSelect.value = newTheme;
  if (currentUser) { userSettings.theme = newTheme; userDocRef.update({ 'settings.theme': newTheme }); }
});
customAccentInput.addEventListener('input', async () => {
  const color = customAccentInput.value;
  document.documentElement.style.setProperty('--custom-accent', color);
  if (currentUser) { userSettings.customAccent = color; await userDocRef.update({ 'settings.customAccent': color }); }
});
trackingModeSelect.addEventListener('change', async () => {
  userSettings.trackingMode = trackingModeSelect.value;
  await userDocRef.update({ 'settings.trackingMode': userSettings.trackingMode });
});

// ---------- HABITS ----------
async function loadHabits() {
  const snapshot = await userDocRef.collection('habits').get();
  habits = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  renderDashboard();
}
function getTodayDayNumber() { return new Date().getDay(); }
function getTodayString() { return new Date().toISOString().split('T')[0]; }
function habitScheduledToday(h) { return h.repeatDays.includes(getTodayDayNumber()); }
function isCompletedToday(h) { return h.lastCompletedDate === getTodayString(); }

function renderDashboard() {
  const todayDay = getTodayDayNumber();
  const morning = [], evening = [], general = [];
  habits.forEach(h => {
    if (!habitScheduledToday(h)) return;
    if (h.routine === 'morning') morning.push(h);
    else if (h.routine === 'evening') evening.push(h);
    else general.push(h);
  });
  renderHabitList(morningHabitsDiv, morning);
  renderHabitList(eveningHabitsDiv, evening);
  renderHabitList(generalHabitsDiv, general);
  updateProgressRing();
  updateOverallStreak();
}

function renderHabitList(container, arr) {
  container.innerHTML = '';
  if (arr.length === 0) { container.innerHTML = '<p style="color:var(--text-secondary);">No habits yet</p>'; return; }
  arr.forEach(h => {
    const card = document.createElement('div');
    card.className = 'habit-card';
    const completed = isCompletedToday(h);
    card.innerHTML = `<div class="habit-info"><span class="habit-emoji">${h.emoji||'✅'}</span><span class="habit-name">${h.name}</span><span class="habit-streak">🔥${h.streak||0}</span></div>
      <button class="habit-complete-btn" data-id="${h.id}" ${completed?'disabled':''}>${completed?'Done':'Complete'}</button>`;
    container.appendChild(card);
  });
  container.querySelectorAll('.habit-complete-btn').forEach(btn => btn.addEventListener('click', async e => {
    await completeHabit(e.target.dataset.id);
  }));
}

async function completeHabit(habitId) {
  const habitRef = userDocRef.collection('habits').doc(habitId);
  const habit = habits.find(h => h.id === habitId);
  if (!habit || isCompletedToday(habit)) return;
  const today = getTodayString();
  const yesterday = new Date(Date.now()-86400000).toISOString().split('T')[0];
  let newStreak = habit.streak || 0;
  if (habit.lastCompletedDate === yesterday) newStreak++;
  else if (habit.lastCompletedDate !== today) newStreak = 1;
  const completedDates = habit.completedDates || [];
  if (!completedDates.includes(today)) completedDates.push(today);
  await habitRef.update({ lastCompletedDate: today, streak: newStreak, completedDates });
  // XP & leaderboard
  const userDoc = await userDocRef.get();
  const data = userDoc.data();
  const xpGain = 10;
  const newXP = (data.totalXP||0) + xpGain;
  const newLevel = Math.floor(newXP/100)+1;
  const badges = [...(data.badges||[])];
  if (newStreak===7 && !badges.includes('7-day-streak')) badges.push('7-day-streak');
  if (newStreak===30 && !badges.includes('30-day-streak')) badges.push('30-day-streak');
  if (newLevel > (data.level||1)) badges.push(`level-${newLevel}`);
  await userDocRef.update({ totalXP: newXP, level: newLevel, badges });
  await db.collection('leaderboard').doc(currentUser.uid).set({ username: data.username, xp: newXP }, {merge:true});
  document.getElementById('user-level-display').textContent = `Lv.${newLevel}`;
  document.getElementById('xp-display').textContent = `${newXP} XP`;
  // Motivational message
  motivationalQuoteDiv.textContent = `“${motivationalQuotes[Math.floor(Math.random()*motivationalQuotes.length)]}”`;
  loadHabits();
}

function updateProgressRing() {
  const todayHabits = habits.filter(h => habitScheduledToday(h));
  const total = todayHabits.length;
  const completed = todayHabits.filter(h => isCompletedToday(h)).length;
  const percent = total ? Math.round((completed/total)*100) : 0;
  const circumference = 2 * Math.PI * 28; // r=28
  const offset = circumference - (percent/100)*circumference;
  progressRing.style.strokeDasharray = circumference;
  progressRing.style.strokeDashoffset = offset;
  progressPercent.textContent = `${percent}%`;
}

function updateOverallStreak() {
  let max = 0;
  habits.forEach(h => { if (habitScheduledToday(h) && h.streak > max) max = h.streak; });
  currentStreakSpan.textContent = max;
}

// Add habit
addHabitBtn.addEventListener('click', () => addHabitModal.style.display='block');
quickCalendarBtn.addEventListener('click', openCalendar);
habitForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('habit-name').value;
  const desc = document.getElementById('habit-description').value;
  const days = Array.from(document.querySelectorAll('#habit-form input[type="checkbox"]:checked')).map(cb=>parseInt(cb.value));
  const reminders = document.getElementById('reminder-times').value.split(',').map(s=>s.trim()).filter(Boolean);
  const routine = document.getElementById('habit-routine').value;
  const emoji = document.getElementById('habit-emoji').value || '✅';
  await userDocRef.collection('habits').add({
    name, description: desc, repeatDays: days, reminderTimes: reminders, routine, emoji,
    streak:0, lastCompletedDate:null, completedDates:[], createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  habitForm.reset();
  addHabitModal.style.display='none';
  loadHabits();
});

// ---------- NAVIGATION ----------
navBtns.forEach(btn => btn.addEventListener('click', () => {
  navBtns.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  views.forEach(v=>v.classList.remove('active'));
  document.getElementById(btn.dataset.view).classList.add('active');
  if (btn.dataset.view === 'dashboard-view') loadHabits();
}));

// ---------- MODALS ----------
closeModalBtns.forEach(b=>b.addEventListener('click', ()=>{
  document.querySelectorAll('.modal').forEach(m=>m.style.display='none');
}));
window.addEventListener('click', e=>{ if(e.target.classList.contains('modal')) e.target.style.display='none'; });

// Calendar
async function openCalendar() {
  calendarHabitSelect.innerHTML = '';
  habits.forEach(h=>{ let o=document.createElement('option'); o.value=h.id; o.textContent=h.name; calendarHabitSelect.appendChild(o); });
  calendarModal.style.display='block';
  renderCalendar(habits[0]?.id);
}
calendarHabitSelect.addEventListener('change', ()=>renderCalendar(calendarHabitSelect.value));
function renderCalendar(habitId) {
  const h = habits.find(x=>x.id===habitId); if(!h) return;
  const now = new Date(), y=now.getFullYear(), m=now.getMonth();
  const firstDay = new Date(y,m,1).getDay(), daysInMonth = new Date(y,m+1,0).getDate();
  let html='<div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>';
  for(let i=0;i<firstDay;i++) html+='<div></div>';
  for(let d=1;d<=daysInMonth;d++){
    const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    html+=`<div class="calendar-day${h.completedDates?.includes(dateStr)?' completed':''}">${d}</div>`;
  }
  calendarGrid.innerHTML=html;
}

// Reports
showReportsBtn.addEventListener('click', async ()=>{
  reportsModal.style.display='block';
  const snapshot = await userDocRef.collection('habits').get();
  const allHabits = snapshot.docs.map(d=>({id:d.id,...d.data()}));
  const todayStr = getTodayString();
  const weekAgo = new Date(Date.now()-7*86400000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now()-30*86400000).toISOString().split('T')[0];
  let daily=0, weekly=0, monthly=0;
  allHabits.forEach(h=>{
    if(h.completedDates?.includes(todayStr)) daily++;
    if(h.completedDates?.some(d=>d>=weekAgo)) weekly++;
    if(h.completedDates?.some(d=>d>=monthAgo)) monthly++;
  });
  document.getElementById('reports-content').innerHTML = `
    <p>Today completed: <strong>${daily}</strong> habits</p>
    <p>Last 7 days: <strong>${weekly}</strong> completions</p>
    <p>Last 30 days: <strong>${monthly}</strong> completions</p>
  `;
});

// Leaderboard
showLeaderboardBtn.addEventListener('click', async ()=>{
  leaderboardModal.style.display='block';
  const snap = await db.collection('leaderboard').orderBy('xp','desc').limit(20).get();
  let html = '<ol>';
  snap.forEach(doc=>{ const d=doc.data(); html+=`<li>${d.username} – ${d.xp} XP</li>`; });
  html+='</ol>';
  document.getElementById('leaderboard-list').innerHTML=html;
});

// Achievements
showAchievementsBtn.addEventListener('click', async ()=>{
  achievementsModal.style.display='block';
  const doc=await userDocRef.get(); const badges=doc.data().badges||[];
  document.getElementById('achievements-list').innerHTML = badges.length ? badges.map(b=>`<p>🏅 ${b.replace(/-/g,' ')}</p>`).join('') : '<p>No achievements yet.</p>';
});

// Share
shareProgressBtn.addEventListener('click', async ()=>{
  const doc=await userDocRef.get(); const d=doc.data();
  const text=`I'm level ${d.level} on GoaLMint with ${d.totalXP} XP!`;
  if(navigator.share) navigator.share({title:'GoaLMint',text});
  else alert('Copy: '+text);
});

// Profile edit/logout/delete (unchanged)
editProfileBtn.addEventListener('click', ()=>{ editProfileModal.style.display='block'; document.getElementById('edit-username').value=document.getElementById('profile-username').textContent; document.getElementById('edit-age').value=document.getElementById('profile-age').textContent; document.getElementById('edit-weight').value=document.getElementById('profile-weight').textContent; });
editProfileForm.addEventListener('submit', async e=>{ e.preventDefault(); await userDocRef.update({ username: document.getElementById('edit-username').value, age: document.getElementById('edit-age').value, weight: document.getElementById('edit-weight').value }); editProfileModal.style.display='none'; loadUserData(); });
logoutBtn.addEventListener('click', ()=>auth.signOut());
deleteAccountBtn.addEventListener('click', async ()=>{ if(confirm('Delete account?')){ await userDocRef.delete(); await db.collection('leaderboard').doc(currentUser.uid).delete(); await currentUser.delete(); } });

// Privacy/FAQ
showPrivacyBtn.addEventListener('click', ()=>privacyModal.style.display='block');
showFaqBtn.addEventListener('click', ()=>faqModal.style.display='block');

// Notifications & reminders
function requestNotificationPermission(){ if(Notification.permission==='default') Notification.requestPermission(); }
function startReminderCheck(){
  setInterval(()=>{
    if(!currentUser) return;
    const now=new Date(), timeStr=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    habits.forEach(h=>{
      if(!habitScheduledToday(h)||isCompletedToday(h)) return;
      if(h.reminderTimes?.includes(timeStr) && Notification.permission==='granted'){
        new Notification(`⏰ ${h.name}`,{body:'Time to complete!',icon:'/icon.png'});
      }
    });
  },60000);
}
function scheduleMissedCheck(){
  const now = new Date();
  const msToMidnight = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).getTime() - now.getTime();
  setTimeout(()=>{
    if(!currentUser) return;
    const todayStr = getTodayString();
    habits.forEach(h=>{
      if(habitScheduledToday(h) && h.lastCompletedDate!==todayStr && Notification.permission==='granted'){
        new Notification(`⚠️ Missed: ${h.name}`,{body:'You missed this habit today.',icon:'/icon.png'});
      }
    });
    scheduleMissedCheck(); // repeat daily
  }, msToMidnight + 60000); // one minute after midnight
}

// Greeting & quote
function setGreeting(){
  const h=new Date().getHours();
  greetingText.textContent = h<12?'Good morning!':h<18?'Good afternoon!':'Good evening!';
}
function updateCurrentDate(){ currentDateEl.textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}); }
function showRandomQuote(){ motivationalQuoteDiv.textContent = `“${motivationalQuotes[Math.floor(Math.random()*motivationalQuotes.length)]}”`; }

// Load saved theme quickly
const savedTheme = localStorage.getItem('goalMintTheme');
if(savedTheme) applyTheme(savedTheme);