import * as THREE from 'three';

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(0, 6, 10);
camera.lookAt(0, 0, 0);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

/* ================= LIGHTS ================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.9));

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(50, 100, 50);
scene.add(sun);

/* ================= ENDLESS GROUND ================= */
const TILE_SIZE = 200;
const GRID_RADIUS = 2; // how many tiles around camera

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x9bd37a
});

const tiles = [];

for (let x = -GRID_RADIUS; x <= GRID_RADIUS; x++) {
  for (let z = -GRID_RADIUS; z <= GRID_RADIUS; z++) {
    const tile = new THREE.Mesh(
      new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE),
      groundMaterial
    );
    tile.rotation.x = -Math.PI / 2;
    tile.position.set(x * TILE_SIZE, 0, z * TILE_SIZE);
    scene.add(tile);
    tiles.push(tile);
  }
}

/* ================= ANIMATE ================= */
let cameraSpeed = 0.05;

function animate() {
  requestAnimationFrame(animate);

  // move camera forward
  camera.position.z -= cameraSpeed;

  // reposition tiles to simulate endless plane
  tiles.forEach(tile => {
    const dx = tile.position.x - camera.position.x;
    const dz = tile.position.z - camera.position.z;

    if (dx > TILE_SIZE * GRID_RADIUS) tile.position.x -= TILE_SIZE * (GRID_RADIUS * 2 + 1);
    if (dx < -TILE_SIZE * GRID_RADIUS) tile.position.x += TILE_SIZE * (GRID_RADIUS * 2 + 1);
    if (dz > TILE_SIZE * GRID_RADIUS) tile.position.z -= TILE_SIZE * (GRID_RADIUS * 2 + 1);
    if (dz < -TILE_SIZE * GRID_RADIUS) tile.position.z += TILE_SIZE * (GRID_RADIUS * 2 + 1);
  });

  renderer.render(scene, camera);
}
animate();

/* ================= RESIZE ================= */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
