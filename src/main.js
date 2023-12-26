import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
const g = require("url:./model.obj")
const ge = require("url:./materials.mtl")

const scene = new THREE.Scene();

// Camera and renderer

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setY(0);
camera.position.setZ(30);
camera.position.setX(0);
//camera.rotateY(Math.PI);
//camera.rotateX(-Math.PI/8);

// Lighting
const dirLight = new THREE.DirectionalLight('#526cff');
const ambientLight = new THREE.AmbientLight('#4255ff');
scene.add(dirLight,ambientLight);


//Walls
const floorGeometry = new THREE.BoxGeometry(1000,1,500);
const floorMaterial = new THREE.MeshStandardMaterial({color: new THREE.Color(0,0.2,0.5)});
const floor = new THREE.Mesh(floorGeometry,floorMaterial);
//scene.add(floor);

//Torus shader
const geometry = new THREE.OctahedronGeometry(5);
const material = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
})
material.uniforms.uTime = {value:0}
const torus = new THREE.Mesh(geometry,material);
torus.position.setY(0);
torus.position.setZ(0);
scene.add(torus);

// LOAD OBJECT
const mtlLoader = new MTLLoader()
console.log(g);
mtlLoader.load(
    ge,
    (materials) => {
        materials.preload()
        console.log(materials)
        const objLoader = new OBJLoader()
        objLoader.setMaterials(materials)
        objLoader.load(
        g,
        (object) => {
            object.scale.set(10, 10, 10);
            object.rotateY(-Math.PI/2);
            scene.add(object)
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



// Controls

const controls = new OrbitControls(camera,renderer.domElement);

window.addEventListener( 'resize', onWindowResize );


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

animate()