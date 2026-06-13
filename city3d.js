// city3d.js – GoaLMint SimCity-style 3D city (fixed)
let threeCity = null;

class ThreeCity {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    // Day/Night state
    this.dayDuration = 120;
    this.timeOfDay = 0;
    this.sunLight = null;
    this.ambientLight = null;
    this.streetLights = [];
    this.isNight = false;

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(25, 20, 25);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Orbit controls (for pan/rotate)
    this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.maxPolarAngle = Math.PI / 2.5;
    this.orbitControls.target.set(0, 0, 0);

    // Drag controls – only if the library is loaded
    this.dragControls = null;
    this.buildMode = false;
    // We’ll set up drag controls in setupDragControls() later

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.sunLight.position.set(50, 50, 50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 100;
    this.sunLight.shadow.camera.left = -30;
    this.sunLight.shadow.camera.right = 30;
    this.sunLight.shadow.camera.top = 30;
    this.sunLight.shadow.camera.bottom = -30;
    this.scene.add(this.sunLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x7CB342, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Roads & buildings arrays
    this.roadMeshes = [];
    this.roadsData = [];
    this.buildingGroups = [];
    this.trees = [];

    // Avatar
    this.avatar = null;
    this.avatarPath = [];
    this.avatarSpeed = 0.02;

    // Start animation
    this.animationId = null;
    this.animate();

    // Create the Build Mode button
    this.createBuildModeButton();
  }

  createBuildModeButton() {
    const btn = document.createElement('button');
    btn.textContent = '🛠️ Build Mode';
    btn.style.position = 'absolute';
    btn.style.top = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = '10';
    btn.style.background = '#d4af37';
    btn.style.border = 'none';
    btn.style.padding = '0.5rem 1rem';
    btn.style.borderRadius = '2rem';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      if (!this.dragControls) {
        alert('Drag controls not available');
        return;
      }
      this.buildMode = !this.buildMode;
      btn.textContent = this.buildMode ? '🛠️ Moving…' : '🛠️ Build Mode';
      this.dragControls.enabled = this.buildMode;
      if (this.buildMode) {
        // Only allow moving non‑park buildings
        this.dragControls.objects = this.buildingGroups.filter(g => g.userData.type !== 'park');
      }
      this.orbitControls.enabled = !this.buildMode;
    });
    this.container.style.position = 'relative';
    this.container.appendChild(btn);
  }

  updateDayNight(delta) {
    this.timeOfDay += delta;
    if (this.timeOfDay > this.dayDuration) this.timeOfDay -= this.dayDuration;
    const progress = this.timeOfDay / this.dayDuration;
    const angle = progress * Math.PI * 2;
    const sunHeight = Math.sin(angle) * 40;
    const sunX = Math.cos(angle) * 40;
    this.sunLight.position.set(sunX, sunHeight, 20);
    this.sunLight.intensity = Math.max(0.2, Math.sin(angle) * 1.2);

    const dayColor = new THREE.Color(0x87CEEB);
    const nightColor = new THREE.Color(0x0a0a2e);
    const mix = (Math.sin(angle) + 1) / 2;
    this.scene.background = dayColor.clone().lerp(nightColor, 1 - mix);
    this.ambientLight.intensity = 0.2 + mix * 0.6;

    const isNight = mix < 0.3;
    if (isNight !== this.isNight) {
      this.isNight = isNight;
      this.toggleNightLights(isNight);
    }
  }

  toggleNightLights(on) {
    this.streetLights.forEach(light => { light.intensity = on ? 0.8 : 0; });
    this.buildingGroups.forEach(group => {
      group.children.forEach(child => {
        if (child.material && child.material.emissive) {
          child.material.emissiveIntensity = on ? 0.8 : 0.1;
        }
      });
    });
  }

  updateFromData(cityData, roads, avatarAppearance) {
    // Remove old buildings
    this.buildingGroups.forEach(group => this.scene.remove(group));
    this.buildingGroups = [];

    const types = {
      park: (x, z) => this.createPark(x, z),
      library: (x, z) => this.createLibrary(x, z),
      office: (x, z) => this.createOffice(x, z),
      gallery: (x, z) => this.createGallery(x, z)
    };

    Object.entries(cityData).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        if (types[type]) {
          const group = types[type](x, z);
          group.userData = { type, id: `${type}_${i}_${Date.now()}`, position: { x, z } };
          this.scene.add(group);
          this.buildingGroups.push(group);
        }
      }
    });

    // Roads
    this.roadsData = roads || [];
    this.drawRoads();

    // Avatar
    this.createAvatar(avatarAppearance);

    // Setup drag controls (safely)
    this.setupDragControls();
  }

  createPark(x, z) {
    const group = new THREE.Group();
    const grassGeo = new THREE.BoxGeometry(4, 0.1, 4);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.set(0, 0.05, 0);
    grass.receiveShadow = true;
    grass.castShadow = true;
    group.add(grass);

    for (let i = 0; i < 3; i++) {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 1.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
      );
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);
      for (let j = 0; j < 3; j++) {
        const leaf = new THREE.Mesh(
          new THREE.ConeGeometry(0.6 - j * 0.15, 0.6, 8),
          new THREE.MeshStandardMaterial({ color: 0x2E7D32 })
        );
        leaf.position.y = 1.2 + j * 0.5;
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        treeGroup.add(leaf);
      }
      treeGroup.position.set(-1.2 + i * 1.2, 0.1, -1.2 + i * 1.2);
      group.add(treeGroup);
    }
    group.position.set(x, 0, z);
    return group;
  }

  createLibrary(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 4, 3),
      new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.5 })
    );
    body.position.y = 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 1.5, 4),
      new THREE.MeshStandardMaterial({ color: 0x5D4037 })
    );
    roof.position.y = 4.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.8, 0.05),
          new THREE.MeshStandardMaterial({ color: 0xFFE082, emissive: 0xFFD54F, emissiveIntensity: 0.2 })
        );
        win.position.set(-1.2 + col * 1.2, 1.5 + row * 1.5, 1.51);
        group.add(win);
      }
    }
    group.position.set(x, 0, z);
    return group;
  }

  createOffice(x, z) {
    const group = new THREE.Group();
    const height = 6 + Math.random() * 4;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3, height, 3),
      new THREE.MeshStandardMaterial({ color: 0x607D8B, roughness: 0.3, metalness: 0.6 })
    );
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const floors = Math.floor(height / 1.2);
    for (let f = 0; f < floors; f++) {
      for (let side = 0; side < 4; side++) {
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.9, 0.05),
          new THREE.MeshStandardMaterial({ color: 0xFFE082, emissive: 0xFFC107, emissiveIntensity: 0.2 })
        );
        const angle = (side * Math.PI) / 2;
        win.position.set(
          Math.sin(angle) * 1.51,
          0.8 + f * 1.2,
          Math.cos(angle) * 1.51
        );
        win.rotation.y = angle;
        group.add(win);
      }
    }
    group.position.set(x, 0, z);
    return group;
  }

  createGallery(x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 3.5),
      new THREE.MeshStandardMaterial({ color: 0xE91E63, roughness: 0.4 })
    );
    body.position.y = 1.5;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xAD1457, roughness: 0.2, metalness: 0.3 })
    );
    dome.position.y = 3;
    dome.castShadow = true;
    dome.receiveShadow = true;
    group.add(dome);

    for (let i = 0; i < 4; i++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xFFE082, emissive: 0xFFD54F, emissiveIntensity: 0.2 })
      );
      win.position.set(-1.4 + i * 0.9, 1.8, 1.76);
      group.add(win);
    }
    group.position.set(x, 0, z);
    return group;
  }

  drawRoads() {
    this.roadMeshes.forEach(mesh => this.scene.remove(mesh));
    this.roadMeshes = [];
    this.streetLights.forEach(light => this.scene.remove(light));
    this.streetLights = [];

    this.roadsData.forEach(seg => {
      const start = new THREE.Vector3(seg.start.x, 0.01, seg.start.z);
      const end = new THREE.Vector3(seg.end.x, 0.01, seg.end.z);
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

      const roadGeo = new THREE.PlaneGeometry(length, 1.5);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.9 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.copy(midPoint);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = Math.atan2(direction.z, direction.x);
      road.receiveShadow = true;
      this.scene.add(road);
      this.roadMeshes.push(road);

      for (let i = 0; i < 10; i++) {
        const lineGeo = new THREE.BoxGeometry(1, 0.02, 0.1);
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFC107 });
        const line = new THREE.Mesh(lineGeo, lineMat);
        const t = (i + 0.5) / 10;
        line.position.copy(start.clone().lerp(end, t));
        line.position.y = 0.03;
        line.receiveShadow = true;
        this.scene.add(line);
        this.roadMeshes.push(line);
      }
    });

    this.roadsData.forEach(seg => {
      const start = new THREE.Vector3(seg.start.x, 0.01, seg.start.z);
      const end = new THREE.Vector3(seg.end.x, 0.01, seg.end.z);
      const length = start.distanceTo(end);
      const numLights = Math.floor(length / 5);
      for (let i = 0; i < numLights; i++) {
        const t = i / numLights;
        const pos = start.clone().lerp(end, t);
        const light = new THREE.PointLight(0xFFD54F, 0, 10);
        light.position.set(pos.x, 2.5, pos.z);
        this.scene.add(light);
        this.streetLights.push(light);

        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.15, 2.5, 6),
          new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        pole.position.copy(light.position);
        pole.position.y = 1.25;
        pole.castShadow = true;
        pole.receiveShadow = true;
        this.scene.add(pole);
        this.roadMeshes.push(pole);
      }
    });
  }

  createAvatar(appearance = {}) {
    if (this.avatar) this.scene.remove(this.avatar);
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: appearance.bodyColor || 0x2196F3 })
    );
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xFFD93D })
    );
    head.position.y = 1.4;
    head.castShadow = true;
    group.add(head);

    if (appearance.hat) {
      const hat = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
      );
      hat.position.y = 1.7;
      group.add(hat);
    }

    group.position.set(0, 0, 0);
    this.scene.add(group);
    this.avatar = group;
    this.generateAvatarPath();
  }

  generateAvatarPath() {
    if (this.roadsData.length > 0) {
      const seg = this.roadsData[0];
      this.avatarPath = [
        new THREE.Vector3(seg.start.x, 0, seg.start.z),
        new THREE.Vector3(seg.end.x, 0, seg.end.z)
      ];
    } else {
      this.avatarPath = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 5)];
    }
  }

  updateAvatar(delta) {
    if (!this.avatar || this.avatarPath.length < 2) return;
    const pos = this.avatar.position;
    const target = this.avatarPath[1];
    const direction = new THREE.Vector3().subVectors(target, pos);
    if (direction.length() < 0.1) {
      this.avatarPath.reverse();
    }
    direction.normalize();
    pos.add(direction.multiplyScalar(this.avatarSpeed * delta * 30));
    this.avatar.position.copy(pos);
  }

  setupDragControls() {
    // Only setup if DragControls is loaded
    if (typeof THREE.DragControls === 'undefined') {
      this.dragControls = null;
      return;
    }
    if (this.dragControls) {
      this.dragControls.dispose();
    }
    const objects = this.buildingGroups.filter(g => g.userData.type !== 'park');
    this.dragControls = new THREE.DragControls(objects, this.camera, this.renderer.domElement);
    this.dragControls.enabled = this.buildMode;

    this.dragControls.addEventListener('dragstart', () => {
      this.orbitControls.enabled = false;
    });
    this.dragControls.addEventListener('dragend', (event) => {
      this.orbitControls.enabled = !this.buildMode;
      const group = event.object;
      if (window.onBuildingMoved && group.userData.id) {
        window.onBuildingMoved(group.userData.id, {
          x: group.position.x,
          z: group.position.z
        });
      }
    });
  }

  animate() {
    const delta = this.clock.getDelta();
    this.updateDayNight(delta);
    this.updateAvatar(delta);
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

// ---- Global render function (called from script.js) ----
async function renderCity() {
  const container = document.getElementById('three-container');
  if (!container || !window.userDocRef) return;

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

  const doc = await window.userDocRef.get();
  const data = doc.data() || {};
  const cityBuildings = data.cityBuildings || { park: 0, library: 0, office: 0, gallery: 0 };
  const roads = data.roads || [];
  const habits = window.habits || [];
  const learning = habits.filter(h => h.category === 'learning').length;
  const health = habits.filter(h => h.category === 'health').length;
  const avatarApp = { hat: learning >= 3, bodyColor: health >= 3 ? 0xFF5722 : 0x2196F3 };

  if (window.parkCount) window.parkCount.textContent = cityBuildings.park || 0;
  if (window.libraryCount) window.libraryCount.textContent = cityBuildings.library || 0;
  if (window.officeCount) window.officeCount.textContent = cityBuildings.office || 0;
  if (window.galleryCount) window.galleryCount.textContent = cityBuildings.gallery || 0;

  threeCity.updateFromData(cityBuildings, roads, avatarApp);
}

window.onBuildingMoved = async (buildingId, newPos) => {
  // Connected to script.js
};