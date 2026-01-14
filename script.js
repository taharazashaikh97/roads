import * as THREE from 'three';

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe9ff);
scene.fog = new THREE.FogExp2(0xcfe9ff, 0.002);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1500);
camera.position.set(0, 25, 40);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

/* ================= LIGHTING ================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(100, 200, 100);
scene.add(sun);

/* ================= TERRAIN SETTINGS ================= */
const TILE_SIZE = 220;
const SEGMENTS = 120;
const TILE_COUNT = 6;
const ROAD_WIDTH = 12;

const tiles = [];
let cameraZ = 0;

/* ================= HEIGHT FUNCTION ================= */
function getHeight(x, z) {
  // Layered waves for natural hills
  const largeHills = Math.sin(x * 0.01) * 12 + Math.cos(z * 0.01) * 12;
  const mediumHills = Math.sin((x + z) * 0.015) * 6;
  const smallBumps = Math.sin(x * 0.08) * 2 + Math.cos(z * 0.08) * 2;

  return largeHills + mediumHills + smallBumps;
}

/* ================= ROAD CURVE ================= */
function roadCurve(z) {
  return Math.sin(z * 0.004) * 20;
}

/* ================= CREATE TILE ================= */
function createTile(index) {
  const geo = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, SEGMENTS, SEGMENTS);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = [];

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i) + index * TILE_SIZE;

    const curveX = roadCurve(z);
    const dist = Math.abs(x - curveX);

    let y = getHeight(x, z);

    // road flattening
    if (dist < ROAD_WIDTH) y *= (dist / ROAD_WIDTH) ** 2;

    pos.setY(i, y);

    // height-based color
    let color = new THREE.Color();
    if (dist < ROAD_WIDTH) color.set(0x555555); // road
    else if (y < 2) color.set(0x4f7f38);         // low grass
    else color.set(0x7fbf6a);                     // high grass

    colors.push(color.r, color.g, color.b);
  }

  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = index * TILE_SIZE;
  scene.add(mesh);

  spawnTrees(mesh, index);

  tiles.push(mesh);
}

/* ================= TREES ================= */
function spawnTrees(tile, index) {
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x2f5d2f });
  const treeGeo = new THREE.ConeGeometry(1.5, 6, 6);

  for (let i = 0; i < 20; i++) {
    const z = index * TILE_SIZE + Math.random() * TILE_SIZE;
    const curveX = roadCurve(z);
    const side = Math.random() > 0.5 ? 1 : -1;

    const x = curveX + side * (ROAD_WIDTH + 10 + Math.random() * 40);
    const y = getHeight(x, z);

    const tree = new THREE.Mesh(treeGeo, treeMat);
    tree.position.set(x, y + 3, z);
    scene.add(tree);
  }
}

/* ================= INIT TILES ================= */
for (let i = 0; i < TILE_COUNT; i++) {
  createTile(-i);
}

/* ================= ANIMATE ================= */
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.6;
  cameraZ -= speed;
  camera.position.z = cameraZ;
  camera.position.x = roadCurve(cameraZ) * 0.6;
  camera.lookAt(roadCurve(cameraZ), 6, cameraZ - 50);

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
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
