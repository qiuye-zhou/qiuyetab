<script setup lang="ts">
import { onMounted } from 'vue'
import webExtensionPolyfill from 'webextension-polyfill'

import BottomOperation from './components/BottomOperation.vue'
import HeadArea from './components/HeadArea.vue'
import { defaultFavoriteSites } from '@/config/defaultSites'

// 使用 browser API
const browser = webExtensionPolyfill

// 打开网站
const openSite = (url: string) => {
  browser.tabs.create({ url })
  window.close()
}

// 初始化默认设置
const initializeDefaultSettings = async () => {
  try {
    const localResult = await browser.storage.local.get([
      'searchEngine',
      'favoriteSites',
    ])

    const syncResult = await browser.storage.sync.get([
      'searchEngine',
      'favoriteSites',
    ])

    if (
      !localResult.searchEngine &&
      !('favoriteSites' in localResult) &&
      !syncResult.searchEngine &&
      !('favoriteSites' in syncResult)
    ) {
      await browser.storage.local.set({
        searchEngine: 'baidu',
        favoriteSites: defaultFavoriteSites,
      })
    }
  } catch (error) {
    console.error('初始化默认设置失败:', error)
  }
}

onMounted(async () => {
  await initializeDefaultSettings()
})
</script>

<template>
  <div
    class="w-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
  >
    <!-- 头部区域 -->
    <HeadArea />

    <!-- 底部操作 -->
    <BottomOperation @open-site="openSite" />
  </div>
</template>
