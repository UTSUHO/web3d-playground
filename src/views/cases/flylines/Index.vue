<template>
  <div ref="canvas"></div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import TWEEN from "@tweenjs/tween.js";
import flyLineVertexShader from "./shaders/flyline/vertex.glsl?raw";
import flyLineFragmentShader from "./shaders/flyline/fragment.glsl?raw";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { releaseRenderer } from "@/util/releaseRenderer";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = ref(null);
// const stats = new Stats();
// stats.dom.className = "stats";
const scene = new THREE.Scene();
let controls;
// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.set(0, 100, 0);

//renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
console.log(window.innerWidth, window.innerHeight);

const planeSize = 100;
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/src/assets/img/checker.png");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -0.5;
scene.add(mesh);
// line
const lineData = [
  { begin: [0, 0], end: [10, 0], height: 10 },
  { begin: [0, 0], end: [-20, 0], height: 10 },
  { begin: [0, 0], end: [15, 15], height: 10 },

  { begin: [0, 0], end: [0, -10], height: 10 },
  { begin: [0, 0], end: [0, 20], height: 10 },
  { begin: [0, 0], end: [-15, -15], height: 10 },
];

function drawShinyLine() {
  const threeGroup = new THREE.Group();

  lineData.map((data) => {
    const startPoint = data.begin;
    const endPoint = data.end;
    const curveHeight = data.height;

    const begin = new THREE.Vector3(startPoint[0], 0, startPoint[1]);
    const end = new THREE.Vector3(endPoint[0], 0, endPoint[1]);
    // const len = begin.distanceTo(end);

    // create geometric pipe
    const pointInLine = [
      new THREE.Vector3(startPoint[0], 0, startPoint[1]),
      // 中间点

      new THREE.Vector3(
        (startPoint[0] + endPoint[0]) / 2,
        curveHeight,
        (startPoint[1] + endPoint[1]) / 2
      ),
      //   new THREE.Vector3(startPoint[0], 0, startPoint[1]),
      //   new THREE.Vector3(
      //     (startPoint[0] + endPoint[0]) / 2,
      //     curveHeight,
      //     (startPoint[1] + endPoint[1]) / 2
      //   ),
      new THREE.Vector3(endPoint[0], 0, endPoint[1]),
    ];
    const lineCurve = new THREE.CatmullRomCurve3(pointInLine);
    const points = lineCurve.getPoints(1000);
    // 用于控制shader投射物头部方向
    const indexList = [];
    const positionList = [];

    points.forEach((item, index) => {
      indexList.push(index);
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setAttribute(
      "aIndex",
      new THREE.Float32BufferAttribute(indexList, 1)
    );
    // console.log(new THREE.Float32BufferAttribute(indexList, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("orange") },
        uTime: { value: 0 },
        uLength: {
          value: points.length,
        },
      },
      vertexShader: flyLineVertexShader,
      fragmentShader: flyLineFragmentShader,
      transparent: true,
    });
    threeGroup.add(new THREE.Points(geometry, material));
    let tween = new TWEEN.Tween({ index: 0 })
      .to({ index: 1000 }, 2000)
      .onUpdate(function (t) {
        let id = Math.ceil(t.index);
        material.uniforms.uTime.value = id;
      })
      .repeat(Infinity);
    tween.start();
  });
  return threeGroup;
}

scene.add(drawShinyLine());
// light
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
function render(time) {
  TWEEN.update();

  //   stats.update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
onMounted(() => {
  //   console.log(stats.dom.className);
  canvas.value.appendChild(renderer.domElement);
  //   canvas.value.appendChild(stats.dom);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);
  controls.update();
  render();
});
onUnmounted(() => {
  releaseRenderer(renderer, scene);
});
</script>
