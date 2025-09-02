<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

// 主题设置
const themes = ref([
  { name: '浅色主题', value: 'light', icon: 'mdi:weather-sunny' },
  { name: '深色主题', value: 'dark', icon: 'mdi:weather-night' },
  { name: '自动', value: 'auto', icon: 'mdi:theme-light-dark' }
])

const selectedTheme = ref('light')

// 背景设置
const backgroundOptions = ref([
  { name: '默认背景', value: 'default' },
  { name: '纯色背景', value: 'solid' },
  { name: '自定义图片', value: 'custom' }
])

const selectedBackground = ref('default')
</script>

<template>
  <div class="space-y-8">
    <div>
      <h3 class="text-lg font-medium text-gray-800 mb-4">主题设置</h3>
      <div class="space-y-3">
        <label v-for="theme in themes" :key="theme.value"
          class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
          :class="{ 'border-blue-300 bg-blue-50': selectedTheme === theme.value }">
          <input type="radio" :value="theme.value" v-model="selectedTheme" class="sr-only" />
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
              :class="selectedTheme === theme.value ? 'border-blue-500' : 'border-gray-300'">
              <div v-if="selectedTheme === theme.value" class="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <Icon :icon="theme.icon" class="text-lg text-gray-600" />
            <span class="text-gray-700">{{ theme.name }}</span>
          </div>
        </label>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-medium text-gray-800 mb-4">背景设置</h3>
      <div class="space-y-3">
        <label v-for="bg in backgroundOptions" :key="bg.value"
          class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
          :class="{ 'border-blue-300 bg-blue-50': selectedBackground === bg.value }">
          <input type="radio" :value="bg.value" v-model="selectedBackground" class="sr-only" />
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
              :class="selectedBackground === bg.value ? 'border-blue-500' : 'border-gray-300'">
              <div v-if="selectedBackground === bg.value" class="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <span class="text-gray-700">{{ bg.name }}</span>
          </div>
        </label>
      </div>
    </div>

    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-start space-x-2">
        <Icon icon="mdi:information" class="text-yellow-600 mt-0.5" />
        <div>
          <p class="text-sm text-yellow-800 font-medium">功能开发中</p>
          <p class="text-xs text-yellow-700 mt-1">外观设置功能正在开发中，敬请期待...</p>
        </div>
      </div>
    </div>
  </div>
</template>
