<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { searchEngines } from '@/config/searchEngines'
import { setStorageValue, getStorageValue } from '@/utils'

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
    // 统一使用 setStorageValue 写入 local，读取时 getStorageValue 会自动从 local→sync 降级
    await setStorageValue('searchEngine', selectedEngine.value)
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 用标志位跳过首次 watcher 触发（由 loadSettings 引起的）
// 放在 setup 内部，避免模块级变量在组件重新加载时不会重置
const isInitialLoad = ref(true)
watch(selectedEngine, () => {
  if (isInitialLoad.value) {
    isInitialLoad.value = false
    return
  }
  saveSettings()
})

onMounted(async () => {
  await loadSettings()
  // 必须在 loadSettings 完成后显式清除 isInitialLoad：
  // 当存储值与默认值相同（都是 'baidu'）时，selectedEngine 不会变化，
  // watcher 不会触发，isInitialLoad 就会一直为 true，
  // 导致用户的第一次选择被跳过、永远无法保存。
  await nextTick()
  isInitialLoad.value = false
})
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
