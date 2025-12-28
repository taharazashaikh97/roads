import * as THREE from 'three';

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(6, 5, 10);
camera.lookAt(0, 1, 0);

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

/* LIGHTS */
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(10, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

/* GROUND (LIGHT GREEN LAND) */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({
    color: 0x9bd37a,
    roughness: 1
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* REALISTIC CAR (SIMPLE BUT GOOD SHAPE) */
const car = new THREE.Group();

/* BODY */
const body = new THREE.Mesh(
  new THREE.BoxGeometry(2.4, 0.6, 5),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.6,
    roughness: 0.3
  })
);
body.castShadow = true;
car.add(body);

/* CABIN */
const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 0.7, 2.4),
  new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.2
  })
);
cabin.position.y = 0.65;
cabin.position.z = -0.2;
cabin.castShadow = true;
car.add(cabin);

/* WHEELS */
const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 32);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

[
  [ 1.2,  1.7],
  [-1.2,  1.7],
  [ 1.2, -1.7],
  [-1.2, -1.7]
].forEach(pos => {
  const wheel = new THREE.Mesh(wheelGeo, wheelMat);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(pos[0], -0.35, pos[1]);
  wheel.castShadow = true;
  car.add(wheel);
});

car.position.y = 0.8;
scene.add(car);

/* RENDER LOOP */
function animate() {
  requestAnimationFrame(animate);
  car.rotation.y += 0.002; // slow realism spin
  renderer.render(scene, camera);
}
animate();

/* RESIZE */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
