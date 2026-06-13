// script.js – GoaLMint with Avatar System (no city)
let currentUser = null, userDocRef = null, habits = [], currentRoutine = 'morning', editingHabitId = null;
let lastCompletedHabitTime = null, lastCompletedHabitId = null;

document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  // SCREENS
  const loginScreen = $('loginScreen'), registerScreen = $('registerScreen'), mainAppScreen = $('mainAppScreen');
  const avatarScreen = $('avatarScreen');
  const bossScreen = $('bossScreen'), achievementsScreen = $('achievementsScreen'), settingsView = $('settingsView');
  // Other screens (accessible from Settings)
  const dnaScreen = $('dnaScreen'), messagesScreen = $('messagesScreen');
  const chaptersScreen = $('chaptersScreen'), impactScreen = $('impactScreen');
  const leaderboardScreen = $('leaderboardScreen');

  // AUTH
  const loginEmail = $('loginEmail'), loginPassword = $('loginPassword'), loginBtn = $('loginBtn'), showRegisterBtn = $('showRegisterBtn');
  const regEmail = $('regEmail'), regUsername = $('regUsername'), regAge = $('regAge'), regWeight = $('regWeight'), regPassword = $('regPassword'), registerBtn = $('registerBtn'), backToLoginBtn = $('backToLoginBtn');
  const referralCodeInput = $('referralCodeInput');

  // DASHBOARD
  const userGreeting = $('userGreeting'), totalHabitsEl = $('totalHabits'), currentStreakEl = $('currentStreak');
  const userXPEl = $('userXP'), mintCoinsEl = $('mintCoins'), mintTokensEl = $('mintTokens');
  const habitListContainer = $('habitListContainer'), tabMorning = $('tabMorning'), tabEvening = $('tabEvening'), addHabitFAB = $('addHabitFAB');
  const logoutMainBtn = $('logoutMainBtn'), mentorMessage = $('mentorMessage');
  const chapterFilter = $('chapterFilter'), habitInsight = $('habitInsight');
  const myReferralCode = $('myReferralCode'), copyReferralBtn = $('copyReferralBtn');

  // Daily goal bar
  const dailyGoalFill = $('dailyGoalFill'), dailyGoalPercent = $('dailyGoalPercent');

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

  // Settings buttons for hidden screens
  const openDNABtn = $('openDNABtn'), openMessagesBtn = $('openMessagesBtn'), openChaptersBtn = $('openChaptersBtn');
  const openImpactBtn = $('openImpactBtn'), openLeaderboardBtn = $('openLeaderboardBtn');

  // OTHER SCREENS
  const dnaBars = $('dnaBars'), messagesList = $('messagesList'), activeBosses = $('activeBosses');
  const chaptersList = $('chaptersList'), impactStats = $('impactStats'), achievementsList = $('achievementsList'), leaderboardList = $('leaderboardList');

  // AVATAR DASHBOARD SHOWCASE
  const avatarIcon = $('avatarIcon'), avatarShowcaseName = $('avatarShowcaseName');
  const avatarStrength = $('avatarStrength'), avatarKnowledge = $('avatarKnowledge');
  const avatarFocus = $('avatarFocus'), avatarCreativity = $('avatarCreativity'), avatarLevel = $('avatarLevel');

  // AVATAR FULL SCREEN
  const avatarLargeIcon = $('avatarLargeIcon'), avatarStageName = $('avatarStageName');
  const avatarScreenLevel = $('avatarScreenLevel'), avatarXP = $('avatarXP'), avatarLevelBar = $('avatarLevelBar');
  const avatarStatStrength = $('avatarStatStrength'), avatarStatKnowledge = $('avatarStatKnowledge');
  const avatarStatFocus = $('avatarStatFocus'), avatarStatCreativity = $('avatarStatCreativity');
  const cosmeticsShop = $('cosmeticsShop');

  // NEW BOTTOM NAV (5 tabs)
  const navDashboard = $('navDashboard'), navAvatar = $('navAvatar'), navBoss = $('navBoss');
  const navProgress = $('navProgress'), navSettings = $('navSettings');

  // ---- INIT AVATAR SYSTEM ----
  AvatarSystem.init({
    avatarStrength, avatarKnowledge, avatarFocus, avatarCreativity,
    avatarShowcaseName, avatarLevel, avatarIcon,
    avatarLargeIcon, avatarStageName, avatarScreenLevel, avatarXP, avatarLevelBar,
    avatarStatStrength, avatarStatKnowledge, avatarStatFocus, avatarStatCreativity,
    cosmeticsShop
  });
  // Expose mintCoinsEl globally for avatar purchases
  window.mintCoinsEl = mintCoinsEl;

  // --- SCREEN SWITCH ---
  function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (screen) screen.classList.add('active');
  }

  // --- AUTH ---
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
        avatarStats: { strength: 0, knowledge: 0, focus: 0, creativity: 0 },
        ownedCosmetics: [], equippedCosmetics: {},
        identity: 'Beginner', ownedThemes: ['midnight'],
        referralCode
      };
      await db.collection('users').doc(uid).set(userData);
      await db.collection('referralCodes').doc(referralCode).set({ userId: uid });
      await db.collection('leaderboard').doc(uid).set({ username, xp: 0 });

      const refCode = referralCodeInput ? referralCodeInput.value.trim() : '';
      if (refCode) {
        const refDoc = await db.collection('referralCodes').doc(refCode).get();
        if (refDoc.exists) {
          const inviterId = refDoc.data().userId;
          await db.collection('users').doc(inviterId).update({ mintCoins: firebase.firestore.FieldValue.increment(20) });
          await db.collection('users').doc(uid).update({ mintCoins: firebase.firestore.FieldValue.increment(20) });
        }
      }
    } catch (e) { alert('Registration failed: ' + e.message); }
  });

  if (logoutMainBtn) logoutMainBtn.addEventListener('click', () => auth.signOut());

  async function loadUserData() {
    const doc = await userDocRef.get();
    if (!doc.exists) return;
    const d = doc.data();
    if (userGreeting) userGreeting.textContent = `👋 ${d.username || 'User'}`;
    const xp = d.totalXP || 0;
    if (userXPEl) userXPEl.textContent = xp;
    if (mintCoinsEl) mintCoinsEl.textContent = d.mintCoins || 0;
    if (mintTokensEl) mintTokensEl.textContent = d.mintTokens || 0;
    if (trackingMode) trackingMode.value = d.settings?.trackingMode || 'normal';
    if (causeSelect) causeSelect.value = d.settings?.cause || 'education';
    const theme = d.settings?.theme || 'midnight';
    applyTheme(theme);
    if (currentThemeName) currentThemeName.textContent = getThemeDisplayName(theme);
    if (myReferralCode) myReferralCode.textContent = d.referralCode || '';
    updateMentorMessage();
    AvatarSystem.updateShowcase(d);
  }

  // --- HABITS ---
  async function loadHabits() {
    const snap = await userDocRef.collection('habits').get();
    habits = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

    const totalToday = todayFiltered.length;
    const completedToday = todayFiltered.filter(h => isToday(h.lastCompletedDate)).length;
    const percent = totalToday ? Math.round((completedToday / totalToday) * 100) : 0;
    if (dailyGoalFill) dailyGoalFill.style.width = percent + '%';
    if (dailyGoalPercent) dailyGoalPercent.textContent = percent + '% (' + completedToday + '/' + totalToday + ')';
  }

  async function saveStreakForYesterday(habitId) {
    const userDoc = await userDocRef.get();
    let tokens = userDoc.data().mintTokens || 0;
    if (tokens <= 0) return alert('No Mint Tokens left.');
    const ref = userDocRef.collection('habits').doc(habitId);
    const h = habits.find(x => x.id === habitId);
    if (!h) return;
    const yesterday = getYesterdayStr();
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

    // Increment avatar stat instead of city building
    if (h.category) {
      AvatarSystem.incrementStat(h.category);
    }
    trackCombination(habitId);
    updateImpact();
    applyBossDamage();
    await loadHabits(); renderDashboard();
    if (mintCoinsEl) mintCoinsEl.textContent = newCoins;
    if (mintTokensEl) mintTokensEl.textContent = newTokens;
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

  // Chapters (unchanged)
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

  // Render DNA etc.
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
    const lastRewardDoc = await db.collection('leaderboardRewards').doc('last').get();
    const now = Date.now();
    if (!lastRewardDoc.exists || (now - lastRewardDoc.data().timestamp) > 30*86400000) {
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

  // MINT SHOP (unchanged)
  async function renderShop() {
    if (!shopItems || !userDocRef) return;
    try {
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) return;
      const coins = userDoc.data().mintCoins || 0;
      const xp = userDoc.data().totalXP || 0;
      const owned = userDoc.data().ownedThemes || [];
      const currentTheme = userDoc.data().settings?.theme || 'midnight';

      if (shopCoinBalance) shopCoinBalance.textContent = coins;
      if (shopXPDisplay) shopXPDisplay.textContent = xp;

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
          await userDocRef.update({ mintCoins: firebase.firestore.FieldValue.increment(-cost), ownedThemes: owned });
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

  // ---- NAVIGATION (5 tabs) ----
  function setActiveNav(btn) {
    [navDashboard, navAvatar, navBoss, navProgress, navSettings].forEach(b => b?.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  if (navDashboard) navDashboard.addEventListener('click', () => { showScreen(mainAppScreen); setActiveNav(navDashboard); });
  if (navAvatar) navAvatar.addEventListener('click', () => { showScreen(avatarScreen); AvatarSystem.renderScreen(); setActiveNav(navAvatar); });
  if (navBoss) navBoss.addEventListener('click', () => { showScreen(bossScreen); renderBosses(); setActiveNav(navBoss); });
  if (navProgress) navProgress.addEventListener('click', () => { showScreen(achievementsScreen); loadAchievements(); setActiveNav(navProgress); });
  if (navSettings) navSettings.addEventListener('click', () => { showScreen(settingsView); setActiveNav(navSettings); });

  // Back buttons
  $('backFromAvatar')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromBoss')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromAchievements')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromDNA')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromMessages')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromChapters')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromImpact')?.addEventListener('click', () => showScreen(mainAppScreen));
  $('backFromLeaderboard')?.addEventListener('click', () => showScreen(mainAppScreen));
  if (backFromSettings) backFromSettings.addEventListener('click', () => showScreen(mainAppScreen));

  // Settings buttons to hidden screens
  if (openDNABtn) openDNABtn.addEventListener('click', () => showScreen(dnaScreen));
  if (openMessagesBtn) openMessagesBtn.addEventListener('click', () => showScreen(messagesScreen));
  if (openChaptersBtn) openChaptersBtn.addEventListener('click', () => showScreen(chaptersScreen));
  if (openImpactBtn) openImpactBtn.addEventListener('click', () => showScreen(impactScreen));
  if (openLeaderboardBtn) openLeaderboardBtn.addEventListener('click', () => showScreen(leaderboardScreen));

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

  document.querySelectorAll('.close-modal').forEach(b => {
    b.addEventListener('click', () => {
      const modal = document.getElementById(b.dataset.modal);
      if (modal) modal.classList.remove('active');
    });
  });
  window.addEventListener('click', e => { if (e.target.classList.contains('modal')) e.target.classList.remove('active'); });

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

  function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('goalMintTheme', theme);
    if (currentThemeName) currentThemeName.textContent = getThemeDisplayName(theme);
  }
  function applySavedTheme() { applyTheme(localStorage.getItem('goalMintTheme') || 'midnight'); }

  if (shareProgressBtn) shareProgressBtn.addEventListener('click', async () => {
    const doc = await userDocRef.get();
    const d = doc.data();
    const text = `I'm ${getIdentity(d.totalXP || 0)} on GoaLMint! 🚀`;
    if (navigator.share) navigator.share({ title: 'GoaLMint', text });
    else alert('Copy: ' + text);
  });

  if (copyReferralBtn) copyReferralBtn.addEventListener('click', async () => {
    const code = myReferralCode?.textContent;
    if (code && code !== 'Loading...') {
      await navigator.clipboard.writeText(code);
      alert('Referral code copied!');
    }
  });

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
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