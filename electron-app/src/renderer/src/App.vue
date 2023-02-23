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

const handleSendApi = async () => {
  // @ts-ignore
  window.api.setTitle(`当前时间戳：${Date.now()}`);

  // 双向通信
  // @ts-ignore
  const res = await window.api.show(Date.now());
  text.value = res;
}

// 向预加载脚本传递回调方法，用于处理主进程的消息
// @ts-ignore
window.api.incrementNumber((event: { sender: { send: (arg0: string, arg1: string) => void; }; }, value: string) => {
  text.value = value;
  // 向主进程发送消息
  event.sender.send("finish", "h1.innerHTML");
})
</script>

<style lang="less">
@import "./assets/css/styles.less";
</style>
