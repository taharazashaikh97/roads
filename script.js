import * as THREE from 'three';
import SimplexNoise from 'https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/dist/esm/simplex-noise.js';

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe9ff);
scene.fog = new THREE.FogExp2(0xcfe9ff, 0.002);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(
  60,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, 40, 80);
camera.lookAt(0, 0, 0);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

/* ================= LIGHTS ================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 100, 50);
scene.add(sun);

/* ================= NOISE ================= */
const noise = new SimplexNoise();

/* ================= TERRAIN ================= */
const SIZE = 600;
const SEGMENTS = 200;

const geometry = new THREE.PlaneGeometry(
  SIZE,
  SIZE,
  SEGMENTS,
  SEGMENTS
);

geometry.rotateX(-Math.PI / 2);

const pos = geometry.attributes.position;

for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i);
  const z = pos.getZ(i);

  const hills =
    noise.noise2D(x * 0.002, z * 0.002) * 25 +
    noise.noise2D(x * 0.01, z * 0.01) * 4;

  pos.setY(i, hills);
}

geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({
  color: 0x6fa86f,
  roughness: 1,
  metalness: 0
});

const terrain = new THREE.Mesh(geometry, material);
scene.add(terrain);

/* ================= ANIMATE ================= */
function animate() {
  requestAnimationFrame(animate);

  // slow cinematic drift
  terrain.rotation.y += 0.00015;

  renderer.render(scene, camera);
}
animate();

/* ================= RESIZE ================= */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});


