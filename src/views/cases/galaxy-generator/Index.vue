<style lang="scss" scoped>
.detail-HUD-container {
  // position: absolute;
  // width: 100%;
  // height: 100%;
}
.HUD {
  display: flex;
  flex-direction: column;
  &-header {
    width: 100%;
    height: 20%;
  }
  &-container {
    width: 100%;
    height: 60%;
  }
  &-footer {
    width: 100%;
    height: 20%;
  }
}
</style>
<template>
  <div ref="canvas" class="webgl"></div>

  <logoHud ref="cloudServer" class="HUD-isHudHidden" :svg-type="1" />
  <logoHud
    ref="superComputing"
    class="HUD-isHudHidden"
    @pointerdown="onClickSuperComputing"
    :svg-type="2"
  />
  <logoHud ref="HPC" class="HUD-isHudHidden" :svg-type="3" />
  <div class="detail-HUD-container HUD">
    <div class="HUD-header"></div>
    <div class="HUD-container">
      <superComputingHUD ref="scHUD" :is-hidden="scenarioHidden(2)" />
    </div>
    <div class="HUD-footer"></div>
  </div>
  <div style="position: absolute; top: 0px; left: 47%">
    <v-btn @click="reset">reset</v-btn
    ><v-btn @click="printCamera">print camera</v-btn>
  </div>
</template>
<script setup>
// 补间引擎
import * as TWEEN from "@tweenjs/tween.js";
// VUE3
import { onMounted, onUnmounted, ref, computed } from "vue";
// THREE 核心
import * as THREE from "three";
// 调试器
import * as dat from "lil-gui";
// vue组件
import logoHud from "./components/logoHUD.vue";
import superComputingHUD from "./components/superComputingHUD.vue";

// 抽象方法
import { releaseRenderer } from "@/util/three/releaseRenderer";
// THREE addon
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// PostProcessing
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
// shader
import galaxyVertexShader from "./shaders/galaxy/vertex.glsl";
import galaxyFragmentShader from "./shaders/galaxy/fragment.glsl";
import blackHoleVertexShader from "./shaders/blackholeCursor/vertex.glsl";
import blackHoleFragmentShader from "./shaders/blackholeCursor/fragment.glsl";

let composer,
  cursor,
  parallax,
  clickedTime,
  mouseMesh,
  scene,
  css3DScene,
  gui,
  label3DRenderer,
  label2DRenderer,
  renderer,
  camera,
  parameters,
  cursorFieldForce,
  cursorParallax,
  elapsedTime,
  deltaTime;
