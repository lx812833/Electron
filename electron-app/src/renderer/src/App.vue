<template>
  <Versions />
  <svg class="hero-logo" viewBox="0 0 900 300">
    <use xlink:href="./assets/icons.svg#electron" />
  </svg>
  <h2 class="hero-text">Electron + Vue3 + Vite</h2>
</template>

<script setup lang="ts">
import Versions from './components/Versions.vue'
</script>

<style lang="less">
@import './assets/css/styles.less';
</style>
