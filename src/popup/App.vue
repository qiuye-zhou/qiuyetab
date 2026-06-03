<script setup lang="ts">
import { onMounted } from 'vue'
import webExtensionPolyfill from 'webextension-polyfill'

import BottomOperation from './components/BottomOperation.vue'
import HeadArea from './components/HeadArea.vue'
import { defaultFavoriteSites } from '@/config/defaultSites'

// 使用 browser API
const browser = webExtensionPolyfill

// 校验 URL 协议安全性
const isOpenableUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// 打开网站
const openSite = async (url: string) => {
  if (!isOpenableUrl(url)) {
    console.warn('拒绝打开非 http/https URL:', url)
    return
  }
  try {
    await browser.tabs.create({ url })
  } catch (err) {
    console.error('打开标签页失败:', err)
  }
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

    // 统一使用 === undefined 判断，避免 falsy 值误判
    if (
      localResult.searchEngine === undefined &&
      !('favoriteSites' in localResult) &&
      syncResult.searchEngine === undefined &&
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
