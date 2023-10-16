import { onMounted } from 'vue'; import { onUnmounted } from 'vue'; import {
onMounted } from 'vue';
<template>
  <canvas class="webgl"></canvas>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import testVertexShader from "./shaders/test/vertex.glsl";
import testFragmentShader from "./shaders/test/fragment.glsl";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { releaseRender } from "@/util/threeUtil";
let scene;
let renderer;
const loader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
// const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath("/examples/jsm/libs/draco/");
// loader.setDRACOLoader(dracoLoader);
onMounted(() => {
  /**
   * Base
   */

  // Canvas
  const canvas = document.querySelector("canvas.webgl");

  // Scene
  scene = new THREE.Scene();

  /**
   * Textures
   */
  const textureLoader = new THREE.TextureLoader();
  // const flagTexture = textureLoader.load("/textures/flag-french.jpg");
  /**
   * Test mesh
   */
  // Geometry
  // const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

  // const count = geometry.attributes.position.count;
  // const randoms = new Float32Array(count);

  // for (let i = 0; i < count; i++) {
  //   randoms[i] = Math.random();
  // }

  // geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
  // Material
  const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms: {
      uFrequency: { value: new THREE.Vector2(10, 5) },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("orange") },
      // uTexture: { value: flagTexture },
    },

    wireframe: true,
  });

  const highwayMaterial = new THREE.ShaderMaterial({});

  // Mesh
  // const mesh = new THREE.Mesh(geometry, material);
  // mesh.scale.y = 2 / 3;
  // scene.add(mesh);

  // Load a glTF resource
  loader.load(
    // resource URL
    "models/city-model/test.glb",
    // called when the resource is loaded
    function (gltf) {
      scene.add(gltf.scene);

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          child.geometry.computeVertexNormals();
          child.material = material;
          console.log(child);
          if (child.userData.name == "Areas:highway") {
            child.material = highwayMaterial;
          }
        }
      });
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );
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
  const camera = new THREE.PerspectiveCamera(
    90,
    sizes.width / sizes.height,
    0.1,
    10000
  );
  camera.position.set(0, 500, 0);
  scene.add(camera);
  const helper = new THREE.CameraHelper(camera);
  scene.add(helper);
  scene.add(new THREE.AmbientLight(0x404040));
  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);
  controls.update();

  /**
   * Renderer
   */
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /**
   * Animate
   */
  const clock = new THREE.Clock();
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update material
    material.uniforms.uTime.value = elapsedTime;
    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();

  // Debug
  //   const gui = new dat.GUI();
});
// gui
//   .add(material.uniforms.uFrequency.value, "x")
//   .min(0)
//   .max(20)
//   .step(0.01)
//   .name("frequencyX");
// gui
//   .add(material.uniforms.uFrequency.value, "y")
//   .min(0)
//   .max(20)
//   .step(0.01)
//   .name("frequencyY");
// export function resetCamera() {
//   camera.lookAt(0, 0, 0);
// }
onUnmounted(() => {
  //   gui.destroy();
  releaseRender(renderer, scene);
});
</script>
