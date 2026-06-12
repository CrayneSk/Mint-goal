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

  // OTHER SCREENS
  const dnaBars = $('dnaBars'), messagesList = $('messagesList'), activeBosses = $('activeBosses');
  const chaptersList = $('chaptersList'), impactStats = $('impactStats'), achievementsList = $('achievementsList'), leaderboardList = $('leaderboardList');
  const parkCount = $('parkCount'), libraryCount = $('libraryCount'), officeCount = $('officeCount'), galleryCount = $('galleryCount');

  // NEW BOTTOM NAV (5 tabs + more menu)
  const navDashboard = $('navDashboard'), navCity = $('navCity'), navChallenges = $('navChallenges');
  const navProgress = $('navProgress'), navMore = $('navMore');
  const moreMenu = $('moreMenu');
  const moreDNA = $('moreDNA'), moreMessages = $('moreMessages'), moreBoss = $('moreBoss');
  const moreChapters = $('moreChapters'), moreImpact = $('moreImpact');
  const moreAchievements = $('moreAchievements'), moreLeaderboard = $('moreLeaderboard'), moreSettings = $('moreSettings');

  // 3D City
  let threeCity = null;

  class ThreeCity {
    constructor(container) {
      this.container = container;
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB);

      const aspect = container.clientWidth / container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
      this.camera.position.set(20, 15, 20);
      this.camera.lookAt(0, 0, 0);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(this.renderer.domElement);

      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.5;
      this.controls.target.set(0, 0, 0);

      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xffffff, 0.8);
      sun.position.set(50, 50, 50);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 100;
      sun.shadow.camera.left = -30;
      sun.shadow.camera.right = 30;
      sun.shadow.camera.top = 30;
      sun.shadow.camera.bottom = -30;
      this.scene.add(sun);

      const groundGeo = new THREE.PlaneGeometry(60, 60);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x7CB342, roughness: 0.8 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);

      const roadGeo = new THREE.PlaneGeometry(60, 3);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.9 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.01;
      road.receiveShadow = true;
      this.scene.add(road);

      for (let i = -25; i < 25; i += 3) {
        const lineGeo = new THREE.BoxGeometry(1, 0.05, 0.2);
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFC107 });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(i, 0.02, 0);
        line.receiveShadow = true;
        this.scene.add(line);
      }

      this.buildingGroups = [];
      this.animationId = null;
      this.animate();
    }

    updateFromData(city) {
      this.buildingGroups.forEach(group => this.scene.remove(group));
      this.buildingGroups = [];

      const types = {
        park: (x, z) => this.createPark(x, z),
        library: (x, z) => this.createLibrary(x, z),
        office: (x, z) => this.createOffice(x, z),
        gallery: (x, z) => this.createGallery(x, z)
      };

      Object.entries(city).forEach(([type, count]) => {
        for (let i = 0; i < count; i++) {
          const x = (Math.random() - 0.5) * 40;
          const z = (Math.random() - 0.5) * 40;
          if (types[type]) {
            const group = types[type](x, z);
            if (group) {
              this.scene.add(group);
              this.buildingGroups.push(group);
            }
          }
        }
      });
    }

    createPark(x, z) {
      const group = new THREE.Group();
      const grassGeo = new THREE.BoxGeometry(3, 0.2, 3);
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
      const grass = new THREE.Mesh(grassGeo, grassMat);
      grass.position.set(x, 0.1, z);
      grass.receiveShadow = true;
      grass.castShadow = true;
      group.add(grass);

      for (let i = 0; i < 2; i++) {
        const treeGroup = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        const leafPositions = [1.2, 1.6, 2.0];
        leafPositions.forEach((y, idx) => {
          const leafGeo = new THREE.ConeGeometry(0.6 - idx * 0.1, 0.6, 8);
          const leafMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32 });
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.y = y;
          leaf.castShadow = true;
          leaf.receiveShadow = true;
          treeGroup.add(leaf);
        });

        treeGroup.position.set(x - 0.8 + i * 1.6, 0.1, z - 0.8 + i * 1.6);
        group.add(treeGroup);
      }
      return group;
    }

    createLibrary(x, z) {
      const group = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(3, 3, 2.5);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.6 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(x, 1.5, z);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const roofGeo = new THREE.ConeGeometry(2.5, 1.2, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(x, 3.6, z);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      roof.receiveShadow = true;
      group.add(roof);

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const winGeo = new THREE.BoxGeometry(0.4, 0.6, 0.1);
          const winMat = new THREE.MeshStandardMaterial({ color: 0xFFE082, emissive: 0xFFD54F, emissiveIntensity: 0.5 });
          const win = new THREE.Mesh(winGeo, winMat);
          win.position.set(x - 1 + col * 1, 1.5 + row * 1.2, z + 1.26);
          win.castShadow = true;
          group.add(win);
        }
      }
      return group;
    }

    createOffice(x, z) {
      const group = new THREE.Group();
      const height = 5 + Math.random() * 3;
      const bodyGeo = new THREE.BoxGeometry(2.5, height, 2.5);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x607D8B, roughness: 0.4, metalness: 0.7 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(x, height / 2, z);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const floors = Math.floor(height / 1.2);
      for (let f = 0; f < floors; f++) {
        for (let side = 0; side < 4; side++) {
          const winGeo = new THREE.BoxGeometry(0.5, 0.8, 0.05);
          const winMat = new THREE.MeshStandardMaterial({ color: 0xFFE082, emissive: 0xFFC107, emissiveIntensity: 0.4 });
          const win = new THREE.Mesh(winGeo, winMat);
          const angle = (side * Math.PI) / 2;
          win.position.set(
            x + Math.sin(angle) * 1.26,
            0.8 + f * 1.2,
            z + Math.cos(angle) * 1.26
          );
          win.rotation.y = angle;
          win.castShadow = true;
          group.add(win);
        }
      }
      return group;
    }

    createGallery(x, z) {
      const group = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(3.5, 2.5, 3);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xE91E63, roughness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(x, 1.25, z);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const domeGeo = new THREE.SphereGeometry(2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xAD1457, roughness: 0.3 });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.set(x, 2.5, z);
      dome.castShadow = true;
      dome.receiveShadow = true;
      group.add(dome);

      for (let i = 0; i < 4; i++) {
        const winGeo = new THREE.BoxGeometry(0.6, 0.8, 0.1);
        const winMat = new THREE.MeshStandardMaterial({ color: 0xFFE082, emissive: 0xFFD54F, emissiveIntensity: 0.5 });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(x - 1.2 + i * 0.8, 1.5, z + 1.51);
        group.add(win);
      }
      return group;
    }

    animate() {
      this.animationId = requestAnimationFrame(() => this.animate());
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    }

    destroy() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
  }

  async function renderCity() {
    const container = document.getElementById('three-container');
    if (!container || !userDocRef) return;

    if (!threeCity) {
      threeCity = new ThreeCity(container);
      window.addEventListener('resize', () => {
        if (!threeCity || !threeCity.camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        threeCity.camera.aspect = w / h;
        threeCity.camera.updateProjectionMatrix();
        threeCity.renderer.setSize(w, h);
      });
    }

    const doc = await userDocRef.get();
    const city = doc.data()?.cityBuildings || { park: 0, library: 0, office: 0, gallery: 0 };

    if (parkCount) parkCount.textContent = city.park || 0;
    if (libraryCount) libraryCount.textContent = city.library || 0;
    if (officeCount) officeCount.textContent = city.office || 0;
    if (galleryCount) galleryCount.textContent = city.gallery || 0;

    threeCity.updateFromData(city);
  }

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
        cityBuildings: { park: 0, library: 0, office: 0, gallery: 0 },
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

  // --- HABITS ---
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

    // Update daily goal bar
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

  // Habit form
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

  // ========== NEW 5-TAB NAVIGATION ==========
  function setActiveNav(btn) {
    [navDashboard, navCity, navChallenges, navProgress, navMore].forEach(b => b?.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  // Main tab navigation
  if (navDashboard) navDashboard.addEventListener('click', () => { showScreen(mainAppScreen); setActiveNav(navDashboard); });
  if (navCity) navCity.addEventListener('click', () => { showScreen(cityScreen); renderCity(); setActiveNav(navCity); });
  if (navChallenges) navChallenges.addEventListener('click', () => { showScreen(bossScreen); renderBosses(); setActiveNav(navChallenges); });
  if (navProgress) navProgress.addEventListener('click', () => { showScreen(achievementsScreen); loadAchievements(); setActiveNav(navProgress); });
  if (navMore) navMore.addEventListener('click', () => {
    if (moreMenu) {
      moreMenu.style.display = moreMenu.style.display === 'flex' ? 'none' : 'flex';
    }
    setActiveNav(navMore);
  });

  // More menu items
  if (moreDNA) moreDNA.addEventListener('click', () => { showScreen(dnaScreen); renderDNA(); moreMenu.style.display = 'none'; });
  if (moreMessages) moreMessages.addEventListener('click', () => { showScreen(messagesScreen); renderMessages(); moreMenu.style.display = 'none'; });
  if (moreBoss) moreBoss.addEventListener('click', () => { showScreen(bossScreen); renderBosses(); moreMenu.style.display = 'none'; });
  if (moreChapters) moreChapters.addEventListener('click', () => { showScreen(chaptersScreen); renderChapters(); moreMenu.style.display = 'none'; });
  if (moreImpact) moreImpact.addEventListener('click', () => { showScreen(impactScreen); updateImpact(); moreMenu.style.display = 'none'; });
  if (moreAchievements) moreAchievements.addEventListener('click', () => { showScreen(achievementsScreen); loadAchievements(); moreMenu.style.display = 'none'; });
  if (moreLeaderboard) moreLeaderboard.addEventListener('click', () => { showScreen(leaderboardScreen); loadLeaderboard(); moreMenu.style.display = 'none'; });
  if (moreSettings) moreSettings.addEventListener('click', () => { showScreen(settingsView); moreMenu.style.display = 'none'; });

  // Close more menu when clicking outside
  window.addEventListener('click', e => {
    if (moreMenu && !moreMenu.contains(e.target) && e.target !== navMore) {
      moreMenu.style.display = 'none';
    }
  });

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