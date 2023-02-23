<template>
  <Versions />
  <svg class="hero-logo" viewBox="0 0 900 300">
    <use xlink:href="./assets/icons.svg#electron" />
  </svg>
  <h2 class="hero-text">{{ text }}</h2>
  <button @click="handleSendApi">切换</button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Versions from "./components/Versions.vue";

const text = ref("Electron + Vue3 + Vite");

const handleSendApi = () => {
  // @ts-ignore
  window.api.setTitle(`当前时间戳：${Date.now()}`);
}
</script>

<style lang="less">
@import "./assets/css/styles.less";
</style>
