<script setup lang="ts">
import { ref, watch } from 'vue'
import webExtensionPolyfill from 'webextension-polyfill'
import { searchEngines } from '@/config/searchEngines'
import { setStorageValue, getStorageValue } from '@/utils'

const browser = webExtensionPolyfill

const selectedEngine = ref('baidu')

const loadSettings = async () => {
  try {
    selectedEngine.value = await getStorageValue<string>(
      'searchEngine',
      'baidu',
    )
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const saveSettings = async () => {
  try {
    await setStorageValue('searchEngine', selectedEngine.value)
    await browser.storage.sync.set({ searchEngine: selectedEngine.value })
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
    <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
      搜索引擎设置
    </h3>
    <div class="space-y-3">
      <label
        v-for="engine in searchEngines"
        :key="engine.value"
        class="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
        :class="{
          'border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30':
            selectedEngine === engine.value,
        }"
      >
        <input
          type="radio"
          :value="engine.value"
          v-model="selectedEngine"
          class="sr-only"
        />
        <div class="flex items-center space-x-3">
          <div
            class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
            :class="
              selectedEngine === engine.value
                ? 'border-blue-500'
                : 'border-gray-300 dark:border-gray-500'
            "
          >
            <div
              v-if="selectedEngine === engine.value"
              class="w-2 h-2 rounded-full bg-blue-500"
            ></div>
          </div>
          <span class="text-gray-700 dark:text-gray-300">{{
            engine.name
          }}</span>
        </div>
      </label>
    </div>
  </div>
</template>
