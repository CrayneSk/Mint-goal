const AvatarSystem = {
  elements: {},
  canvas: null,
  ctx: null,

  init(els) {
    this.elements = els;
    this.canvas = document.getElementById('avatarCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = 200;
      this.canvas.height = 280;
    }
  },

  getStage(level) {
    if (level >= 50) return 'Legend';
    if (level >= 35) return 'Master';
    if (level >= 20) return 'Builder';
    if (level >= 10) return 'Focused';
    if (level >= 5) return 'Disciplined';
    return 'Beginner';
  },

  getEmoji(stage) {
    const map = { Beginner:'🙂', Disciplined:'😎', Focused:'🧐', Builder:'🦸', Master:'🧙', Legend:'👑' };
    return map[stage] || '🙂';
  },

  updateShowcase(data) {
    const els = this.elements;
    const stats = data.avatarStats || { strength:0, knowledge:0, focus:0, creativity:0 };
    const xp = data.totalXP || 0;
    const level = Math.floor(xp / 100) + 1;
    const stage = this.getStage(level);
    const equipped = data.equippedCosmetics || {};

    if (els.avatarStrength) els.avatarStrength.textContent = stats.strength;
    if (els.avatarKnowledge) els.avatarKnowledge.textContent = stats.knowledge;
    if (els.avatarFocus) els.avatarFocus.textContent = stats.focus;
    if (els.avatarCreativity) els.avatarCreativity.textContent = stats.creativity;
    if (els.avatarShowcaseName) els.avatarShowcaseName.textContent = stage;
    if (els.avatarLevel) els.avatarLevel.textContent = level;
    if (els.avatarIcon) els.avatarIcon.innerHTML = this.getEmoji(stage);
  },

  async renderScreen() {
    if (!window.userDocRef) return;
    const doc = await window.userDocRef.get();
    const data = doc.data() || {};
    const stats = data.avatarStats || {};
    const xp = data.totalXP || 0;
    const level = Math.floor(xp / 100) + 1;
    const stage = this.getStage(level);
    const equipped = data.equippedCosmetics || {};
    const els = this.elements;

    if (els.avatarStageName) els.avatarStageName.textContent = stage;
    if (els.avatarScreenLevel) els.avatarScreenLevel.textContent = level;
    if (els.avatarXP) els.avatarXP.textContent = `${xp % 100} / 100`;
    if (els.avatarLevelBar) els.avatarLevelBar.style.width = `${(xp % 100)}%`;
    if (els.avatarStatStrength) els.avatarStatStrength.textContent = stats.strength || 0;
    if (els.avatarStatKnowledge) els.avatarStatKnowledge.textContent = stats.knowledge || 0;
    if (els.avatarStatFocus) els.avatarStatFocus.textContent = stats.focus || 0;
    if (els.avatarStatCreativity) els.avatarStatCreativity.textContent = stats.creativity || 0;

    this.drawAvatar(stage, equipped);
    this.renderCosmeticsShop(data.ownedCosmetics || [], equipped);
  },

  drawAvatar(stage, equipped) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 200, 280);

    // Simple character drawing – can be upgraded to 3D later
    // ... (include the full drawing code from the previous large avatar.js here) ...
    // For brevity, I'll just draw a placeholder circle with hat
    ctx.beginPath();
    ctx.arc(100, 70, 30, 0, Math.PI*2);
    ctx.fillStyle = '#ffcc80';
    ctx.fill();
    ctx.stroke();

    // Hat
    const hatId = equipped.hat || '';
    const hatColors = { hat_cap:'#000', hat_crown:'#fdd835', hat_scholar:'#fdd835' };
    ctx.fillStyle = hatColors[hatId] || '#000';
    ctx.fillRect(80, 25, 40, 10);
  },

  renderCosmeticsShop(owned, equipped) {
    const shop = this.elements.cosmeticsShop;
    if (!shop) return;

    let html = '';
    cosmeticsList.forEach(item => {
      const isOwned = owned.includes(item.id);
      const isEquipped = equipped[item.type] === item.id;
      html += `<div class="cosmetic-item">
        <span>${item.name}</span>
        <div>
          ${isOwned
            ? `<button class="btn btn-small equip-btn" data-id="${item.id}" data-type="${item.type}" ${isEquipped ? 'disabled' : ''}>${isEquipped ? 'Equipped' : 'Wear'}</button>`
            : `<button class="btn btn-small buy-cosmetic-btn" data-id="${item.id}" data-cost="${item.cost}">Buy ${item.cost} 🪙</button>`
          }
        </div>
      </div>`;
    });
    shop.innerHTML = html;

    // Equip handler
    shop.querySelectorAll('.equip-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        const doc = await window.userDocRef.get();
        const currEquipped = doc.data().equippedCosmetics || {};
        currEquipped[type] = id;
        await window.userDocRef.update({ equippedCosmetics: currEquipped });
        this.renderScreen();
      });
    });

    // Buy handler
    shop.querySelectorAll('.buy-cosmetic-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const cost = parseInt(e.target.dataset.cost);
        const doc = await window.userDocRef.get();
        const coins = doc.data().mintCoins || 0;
        if (coins < cost) return alert('Not enough coins');
        const currOwned = doc.data().ownedCosmetics || [];
        if (currOwned.includes(id)) return;
        currOwned.push(id);
        await window.userDocRef.update({
          mintCoins: firebase.firestore.FieldValue.increment(-cost),
          ownedCosmetics: currOwned
        });
        const updatedDoc = await window.userDocRef.get();
        if (window.mintCoinsEl) window.mintCoinsEl.textContent = updatedDoc.data().mintCoins;
        this.renderScreen();
      });
    });
  },

  incrementStat(category) {
    const statMap = { health:'strength', learning:'knowledge', productivity:'focus', creativity:'creativity' };
    const stat = statMap[category];
    if (stat && window.userDocRef) {
      window.userDocRef.update({ [`avatarStats.${stat}`]: firebase.firestore.FieldValue.increment(1) });
    }
  }
};