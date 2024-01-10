<template>
  <div v-if="planType" style="display: flex">
    <div class="block" style="background-color: aqua"></div>
    <div class="block" style="background-color: brown"></div>
    <div class="block" style="background-color: yellow"></div>
  </div>
  <div v-else>
    <div class="block planb" style="width: 100vw">
      <div class="nav"><div style="margin:auto;width:120px;height:50px;">导航区域</div></div>
    </div>
  </div>
  <v-btn class="change" @click="changePlan">switch</v-btn>
</template>
<script setup>
import { ref } from "vue";
const planType = ref(true);
const changePlan = () => {
  planType.value = !planType.value;
};
const planbColor = ref("brown")
</script>
<style lang="scss" scoped>
.block {
  width: 33vw;
  height: 100vh;
}
.change {
  position: fixed;
  right: 0px;
}
.planb{
    display: v-bind(isHudHidden);
}
.nav {
  position: fixed;
  bottom: 100px;
  left: 25vw;
  border: black 5px solid;
  width: 50vw;
  height: 100px;
}
</style>
