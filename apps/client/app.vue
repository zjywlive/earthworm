<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UModals />
    <Toaster
      :theme="darkMode === Theme.DARK ? 'dark' : 'light'"
      position="top-center"
      :toastOptions="{
        style: {
          background: darkMode === Theme.DARK ? '#c084fc' : '#f3e8ff',
          color: darkMode === Theme.DARK ? '#000' : '#6b21a8',
        },
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from "vue-sonner";

import { Theme, useDarkMode } from "~/composables/darkMode";
import { useUserStore } from "./store/user";

const { initDarkMode, darkMode } = useDarkMode();
initDarkMode();

// 本地版：直接初始化用户
const userStore = useUserStore();
userStore.initUser();
</script>

<style>
#jfToolbar,
.mod-json {
  display: none !important;
}
</style>
