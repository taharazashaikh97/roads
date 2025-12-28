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
const keys = { w:0, a:0, s:0, d:0 };
let speed = 0;
let yaw = 0;

window.addEventListener('keydown', e => {
  if (keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = 1;
});
window.addEventListener('keyup', e => {
  if (keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = 0;
});

/* ================= LOAD CAR ================= */
const loader = new GLTFLoader();
let car, body;

loader.load('./car.glb', gltf => {
  car = gltf.scene;

  car.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  car.scale.set(0.4, 0.4, 0.4);
  car.position.y = 0.01;
  car.rotation.y = Math.PI;

  // Create a parent for suspension effects
  body = new THREE.Group();
  body.add(car);
  scene.add(body);

  animate();
});

/* ================= UPDATE ================= */
function update(dt) {
  if (!body) return;

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

  /* ================= SUSPENSION ================= */
  // pitch (forward/back)
  const pitch = THREE.MathUtils.clamp(-speed * 0.015, -0.25, 0.25);

  // roll (side tilt)
  const roll = THREE.MathUtils.clamp(
    (keys.a - keys.d) * speed * 0.01,
    -0.25,
    0.25
  );

  body.rotation.x = THREE.MathUtils.lerp(body.rotation.x, pitch, 0.1);
  body.rotation.z = THREE.MathUtils.lerp(body.rotation.z, roll, 0.1);

  /* ================= CAMERA FOLLOW ================= */
  const camTarget = body.position.clone().add(
    new THREE.Vector3(
      Math.sin(yaw) * 12,
      6,
      Math.cos(yaw) * 12
    )
  );

  camera.position.lerp(camTarget, 0.08);
  camera.lookAt(body.position.x, body.position.y + 2, body.position.z);
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

