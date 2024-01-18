<template>
  <div ref="canvas"></div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { data } from "./assets/data";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import brainVertexShader from "./shaders/brain/vertex.glsl?raw";
import brainFragmentShader from "./shaders/brain/fragment.glsl?raw";
let controls, camera, elapsedTime;
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

// brainMesh
let brainCurves = [];
PATHS.forEach((path) => {
  let points = [];
  for (let i = 0; i < path.length; i += 3) {
    points.push(new THREE.Vector3(path[i], path[i + 1], path[i + 2]));
  }
  let tempcurve = new THREE.CatmullRomCurve3(points);
  brainCurves.push(tempcurve);
});
// brainMaterial
const brainMaterial = new THREE.ShaderMaterial({
  depthWrite: false,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  vertexColors: true, // rgb or rgba
  transparent: true,
  depthTest: false,
  depthWrite: false,
  uniforms: {
    // uSize: { value: 30 * renderer.getPixelRatio() },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0.1, 0.3, 0.6) },
  },
  vertexShader: brainVertexShader,
  fragmentShader: brainFragmentShader,
  onBeforeCompile: (shader) => {
    // console.log(shader);
  },
});
function brainTubes() {
  brainCurves.map((curve) => {
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.001, 3, false);
    const tube = new THREE.Mesh(tubeGeo, brainMaterial);
    scene.add(tube);
  });
}
brainTubes();
// brainParticleMesh
const particleGeometry = new THREE.BufferGeometry();
const array = new Float32Array(brainCurves.length * 100 * 3);
const attribute = new THREE.BufferAttribute(array, 3);
// attribute.count = brainCurves.length * 100
// console.log(attribute.count)
particleGeometry.setAttribute("position", attribute);

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
camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.001, 5);
camera.position.set(0, 0, 0.3);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Clock
const clock = new THREE.Clock();

/**
 * Render
 */
function render() {
  elapsedTime = clock.getElapsedTime();

  brainMaterial.uniforms.uTime.value = elapsedTime;
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
