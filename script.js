// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCWVNHO-YCKX0xFMvVsAx2vByquADBMDrQ",
  authDomain: "goal-mint.firebaseapp.com",
  projectId: "goal-mint",
  storageBucket: "goal-mint.firebasestorage.app",
  messagingSenderId: "251716328908",
  appId: "1:251716328908:web:f268362ed2ba17ab9f5169"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Offline persistence
db.enablePersistence().catch(() => {});

let currentUser = null, userDocRef = null, habits = [], currentRoutine = 'morning', editingHabitId = null;
let lastCompletedHabitTime = null, lastCompletedHabitId = null;
const quotes = ["Small steps, big results.","Consistency is key.","Don't break the chain.","You are what you repeatedly do.","One day at a time."];

// 30 premium themes (all from CSS)
const shopThemes = [
  { id: 'ocean', name: 'Ocean', cost: 100, emoji: '🌊' },
  { id: 'sunset', name: 'Sunset', cost: 120, emoji: '🌅' },
  { id: 'forest', name: 'Forest', cost: 100, emoji: '🌲' },
  { id: 'candy', name: 'Candy', cost: 80, emoji: '🍬' },
  { id: 'neon', name: 'Neon', cost: 150, emoji: '💜' },
  { id: 'royal', name: 'Royal', cost: 200, emoji: '👑' },
  { id: 'ember', name: 'Ember', cost: 130, emoji: '🔥' },
  { id: 'frost', name: 'Frost', cost: 110, emoji: '❄️' },
  { id: 'aurora', name: 'Aurora', cost: 180, emoji: '🌌' },
  { id: 'cosmos', name: 'Cosmos', cost: 220, emoji: '🚀' },
  { id: 'cherry', name: 'Cherry', cost: 90, emoji: '🍒' },
  { id: 'mint', name: 'Mint', cost: 110, emoji: '🍃' },
  { id: 'lavender', name: 'Lavender', cost: 130, emoji: '💜' },
  { id: 'peach', name: 'Peach', cost: 95, emoji: '🍑' },
  { id: 'azure', name: 'Azure', cost: 140, emoji: '🔷' },
  { id: 'ruby', name: 'Ruby', cost: 160, emoji: '💎' },
  { id: 'jade', name: 'Jade', cost: 150, emoji: '🟢' },
  { id: 'ivory', name: 'Ivory', cost: 120, emoji: '🤍' },
  { id: 'onyx', name: 'Onyx', cost: 170, emoji: '⬛' },
  { id: 'coral', name: 'Coral', cost: 105, emoji: '🪸' },
  { id: 'amethyst', name: 'Amethyst', cost: 180, emoji: '💟' },
  { id: 'topaz', name: 'Topaz', cost: 135, emoji: '🔶' },
  { id: 'sapphire', name: 'Sapphire', cost: 190, emoji: '🔵' },
  { id: 'emerald', name: 'Emerald', cost: 200, emoji: '🟩' },
  { id: 'garnet', name: 'Garnet', cost: 145, emoji: '♦️' },
  { id: 'peridot', name: 'Peridot', cost: 125, emoji: '💚' },
  { id: 'aquamarine', name: 'Aquamarine', cost: 160, emoji: '🌊' },
  { id: 'diamond', name: 'Diamond', cost: 250, emoji: '💠' },
  { id: 'obsidian', name: 'Obsidian', cost: 210, emoji: '🖤' },
  { id: 'platinum', name: 'Platinum', cost: 230, emoji: '🪨' }
];
const freeThemes = ['growth', 'productivity', 'darkfocus', 'golden', 'midnight'];

// XP packs
const xpPacksList = [
  { id: 'xp_500', amount: 500, cost: 50 },
  { id: 'xp_1200', amount: 1200, cost: 100 },
  { id: 'xp_5000', amount: 5000, cost: 400 }
];

