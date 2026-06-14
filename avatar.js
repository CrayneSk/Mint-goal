// avatar.js
const AvatarSystem = {
  elements: {},
  scene: null,
  camera: null,
  renderer: null,
  animationId: null,
  character: null,
  isCelebrating: false,

  init(els) {
    if (this.scene) return;
    this.elements = els;
    const container = document.getElementById('avatar3DContainer');
    if (!container) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 1.5, 4);
    this.camera.lookAt(0, 1, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 2, 2);
    this.scene.add(dirLight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3,3), new THREE.MeshStandardMaterial({color:0x222233}));
    floor.rotation.x = -Math.PI/2; floor.position.y = -1.2;
    this.scene.add(floor);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4,32,32), new THREE.MeshStandardMaterial({color:0xffaa00}));
    head.position.y = 1.2; this.scene.add(head);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.8,0.4), new THREE.MeshStandardMaterial({color:0x3399ff}));
    body.position.y = 0.5; this.scene.add(body);

    this.animate();
  },

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.renderer && this.scene && this.camera) this.renderer.render(this.scene, this.camera);
  },

  updateShowcase(data) {
    const els = this.elements;
    const stats = data.avatarStats || {strength:0,knowledge:0,focus:0,creativity:0};
    const xp = data.totalXP||0;
    const level = Math.floor(xp/100)+1;
    const stage = level>=50?'Legend':level>=35?'Master':level>=20?'Builder':level>=10?'Focused':level>=5?'Disciplined':'Beginner';
    if(els.avatarStrength) els.avatarStrength.textContent = stats.strength;
    if(els.avatarKnowledge) els.avatarKnowledge.textContent = stats.knowledge;
    if(els.avatarFocus) els.avatarFocus.textContent = stats.focus;
    if(els.avatarCreativity) els.avatarCreativity.textContent = stats.creativity;
    if(els.avatarShowcaseName) els.avatarShowcaseName.textContent = stage;
    if(els.avatarLevel) els.avatarLevel.textContent = level;
    if(els.avatarIcon) els.avatarIcon.innerHTML = this.getEmoji(stage);
  },
  getEmoji(s){ return {Beginner:'🙂',Disciplined:'😎',Focused:'🧐',Builder:'🦸',Master:'🧙',Legend:'👑'}[s]||'🙂'; },

  async renderScreen() {
    if(!window.userDocRef) return;
    const doc = await window.userDocRef.get();
    const data = doc.data()||{};
    const stats = data.avatarStats||{};
    const xp = data.totalXP||0;
    const level = Math.floor(xp/100)+1;
    const stage = level>=50?'Legend':level>=35?'Master':level>=20?'Builder':level>=10?'Focused':level>=5?'Disciplined':'Beginner';
    const equipped = data.equippedCosmetics||{};
    const els = this.elements;
    if(els.avatarStageName) els.avatarStageName.textContent = stage;
    if(els.avatarScreenLevel) els.avatarScreenLevel.textContent = level;
    if(els.avatarXP) els.avatarXP.textContent = `${xp%100} / 100`;
    if(els.avatarLevelBar) els.avatarLevelBar.style.width = `${(xp%100)}%`;
    if(els.avatarStatStrength) els.avatarStatStrength.textContent = stats.strength||0;
    if(els.avatarStatKnowledge) els.avatarStatKnowledge.textContent = stats.knowledge||0;
    if(els.avatarStatFocus) els.avatarStatFocus.textContent = stats.focus||0;
    if(els.avatarStatCreativity) els.avatarStatCreativity.textContent = stats.creativity||0;
    this.renderCosmeticsShop(data.ownedCosmetics||[], equipped);
  },

  renderCosmeticsShop(owned, equipped) {
    const shop = this.elements.cosmeticsShop;
    if(!shop || typeof cosmeticsList === 'undefined') return;
    let html = '';
    cosmeticsList.forEach(item => {
      const isOwned = owned.includes(item.id);
      const isEquipped = equipped[item.type] === item.id;
      html += `<div class="cosmetic-item"><span>${item.name}</span><div>${isOwned?`<button class="btn btn-small equip-btn" data-id="${item.id}" data-type="${item.type}" ${isEquipped?'disabled':''}>${isEquipped?'Equipped':'Wear'}</button>`:`<button class="btn btn-small buy-cosmetic-btn" data-id="${item.id}" data-cost="${item.cost}">Buy ${item.cost} 🪙</button>`}</div></div>`;
    });
    shop.innerHTML = html;
    shop.querySelectorAll('.equip-btn').forEach(btn => btn.addEventListener('click', async (e)=>{
      const id=e.target.dataset.id, type=e.target.dataset.type;
      const doc=await window.userDocRef.get();
      const currEquipped=doc.data().equippedCosmetics||{};
      currEquipped[type]=id;
      await window.userDocRef.update({equippedCosmetics:currEquipped});
      this.renderScreen();
    }));
    shop.querySelectorAll('.buy-cosmetic-btn').forEach(btn => btn.addEventListener('click', async (e)=>{
      const id=e.target.dataset.id, cost=parseInt(e.target.dataset.cost);
      const doc=await window.userDocRef.get();
      const coins=doc.data().mintCoins||0;
      if(coins<cost) return alert('Not enough coins');
      const currOwned=doc.data().ownedCosmetics||[];
      if(currOwned.includes(id)) return;
      currOwned.push(id);
      await window.userDocRef.update({mintCoins:firebase.firestore.FieldValue.increment(-cost), ownedCosmetics:currOwned});
      const updatedDoc=await window.userDocRef.get();
      if(window.mintCoinsEl) window.mintCoinsEl.textContent=updatedDoc.data().mintCoins;
      this.renderScreen();
    }));
  },

  incrementStat(category) {
    const statMap = {health:'strength', learning:'knowledge', productivity:'focus', creativity:'creativity'};
    const stat = statMap[category];
    if(stat && window.userDocRef) window.userDocRef.update({[`avatarStats.${stat}`]: firebase.firestore.FieldValue.increment(1)});
  },

  celebrate() {
    if(!this.character || this.isCelebrating) return;
    this.isCelebrating = true;
    const originalY = this.character.position.y;
    let startTime = Date.now(), duration=600, jumpHeight=0.6;
    const animateJump = () => {
      const elapsed = Date.now()-startTime, progress = Math.min(elapsed/duration,1);
      this.character.position.y = originalY + jumpHeight*4*progress*(1-progress);
      if(progress<1) requestAnimationFrame(animateJump);
      else { this.character.position.y = originalY; this.isCelebrating = false; }
    };
    animateJump();
  }
};