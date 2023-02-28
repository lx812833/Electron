<template>
  <div class="wrapper" @contextmenu.prevent="handleRightClick">
    <Versions />
    <svg class="hero-logo" viewBox="0 0 900 300">
      <use xlink:href="./assets/icons.svg#electron" />
    </svg>
    <h2 class="hero-text">{{ text }}</h2>
    <a href="https://www.bilibili.com/" target="__blank">哔哩哔哩</a>
    <button @click="handleSendApi">切换</button>
    <button @click="handleSelectFile">选择文件</button>
    <button @click="handleToggleMode">{{ mode }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Versions from "./components/Versions.vue";

const text = ref("Electron + Vue3 + Vite");
const mode = ref('dark');

// 切换light/dark模式
const handleToggleMode = async () => {
  // @ts-ignore
  const type = await window.api.modeToggle();
  mode.value = type ? 'light' : 'dark';
}

const handleRightClick = () => {
  // @ts-ignore
  window.api.showContextMenu();
}

const handleSendApi = async () => {
  // @ts-ignore
  window.api.setTitle(`当前时间戳：${Date.now()}`);

  // 双向通信
  // @ts-ignore
  const res = await window.api.show(Date.now());
  text.value = res;
}

const handleSelectFile = async () => {
  // @ts-ignore
  const result = await window.api.selectFile();
  console.log("文件选择", result);
  // @ts-ignore
  await window.api.saveFile(result.filePaths);
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
.wrapper {
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