document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  // SCREENS
  const loginScreen = $('loginScreen'), registerScreen = $('registerScreen'), mainAppScreen = $('mainAppScreen');
  const dnaScreen = $('dnaScreen'), cityScreen = $('cityScreen'), messagesScreen = $('messagesScreen');
  const bossScreen = $('bossScreen'), chaptersScreen = $('chaptersScreen'), impactScreen = $('impactScreen');
  const achievementsScreen = $('achievementsScreen'), leaderboardScreen = $('leaderboardScreen'), settingsView = $('settingsView');

  // AUTH
  const loginEmail = $('loginEmail'), loginPassword = $('loginPassword'), loginBtn = $('loginBtn'), showRegisterBtn = $('showRegisterBtn');
  const regEmail = $('regEmail'), regUsername = $('regUsername'), regAge = $('regAge'), regWeight = $('regWeight'), regPassword = $('regPassword'), registerBtn = $('registerBtn'), backToLoginBtn = $('backToLoginBtn');
  const referralCodeInput = $('referralCodeInput');

  // DASHBOARD
  const userGreeting = $('userGreeting'), totalHabitsEl = $('totalHabits'), currentStreakEl = $('currentStreak');
  const userIdentity = $('userIdentity'), userXPEl = $('userXP'), mintCoinsEl = $('mintCoins'), mintTokensEl = $('mintTokens');
  const habitListContainer = $('habitListContainer'), tabMorning = $('tabMorning'), tabEvening = $('tabEvening'), addHabitFAB = $('addHabitFAB');
  const logoutMainBtn = $('logoutMainBtn'), mentorMessage = $('mentorMessage');
  const chapterFilter = $('chapterFilter'), habitInsight = $('habitInsight');
  const myReferralCode = $('myReferralCode'), copyReferralBtn = $('copyReferralBtn');

  // MODALS
  const habitModal = $('habitModal'), habitName = $('habitName'), habitCategory = $('habitCategory'), habitRepeat = $('habitRepeat');
  const customDaysContainer = $('customDaysContainer'), reminderTimes = $('reminderTimes'), habitEmoji = $('habitEmoji');
  const habitNotes = $('habitNotes'), habitRoutine = $('habitRoutine'), habitChapter = $('habitChapter'), saveHabitBtn = $('saveHabitBtn'), habitModalTitle = $('habitModalTitle');
  const messageModal = $('messageModal'), messageContent = $('messageContent'), unlockCondition = $('unlockCondition'), saveMessageBtn = $('saveMessageBtn');
  const bossModal = $('bossModal'), bossName = $('bossName'), bossDays = $('bossDays'), startBossChallengeBtn = $('startBossChallengeBtn');
  const chapterModal = $('chapterModal'), chapterName = $('chapterName'), saveChapterBtn = $('saveChapterBtn');
  const shopModal = $('shopModal'), shopItems = $('shopItems'), xpPacks = $('xpPacks'), shopCoinBalance = $('shopCoinBalance'), shopXPDisplay = $('shopXPDisplay');
  const replayModal = $('replayModal'), replayStats = $('replayStats');
  const privacyModal = $('privacyModal'), faqModal = $('faqModal'), howItWorksModal = $('howItWorksModal');

  // SETTINGS
  const trackingMode = $('trackingMode'), causeSelect = $('causeSelect');
  const openShopBtn = $('openShopBtn'), openShopFromSettings = $('openShopFromSettings'), howItWorksBtn = $('howItWorksBtn');
  const shareProgressBtn = $('shareProgressBtn'), showPrivacyBtn = $('showPrivacyBtn'), showFaqBtn = $('showFaqBtn');
  const progressReplayBtn = $('progressReplayBtn'), deleteAccountBtn = $('deleteAccountBtn'), backFromSettings = $('backFromSettings');
  const currentThemeName = $('currentThemeName');

  // OTHER SCREENS
  const dnaBars = $('dnaBars'), cityCanvas = $('cityCanvas'), cityGrid = $('cityGrid'), messagesList = $('messagesList'), activeBosses = $('activeBosses');
  const chaptersList = $('chaptersList'), impactStats = $('impactStats'), achievementsList = $('achievementsList'), leaderboardList = $('leaderboardList');
  const parkCount = $('parkCount'), libraryCount = $('libraryCount'), officeCount = $('officeCount'), galleryCount = $('galleryCount');

  // BOTTOM NAV
  const navDashboard = $('navDashboard'), navDNA = $('navDNA'), navCity = $('navCity'), navMessages = $('navMessages');
  const navBoss = $('navBoss'), navChapters = $('navChapters'), navImpact = $('navImpact');
  const navAchievements = $('navAchievements'), navLeaderboard = $('navLeaderboard'), navSettings = $('navSettings');

  let virtualCity = null;

  // SCREEN SWITCH
  function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (screen) screen.classList.add('active');
  }

  // AUTH
  auth.onAuthStateChanged(async user => {
    currentUser = user;
    if (user) {
      userDocRef = db.collection('users').doc(user.uid);
      await loadUserData();
      showScreen(mainAppScreen);
      await loadHabits();
      renderDashboard();
      applySavedTheme();
      requestNotificationPermission();
    } else {
      if (loginEmail) loginEmail.value = '';
      if (loginPassword) loginPassword.value = '';
      showScreen(loginScreen);
    }
  });

  if (showRegisterBtn) showRegisterBtn.addEventListener('click', () => showScreen(registerScreen));
  if (backToLoginBtn) backToLoginBtn.addEventListener('click', () => showScreen(loginScreen));

  if (loginBtn) loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    if (!email || !password) { alert('Enter email and password.'); return; }
    try { await auth.signInWithEmailAndPassword(email, password); } catch (e) { alert('Login failed: ' + e.message); }
  });

  if (registerBtn) registerBtn.addEventListener('click', async () => {
    const email = regEmail.value.trim(), password = regPassword.value;
    const username = regUsername.value.trim() || 'User';
    if (!email || !password) { alert('Email and password required.'); return; }
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;
      const referralCode = generateReferralCode();
      const userData = {
        email, username, age: regAge.value || '', weight: regWeight.value || '',
        totalXP: 0, level: 1, badges: [],
        settings: { theme: 'midnight', trackingMode: 'normal', cause: 'education' },
        mintCoins: 500, mintTokens: 3,
        cityBuildings: { park: 0, library: 0, office: 0, gallery: 0 },
        identity: 'Beginner', ownedThemes: ['midnight'],
        referralCode
      };
      await db.collection('users').doc(uid).set(userData);
      await db.collection('referralCodes').doc(referralCode).set({ userId: uid });
      await db.collection('leaderboard').doc(uid).set({ username, xp: 0 });

      // Optional referral
      const refCode = referralCodeInput ? referralCodeInput.value.trim() : '';
      if (refCode) {
        const refDoc = await db.collection('referralCodes').doc(refCode).get();
        if (refDoc.exists) {
          const inviterId = refDoc.data().userId;
          // Award both
          await db.collection('users').doc(inviterId).update({ mintCoins: firebase.firestore.FieldValue.increment(20) });
          await db.collection('users').doc(uid).update({ mintCoins: firebase.firestore.FieldValue.increment(20) });
        }
      }
    } catch (e) { alert('Registration failed: ' + e.message); }
  });

  function generateReferralCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  if (logoutMainBtn) logoutMainBtn.addEventListener('click', () => auth.signOut());

  async function loadUserData() {
    const doc = await userDocRef.get();
    if (!doc.exists) return;
    const d = doc.data();
    if (userGreeting) userGreeting.textContent = `👋 ${d.username || 'User'}`;
    const xp = d.totalXP || 0;
    if (userXPEl) userXPEl.textContent = xp;
    if (userIdentity) userIdentity.textContent = getIdentity(xp);
    if (mintCoinsEl) mintCoinsEl.textContent = d.mintCoins || 0;
    if (mintTokensEl) mintTokensEl.textContent = d.mintTokens || 0;
    if (trackingMode) trackingMode.value = d.settings?.trackingMode || 'normal';
    if (causeSelect) causeSelect.value = d.settings?.cause || 'education';
    const theme = d.settings?.theme || 'midnight';
    applyTheme(theme);
    if (currentThemeName) currentThemeName.textContent = getThemeDisplayName(theme);
    if (myReferralCode) myReferralCode.textContent = d.referralCode || '';
    updateMentorMessage();
  }

  function getThemeDisplayName(themeId) {
    const all = [...freeThemes.map(t => ({ id: t, name: t.charAt(0).toUpperCase() + t.slice(1) })), ...shopThemes];
    const found = all.find(t => t.id === themeId);
    return found ? found.name : themeId;
  }

  // HABITS
  async function loadHabits() {
    const snap = await userDocRef.collection('habits').get();
    habits = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  function getTodayStr() { return new Date().toISOString().split('T')[0]; }
  function getYesterdayStr() { return new Date(Date.now()-86400000).toISOString().split('T')[0]; }
  function isToday(s) { return s === getTodayStr(); }
  function isYesterday(s) { return s === getYesterdayStr(); }
  function habitScheduledToday(h) {
    if (!h.repeatDays || h.repeatDays.length === 0) return h.repeat === 'daily' || h.repeat === 'weekly';
    return h.repeatDays.includes(new Date().getDay());
  }
  function habitScheduledYesterday(h) {
    const yesterday = (new Date().getDay() + 6) % 7;
    if (!h.repeatDays || h.repeatDays.length === 0) return h.repeat === 'daily' || h.repeat === 'weekly';
    return h.repeatDays.includes(yesterday);
  }

  function getIdentity(xp) {
    if (xp >= 5000) return 'Legend';
    else if (xp >= 2000) return 'Master Builder';
    else if (xp >= 1000) return 'Consistent';
    else if (xp >= 500) return 'Focused';
    else if (xp >= 100) return 'Disciplined';
    return 'Beginner';
  }

  function updateMentorMessage() {
    if (!mentorMessage) return;
    const msgs = ["You're on fire! Keep that streak going.", "Consistency beats intensity. Small wins daily."];
    mentorMessage.textContent = `🤖 ${msgs[Math.floor(Math.random() * msgs.length)]}`;
  }

  async function trackCombination(habitId) {
    const now = Date.now();
    if (lastCompletedHabitId && lastCompletedHabitTime && (now - lastCompletedHabitTime) < 600000) {
      const pairKey = `${lastCompletedHabitId}_${habitId}`;
      await userDocRef.collection('combinations').doc(pairKey).set({
        count: firebase.firestore.FieldValue.increment(1), lastUpdated: now
      }, { merge: true });
      const docSnap = await userDocRef.collection('combinations').doc(pairKey).get();
      const count = docSnap.exists ? docSnap.data().count : 0;
      if (count >= 3 && habitInsight) {
        habitInsight.style.display = 'block';
        const last = habits.find(h => h.id === lastCompletedHabitId);
        const cur = habits.find(h => h.id === habitId);
        habitInsight.innerHTML = `💡 ${last?.name || 'Habit'} makes you ${count * 20}% more likely to complete ${cur?.name || 'this habit'} right after!`;
      }
    }
    lastCompletedHabitTime = now;
    lastCompletedHabitId = habitId;
  }

  function renderDashboard() {
    const chapter = chapterFilter ? chapterFilter.value : '';
    let todayFiltered = habits.filter(h => h.routine === currentRoutine && habitScheduledToday(h));
    let missedFiltered = habits.filter(h => h.routine === currentRoutine && !habitScheduledToday(h) && habitScheduledYesterday(h) && !isYesterday(h.lastCompletedDate));
    if (chapter) {
      todayFiltered = todayFiltered.filter(h => h.chapterId === chapter);
      missedFiltered = missedFiltered.filter(h => h.chapterId === chapter);
    }

    if (totalHabitsEl) totalHabitsEl.textContent = habits.length;
    let max = 0; habits.forEach(h => { if (h.streak > max) max = h.streak; });
    if (currentStreakEl) currentStreakEl.textContent = max;

    if (!habitListContainer) return;
    const tokens = parseInt(mintTokensEl?.textContent || '0');

    let html = '';
    // Today's habits
    if (todayFiltered.length > 0) {
      html += '<h4 style="margin:0.5rem 0;">📅 Today</h4>';
      html += todayFiltered.map(h => {
        const done = isToday(h.lastCompletedDate);
        return `<div class="habit-item">
          <div><span>${h.emoji || '✅'}</span> <strong>${h.name}</strong><br><small>${h.time || ''} · ${h.repeat}</small></div>
          <div style="display:flex; gap:0.3rem; align-items:center;">
            <span class="streak-badge">${h.streak || 0}</span>
            <button class="btn complete-btn" data-id="${h.id}" ${done ? 'disabled' : ''} style="width:auto; padding:0.4rem;">${done ? '✓' : 'Done'}</button>
            <button class="btn edit-btn" data-id="${h.id}" style="width:auto; padding:0.4rem;"><i class="fas fa-edit"></i></button>
          </div>
        </div>`;
      }).join('');
    }

    // Missed habits (yesterday)
    if (missedFiltered.length > 0) {
      html += '<h4 style="margin:0.5rem 0;">⚠️ Missed Yesterday</h4>';
      html += missedFiltered.map(h => {
        return `<div class="habit-item">
          <div><span>${h.emoji || '✅'}</span> <strong>${h.name}</strong><br><small>${h.time || ''} · ${h.repeat}</small></div>
          <div style="display:flex; gap:0.3rem; align-items:center;">
            <span class="streak-badge">${h.streak || 0}</span>
            <button class="btn save-streak-btn" data-id="${h.id}" ${tokens <= 0 ? 'disabled' : ''} style="width:auto; padding:0.3rem 0.6rem;">🔒 Save (1 token)</button>
          </div>
        </div>`;
      }).join('');
    }

    habitListContainer.innerHTML = html || '<p style="text-align:center; color:var(--text-secondary);">No habits</p>';

    document.querySelectorAll('.complete-btn').forEach(b => b.addEventListener('click', async e => { await completeHabit(e.currentTarget.dataset.id); }));
    document.querySelectorAll('.save-streak-btn').forEach(b => b.addEventListener('click', async e => { await saveStreakForYesterday(e.currentTarget.dataset.id); }));
    document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', e => openEditHabit(e.currentTarget.dataset.id)));

    populateChapterFilter();
  }

  async function saveStreakForYesterday(habitId) {
    const userDoc = await userDocRef.get();
    let tokens = userDoc.data().mintTokens || 0;
    if (tokens <= 0) return alert('No Mint Tokens left.');
    const ref = userDocRef.collection('habits').doc(habitId);
    const h = habits.find(x => x.id === habitId);
    if (!h) return;
    const yesterday = getYesterdayStr();
    // Calculate new streak based on day before yesterday
    const dayBeforeYesterday = new Date(Date.now() - 2*86400000).toISOString().split('T')[0];
    let newStreak = (h.streak || 0);
    if (h.lastCompletedDate === dayBeforeYesterday) newStreak++;
    else newStreak = 1;
    await ref.update({ lastCompletedDate: yesterday, streak: newStreak });
    await userDocRef.update({ mintTokens: firebase.firestore.FieldValue.increment(-1) });
    await loadHabits();
    renderDashboard();
    if (mintTokensEl) mintTokensEl.textContent = tokens - 1;
    alert('Streak saved for yesterday! 1 token used.');
  }

  async function completeHabit(habitId) {
    const ref = userDocRef.collection('habits').doc(habitId);
    const h = habits.find(x => x.id === habitId);
    if (!h || isToday(h.lastCompletedDate)) return;
    const today = getTodayStr(), yesterday = getYesterdayStr();
    let streak = (h.streak || 0);
    if (h.lastCompletedDate === yesterday) streak++; else streak = 1;
    await ref.update({ lastCompletedDate: today, streak });

    const userDoc = await userDocRef.get(); const d = userDoc.data();
    const xp = (d.totalXP || 0) + 10, level = Math.floor(xp / 100) + 1;
    const newCoins = (d.mintCoins || 0) + 1;
    let newTokens = d.mintTokens || 0;
    if (streak % 7 === 0) newTokens++;
    const badges = d.badges || [];
    if (streak === 7 && !badges.includes('7-day')) badges.push('7-day');
    if (streak === 30 && !badges.includes('30-day')) badges.push('30-day');
    if (level > (d.level || 1)) badges.push(`level-${level}`);
    await userDocRef.update({ totalXP: xp, level, badges, mintCoins: newCoins, mintTokens: newTokens, identity: getIdentity(xp) });
    await db.collection('leaderboard').doc(currentUser.uid).set({ username: d.username, xp }, { merge: true });

    if (h.category) {
      const catMap = { health: 'park', learning: 'library', productivity: 'office', creativity: 'gallery' };
      await userDocRef.update({ [`cityBuildings.${catMap[h.category] || 'park'}`]: firebase.firestore.FieldValue.increment(1) });
    }
    trackCombination(habitId);
    updateImpact();
    applyBossDamage();
    await loadHabits(); renderDashboard();
    if (mintCoinsEl) mintCoinsEl.textContent = newCoins;
    if (mintTokensEl) mintTokensEl.textContent = newTokens;
    if (userIdentity) userIdentity.textContent = getIdentity(xp);
    if (userXPEl) userXPEl.textContent = xp;
  }

  // Habit form (unchanged)
  function openEditHabit(id) {
    const h = habits.find(x => x.id === id); if (!h) return;
    editingHabitId = id;
    if (habitModalTitle) habitModalTitle.textContent = 'Edit Habit';
    if (habitName) habitName.value = h.name;
    if (habitCategory) habitCategory.value = h.category || 'health';
    if (habitRepeat) habitRepeat.value = h.repeat || 'daily';
    if (reminderTimes) reminderTimes.value = (h.reminderTimes || []).join(',');
    if (habitEmoji) habitEmoji.value = h.emoji || '';
    if (habitNotes) habitNotes.value = h.notes || '';
    if (habitRoutine) habitRoutine.value = h.routine || 'morning';
    if (habitChapter) habitChapter.value = h.chapterId || '';
    if (h.repeat === 'custom') {
      if (customDaysContainer) customDaysContainer.style.display = 'flex';
      document.querySelectorAll('#customDaysContainer input').forEach(cb => {
        if (cb && h.repeatDays) cb.checked = h.repeatDays.includes(parseInt(cb.value));
      });
    } else if (customDaysContainer) customDaysContainer.style.display = 'none';
    populateChapterOptions();
    if (habitModal) habitModal.classList.add('active');
  }

  if (addHabitFAB) addHabitFAB.addEventListener('click', () => {
    editingHabitId = null;
    if (habitModalTitle) habitModalTitle.textContent = 'New Habit';
    if (habitName) habitName.value = '';
    if (habitCategory) habitCategory.value = 'health';
    if (habitRepeat) habitRepeat.value = 'daily';
    if (reminderTimes) reminderTimes.value = '';
    if (habitEmoji) habitEmoji.value = '';
    if (habitNotes) habitNotes.value = '';
    if (habitRoutine) habitRoutine.value = 'morning';
    if (habitChapter) habitChapter.value = '';
    if (customDaysContainer) customDaysContainer.style.display = 'none';
    populateChapterOptions();
    if (habitModal) habitModal.classList.add('active');
  });

  if (habitRepeat) habitRepeat.addEventListener('change', () => {
    if (customDaysContainer) customDaysContainer.style.display = habitRepeat.value === 'custom' ? 'flex' : 'none';
  });

  if (saveHabitBtn) saveHabitBtn.addEventListener('click', async () => {
    const name = habitName?.value?.trim();
    if (!name) return alert('Name required');
    const repeat = habitRepeat?.value || 'daily';
    let repeatDays = [];
    if (repeat === 'custom') repeatDays = Array.from(document.querySelectorAll('#customDaysContainer input:checked')).map(cb => parseInt(cb.value));
    const data = {
      name, category: habitCategory?.value || 'health', repeat, repeatDays,
      time: reminderTimes?.value?.split(',')[0]?.trim() || '08:00',
      reminderTimes: reminderTimes?.value?.split(',').map(s => s.trim()).filter(Boolean) || [],
      emoji: habitEmoji?.value || '✅', notes: habitNotes?.value || '',
      routine: habitRoutine?.value || 'morning', chapterId: habitChapter?.value || null,
      streak: editingHabitId ? (habits.find(h => h.id === editingHabitId)?.streak || 0) : 0,
      lastCompletedDate: editingHabitId ? (habits.find(h => h.id === editingHabitId)?.lastCompletedDate || null) : null
    };
    if (editingHabitId) await userDocRef.collection('habits').doc(editingHabitId).update(data);
    else await userDocRef.collection('habits').add(data);
    if (habitModal) habitModal.classList.remove('active');
    await loadHabits(); renderDashboard();
  });

  // Chapters
  async function populateChapterFilter() {
    if (!chapterFilter || !userDocRef) return;
    const snap = await userDocRef.collection('chapters').get();
    const chapters = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
    chapterFilter.innerHTML = '<option value="">All Chapters</option>' + chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    chapterFilter.value = chapterFilter.dataset.current || '';
    chapterFilter.onchange = () => { chapterFilter.dataset.current = chapterFilter.value; renderDashboard(); };
  }
  async function populateChapterOptions() {
    if (!habitChapter || !userDocRef) return;
    const snap = await userDocRef.collection('chapters').get();
    const chapters = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
    habitChapter.innerHTML = '<option value="">No Chapter</option>' + chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  // Render other screens
  function renderDNA() {
    if (!dnaBars) return;
    const cats = { Health: 0, Learning: 0, Productivity: 0, Creativity: 0 };
    habits.forEach(h => { if (h.category) { const key = h.category.charAt(0).toUpperCase() + h.category.slice(1); cats[key]++; } });
    const total = habits.length || 1;
    dnaBars.innerHTML = Object.entries(cats).map(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      return `<div><strong>${name}</strong> ${pct}% <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
    }).join('');
  }

  // City canvas
  class VirtualCity {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.buildings = [];
    this.trees = [];
    this.clouds = [];
    this.time = 0;
    this.resize();
    // Generate some random clouds
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * this.canvas.width,
        y: 20 + Math.random() * 80,
        speed: 0.2 + Math.random() * 0.5
      });
   }
  }

  resize() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = 350;
    // Re‑place clouds
    this.clouds.forEach(c => {
      c.x = Math.random() * this.canvas.width;
      c.y = 20 + Math.random() * 80;
    });
    this.draw();
  }

  updateFromData(city) {
    this.buildings = [];
    this.trees = [];
    const groundY = this.canvas.height * 0.65;
    const types = {
      park: (x, y) => this.createPark(x, y),
      library: (x, y) => this.createLibrary(x, y),
      office: (x, y) => this.createOffice(x, y),
      gallery: (x, y) => this.createGallery(x, y)
    };
    Object.entries(city).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        const x = 50 + Math.random() * (this.canvas.width - 100);
        const y = groundY;
        if (types[type]) types[type](x, y);
      }
    });
    this.draw();
  }

  createPark(x, groundY) {
    // Grass patch
    this.buildings.push({ type: 'park', x, y: groundY - 15, w: 60, h: 15, color: '#4CAF50' });
    // Two trees
    this.trees.push({ x: x + 10, y: groundY - 15, size: 15 });
    this.trees.push({ x: x + 45, y: groundY - 15, size: 12 });
  }

  createLibrary(x, groundY) {
    this.buildings.push({
      type: 'library',
      x, y: groundY - 50,
      w: 60, h: 50,
      color: '#8B4513',
      roofColor: '#5D4037',
      windows: this.generateWindows(60, 50, 4, 2)
    });
  }

  createOffice(x, groundY) {
    this.buildings.push({
      type: 'office',
      x, y: groundY - 80,
      w: 55, h: 80,
      color: '#607D8B',
      roofColor: '#455A64',
      windows: this.generateWindows(55, 80, 4, 4)
    });
  }

  createGallery(x, groundY) {
    this.buildings.push({
      type: 'gallery',
      x, y: groundY - 45,
      w: 65, h: 45,
      color: '#E91E63',
      roofColor: '#AD1457',
      dome: true,
      windows: this.generateWindows(65, 45, 3, 2)
    });
  }

  generateWindows(bw, bh, cols, rows) {
    const wins = [];
    const margin = 8;
    const spacingX = (bw - margin * 2) / (cols + 1);
    const spacingY = (bh - margin * 2) / (rows + 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        wins.push({
          x: margin + spacingX * (c + 1) - 6,
          y: margin + spacingY * (r + 1) - 5,
          lit: Math.random() > 0.3
        });
      }
    }
    return wins;
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.6);

    // Ground
    ctx.fillStyle = '#7CB342';
    ctx.fillRect(0, h * 0.6, w, h * 0.4);

    // Road
    ctx.fillStyle = '#424242';
    ctx.fillRect(0, h * 0.78, w, 25);
    // Road line
    ctx.strokeStyle = '#FFC107';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.78 + 12);
    ctx.lineTo(w, h * 0.78 + 12);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw buildings
    this.buildings.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      // Roof
      ctx.fillStyle = b.roofColor || b.color;
      if (b.type === 'library') {
        // Triangular roof
        ctx.beginPath();
        ctx.moveTo(b.x - 5, b.y);
        ctx.lineTo(b.x + b.w / 2, b.y - 15);
        ctx.lineTo(b.x + b.w + 5, b.y);
        ctx.fill();
      } else if (b.type === 'office') {
        // Flat roof with edge
        ctx.fillRect(b.x, b.y - 4, b.w, 4);
      } else if (b.dome) {
        // Dome for gallery
        ctx.beginPath();
        ctx.arc(b.x + b.w / 2, b.y, b.w / 2, Math.PI, 0);
        ctx.fill();
      }
      // Windows
      if (b.windows) {
        b.windows.forEach(win => {
          ctx.fillStyle = win.lit ? '#FFE082' : '#37474F';
          ctx.fillRect(b.x + win.x, b.y + win.y, 10, 12);
          if (win.lit) {
            ctx.fillStyle = 'rgba(255,224,130,0.3)';
            ctx.fillRect(b.x + win.x - 1, b.y + win.y - 1, 12, 14);
          }
        });
      }
      // Door for libraries
      if (b.type === 'library') {
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(b.x + b.w / 2 - 8, b.y + b.h - 18, 16, 18);
      }
    });

    // Draw trees (parks)
    this.trees.forEach(t => {
      this.drawTree(ctx, t.x, t.y, t.size);
    });

    // Animated clouds
    this.clouds.forEach(c => {
      this.drawCloud(ctx, c.x, c.y);
      c.x += c.speed;
      if (c.x > w + 40) c.x = -40;
    });

    requestAnimationFrame(() => {
      this.time += 0.02;
      this.draw();
    });
  }

  drawTree(ctx, x, y, size) {
    // Trunk
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x - size / 6, y, size / 3, size);
    // Leaves (three circles)
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.6, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.8, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y - size * 0.8, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCloud(ctx, x, y) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.arc(x + 15, y - 8, 20, 0, Math.PI * 2);
    ctx.arc(x + 30, y, 15, 0, Math.PI * 2);
    ctx.fill();
  }


  // Messages, Bosses, Chapters, Impact, Achievements, Leaderboard (unchanged)
  async function renderMessages() {
    if (!messagesList || !userDocRef) return;
    const snap = await userDocRef.collection('messages').get();
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const today = new Date();
    messagesList.innerHTML = msgs.map(m => {
      const locked = checkLocked(m, today);
      return `<div class="card"><p>${locked ? '🔒 Locked' : '✉️ ' + m.content}</p><small>${m.condition}</small></div>`;
    }).join('');
  }
  function checkLocked(msg, today) {
    if (msg.condition === '30days') {
      const created = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
      return (today - created) < 30 * 86400000;
    } else if (msg.condition === 'streak100') {
      return !habits.some(h => h.streak >= 100);
    } else if (msg.condition === 'level5') {
      return Math.floor((userDocRef ? (async () => { const doc = await userDocRef.get(); return doc.data()?.totalXP || 0; })() : 0) / 100) + 1 < 5;
    }
    return true;
  }
  async function renderBosses() {
    if (!activeBosses || !userDocRef) return;
    const snap = await userDocRef.collection('bosses').get();
    const bosses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    activeBosses.innerHTML = bosses.map(b => {
      const progress = b.totalDays ? ((b.daysCompleted || 0) / b.totalDays) * 100 : 0;
      return `<div class="card"><strong>⚔️ ${b.name}</strong> (${b.daysCompleted || 0}/${b.totalDays} days)<div class="boss-bar"><div class="boss-fill" style="width:${progress}%"></div></div></div>`;
    }).join('') || '<p>No active battles.</p>';
  }
  async function renderChapters() {
    if (!chaptersList || !userDocRef) return;
    const snap = await userDocRef.collection('chapters').get();
    const chapters = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
    chaptersList.innerHTML = chapters.map(c => `<div class="card"><strong>📖 ${c.name}</strong></div>`).join('');
  }
  async function updateImpact() {
    if (!impactStats || !userDocRef) return;
    const doc = await userDocRef.get();
    const cause = doc.data()?.settings?.cause || 'education';
    let stats = '';
    if (cause === 'education') stats = `📚 ${habits.filter(h => h.category === 'learning').reduce((s, h) => s + (h.streak || 0) * 30, 0)} minutes of study this year.`;
    else if (cause === 'environment') stats = `🌍 ${habits.filter(h => h.category === 'health').length * 5} kg of CO₂ saved.`;
    else if (cause === 'health') stats = `❤️ Improved fitness age by ${habits.filter(h => h.category === 'health').length} years.`;
    impactStats.innerHTML = stats;
  }
  async function loadAchievements() {
    if (!achievementsList || !userDocRef) return;
    const doc = await userDocRef.get();
    const badges = doc.data()?.badges || [];
    achievementsList.innerHTML = badges.length ? badges.map(b => `<p>🏅 ${b.replace(/-/g, ' ')}</p>`).join('') : '<p>No achievements yet.</p>';
  }
  async function loadLeaderboard() {
    if (!leaderboardList) return;
    const snap = await db.collection('leaderboard').orderBy('xp', 'desc').limit(20).get();
    let html = '<ol>';
    snap.forEach(d => { const u = d.data(); html += `<li>${u.username} – ${u.xp} XP</li>`; });
    html += '</ol>';
    leaderboardList.innerHTML = html;
    // Check and award leaderboard rewards every 30 days
    const lastRewardDoc = await db.collection('leaderboardRewards').doc('last').get();
    const now = Date.now();
    if (!lastRewardDoc.exists || (now - lastRewardDoc.data().timestamp) > 30*86400000) {
      // Award top 2
      const top2 = await db.collection('leaderboard').orderBy('xp', 'desc').limit(2).get();
      const rewards = [500, 200];
      let i = 0;
      top2.forEach(doc => {
        if (doc.data().xp > 0) {
          db.collection('users').doc(doc.id).update({ mintCoins: firebase.firestore.FieldValue.increment(rewards[i]) });
        }
        i++;
      });
      await db.collection('leaderboardRewards').doc('last').set({ timestamp: now });
    }
  }
  async function applyBossDamage() {
    if (!userDocRef) return;
    const snap = await userDocRef.collection('bosses').where('active', '==', true).get();
    snap.forEach(async doc => {
      const boss = doc.data();
      await doc.ref.update({ daysCompleted: firebase.firestore.FieldValue.increment(1) });
      if (boss.daysCompleted + 1 >= boss.totalDays) {
        await doc.ref.update({ active: false });
        alert(`Boss "${boss.name}" defeated! 🎉`);
      }
    });
  }

  // MINT SHOP (updated with XP packs and all 30 themes)
  async function renderShop() {
    if (!shopItems || !userDocRef) {
      return;
    }
    try {
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) return;
      const coins = userDoc.data().mintCoins || 0;
      const xp = userDoc.data().totalXP || 0;
      const owned = userDoc.data().ownedThemes || [];
      const currentTheme = userDoc.data().settings?.theme || 'midnight';

      if (shopCoinBalance) shopCoinBalance.textContent = coins;
      if (shopXPDisplay) shopXPDisplay.textContent = xp;

      // XP packs
      if (xpPacks) {
        xpPacks.innerHTML = xpPacksList.map(p => `
          <div class="shop-item">
            <div class="shop-item-info"><span>💎 ${p.amount} XP</span></div>
            <button class="btn btn-small buy-xp-btn" data-amount="${p.amount}" data-cost="${p.cost}" ${coins < p.cost ? 'disabled' : ''}>Buy ${p.cost} 🪙</button>
          </div>
        `).join('');
        document.querySelectorAll('.buy-xp-btn').forEach(b => {
          b.addEventListener('click', async e => {
            const cost = parseInt(e.target.dataset.cost);
            const amount = parseInt(e.target.dataset.amount);
            const doc = await userDocRef.get();
            if ((doc.data().mintCoins || 0) < cost) return alert('Not enough coins');
            await userDocRef.update({
              mintCoins: firebase.firestore.FieldValue.increment(-cost),
              totalXP: firebase.firestore.FieldValue.increment(amount)
            });
            const updated = await userDocRef.get();
            if (mintCoinsEl) mintCoinsEl.textContent = updated.data().mintCoins;
            if (userXPEl) userXPEl.textContent = updated.data().totalXP;
            renderShop();
          });
        });
      }

      // Themes
      shopItems.innerHTML = shopThemes.map(theme => {
        const isOwned = owned.includes(theme.id);
        const isCurrent = currentTheme === theme.id;
        return `<div class="shop-item">
          <div class="shop-item-info"><span class="shop-item-emoji">${theme.emoji}</span> ${theme.name}</div>
          <div style="display:flex; gap:0.3rem;">
            ${isOwned ? `<button class="btn btn-small apply-theme-btn" data-id="${theme.id}" ${isCurrent ? 'disabled' : ''}>${isCurrent ? 'Active' : 'Use'}</button>` : ''}
            <button class="btn btn-small buy-theme-btn" data-id="${theme.id}" data-cost="${theme.cost}" ${isOwned || coins < theme.cost ? 'disabled' : ''}>${isOwned ? 'Owned' : `Buy ${theme.cost} 🪙`}</button>
          </div>
        </div>`;
      }).join('');

      document.querySelectorAll('.buy-theme-btn').forEach(b => {
        b.addEventListener('click', async e => {
          const themeId = e.target.dataset.id;
          const cost = parseInt(e.target.dataset.cost);
          const doc = await userDocRef.get();
          if ((doc.data().mintCoins || 0) < cost) return alert('Not enough Mint Coins');
          const owned = doc.data().ownedThemes || [];
          if (owned.includes(themeId)) return;
          owned.push(themeId);
          await userDocRef.update({
            mintCoins: firebase.firestore.FieldValue.increment(-cost),
            ownedThemes: owned
          });
          const updated = await userDocRef.get();
          if (mintCoinsEl) mintCoinsEl.textContent = updated.data().mintCoins;
          renderShop();
          alert('Theme purchased! Apply it now.');
        });
      });

      document.querySelectorAll('.apply-theme-btn').forEach(b => {
        b.addEventListener('click', async e => {
          const themeId = e.target.dataset.id;
          applyTheme(themeId);
          await userDocRef.update({ 'settings.theme': themeId });
          renderShop();
        });
      });
    } catch (err) {
      console.error('Shop error:', err);
    }
  }

  // NAVIGATION
  function setActiveNav(btn) {
    [navDashboard, navDNA, navCity, navMessages, navBoss, navChapters, navImpact, navAchievements, navLeaderboard, navSettings].forEach(b => b?.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  if (navDashboard) navDashboard.addEventListener('click', () => { showScreen(mainAppScreen); setActiveNav(navDashboard); });
  if (navDNA) navDNA.addEventListener('click', () => { showScreen(dnaScreen); renderDNA(); setActiveNav(navDNA); });
  if (navCity) navCity.addEventListener('click', () => { showScreen(cityScreen); renderCity(); setActiveNav(navCity); });
  if (navMessages) navMessages.addEventListener('click', () => { showScreen(messagesScreen); renderMessages(); setActiveNav(navMessages); });
  if (navBoss) navBoss.addEventListener('click', () => { showScreen(bossScreen); renderBosses(); setActiveNav(navBoss); });
  if (navChapters) navChapters.addEventListener('click', () => { showScreen(chaptersScreen); renderChapters(); setActiveNav(navChapters); });
  if (navImpact) navImpact.addEventListener('click', () => { showScreen(impactScreen); updateImpact(); setActiveNav(navImpact); });
  if (navAchievements) navAchievements.addEventListener('click', () => { showScreen(achievementsScreen); loadAchievements(); setActiveNav(navAchievements); });
  if (navLeaderboard) navLeaderboard.addEventListener('click', () => { showScreen(leaderboardScreen); loadLeaderboard(); setActiveNav(navLeaderboard); });
  if (navSettings) navSettings.addEventListener('click', () => { showScreen(settingsView); setActiveNav(navSettings); });

  // Back buttons
  $('backFromDNA')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromCity')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromMessages')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromBoss')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromChapters')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromImpact')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromAchievements')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromLeaderboard')?.addEventListener('click', () => showScreen(mainAppScreen));
  if (backFromSettings) backFromSettings.addEventListener('click', () => showScreen(mainAppScreen));

  // Other modal openers
  $('newMessageBtn')?.addEventListener('click', () => messageModal?.classList.add('active'));
  if (saveMessageBtn) saveMessageBtn.addEventListener('click', async () => {
    const content = messageContent?.value?.trim(); if (!content) return;
    const condition = unlockCondition?.value || '30days';
    await userDocRef.collection('messages').add({ content, condition, createdAt: new Date().toISOString() });
    messageModal?.classList.remove('active');
    renderMessages();
  });
  $('startBossBtn')?.addEventListener('click', () => bossModal?.classList.add('active'));
  if (startBossChallengeBtn) startBossChallengeBtn.addEventListener('click', async () => {
    const name = bossName?.value?.trim(); const days = parseInt(bossDays?.value);
    if (!name || !days) return alert('Fill all fields');
    await userDocRef.collection('bosses').add({ name, totalDays: days, daysCompleted: 0, active: true });
    bossModal?.classList.remove('active');
    renderBosses();
  });
  $('newChapterBtn')?.addEventListener('click', () => chapterModal?.classList.add('active'));
  if (saveChapterBtn) saveChapterBtn.addEventListener('click', async () => {
    const name = chapterName?.value?.trim(); if (!name) return;
    await userDocRef.collection('chapters').add({ name });
    chapterModal?.classList.remove('active');
    renderChapters();
    populateChapterFilter();
  });

  if (openShopBtn) openShopBtn.addEventListener('click', () => { shopModal?.classList.add('active'); renderShop(); });
  if (openShopFromSettings) openShopFromSettings.addEventListener('click', () => { shopModal?.classList.add('active'); renderShop(); });
  if (howItWorksBtn) howItWorksBtn.addEventListener('click', () => howItWorksModal?.classList.add('active'));
  if (progressReplayBtn) progressReplayBtn.addEventListener('click', showReplay);
  if (showPrivacyBtn) showPrivacyBtn.addEventListener('click', () => privacyModal?.classList.add('active'));
  if (showFaqBtn) showFaqBtn.addEventListener('click', () => faqModal?.classList.add('active'));

  // Close modals
  document.querySelectorAll('.close-modal').forEach(b => {
    b.addEventListener('click', () => {
      const modal = document.getElementById(b.dataset.modal);
      if (modal) modal.classList.remove('active');
    });
  });
  window.addEventListener('click', e => { if (e.target.classList.contains('modal')) e.target.classList.remove('active'); });

  // Delete account
  if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', async () => {
    if (confirm('Delete account and all data?')) {
      await userDocRef.delete();
      await db.collection('leaderboard').doc(currentUser.uid).delete();
      await currentUser.delete();
    }
  });

  async function showReplay() {
    if (!replayStats || !replayModal) return;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const completions = habits.filter(h => h.lastCompletedDate >= monthStart).length;
    replayStats.innerHTML = `🎉 This month: ${completions} habits completed!`;
    replayModal.classList.add('active');
  }

  // Theme functions
  function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('goalMintTheme', theme);
    if (currentThemeName) currentThemeName.textContent = getThemeDisplayName(theme);
  }
  function applySavedTheme() {
    applyTheme(localStorage.getItem('goalMintTheme') || 'midnight');
  }

  // Share
  if (shareProgressBtn) shareProgressBtn.addEventListener('click', async () => {
    const doc = await userDocRef.get();
    const d = doc.data();
    const text = `I'm ${getIdentity(d.totalXP || 0)} on GoaLMint! 🚀`;
    if (navigator.share) navigator.share({ title: 'GoaLMint', text });
    else alert('Copy: ' + text);
  });

  // Copy referral code
  if (copyReferralBtn) copyReferralBtn.addEventListener('click', async () => {
    const code = myReferralCode?.textContent;
    if (code && code !== 'Loading...') {
      await navigator.clipboard.writeText(code);
      alert('Referral code copied!');
    }
  });

  // Notifications
  function requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }
  setInterval(() => {
    if (!currentUser || !habits.length) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    habits.forEach(h => {
      const times = h.reminderTimes || [h.time];
      if (times.includes(timeStr) && habitScheduledToday(h) && !isToday(h.lastCompletedDate) && Notification.permission === 'granted') {
        new Notification(`⏰ ${h.name}`, { body: 'Time to complete your habit!' });
      }
    });
  }, 60000);
});