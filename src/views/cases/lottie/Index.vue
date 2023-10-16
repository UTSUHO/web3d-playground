<template>
  <div class="container">
    <div ref="lottieAnimePCB" class="lottie"></div>
    <div ref="lottieAnimeML" class="lottie"></div>
  </div>
</template>

<script setup>
import lottie from "lottie-web";
import { onMounted, ref, onUnmounted } from "vue";
const lottieAnimePCB = ref();
const lottieAnimeML = ref();
console.log(lottie);
onMounted(() => {
  const pcb = lottie.loadAnimation({
    container: lottieAnimePCB.value,
    path: "./pcbAnimation.json",
    renderer: "svg",
    loop: true,
    autoplay: "true",
    name: "pcb",
  });
  const ml = lottie.loadAnimation({
    container: lottieAnimeML.value,
    path: "./mlAnimation.json",
    renderer: "svg",
    loop: true,
    autoplay: "true",
    name: "ml",
  });
  console.log(lottie.getRegisteredAnimations());
});
onUnmounted(()=>{
    lottie.destroy()
})
</script>
<style lang="scss">
.container {
  display: flex;
  background: black;
  height: 100%;
  overflow: hidden;
  .lottie {
  }
}
</style>
