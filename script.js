import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 6, 12);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
  new THREE.MeshStandardMaterial({
    color: 0x9bd37a,
    roughness: 1
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ================= CONTROLS ================= */
const keys = { w: 0, a: 0, s: 0, d: 0 };
let speed = 0;
let yaw = 0;

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (keys[k] !== undefined) keys[k] = 1;
});

window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (keys[k] !== undefined) keys[k] = 0;
});

/* ================= LOAD CAR ================= */
const loader = new GLTFLoader();
let body = new THREE.Group();
scene.add(body);

loader.load(
  './car.glb',
  gltf => {
    const car = gltf.scene;

    car.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    /* SCALE FOR LARGE REALISTIC CAR MODELS */
    car.scale.set(0.015, 0.015, 0.015);
    car.rotation.y = Math.PI;
    car.position.y = 0.02;

    body.add(car);
  },
  undefined,
  err => {
    console.error('CAR LOAD ERROR:', err);
  }
);

/* ================= UPDATE ================= */
function update(dt) {
  /* ACCELERATION */
  if (keys.w) speed += 20 * dt;
  if (keys.s) speed -= 24 * dt;

  /* FRICTION */
  speed *= 0.97;
  speed = THREE.MathUtils.clamp(speed, -20, 40);

  /* STEERING */
  if (Math.abs(speed) > 0.2) {
    if (keys.a) yaw += 1.5 * dt;
    if (keys.d) yaw -= 1.5 * dt;
  }

  /* MOVE */
  body.rotation.y = yaw;
  body.position.x -= Math.sin(yaw) * speed * dt;
  body.position.z -= Math.cos(yaw) * speed * dt;

  /* CAMERA FOLLOW */
  const camTarget = body.position.clone().add(
    new THREE.Vector3(
      Math.sin(yaw) * 12,
      6,
      Math.cos(yaw) * 12
    )
  );

  camera.position.lerp(camTarget, 0.08);
  camera.lookAt(
    body.position.x,
    body.position.y + 2,
    body.position.z
  );
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
animate();

/* ================= RESIZE ================= */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
