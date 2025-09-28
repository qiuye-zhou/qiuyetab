<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'

// 使用 browser API
const browser = webExtensionPolyfill

const props = defineProps({
  updateSettings: Boolean,
})

// 响应式数据
const searchQuery = ref('')

const searchEngines = ref([
  { name: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd={query}' },
  {
    name: 'Google',
    value: 'google',
    url: 'https://www.google.com/search?q={query}',
  },
  { name: '必应', value: 'bing', url: 'https://www.bing.com/search?q={query}' },
  {
    name: '搜狗',
    value: 'sogou',
    url: 'https://www.sogou.com/web?query={query}',
  },
  { name: '360搜索', value: '360', url: 'https://www.so.com/s?q={query}' },
])
const selectedEngine = ref('baidu')

// 搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    const engine = searchEngines.value.find(
      (e) => e.value === selectedEngine.value,
    )
    if (engine) {
      const searchUrl = engine.url.replace(
        '{query}',
        encodeURIComponent(searchQuery.value),
      )
      browser.tabs.create({ url: searchUrl })
      window.close()
    }
  }
}

// 加载设置
const loadSettings = async () => {
  try {
    // 先尝试从local存储加载
    let result = await browser.storage.local.get(['searchEngine'])

    // 如果local存储没有数据，尝试从sync存储加载
    if (!result.searchEngine) {
      result = await browser.storage.sync.get(['searchEngine'])
    }

    // 加载搜索引擎设置
    if (result.searchEngine && typeof result.searchEngine === 'string') {
      selectedEngine.value = result.searchEngine
    } else {
      selectedEngine.value = 'baidu'
    }
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
