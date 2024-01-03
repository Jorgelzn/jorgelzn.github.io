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


window.onresize = function onWindowResize() {
    
    var ratio = window.innerWidth/window.innerHeight
    FOV = 75
    if(ratio<1){
        FOV = 100;
    }

	camera.aspect = ratio;
    camera.fov = FOV
	camera.updateProjectionMatrix();
    goHome()
	renderer.setSize( window.innerWidth, window.innerHeight );
    controls.update();

}


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


window.goLocation = function goLocation(location){
    controls.enableRotate= false;  
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
    controls.update();
}

window.goHome = function goHome(){ 
    controls.enableRotate=true
    new TWEEN.Tween(camera.position)
        .to({
            x: 6,
            y: 6,
            z: 6,
        },
        1000
        ).easing(TWEEN.Easing.Cubic.Out).start()
}




// Animation loop
function animate(){
    requestAnimationFrame(animate);

    //stars
    stars.forEach((star,index)=>{
        star.position.x+=momentum[index][0]
        star.position.y+=momentum[index][1]
        star.position.z+=momentum[index][2]
        if(Math.abs(star.position.x)>15 ||
            Math.abs(star.position.y)>15 ||
            Math.abs(star.position.z)>15){
                momentum[index][0]=-momentum[index][0]
                momentum[index][1]=-momentum[index][1]
                momentum[index][2]=-momentum[index][2]
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

    renderer.render(scene, camera);
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
var FOV = 75
if(ratio<1){
    FOV = 100;
}

const camera = new THREE.PerspectiveCamera(FOV,ratio,0.1,1000);
camera.position.setX(6);
camera.position.setY(6);
camera.position.setZ(6);

// LOAD SCENE

var room_url = require("url:../static/models/room.glb");
var room = load_GLTF(room_url);
room.rotateY(1.5);
room.position.setY(-3);
scene.add(room);

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
    color: 0x016e6e,
    emissive: 0x016e6e
})
var num_stars = 500
var stars = Array(num_stars).fill().map(()=>{
    const star = new THREE.Mesh(geometry,material);
    const [x,y,z] = Array(3).fill().map(()=>
        THREE.MathUtils.randFloatSpread(30)
    );

    star.position.set(x,y,z);
    scene.add(star)
    return star
})

var momentum = Array(num_stars).fill().map(()=>
    Array(3).fill().map(()=>
        THREE.MathUtils.randFloatSpread(0.01))
)

//LIGHTNING

//const pointLight1 = new THREE.PointLight( 0x03fcfc, 60, 5 );
//pointLight1.position.set( -5, -1, -3 );
//pointLight1.castShadow = true;
//pointLight1.shadow.bias=-0.04;
//scene.add( pointLight1 )

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

//const pointLightHelper1 = new THREE.PointLightHelper( pointLight1 );
//pointLight1.add(pointLightHelper1);
//const lightHelper = new THREE.DirectionalLightHelper( directionalLight1 );
//directionalLight1.add( lightHelper );
//const lightHelper2 = new THREE.DirectionalLightHelper( directionalLight2 );
//directionalLight2.add( lightHelper2 );
//const lightHelper3 = new THREE.DirectionalLightHelper( directionalLight3 );
//directionalLight3.add( lightHelper3 );

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