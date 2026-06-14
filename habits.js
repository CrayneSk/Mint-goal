// habits.js
const Habits = {
  data: [],
  currentRoutine: 'morning',
  editingId: null,
  lastCompletedHabitTime: null,
  lastCompletedHabitId: null,

  async load() {
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
      await Habits.completeHabit(e.currentTarget.dataset.id);
    }));
    document.querySelectorAll('.save-streak-btn').forEach(b => b.addEventListener('click', async e => {
      await Habits.saveStreakForYesterday(e.currentTarget.dataset.id);
    }));
    document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', e => Habits.openEditHabit(e.currentTarget.dataset.id)));

    Habits.populateChapterFilter();

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

    if (h.category) {
      AvatarSystem.incrementStat(h.category);
      AvatarSystem.celebrate();
    }
    // … (rest of completeHabit unchanged, plus refresh showcase)
    await this.load();
    this.renderDashboard();
    document.getElementById('mintCoins').textContent = newCoins;
    document.getElementById('mintTokens').textContent = newTokens;
    const updatedDoc = await App.userDocRef.get();
    AvatarSystem.updateShowcase(updatedDoc.data());
  },

  openEditHabit(id) { /* … */ },
  populateChapterFilter() { /* … */ },
  populateChapterOptions() { /* … */ },
  renderDNA() { /* … */ },
  renderMessages() { /* … */ },
  renderBosses() { /* … */ },
  renderChapters() { /* … */ },
  updateImpact() { /* … */ },
  loadAchievements() { /* … */ },
  loadLeaderboard() { /* … */ },
  applyBossDamage() { /* … */ }
};