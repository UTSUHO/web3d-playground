import { SRGBColorSpace, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 封装渲染器调用
const renderer = new WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
  powerPreference: "high-performance",
});

document.body.append(renderer.domElement);
renderer.outputColorSpace = SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new Scene();
// 摄影机
const camera = new PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(2, 2, 2);
camera.lookAt(scene.position);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(window.devicePixelRatio);
  const dPR = renderer.getPixelRatio();

  for (const fn of resizes) {
    fn(w, h, dPR);
  }
}

async function render() {
  for (const fn of updates) {
    await fn();
  }
  renderer.render(scene, camera);
  renderer.setAnimationLoop(render);
}

const updates = [];

function addUpdate(fn) {
  updates.push(fn);
}

const resizes = [];

function addResize(fn) {
  resizes.push(fn);
}

window.addEventListener("resize", () => resize());

resize();

function getControls(cam = camera) {
  const controls = new OrbitControls(cam, renderer.domElement);
  return controls;
}

export {
  renderer,
  scene,
  addUpdate,
  addResize,
  getControls,
  camera,
  resize,
  render,
};
