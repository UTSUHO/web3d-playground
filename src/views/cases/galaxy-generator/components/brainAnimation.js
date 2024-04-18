import * as THREE from "three";
import { data } from "../assets/data";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import brainVertexShader from "../shaders/brain/vertex.glsl?raw";
import brainFragmentShader from "../shaders/brain/fragment.glsl?raw";
import particleVertexShader from "../shaders/particle/vertex.glsl?raw";
import particleFragmentShader from "../shaders/particle/fragment.glsl?raw";
import { randomRange } from "@/util/three/random";

export function init() {
  let myPoints = { current: [] };
  const PATHS = data.economics[0].paths;
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
    // scene.add(tube);
    return tube;
  }

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
      positions.push(
        randomRange(-1, 1),
        randomRange(-1, 1),
        randomRange(-1, 1)
      );
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
  const tube = brainTubes();
  tube.scale.set(10, 10, 10);
  tube.position.set(0, 0.5, 0);
  const particle = new THREE.Points(particleGeometry, particleMaterial);
  particle.scale.set(10, 10, 10);
  particle.position.set(0, 0.5, 0);

  //   scene.add(particle);
  return {
    particleGeometry: particleGeometry,
    myPoints: myPoints,
    tubeMesh: tube,
    particleMesh: particle,
  };
}
export function particleCPUAnimation(particleGeometry, myPoints) {
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
