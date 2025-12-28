import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(0, 6, 12);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

/* ================= LIGHTS ================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sun = new THREE.DirectionalLight(0xffffff, 1.3);
sun.position.set(10, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

/* ================= GROUND ================= */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0x9bd37a, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ================= CONTROLS ================= */
const keys = { w: 0, a: 0, s: 0, d: 0 };
let speed = 0;
let rotation = 0;

window.addEventListener('keydown', e => {
  if (keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = 1;
});
window.addEventListener('keyup', e => {
  if (keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = 0;
});

/* ================= LOAD CAR ================= */
const loader = new GLTFLoader();
let car;

loader.load(
  './car.glb',
  (gltf) => {
    car = gltf.scene;

    car.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    car.scale.set(0.4, 0.4, 0.4);
    car.position.set(0, 0.01, 0);
    car.rotation.y = Math.PI;

    scene.add(car);
    animate();
  },
  undefined,
  err => console.error(err)
);

/* ================= UPDATE ================= */
function update(dt) {
  if (!car) return;

  // acceleration
  if (keys.w) speed += 18 * dt;
  if (keys.s) speed -= 22 * dt;

  // friction
  speed *= 0.98;
  speed = THREE.MathUtils.clamp(speed, -25, 40);

  // steering
  if (Math.abs(speed) > 0.1) {
    if (keys.a) rotation += 1.6 * dt;
    if (keys.d) rotation -= 1.6 * dt;
  }

  car.rotation.y = rotation;
  car.position.x -= Math.sin(rotation) * speed * dt;
  car.position.z -= Math.cos(rotation) * speed * dt;

  /* CAMERA FOLLOW */
  const camTarget = car.position.clone().add(
    new THREE.Vector3(
      Math.sin(rotation) * 12,
      6,
      Math.cos(rotation) * 12
    )
  );

  camera.position.lerp(camTarget, 0.08);
  camera.lookAt(car.position.x, car.position.y + 2, car.position.z);
}

/* ================= LOOP ================= */
let last = performance.now();
function animate(now = performance.now()) {
  const dt = (now - last) / 1000;
  last = now;

  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

/* ================= RESIZE ================= */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
