// script.js
const App = {
  currentUser: null,
  userDocRef: null,
  habits: Habits,       // reference to the Habits object
  mainAppScreen: null,
  avatarScreen: null,
  bossScreen: null,
  achievementsScreen: null,
  settingsView: null,
  dnaScreen: null,
  messagesScreen: null,
  chaptersScreen: null,
  impactScreen: null,
  leaderboardScreen: null,
  shopModal: null,
  // ... other screens

  showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (screen) screen.classList.add('active');
  },

  async loadUserData() {
    if (!this.userDocRef) return;
    const doc = await this.userDocRef.get();
    if (!doc.exists) return;
    const d = doc.data();
    document.getElementById('userGreeting').textContent = `👋 ${d.username || 'User'}`;
    const xp = d.totalXP || 0;
    document.getElementById('userXP').textContent = xp;
    document.getElementById('mintCoins').textContent = d.mintCoins || 0;
    document.getElementById('mintTokens').textContent = d.mintTokens || 0;
    document.getElementById('trackingMode').value = d.settings?.trackingMode || 'normal';
    document.getElementById('causeSelect').value = d.settings?.cause || 'education';
    const theme = d.settings?.theme || 'midnight';
    this.applyTheme(theme);
    document.getElementById('currentThemeName').textContent = getThemeDisplayName(theme);
    document.getElementById('myReferralCode').textContent = d.referralCode || '';
    // mentor message
    const msgs = ["You're on fire! Keep that streak going.", "Consistency beats intensity. Small wins daily."];
    const mentorEl = document.getElementById('mentorMessage');
    if (mentorEl) mentorEl.textContent = `🤖 ${msgs[Math.floor(Math.random() * msgs.length)]}`;
    if (typeof AvatarSystem !== 'undefined') AvatarSystem.updateShowcase(d);
  },

  applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('goalMintTheme', theme);
  },
  applySavedTheme() {
    this.applyTheme(localStorage.getItem('goalMintTheme') || 'midnight');
  },
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  },

  renderShop() {
    // copy the full renderShop function from your old script.js
    // (the one that includes shopCosmetics section)
    // I'll place a compact version here; you already have the complete code.
    // For brevity, I'm omitting the long body but it must be included exactly as before.
    // Actually, to keep it complete, I'll include it below.
    // The function should be identical to the original renderShop.
    // ... (full renderShop code here)
    // Because of space, I'll indicate it's pasted from the original.
  },

  showReplay() {
    // copy showReplay from old script.js
  }
};

