// avatar.js – GoaLMint 3D Pixar-style Avatar System
const AvatarSystem = {
  elements: {},
  scene: null,
  camera: null,
  renderer: null,
  character: null,       // Group containing all body parts
  hatGroup: null,
  outfitParts: [],       // meshes that change with outfit
  backGroup: null,
  petGroup: null,
  animationId: null,
  isCelebrating: false,

  init(els) {
    this.elements = els;
    const container = document.getElementById('avatar3DContainer');
    if (!container) return;

    // --- Scene setup ---
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);   // dark, matches theme

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 1.2, 4);
    this.camera.lookAt(0, 1, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // performance
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(1, 2, 2);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffccaa, 0.6);
    fillLight.position.set(-1, 0.5, 0);
    this.scene.add(fillLight);

    // Ground reflection (optional)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    this.scene.add(floor);

    // Start animation loop
    this.animate();
  },

  // --- Build / update the entire character ---
  async renderScreen() {
    if (!window.userDocRef || !this.scene) return;
    const doc = await window.userDocRef.get();
    const data = doc.data() || {};
    const stats = data.avatarStats || {};
    const xp = data.totalXP || 0;
    const level = Math.floor(xp / 100) + 1;
    const stage = this.getStage(level);
    const equipped = data.equippedCosmetics || {};
    const els = this.elements;

    // Update UI text
    if (els.avatarStageName) els.avatarStageName.textContent = stage;
    if (els.avatarScreenLevel) els.avatarScreenLevel.textContent = level;
    if (els.avatarXP) els.avatarXP.textContent = `${xp % 100} / 100`;
    if (els.avatarLevelBar) els.avatarLevelBar.style.width = `${(xp % 100)}%`;
    if (els.avatarStatStrength) els.avatarStatStrength.textContent = stats.strength || 0;
    if (els.avatarStatKnowledge) els.avatarStatKnowledge.textContent = stats.knowledge || 0;
    if (els.avatarStatFocus) els.avatarStatFocus.textContent = stats.focus || 0;
    if (els.avatarStatCreativity) els.avatarStatCreativity.textContent = stats.creativity || 0;

    // Build 3D character
    this.buildCharacter(stage, equipped);

    // Cosmetics shop (unchanged)
    this.renderCosmeticsShop(data.ownedCosmetics || [], equipped);
  },

  /* ================================================================
     CHARACTER CONSTRUCTION
     ================================================================ */
  buildCharacter(stage, equipped) {
    // Remove old character
    if (this.character) {
      this.scene.remove(this.character);
      this.character = null;
    }
    const group = new THREE.Group();
    this.character = group;

    // Colors by stage (Pixar style)
    const skinColor = 0xffccaa;
    const stageColors = {
      Beginner: 0xb0bec5, Disciplined: 0x78909c, Focused: 0x546e7a,
      Builder: 0xff7043, Master: 0xab47bc, Legend: 0xfdd835
    };
    const bodyBase = stageColors[stage] || 0xb0bec5;

    // Outfit color (if equipped)
    const outfitMap = {
      outfit_hoodie: 0xe53935, outfit_training: 0xffb74d, outfit_hero: 0x1e88e5,
      outfit_suit: 0x212121, outfit_armor: 0x757575, outfit_pajamas: 0xce93d8,
      outfit_chef: 0xffffff, outfit_astronaut: 0xffffff, outfit_pirate: 0x4e342e,
      outfit_samurai: 0xbf360c, outfit_angel: 0xfff9c4, outfit_devil: 0xb71c1c
    };
    const bodyColor = equipped.outfit ? (outfitMap[equipped.outfit] || bodyBase) : bodyBase;

    // ---- Torso & legs ----
    const torsoGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.8, 8);
    const torsoMat = new THREE.MeshToonMaterial({ color: bodyColor });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.7;
    group.add(torso);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.7, 6);
    const legMat = new THREE.MeshToonMaterial({ color: 0x333333 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.15, 0);
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.15, 0);
    group.add(rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.25, 0.1, 0.35);
    const shoeMat = new THREE.MeshToonMaterial({ color: 0x5d4037 });
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.2, -0.2, 0.05);
    group.add(leftShoe);
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.2, -0.2, 0.05);
    group.add(rightShoe);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.6, 6);
    const armMat = new THREE.MeshToonMaterial({ color: skinColor });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.55, 0.8, 0);
    leftArm.rotation.z = Math.PI / 6;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.55, 0.8, 0);
    rightArm.rotation.z = -Math.PI / 6;
    group.add(rightArm);

    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const headMat = new THREE.MeshToonMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.35;
    group.add(head);

    // Eyes (Pixar style – large)
    const eyeWhiteGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeWhiteMat = new THREE.MeshToonMaterial({ color: 0xffffff });
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeWhite.position.set(-0.14, 1.45, 0.28);
    group.add(leftEyeWhite);
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEyeWhite.position.set(0.14, 1.45, 0.28);
    group.add(rightEyeWhite);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.14, 1.47, 0.38);
    group.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.14, 1.47, 0.38);
    group.add(rightPupil);

    // Smile
    const smileCurve = new THREE.EllipseCurve(0, 0, 0.1, 0.06, 0, Math.PI, false, 0);
    const smilePts = smileCurve.getPoints(20);
    const smileGeo = new THREE.BufferGeometry().setFromPoints(smilePts);
    const smileLine = new THREE.Line(smileGeo, new THREE.LineBasicMaterial({ color: 0x000000 }));
    smileLine.position.set(0, 1.3, 0.32);
    group.add(smileLine);

    // Hair (simple cap)
    const hairGeo = new THREE.SphereGeometry(0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshToonMaterial({ color: 0x4e342e });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.35;
    group.add(hair);

    // ---- Hat (3D mesh, clear visual) ----
    this.hatGroup = new THREE.Group();
    const hatId = equipped.hat || '';
    this.createHatMesh(hatId);
    group.add(this.hatGroup);

    // ---- Back items (wings, cape) ----
    this.backGroup = new THREE.Group();
    this.createBackMesh(equipped.back || '');
    group.add(this.backGroup);

    // ---- Pet ----
    this.petGroup = new THREE.Group();
    this.createPetMesh(equipped.pet || '');
    group.add(this.petGroup);

    this.scene.add(group);
  },

  /* ---------- Hat models ---------- */
  createHatMesh(hatId) {
    const group = this.hatGroup;
    group.clear();
    // All hats are positioned on top of the head (y ~1.65)
    switch (hatId) {
      case 'hat_cap':
      case 'hat_visor': {
        const brim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.05, 8),
          new THREE.MeshToonMaterial({ color: 0x111111 })
        );
        brim.position.y = 1.65;
        group.add(brim);
        const top = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.35, 0.25, 8),
          new THREE.MeshToonMaterial({ color: 0xe53935 })
        );
        top.position.y = 1.78;
        group.add(top);
        break;
      }
      case 'hat_beanie': {
        const beanie = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI*2, 0, Math.PI/2),
          new THREE.MeshToonMaterial({ color: 0xe53935 })
        );
        beanie.position.y = 1.6;
        group.add(beanie);
        break;
      }
      case 'hat_cowboy': {
        const brim = new THREE.Mesh(
          new THREE.TorusGeometry(0.35, 0.1, 8, 16),
          new THREE.MeshToonMaterial({ color: 0x8b4513 })
        );
        brim.rotation.x = Math.PI/2;
        brim.position.y = 1.65;
        group.add(brim);
        const crown = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.32, 0.2, 8),
          new THREE.MeshToonMaterial({ color: 0x8b4513 })
        );
        crown.position.y = 1.8;
        group.add(crown);
        break;
      }
      case 'hat_tophat': {
        const top = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.28, 0.4, 8),
          new THREE.MeshToonMaterial({ color: 0x111111 })
        );
        top.position.y = 1.85;
        group.add(top);
        const brim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.05, 8),
          new THREE.MeshToonMaterial({ color: 0x111111 })
        );
        brim.position.y = 1.65;
        group.add(brim);
        break;
      }
      case 'hat_scholar': {
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.32, 0.1, 8),
          new THREE.MeshToonMaterial({ color: 0x111111 })
        );
        base.position.y = 1.68;
        group.add(base);
        const mortar = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.05, 0.5),
          new THREE.MeshToonMaterial({ color: 0x111111 })
        );
        mortar.position.y = 1.75;
        group.add(mortar);
        break;
      }
      case 'hat_crown': {
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.3, 0.08, 8, 16),
          new THREE.MeshToonMaterial({ color: 0xffd700 })
        );
        band.rotation.x = Math.PI/2;
        band.position.y = 1.65;
        group.add(band);
        for (let i=0; i<5; i++) {
          const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.07, 0.2, 6),
            new THREE.MeshToonMaterial({ color: 0xffd700 })
          );
          const angle = (i/5)*Math.PI*2;
          spike.position.set(Math.cos(angle)*0.3, 1.75, Math.sin(angle)*0.3);
          group.add(spike);
        }
        break;
      }
      case 'hat_beret': {
        const beret = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI*2, 0, Math.PI/2.5),
          new THREE.MeshToonMaterial({ color: 0xc2185b })
        );
        beret.position.y = 1.6;
        group.add(beret);
        break;
      }
      case 'hat_helmet': {
        const helmet = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI*2, 0, Math.PI/2),
          new THREE.MeshToonMaterial({ color: 0xffa000 })
        );
        helmet.position.y = 1.65;
        group.add(helmet);
        break;
      }
      case 'hat_wizard': {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.3, 0.5, 8),
          new THREE.MeshToonMaterial({ color: 0x7b1fa2 })
        );
        cone.position.y = 1.9;
        group.add(cone);
        const brim = new THREE.Mesh(
          new THREE.TorusGeometry(0.35, 0.08, 8, 16),
          new THREE.MeshToonMaterial({ color: 0x7b1fa2 })
        );
        brim.rotation.x = Math.PI/2;
        brim.position.y = 1.65;
        group.add(brim);
        break;
      }
      case 'hat_party': {
        for (let i=0; i<3; i++) {
          const color = [0xff0000, 0x00ff00, 0x0000ff][i];
          const cone = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.25, 6),
            new THREE.MeshToonMaterial({ color })
          );
          cone.position.set(-0.1 + i*0.1, 1.8, 0);
          group.add(cone);
        }
        break;
      }
      case 'hat_sombrero': {
        const top = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.25, 8),
          new THREE.MeshToonMaterial({ color: 0xffa726 })
        );
        top.position.y = 1.8;
        group.add(top);
        const brim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 0.05, 16),
          new THREE.MeshToonMaterial({ color: 0xffa726 })
        );
        brim.position.y = 1.6;
        group.add(brim);
        break;
      }
      default: break;
    }
  },

  createBackMesh(backId) {
    const group = this.backGroup;
    group.clear();
    switch (backId) {
      case 'back_angelwings':
      case 'back_devilwings': {
        const color = backId === 'back_angelwings' ? 0xffffff : 0xb71c1c;
        for (let side=-1; side<=1; side+=2) {
          const wingGeo = new THREE.ConeGeometry(0.3, 0.8, 4);
          const wing = new THREE.Mesh(wingGeo, new THREE.MeshToonMaterial({ color }));
          wing.position.set(side*0.5, 1.0, -0.2);
          wing.rotation.z = side*0.5;
          group.add(wing);
        }
        break;
      }
      case 'back_cape': {
        const cape = new THREE.Mesh(
          new THREE.PlaneGeometry(0.5, 0.9),
          new THREE.MeshToonMaterial({ color: 0xd32f2f, side: THREE.DoubleSide })
        );
        cape.position.set(0, 0.9, -0.25);
        group.add(cape);
        break;
      }
      case 'back_jetpack': {
        const tank = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.15, 0.6, 6),
          new THREE.MeshToonMaterial({ color: 0x9e9e9e })
        );
        tank.position.set(-0.25, 1.0, -0.2);
        group.add(tank);
        const tank2 = tank.clone();
        tank2.position.set(0.25, 1.0, -0.2);
        group.add(tank2);
        break;
      }
      case 'back_sword': {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.7, 0.05),
          new THREE.MeshToonMaterial({ color: 0xcfd8dc })
        );
        blade.position.set(0, 1.4, -0.15);
        group.add(blade);
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6),
          new THREE.MeshToonMaterial({ color: 0x8d6e63 })
        );
        handle.position.set(0, 0.95, -0.15);
        group.add(handle);
        break;
      }
      default: break;
    }
  },

  createPetMesh(petId) {
    const group = this.petGroup;
    group.clear();
    const petPos = new THREE.Vector3(0.8, 0.3, 0.5);
    switch (petId) {
      case 'pet_cat': {
        const body = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshToonMaterial({ color: 0xffa726 })
        );
        body.position.copy(petPos);
        group.add(body);
        const ears = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.15, 4),
          new THREE.MeshToonMaterial({ color: 0xffa726 })
        );
        ears.position.set(petPos.x-0.1, petPos.y+0.2, petPos.z);
        group.add(ears);
        const ears2 = ears.clone();
        ears2.position.set(petPos.x+0.1, petPos.y+0.2, petPos.z);
        group.add(ears2);
        break;
      }
      case 'pet_dog': {
        const body = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshToonMaterial({ color: 0x8d6e63 })
        );
        body.position.copy(petPos);
        group.add(body);
        break;
      }
      case 'pet_dragon': {
        const body = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 8, 8),
          new THREE.MeshToonMaterial({ color: 0x4caf50 })
        );
        body.position.copy(petPos);
        group.add(body);
        break;
      }
      case 'pet_robot': {
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.3, 0.3),
          new THREE.MeshToonMaterial({ color: 0xb0bec5 })
        );
        body.position.copy(petPos);
        group.add(body);
        break;
      }
      default: break;
    }
  },

  /* ================================================================
     ANIMATION LOOP & CELEBRATION
     ================================================================ */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
    // Simple idle bounce (only if not celebrating)
    if (this.character && !this.isCelebrating) {
      this.character.position.y = Math.sin(Date.now() * 0.005) * 0.02;
    }
  },

  /** Call this after a habit completion to trigger a celebration */
  celebrate() {
    if (!this.character || this.isCelebrating) return;
    this.isCelebrating = true;
    const originalY = this.character.position.y;
    const jumpHeight = 0.6;
    const duration = 600; // ms
    const startTime = Date.now();

    const animateJump = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Parabolic jump
      const yOffset = jumpHeight * 4 * progress * (1 - progress);
      this.character.position.y = originalY + yOffset;
      if (progress < 1) {
        requestAnimationFrame(animateJump);
      } else {
        this.character.position.y = originalY;
        this.isCelebrating = false;
      }
    };
    animateJump();
  },

  // ---------- Helpers (unchanged) ----------
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

  renderCosmeticsShop(owned, equipped) {
    const shop = this.elements.cosmeticsShop;
    if (!shop || typeof cosmeticsList === 'undefined') return;

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