var scene = null,
    camera = null,
    renderer = null,
    controls = null,
    clock = null;

var modPlayer = null;

function mySelecyPlayer() {
    window.onresize = onWindowResize;
    initScene();
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function initScene() {
    initBasicElements(); // Scene, Camera and Render

}

function initBasicElements() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("screen3D_model")
    });
    clock = new THREE.Clock();

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(3, 5, 5);
    controls.update();


    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    const gridHelper = new THREE.GridHelper(1000, 1000);
    scene.add(gridHelper);

    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 10, 1);
    scene.add(light);

    renderer.setSize(window.innerWidth, window.innerHeight); ///
    document.body.appendChild(renderer.domElement);
}


function LoadGLTF(path_gltf, gltf_arc) {

    // Instantiate a loader
    const loader = new THREE.GLTFLoader();

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath(path_gltf);
    loader.setDRACOLoader(dracoLoader);

    // Load a glTF resource
    loader.load(
        // resource URL
        gltf_arc,
        // called when the resource is loaded
        function (gltf) {

            pato = gltf.scene;
            modPlayer = pato;
            scene.add(gltf.scene);
            pato.position.set(0, 0, 0);
        
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object

        },
        // called while loading is progressing
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    );


}

function createFistModel(generalPath, pathMtl, pathObj, show) {

    if (show == true) {
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setTexturePath(generalPath);
        mtlLoader.setPath(generalPath);
        mtlLoader.load(pathMtl, function (materials) {

            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath(generalPath);
            objLoader.load(pathObj, function (object) {

                scene.add(object);
                object.scale.set(0.2, 0.2, 0.2);

                object.position.y = 0;
                object.position.x = 0;

                if (pathMtl == "reno.mtl") {
                    object.scale.set(0.3, 0.3, 0.3);

                }
                if (pathMtl == "luigi.mtl") {
                    object.scale.set(0.03, 0.03, 0.03);

                }

                modPlayer = object; ///////
                scene.add(object);

            });

        });
    }
}

function Elegir_Personaje(personaje) {

    switch (personaje) {
        case 'leñador':
            scene.remove(modPlayer);

            createFistModel("./modelos/personaje/", "leñador.mtl", "leñador.obj", true);
            break;
        case 'reno':
            scene.remove(modPlayer);

            createFistModel("./modelos/personaje/", "reno.mtl", "reno.obj", true);
            break;
        case 'luigi':
            scene.remove(modPlayer);

            createFistModel("./modelos/personaje/", "luigi.mtl", "luigi.obj", true);
            break;
        case 'isla':
            scene.remove(modPlayer);

            createFistModel("./modelos/personaje/", "littleisle.mtl", "littleisle.obj", true);
            break;
        case 'pato':
            scene.remove(modPlayer);

            LoadGLTF('./modelos/GLTFs/Duck/', './modelos/GLTFs/Duck/Duck.gltf');
            break;

        default:
    }

}


function archivos_modelo() {

    const output = document.querySelector('.output');
    const fileInput = document.querySelector("#myfiles");


    fileInput.addEventListener("change", () => {
        for (const file of fileInput.files) {
            output.innerText += `\n${file.name}`;
        }
    });


}

function extractFilename(path) {
    if (path.substr(0, 12) == "C:\\fakepath\\")
        return path.substr(12); // modern browser
    var x;
    x = path.lastIndexOf('/');
    if (x >= 0) // Unix-based path
        return path.substr(x + 1);
    x = path.lastIndexOf('\\');
    if (x >= 0) // Windows-based path
        return path.substr(x + 1);
    return path; // just the filename
}


function cargarmodelo(){

    let ruta1 = document.getElementById("myfiles").files[0].name;
    let ruta2 = document.getElementById("myfiles").files[1].name;

    scene.remove(modPlayer);
    createFistModel("./modelos/personaje/", ruta1, ruta2, true);

   
}


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

}

function Rotar_objeto() {

    if (modPlayer == null) {
        alert("ATENCIÓN: no se ha cargado ningun objeto");
    } else {
        var rotar_x = document.getElementById("rotax").value;
        var rotar_y = document.getElementById("rotay").value;
        var rotar_z = document.getElementById("rotaz").value;

        modPlayer.rotation.x = rotar_x;
        modPlayer.rotation.y = rotar_y;
        modPlayer.rotation.z = rotar_z;
    }
}

function Escalar_objeto() {

    if (modPlayer == null) {
        alert("ATENCIÓN: no se ha cargado ningun objeto");
    } else {
        var escal_x = document.getElementById("escalx").value;
        var escal_y = document.getElementById("escaly").value;
        var escal_z = document.getElementById("escalz").value;

        modPlayer.scale.x = escal_x;
        modPlayer.scale.y = escal_y;
        modPlayer.scale.z = escal_z;
    }
}

function trasladar_objeto() {

    if (modPlayer == null) {
        alert("ATENCIÓN: no se ha cargado ningun objeto");
    } else {
        var trasla_x = document.getElementById("traslax").value;
        var trasla_y = document.getElementById("traslay").value;
        var trasla_z = document.getElementById("traslaz").value;

        modPlayer.position.x = trasla_x;
        modPlayer.position.y = trasla_y;
        modPlayer.position.z = trasla_z;
    }
}