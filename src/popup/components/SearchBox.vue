<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'
import { searchEngines, getSearchUrl } from '@/config/searchEngines'
import { getStorageValue } from '@/utils'

// 使用 browser API
const browser = webExtensionPolyfill

const props = defineProps({
  updateSettings: Boolean,
})

// 响应式数据
const searchQuery = ref('')
const selectedEngine = ref('baidu')

// 搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    const searchUrl = getSearchUrl(selectedEngine.value, searchQuery.value)
    browser.tabs.create({ url: searchUrl })
    window.close()
  }
}

// 加载设置
const loadSettings = async () => {
  try {
    selectedEngine.value = await getStorageValue<string>(
      'searchEngine',
      'baidu',
    )
  } catch (error) {
    console.error('加载搜索设置失败:', error)
    selectedEngine.value = 'baidu'
  }
}

// 监听设置更新
watch(
  () => props.updateSettings,
  async () => {
    await loadSettings()
  },
)

onMounted(async () => {
  await loadSettings()
})
</script>

<template>
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
      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-green-500 text-gray-600 dark:text-gray-200 placeholder-gray-400"
    />
    <div
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400"
    >
      {{ searchEngines.find((e) => e.value === selectedEngine)?.name }}
    </div>
  </div>
</template>
