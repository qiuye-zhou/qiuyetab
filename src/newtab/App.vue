<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import MainContent from './components/MainContent.vue'
import SettingsPanel from './components/SettingsPanel.vue'

// 设置面板状态
const isSettingsOpen = ref(false)

// 切换设置面板
const toggleSettings = () => {
  isSettingsOpen.value = !isSettingsOpen.value
}

// 关闭设置面板
const closeSettings = () => {
  isSettingsOpen.value = false
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center relative"
    style="background: linear-gradient(to bottom right, #fefefe, #f8f9fa)">
    <!-- 设置按钮 -->
    <button @click="toggleSettings"
      class="fixed top-2 right-2 z-50 p-3 transition-all duration-300 hover:scale-105 cursor-pointer">
      <Icon icon="mdi:cog" class="text-2xl text-gray-600" />
    </button>

    <!-- 主要内容区域 -->
    <MainContent></MainContent>

    <!-- 设置面板 -->
    <SettingsPanel :is-open="isSettingsOpen" @close="closeSettings" />
  </div>
</template>

<style scoped>
/* 背景装饰 */
.min-h-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 200, 198, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(209, 213, 219, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
