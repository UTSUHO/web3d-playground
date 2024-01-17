<template>
  <v-app style="max-height: 100vh">
    <NavigationDrawler />
    <default-view />
    <!-- <cursor-circle /> -->
  </v-app>
</template>

<script setup>
import DefaultView from "./View.vue";
import NavigationDrawler from "@/components/NavigationDrawler.vue";
import CursorCircle from "@/components/CursorCircle.vue";
</script>
