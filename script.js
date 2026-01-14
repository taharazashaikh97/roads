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
camera.position.set(0, 40, 80);
camera.lookAt(0, 0, 0);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

/* ================= LIGHT ================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 100, 50);
scene.add(sun);

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

  // Smooth rolling hills (no noise lib)
  const y =
    Math.sin(x * 0.02) * 10 +
    Math.cos(z * 0.02) * 10 +
    Math.sin((x + z) * 0.01) * 6;

  pos.setY(i, y);
}

geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({
  color: 0x6fa86f,
  roughness: 1
});

const terrain = new THREE.Mesh(geometry, material);
scene.add(terrain);

/* ================= ANIMATE ================= */
function animate() {
  requestAnimationFrame(animate);

  // subtle motion for realism
  terrain.rotation.y += 0.00015;

  renderer.render(scene, camera);
}
animate();

/* ================= RESIZE ================= */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
