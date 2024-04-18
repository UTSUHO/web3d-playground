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
import particleVertexShader from "./shaders/particle/vertex.glsl?raw";
import particleFragmentShader from "./shaders/particle/fragment.glsl?raw";
import { randomRange } from "@/util/three/random";
let controls, camera, elapsedTime;
const canvas = ref(null);

let myPoints = { current: [] };

// const randomRange = (min, max) => Math.random() * (max - min) + min;
const PATHS = data.economics[0].paths;
console.log(PATHS);
// Canvas

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
  // 合并mesh以提升性能
  const geometryArray = [];
  brainCurves.map((curve) => {
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.001, 3, false);
    // const tube = new THREE.Mesh(tubeGeo, brainMaterial);
    // scene.add(tube);
    geometryArray.push(tubeGeo);
  });
  const tubeGeos = BufferGeometryUtils.mergeGeometries(geometryArray, true);
  const tube = new THREE.Mesh(tubeGeos, brainMaterial);
  console.log(tube);
  scene.add(tube);
}
brainTubes();
// brainParticleMesh
function brainParticles(allthecurves) {
  let density = 10;
  let numberOfPoints = density * allthecurves.length;
  for (let i = 0; i < allthecurves.length; i++) {
    for (let j = 0; j < density; j++) {
      myPoints.current.push({
        currentOffset: Math.random(),
        speed: Math.random() * 0.01,
        curve: allthecurves[i],
        curPosition: Math.random(),
      });
    }
  }
  let positions = [];
  for (let i = 0; i < numberOfPoints; i++) {
    positions.push(randomRange(-1, 1), randomRange(-1, 1), randomRange(-1, 1));
  }
  return new Float32Array(positions);
}
function brainParticleRandomAttribute(allthecurves) {
  let density = 10;
  let numberOfPoints = density * allthecurves.length;
  let randoms = [];
  for (let i = 0; i < numberOfPoints; i++) {
    randoms.push(randomRange(0.3, 1));
  }
  return new Float32Array(randoms);
}
let positions = brainParticles(brainCurves);
let randoms = brainParticleRandomAttribute(brainCurves);
const particleGeometry = new THREE.BufferGeometry();
const attributePosition = new THREE.BufferAttribute(
  new Float32Array(positions),
  3
);
attributePosition.count = positions.length / 3;
particleGeometry.setAttribute("position", attributePosition);
const attributeRandoms = new THREE.BufferAttribute(
  new Float32Array(randoms),
  1
);
attributeRandoms.count = positions.length;
particleGeometry.setAttribute("randoms", attributeRandoms);
const particleMaterial = new THREE.ShaderMaterial({
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true, // rgb or rgba
  transparent: true,
  depthTest: false,
  depthWrite: false,
  uniforms: {
    // uSize: { value: 30 * renderer.getPixelRatio() },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x2bfff8) },
  },
  vertexShader: particleVertexShader,
  fragmentShader: particleFragmentShader,
  onBeforeCompile: (shader) => {
    // console.log(shader);
  },
});
const particle = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particle);
function particleCPUAnimation() {
  // brain particle animation
  let curPositions = particleGeometry.attributes.position.array;
  // 通过速度计算位移
  for (let i = 0; i < myPoints.current.length; i++) {
    myPoints.current[i].curPosition += myPoints.current[i].speed;
    myPoints.current[i].curPosition = myPoints.current[i].curPosition % 1;
    let curPoint = myPoints.current[i].curve.getPointAt(
      myPoints.current[i].curPosition
    );
    // 插入缓冲区
    curPositions[i * 3] = curPoint.x;
    curPositions[i * 3 + 1] = curPoint.y;
    curPositions[i * 3 + 2] = curPoint.z;
  }
  // 设置位置更新
  particleGeometry.attributes.position.needsUpdate = true;
}
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
  // brain shape animation
  brainMaterial.uniforms.uTime.value = elapsedTime;
  particleCPUAnimation();
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
