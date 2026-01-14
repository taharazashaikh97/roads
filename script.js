import * as THREE from 'three';

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe9ff);
scene.fog = new THREE.FogExp2(0xcfe9ff, 0.002);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 25, 40);
camera.lookAt(0, 10, -50);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

/* ================= LIGHTS ================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 100, 50);
scene.add(sun);

/* ================= TERRAIN SETTINGS ================= */
const TILE_SIZE = 200;
const SEGMENTS = 100;
const TILE_COUNT = 5; // number of tiles forward

const tiles = [];
let cameraZ = 0;

/* ================= HEIGHT FUNCTION ================= */
function getHeight(x, z) {
  return (
    Math.sin(x * 0.02) * 8 +
    Math.cos(z * 0.02) * 8 +
    Math.sin((x + z) * 0.01) * 5
  );
}

/* ================= CREATE TILE ================= */
function createTile(zIndex) {
  const geo = new THREE.PlaneGeometry(
    TILE_SIZE,
    TILE_SIZE,
    SEGMENTS,
    SEGMENTS
  );
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i) + zIndex * TILE_SIZE;

    let y = getHeight(x, z);

    // 🛣️ ROAD CARVING (flat center)
    const roadWidth = 12;
    const distFromCenter = Math.abs(x);

    if (distFromCenter < roadWidth) {
      const falloff = distFromCenter / roadWidth;
      y *= falloff * falloff; // smooth flatten
    }

    pos.setY(i, y);
  }

  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x6fa86f,
    roughness: 1
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = zIndex * TILE_SIZE;

  scene.add(mesh);
  tiles.push(mesh);
}

/* ================= INIT TILES ================= */
for (let i = 0; i < TILE_COUNT; i++) {
  createTile(-i);
}

/* ================= ANIMATE ================= */
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.5;
  cameraZ -= speed;
  camera.position.z = cameraZ;
  camera.lookAt(0, 8, cameraZ - 40);

  // recycle tiles
  for (let tile of tiles) {
    if (tile.position.z - cameraZ > TILE_SIZE) {
      tile.position.z -= TILE_SIZE * TILE_COUNT;
    }
  }

  renderer.render(scene, camera);
}
animate();

/* ================= RESIZE ================= */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
