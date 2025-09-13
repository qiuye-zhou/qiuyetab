<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import MainContent from './components/MainContent.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { useSettingsStore } from './store/modules/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const { isDarkMode, backgroundType, customBackground, backgroundOpacity } = storeToRefs(settingsStore)

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

// 计算背景样式
const backgroundStyle = computed(() => {
  // 始终使用主题背景颜色作为基础
  return {
    background: isDarkMode.value
      ? 'linear-gradient(to bottom right, #1f2937, #111827)'
      : 'linear-gradient(to bottom right, #fefefe, #f8f9fa)'
  }
})

// 计算背景图片URL和透明度（用于CSS变量）
const backgroundImageUrl = computed(() => {
  if (backgroundType.value === 'custom' && customBackground.value) {
    return `url(${customBackground.value})`
  }
  return 'none'
})

const backgroundImageOpacity = computed(() => {
  return backgroundOpacity.value
})

// 初始化主题
onMounted(async () => {
  await settingsStore.initTheme()
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center relative transition-colors duration-300"
    :class="isDarkMode ? 'dark' : ''"
    :style="{ ...backgroundStyle, '--bg-image': backgroundImageUrl, '--bg-opacity': backgroundImageOpacity }"
    :data-has-bg="backgroundImageUrl ? 'true' : 'false'">
    <!-- 设置按钮 -->
    <button @click="toggleSettings"
      class="fixed top-2 right-2 z-50 p-3 transition-all duration-300 hover:scale-105 cursor-pointer">
      <Icon icon="mdi:cog" class="text-2xl text-gray-600 dark:text-gray-300" />
    </button>

    <!-- 主要内容区域 -->
    <MainContent></MainContent>

    <!-- 设置面板 -->
    <SettingsPanel :is-open="isSettingsOpen" @close="closeSettings" />
  </div>
</template>

<style scoped>
/* 自定义背景图片 - 使用伪元素 */
.min-h-screen[data-has-bg="true"]::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: var(--bg-opacity);
  z-index: 1;
  pointer-events: none;
}
/* 背景装饰 - 仅在默认背景时显示 */
.min-h-screen[data-has-bg="false"]::before {
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

/* 深色模式下的背景装饰 */
.dark .min-h-screen[data-has-bg="false"]::before {
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 200, 198, 0.1) 0%, transparent 50%);
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

/* 深色模式滚动条 */
.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}
</style>
