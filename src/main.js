import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'


function load_model(model,material){
    const mtlLoader = new MTLLoader()
    var container = new THREE.Object3D();
    mtlLoader.load(
        material,
        (materials) => {
            materials.preload()
            //console.log(materials)
            const objLoader = new OBJLoader()
            objLoader.setMaterials(materials)
            objLoader.load(
                model,
            (object) => {
                container.add(object)
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log('An error happened')
            }
            )
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log('An error happened')
        }
    )
    return container
}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	//controls.handleResize();

}

// Animation loop

function animate(){
    requestAnimationFrame(animate);

    //controls.update();
    torus.rotateY(0.01);

    renderer.render(scene, camera);
    
}

const scene = new THREE.Scene();

scene.background = new THREE.Color( '#1b65a6' );

// Camera and renderer

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setY(5);
camera.position.setZ(40);
camera.position.setX(15);
camera.rotateY(0.5);
camera.rotateX(-0.2);
//camera.rotateX(-Math.PI/8);

// Lighting

const dirLight1 = new THREE.DirectionalLight(0xFFFFFF,0.5);
dirLight1.position.setY(20);
dirLight1.position.setZ(-20);
dirLight1.position.setX(-20);
dirLight1.castShadow = true;

const dirLight2 = new THREE.DirectionalLight(0xFFFFFF,0.5);
dirLight2.position.setY(20);
dirLight2.position.setZ(-10);
dirLight2.position.setX(20);
dirLight2.castShadow = true;

const dirLight3 = new THREE.DirectionalLight(0xFFFFFF,0.5);
dirLight3.position.setY(20);
dirLight3.position.setZ(20);
dirLight3.position.setX(20);
dirLight3.castShadow = true;

scene.add(dirLight1,dirLight2,dirLight3);

//const dirhelper1 = new THREE.DirectionalLightHelper( dirLight1);
//const dirhelper2 = new THREE.DirectionalLightHelper( dirLight2);
//const dirhelper3 = new THREE.DirectionalLightHelper( dirLight3);
//scene.add( dirhelper1,dirhelper2,dirhelper3);


//Torus

const torus = new THREE.Mesh(
    new THREE.OctahedronGeometry(5),
    new THREE.MeshBasicMaterial( { color: "#433F81" } )
);
torus.position.setY(0);
torus.position.setZ(0);
//scene.add(torus);

// LOAD OBJECT
const room_mod = require("url:../static/models/room.obj");
const room_mat = require("url:../static/materials/room.mtl");
var room = load_model(room_mod,room_mat);
room.scale.set(10, 10, 10);
room.rotateY(-Math.PI/2);
scene.add(room);

// Controls

//const controls = new OrbitControls(camera,renderer.domElement);

window.addEventListener( 'resize', onWindowResize );

animate()