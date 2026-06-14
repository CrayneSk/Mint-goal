const AvatarSystem = {
  elements: {},
  scene: null,
  camera: null,
  renderer: null,
  animationId: null,

  init(els) {
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

    // Ground
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshStandardMaterial({ color: 0x333344 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    this.scene.add(floor);

    // Head (orange sphere)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xffaa00 })
    );
    head.position.y = 1.2;
    this.scene.add(head);

    // Body (blue box)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.8, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x3399ff })
    );
    body.position.y = 0.5;
    this.scene.add(body);

    // Start animation
    this.animate();
  },

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  },

  updateShowcase(data) {},
  async renderScreen() {},
  renderCosmeticsShop() {},
  incrementStat(category) {},
  celebrate() {}
};