<script setup>
import * as TWEEN from "@tweenjs/tween.js";
import { ref, defineProps, computed, watch } from "vue";
const sceneRef = ref(null);
defineExpose({ sceneRef });
const props = defineProps({
  isHidden: { type: Boolean, default: true },
});
const cssHidden = computed(() => {
  return props.isHidden == true ? "0" : "1";
});
</script>
<template>
  <div ref="sceneRef" class="anime-container isSceneHudHidden">
    <div class="content-container">
      <div class="title">Cloud Server</div>
      <div class="paragraph">
        Lorem ipsum dolor sit amet, falli liber aeterno sit ei. Cu mollis
        scaevola eos.
      </div>
      <v-btn class="btn" variant="outlined">view our portfolio</v-btn>
    </div>
    <div class="business-bar">
      <div class="business-item">
        <img src="../assets/算力实验室.png" />
      </div>
      <div class="business-item">
        <img src="../assets/中科天玑.png" />
      </div>
      <div class="business-item">
        <img src="../assets/中科海微.png" />
      </div>
      <div class="business-item">
        <img src="../assets/中科睿芯.png" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.anime-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: white;
  max-height: 60vh;
  .content-container {
    text-align: center;
    flex-direction: column;
    margin: 0 15%;
    .title {
      font-size: 14px;
      margin-bottom: 14px;
    }
    .paragraph {
      font-size: 46px;
    }
    .btn {
      margin: 80px 0;
    }
  }
  .business-bar {
    display: flex;
    margin: 0 15%;

    .business-item {
      height: 180px;
      margin: 12px;
      width: 25%;
      img {
        height: 100px;

        margin: 0 32px;
      }
    }
  }
}
.isSceneHudHidden {
  opacity: v-bind(cssHidden);
  transition: opacity 1s;
}
</style>
