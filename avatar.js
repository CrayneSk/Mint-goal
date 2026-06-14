// avatar.js
const AvatarSystem = {
  elements: {},
  scene: null,
  camera: null,
  renderer: null,
  character: null,
  isCelebrating: false,
  animationId: null,
  initialized: false,

  init(els) {
    if (this.initialized) return;
    this.elements = els;
    const container = document.getElementById('avatar3DContainer');
    if (!container) return;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 1.5, 4);
    this.camera.lookAt(0, 1, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 2, 2);
    this.scene.add(dirLight);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshStandardMaterial({ color: 0x222233 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    this.scene.add(floor);

    // Start animation
    this.animate();
    this.initialized = true;
  },

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
    // Simple idle bounce
    if (this.character && !this.isCelebrating) {
      this.character.position.y = Math.sin(Date.now() * 0.005) * 0.02;
    }
  },

  // buildCharacter, createHatMesh, etc. will be added later once the basic scene works.
  buildCharacter(stage, equipped) { /* full 3D character code */ },
  celebrate() { /* jump animation */ },
  updateShowcase(data) { /* update text stats */ },
  async renderScreen() { /* fetch Firestore data, build character, render cosmetics */ }
};