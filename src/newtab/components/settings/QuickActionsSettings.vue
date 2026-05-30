<script setup lang="ts">
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

// 检测是否为 Firefox
const isFirefox = navigator.userAgent.includes('Firefox')

const quickActions = [
  {
    name: '历史记录',
    icon: 'mdi:history',
    url: isFirefox ? 'about:history' : 'chrome://history/',
    desc: '查看浏览历史',
  },
  {
    name: '下载',
    icon: 'mdi:download',
    url: isFirefox ? 'about:downloads' : 'chrome://downloads/',
    desc: '查看下载记录',
  },
  {
    name: '书签',
    icon: 'mdi:bookmark',
    url: isFirefox ? 'about:places' : 'chrome://bookmarks/',
    desc: '管理书签',
  },
]

const openAction = (url: string) => {
  browser.tabs.create({ url }).catch(() => {
    // 某些浏览器可能不支持特定的内部 URL，静默忽略
  })
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        快捷操作
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        快速打开浏览器内置页面
      </p>
    </div>

    <div class="space-y-2">
      <button
        v-for="action in quickActions"
        :key="action.url"
        @click="openAction(action.url)"
        class="w-full flex items-center p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer"
      >
        <div
          class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-600 flex items-center justify-center flex-shrink-0"
        >
          <Icon
            :icon="action.icon"
            class="text-lg text-gray-600 dark:text-gray-300"
          />
        </div>
        <div class="ml-3 text-left">
          <div class="text-sm font-medium text-gray-800 dark:text-gray-200">
            {{ action.name }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ action.desc }}
          </div>
        </div>
        <Icon
          icon="mdi:open-in-new"
          class="ml-auto text-gray-400 dark:text-gray-500"
        />
      </button>
    </div>
  </div>
</template>
