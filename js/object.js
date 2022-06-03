function initWorld() {
    world = new CANNON.World();
    world.gravity.set(0, -25, 0);
}

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        // alpha:true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    control = new THREE.OrbitControls(camera, renderer.domElement);

    camera.position.set(0, 10, 10);

    lights[0] = new THREE.AmbientLight(0x111111);
    lights[1] = new THREE.SpotLight(0xffffff);
    lights[1].position.set(20, 30, 20);
    lights[1].target.position.set(0, 0, 0);
    lights[1].castShadow = true;
    lights[1].shadow.mapSize = new THREE.Vector2(2048, 2048);
    scene.add(lights[0], lights[1]);

    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;

    scene.fog = new THREE.FogExp2(0x000000, 0.01);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
}

function render() {
    requestAnimationFrame(render);

    world.step(timestep);

    for (var i = objAry.length - 1; i >= 0; i--) {
        objAry[i].update();
    }

    control.update();

    renderer.render(scene, camera);
}

function Obj3d(obj, shape, geometry) {
    this.shape = shape;
    this.geometry = geometry;
    this.body = new CANNON.Body({
        position: obj.position || { x: 0, y: 0, z: 0 },
        mass: obj.mass || 0,
        shape: this.shape
    });
    this.mesh = new THREE.Mesh(this.geometry, obj.material || new THREE.MeshPhongMaterial({ side: THREE.DoubleSide }));
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    world.add(this.body);
    if (obj.parent) obj.parent.add(this.mesh);
    else scene.add(this.mesh);
    this.update = function() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
    this.update();
    if (obj.mass) objAry.push(this);
    if (obj.name) this.mesh.name = obj.name;
}

function Sphere(obj) {
    this.shape = new CANNON.Sphere(obj.radius);
    this.geometry = new THREE.SphereGeometry(obj.radius, 64, 64);
    Obj3d.call(this, obj, this.shape, this.geometry);
}

function Box(obj) {
    this.shape = new CANNON.Box(new CANNON.Vec3(obj.size.x / 2, obj.size.y / 2, obj.size.z / 2));
    this.geometry = new THREE.BoxGeometry(obj.size.x, obj.size.y, obj.size.z);
    Obj3d.call(this, obj, this.shape, this.geometry);
};

// why? only use when .prototype was called
// Floor.prototype = Object.create(Plane.prototype);
// Floor.prototype.constructor = Floor;