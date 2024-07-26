<template>
	<div ref="canvas"></div>
	<logoHud ref="cloudServer" class="HUD-isHudHidden" :svg-type="1" />
	<logoHud ref="superComputing" class="HUD-isHudHidden" :svg-type="2" />
	<logoHud ref="HPC" class="HUD-isHudHidden" :svg-type="3" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { HDRJPGLoader } from '@monogrid/gainmap-js';
import logoHud from "@/views/cases/galaxy-generator/components/logoHUD.vue";

import {
	CSS2DRenderer,
	CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

const params = {
	roughness: 0.0,
	metalness: 1.0,
	exposure: 1.0,
	debug: false
};

const canvas = ref(null);


let container, stats;
let camera, scene, renderer, controls, label2DRenderer;
let torusMesh, planeMesh;
let hdrJpg, hdrJpgPMREMRenderTarget, hdrJpgEquirectangularMap;
let hdrPMREMRenderTarget, hdrEquirectangularMap;
label2DRenderer = new CSS2DRenderer();

const cloudServer = ref(null);
const superComputing = ref(null);
const HPC = ref(null);

const fileSizes = {};
const resolutions = {};

onMounted(() => {
	init();
	// 2d label renderer
	const cloudServerLabel = new CSS2DObject({ ...cloudServer.value }.hudRef);
	cloudServerLabel.position.set(100, 0, 100);
	cloudServerLabel.center.set(0.5, 0.5);
	cloudServerLabel.layers.set(0);
	scene.add(cloudServerLabel);
	const superComputingLabel = new CSS2DObject(
		{ ...superComputing.value }.hudRef
	);
	superComputingLabel.position.set(-100, 0, 100);
	superComputingLabel.center.set(0.5, 0.5);
	superComputingLabel.layers.set(0);
	scene.add(superComputingLabel);
	const HPCLabel = new CSS2DObject({ ...HPC.value }.hudRef);
	HPCLabel.position.set(-100, 0,-100);
	HPCLabel.center.set(0.5, 0.5);
	HPCLabel.layers.set(0);
	scene.add(HPCLabel);
})

function init() {

	// const lbl = document.getElementById('lbl_left');

	// container = document.createElement('div');
	// canvas.value.appendChild(container);

	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 500);
	camera.position.set(0, 0, 0.1);

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	const axesHelper = new THREE.AxesHelper( 100 );
	scene.add( axesHelper );
	//

	let geometry = new THREE.TorusKnotGeometry(18, 8, 200, 40, 1, 3);
	let material = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		metalness: params.metalness,
		roughness: params.roughness
	});

	torusMesh = new THREE.Mesh(geometry, material);
	scene.add(torusMesh);


	geometry = new THREE.PlaneGeometry(200, 200);
	material = new THREE.MeshBasicMaterial();

	planeMesh = new THREE.Mesh(geometry, material);
	planeMesh.position.y = - 0;
	planeMesh.rotation.x = - Math.PI * 0.5;
	scene.add(planeMesh);


	const pmremGenerator = new THREE.PMREMGenerator(renderer);
	pmremGenerator.compileEquirectangularShader();

	THREE.DefaultLoadingManager.onLoad = function () {

		pmremGenerator.dispose();

	};



	// hdrJpg = new HDRJPGLoader(renderer)
	// 	.load('textures/hdri/anniversary_lounge_4k.hdr.jpg', function () {

	// 		resolutions['HDR JPG'] = hdrJpg.width + 'x' + hdrJpg.height;

	// 		displayStats('HDR JPG');

	// 		hdrJpgEquirectangularMap = hdrJpg.renderTarget.texture;
	// 		hdrJpgPMREMRenderTarget = pmremGenerator.fromEquirectangular(hdrJpgEquirectangularMap);

	// 		hdrJpgEquirectangularMap.mapping = THREE.EquirectangularReflectionMapping;
	// 		hdrJpgEquirectangularMap.needsUpdate = true;

	// 		hdrJpg.dispose();

	// 	}, function (progress) {

	// 		fileSizes['HDR JPG'] = humanFileSize(progress.total);

	// 	});
	const panoramaGeometry = new THREE.SphereGeometry(100, 60, 40);
	// invert the geometry on the x-axis so that all of the faces point inward
	panoramaGeometry.scale(- 1, 1, 1);
	const texture = new THREE.TextureLoader().load('textures/hdri/2294472375_24a3b8ef46_o.jpg');
	texture.colorSpace = THREE.SRGBColorSpace;
	const panoramaMaterial = new THREE.MeshBasicMaterial({ map: texture });

	const panoramaMesh = new THREE.Mesh(panoramaGeometry, panoramaMaterial);
	scene.add( panoramaMesh );


	hdrEquirectangularMap = new RGBELoader()
		.load('textures/hdri/anniversary_lounge_4k.hdr', function (texture) {

			resolutions['HDR'] = hdrEquirectangularMap.image.width + 'x' + hdrEquirectangularMap.image.height;



			hdrPMREMRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirectangularMap);

			hdrEquirectangularMap.mapping = THREE.EquirectangularReflectionMapping;
			hdrEquirectangularMap.minFilter = THREE.LinearFilter;
			hdrEquirectangularMap.magFilter = THREE.LinearFilter;
			hdrEquirectangularMap.needsUpdate = true;

		}, function (progress) {

			fileSizes['HDR'] = humanFileSize(progress.total);

		});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	// container.appendChild(renderer.domElement);

	// stats = new Stats();
	// container.appendChild(stats.dom);
	label2DRenderer.setSize(window.innerWidth, window.innerHeight);
	label2DRenderer.domElement.style.position = "absolute";
	label2DRenderer.domElement.style.top = "0px";

	canvas.value.appendChild(renderer.domElement);
	canvas.value.appendChild(label2DRenderer.domElement);
	controls = new OrbitControls(camera, label2DRenderer.domElement);
	// controls.minDistance = 0;
	// controls.maxDistance = 5;

	window.addEventListener('resize', onWindowResize);

	const gui = new GUI();

	// gui.add(params, 'envMap', ['HDR JPG', 'HDR']).onChange(displayStats);
	gui.add(params, 'roughness', 0, 1, 0.01);
	gui.add(params, 'metalness', 0, 1, 0.01);
	gui.add(params, 'exposure', 0, 2, 0.01);
	gui.add(params, 'debug');
	gui.open();

	function displayStats(value) {

		// lbl.innerHTML = value + ' size : ' + fileSizes[value] + ', Resolution: ' + resolutions[value];

	}

}


