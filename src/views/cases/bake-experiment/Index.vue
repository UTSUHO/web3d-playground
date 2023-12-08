<template>
  <canvas class="webgl"></canvas>
</template>
<script setup>
import { onMounted, onUnmounted } from "vue";
import GUI from "lil-gui";
import * as THREE from "three";
import { releaseRenderer } from "@/util/three/releaseRenderer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";
import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";
let gui, renderer, scene;

onMounted(() => {
  /**
   * Base
   */
  // Debug
  const debugObject = {};
  debugObject.clearColor = "#201919";
  debugObject.firefliesColor = "#ffffff";
  debugObject.portalColorStart = "#c2fff0";
  debugObject.portalColorEnd = "#9292f7";
  gui = new GUI({
    width: 400,
  });

  // Canvas
  const canvas = document.querySelector("canvas.webgl");

  // Scene
  scene = new THREE.Scene();

  /**
   * Loaders
   */
  // Texture loader
  const textureLoader = new THREE.TextureLoader();

  // Draco loader
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("draco/");

  // GLTF loader
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  /**
   * Textures
   */
  const bakedTexture = textureLoader.load("/textures/baked/baked.jpg");
  bakedTexture.flipY = false;
  bakedTexture.colorSpace = THREE.SRGBColorSpace;
  /**
   * Materials
   */
  // Baked material
  const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
  // Pole light material
  const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f4fe });
  /**
   * Model
   */
  gltfLoader.load("/models/portal/portal.glb", (gltf) => {
    gltf.scene.traverse((child) => {
      child.material = bakedMaterial;
    });
    scene.add(gltf.scene);

    // Get each object
    const portalLightMesh = gltf.scene.children.find(
      (child) => child.name === "portalLight"
    );
    const lampCoreRightMesh = gltf.scene.children.find(
      (child) => child.name === "lampCoreRight"
    );
    const lampCoreLeftMesh = gltf.scene.children.find(
      (child) => child.name === "lampCoreLeft"
    );

    lampCoreRightMesh.material = poleLightMaterial;
    lampCoreLeftMesh.material = poleLightMaterial;
    portalLightMesh.material = portalLightMaterial;
  });

  /**
   * Object
   */

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
    // Update fireflies
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
      window.devicePixelRatio,
      2
    );
  });

  /**
   * Camera
   */
  // Base camera
  const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.x = 4;
  camera.position.y = 2;
  camera.position.z = 4;
  scene.add(camera);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  /**
   * Renderer
   */
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /**
   * Fireflies
   */
  // Geometry
  const firefliesGeometry = new THREE.BufferGeometry();
  const firefliesCount = 100;
  const positionArray = new Float32Array(firefliesCount * 3);
  const scaleArray = new Float32Array(firefliesCount);

  // random position
  for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 8;
    positionArray[i * 3 + 1] = Math.random() * 1.5 * 2;
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 8;
    scaleArray[i] = Math.random();
  }

  firefliesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3)
  );
  firefliesGeometry.setAttribute(
    "aScale",
    new THREE.BufferAttribute(scaleArray, 1)
  );
  // Material
  const firefliesMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSize: { value: 100 },
      uTime: { value: 0 },
      uFirefliesColor: { value: new THREE.Color(debugObject.firefliesColor) },
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
  });
  const portalLightMaterial = new THREE.ShaderMaterial({
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
      uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) },
    },
  });
  // Points
  const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
  scene.add(fireflies);
  /**
   * Animate
   */
  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);

    // Update materials
    firefliesMaterial.uniforms.uTime.value = elapsedTime;
    portalLightMaterial.uniforms.uTime.value = elapsedTime;
  };

  tick();

  //GUI

  renderer.setClearColor(debugObject.clearColor);
  gui.addColor(debugObject, "clearColor").onChange(() => {
    renderer.setClearColor(debugObject.clearColor);
  });
  gui.addColor(debugObject, "firefliesColor").onChange(() => {
    firefliesMaterial.uniforms.uFirefliesColor.value.set(
      debugObject.firefliesColor
    );
  });
  gui
    .add(firefliesMaterial.uniforms.uSize, "value")
    .min(0)
    .max(500)
    .step(1)
    .name("firefliesSize");

  gui.addColor(debugObject, "portalColorStart").onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(
      debugObject.portalColorStart
    );
  });

  gui.addColor(debugObject, "portalColorEnd").onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(
      debugObject.portalColorEnd
    );
  });
});
onUnmounted(() => {
  gui.destroy();
  releaseRenderer(renderer, scene);
});
</script>
