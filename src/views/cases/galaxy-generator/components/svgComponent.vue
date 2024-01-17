<template>
  <science />
</template>
<script setup>
import science from "@/assets/svg/galaxy/science.svg";
</script>
<style lang="scss" scoped>
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
