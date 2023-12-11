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
camera.position.setY(15);
camera.rotateY(Math.PI);

// Lighting
const dirLight = new THREE.DirectionalLight('#526cff',0.6);
const ambientLight = new THREE.AmbientLight('#4255ff',0.5);
scene.add(dirLight,ambientLight);


//Walls
const wallsGeometry = new THREE.BoxGeometry(50,1,50);
const wallsMaterial = new THREE.MeshStandardMaterial({color: new THREE.Color(0,0.2,0.5)});

const walls = Array(6).fill().map(()=>(new THREE.Mesh(wallsGeometry,wallsMaterial)));
walls.forEach(function (item, index) {
    scene.add(item);
});
walls[1].rotation.x = Math.PI / 2;
walls[1].position.z = walls[1].position.z-25;
walls[2].rotation.z = Math.PI / 2;
walls[2].position.x = walls[2].position.x-25;
walls[3].rotation.x = Math.PI / 2;
walls[3].position.z = walls[3].position.z+25;
walls[4].rotation.z = Math.PI / 2;
walls[4].position.x = walls[4].position.x+25;
walls[5].position.y = walls[5].position.x+25;

//Torus shader
const geometry = new THREE.IcosahedronGeometry(1,5);
const material = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
})
material.uniforms.uTime = {value:0}
const torus = new THREE.Mesh(geometry,material);
torus.position.setY(5)
torus.position.setZ(20)
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