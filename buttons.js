// buttons.js – FULL VERSION
const Buttons = {
  init() {
    const $ = id => document.getElementById(id);

    // Navigation
    const navDashboard = $('navDashboard'), navAvatar = $('navAvatar'), navBoss = $('navBoss'), navProgress = $('navProgress'), navSettings = $('navSettings');
    const setActiveNav = (btn) => {
      [navDashboard, navAvatar, navBoss, navProgress, navSettings].forEach(b => b?.classList.remove('active'));
      if (btn) btn.classList.add('active');
    };

    navDashboard.addEventListener('click', () => { App.showScreen(App.mainAppScreen); setActiveNav(navDashboard); });
    navAvatar.addEventListener('click', () => {
      App.showScreen(App.avatarScreen);
      if (!AvatarSystem.scene) {
        AvatarSystem.init({
          avatarStrength: $('avatarStrength'), avatarKnowledge: $('avatarKnowledge'), avatarFocus: $('avatarFocus'), avatarCreativity: $('avatarCreativity'),
          avatarShowcaseName: $('avatarShowcaseName'), avatarLevel: $('avatarLevel'), avatarIcon: $('avatarIcon'),
          avatarStageName: $('avatarStageName'), avatarScreenLevel: $('avatarScreenLevel'), avatarXP: $('avatarXP'), avatarLevelBar: $('avatarLevelBar'),
          avatarStatStrength: $('avatarStatStrength'), avatarStatKnowledge: $('avatarStatKnowledge'), avatarStatFocus: $('avatarStatFocus'), avatarStatCreativity: $('avatarStatCreativity'),
          cosmeticsShop: $('cosmeticsShop')
        });
      }
      AvatarSystem.renderScreen();
      setActiveNav(navAvatar);
    });
    navBoss.addEventListener('click', () => { App.showScreen(App.bossScreen); App.habits.renderBosses(); setActiveNav(navBoss); });
    navProgress.addEventListener('click', () => { App.showScreen(App.achievementsScreen); App.habits.loadAchievements(); setActiveNav(navProgress); });
    navSettings.addEventListener('click', () => { App.showScreen(App.settingsView); setActiveNav(navSettings); });

    // Back buttons
    ['backFromAvatar','backFromBoss','backFromAchievements','backFromDNA','backFromMessages','backFromChapters','backFromImpact','backFromLeaderboard'].forEach(id => {
      const btn = $(id);
      if (btn) btn.addEventListener('click', () => App.showScreen(App.mainAppScreen));
    });
    const backFromSettings = $('backFromSettings');
    if (backFromSettings) backFromSettings.addEventListener('click', () => App.showScreen(App.mainAppScreen));

    // Settings quick links
    $('openDNABtn')?.addEventListener('click', () => App.showScreen(App.dnaScreen));
    $('openMessagesBtn')?.addEventListener('click', () => App.showScreen(App.messagesScreen));
    $('openChaptersBtn')?.addEventListener('click', () => App.showScreen(App.chaptersScreen));
    $('openImpactBtn')?.addEventListener('click', () => App.showScreen(App.impactScreen));
    $('openLeaderboardBtn')?.addEventListener('click', () => App.showScreen(App.leaderboardScreen));

    // Shop buttons
    $('openShopBtn')?.addEventListener('click', () => { App.shopModal.classList.add('active'); App.renderShop(); });
    $('openShopFromSettings')?.addEventListener('click', () => { App.shopModal.classList.add('active'); App.renderShop(); });

    // Other modal openers
    $('newMessageBtn')?.addEventListener('click', () => document.getElementById('messageModal')?.classList.add('active'));
    $('startBossBtn')?.addEventListener('click', () => document.getElementById('bossModal')?.classList.add('active'));
    $('newChapterBtn')?.addEventListener('click', () => document.getElementById('chapterModal')?.classList.add('active'));
    $('howItWorksBtn')?.addEventListener('click', () => document.getElementById('howItWorksModal')?.classList.add('active'));
    $('progressReplayBtn')?.addEventListener('click', () => App.showReplay());
    $('showPrivacyBtn')?.addEventListener('click', () => document.getElementById('privacyModal')?.classList.add('active'));
    $('showFaqBtn')?.addEventListener('click', () => document.getElementById('faqModal')?.classList.add('active'));

    // Close modals
    document.querySelectorAll('.close-modal').forEach(b => {
      b.addEventListener('click', () => {
        const modal = document.getElementById(b.dataset.modal);
        if (modal) modal.classList.remove('active');
      });
    });
    window.addEventListener('click', e => { if (e.target.classList.contains('modal')) e.target.classList.remove('active'); });

    // Delete account
    $('deleteAccountBtn')?.addEventListener('click', async () => {
      if (confirm('Delete account and all data?')) {
        await App.userDocRef.delete();
        await db.collection('leaderboard').doc(App.currentUser.uid).delete();
        await App.currentUser.delete();
      }
    });

    // Add habit FAB
    $('addHabitFAB')?.addEventListener('click', () => {
      App.habits.editingId = null;
      document.getElementById('habitModalTitle').textContent = 'New Habit';
      document.getElementById('habitName').value = '';
      document.getElementById('habitCategory').value = 'health';
      document.getElementById('habitRepeat').value = 'daily';
      document.getElementById('reminderTimes').value = '';
      document.getElementById('habitEmoji').value = '';
      document.getElementById('habitNotes').value = '';
      document.getElementById('habitRoutine').value = 'morning';
      document.getElementById('habitChapter').value = '';
      document.getElementById('customDaysContainer').style.display = 'none';
      App.habits.populateChapterOptions();
      document.getElementById('habitModal').classList.add('active');
    });

    // Habit repeat dropdown
    $('habitRepeat')?.addEventListener('change', function() {
      document.getElementById('customDaysContainer').style.display = this.value === 'custom' ? 'flex' : 'none';
    });

    // Save habit
    $('saveHabitBtn')?.addEventListener('click', async () => {
      const name = document.getElementById('habitName')?.value?.trim();
      if (!name) return alert('Name required');
      const repeat = document.getElementById('habitRepeat')?.value || 'daily';
      let repeatDays = [];
      if (repeat === 'custom') repeatDays = Array.from(document.querySelectorAll('#customDaysContainer input:checked')).map(cb => parseInt(cb.value));
      const data = {
        name, category: document.getElementById('habitCategory')?.value || 'health', repeat, repeatDays,
        time: document.getElementById('reminderTimes')?.value?.split(',')[0]?.trim() || '08:00',
        reminderTimes: document.getElementById('reminderTimes')?.value?.split(',').map(s => s.trim()).filter(Boolean) || [],
        emoji: document.getElementById('habitEmoji')?.value || '✅', notes: document.getElementById('habitNotes')?.value || '',
        routine: document.getElementById('habitRoutine')?.value || 'morning', chapterId: document.getElementById('habitChapter')?.value || null,
        streak: App.habits.editingId ? (App.habits.data.find(h => h.id === App.habits.editingId)?.streak || 0) : 0,
        lastCompletedDate: App.habits.editingId ? (App.habits.data.find(h => h.id === App.habits.editingId)?.lastCompletedDate || null) : null
      };
      if (App.habits.editingId) await App.userDocRef.collection('habits').doc(App.habits.editingId).update(data);
      else await App.userDocRef.collection('habits').add(data);
      document.getElementById('habitModal').classList.remove('active');
      await App.habits.load();
      App.habits.renderDashboard();
    });

    // Save message
    $('saveMessageBtn')?.addEventListener('click', async () => {
      const content = document.getElementById('messageContent')?.value?.trim();
      if (!content) return;
      const condition = document.getElementById('unlockCondition')?.value || '30days';
      await App.userDocRef.collection('messages').add({ content, condition, createdAt: new Date().toISOString() });
      document.getElementById('messageModal')?.classList.remove('active');
      App.habits.renderMessages();
    });

    // Start boss challenge
    $('startBossChallengeBtn')?.addEventListener('click', async () => {
      const name = document.getElementById('bossName')?.value?.trim();
      const days = parseInt(document.getElementById('bossDays')?.value);
      if (!name || !days) return alert('Fill all fields');
      await App.userDocRef.collection('bosses').add({ name, totalDays: days, daysCompleted: 0, active: true });
      document.getElementById('bossModal')?.classList.remove('active');
      App.habits.renderBosses();
    });

    // Save chapter
    $('saveChapterBtn')?.addEventListener('click', async () => {
      const name = document.getElementById('chapterName')?.value?.trim();
      if (!name) return;
      await App.userDocRef.collection('chapters').add({ name });
      document.getElementById('chapterModal')?.classList.remove('active');
      App.habits.renderChapters();
      App.habits.populateChapterFilter();
    });

    // Copy referral code
    $('copyReferralBtn')?.addEventListener('click', async () => {
      const code = document.getElementById('myReferralCode')?.textContent;
      if (code && code !== 'Loading...') {
        await navigator.clipboard.writeText(code);
        alert('Referral code copied!');
      }
    });

    // Share progress
    $('shareProgressBtn')?.addEventListener('click', async () => {
      const doc = await App.userDocRef.get();
      const d = doc.data();
      const text = `I'm ${getIdentity(d.totalXP || 0)} on GoaLMint! 🚀`;
      if (navigator.share) navigator.share({ title: 'GoaLMint', text });
      else alert('Copy: ' + text);
    });
  }
};