// ========== RENDER SHOP (FULL) ==========
App.renderShop = async function() {
  if (!document.getElementById('shopItems') || !App.userDocRef) return;
  try {
    const userDoc = await App.userDocRef.get();
    if (!userDoc.exists) return;
    const coins = userDoc.data().mintCoins || 0;
    const xp = userDoc.data().totalXP || 0;
    const ownedThemes = userDoc.data().ownedThemes || [];
    const currentTheme = userDoc.data().settings?.theme || 'midnight';
    const ownedCosmetics = userDoc.data().ownedCosmetics || [];

    document.getElementById('shopCoinBalance').textContent = coins;
    document.getElementById('shopXPDisplay').textContent = xp;

    // XP packs
    const xpPacksDiv = document.getElementById('xpPacks');
    if (xpPacksDiv) {
      xpPacksDiv.innerHTML = xpPacksList.map(p => `
        <div class="shop-item">
          <div class="shop-item-info"><span>💎 ${p.amount} XP</span></div>
          <button class="btn btn-small buy-xp-btn" data-amount="${p.amount}" data-cost="${p.cost}" ${coins < p.cost ? 'disabled' : ''}>Buy ${p.cost} 🪙</button>
        </div>
      `).join('');
      document.querySelectorAll('.buy-xp-btn').forEach(b => {
        b.addEventListener('click', async e => {
          const cost = parseInt(e.target.dataset.cost);
          const amount = parseInt(e.target.dataset.amount);
          const doc = await App.userDocRef.get();
          if ((doc.data().mintCoins || 0) < cost) return alert('Not enough coins');
          await App.userDocRef.update({
            mintCoins: firebase.firestore.FieldValue.increment(-cost),
            totalXP: firebase.firestore.FieldValue.increment(amount)
          });
          const updated = await App.userDocRef.get();
          document.getElementById('mintCoins').textContent = updated.data().mintCoins;
          document.getElementById('userXP').textContent = updated.data().totalXP;
          App.renderShop();
        });
      });
    }

    // Themes
    const shopItemsDiv = document.getElementById('shopItems');
    shopItemsDiv.innerHTML = shopThemes.map(theme => {
      const isOwned = ownedThemes.includes(theme.id);
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
        const doc = await App.userDocRef.get();
        if ((doc.data().mintCoins || 0) < cost) return alert('Not enough Mint Coins');
        const currentOwned = doc.data().ownedThemes || [];
        if (currentOwned.includes(themeId)) return;
        currentOwned.push(themeId);
        await App.userDocRef.update({ mintCoins: firebase.firestore.FieldValue.increment(-cost), ownedThemes: currentOwned });
        const updated = await App.userDocRef.get();
        document.getElementById('mintCoins').textContent = updated.data().mintCoins;
        App.renderShop();
        alert('Theme purchased! Apply it now.');
      });
    });
    document.querySelectorAll('.apply-theme-btn').forEach(b => {
      b.addEventListener('click', async e => {
        const themeId = e.target.dataset.id;
        App.applyTheme(themeId);
        await App.userDocRef.update({ 'settings.theme': themeId });
        App.renderShop();
      });
    });

    // Cosmetics section
    const shopCosmeticsDiv = document.getElementById('shopCosmetics');
    if (shopCosmeticsDiv) {
      let cosHtml = '';
      cosmeticsList.forEach(item => {
        const isOwned = ownedCosmetics.includes(item.id);
        cosHtml += `<div class="shop-item">
          <div class="shop-item-info"><span>${item.name}</span></div>
          <button class="btn btn-small buy-cosmetic-btn" data-id="${item.id}" data-cost="${item.cost}" ${isOwned || coins < item.cost ? 'disabled' : ''}>${isOwned ? 'Owned' : `Buy ${item.cost} 🪙`}</button>
        </div>`;
      });
      shopCosmeticsDiv.innerHTML = cosHtml;
      shopCosmeticsDiv.querySelectorAll('.buy-cosmetic-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const cost = parseInt(e.target.dataset.cost);
          const doc = await App.userDocRef.get();
          const currentCoins = doc.data().mintCoins || 0;
          if (currentCoins < cost) return alert('Not enough coins');
          const currOwned = doc.data().ownedCosmetics || [];
          if (currOwned.includes(id)) return;
          currOwned.push(id);
          await App.userDocRef.update({
            mintCoins: firebase.firestore.FieldValue.increment(-cost),
            ownedCosmetics: currOwned
          });
          App.renderShop();
        });
      });
    }
  } catch (err) {
    console.error('Shop error:', err);
  }
};

App.showReplay = function() {
  const replayStats = document.getElementById('replayStats');
  const replayModal = document.getElementById('replayModal');
  if (!replayStats || !replayModal) return;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const completions = App.habits.data.filter(h => h.lastCompletedDate >= monthStart).length;
  replayStats.innerHTML = `🎉 This month: ${completions} habits completed!`;
  replayModal.classList.add('active');
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  // Grab all DOM elements and assign to App
  App.loginScreen = document.getElementById('loginScreen');
  App.registerScreen = document.getElementById('registerScreen');
  App.mainAppScreen = document.getElementById('mainAppScreen');
  App.avatarScreen = document.getElementById('avatarScreen');
  App.bossScreen = document.getElementById('bossScreen');
  App.achievementsScreen = document.getElementById('achievementsScreen');
  App.settingsView = document.getElementById('settingsView');
  App.dnaScreen = document.getElementById('dnaScreen');
  App.messagesScreen = document.getElementById('messagesScreen');
  App.chaptersScreen = document.getElementById('chaptersScreen');
  App.impactScreen = document.getElementById('impactScreen');
  App.leaderboardScreen = document.getElementById('leaderboardScreen');
  App.shopModal = document.getElementById('shopModal');
  // ... (other necessary elements can be added)

  // Expose for avatar
  window.mintCoinsEl = document.getElementById('mintCoins');

  // Initialize modules
  Auth.init();
  Buttons.init();

  // Notification interval
  setInterval(() => {
    if (!App.currentUser || !App.habits.data.length) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    App.habits.data.forEach(h => {
      const times = h.reminderTimes || [h.time];
      if (times.includes(timeStr) && habitScheduledToday(h) && !isToday(h.lastCompletedDate) && Notification.permission === 'granted') {
        new Notification(`⏰ ${h.name}`, { body: 'Time to complete your habit!' });
      }
    });
  }, 60000);
});