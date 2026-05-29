<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '../../store/modules/settings'
import { storeToRefs } from 'pinia'
import {
  compressImage,
  checkStorageSpace,
  getStorageInfo,
  formatBytes,
} from '../../../utils'

const settingsStore = useSettingsStore()
const {
  theme,
  backgroundType,
  customBackground,
  localBackgrounds,
  backgroundOpacity,
} = storeToRefs(settingsStore)

// 主题设置
const themes = ref([
  { name: '浅色主题', value: 'light', icon: 'mdi:weather-sunny' },
  { name: '深色主题', value: 'dark', icon: 'mdi:weather-night' },
  { name: '自动', value: 'auto', icon: 'mdi:theme-light-dark' },
])

// 背景设置
const backgroundOptions = ref([
  { name: '默认背景', value: 'default' },
  { name: '自定义URL背景', value: 'custom' },
  { name: '自定义本地背景', value: 'local' },
])

// 自定义背景URL输入
const customBgUrl = ref('')

// 本地透明度值（用于滑块）
const localOpacity = ref(0.8)

// 存储信息
const storageInfo = ref({ used: 0, total: 0, percentage: 0 })
const isCompressing = ref(false)

// 处理主题切换
const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
  await settingsStore.setTheme(newTheme)
}

// 处理背景切换
const handleBackgroundChange = async (
  newBackground: 'default' | 'custom' | 'local',
) => {
  await settingsStore.setBackground(newBackground, customBgUrl.value)
}

// 处理自定义背景URL变化
const handleCustomBgChange = async () => {
  if (backgroundType.value === 'custom' && customBgUrl.value) {
    // 验证 URL 格式，仅允许 http/https 协议
    try {
      const url = new URL(customBgUrl.value)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        alert('仅支持 http:// 或 https:// 协议的图片链接')
        return
      }
    } catch {
      alert('请输入有效的图片 URL')
      return
    }
    await settingsStore.setBackground('custom', customBgUrl.value)
  }
}

// 处理透明度变化
const handleOpacityChange = async (opacity: number) => {
  localOpacity.value = opacity
  await settingsStore.setBackgroundOpacity(opacity)
}

// 处理本地文件上传
const handleLocalFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 检查文件大小（限制为10MB，压缩后会变小）
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB')
      return
    }

    isCompressing.value = true

    try {
      // 压缩图片
      const compressedBase64 = await compressImage(file, 1920, 1080, 0.8)

      // 检查存储空间
      const hasSpace = await checkStorageSpace(compressedBase64.length)
      if (!hasSpace) {
        alert('存储空间不足，请清除其他数据或选择更小的图片')
        return
      }

      // 添加到背景列表
      const fileName = file.name.replace(/\.[^/.]+$/, '')
      await settingsStore.addLocalBackground(fileName, compressedBase64)

      // 清空文件输入
      target.value = ''

      // 更新存储信息
      await updateStorageInfo()
    } catch (error) {
      console.error('文件处理失败:', error)
      alert('文件处理失败，请重试')
    } finally {
      isCompressing.value = false
    }
  }
}

// 更新存储信息
const updateStorageInfo = async () => {
  try {
    storageInfo.value = await getStorageInfo()
  } catch (error) {
    console.error('获取存储信息失败:', error)
  }
}

// 删除背景
const removeBackground = async (id: string) => {
  try {
    await settingsStore.removeLocalBackground(id)
    await updateStorageInfo()
  } catch (error) {
    console.error('删除背景失败:', error)
    alert('删除背景失败，请重试')
  }
}

// 切换背景启用状态
const toggleBackground = async (id: string) => {
  try {
    await settingsStore.toggleLocalBackground(id)
  } catch (error) {
    console.error('切换背景状态失败:', error)
    alert('切换背景状态失败，请重试')
  }
}

