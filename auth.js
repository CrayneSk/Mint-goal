// auth.js
App.auth = {
  init() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutMainBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');

    // --- Auth state listener ---
    auth.onAuthStateChanged(async user => {
      App.currentUser = user;
      if (user) {
        App.userDocRef = db.collection('users').doc(user.uid);
        window.userDocRef = App.userDocRef;   // expose globally for avatar
        await App.loadUserData();
        App.showScreen(App.mainAppScreen);
        await App.habits.load();
        App.habits.renderDashboard();
        App.applySavedTheme();
        App.requestNotificationPermission();
      } else {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        App.showScreen(App.loginScreen);
      }
    });

    showRegisterBtn.addEventListener('click', () => App.showScreen(App.registerScreen));
    backToLoginBtn.addEventListener('click', () => App.showScreen(App.loginScreen));

    loginBtn.addEventListener('click', async () => {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      if (!email || !password) { alert('Enter email and password.'); return; }
      try { await auth.signInWithEmailAndPassword(email, password); } catch (e) { alert('Login failed: ' + e.message); }
    });

    registerBtn.addEventListener('click', async () => {
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const username = document.getElementById('regUsername').value.trim() || 'User';
      if (!email || !password) { alert('Email and password required.'); return; }
      try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        const uid = cred.user.uid;
        const referralCode = App.generateReferralCode();
        const userData = {
          email, username, age: document.getElementById('regAge').value || '', weight: document.getElementById('regWeight').value || '',
          totalXP: 0, level: 1, badges: [],
          settings: { theme: 'midnight', trackingMode: 'normal', cause: 'education' },
          mintCoins: 500, mintTokens: 3,
          avatarStats: { strength: 0, knowledge: 0, focus: 0, creativity: 0 },
          ownedCosmetics: [], equippedCosmetics: {},
          identity: 'Beginner', ownedThemes: ['midnight'],
          referralCode
        };
        await db.collection('users').doc(uid).set(userData);
        App.userDocRef = db.collection('users').doc(uid);
        window.userDocRef = App.userDocRef;
        await db.collection('referralCodes').doc(referralCode).set({ userId: uid });
        await db.collection('leaderboard').doc(uid).set({ username, xp: 0 });

        const refCode = document.getElementById('referralCodeInput')?.value.trim() || '';
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

    if (logoutBtn) logoutBtn.addEventListener('click', () => auth.signOut());
  }
};