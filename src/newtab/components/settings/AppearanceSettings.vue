<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '../../store/modules/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const { theme, backgroundType, customBackground, backgroundOpacity } = storeToRefs(settingsStore)

// 主题设置
const themes = ref([
  { name: '浅色主题', value: 'light', icon: 'mdi:weather-sunny' },
  { name: '深色主题', value: 'dark', icon: 'mdi:weather-night' },
  { name: '自动', value: 'auto', icon: 'mdi:theme-light-dark' }
])

// 背景设置
const backgroundOptions = ref([
  { name: '默认背景', value: 'default' },
  { name: '自定义图片', value: 'custom' }
])

// 自定义背景URL输入
const customBgUrl = ref('')

// 本地透明度值（用于滑块）
const localOpacity = ref(0.8)

// 处理主题切换
const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
  await settingsStore.setTheme(newTheme)
}

// 处理背景切换
const handleBackgroundChange = async (newBackground: 'default' | 'custom') => {
  await settingsStore.setBackground(newBackground, customBgUrl.value)
}

// 处理自定义背景URL变化
const handleCustomBgChange = async () => {
  if (backgroundType.value === 'custom' && customBgUrl.value) {
    await settingsStore.setBackground('custom', customBgUrl.value)
  }
}

// 处理透明度变化
const handleOpacityChange = async (opacity: number) => {
  localOpacity.value = opacity
  await settingsStore.setBackgroundOpacity(opacity)
}

// 初始化
onMounted(() => {
  customBgUrl.value = customBackground.value
  localOpacity.value = backgroundOpacity.value
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">主题设置</h3>
      <div class="space-y-3">
        <label v-for="themeOption in themes" :key="themeOption.value"
          class="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          :class="{ 'border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30': theme === themeOption.value }">
          <input type="radio" :value="themeOption.value" :checked="theme === themeOption.value"
            @change="handleThemeChange(themeOption.value as 'light' | 'dark' | 'auto')" class="sr-only" />
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
              :class="theme === themeOption.value ? 'border-blue-500' : 'border-gray-300 dark:border-gray-500'">
              <div v-if="theme === themeOption.value" class="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <Icon :icon="themeOption.icon" class="text-lg text-gray-600 dark:text-gray-300" />
            <span class="text-gray-700 dark:text-gray-300">{{ themeOption.name }}</span>
          </div>
        </label>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">背景设置</h3>
      <div class="space-y-3">
        <label v-for="bg in backgroundOptions" :key="bg.value"
          class="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          :class="{ 'border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30': backgroundType === bg.value }">
          <input type="radio" :value="bg.value" :checked="backgroundType === bg.value"
            @change="handleBackgroundChange(bg.value as 'default' | 'custom')" class="sr-only" />
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
              :class="backgroundType === bg.value ? 'border-blue-500' : 'border-gray-300 dark:border-gray-500'">
              <div v-if="backgroundType === bg.value" class="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <span class="text-gray-700 dark:text-gray-300">{{ bg.name }}</span>
          </div>
        </label>
      </div>

      <!-- 自定义背景URL输入 -->
      <div v-if="backgroundType === 'custom'" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            自定义背景图片URL
          </label>
          <input v-model="customBgUrl" @blur="handleCustomBgChange" @keyup.enter="handleCustomBgChange" type="url"
            placeholder="请输入图片URL"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            支持 jpg、png、gif 等格式的图片链接
          </p>
        </div>

        <!-- 背景透明度控制 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            背景透明度
          </label>
          <div class="flex items-center space-x-3">
            <Icon icon="mdi:eye-off" class="text-gray-400 text-sm" />
            <input
              v-model="localOpacity"
              @input="handleOpacityChange(Number(localOpacity))"
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <Icon icon="mdi:eye" class="text-gray-400 text-sm" />
            <span class="text-sm text-gray-600 dark:text-gray-400 w-8 text-center">
              {{ Math.round(localOpacity * 100) }}%
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            调整背景的透明度，0%为完全看不到背景图片，100%为能完全看到背景图片
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-webkit-slider-thumb:hover {
  background: #2563eb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-moz-range-thumb:hover {
  background: #2563eb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 深色模式滑块 */
.dark .slider::-webkit-slider-thumb {
  border-color: #374151;
}

.dark .slider::-moz-range-thumb {
  border-color: #374151;
}
</style>
