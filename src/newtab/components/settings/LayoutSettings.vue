<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '../../store/modules/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const { showTimeDisplay, showSearchHints, searchBarPositionY } = storeToRefs(settingsStore)

// 本地状态
const localShowTimeDisplay = ref(true)
const localShowSearchHints = ref(true)
const localSearchBarPositionY = ref(50)

// 加载设置
onMounted(() => {
  localShowTimeDisplay.value = showTimeDisplay.value
  localShowSearchHints.value = showSearchHints.value
  localSearchBarPositionY.value = searchBarPositionY.value
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

// 更新搜索栏Y轴位置设置
const updateSearchBarPositionY = async (positionY: number) => {
  localSearchBarPositionY.value = positionY
  await settingsStore.setSearchBarPositionY(positionY)
}

// 实时更新位置（不保存到存储）
const updatePositionPreview = (positionY: number) => {
  localSearchBarPositionY.value = positionY
  settingsStore.updateSearchBarPositionY(positionY)
}
</script>

<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <div>
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">布局设置</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">自定义新标签页的布局和显示选项</p>
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
                localShowTimeDisplay ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600',
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
                  localShowTimeDisplay ? 'translate-x-6' : 'translate-x-1',
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
                localShowSearchHints ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600',
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
                  localShowSearchHints ? 'translate-x-6' : 'translate-x-1',
                ]"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- 搜索栏位置设置 -->
      <div class="bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
        <h4 class="text-base font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <Icon icon="mdi:layout" class="text-lg mr-2 text-blue-600 dark:text-blue-400" />
          搜索栏位置
        </h4>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">垂直位置</label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                调整搜索栏在页面中的垂直位置 ({{ localSearchBarPositionY }}%)
              </p>
            </div>
          </div>

          <!-- 位置滑块 -->
          <div class="mt-4">
            <div class="relative">
              <!-- 滑块轨道 -->
              <div class="h-2 bg-gray-200 dark:bg-gray-600 rounded-full relative">
                <!-- 滑块进度 -->
                <div
                  class="absolute top-0 h-2 bg-gradient-to-r from-blue-400 to-blue-200 rounded-full transition-all duration-200"
                  :style="{ width: `${localSearchBarPositionY}%` }"
                ></div>

                <!-- 滑块控制点 -->
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  :value="localSearchBarPositionY"
                  @input="updatePositionPreview(Number(($event.target as HTMLInputElement).value))"
                  @change="updateSearchBarPositionY(Number(($event.target as HTMLInputElement).value))"
                  class="absolute top-0 w-full h-2 bg-transparent cursor-pointer appearance-none slider"
                />
              </div>

              <!-- 位置标签 -->
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>顶部 (0%)</span>
                <span>底部 (100%)</span>
              </div>
            </div>
          </div>

          <!-- 快速位置按钮 -->
          <div class="grid grid-cols-3 gap-2 mt-4">
            <button
              @click="updateSearchBarPositionY(10)"
              :class="[
                'px-3 py-2 text-xs rounded-lg border transition-all duration-200',
                localSearchBarPositionY <= 15
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              顶部
            </button>
            <button
              @click="updateSearchBarPositionY(50)"
              :class="[
                'px-3 py-2 text-xs rounded-lg border transition-all duration-200',
                localSearchBarPositionY >= 45 && localSearchBarPositionY <= 55
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              居中
            </button>
            <button
              @click="updateSearchBarPositionY(90)"
              :class="[
                'px-3 py-2 text-xs rounded-lg border transition-all duration-200',
                localSearchBarPositionY >= 85
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500',
              ]"
            >
              底部
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 深色模式滑块 */
.dark .slider::-webkit-slider-thumb {
  border: 2px solid #374151;
}

.dark .slider::-moz-range-thumb {
  border: 2px solid #374151;
}
</style>
