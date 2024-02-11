import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TWEEN from '@tweenjs/tween.js'

//const raycaster = new THREE.Raycaster()
//const mouse = new THREE.Vector2()
//function raycast(e,object){
//    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
//    raycaster.setFromCamera(mouse, camera)
//    const intersects = raycaster.intersectObjects(scene.children, true)
//    var hit = false
//    object.traverse((element)=>{
//        if(intersects[0].object.uuid == element.uuid){
//            hit=true
//        }
//    })
//    return hit
//}

function doSmoothReset( ){
    // get current angles
    var alpha = controls.getAzimuthalAngle()
    // smooth change using manual lerp
    if(alpha>original_azimuth){
        controls.minAzimuthAngle = alpha-0.1;
        if( alpha - original_azimuth < 0.1 ) alpha = original_azimuth;
    }else{
        controls.minAzimuthAngle = alpha+0.1;
        if( original_azimuth - alpha < 0.1 ) alpha = original_azimuth;
    }
    controls.maxAzimuthAngle = controls.minAzimuthAngle;

    // if the reset values are reached, exit smooth reset
    if(alpha == original_azimuth){
        smoothReset=false
    }
}

function load_GLTF(model){
    // Instantiate a loader
    //const loader = new GLTFLoader();
    var container = new THREE.Object3D();
    var mixer = new THREE.AnimationMixer();
    // Load a glTF resource
    gltfLoader.load(
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
            //test.add(gltf.animations)

            mixer._root = gltf.scene;
            gltf.animations.forEach( function ( clip ) {
                    mixer.clipAction( clip ).play();
            } );
            container.add(gltf.scene);
        },
        // called while loading is progressing
        function ( xhr ) {
            //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
    
    return [container,mixer]
}


window.onresize = function onWindowResize() {
    
    var ratio = document.documentElement.clientWidth/document.documentElement.clientHeight
    FOV = 75
    if(document.documentElement.clientWidth<500){
        FOV = 120;
    }

	camera.aspect = ratio;
    camera.fov = FOV
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

var animLock = false
window.goLocation = function goLocation(location,name){
    if(!animLock && actual_section!=name){
        if(name=="home"){
            controls.enableRotate=true
        }else{
        controls.enableRotate = false;
        }

        animLock=true
        try{
            document.getElementById(actual_section).style.display = "none"
        }catch{}

        actual_section = name
        const goAnim = new TWEEN.Tween(camera.position).to({
                x: location[0],
                y: location[1],
                z: location[2],
            },2000).easing(TWEEN.Easing.Cubic.Out).onStart(
                () => {new TWEEN.Tween(camera.rotation).to({
                x: location[3],
                y: location[4],
                z: location[5],
                },2000).easing(TWEEN.Easing.Cubic.Out).start()
                }
            )
            goAnim.onComplete(()=>{
            animLock=false
            try{
            document.getElementById(actual_section).style.display = "flex"
            }catch{}
        })
        goAnim.start()
    }
}


// Animation loop
function animate(){
    requestAnimationFrame(animate);

    //stars
    stars.forEach((star)=>{
        star.position.x+=star.momentum[0]
        star.position.y+=star.momentum[1]
        star.position.z+=star.momentum[2]
        if(Math.abs(star.position.x)>15 ||
            Math.abs(star.position.y)>15 ||
            Math.abs(star.position.z)>15){
                star.momentum[0]=-star.momentum[0]
                star.momentum[1]=-star.momentum[1]
                star.momentum[2]=-star.momentum[2]
            }
    })

    //camera
    if(smoothReset){
        doSmoothReset()
    }else{
        controls.minAzimuthAngle = original_azimuth_min
        controls.maxAzimuthAngle = original_azimuth_max
    }
    TWEEN.update()
    if(controls.enableRotate){
        controls.update();
    }


    fish[1].update(0.01)
    //chest[1].update(0.01)


    renderer.render(scene, camera);
}


const loadingManager = new THREE.LoadingManager();
const progressBar = document.getElementById('progress-bar');
loadingManager.onProgress = function(url,loaded,total){
    progressBar.value = (loaded/total)*100;
}
const progressBarContainer = document.querySelector('.progress-bar-container');
const NavPanel = document.querySelector('.nav-panel');
loadingManager.onLoad = function(url,loaded,total){
    progressBarContainer.style.display = 'none'
    NavPanel.style.display = 'flex'
}
const gltfLoader = new GLTFLoader(loadingManager)

const scene = new THREE.Scene();
var actual_section="home";
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
var ratio = document.documentElement.clientWidth/document.documentElement.clientHeight
var FOV = 75
if(document.documentElement.clientWidth<500){
    FOV = 120;
}
const camera = new THREE.PerspectiveCamera(FOV,ratio,0.1,1000);
camera.position.setX(6);
camera.position.setY(6);
camera.position.setZ(6);

// LOAD SCENE

var room_url = require("url:../static/models/room.glb");
var room = load_GLTF(room_url)[0];
room.rotateY(1.5);
room.position.setY(-3);

var fish_url = require("url:../static/models/fish.glb");
var fish = load_GLTF(fish_url);
fish[0].position.setY(-1.15);
fish[0].position.setX(2);
fish[0].position.setZ(-3.3);
fish[0].scale.set(0.03,0.03,0.03);
fish[0].section = "research"

var robot_url = require("url:../static/models/robot.glb");
var robot = load_GLTF(robot_url)[0];
robot.position.setY(-2.5);
robot.position.setX(-1.8);
robot.position.setZ(0.8);
robot.rotateY(-0.8);
robot.scale.set(0.005,0.005,0.005);
robot.section = "coding"

var book_url = require("url:../static/models/books.glb");
var book = load_GLTF(book_url)[0];
book.position.setY(-2.12);
book.position.setX(2.3);
book.position.setZ(-2);
//book.rotateX(-1.5);
book.rotateY(-1.5);
//book.rotateZ(0.4);
book.scale.set(0.005,0.005,0.005);
book.section = "writing"

scene.add(room,fish[0],robot,book);

var background = new THREE.Mesh(
    new THREE.SphereGeometry(50),
new THREE.MeshLambertMaterial( {
                color: 0x016e6e,
                side: THREE.BackSide,
    } )
);	
scene.add( background );

const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
const material = new THREE.MeshStandardMaterial({
    color: 0x00ffd9,
    emissive: 0x00ffd9
})
var num_stars = 500
var stars = Array(num_stars).fill().map(()=>{
    const star = new THREE.Mesh(geometry,material);
    const [x,y,z] = Array(3).fill().map(()=>
        THREE.MathUtils.randFloatSpread(30)
    );

    star.position.set(x,y,z);
    star.momentum=Array(3).fill().map(()=>THREE.MathUtils.randFloatSpread(0.01))
    scene.add(star)
    return star
})


//LIGHTNING

const directionalLight1 = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight1.position.set( 0, 100, -90 );

const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight2.position.set( 20, 100, 60 );

const directionalLight3 = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight3.position.set( 60, 60, 0 );
//let d = 150
//directionalLight3.castShadow = true;
//directionalLight3.shadow.bias=-0.004;
//directionalLight3.shadow.camera.left = -d;
//directionalLight3.shadow.camera.right = d;
//directionalLight3.shadow.camera.top = d;
//directionalLight3.shadow.camera.bottom = -d;

scene.add(directionalLight1,directionalLight2,directionalLight3);

const controls = new OrbitControls( camera, renderer.domElement );
const original_azimuth = controls.getAzimuthalAngle()
const original_azimuth_min = original_azimuth-1.2
const original_azimuth_max = original_azimuth+1.2
controls.minAzimuthAngle = original_azimuth_min;
controls.maxAzimuthAngle = original_azimuth_max;  
controls.minPolarAngle = Math.PI/2.5;
controls.maxPolarAngle = Math.PI/2.5;
controls.rotateSpeed = 0.2;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate= true; 
var smoothReset = false;

controls.addEventListener( 'end', function(){smoothReset=true;} );


animate()