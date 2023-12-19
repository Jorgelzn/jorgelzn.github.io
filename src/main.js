import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
const scene = new THREE.Scene();

// Camera and renderer

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setY(20);
camera.position.setZ(-20);
camera.position.setX(20);
camera.rotateY(Math.PI);
camera.rotateX(-Math.PI/8);

// Lighting
const dirLight = new THREE.DirectionalLight('#526cff',0.6);
const ambientLight = new THREE.AmbientLight('#4255ff',0.5);
scene.add(dirLight,ambientLight);


//Walls
const floorGeometry = new THREE.BoxGeometry(1000,1,500);
const floorMaterial = new THREE.MeshStandardMaterial({color: new THREE.Color(0,0.2,0.5)});
const floor = new THREE.Mesh(floorGeometry,floorMaterial);
scene.add(floor);

//Torus shader
const geometry = new THREE.OctahedronGeometry(5);
const material = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
})
material.uniforms.uTime = {value:0}
const torus = new THREE.Mesh(geometry,material);
torus.position.setY(10);
torus.position.setZ(20);
scene.add(torus);

// Controls

//const controls = new OrbitControls(camera,renderer.domElement);

// Animation loop

function animate(){
    requestAnimationFrame(animate);

    //controls.update();

    renderer.render(scene, camera);
    
}

animate()