function humanFileSize(bytes, si = true, dp = 1) {

	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {

		return bytes + ' B';

	}

	const units = si
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = - 1;
	const r = 10 ** dp;

	do {

		bytes /= thresh;
		++u;

	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

	return bytes.toFixed(dp) + ' ' + units[u];

}


function onWindowResize() {

	const width = window.innerWidth;
	const height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);

}

function animate() {

	// stats.begin();
	render();
	// stats.end();

}

function render() {

	torusMesh.material.roughness = params.roughness;
	torusMesh.material.metalness = params.metalness;

	let pmremRenderTarget, equirectangularMap;

	// switch (params.envMap) {

	// 	case 'HDR JPG':
	// 		pmremRenderTarget = hdrJpgPMREMRenderTarget;
	// 		equirectangularMap = hdrJpgEquirectangularMap;
	// 		break;
	// 	case 'HDR':
	pmremRenderTarget = hdrPMREMRenderTarget;
	equirectangularMap = hdrEquirectangularMap;
	// 		break;

	// }

	const newEnvMap = pmremRenderTarget ? pmremRenderTarget.texture : null;

	if (newEnvMap && newEnvMap !== torusMesh.material.envMap) {

		planeMesh.material.map = newEnvMap;
		planeMesh.material.needsUpdate = true;

	}

	torusMesh.rotation.y += 0.005;
	torusMesh.visible = false;
	planeMesh.visible = params.debug;

	scene.environment = equirectangularMap;
	scene.background = equirectangularMap;
	renderer.toneMappingExposure = params.exposure;

	renderer.render(scene, camera);
	label2DRenderer.render(scene, camera);


}

</script>
<style lang="scss" scoped></style>