// ----------------------------
// Inicialización de Variables:
// ----------------------------
var scene = null,
  camera = null,
  renderer = null,
  controls = null,
  clock = null;

var sound1 = null,
  countPoints = null,
  modelLoad = null,
  light = null,
  figuresGeo = [];

var MovingCube = null,
  collidableMeshList = [],
  lives = 3,
  numberToCreate = 5;

var color = new THREE.Color();

var scale = 1;
var rotSpd = 0.05;
var spd = 0.05;
var input = {
  left: 0,
  right: 0,
  up: 0,
  down: 0
};

var posX = 3;
var posY = 0.5;
var posZ = 1;

var myDuck = null;
// ----------------------------
// Funciones de creación init:
// ----------------------------
function start() {
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
  initSound(); // To generate 3D Audio
  createLight(); // Create light
  initWorld();
  createPlayerMove();
  createFrontera();
  // go2Play(); //comentar este para pasar auto inicio 
  createPickups();
  // generateUI();///panel de controles de la izq

  const size = 12;
  const divisions = 100;

  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  sound1.update(camera);

  movePlayer();
  collisionAnimate();
}

function initBasicElements() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#app")
  });
  clock = new THREE.Clock();

  // controls = new THREE.OrbitControls(camera, renderer.domElement); ////////movimiento libre de camara
  // controls.update(); ///mldc

  scene.background = new THREE.Color(0x0099ff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);


  renderer.setSize(window.innerWidth, window.innerHeight - 4);
  document.body.appendChild(renderer.domElement);

  camera.position.x = 3;
  camera.position.y = 0.5;
  camera.position.z = 1;
}

function initSound() {
  sound1 = new Sound(["./songs/rain.mp3"], 500, scene, { // radio(10)
    debug: true,
    position: {
      x: camera.position.x,
      y: camera.position.y + 10,
      z: camera.position.z
    }
  });
}

function createFistModel(generalPath, pathMtl, pathObj) {
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setTexturePath(generalPath);
  mtlLoader.setPath(generalPath);
  mtlLoader.load(pathMtl, function (materials) {

    materials.preload();

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath(generalPath);
    objLoader.load(pathObj, function (object) {

      modelLoad = object;
      figuresGeo.push(modelLoad);
      scene.add(object);
      object.scale.set(0.1, 0.1, 0.1);

      object.position.y = 0;
      object.position.x = 0;

    });

  });
}

function createDucks(generalPath, pathFile) {
  // Instantiate a loader
  const loader = new THREE.GLTFLoader();

  // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath(generalPath); //'/examples/js/libs/draco/'
  loader.setDRACOLoader(dracoLoader);

  // Load a glTF resource
  loader.load(
    // resource URL
    pathFile, //'models/gltf/duck/duck.gltf'
    // called when the resource is loaded
    function (gltf) {

      scene.add(gltf.scene);

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object

      myDuck = gltf.scene;
      (gltf.scene).scale.set(0.3, 0.3, 0.3);
      (gltf.scene).position.set(Math.floor(Math.random() * 12), 0, Math.floor(Math.random() * 12));
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

function createLight() {
  var light2 = new THREE.AmbientLight(0xffffff);
  light2.position.set(10, 10, 10);
  scene.add(light2);
  light = new THREE.DirectionalLight(0xffffff, 0, 1000);
  scene.add(light);
}

function initWorld() {
  // Create Island
  createFistModel("./modelos/island/", "littleisle.mtl", "littleisle.obj");

  // Floor / Water
  var floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);
  floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  var floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x2825FF
  });
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  scene.add(floor);
}
// ----------------------------------
// Función Para mover al jugador:
// ----------------------------------
function movePlayer() {
  if (input.right == 1) {
    camera.rotation.y -= rotSpd;
    MovingCube.rotation.y -= rotSpd;
  }
  if (input.left == 1) {
    camera.rotation.y += rotSpd;
    MovingCube.rotation.y += rotSpd;
  }

  if (input.up == 1) {
    camera.position.z -= Math.cos(camera.rotation.y) * spd;
    camera.position.x -= Math.sin(camera.rotation.y) * spd;

    MovingCube.position.z -= Math.cos(camera.rotation.y) * spd;
    MovingCube.position.x -= Math.sin(camera.rotation.y) * spd;
  }
  if (input.down == 1) {
    camera.position.z += Math.cos(camera.rotation.y) * spd;
    camera.position.x += Math.sin(camera.rotation.y) * spd;

    MovingCube.position.z += Math.cos(camera.rotation.y) * spd;
    MovingCube.position.x += Math.sin(camera.rotation.y) * spd;
  }
}

window.addEventListener('keydown', function (e) {
  switch (e.keyCode) {
    case 68:
      input.right = 1;
      break;
    case 65:
      input.left = 1;
      break;
    case 87:
      input.up = 1;
      break;
    case 83:
      input.down = 1;
      break;
    case 27:
      document.getElementById("blocker").style.display = 'block';
      break;
  }
});


window.addEventListener('keyup', function (e) {
  switch (e.keyCode) {
    case 68:
      input.right = 0;
      break;
    case 65:
      input.left = 0;
      break;
    case 87:
      input.up = 0;
      break;
    case 83:
      input.down = 0;
      break;
  }
});
// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function go2Play() {
  document.getElementById('blocker').style.display = 'none';
  document.getElementById('cointainerOthers').style.display = 'block';
  playAudio(x);
  initialiseTimer();
}

