<script setup lang="ts">
import { ref, watch } from 'vue'
import webExtensionPolyfill from 'webextension-polyfill'
import { useSettingsStore } from '../../store/modules/settings'
import { storeToRefs } from 'pinia'

const browser = webExtensionPolyfill

const settings = useSettingsStore()
const { updateSetting } = storeToRefs(settings)

const searchEngines = ref([
  { name: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd={query}' },
  { name: 'Google', value: 'google', url: 'https://www.google.com/search?q={query}' },
  { name: '必应', value: 'bing', url: 'https://www.bing.com/search?q={query}' },
  { name: '搜狗', value: 'sogou', url: 'https://www.sogou.com/web?query={query}' },
  { name: '360搜索', value: '360', url: 'https://www.so.com/s?q={query}' },
])

const selectedEngine = ref('baidu')

const loadSettings = async () => {
  try {
    let result = await browser.storage.local.get(['searchEngine'])
    if (!result.searchEngine) {
      result = await browser.storage.sync.get(['searchEngine'])
    }
    if (result.searchEngine && typeof result.searchEngine === 'string') {
      selectedEngine.value = result.searchEngine
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const saveSettings = async () => {
  try {
    await browser.storage.local.set({ searchEngine: selectedEngine.value })
    await browser.storage.sync.set({ searchEngine: selectedEngine.value })
    updateSetting.value = !updateSetting.value
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

watch(selectedEngine, () => {
  saveSettings()
})

loadSettings()
</script>

<template>
  <div>
    <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">搜索引擎设置</h3>
    <div class="space-y-3">
      <label
        v-for="engine in searchEngines"
        :key="engine.value"
        class="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
        :class="{
          'border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30': selectedEngine === engine.value,
        }"
      >
        <input type="radio" :value="engine.value" v-model="selectedEngine" class="sr-only" />
        <div class="flex items-center space-x-3">
          <div
            class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
            :class="selectedEngine === engine.value ? 'border-blue-500' : 'border-gray-300 dark:border-gray-500'"
          >
            <div v-if="selectedEngine === engine.value" class="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <span class="text-gray-700 dark:text-gray-300">{{ engine.name }}</span>
        </div>
      </label>
    </div>
  </div>
</template>
