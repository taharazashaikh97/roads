import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

/* ================= SETUP ================= */
let scene, camera, renderer, clock;
let car;
let speed = 0;
let rotation = 0;
const keys = { w:0, a:0, s:0, d:0 };

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fd18b);
  scene.fog = new THREE.Fog(0x9fd18b, 50, 1200);

  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 3000);
  camera.position.set(0, 6, 14);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  /* ================= LIGHT ================= */
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(300, 400, 300);
  sun.castShadow = true;
  scene.add(sun);

  /* ================= GROUND ================= */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.MeshStandardMaterial({ color: 0x6fbf73 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ================= LOAD CAR ================= */
  const loader = new GLTFLoader();
  loader.load(
    'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Buggy/glTF-Binary/Buggy.glb',
    gltf => {
      car = gltf.scene;
      car.scale.set(0.8, 0.8, 0.8);
      car.traverse(o => o.castShadow = true);
      car.position.y = 0.5;
      scene.add(car);
    }
  );

  window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = 1);
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = 0);
  window.addEventListener('resize', onResize);
}

/* ================= UPDATE ================= */
function update(dt) {
  if (!car) return;

  speed += (keys.w ? 60 : keys.s ? -80 : -30) * dt;
  speed = THREE.MathUtils.clamp(speed, 0, 140);

  if (speed > 1) {
    rotation += (keys.a ? 1 : keys.d ? -1 : 0) * dt * 0.8;
  }

  car.position.x -= Math.sin(rotation) * speed * dt;
  car.position.z -= Math.cos(rotation) * speed * dt;
  car.rotation.y = rotation;

  camera.position.lerp(
    car.position.clone().add(
      new THREE.Vector3(
        Math.sin(rotation) * 14,
        6,
        Math.cos(rotation) * 14
      )
    ),
    0.08
  );

  camera.lookAt(car.position.x, car.position.y + 2, car.position.z);

  document.getElementById('speed').innerText =
    Math.round(speed).toString().padStart(2, '0');
}

/* ================= LOOP ================= */
function animate() {
  requestAnimationFrame(animate);
  update(clock.getDelta());
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