function initialiseTimer() {
  var sec = 0;

  function pad(val) {
    return val > 9 ? val : "0" + val;
  }

  setInterval(function () {
    document.getElementById("seconds").innerHTML = String(pad(++sec % 60));
    document.getElementById("minutes").innerHTML = String(pad(parseInt(sec / 60, 10)));
  }, 1000);
}

function showInfoCreator() {
  if (document.getElementById("myNameInfo").style.display == "none")
    document.getElementById("myNameInfo").style.display = "block";
  else
    document.getElementById("myNameInfo").style.display = "none";

}
// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function createPlayerMove() {
  var cubeGeometry = new THREE.CubeGeometry(1, 1, 1, 5, 5, 5);
  var wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xfc5faf,
    wireframe: true,
    transparent: false, //true
    opacity: 0.0
  });
  MovingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
  MovingCube.position.set(camera.position.x, camera.position.y, camera.position.z);
  scene.add(MovingCube);
}

function createFrontera() {
  var cubeGeometry = new THREE.CubeGeometry(12, 5, 12, 1, 1, 1);
  var wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: true,
    transparent: true,
    opacity: 0.0
  });
  worldWalls = new THREE.Mesh(cubeGeometry, wireMaterial);
  worldWalls.position.set(0, 0, 0);
  scene.add(worldWalls);
  collidableMeshList.push(worldWalls);
}

function generateUI() {
  var gui = new dat.GUI({
    width: 320
  });
  var param = {
    numPatos: 0,
    atacar: false
  };

  var numPatos = gui.add(param, 'numPatos').min(0).max(10).step(1).name("Numero de patos");
  var atacar = gui.add(param, 'atacar');

  numPatos.onChange(function (num) {
    // Creation Ducks
    createDucks("./modelos/other/", "./modelos/other/Duck.gltf");
  });

  atacar.onChange(function (condition) {
    if (condition == true) {
      myDuck.scale.set(0.9, 0.9, 0.9);
    }
  });

}

function collisionAnimate() {

  var originPoint = MovingCube.position.clone();

  for (var vertexIndex = 0; vertexIndex < MovingCube.geometry.vertices.length; vertexIndex++) {
    var localVertex = MovingCube.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(MovingCube.matrix);
    var directionVector = globalVertex.sub(MovingCube.position);

    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(collidableMeshList);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {

      console.log('toco, '+ JSON.stringify(collisionResults[0].object.name));
      addPoints(collisionResults[0].object.name);
    
    //   document.getElementById("lives").innerHTML = lives; //'toco, '+ JSON.stringify(collisionResults[0].object.name);//points;
    //   camera.position.set(posX, posY, posZ);
    //   MovingCube.position.set(posX, posY, posZ);
    //   lives = lives - 1;
    //   if (lives == 0) {
    //     document.getElementById("lost").style.display = "block"; /////////////cambiar lost a win para probar pantalla de ganador
    //     document.getElementById("cointainerOthers").style.display = "none";
    //     pauseAudio(x);
    //     playAudio(y);
    //   }
    // } else {
    //   document.getElementById("lives").innerHTML = lives; // 'no toco';  
    }
  }
}

function addPoints(myValue){

  for (t=0; t<collidableMeshList.length; t++){
    if(collidableMeshList[t].name==myValue){
      console.log("destru suma");
      collidableMeshList[t].visible = false;
      collidableMeshList[t].shift();
    }
  }
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


function createMultiplyPick(factor2Create){
  var posIni =0;
  for(k=0; k<factor2Create ; k++){
    createPickup(posIni);
    posIni += 2;
  }
}

function createPickups(pos2Asig) {
  const geometry = new THREE.BoxBufferGeometry( 0.5, 0.5, 0.5 );

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('./img/textura caja.jpg');

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide
  });

  mesh = new THREE.Mesh (geometry,material);
  randomIndentify = Math.floor(Math.random()*101);
  mesh.name="modelToPick"+randomIndentify;
  mesh.id="modelToPick"+randomIndentify;

  mesh.position.x= camera.position.x-2;
  mesh.position.y= camera.position.y;
  mesh.position.z= (camera.position.z-pos2Asig)+2;

  collidableMeshList.push(mesh);
  scene.add(mesh);

}





// function createPickups() {
//   const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

//   const textureLoader = new THREE.TextureLoader();
//   const texture = textureLoader.load('./img/textura caja.jpg');
//   // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
//   const material = new THREE.MeshStandardMaterial({
//     map: texture,
//     side: THREE.DoubleSide
//   });

//   const cube = new THREE.Mesh(geometry, material);
//   const cube2 = new THREE.Mesh(geometry, material);
//   const cube3 = new THREE.Mesh(geometry, material);
//   const cube4 = new THREE.Mesh(geometry, material);
//   const cube5 = new THREE.Mesh(geometry, material);

//   cube.position.set(getRndInteger(-6, 6), 0.5, getRndInteger(-6, 6));
//   scene.add(cube);

//   cube2.position.set(getRndInteger(-6, 6), 0.5, getRndInteger(-6, 6));
//   scene.add(cube2);

//   cube3.position.set(getRndInteger(-6, 6), 0.5, getRndInteger(-6, 6));
//   scene.add(cube3);

//   cube4.position.set(getRndInteger(-6, 6), 0.5, getRndInteger(-6, 6));
//   scene.add(cube4);

//   cube5.position.set(getRndInteger(-6, 6), 0.5, getRndInteger(-6, 6));
//   scene.add(cube5);


// }

