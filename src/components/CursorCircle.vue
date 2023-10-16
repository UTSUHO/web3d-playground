<template>
  <div class="cursorCircle" :style="style">
    <div class="cursorDot"></div>
  </div>
</template>
<script setup>
import { onMounted, computed, onUnmounted, ref } from "vue";
const posX = ref(0);
const posY = ref(0);
const style = computed(() => {
  return `transform: translate3d(${posX.value}px,${posY.value}px,0px)`;
});

function update(event) {
  posX.value = event.pageX;
  posY.value = event.pageY;
  //   console.log(style);
}
onMounted(() => window.addEventListener("mousemove", update));
onUnmounted(() => window.removeEventListener("mousemove", update));
</script>

<style lang="scss" scoped>
.cursorCircle {
  position: absolute;
  z-index: 10000;
  left: -7.5px;
  top: -7.5px;
  pointer-events: none;
  mix-blend-mode: difference;
  background-color: rgb(255, 255, 255);
  .cursorDot {
    position: absolute;
    left: 0;
    top: 0;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: #fff;
    // opacity: 0;
    transition-property: transform, opacity;
    transition-duration: 0.3s;
    transition-timing-function: cubic-bezier(0.3, 0.1, 0.2, 1);
  }
}
.on-text {
  transform: scale3d(2.5, 2.5, 1);
}
</style>
