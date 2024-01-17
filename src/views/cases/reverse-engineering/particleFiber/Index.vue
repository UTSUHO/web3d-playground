<template>
  <div ref="canvas"></div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { data } from "./assets/data";
let controls, camera;
const randomRange = (min, max) => Math.random() * (max - min) + min;
const PATHS = data.economics[0].paths;
// console.log(PATHS);
// Canvas
const canvas = ref(null);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Light
scene.add(new THREE.AmbientLight(0xffffff, 1));
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);
// Mesh
let curves = [];
// curves
for (let i = 0; i < 100; i++) {
  let points = [];
  let length = randomRange(0.1, 1);
  // points
  for (let j = 0; j < 100; j++) {
    points.push(
      new THREE.Vector3().setFromSphericalCoords(
        1,
        Math.PI - (j / 100) * Math.PI * length,
        (i / 100) * Math.PI * 2
      )
    );
  }
  let tempcurve = new THREE.CatmullRomCurve3(points);
  curves.push(tempcurve);
}
console.log("wtf");
//tube
function Tube() {
  let points = [];

  for (let i = 0; i < 10; i++) {
    points.push(new THREE.Vector3((i - 5) * 0.5, Math.sin(i * 2) * 10 + 5, 0));
  }
  return new THREE.CatmullRomCurve3(points);
}
function Tubes() {
  curves.map((curve) => {
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.01, 8, false);
    const material = new THREE.MeshStandardMaterial({ color: "hotpink" });
    const tube = new THREE.Mesh(tubeGeo, material);

    scene.add(tube);
  });
}
Tubes();
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
/**
 * Camera
 */
// Base camera
camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(1, 1, 1);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
function render() {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(render);
}

onMounted(() => {
  canvas.value.appendChild(renderer.domElement);
  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;
  render();
});
</script>
