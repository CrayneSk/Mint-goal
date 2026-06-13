// avatar.js – GoaLMint Avatar System (visual cosmetics)
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
    const map = {
      'Beginner': '🙂', 'Disciplined': '😎', 'Focused': '🧐',
      'Builder': '🦸', 'Master': '🧙', 'Legend': '👑'
    };
    return map[stage] || '🙂';
  },

  // ---------- Dashboard mini showcase ----------
  updateShowcase(userData) {
    const els = this.elements;
    const stats = userData.avatarStats || { strength:0, knowledge:0, focus:0, creativity:0 };
    const xp = userData.totalXP || 0;
    const level = Math.floor(xp / 100) + 1;
    const stage = this.getStage(level);
    const equipped = userData.equippedCosmetics || {};

    if (els.avatarStrength) els.avatarStrength.textContent = stats.strength;
    if (els.avatarKnowledge) els.avatarKnowledge.textContent = stats.knowledge;
    if (els.avatarFocus) els.avatarFocus.textContent = stats.focus;
    if (els.avatarCreativity) els.avatarCreativity.textContent = stats.creativity;
    if (els.avatarShowcaseName) els.avatarShowcaseName.textContent = stage;
    if (els.avatarLevel) els.avatarLevel.textContent = level;

    const hat = equipped.hat || '';
    const hatEmoji = this.getHatEmoji(hat);
    if (els.avatarIcon) els.avatarIcon.innerHTML = hatEmoji + this.getEmoji(stage);
  },

  getHatEmoji(hatId) {
    const hats = {
      'hat_cap':'🧢','hat_beanie':'🎿','hat_cowboy':'🤠','hat_tophat':'🎩',
      'hat_scholar':'🎓','hat_crown':'👑','hat_visor':'🧢','hat_beret':'👨‍🎨',
      'hat_helmet':'⛑️','hat_wizard':'🧙','hat_party':'🎉','hat_sombrero':'🇲🇽'
    };
    return hats[hatId] || '';
  },

  // ---------- Full avatar screen ----------
  async renderScreen() {
    if (!window.userDocRef) return;
    const doc = await window.userDocRef.get();
    const data = doc.data() || {};
    const stats = data.avatarStats || { strength:0, knowledge:0, focus:0, creativity:0 };
    const xp = data.totalXP || 0;
    const level = Math.floor(xp / 100) + 1;
    const stage = this.getStage(level);
    const equipped = data.equippedCosmetics || {};
    const els = this.elements;

    if (els.avatarStageName) els.avatarStageName.textContent = stage;
    if (els.avatarScreenLevel) els.avatarScreenLevel.textContent = level;
    if (els.avatarXP) els.avatarXP.textContent = `${xp % 100} / 100`;
    if (els.avatarLevelBar) els.avatarLevelBar.style.width = `${(xp % 100)}%`;
    if (els.avatarStatStrength) els.avatarStatStrength.textContent = stats.strength;
    if (els.avatarStatKnowledge) els.avatarStatKnowledge.textContent = stats.knowledge;
    if (els.avatarStatFocus) els.avatarStatFocus.textContent = stats.focus;
    if (els.avatarStatCreativity) els.avatarStatCreativity.textContent = stats.creativity;

    this.drawAvatar(stage, equipped);
    this.renderCosmeticsShop(data.ownedCosmetics || [], equipped);
  },

  /* ========== CANVAS DRAWING ========== */
  drawAvatar(stage, equipped) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = 200, h = 280;
    ctx.clearRect(0, 0, w, h);

    // ---- Stage colors ----
    const stageColors = {
      Beginner: '#b0bec5', Disciplined: '#78909c', Focused: '#546e7a',
      Builder: '#ff7043', Master: '#ab47bc', Legend: '#fdd835'
    };
    const skinTone = '#ffcc80';
    const eyeColor = '#000';
    const bodyColor = stageColors[stage] || '#b0bec5';

    // ---- Outfit colors (based on equipped) ----
    const outfitColorMap = {
      'outfit_hoodie': '#e53935', 'outfit_training': '#ffb74d', 'outfit_hero': '#1e88e5',
      'outfit_suit': '#212121', 'outfit_armor': '#757575', 'outfit_pajamas': '#ce93d8',
      'outfit_chef': '#ffffff', 'outfit_astronaut': '#ffffff', 'outfit_pirate': '#4e342e',
      'outfit_samurai': '#bf360c', 'outfit_angel': '#fff9c4', 'outfit_devil': '#b71c1c'
    };
    const outfitColor = equipped.outfit ? (outfitColorMap[equipped.outfit] || bodyColor) : bodyColor;

    // ---- Bottom colors ----
    const bottomColorMap = {
      'bottom_jeans': '#1565c0', 'bottom_shorts': '#ff8f00', 'bottom_skirt': '#c2185b', 'bottom_cargo': '#6d4c41'
    };
    const bottomColor = equipped.bottom ? (bottomColorMap[equipped.bottom] || '#37474f') : '#37474f';

    // ---- Shoe colors ----
    const shoeColorMap = {
      'shoes_sneakers': '#ffffff', 'shoes_boots': '#5d4037', 'shoes_heels': '#e91e63',
      'shoes_sandals': '#795548', 'shoes_wizard': '#7b1fa2'
    };
    const shoeColor = equipped.shoes ? (shoeColorMap[equipped.shoes] || '#212121') : '#212121';

    // ---- Back item (drawn first) ----
    const backId = equipped.back || '';
    this.drawBack(ctx, backId);

    // ---- Legs (bottom) ----
    ctx.fillStyle = bottomColor;
    ctx.fillRect(82, 150, 15, 40);
    ctx.fillRect(103, 150, 15, 40);

    // ---- Shoes ----
    ctx.fillStyle = shoeColor;
    ctx.fillRect(80, 188, 19, 12);
    ctx.fillRect(101, 188, 19, 12);

    // ---- Body (outfit) ----
    ctx.fillStyle = outfitColor;
    ctx.fillRect(75, 90, 50, 60);

    // ---- Arms (body color) ----
    ctx.fillStyle = bodyColor;
    ctx.fillRect(50, 100, 20, 10);
    ctx.fillRect(130, 100, 20, 10);

    // ---- Head ----
    ctx.beginPath();
    ctx.arc(100, 60, 30, 0, Math.PI * 2);
    ctx.fillStyle = skinTone;
    ctx.fill();
    ctx.stroke();

    // ---- Eyes ----
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(88, 55, 4, 0, Math.PI * 2);
    ctx.arc(112, 55, 4, 0, Math.PI * 2);
    ctx.fill();

    // ---- Mouth (smile) ----
    ctx.beginPath();
    ctx.arc(100, 72, 10, 0, Math.PI);
    ctx.stroke();

    // ---- Accessories ----
    const accId = equipped.accessory || '';
    if (accId === 'acc_glasses' || accId === 'acc_sunglasses' || accId === 'acc_monocle') {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(88, 55, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(112, 55, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(96, 55); ctx.lineTo(104, 55);
      ctx.stroke();
    }
    if (accId === 'acc_earrings') {
      ctx.fillStyle = '#fdd835';
      ctx.beginPath();
      ctx.arc(80, 60, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(120, 60, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (accId === 'acc_necklace') {
      ctx.strokeStyle = '#fdd835';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(100, 85, 12, Math.PI, 0);
      ctx.stroke();
    }
    if (accId === 'acc_scarf') {
      ctx.fillStyle = '#e53935';
      ctx.fillRect(88, 80, 24, 8);
    }
    if (accId === 'acc_watch') {
      ctx.fillStyle = '#424242';
      ctx.fillRect(125, 130, 6, 10);
    }

    // ---- Hat ----
    this.drawHat(ctx, equipped.hat || '');

    // ---- Effect (aura) ----
    this.drawEffect(ctx, equipped.effect || '');

    // ---- Pet ----
    this.drawPet(ctx, equipped.pet || '');
  },

  /* ---------- Hat drawing ---------- */
  drawHat(ctx, hatId) {
    ctx.fillStyle = '#000';
    switch (hatId) {
      case 'hat_cap':
      case 'hat_visor':
        ctx.fillRect(80, 25, 40, 10);
        ctx.fillRect(70, 30, 60, 5);
        break;
      case 'hat_beanie':
        ctx.fillStyle = '#e53935';
        ctx.fillRect(80, 20, 40, 15);
        ctx.fillRect(75, 32, 50, 5);
        break;
      case 'hat_cowboy':
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(70, 30, 60, 10);
        ctx.fillRect(75, 22, 50, 10);
        break;
      case 'hat_tophat':
        ctx.fillRect(85, 15, 30, 20);
        ctx.fillRect(75, 32, 50, 5);
        break;
      case 'hat_scholar':
        ctx.fillRect(75, 32, 50, 5);
        ctx.fillStyle = '#fdd835';
        ctx.beginPath();
        ctx.moveTo(100, 32);
        ctx.lineTo(110, 10);
        ctx.lineTo(90, 10);
        ctx.fill();
        break;
      case 'hat_crown':
        ctx.fillStyle = '#fdd835';
        ctx.fillRect(80, 20, 40, 15);
        for (let i=0; i<5; i++) {
          ctx.beginPath();
          ctx.arc(80 + i*10, 20, 4, 0, Math.PI*2);
          ctx.fill();
        }
        break;
      case 'hat_beret':
        ctx.fillStyle = '#c2185b';
        ctx.beginPath();
        ctx.ellipse(100, 30, 25, 8, 0, 0, Math.PI*2);
        ctx.fill();
        break;
      case 'hat_helmet':
        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.arc(100, 38, 28, Math.PI, 0);
        ctx.fill();
        break;
      case 'hat_wizard':
        ctx.fillStyle = '#7b1fa2';
        ctx.beginPath();
        ctx.moveTo(70, 38);
        ctx.lineTo(100, 10);
        ctx.lineTo(130, 38);
        ctx.fill();
        ctx.fillRect(70, 38, 60, 5);
        break;
      case 'hat_party':
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.moveTo(100, 10);
        ctx.lineTo(85, 35);
        ctx.lineTo(115, 35);
        ctx.fill();
        break;
      case 'hat_sombrero':
        ctx.fillStyle = '#ffa726';
        ctx.beginPath();
        ctx.ellipse(100, 35, 35, 10, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillRect(80, 20, 40, 15);
        break;
      default: break;
    }
  },

  /* ---------- Back item ---------- */
  drawBack(ctx, backId) {
    switch (backId) {
      case 'back_angelwings':
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(40, 120, 20, 35, -0.3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(160, 120, 20, 35, 0.3, 0, Math.PI*2); ctx.fill();
        break;
      case 'back_devilwings':
        ctx.fillStyle = '#b71c1c';
        ctx.beginPath(); ctx.ellipse(35, 115, 18, 33, -0.4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(165, 115, 18, 33, 0.4, 0, Math.PI*2); ctx.fill();
        break;
      case 'back_cape':
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(70, 90, 60, 90);
        break;
      case 'back_jetpack':
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(65, 95, 15, 40);
        ctx.fillRect(120, 95, 15, 40);
        ctx.fillRect(70, 90, 60, 10);
        break;
      case 'back_sword':
        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(60, 110); ctx.lineTo(60, 150);
        ctx.stroke();
        ctx.fillStyle = '#fdd835';
        ctx.fillRect(56, 150, 8, 4);
        break;
      default: break;
    }
  },

  /* ---------- Effect (aura) ---------- */
  drawEffect(ctx, effectId) {
    if (!effectId) return;
    const x = 100, y = 130, r = 50;
    ctx.globalAlpha = 0.3;
    switch (effectId) {
      case 'effect_glow':
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
        break;
      case 'effect_fire':
        ctx.fillStyle = '#ff5722';
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
        break;
      case 'effect_lightning':
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
        break;
      case 'effect_hearts':
        ctx.fillStyle = '#e91e63';
        // simple heart shape
        ctx.beginPath();
        ctx.moveTo(x, y-15);
        ctx.bezierCurveTo(x-15, y-30, x-35, y-5, x, y+15);
        ctx.bezierCurveTo(x+35, y-5, x+15, y-30, x, y-15);
        ctx.fill();
        break;
      case 'effect_stars':
        ctx.fillStyle = '#ffd54f';
        // draw a few small stars
        for (let i=0; i<5; i++) {
          ctx.beginPath();
          ctx.arc(x-10 + i*10, y-10 + Math.sin(i)*15, 5, 0, Math.PI*2);
          ctx.fill();
        }
        break;
      case 'effect_toxic':
        ctx.fillStyle = '#76ff03';
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
        break;
      default: break;
    }
    ctx.globalAlpha = 1.0;
  },

  /* ---------- Pet (small companion) ---------- */
  drawPet(ctx, petId) {
    if (!petId) return;
    const x = 145, y = 170; // right side of avatar
    ctx.font = '24px sans-serif';
    switch (petId) {
      case 'pet_cat': ctx.fillText('🐱', x, y); break;
      case 'pet_dog': ctx.fillText('🐶', x, y); break;
      case 'pet_dragon': ctx.fillText('🐉', x, y); break;
      case 'pet_robot': ctx.fillText('🤖', x, y); break;
      default: break;
    }
  },

  /* ---------- Cosmetics shop (unchanged) ---------- */
  renderCosmeticsShop(owned, equipped) {
    const shop = this.elements.cosmeticsShop;
    if (!shop) return;

    let html = '';
    window.cosmeticsList.forEach(item => {
      const isOwned = owned.includes(item.id);
      const isEquipped = equipped[item.type] === item.id;
      html += `<div class="cosmetic-item">
        <span>${item.name}</span>
        <div>
          ${isOwned ?
            `<button class="btn btn-small equip-btn" data-id="${item.id}" data-type="${item.type}" ${isEquipped ? 'disabled' : ''}>${isEquipped ? 'Equipped' : 'Wear'}</button>` :
            `<button class="btn btn-small buy-cosmetic-btn" data-id="${item.id}" data-cost="${item.cost}">Buy ${item.cost} 🪙</button>`
          }
        </div>
      </div>`;
    });
    shop.innerHTML = html;

    shop.querySelectorAll('.equip-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        const doc = await window.userDocRef.get();
        const currentEquipped = doc.data().equippedCosmetics || {};
        currentEquipped[type] = id;
        await window.userDocRef.update({ equippedCosmetics: currentEquipped });
        this.renderScreen();
      });
    });

    shop.querySelectorAll('.buy-cosmetic-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const cost = parseInt(e.target.dataset.cost);
        const doc = await window.userDocRef.get();
        const coins = doc.data().mintCoins || 0;
        if (coins < cost) return alert('Not enough coins');
        const currentOwned = doc.data().ownedCosmetics || [];
        if (currentOwned.includes(id)) return;
        currentOwned.push(id);
        await window.userDocRef.update({
          mintCoins: firebase.firestore.FieldValue.increment(-cost),
          ownedCosmetics: currentOwned
        });
        const updatedDoc = await window.userDocRef.get();
        if (window.mintCoinsEl) window.mintCoinsEl.textContent = updatedDoc.data().mintCoins;
        this.renderScreen();
      });
    });
  },

  incrementStat(category) {
    const statMap = {
      health: 'strength', learning: 'knowledge',
      productivity: 'focus', creativity: 'creativity'
    };
    const stat = statMap[category];
    if (stat && window.userDocRef) {
      window.userDocRef.update({ [`avatarStats.${stat}`]: firebase.firestore.FieldValue.increment(1) });
    }
  }
};