// 初始化
onMounted(async () => {
  customBgUrl.value = customBackground.value
  localOpacity.value = backgroundOpacity.value

  // 更新存储信息
  await updateStorageInfo()
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
        主题设置
      </h3>
      <div class="space-y-3">
        <label
          v-for="themeOption in themes"
          :key="themeOption.value"
          class="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          :class="{
            'border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30':
              theme === themeOption.value,
          }"
        >
          <input
            type="radio"
            :value="themeOption.value"
            :checked="theme === themeOption.value"
            @change="
              handleThemeChange(themeOption.value as 'light' | 'dark' | 'auto')
            "
            class="sr-only"
          />
          <div class="flex items-center space-x-3">
            <div
              class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
              :class="
                theme === themeOption.value
                  ? 'border-blue-500'
                  : 'border-gray-300 dark:border-gray-500'
              "
            >
              <div
                v-if="theme === themeOption.value"
                class="w-2 h-2 rounded-full bg-blue-500"
              ></div>
            </div>
            <Icon
              :icon="themeOption.icon"
              class="text-lg text-gray-600 dark:text-gray-300"
            />
            <span class="text-gray-700 dark:text-gray-300">{{
              themeOption.name
            }}</span>
          </div>
        </label>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
        背景设置
      </h3>
      <div class="space-y-3">
        <label
          v-for="bg in backgroundOptions"
          :key="bg.value"
          class="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          :class="{
            'border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30':
              backgroundType === bg.value,
          }"
        >
          <input
            type="radio"
            :value="bg.value"
            :checked="backgroundType === bg.value"
            @change="
              handleBackgroundChange(bg.value as 'default' | 'custom' | 'local')
            "
            class="sr-only"
          />
          <div class="flex items-center space-x-3">
            <div
              class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
              :class="
                backgroundType === bg.value
                  ? 'border-blue-500'
                  : 'border-gray-300 dark:border-gray-500'
              "
            >
              <div
                v-if="backgroundType === bg.value"
                class="w-2 h-2 rounded-full bg-blue-500"
              ></div>
            </div>
            <span class="text-gray-700 dark:text-gray-300">{{ bg.name }}</span>
          </div>
        </label>
      </div>

      <!-- 自定义背景URL输入 -->
      <div
        v-if="backgroundType === 'custom'"
        class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >自定义背景图片URL</label
          >
          <input
            v-model="customBgUrl"
            @blur="handleCustomBgChange"
            @keyup.enter="handleCustomBgChange"
            type="url"
            placeholder="请输入图片URL"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            支持 jpg、png、gif 等格式的图片链接
          </p>
        </div>
      </div>

      <!-- 多背景随机切换设置 -->
      <div
        v-if="backgroundType === 'local'"
        class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >添加背景图片</label
          >
          <div class="space-y-3">
            <!-- 文件上传 -->
            <div class="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                @change="handleLocalFileUpload"
                class="hidden"
                id="local-bg-upload"
                :disabled="isCompressing"
              />
              <label
                for="local-bg-upload"
                class="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="{ 'opacity-50 cursor-not-allowed': isCompressing }"
              >
                <Icon
                  :icon="isCompressing ? 'mdi:loading' : 'mdi:upload'"
                  class="text-lg"
                  :class="{ 'animate-spin': isCompressing }"
                />
                <span>{{ isCompressing ? '压缩中...' : '添加图片' }}</span>
              </label>
            </div>

            <!-- 存储信息 -->
            <div class="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">存储使用量</span>
                <span class="text-gray-800 dark:text-gray-200">
                  {{ formatBytes(storageInfo.used) }} /
                  {{ formatBytes(storageInfo.total) }}
                </span>
              </div>
              <div
                class="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"
              >
                <div
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: storageInfo.percentage + '%' }"
                  :class="{ 'bg-red-500': storageInfo.percentage > 80 }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ storageInfo.percentage }}% 已使用
                <span v-if="storageInfo.percentage > 80" class="text-red-500"
                  >- 存储空间不足</span
                >
              </p>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400">
              支持 jpg、png、gif
              等格式的图片文件，文件大小不超过10MB（会自动压缩优化）
            </p>
          </div>
        </div>

        <!-- 背景列表 -->
        <div v-if="localBackgrounds.length > 0">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            背景图片列表 ({{
              localBackgrounds.filter((bg) => bg.enabled).length
            }}/{{ localBackgrounds.length }} 已启用)
          </label>
          <div class="space-y-2">
            <div
              v-for="background in localBackgrounds"
              :key="background.id"
              class="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <!-- 预览图 -->
              <div
                class="w-16 h-12 rounded overflow-hidden border border-gray-300 dark:border-gray-600 flex-shrink-0"
              >
                <img
                  :src="background.data"
                  :alt="background.name"
                  class="w-full h-full object-cover"
                />
              </div>

              <!-- 背景信息 -->
              <div class="flex-1 ml-3">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ background.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  添加时间:
                  {{ new Date(background.createdAt).toLocaleDateString() }}
                </p>
              </div>

              <!-- 操作按钮 -->
              <div class="flex items-center space-x-2">
                <!-- 启用/禁用切换 -->
                <button
                  @click="toggleBackground(background.id)"
                  class="p-2 rounded-lg transition-colors duration-200"
                  :class="
                    background.enabled
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
                  "
                >
                  <Icon
                    :icon="background.enabled ? 'mdi:eye' : 'mdi:eye-off'"
                    class="text-lg"
                  />
                </button>

                <!-- 删除按钮 -->
                <button
                  @click="removeBackground(background.id)"
                  class="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                >
                  <Icon icon="mdi:delete" class="text-lg" />
                </button>
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 只有启用状态的背景图片会参与随机切换
          </p>
        </div>
      </div>

      <!-- 背景透明度控制（自定义URL和本地背景共用） -->
      <div
        v-if="backgroundType === 'custom' || backgroundType === 'local'"
        class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >背景透明度</label
        >
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
          <span
            class="text-sm text-gray-600 dark:text-gray-400 w-8 text-center"
          >
            {{ Math.round(localOpacity * 100) }}%
          </span>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          调整背景的透明度，0%为完全看不到背景图片，100%为能完全看到背景图片
        </p>
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
