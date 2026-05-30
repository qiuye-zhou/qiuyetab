<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

interface TabInfo {
  id?: number
  title?: string
  favIconUrl?: string
  url?: string
  active?: boolean
}

const tabs = ref<TabInfo[]>([])

// 防抖
let updateTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedUpdate = () => {
  if (updateTimeout) clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => loadTabs(), 100)
}

// 加载标签页
const loadTabs = async () => {
  try {
    const currentTabs = await browser.tabs.query({ currentWindow: true })
    tabs.value = currentTabs
  } catch (error) {
    console.error('获取标签页失败:', error)
  }
}

// 切换标签页
const switchToTab = (tabId: number | undefined) => {
  if (tabId !== undefined) {
    browser.tabs.update(tabId, { active: true })
  }
}

// 关闭标签页
const closeTab = async (tabId: number | undefined, event: Event) => {
  event.stopPropagation()
  if (tabId !== undefined) {
    try {
      await browser.tabs.remove(tabId)
    } catch (error) {
      console.error('关闭标签页失败:', error)
    }
  }
}

// 图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) target.style.display = 'none'
}

// 监听标签页变化
const handleTabRemoved = () => debouncedUpdate()
const handleTabUpdated = () => debouncedUpdate()

onMounted(() => {
  loadTabs()
  browser.tabs.onRemoved.addListener(handleTabRemoved)
  browser.tabs.onUpdated.addListener(handleTabUpdated)
})

onUnmounted(() => {
  browser.tabs.onRemoved.removeListener(handleTabRemoved)
  browser.tabs.onUpdated.removeListener(handleTabUpdated)
  if (updateTimeout) clearTimeout(updateTimeout)
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        标签页管理
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        查看和管理当前窗口的标签页
      </p>
    </div>

    <div
      v-if="tabs.length === 0"
      class="text-center py-8 text-gray-500 dark:text-gray-400"
    >
      <Icon icon="mdi:tab" class="text-3xl mb-2" />
      <div class="text-sm">暂无标签页</div>
    </div>

    <div class="space-y-2">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        @click="switchToTab(tab.id)"
        class="flex items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer group transition-colors duration-200"
        :class="{
          'border-blue-300 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20':
            tab.active,
        }"
      >
        <div
          class="w-5 h-5 flex-shrink-0 flex items-center justify-center mr-3"
        >
          <img
            v-if="tab.favIconUrl"
            :src="tab.favIconUrl"
            class="w-4 h-4"
            :alt="tab.title"
            @error="handleImageError"
          />
          <Icon v-else icon="mdi:web" class="w-4 h-4 text-gray-400" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-700 dark:text-gray-200 truncate">
            {{ tab.title }}
          </div>
        </div>
        <button
          @click="closeTab(tab.id, $event)"
          class="opacity-0 group-hover:opacity-100 ml-2 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
        >
          <Icon icon="mdi:close" class="text-sm text-red-500" />
        </button>
      </div>
    </div>
  </div>
</template>
