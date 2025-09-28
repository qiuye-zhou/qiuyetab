<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'
import { useGlobalStore } from '../store/modules/global'
import { storeToRefs } from 'pinia'

const global = useGlobalStore()
const { showSettings, showEditSites } = storeToRefs(global)

const props = defineProps({
  updateSettings: Boolean,
})

// 使用 browser API
const browser = webExtensionPolyfill

const recentSites = ref([
  { id: 1, name: 'GitHub', url: 'https://github.com', favicon: 'mdi:github' },
  {
    id: 2,
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    favicon: 'simple-icons:typescript',
  },
])

// 打开网站
const openSite = (url: string) => {
  browser.tabs.create({ url })
  window.close()
}

// 加载常用网站设置
const loadFavoriteSites = async () => {
  try {
    // 先尝试从local存储加载
    let result = await browser.storage.local.get(['favoriteSites'])

    // 如果local存储没有数据，尝试从sync存储加载
    if (!result.favoriteSites) {
      result = await browser.storage.sync.get(['favoriteSites'])
    }

    // 加载常用网站设置
    if (result.favoriteSites) {
      let sitesArray = result.favoriteSites

      // 如果是对象格式，转换为数组
      if (
        typeof result.favoriteSites === 'object' &&
        !Array.isArray(result.favoriteSites)
      ) {
        sitesArray = Object.values(result.favoriteSites)
      }

      // 验证数组格式并加载
      if (Array.isArray(sitesArray) && sitesArray.length > 0) {
        recentSites.value = sitesArray
      }
    }
  } catch (error) {
    console.error('加载常用网站失败:', error)
  }
}

// 监听设置更新
watch(
  () => props.updateSettings,
  () => {
    loadFavoriteSites()
  },
)

onMounted(() => {
  loadFavoriteSites()
})
</script>

<template>
  <!-- 常用网站列表 -->
  <div v-show="!showSettings && !showEditSites" class="px-4">
    <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
      常用
    </h3>
    <div class="space-y-2">
      <button
        v-for="site in recentSites"
        :key="site.id"
        @click="openSite(site.url)"
        class="w-full flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600"
      >
        <Icon
          :icon="site.favicon"
          class="text-lg text-gray-500 dark:text-gray-400 mr-3"
        />
        <span class="text-sm text-gray-700 dark:text-gray-200">{{
          site.name
        }}</span>
        <Icon icon="mdi:open-in-new" class="text-sm text-gray-400 ml-auto" />
      </button>
    </div>
  </div>
</template>
