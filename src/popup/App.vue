<script setup lang="ts">
import { ref, onMounted } from 'vue'
import webExtensionPolyfill from 'webextension-polyfill'

import BottomOperation from './components/BottomOperation.vue'
import CurrentTab from './components/CurrentTab.vue'
import HeadArea from './components/HeadArea.vue'
import QuickOperation from './components/QuickOperation.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import FavoriteSites from './components/FavoriteSites.vue'


// 使用 browser API
const browser = webExtensionPolyfill

// 打开网站
const openSite = (url: string) => {
  browser.tabs.create({ url })
  window.close()
}

// 通知其他子组件更新配置
const updateSettings = ref(false)

// 初始化默认设置
const initializeDefaultSettings = async () => {
  try {
    // 检查local存储
    const localResult = await browser.storage.local.get(['searchEngine', 'favoriteSites'])

    // 检查sync存储
    const syncResult = await browser.storage.sync.get(['searchEngine', 'favoriteSites'])

    // 如果两个存储都没有数据，设置默认值到local存储
    if (!localResult.searchEngine && !localResult.favoriteSites &&
      !syncResult.searchEngine && !syncResult.favoriteSites) {

      const defaultData = {
        searchEngine: 'baidu',
        favoriteSites: [
          { id: 1, name: 'GitHub', url: 'https://github.com', favicon: 'mdi:github' },
          { id: 2, name: 'TypeScript', url: 'https://www.typescriptlang.org', favicon: 'simple-icons:typescript' }
        ]
      }

      await browser.storage.local.set(defaultData)
    }
  } catch (error) {
    console.error('初始化默认设置失败:', error)
  }
}

onMounted(async () => {
  // 初始化默认设置
  await initializeDefaultSettings()
})
</script>

<template>
  <div class="w-96 min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
    style="background: linear-gradient(to bottom right, #fefefe, #f8f9fa)">
    <!-- 设置面板 -->
    <SettingsPanel @update-settings="updateSettings = !updateSettings" />

    <!-- 头部区域 -->
    <HeadArea :update-settings="updateSettings"></HeadArea>

    <!-- 快捷操作 -->
    <QuickOperation></QuickOperation>

    <!-- 常用网站列表 -->
    <FavoriteSites :update-settings="updateSettings"  @update-settings="updateSettings = !updateSettings" />

    <!-- 当前标签页 -->
    <CurrentTab></CurrentTab>

    <!-- 底部操作 -->
    <BottomOperation @open-site="openSite"></BottomOperation>
  </div>
</template>

<style scoped>
/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 深色模式滚动条 */
.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Firefox 滚动条样式 */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.dark * {
  scrollbar-color: #6b7280 #374151;
}

/* 确保设置面板的滚动条样式 */
.overflow-y-auto {
  scrollbar-gutter: stable;
}
</style>