const css3DScale = 1000;
let cssCameraPosition = new THREE.Vector3(3000, 3000, 0);
let previousTime = 0;
let pos = new THREE.Vector3();
let clicked = false;
let blackholeMass = 1500;
let curblackholeMass = 0;
let effectBlackHole;
let cameraNormalize = new THREE.Vector3(0, 0, 0);
const dataModel = ref({
  // 标记当前场景
  sceneario: 0,
  // 标记当前详情页
  detailSceneario: 0,
  // 标记详情卡片
  detailCard: 0,
});
const canvas = ref(null);
const isHUDScene = ref(false);
const cloudServer = ref(null);
const superComputing = ref(null);
const scHUD = ref(null);
const HPC = ref(null);
label3DRenderer = new CSS3DRenderer();
label2DRenderer = new CSS2DRenderer();
THREE.ColorManagement.enabled = false;
function onClickSuperComputing() {
  var from = camera.position.clone();
  var to = camera.position.clone().set(-3, 0.2, 0);
  new TWEEN.Tween(from)
    .to(to, 3000)
    .easing(TWEEN.Easing.Back.In)
    .onStart(() => {
      window.removeEventListener("mousemove", cursorParallax);
      parallax = { x: 0, y: 0 };
    })
    .onUpdate(function () {
      // console.log(from)
      camera.position.copy(from);
      camera.lookAt(0, 0, 0);
      cameraNormalize = camera.rotation.clone();
    })
    .onComplete(function () {
      // console.log(cameraNormalize);
      window.removeEventListener("mousemove", cursorFieldForce);
      window.addEventListener("mousemove", cursorParallax);
      pos.set(0, 0, 0);
      dataModel.value.detailSceneario = 2;
    })
    .start();
  isHUDScene.value = true;
}
function printCamera() {
  console.log(camera);
}
function reset() {
  var from = camera.position.clone();
  var to = camera.position.clone().set(3, 3, 0);
  new TWEEN.Tween(from)
    .to(to, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .onStart(function () {
      window.removeEventListener("mousemove", cursorParallax);
      parallax = { x: 0, y: 0 };
      dataModel.value.sceneario = 1;
      dataModel.value.detailSceneario = 0;
    })
    .onUpdate(function () {
      // console.log(parallax);
      camera.position.copy(from);
      camera.lookAt(0, 0, 0);
      cameraNormalize = camera.rotation.clone();
    })
    .onComplete(function () {
      // console.log(cameraNormalize);
      window.addEventListener("mousemove", cursorFieldForce);
      window.addEventListener("mousemove", cursorParallax);
      pos.set(0, 0, 0);
    })
    .start();
  isHUDScene.value = !isHUDScene.value;
}
onMounted(() => {
  /**
   * Base
   */
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  // Debug
  gui = new dat.GUI();

  // Canvas

  // Scene
  scene = new THREE.Scene();
  css3DScene = new THREE.Scene();
  css3DScene.scale.set(1 / css3DScale, 1 / css3DScale, 1 / css3DScale);

  // 引力场 范围测试用 mouseMesh
  let ballGeometry = new THREE.SphereGeometry(0.5, 16, 8);
  var mouseMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
  });
  mouseMesh = new THREE.Mesh(ballGeometry, mouseMaterial);
  mouseMesh.position.z = -5;
  // scene.add(mouseMesh);
  // let g = new THREE.IcosahedronGeometry(4, 20);
  // g = BufferGeometryUtils.mergeVertices(g);
  /**
   * Galaxy
   */
  // init control panel var
  parameters = {};
  parameters.count = 20000;
  parameters.size = 0.005;
  parameters.radius = 5;
  parameters.branches = 6;
  parameters.spin = 1;
  parameters.randomness = 0.5;
  parameters.randomnessPower = 3;
  parameters.insideColor = "#212936";
  parameters.outsideColor = "#1b3984";
  parameters.blackholeRadius = 0.5;
  parameters.rotationSpeedFactor = 0.01;
  parameters.elapsedTime = 10;
  parameters.fieldForceDivisor = 3;
  /**
   * Camera
   */
  // Base camera
  const cameraGroup = new THREE.Group();
  scene.add(cameraGroup);
  camera = new THREE.PerspectiveCamera(
    60,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.x = 3;
  camera.position.y = 3;
  camera.position.z = 0;
  camera.lookAt(0, 0, 0);
  cameraGroup.add(camera);
  cameraNormalize = camera.rotation.clone();

  let geometry = null;
  let material = null;
  let points = null;
  cursorFieldForce = (event) => {
    let vector = new THREE.Vector3();
    // cursor.x = e.pageX;
    // cursor.y = -e.pageY + sizes.height;
    // cursor.moved = true;
    // console.log(cursor);
    event.preventDefault();
    cursor.x = (event.clientX / sizes.width) * 2 - 1;
    cursor.y = -(event.clientY / sizes.height) * 2 + 1;

    // Make the sphere follow the cursor
    vector.x = cursor.x;
    vector.y = cursor.y;
    vector.z = 0.5;
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = (0 - camera.position.y) / dir.y;
    pos = camera.position.clone().add(dir.multiplyScalar(distance));
    mouseMesh.position.copy(pos);
    // console.log(cursor);
  };
  parallax = {
    x: 0,
    y: 0,
  };
  cursorParallax = (event) => {
    parallax.x = event.clientX / sizes.width - 0.5;
    parallax.y = (event.clientY / sizes.height - 0.5) * -1;

    // console.log(parallax);
  };
  // used for blackhole frag shader
  // now deprecated
  const mouseDown = () => {
    clicked = true;
  };
  const mouseUp = () => {
    clicked = false;
  };

  // 2d label renderer
  const cloudServerLabel = new CSS2DObject({ ...cloudServer.value }.hudRef);
  cloudServerLabel.position.set(1, 0, 1);
  cloudServerLabel.center.set(0.5, 0.5);
  cloudServerLabel.layers.set(0);
  scene.add(cloudServerLabel);
  const superComputingLabel = new CSS2DObject(
    { ...superComputing.value }.hudRef
  );
  superComputingLabel.position.set(-3, 0, 0);
  superComputingLabel.center.set(0.5, 0.5);
  superComputingLabel.layers.set(0);
  scene.add(superComputingLabel);
  const HPCLabel = new CSS2DObject({ ...HPC.value }.hudRef);
  HPCLabel.position.set(1, 0, -1);
  HPCLabel.center.set(0.5, 0.5);
  HPCLabel.layers.set(0);
  scene.add(HPCLabel);
  // 3d label renderer
  console.log(scHUD.value);
  const superComputingScene = new CSS3DObject({ ...scHUD.value }.sceneRef);
  superComputingScene.position.set(-2300, -50, 0);
  superComputingScene.layers.set(0);
  css3DScene.add(superComputingScene);
  superComputingScene.lookAt(new THREE.Vector3(-3000, 200, 0));
  const generateGalaxy = () => {
    if (points !== null) {
      geometry.dispose();
      material.dispose();
      scene.remove(points);
      // make sure only 1 instance running
      window.removeEventListener("mousemove", cursorFieldForce);
      window.addEventListener("mousemove", cursorParallax);
      // window.removeEventListener("mousedown", mouseDown);
      // window.removeEventListener("mouseup", mouseUp);
    }
    /**
     * EventListener
     */
    cursor = {
      x: sizes.width / 2,
      y: sizes.height / 2,
      moved: false,
    };
    window.addEventListener("mousemove", cursorFieldForce);
    window.addEventListener("mousemove", cursorParallax);

    // window.addEventListener("mousedown", mouseDown);
    // window.addEventListener("mouseup", mouseUp);

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const randomness = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count * 1);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      // Position
      const radius = Math.random() * parameters.radius;

      const branchAngle =
        ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;

      positions[i3] = Math.cos(branchAngle) * radius;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = Math.sin(branchAngle) * radius;

      randomness[i3] = randomX;
      randomness[i3 + 1] = randomY;
      randomness[i3 + 2] = randomZ;

      // Color
      const mixedColor = insideColor.clone();
      mixedColor.lerp(outsideColor, radius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
      // Scale
      scales[i] = Math.random();
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute(
      "aRandomness",
      new THREE.BufferAttribute(randomness, 3)
    );

    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uSize: { value: 30 * renderer.getPixelRatio() },
        uTime: { value: 0 },
        // uSize: { value: 30 * renderer.getPixelRatio() },
        uSpeed: { value: parameters.rotationSpeedFactor },
        uMousePos: { value: new THREE.Vector3() },
        uBlackholeRadius: { value: parameters.blackholeRadius },
        uFieldForceDivisor: { value: parameters.fieldForceDivisor },
      },
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
      onBeforeCompile: (shader) => {
        // console.log(shader.vertexShader);
      },
    });
    /**
     * Shader
     */

    /**
     * Points
     */
    points = new THREE.Points(geometry, material);
    scene.add(points);
    // console.log(scene);
    /**
     * post-processing
     * 黑洞扭曲效果
     */
    // composer = new EffectComposer(renderer);
    // const renderPass = new RenderPass(scene, camera);
    // composer.addPass(renderPass);
    // const outputPass = new OutputPass();
    // composer.addPass(outputPass);

    // effectBlackHole = new ShaderPass({
    //   name: "blackHoleShader",
    //   uniforms: {
    //     tDiffuse: { type: "t", value: null },
    //     opacity: { value: 1.0 },
    //     uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
    //     uMouse: { value: new THREE.Vector2(cursor.x, cursor.y) },
    //     uMass: { value: curblackholeMass * 0.00001 },
    //     uTime: { value: 0 },
    //     uClickedTime: { value: 0 },
    //   },

    //   vertexShader: blackHoleVertexShader,
    //   // /* glsl */
    //   //     varying vec2 vUv;
    //   //     attribute vec2 a_position;
    //   //     void main() {
    //   //       vUv = uv;
    //   //       gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    //   //       // gl_Position = vec4(a_position, 0, 1);
    //   //     },
    //   fragmentShader: blackHoleFragmentShader,
    //   // /* glsl */
    //   //     uniform float opacity;
    //   //     uniform sampler2D textureInput;
    //   //     varying vec2 vUv;
    //   //     void main() {
    //   //       vec4 texel = texture2D( textureInput, vUv );
    //   //       // gl_FragColor = opacity * texel;
    //   //       gl_FragColor = texel;
    //   //     },
    // });
    // composer.addPass(effectBlackHole);
  };
  // debug GUI setting
  gui
    .add(parameters, "count")
    .min(100)
    .max(1000000)
    .step(100)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "radius")
    .min(0.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "branches")
    .min(2)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "randomness")
    .min(0)
    .max(2)
    .step(0.001)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "randomnessPower")
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "blackholeRadius")
    .min(0.1)
    .max(5)
    .step(0.1)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "fieldForceDivisor")
    .min(1)
    .max(100)
    .step(1)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "rotationSpeedFactor")
    .min(0.001)
    .max(1)
    .step(0.001)
    .onFinishChange(generateGalaxy);
  gui
    .add(parameters, "elapsedTime")
    .min(0)
    .max(60)
    .step(0.01)
    .onFinishChange(generateGalaxy);
  gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
  gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

  /**
   * Sizes
   */

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
   * helper
   */
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const helper = new THREE.CameraHelper(camera);
  scene.add(helper);
  // scene.add(camera);

  // Controls
  // const controls = new OrbitControls(camera, canvas.value);
  // controls.enableDamping = true;

  /**
   * Renderer
   */
  renderer = new THREE.WebGLRenderer();
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  console.log(renderer);

  /**
   * Generate the first galaxy
   */
  generateGalaxy();

  /**
   * Animate
   */
  const clock = new THREE.Clock();

  const render = () => {
    elapsedTime = clock.getElapsedTime();
    deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // const elapsedTime = parameters.elapsedTime;

    // blackhole shader time
    // if (curblackholeMass < blackholeMass - 50) {
    //   curblackholeMass += (blackholeMass - curblackholeMass) * 0.03;
    // }
    // if (clicked) {
    //   clickedTime += 0.03;
    // } else if (clickedTime > 0 && clicked == false) {
    //   clickedTime += -(clickedTime * 0.015);
    // }

    // Update controls
    // controls.update();
    // Update material
    material.uniforms.uTime.value = elapsedTime;
    material.uniforms.uMousePos.value.copy(pos);
    // update blackhole shader
    // effectBlackHole.uniforms.uTime.value = elapsedTime;
    // effectBlackHole.uniforms.uClickedTime.value = clickedTime;
    // effectBlackHole.uniforms.uMouse.value = new THREE.Vector2(cursor.x, cursor.y);

    // Update material
    // material.uniforms.uSpeed.value = parameters.rotationSpeedFactor;
    // parallax affect
    const parallaxY = parallax.y * 0.3;
    const parallaxX = parallax.x * 0.3;

    camera.rotation.z +=
      (parallaxX - camera.rotation.z + cameraNormalize.z) * deltaTime;
    camera.rotation.y +=
      (parallaxY - camera.rotation.y + cameraNormalize.y) * deltaTime;

    // Render
    renderer.render(scene, camera);
    label2DRenderer.render(scene, camera);
    label3DRenderer.render(css3DScene, camera);

    TWEEN.update();
    // 启用后处理
    // composer.render();
    // console.log(elapsedTime);
    // 递归调用渲染
    window.requestAnimationFrame(render);
  };
  label2DRenderer.setSize(sizes.width, sizes.height);
  label2DRenderer.domElement.style.position = "absolute";
  label2DRenderer.domElement.style.top = "0px";
  label3DRenderer.setSize(sizes.width, sizes.height);
  label3DRenderer.domElement.style.position = "absolute";
  label3DRenderer.domElement.style.top = "0px";
  canvas.value.appendChild(renderer.domElement);
  canvas.value.appendChild(label2DRenderer.domElement);
  canvas.value.appendChild(label3DRenderer.domElement);

  render();
});
onUnmounted(() => {
  gui.destroy();
  releaseRenderer(renderer, scene);
});
const isHudHidden = computed(() => {
  return isHUDScene.value == true ? "none" : "block";
});
function scenarioHidden(index) {
  return !(dataModel.value.detailSceneario == index);
}
</script>
<style lang="scss" scoped>
.HUD-isHudHidden {
  display: v-bind(isHudHidden);
}
</style>
