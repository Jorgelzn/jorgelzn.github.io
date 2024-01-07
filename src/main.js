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


const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
function raycast(e,object){
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)
    var hit = false
    object.traverse((element)=>{
        if(intersects[0].object.uuid == element.uuid){
            hit=true
        }
    })
    return hit
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

var animLock = false
window.goLocation = function goLocation(location,name){
    controls.enableRotate = false;
    if(!animLock && actual_section!=name){
        animLock=true
        if(actual_section!="home"){
            animLock = true
            document.getElementById(actual_section).style.display = "none"
            var restore_object = section_objects.find((element)=>{return element.section==actual_section})
            new TWEEN.Tween(restore_object.position).to({
                x: restore_object.position.x,
                y: restore_object.position.y-0.8,
                z: restore_object.position.z-0.4,
            },1000).easing(TWEEN.Easing.Cubic.Out).onStart(
                () => {new TWEEN.Tween(restore_object.rotation).to({
                    x: restore_object.rotation.x-0.5,
                    y: restore_object.rotation.y,
                    z: restore_object.rotation.z,
                },1000).easing(TWEEN.Easing.Cubic.Out).start()
                }
            ).start()
        }
        actual_section = name
        var object = section_objects.find((element)=>{return element.section==actual_section})
        const goAnim = new TWEEN.Tween(camera.position).to({
                x: location[0],
                y: location[1],
                z: location[2],
            },1000).easing(TWEEN.Easing.Cubic.Out).onStart(
                () => {new TWEEN.Tween(camera.rotation).to({
                x: location[3],
                y: location[4],
                z: location[5],
                },1000).easing(TWEEN.Easing.Cubic.Out).start()
                }
            )

        const bringObject = new TWEEN.Tween(object.position).to({
                x: object.position.x,
                y: object.position.y+0.8,
                z: object.position.z+0.4,
            },1000).easing(TWEEN.Easing.Cubic.Out).onStart(
                () => {new TWEEN.Tween(object.rotation).to({
                    x: object.rotation.x+0.5,
                    y: object.rotation.y,
                    z: object.rotation.z,
                },1000).easing(TWEEN.Easing.Cubic.Out).start()
                }
            )
        
        bringObject.onComplete(()=>{
            animLock=false
            document.getElementById(actual_section).style.display = "flex"
        })
        goAnim.chain(bringObject)
        goAnim.start()
    }
}

window.goHome = function goHome(){ 
    controls.enableRotate=true
    if(!animLock && actual_section!="home"){
        animLock=true
        document.getElementById(actual_section).style.display = "none"
        var restore_object = section_objects.find((element)=>{return element.section==actual_section})
        new TWEEN.Tween(restore_object.position).to({
            x: restore_object.position.x,
            y: restore_object.position.y-0.8,
            z: restore_object.position.z-0.4,
        },1000).easing(TWEEN.Easing.Cubic.Out).onStart(
            () => {new TWEEN.Tween(restore_object.rotation).to({
                x: restore_object.rotation.x-0.5,
                y: restore_object.rotation.y,
                z: restore_object.rotation.z,
            },1000).easing(TWEEN.Easing.Cubic.Out).start()
            }
        ).start()
        actual_section = "home"
        new TWEEN.Tween(camera.position).to({
                x: 6,
                y: 6,
                z: 6,
            },1000).easing(TWEEN.Easing.Cubic.Out).onStart(
                ()=> {new TWEEN.Tween(camera.rotation).to({
                    x: -0.785398163397448,
                    y: 0.6154797086703871,
                    z: 0.5235987755982985,
                    },1000).easing(TWEEN.Easing.Cubic.Out).start()
                    }
            ).onComplete(()=>{animLock=false}).start()
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

    renderer.render(scene, camera);
}

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
var section_objects = []

var room_url = require("url:../static/models/room.glb");
var room = load_GLTF(room_url);
room.rotateY(1.5);
room.position.setY(-3);
scene.add(room);

var book_url = require("url:../static/models/book.glb");
var book = load_GLTF(book_url);
book.position.setY(-2.2);
book.position.setX(2.4);
book.position.setZ(-1.6);
book.rotateY(-0.8);
book.rotateZ(-0.3);
book.section = "writing"
section_objects.push(book)

var book_placeholder1 = load_GLTF(book_url);
book_placeholder1.position.setY(-2.2);
book_placeholder1.position.setX(2.4);
book_placeholder1.position.setZ(-1.6);
book_placeholder1.rotateY(-0.8);
book_placeholder1.rotateZ(-0.3);
book_placeholder1.section = "coding"
section_objects.push(book_placeholder1)

var book_placeholder2 = load_GLTF(book_url);
book_placeholder2.position.setY(-2.2);
book_placeholder2.position.setX(2.4);
book_placeholder2.position.setZ(-1.6);
book_placeholder2.rotateY(-0.8);
book_placeholder2.rotateZ(-0.3);
book_placeholder2.section = "research"
section_objects.push(book_placeholder2)
scene.add(room,book,book_placeholder1,book_placeholder2);
//document.addEventListener('mousedown', (e)=>onMouseDown(e,book,10), false);

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