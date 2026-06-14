// habits.js – FULL VERSION, NO PLACEHOLDERS
const Habits = {
  data: [],
  currentRoutine: 'morning',
  editingId: null,
  lastCompletedHabitTime: null,
  lastCompletedHabitId: null,

  async load() {
    if (!App.userDocRef) return;
    const snap = await App.userDocRef.collection('habits').get();
    this.data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  renderDashboard() {
    const chapterFilter = document.getElementById('chapterFilter');
    const chapter = chapterFilter ? chapterFilter.value : '';
    let todayFiltered = this.data.filter(h => h.routine === this.currentRoutine && habitScheduledToday(h));
    let missedFiltered = this.data.filter(h => h.routine === this.currentRoutine && !habitScheduledToday(h) && habitScheduledYesterday(h) && !isYesterday(h.lastCompletedDate));
    if (chapter) {
      todayFiltered = todayFiltered.filter(h => h.chapterId === chapter);
      missedFiltered = missedFiltered.filter(h => h.chapterId === chapter);
    }

    document.getElementById('totalHabits').textContent = this.data.length;
    let max = 0; this.data.forEach(h => { if (h.streak > max) max = h.streak; });
    document.getElementById('currentStreak').textContent = max;

    const habitListContainer = document.getElementById('habitListContainer');
    if (!habitListContainer) return;
    const tokens = parseInt(document.getElementById('mintTokens')?.textContent || '0');

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

    document.querySelectorAll('.complete-btn').forEach(b => b.addEventListener('click', async e => {
      await this.completeHabit(e.currentTarget.dataset.id);
    }));
    document.querySelectorAll('.save-streak-btn').forEach(b => b.addEventListener('click', async e => {
      await this.saveStreakForYesterday(e.currentTarget.dataset.id);
    }));
    document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', e => this.openEditHabit(e.currentTarget.dataset.id)));

    this.populateChapterFilter();

    const totalToday = todayFiltered.length;
    const completedToday = todayFiltered.filter(h => isToday(h.lastCompletedDate)).length;
    const percent = totalToday ? Math.round((completedToday / totalToday) * 100) : 0;
    const dailyGoalFill = document.getElementById('dailyGoalFill');
    const dailyGoalPercent = document.getElementById('dailyGoalPercent');
    if (dailyGoalFill) dailyGoalFill.style.width = percent + '%';
    if (dailyGoalPercent) dailyGoalPercent.textContent = percent + '% (' + completedToday + '/' + totalToday + ')';
  },

  async saveStreakForYesterday(habitId) {
    const userDoc = await App.userDocRef.get();
    let tokens = userDoc.data().mintTokens || 0;
    if (tokens <= 0) return alert('No Mint Tokens left.');
    const ref = App.userDocRef.collection('habits').doc(habitId);
    const h = this.data.find(x => x.id === habitId);
    if (!h) return;
    const yesterday = getYesterdayStr();
    const dayBeforeYesterday = new Date(Date.now() - 2*86400000).toISOString().split('T')[0];
    let newStreak = (h.streak || 0);
    if (h.lastCompletedDate === dayBeforeYesterday) newStreak++;
    else newStreak = 1;
    await ref.update({ lastCompletedDate: yesterday, streak: newStreak });
    await App.userDocRef.update({ mintTokens: firebase.firestore.FieldValue.increment(-1) });
    await this.load();
    this.renderDashboard();
    document.getElementById('mintTokens').textContent = tokens - 1;
    alert('Streak saved for yesterday! 1 token used.');
  },

  async completeHabit(habitId) {
    const ref = App.userDocRef.collection('habits').doc(habitId);
    const h = this.data.find(x => x.id === habitId);
    if (!h || isToday(h.lastCompletedDate)) return;
    const today = getTodayStr(), yesterday = getYesterdayStr();
    let streak = (h.streak || 0);
    if (h.lastCompletedDate === yesterday) streak++; else streak = 1;
    await ref.update({ lastCompletedDate: today, streak });

    const userDoc = await App.userDocRef.get(); const d = userDoc.data();
    const xp = (d.totalXP || 0) + 10, level = Math.floor(xp / 100) + 1;
    const newCoins = (d.mintCoins || 0) + 1;
    let newTokens = d.mintTokens || 0;
    if (streak % 7 === 0) newTokens++;
    const badges = d.badges || [];
    if (streak === 7 && !badges.includes('7-day')) badges.push('7-day');
    if (streak === 30 && !badges.includes('30-day')) badges.push('30-day');
    if (level > (d.level || 1)) badges.push(`level-${level}`);
    await App.userDocRef.update({ totalXP: xp, level, badges, mintCoins: newCoins, mintTokens: newTokens, identity: getIdentity(xp) });
    await db.collection('leaderboard').doc(App.currentUser.uid).set({ username: d.username, xp }, { merge: true });

    if (h.category && typeof AvatarSystem !== 'undefined') {
      AvatarSystem.incrementStat(h.category);
      if (AvatarSystem.celebrate) AvatarSystem.celebrate();
    }
    // track combination
    const now = Date.now();
    if (this.lastCompletedHabitId && this.lastCompletedHabitTime && (now - this.lastCompletedHabitTime) < 600000) {
      const pairKey = `${this.lastCompletedHabitId}_${habitId}`;
      await App.userDocRef.collection('combinations').doc(pairKey).set({
        count: firebase.firestore.FieldValue.increment(1), lastUpdated: now
      }, { merge: true });
      const docSnap = await App.userDocRef.collection('combinations').doc(pairKey).get();
      const count = docSnap.exists ? docSnap.data().count : 0;
      if (count >= 3) {
        const habitInsight = document.getElementById('habitInsight');
        if (habitInsight) {
          habitInsight.style.display = 'block';
          const last = this.data.find(h => h.id === this.lastCompletedHabitId);
          const cur = this.data.find(h => h.id === habitId);
          habitInsight.innerHTML = `💡 ${last?.name || 'Habit'} makes you ${count * 20}% more likely to complete ${cur?.name || 'this habit'} right after!`;
        }
      }
    }
    this.lastCompletedHabitTime = now;
    this.lastCompletedHabitId = habitId;

    this.updateImpact();
    this.applyBossDamage();
    await this.load();
    this.renderDashboard();
    document.getElementById('mintCoins').textContent = newCoins;
    document.getElementById('mintTokens').textContent = newTokens;
    const updatedDoc = await App.userDocRef.get();
    if (typeof AvatarSystem !== 'undefined') AvatarSystem.updateShowcase(updatedDoc.data());
  },

  openEditHabit(id) {
    const h = this.data.find(x => x.id === id);
    if (!h) return;
    this.editingId = id;
    document.getElementById('habitModalTitle').textContent = 'Edit Habit';
    document.getElementById('habitName').value = h.name;
    document.getElementById('habitCategory').value = h.category || 'health';
    document.getElementById('habitRepeat').value = h.repeat || 'daily';
    document.getElementById('reminderTimes').value = (h.reminderTimes || []).join(',');
    document.getElementById('habitEmoji').value = h.emoji || '';
    document.getElementById('habitNotes').value = h.notes || '';
    document.getElementById('habitRoutine').value = h.routine || 'morning';
    document.getElementById('habitChapter').value = h.chapterId || '';
    const customDaysContainer = document.getElementById('customDaysContainer');
    if (h.repeat === 'custom') {
      customDaysContainer.style.display = 'flex';
      document.querySelectorAll('#customDaysContainer input').forEach(cb => {
        if (cb && h.repeatDays) cb.checked = h.repeatDays.includes(parseInt(cb.value));
      });
    } else {
      customDaysContainer.style.display = 'none';
    }
    this.populateChapterOptions();
    document.getElementById('habitModal').classList.add('active');
  },

  async populateChapterFilter() {
    const chapterFilter = document.getElementById('chapterFilter');
    if (!chapterFilter || !App.userDocRef) return;
    const snap = await App.userDocRef.collection('chapters').get();
    const chapters = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
    chapterFilter.innerHTML = '<option value="">All Chapters</option>' + chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    chapterFilter.value = chapterFilter.dataset.current || '';
    chapterFilter.onchange = () => { chapterFilter.dataset.current = chapterFilter.value; this.renderDashboard(); };
  },
  async populateChapterOptions() {
    const habitChapter = document.getElementById('habitChapter');
    if (!habitChapter || !App.userDocRef) return;
    const snap = await App.userDocRef.collection('chapters').get();
    const chapters = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
    habitChapter.innerHTML = '<option value="">No Chapter</option>' + chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  },

  renderDNA() {
    const dnaBars = document.getElementById('dnaBars');
    if (!dnaBars) return;
    const cats = { Health: 0, Learning: 0, Productivity: 0, Creativity: 0 };
    this.data.forEach(h => { if (h.category) { const key = h.category.charAt(0).toUpperCase() + h.category.slice(1); cats[key]++; } });
    const total = this.data.length || 1;
    dnaBars.innerHTML = Object.entries(cats).map(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      return `<div><strong>${name}</strong> ${pct}% <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
    }).join('');
  },
  async renderMessages() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList || !App.userDocRef) return;
    const snap = await App.userDocRef.collection('messages').get();
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const today = new Date();
    messagesList.innerHTML = msgs.map(m => {
      const locked = this.checkLocked(m, today);
      return `<div class="card"><p>${locked ? '🔒 Locked' : '✉️ ' + m.content}</p><small>${m.condition}</small></div>`;
    }).join('');
  },
  checkLocked(msg, today) {
    if (msg.condition === '30days') {
      const created = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
      return (today - created) < 30 * 86400000;
    } else if (msg.condition === 'streak100') {
      return !this.data.some(h => h.streak >= 100);
    } else if (msg.condition === 'level5') {
      return Math.floor(((App.userDocRef?.get().data().totalXP) || 0) / 100) + 1 < 5;
    }
    return true;
  },
  async renderBosses() {
    const activeBosses = document.getElementById('activeBosses');
    if (!activeBosses || !App.userDocRef) return;
    const snap = await App.userDocRef.collection('bosses').get();
    const bosses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    activeBosses.innerHTML = bosses.map(b => {
      const progress = b.totalDays ? ((b.daysCompleted || 0) / b.totalDays) * 100 : 0;
      return `<div class="card"><strong>⚔️ ${b.name}</strong> (${b.daysCompleted || 0}/${b.totalDays} days)<div class="boss-bar"><div class="boss-fill" style="width:${progress}%"></div></div></div>`;
    }).join('') || '<p>No active battles.</p>';
  },
  async renderChapters() {
    const chaptersList = document.getElementById('chaptersList');
    if (!chaptersList || !App.userDocRef) return;
    const snap = await App.userDocRef.collection('chapters').get();
    const chapters = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
    chaptersList.innerHTML = chapters.map(c => `<div class="card"><strong>📖 ${c.name}</strong></div>`).join('');
  },
  async updateImpact() {
    const impactStats = document.getElementById('impactStats');
    if (!impactStats || !App.userDocRef) return;
    const doc = await App.userDocRef.get();
    const cause = doc.data()?.settings?.cause || 'education';
    let stats = '';
    if (cause === 'education') stats = `📚 ${this.data.filter(h => h.category === 'learning').reduce((s, h) => s + (h.streak || 0) * 30, 0)} minutes of study this year.`;
    else if (cause === 'environment') stats = `🌍 ${this.data.filter(h => h.category === 'health').length * 5} kg of CO₂ saved.`;
    else if (cause === 'health') stats = `❤️ Improved fitness age by ${this.data.filter(h => h.category === 'health').length} years.`;
    impactStats.innerHTML = stats;
  },
  async loadAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    if (!achievementsList || !App.userDocRef) return;
    const doc = await App.userDocRef.get();
    const badges = doc.data()?.badges || [];
    achievementsList.innerHTML = badges.length ? badges.map(b => `<p>🏅 ${b.replace(/-/g, ' ')}</p>`).join('') : '<p>No achievements yet.</p>';
  },
  async loadLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
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
  },
  async applyBossDamage() {
    if (!App.userDocRef) return;
    const snap = await App.userDocRef.collection('bosses').where('active', '==', true).get();
    snap.forEach(async doc => {
      const boss = doc.data();
      await doc.ref.update({ daysCompleted: firebase.firestore.FieldValue.increment(1) });
      if (boss.daysCompleted + 1 >= boss.totalDays) {
        await doc.ref.update({ active: false });
        alert(`Boss "${boss.name}" defeated! 🎉`);
      }
    });
  }
};