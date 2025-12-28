import * as THREE from 'three';

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3b4);

/* CAMERA — FIXED */
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 6, 12);   // HIGHER + BACK
camera.lookAt(0, 1, 0);

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

/* LIGHTS */
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(10, 20, 10);
sun.castShadow = true;
scene.add(sun);

/* GROUND */
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

/* DEBUG CUBE (YOU MUST SEE THIS) */
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
cube.position.set(0, 0.5, 0);
scene.add(cube);

/* CAR */
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
  new THREE.MeshStandardMaterial({ color: 0x111111 })
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
].forEach(p => {
  const w = new THREE.Mesh(wheelGeo, wheelMat);
  w.rotation.z = Math.PI / 2;
  w.position.set(p[0], -0.35, p[1]);
  w.castShadow = true;
  car.add(w);
});

car.position.set(0, 0.8, 0);
scene.add(car);

/* LOOP */
function animate() {
  requestAnimationFrame(animate);
  car.rotation.y += 0.005;
  renderer.render(scene, camera);
}
animate();

/* RESIZE */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
