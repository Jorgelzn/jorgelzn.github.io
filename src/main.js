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
                function ( object ) {
                    object.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true
                            child.receiveShadow = true
                        }
                    })
                    container.add(object)
                }
                ,
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
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
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
    
    var ratio = window.innerWidth/window.innerHeight
    var FOV = 75;
    if(0.6<ratio && ratio<1){
        FOV=100;
    }else if(ratio<0.6){
        FOV=135;
    }

	camera.aspect = ratio;
    camera.fov = FOV
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
    controls.update()
	controls.handleResize();

}

window.goLocation = function goLocation(location){
    new TWEEN.Tween(camera.position)
        .to({
            x: location[0],
            y: location[1],
            z: location[2],
        },
        1000
        ).easing(TWEEN.Easing.Cubic.Out).start()

    new TWEEN.Tween(camera.rotation)
        .to({
            x: location[3],
            y: location[4],
            z: location[5],
        },
        1000
        ).easing(TWEEN.Easing.Cubic.Out).start()
}

// Animation loop

function animate(){
    requestAnimationFrame(animate);

    TWEEN.update()
    renderer.render(scene, camera);
    console.log(camera.position)
    
}

const scene = new THREE.Scene();

//RENDERER

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
})
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//camera
var ratio = window.innerWidth/window.innerHeight
var FOV = 75;
if(0.6<ratio && ratio<1){
    FOV=100;
}else if(ratio<0.6){
    FOV=135;
}

const camera = new THREE.PerspectiveCamera(FOV,ratio,0.1,1000);
camera.position.setY(7);
camera.position.setZ(-20);
camera.position.setX(35);


// LOAD SCENE

var room_url = require("url:../static/models/room.obj");
var material_url = require("url:../static/materials/room.mtl");
var room = load_OBJ(room_url,material_url);
console.log(room)
room.scale.set(10,10,10);
scene.add(room);

var background = new THREE.Mesh(
    new THREE.SphereGeometry(50),
new THREE.MeshLambertMaterial( {
                color: 0x016e6e,
                side: THREE.BackSide,
    } )
);	
scene.add( background );

//LIGHTNING

const pointLight1 = new THREE.PointLight( 0x03fcfc, 60, 5 );
pointLight1.position.set( -5, 0, 0 );
pointLight1.castShadow = true;
pointLight1.shadow.bias=-0.004;
scene.add( pointLight1 )

let d = 150
const directionalLight1 = new THREE.DirectionalLight( 0xffffff, 1 );

directionalLight1.position.set( 0, 100, -90 );
directionalLight1.castShadow = true;
directionalLight1.shadow.bias=-0.004;
directionalLight1.shadow.camera.left = -d;
directionalLight1.shadow.camera.right = d;
directionalLight1.shadow.camera.top = d;
directionalLight1.shadow.camera.bottom = -d;

const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight2.position.set( 20, 100, 60 );
directionalLight2.castShadow = true;
directionalLight2.shadow.bias=-0.004;
directionalLight2.shadow.camera.left = -d;
directionalLight2.shadow.camera.right = d;
directionalLight2.shadow.camera.top = d;
directionalLight2.shadow.camera.bottom = -d;

const directionalLight3 = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight3.position.set( 60, 60, 0 );
directionalLight3.castShadow = true;
directionalLight3.shadow.bias=-0.004;
directionalLight3.shadow.camera.left = -d;
directionalLight3.shadow.camera.right = d;
directionalLight3.shadow.camera.top = d;
directionalLight3.shadow.camera.bottom = -d;

scene.add(pointLight1,directionalLight1,directionalLight2,directionalLight3);

//const pointLightHelper1 = new THREE.PointLightHelper( pointLight1 );
//pointLight1.add(pointLightHelper1);
//const lightHelper = new THREE.DirectionalLightHelper( directionalLight1 );
//directionalLight1.add( lightHelper );
//const lightHelper2 = new THREE.DirectionalLightHelper( directionalLight2 );
//directionalLight2.add( lightHelper2 );
//const lightHelper3 = new THREE.DirectionalLightHelper( directionalLight3 );
//directionalLight3.add( lightHelper3 );

window.addEventListener( 'resize', onWindowResize );

const controls = new OrbitControls( camera, renderer.domElement );
controls.maxAzimuthAngle = Math.PI;  
controls.minAzimuthAngle = Math.PI / 3;
controls.minPolarAngle = Math.PI/2.5;
controls.maxPolarAngle = Math.PI/2.5;
controls.minDistance = 1;
controls.maxDistance = 50;


animate()