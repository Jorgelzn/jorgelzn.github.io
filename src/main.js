import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TWEEN from '@tweenjs/tween.js'


function load_OBJ(model,material){
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
                //console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log('An error happened')
            }
            )
        },
        (xhr) => {
            //console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log('An error happened')
        }
    )
    return container
}

function load_GLTF(model){
    // Instantiate a loader
    const loader = new GLTFLoader();
    var container = new THREE.Object3D();

    // Load a glTF resource
    loader.load(
        // resource URL
        model,
        // called when the resource is loaded
        function ( gltf ) {
            container.add(gltf.scene);
        },
        // called while loading is progressing
        function ( xhr ) {
            //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        }
    );
    return container
}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
    controls.update()
	controls.handleResize();

}

window.goArchives = function goArchives(){
    new TWEEN.Tween(camera.position)
        .to({
            x: 1,
            y: -1,
            z: 0,
        },
        1000
        ).easing(TWEEN.Easing.Cubic.Out).start()

    new TWEEN.Tween(camera.rotation)
        .to({
            x: 0,
            y: -0.3,
            z: 0,
        },
        1000
        ).easing(TWEEN.Easing.Cubic.Out).start()
}

// Animation loop

function animate(){
    requestAnimationFrame(animate);

    TWEEN.update()
    renderer.render(scene, camera);
    
}

const scene = new THREE.Scene();

//renderer

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
})
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//camera

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
camera.position.setY(0);
camera.position.setZ(1);
camera.position.setX(4);
camera.rotateY(1.2);

// LOAD SCENE
const room_url = require("url:../static/models/room.glb");
var room = load_GLTF(room_url);
room.position.setZ(80);
scene.add(room);

window.addEventListener( 'resize', onWindowResize );

animate()