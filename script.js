import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

/* ================= LIGHTS ================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
scene.add(sun);

/* ================= GROUND ================= */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x9bd37a })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ================= CONTROLS ================= */
const keys = { w:false, a:false, s:false, d:false };
window.addEventListener('keydown', e => {
  if (keys[e.key.toLowerCase()] !== undefined)
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', e => {
  if (keys[e.key.toLowerCase()] !== undefined)
    keys[e.key.toLowerCase()] = false;
});

/* ================= PHYSICS ================= */
let speed = 0;
const MAX_SPEED = 0.2;
const ACCEL = 0.01;
const TURN = 0.04;
const FRICTION = 0.95;

/* ================= LOAD CAR ================= */
let car;
const loader = new GLTFLoader();

loader.load('car.glb', gltf => {
  car = gltf.scene;

  car.scale.set(50, 50, 50);
  car.rotation.y = Math.PI;

  const box = new THREE.Box3().setFromObject(car);
  const center = box.getCenter(new THREE.Vector3());
  car.position.sub(center);

  const size = box.getSize(new THREE.Vector3());
  car.position.y += size.y / 2;

  scene.add(car);
});

/* ================= ANIMATE ================= */
function animate() {
  requestAnimationFrame(animate);

  if (car) {
    /* DRIVE */
    if (keys.w) speed += ACCEL;
    if (keys.s) speed -= ACCEL;
    speed *= FRICTION;
    speed = THREE.MathUtils.clamp(speed, -MAX_SPEED, MAX_SPEED);

    if (keys.a) car.rotation.y += TURN * (speed / MAX_SPEED);
    if (keys.d) car.rotation.y -= TURN * (speed / MAX_SPEED);

    car.translateZ(speed);

    /* CAMERA FOLLOW */
    const camOffset = new THREE.Vector3(0, 4, 8).applyMatrix4(car.matrixWorld);
    camera.position.lerp(camOffset, 0.1);
    camera.lookAt(car.position);
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
