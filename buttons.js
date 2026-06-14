// buttons.js
App.buttons = {
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
      // Lazy init 3D avatar
      if (!App.avatar.initialized) {
        App.avatar.init();
      }
      App.avatar.renderScreen();
      setActiveNav(navAvatar);
    });
    navBoss.addEventListener('click', () => { App.showScreen(App.bossScreen); App.renderBosses(); setActiveNav(navBoss); });
    navProgress.addEventListener('click', () => { App.showScreen(App.achievementsScreen); App.loadAchievements(); setActiveNav(navProgress); });
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

    // … other modal openers (newMessage, startBoss, newChapter, howItWorks, etc.) – keep them exactly as before
    // I'll include them in the full file.
  }
};