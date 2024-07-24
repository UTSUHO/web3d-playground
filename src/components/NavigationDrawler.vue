<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
  >
    <v-list-item title="Web 3D Playground" nav>
      <template v-slot:prepend>
        <v-icon
          icon="mdi-wizard-hat"
          size="x-large"
          style="margin-left: 4px"
        ></v-icon>
      </template>
      <template v-slot:append>
        <v-btn
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="rail = !rail"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-home"
        title="Home"
        value="home"
        to="/home"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-orbit"
        title="Galaxy Generator"
        value="galaxy-generator"
        to="/galaxy-generator"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-panorama-variant-outline"
        title="HDRI"
        value="hdri"
        to="/hdri"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-consolidate"
        title="Tres"
        value="tres"
        to="/tres"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-stove"
        title="Bake Experiment"
        value="bake-experiment"
        to="/bake-experiment"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-animation"
        title="Lottie-Web Animation"
        value="lottie"
        to="/lottie"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-tsunami"
        title="Wave"
        value="wave"
        to="/wave"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-script-text"
        title="Scroll Based 3D Animation"
        value="scroll"
        to="/scroll"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-city-variant-outline"
        title="City Model"
        value="city"
        to="/city"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-looks"
        title="Flying Lines"
        value="flyLine"
        to="/flyline"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-checkerboard"
        title="Shader Practice"
        value="shader-practice"
        to="/shader-practice"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-controller"
        title="WebGPU Conway's Game of Life"
        value="WebGPU"
        to="/WebGPU"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-wrench-outline"
        title="Particle Fiber"
        value="particleFiber"
        to="/reverse-engineering"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
export default {
  data() {
    return {
      drawer: true,
      rail: true,
    };
  },
};
</script>
<style lang="scss" scoped>
.v-list-item--link {
  // cursor: none;
}
</style>
