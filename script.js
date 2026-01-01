import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* CAMERA */
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 1, 0);

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
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

/* GROUND */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshStandardMaterial({
    color: 0x9bd37a,
    roughness: 1
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* LOAD SPORTS CAR */
const loader = new GLTFLoader();

loader.load(
  './car.glb',
  (gltf) => {
    const car = gltf.scene;

    car.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    // Correct scale for ToyCar model
    car.scale.set(1.8, 1.8, 1.8);
    car.position.set(0, 0.01, 0);
    car.rotation.y = Math.PI;

    scene.add(car);

    // Gentle rotation (presentation style)
    renderer.setAnimationLoop(() => {
      car.rotation.y += 0.003;
      renderer.render(scene, camera);
    });
  },
  undefined,
  (err) => {
    console.error('Failed to load car.glb', err);
  }
);

/* RESIZE */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
