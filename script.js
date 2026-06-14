// script.js
const App = {
  currentUser: null,
  userDocRef: null,
  habitsData: [],
  currentRoutine: 'morning',
  editingHabitId: null,
  lastCompletedHabitTime: null,
  lastCompletedHabitId: null,
  avatar: AvatarSystem
};

document.addEventListener('DOMContentLoaded', () => {
  // Grab all DOM elements and attach them to App (screens, buttons, modals, etc.)
  const $ = id => document.getElementById(id);
  App.loginScreen = $('loginScreen');
  App.registerScreen = $('registerScreen');
  App.mainAppScreen = $('mainAppScreen');
  App.avatarScreen = $('avatarScreen');
  App.bossScreen = $('bossScreen');
  App.achievementsScreen = $('achievementsScreen');
  App.settingsView = $('settingsView');
  App.dnaScreen = $('dnaScreen');
  App.messagesScreen = $('messagesScreen');
  App.chaptersScreen = $('chaptersScreen');
  App.impactScreen = $('impactScreen');
  App.leaderboardScreen = $('leaderboardScreen');
  App.shopModal = $('shopModal');
  // … (all the rest of elements, as before) …

  App.showScreen = function(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (screen) screen.classList.add('active');
  };

  // Init subsystems
  App.auth.init();          // auth.js
  App.buttons.init();       // buttons.js
  // Habits module doesn't need init – it exposes functions

  // Theme and other helpers can be attached directly
  App.applyTheme = function(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('goalMintTheme', theme);
  };
  App.applySavedTheme = () => App.applyTheme(localStorage.getItem('goalMintTheme') || 'midnight');
  App.requestNotificationPermission = () => { /* … */ };

  // Avatar element references for showcase
  App.avatar.elements = {
    avatarStrength: $('avatarStrength'),
    avatarKnowledge: $('avatarKnowledge'),
    avatarFocus: $('avatarFocus'),
    avatarCreativity: $('avatarCreativity'),
    avatarShowcaseName: $('avatarShowcaseName'),
    avatarLevel: $('avatarLevel'),
    avatarIcon: $('avatarIcon'),
    avatarLargeIcon: $('avatarLargeIcon'),
    avatarStageName: $('avatarStageName'),
    avatarScreenLevel: $('avatarScreenLevel'),
    avatarXP: $('avatarXP'),
    avatarLevelBar: $('avatarLevelBar'),
    avatarStatStrength: $('avatarStatStrength'),
    avatarStatKnowledge: $('avatarStatKnowledge'),
    avatarStatFocus: $('avatarStatFocus'),
    avatarStatCreativity: $('avatarStatCreativity'),
    cosmeticsShop: $('cosmeticsShop')
  };
});