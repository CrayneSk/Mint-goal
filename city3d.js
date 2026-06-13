// city3d.js
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

  if (window.parkCount) parkCount.textContent = city.park || 0;
  if (window.libraryCount) libraryCount.textContent = city.library || 0;
  if (window.officeCount) officeCount.textContent = city.office || 0;
  if (window.galleryCount) galleryCount.textContent = city.gallery || 0;

  threeCity.updateFromData(city);
}