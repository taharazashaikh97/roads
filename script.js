import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

window.addEventListener('keydown', e => {
  if (keys[e.key.toLowerCase()] !== undefined) {
    keys[e.key.toLowerCase()] = true;
  }
});

window.addEventListener('keyup', e => {
  if (keys[e.key.toLowerCase()] !== undefined) {
    keys[e.key.toLowerCase()] = false;
  }
});

let speed = 0;
const MAX_SPEED = 0.25;
const ACCEL = 0.01;
const TURN_SPEED = 0.04;
const FRICTION = 0.96;

const camOffset = new THREE.Vector3(0, 4, 8);
const camPos = camOffset.clone().applyMatrix4(car.matrixWorld);
camera.position.lerp(camPos, 0.1);
camera.lookAt(car.position);


/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* CAMERA 
camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);*/

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

/* LIGHTS */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sun = new THREE.DirectionalLight(0xffffff, 1.4);
sun.position.set(10, 20, 10);
sun.castShadow = true;
scene.add(sun);

/* GROUND */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshStandardMaterial({ color: 0x9bd37a })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* CAR */
let car;

loader.load(
  'car.glb',
  (gltf) => {
    car = gltf.scene;

    /* FORCE VISIBILITY */
    car.scale.set(50, 50, 50);   // 🔥 BIG SCALE (IMPORTANT)
    car.position.set(0, 0, 0);

    /* CENTER MODEL */
    const box = new THREE.Box3().setFromObject(car);
    const center = box.getCenter(new THREE.Vector3());
    car.position.sub(center);

    /* MAKE SURE MATERIAL SHOWS */
    car.traverse(obj => {
      if (obj.isMesh) {
        obj.material.side = THREE.DoubleSide;
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    scene.add(car);

    console.log('CAR LOADED ✅');
  },
  undefined,
  (e) => console.error(e)
);


/* ANIMATION LOOP */
function animate() {
  requestAnimationFrame(animate);

  if (car) {
    /* ACCELERATION */
    if (keys.w) speed += ACCEL;
    if (keys.s) speed -= ACCEL;

    speed *= FRICTION;
    speed = THREE.MathUtils.clamp(speed, -MAX_SPEED, MAX_SPEED);

    /* STEERING */
    if (keys.a) car.rotation.y += TURN_SPEED * (speed / MAX_SPEED);
    if (keys.d) car.rotation.y -= TURN_SPEED * (speed / MAX_SPEED);

    /* MOVE FORWARD */
    car.translateZ(speed);
  }

  renderer.render(scene, camera);
}


/* RESIZE */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});


