<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '../../store/modules/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const { showTimeDisplay, showSearchHints } = storeToRefs(settingsStore)

// 本地状态
const localShowTimeDisplay = ref(true)
const localShowSearchHints = ref(true)

// 加载设置
onMounted(() => {
    localShowTimeDisplay.value = showTimeDisplay.value
    localShowSearchHints.value = showSearchHints.value
})

// 更新时间显示设置
const updateTimeDisplay = async (value: boolean) => {
    localShowTimeDisplay.value = value
    await settingsStore.setDisplayOptions({ showTimeDisplay: value })
}

// 更新搜索提示设置
const updateSearchHints = async (value: boolean) => {
    localShowSearchHints.value = value
    await settingsStore.setDisplayOptions({ showSearchHints: value })
}
</script>

<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <div>
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">通用设置</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">自定义新标签页的显示选项</p>
    </div>

    <!-- 显示设置 -->
    <div class="space-y-6">
      <div class="bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
        <h4 class="text-base font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <Icon icon="mdi:eye" class="text-lg mr-2 text-blue-600 dark:text-blue-400" />
          显示选项
        </h4>

        <div class="space-y-4">
          <!-- 时间显示开关 -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">显示时间</label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">显示当前时间和日期信息</p>
            </div>
            <button
              @click="updateTimeDisplay(!localShowTimeDisplay)"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                localShowTimeDisplay ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
                  localShowTimeDisplay ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <!-- 搜索提示开关 -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">显示搜索提示</label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">显示搜索框下方的使用提示</p>
            </div>
            <button
              @click="updateSearchHints(!localShowSearchHints)"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                localShowSearchHints ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
                  localShowSearchHints ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
