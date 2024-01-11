<template>
  <div v-show="!isHidden" ref="hudRef" style="color: white">
    <div class="title">Access</div>
    <div class="title" style="max-width:80px;">{{ productName }}</div>
    <div class="HUD-image">
      <science v-if="svgType == 1" />
      <compute v-else-if="svgType == 2" />
      <brain v-else-if="svgType == 3" />
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, computed } from "vue";
import science from "@/assets/svg/galaxy/science.svg";
import compute from "@/assets/svg/galaxy/compute.svg";
import brain from "@/assets/svg/galaxy/brain.svg";
const hudRef = ref(null);
const productName = computed(() => {
  let temp;
  switch (props.svgType) {
    case 1:
      temp = "Cloud Server";
      break;
    case 2:
      temp = "Super Computing";
      break;
    case 3:
      temp = "Machine Learning";
      break;
  }
  return temp;
});
const props = defineProps({
  svgType: Number,
  isHidden: { type: Boolean, default: false },
});
// console.log(defineExpose)
defineExpose({ hudRef });
</script>
<style lang="scss" scoped>
.title{
  font-size:14px;
}
.HUD-image {
  height: 80px;
  width: 80px;
}
.icon__round {
  transform-origin: center;
  :deep(circle) {
    stroke: #6d48ff;
    stroke-width: 1;
    &.icon__default-circle {
      stroke: #6d48ff;
      fill: none;
      opacity: 1;
      transform: scale3D(1, 1, 1);
    }
    &.icon__second-circle {
      fill: none;
      opacity: 0.5;
      transform: scale3d(0.9, 0.9, 1);
    }
    &.icon__third-circle {
      fill: none;
      opacity: 0.3;
      transform: scale3d(0.8, 0.8, 1);
    }
    &.icon__background-circle {
      opacity: 0.4;
      stroke: none !important;
    }
  }
  ::v-deep .icon__content {
    color: white;
    fill: rgb(109, 72, 255);
    &-shine {
      filter: blur(0px);
      opacity: 0.6;
      fill: white;
      &-permanent {
        filter: blur(0.5px);
        opacity: 0.5;
        fill: white;
      }
    }
  }
}
</style>
