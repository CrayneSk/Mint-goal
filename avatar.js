// avatar.js – GoaLMint Avatar System with Visual Cosmetics

const AvatarSystem = {
  elements: {},
  canvas: null,
  ctx: null,

  init(els) {
    this.elements = els;
    this.canvas = document.getElementById('avatarCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
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
      'Beginner': '🙂',
      'Disciplined': '😎',
      'Focused': '🧐',
      'Builder': '🦸',
      'Master': '🧙',
      'Legend': '👑'
    };
    return map[stage] || '🙂';
  },

  // ---------- Dashboard mini showcase ----------
  updateShowcase(userData) {
    const els = this.elements;
    const stats = userData.avatarStats || { strength: 0, knowledge: 0, focus: 0, creativity: 0 };
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

    // Show emoji + small hat indicator on dashboard
    const hat = equipped.hat || '';
    const hatEmoji = this.getHatEmoji(hat);
    if (els.avatarIcon) els.avatarIcon.innerHTML = hatEmoji + this.getEmoji(stage);
  },

  getHatEmoji(hatId) {
    const hats = {
      'hat_cap': '🧢', 'hat_beanie': '🎿', 'hat_cowboy': '🤠', 'hat_tophat': '🎩',
      'hat_scholar': '🎓', 'hat_crown': '👑', 'hat_visor': '🧢', 'hat_beret': '👨‍🎨',
      'hat_helmet': '⛑️', 'hat_wizard': '🧙', 'hat_party': '🎉', 'hat_sombrero': '🇲🇽'
    };
    return hats[hatId] || '';
  },

  // ---------- Full avatar screen ----------
  async renderScreen() {
    if (!window.userDocRef) return;
    const doc = await window.userDocRef.get();
    const data = doc.data() || {};
    const stats = data.avatarStats || { strength: 0, knowledge: 0, focus: 0, creativity: 0 };
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

    // Draw avatar on canvas
    this.drawAvatar(stage, equipped);

    this.renderCosmeticsShop(data.ownedCosmetics || [], equipped);
  },

  /* ---------- Canvas drawing ---------- */
  drawAvatar(stage, equipped) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const canvas = this.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Body colors based on stage
    const colors = {
      'Beginner': '#b0bec5',
      'Disciplined': '#78909c',
      'Focused': '#546e7a',
      'Builder': '#ff7043',
      'Master': '#ab47bc',
      'Legend': '#fdd835'
    };
    const bodyColor = colors[stage] || '#b0bec5';

    // Outfit colors
    const outfitColors = {
      'outfit_hoodie': '#e53935', 'outfit_training': '#ffb74d', 'outfit_hero': '#1e88e5',
      'outfit_suit': '#212121', 'outfit_armor': '#757575', 'outfit_pajamas': '#ce93d8',
      'outfit_chef': '#ffffff', 'outfit_astronaut': '#ffffff', 'outfit_pirate': '#4e342e',
      'outfit_samurai': '#bf360c', 'outfit_angel': '#fff9c4', 'outfit_devil': '#b71c1c'
    };
    const outfitColor = outfitColors[equipped.outfit] || bodyColor;

    // Head
    ctx.beginPath();
    ctx.arc(100, 60, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc80'; // skin
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(88, 55, 4, 0, Math.PI * 2);
    ctx.arc(112, 55, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (smile)
    ctx.beginPath();
    ctx.arc(100, 72, 10, 0, Math.PI);
    ctx.stroke();

    // Body (outfit)
    ctx.fillStyle = outfitColor;
    ctx.fillRect(75, 90, 50, 60);

    // Arms (body color)
    ctx.fillStyle = bodyColor;
    ctx.fillRect(50, 100, 20, 10);
    ctx.fillRect(130, 100, 20, 10);

    // Legs
    ctx.fillStyle = '#37474f';
    ctx.fillRect(82, 150, 15, 40);
    ctx.fillRect(103, 150, 15, 40);

    // Hat
    const hatId = equipped.hat || '';
    this.drawHat(ctx, hatId);

    // Accessory (glasses)
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
      ctx.moveTo(96, 55);
      ctx.lineTo(104, 55);
      ctx.stroke();
    }

    // Back item (wings / cape)
    const backId = equipped.back || '';
    if (backId === 'back_angelwings') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(40, 120, 20, 35, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(160, 120, 20, 35, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (backId === 'back_devilwings') {
      ctx.fillStyle = '#b71c1c';
      // similar ellipse code...
    } else if (backId === 'back_cape') {
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(70, 90, 60, 80);
    }
  },

  drawHat(ctx, hatId) {
    // Simple hat representations
    ctx.fillStyle = '#000';
    switch (hatId) {
      case 'hat_cap':
      case 'hat_visor':
        ctx.fillRect(80, 25, 40, 10);
        ctx.fillRect(70, 30, 60, 5);
        break;
      case 'hat_beanie':
        ctx.fillRect(80, 20, 40, 15);
        ctx.fillRect(75, 32, 50, 5);
        break;
      case 'hat_cowboy':
        ctx.fillRect(70, 30, 60, 10);
        ctx.fillRect(75, 22, 50, 10);
        break;
      case 'hat_tophat':
        ctx.fillRect(85, 15, 30, 20);
        ctx.fillRect(75, 32, 50, 5);
        break;
      case 'hat_scholar':
        ctx.fillStyle = '#000';
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
        // small points
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(80 + i * 10, 20, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      // ... other hats can be added similarly
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
      health: 'strength',
      learning: 'knowledge',
      productivity: 'focus',
      creativity: 'creativity'
    };
    const stat = statMap[category];
    if (stat && window.userDocRef) {
      window.userDocRef.update({ [`avatarStats.${stat}`]: firebase.firestore.FieldValue.increment(1) });
    }
  }
};