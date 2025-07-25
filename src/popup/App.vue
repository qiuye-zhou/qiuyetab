<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'

// 使用 browser API
const browser = webExtensionPolyfill

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
  }
}

// 版本信息 - 从package.json自动获取
declare const __VERSION__: string
const appVersion = __VERSION__

const searchQuery = ref('')
const currentTime = ref('')
const currentDate = ref('')
const quickActions = ref([
  { name: '历史记录', icon: 'mdi:history', action: 'history' },
  { name: '下载', icon: 'mdi:download', action: 'downloads' },
  { name: '书签', icon: 'mdi:bookmark', action: 'bookmarks' },
  { name: '设置', icon: 'mdi:settings', action: 'settings' }
])

const recentSites = ref([
  { name: 'GitHub', url: 'https://github.com', favicon: 'mdi:github' },
  { name: 'Vue.js', url: 'https://vuejs.org', favicon: 'mdi:vuejs' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org', favicon: 'simple-icons:typescript' }
])

interface TabInfo {
  id?: number
  title?: string
  favIconUrl?: string
  url?: string
  active?: boolean
}

const tabs = ref<TabInfo[]>([])

// 时间更新
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  })
}

// 搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery.value)}`
    browser.tabs.create({ url: searchUrl })
    window.close()
  }
}

// 快捷操作
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'history':
      browser.tabs.create({ url: 'chrome://history/' })
      break
    case 'downloads':
      browser.tabs.create({ url: 'chrome://downloads/' })
      break
    case 'bookmarks':
      browser.tabs.create({ url: 'chrome://bookmarks/' })
      break
    case 'settings':
      browser.tabs.create({ url: 'chrome://settings/' })
      break
  }
  window.close()
}

// 打开网站
const openSite = (url: string) => {
  browser.tabs.create({ url })
  window.close()
}

// 打开新标签页
const openNewTab = () => {
  browser.tabs.create({ url: 'chrome://newtab/' })
  window.close()
}

// 获取当前标签页信息
const getCurrentTabs = async () => {
  try {
    const currentTabs = await browser.tabs.query({ currentWindow: true })
    tabs.value = currentTabs.slice(0, 5) // 只显示前5个标签页
  } catch (error) {
    console.error('获取标签页失败:', error)
  }
}

// 切换到指定标签页
const switchToTab = (tabId: number | undefined) => {
  if (tabId) {
    browser.tabs.update(tabId, { active: true })
    window.close()
  }
}

// 关闭标签页
const closeTab = (tabId: number | undefined, event: Event) => {
  event.stopPropagation()
  if (tabId) {
    browser.tabs.remove(tabId)
    getCurrentTabs()
  }
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  getCurrentTabs()
})
</script>

<template>
  <div class="w-96 min-h-[500px] bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900" style="background: linear-gradient(to bottom right, #fdfffd, #f8fef8)">
    <!-- 头部区域 -->
    <div class="p-4 border-b border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h1 class="text-xl font-bold text-green-600 dark:text-green-300">秋叶标签页</h1>
            <span class="text-xs bg-gray-50 dark:bg-green-800 text-green-400 dark:text-green-300 px-2 py-1 rounded-full">
              v{{ appVersion }}
            </span>
          </div>
          <p class="text-sm text-green-600 dark:text-green-400">{{ currentDate }}</p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-green-600 dark:text-green-300">{{ currentTime }}</div>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="relative">
        <Icon 
          icon="mdi:magnify" 
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="搜索网络..."
          class="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-500 text-gray-700 dark:text-gray-200 placeholder-gray-400"
        />
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="p-4">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">快捷操作</h3>
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="action in quickActions"
          :key="action.action"
          @click="handleQuickAction(action.action)"
          class="flex flex-col items-center p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-gray-100 dark:border-gray-600"
        >
          <Icon 
            :icon="action.icon" 
            class="text-2xl text-green-300 dark:text-green-400 mb-1" 
          />
          <span class="text-xs text-gray-600 dark:text-gray-300 text-center">{{ action.name }}</span>
        </button>
      </div>
    </div>

    <!-- 最近访问 -->
    <div class="px-4">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">常用</h3>
      <div class="space-y-2">
        <button
          v-for="site in recentSites"
          :key="site.url"
          @click="openSite(site.url)"
          class="w-full flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-100 dark:border-gray-600"
        >
          <Icon 
            :icon="site.favicon" 
            class="text-lg text-gray-500 dark:text-gray-400 mr-3" 
          />
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ site.name }}</span>
          <Icon 
            icon="mdi:open-in-new" 
            class="text-sm text-gray-400 ml-auto" 
          />
        </button>
      </div>
    </div>

    <!-- 当前标签页 -->
    <div class="px-4 py-3" v-if="tabs.length > 0">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">当前窗口标签</h3>
      <div class="space-y-2 max-h-32 overflow-y-auto">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          @click="switchToTab(tab.id)"
          class="flex items-center p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer border border-gray-100 dark:border-gray-600 group"
        >
          <div class="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
            <img 
              v-if="tab.favIconUrl"
              :src="tab.favIconUrl" 
              class="w-4 h-4" 
              :alt="tab.title"
              @error="handleImageError"
            />
            <Icon 
              v-else
              icon="mdi:web" 
              class="w-4 h-4 text-gray-400" 
            />
          </div>
          <span class="text-xs text-gray-700 dark:text-gray-200 truncate flex-1">{{ tab.title }}</span>
          <button
            @click="closeTab(tab.id, $event)"
            class="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-all duration-200"
          >
            <Icon icon="mdi:close" class="text-xs text-red-500" />
          </button>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="p-4 border-t border-gray-100 dark:border-gray-700 mt-4">
      <button
        @click="openNewTab"
        class="w-full flex items-center justify-center p-3 bg-green-300 hover:bg-green-400 text-white rounded-xl transition-colors duration-200 mb-3"
      >
        <Icon icon="mdi:plus" class="mr-2" />
        新建标签页
      </button>
      
      <!-- 版本信息 -->
      <div class="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
        <Icon icon="mdi:information-outline" class="mr-1" />
        <span>秋叶标签页 v{{ appVersion }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #86efac;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4ade80;
}
</style>
