// 1. Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
scene.fog = new THREE.FogExp2(0x87ceeb, 0.01); // Fog that thickens with distance

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 50, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// 3. Terrain Generation (Hills and Plains)
const worldSize = 200;
const segments = 100;
const geometry = new THREE.PlaneGeometry(worldSize, worldSize, segments, segments);

// Manipulate vertices to create hills/downfalls
const vertices = geometry.attributes.position.array;
for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    
    // Simple mathematical noise for hills (Simplex/Perlin noise is better for realism)
    const elevation = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 5;
    const plains = Math.sin(x * 0.02) * 2; // Subtle variations
    
    vertices[i + 2] = elevation + plains; // Z-axis is height in PlaneGeometry
}
geometry.computeVertexNormals();

const material = new THREE.MeshLambertMaterial({ color: 0x3d9944, flatShading: true });
const terrain = new THREE.Mesh(geometry, material);
terrain.rotation.x = -Math.PI / 2; // Lay it flat
scene.add(terrain);

// 4. The Road
const roadGeo = new THREE.PlaneGeometry(10, worldSize, 1, segments);
const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
const road = new THREE.Mesh(roadGeo, roadMat);

// Offset road slightly above terrain to avoid "Z-fighting" (flickering)
road.position.y = 0.1; 
road.rotation.x = -Math.PI / 2;
scene.add(road);

// 5. Procedural Trees
function createTree(x, z) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2, 0.5), new THREE.MeshLambertMaterial({color: 0x4b3621}));
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(2, 4, 8), new THREE.MeshLambertMaterial({color: 0x005500}));
    leaves.position.y = 3;
    group.add(trunk, leaves);
    group.position.set(x, 1, z);
    scene.add(group);
}

// Add trees randomly (avoiding the road)
for(let i = 0; i < 50; i++) {
    let x = (Math.random() - 0.5) * worldSize;
    let z = (Math.random() - 0.5) * worldSize;
    if (Math.abs(x) > 7) createTree(x, z); // Keep road clear
}

camera.position.set(0, 10, 50);
camera.lookAt(0, 0, 0);

// 6. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
