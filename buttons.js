// buttons.js
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
        // Lazy init 3D avatar
        AvatarSystem.init({
          avatarStrength: $('avatarStrength'), avatarKnowledge: $('avatarKnowledge'), avatarFocus: $('avatarFocus'), avatarCreativity: $('avatarCreativity'),
          avatarShowcaseName: $('avatarShowcaseName'), avatarLevel: $('avatarLevel'), avatarIcon: $('avatarIcon'),
          avatarLargeIcon: $('avatarLargeIcon'), avatarStageName: $('avatarStageName'), avatarScreenLevel: $('avatarScreenLevel'), avatarXP: $('avatarXP'), avatarLevelBar: $('avatarLevelBar'),
          avatarStatStrength: $('avatarStatStrength'), avatarStatKnowledge: $('avatarStatKnowledge'), avatarStatFocus: $('avatarStatFocus'), avatarStatCreativity: $('avatarStatCreativity'),
          cosmeticsShop: $('cosmeticsShop')
        });
      }
      AvatarSystem.renderScreen();
      setActiveNav(navAvatar);
    });
    navBoss.addEventListener('click', () => { App.showScreen(App.bossScreen); Habits.renderBosses(); setActiveNav(navBoss); });
    navProgress.addEventListener('click', () => { App.showScreen(App.achievementsScreen); Habits.loadAchievements(); setActiveNav(navProgress); });
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

    // Other modal openers (newMessage, startBoss, newChapter, howItWorks, etc.) – identical to before
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
    $('addHabitFAB')?.addEventListener('click', () => { /* same as old openEditHabit(null) */ });

    // Habit save button
    $('saveHabitBtn')?.addEventListener('click', async () => { /* old saveHabit logic */ });

    // Message save button
    $('saveMessageBtn')?.addEventListener('click', async () => { /* … */ });

    // Start boss challenge
    $('startBossChallengeBtn')?.addEventListener('click', async () => { /* … */ });

    // Chapter save
    $('saveChapterBtn')?.addEventListener('click', async () => { /* … */ });
  }
};