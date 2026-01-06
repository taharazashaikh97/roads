import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* CAMERA */
camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

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

  if (car) car.rotation.y += 0.003;

  renderer.render(scene, camera);
}
animate();

/* RESIZE */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

