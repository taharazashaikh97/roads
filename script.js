import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
const MAX_SPEED = 0.25;
const ACCEL = 0.01;
const TURN_SPEED = 0.04;
const FRICTION = 0.96;

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

/* ================= LIGHTS ================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sun = new THREE.DirectionalLight(0xffffff, 1.4);
sun.position.set(10, 20, 10);
sun.castShadow = true;
scene.add(sun);

/* ================= GROUND ================= */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshStandardMaterial({ color: 0x9bd37a })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ================= CAR ================= */
let car;
const loader = new GLTFLoader();

loader.load(
  'car.glb',
  gltf => {
    car = gltf.scene;

    car.scale.set(50, 50, 50);
    car.position.set(0, 0, 0);
    car.rotation.y = Math.PI;

    // center model
    const box = new THREE.Box3().setFromObject(car);
    const center = box.getCenter(new THREE.Vector3());
    car.position.sub(center);

    car.traverse(o => {
      if (o.isMesh) {
        o.castShadow = o.receiveShadow = true;
        o.material.side = THREE.DoubleSide;
      }
    });

    scene.add(car);
    console.log('CAR LOADED ✅');
  }
);

/* ================= ANIMATE ================= */
function animate() {
  requestAnimationFrame(animate);

  if (car) {
    // acceleration
    if (keys.w) speed += ACCEL;
    if (keys.s) speed -= ACCEL;

    speed *= FRICTION;
    speed = THREE.MathUtils.clamp(speed, -MAX_SPEED, MAX_SPEED);

    // steering
    if (keys.a) car.rotation.y += TURN_SPEED * (speed / MAX_SPEED);
    if (keys.d) car.rotation.y -= TURN_SPEED * (speed / MAX_SPEED);

    // move
    car.translateZ(speed);

    // follow camera
    const camOffset = new THREE.Vector3(0, 4, 8);
    const camPos = camOffset.applyMatrix4(car.matrixWorld);
    camera.position.lerp(camPos, 0.1);
    camera.lookAt(car.position);
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
