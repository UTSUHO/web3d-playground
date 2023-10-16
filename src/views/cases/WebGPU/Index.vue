<template>
  <Suspense>
    <template v-slot:default>
      <canvas
        ref="canvas"
        width="512"
        height="512"
        style="height: 100%"
      ></canvas>
    </template>
    <template v-slot:fallback>
      <canvas
        ref="canvas"
        width="512"
        height="512"
        style="height: 100%"
      ></canvas>
    </template>
  </Suspense>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
async function WebGPUPrepare() {
  console.log(navigator);
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("No appropriate GPUAdapter found.");
  } else {
    console.log("WebGPU Enabled");
    console.log(adapter);
  }
}
const canvas = ref(null);
const device = await adapter.requestDevice();
const context = canvas.value.getContext("webgpu");
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
  device: device,
  format: canvasFormat,
});
const encoder = device.createCommandEncoder();

onMounted(() => {
  WebGPUPrepare();
});
</script>
