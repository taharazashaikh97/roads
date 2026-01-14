import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe9ff);
scene.fog = new THREE.FogExp2(0xcfe9ff, 0.0025);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(
  60,
  innerWidth / innerHeight,
  0.1,
  1500
);
camera.position.set(0, 8, 20);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

/* ================= LIGHTING ================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.55));

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(100, 200, 100);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
scene.add(sun);

/* ================= TERRAIN SETTINGS ================= */
const TILE_SIZE = 220;
const SEGMENTS = 100;
const TILE_COUNT = 6;
const ROAD_WIDTH = 12;

const tiles = [];
let cameraZ = 0;

/* ================= ROAD CURVE FUNCTION ================= */
function roadCurve(z) {
  return Math.sin(z * 0.004) * 20; // smooth winding road
}

/* ================= CREATE TERRAIN TILE ================= */
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

    pos.setY(0); // flat terrain

    // color
    let color = new THREE.Color();
    if (dist < ROAD_WIDTH) color.set(0x555555); // road
    else if (dist < ROAD_WIDTH + 6) color.set(0x7aa46a); // edge
    else color.set(0x6fa86f); // grass
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
  mesh.receiveShadow = true;

  scene.add(mesh);
  spawnTrees(mesh, index);

  tiles.push(mesh);
}

/* ================= TREES ================= */
function spawnTrees(tile, index) {
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x2f5d2f });
  const treeGeo = new THREE.ConeGeometry(1.5, 6, 6);

  for (let i = 0; i < 25; i++) {
    const z = index * TILE_SIZE + Math.random() * TILE_SIZE;
    const curveX = roadCurve(z);
    const side = Math.random() > 0.5 ? 1 : -1;

    const x = curveX + side * (ROAD_WIDTH + 10 + Math.random() * 40);
    const y = 0;

    const tree = new THREE.Mesh(treeGeo, treeMat);
    tree.position.set(x, y + 3, z);
    tree.castShadow = true;
    scene.add(tree);
  }
}

/* ================= INIT TERRAIN ================= */
for (let i = 0; i < TILE_COUNT; i++) {
  createTile(-i);
}

/* ================= CAR ================= */
const loader = new GLTFLoader();
let car;

loader.load(
  'car.glb',
  (gltf) => {
    car = gltf.scene;
    car.scale.set(1.5, 1.5, 1.5);
    car.position.set(0, 0, 0);
    car.rotation.y = Math.PI;
    car.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    scene.add(car);
  },
  undefined,
  (err) => console.error(err)
);

/* ================= CONTROLS ================= */
const keys = { a: false, d: false };
window.addEventListener('keydown', e => { if(keys[e.key.toLowerCase()]!==undefined) keys[e.key.toLowerCase()]=true; });
window.addEventListener('keyup', e => { if(keys[e.key.toLowerCase()]!==undefined) keys[e.key.toLowerCase()]=false; });

let carZ = 0; // car moves forward
let carSpeed = 0.8;

/* ================= ANIMATE ================= */
function animate() {
  requestAnimationFrame(animate);

  carZ += carSpeed; // forward motion
  cameraZ -= 0.6;  // terrain scroll

  // recycle terrain tiles
  for (let tile of tiles) {
    if (tile.position.z - cameraZ > TILE_SIZE) {
      tile.position.z -= TILE_SIZE * TILE_COUNT;
    }
  }

  if (car) {
    // car follows road curve
    const roadX = roadCurve(carZ);
    car.position.x = roadX;
    car.position.z = carZ;

    // small steering with keys
    if (keys.a) car.position.x -= 0.5;
    if (keys.d) car.position.x += 0.5;

    // car rotation aligns with road slope
    const roadAhead = roadCurve(carZ + 5);
    const dx = roadAhead - roadX;
    car.rotation.y = Math.atan2(dx, 5);

    // camera follow
    const camOffset = new THREE.Vector3(0, 6, 18);
    const camPos = camOffset.applyMatrix4(car.matrixWorld);
    camera.position.lerp(camPos, 0.1);
    camera.lookAt(car.position.x, car.position.y + 2, car.position.z);
  }

  renderer.render(scene, camera);
}
animate();

/* ================= RESIZE ================= */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

