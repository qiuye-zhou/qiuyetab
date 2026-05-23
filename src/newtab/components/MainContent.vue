<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '../store/modules/settings'
import { storeToRefs } from 'pinia'
import { getSearchUrl } from '@/config/searchEngines'
import { defaultFavoriteSites, type FavoriteSite } from '@/config/defaultSites'
import {
  getStorageValue,
  getSearchSuggestions,
  addSearchHistory,
  removeSearchHistory,
  isFaviconUrl,
} from '@/utils'
import type { SearchSuggestion } from '@/utils'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

const settings = useSettingsStore()
const { isSettingsLoaded, showTimeDisplay, searchBarPositionY } =
  storeToRefs(settings)

// 响应式数据
const searchQuery = ref('')
const currentTime = ref('')
const currentDate = ref('')
const greeting = ref('')
const selectedEngine = ref('baidu')
const suggestions = ref<SearchSuggestion[]>([])
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)

// 常用网站
const favoriteSites = ref<FavoriteSite[]>([...defaultFavoriteSites])

let timeInterval: ReturnType<typeof setInterval>
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// 时间更新
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const hour = now.getHours()
  if (hour < 6) {
    greeting.value = '深夜了，注意休息'
  } else if (hour < 12) {
    greeting.value = '早上好'
  } else if (hour < 18) {
    greeting.value = '下午好'
  } else {
    greeting.value = '晚上好'
  }
}

// 获取搜索推荐
const fetchSuggestions = async (query: string) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(async () => {
    suggestions.value = await getSearchSuggestions(query)
    showSuggestions.value = suggestions.value.length > 0
    selectedSuggestionIndex.value = -1
  }, 200)
}

// 搜索功能
const handleSearch = async (query?: string) => {
  const searchText = query || searchQuery.value.trim()
  if (!searchText) return

  // 保存搜索历史
  await addSearchHistory(searchText)

  // 检查是否是URL
  if (searchText.includes('.') && !searchText.includes(' ')) {
    const url = searchText.startsWith('http')
      ? searchText
      : `https://${searchText}`
    window.open(url, '_self')
  } else {
    // 搜索时实时获取最新的搜索引擎设置
    const engine = await getStorageValue<string>('searchEngine', 'baidu')
    const searchUrl = getSearchUrl(engine, searchText)
    window.open(searchUrl, '_self')
  }

  // 清空搜索框和推荐
  searchQuery.value = ''
  showSuggestions.value = false
}

// 删除单条搜索历史
const handleRemoveHistory = async (text: string) => {
  await removeSearchHistory(text)
  // 刷新推荐列表
  await fetchSuggestions(searchQuery.value)
}

// 键盘导航
const handleKeydown = (e: KeyboardEvent) => {
  if (!showSuggestions.value || suggestions.value.length === 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      fetchSuggestions(searchQuery.value)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
    return
  }

  switch (e.key) {
    default:
      break
    case 'ArrowDown':
      e.preventDefault()
      selectedSuggestionIndex.value =
        selectedSuggestionIndex.value < suggestions.value.length - 1
          ? selectedSuggestionIndex.value + 1
          : 0
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedSuggestionIndex.value =
        selectedSuggestionIndex.value > 0
          ? selectedSuggestionIndex.value - 1
          : suggestions.value.length - 1
      break
    case 'Enter':
      e.preventDefault()
      if (selectedSuggestionIndex.value >= 0) {
        const selectedSuggestion =
          suggestions.value[selectedSuggestionIndex.value]
        if (selectedSuggestion) {
          handleSearch(selectedSuggestion.text)
        }
      } else {
        handleSearch()
      }
      break
    case 'Escape':
      e.preventDefault()
      showSuggestions.value = false
      break
  }
}

// 点击外部关闭推荐
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.search-container')) {
    showSuggestions.value = false
  }
}

// 加载设置
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

// 加载常用网站
const loadFavoriteSites = async () => {
  try {
    const result = await browser.storage.local.get(['favoriteSites'])
    let sites = result.favoriteSites

    // 如果 local 没有，尝试 sync
    if (!sites) {
      const syncResult = await browser.storage.sync.get(['favoriteSites'])
      sites = syncResult.favoriteSites
    }

    if (Array.isArray(sites)) {
      favoriteSites.value = sites.length > 0 ? sites : [...defaultFavoriteSites]
    } else if (sites && typeof sites === 'object') {
      // 对象格式转数组
      const arr = Object.values(sites)
      favoriteSites.value =
        arr.length > 0 ? (arr as FavoriteSite[]) : [...defaultFavoriteSites]
    }
  } catch (error) {
    console.error('加载常用网站失败:', error)
  }
}

// 监听 storage 变化，实时同步设置
const handleStorageChange = (
  changes: Record<string, { newValue?: unknown }>,
) => {
  if (changes.favoriteSites) {
    loadFavoriteSites()
  }
}

// 打开常用网站
const openSite = (url: string) => {
  window.open(url, '_self')
}

// 监听搜索词变化
watch(searchQuery, (newQuery) => {
  fetchSuggestions(newQuery)
})

// 监听设置更新
const unwatch = settings.$subscribe(() => {
  loadSettings()
})

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  loadSettings()
  loadFavoriteSites()
  document.addEventListener('click', handleClickOutside)
  browser.storage.onChanged.addListener(handleStorageChange)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  unwatch()
  document.removeEventListener('click', handleClickOutside)
  browser.storage.onChanged.removeListener(handleStorageChange)
})
</script>
<template>
  <main class="w-full max-w-5xl px-6">
    <!-- 搜索区域 - 使用固定定位，X轴居中，Y轴可自定义 -->
    <Transition name="search-slide" mode="out-in">
      <div
        v-if="isSettingsLoaded"
        class="fixed left-1/2 w-full max-w-2xl px-6 z-10"
        :style="{
          top: `${searchBarPositionY}%`,
          transform: `translate(-50%, -${searchBarPositionY}%)`,
        }"
      >
        <!-- 时间显示 -->
        <div
          v-if="isSettingsLoaded && showTimeDisplay"
          class="text-center mb-12"
        >
          <h1 class="text-5xl font-bold text-gray-600 dark:text-gray-300 mb-4">
            {{ currentTime }}
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-2">
            {{ currentDate }}
          </p>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            {{ greeting }}！
          </p>
        </div>

        <div class="search-container relative group">
          <input
            v-model="searchQuery"
            @keydown="handleKeydown"
            type="text"
            placeholder="搜索或输入网址"
            class="w-full pl-16 pr-16 py-5 text-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 rounded-3xl shadow-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-500 ease-out"
            style="box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.4)"
            autofocus
          />

          <!-- 搜索按钮 -->
          <button
            @click="() => handleSearch()"
            class="absolute cursor-pointer right-5 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-linear-to-r from-blue-300 to-purple-300 dark:from-blue-400 dark:to-purple-400 text-white shadow-lg transition-all duration-300"
          >
            <Icon icon="mdi:magnify" class="text-xl" />
          </button>

          <!-- 搜索推荐下拉列表 -->
          <Transition name="suggestions">
            <div
              v-if="showSuggestions"
              class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-20 border border-gray-100 dark:border-gray-700 max-h-72"
            >
              <div class="p-2 overflow-y-auto max-h-62">
                <button
                  v-for="(suggestion, index) in suggestions"
                  :key="suggestion.text"
                  @click="handleSearch(suggestion.text)"
                  @mouseenter="selectedSuggestionIndex = index"
                  class="w-full flex items-center px-3 py-2 rounded-xl text-left transition-all duration-200"
                  :class="[
                    selectedSuggestionIndex === index
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
                  ]"
                >
                  <Icon
                    :icon="
                      suggestion.type === 'history'
                        ? 'mdi:history'
                        : 'mdi:trending-up'
                    "
                    class="w-5 h-5 mr-3"
                    :class="
                      suggestion.type === 'history'
                        ? 'text-gray-400'
                        : 'text-orange-400'
                    "
                  />
                  <span class="flex-1 text-base">{{ suggestion.text }}</span>
                  <button
                    v-if="suggestion.type === 'history'"
                    @click.stop="handleRemoveHistory(suggestion.text)"
                    class="p-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="删除历史记录"
                  >
                    <Icon
                      icon="mdi:trash-can"
                      class="w-4 h-4 text-gray-400 hover:text-red-500"
                    />
                  </button>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 常用网站快捷方式 -->
        <div
          v-if="favoriteSites.length > 0"
          class="flex items-center justify-center gap-4 mt-8 flex-wrap"
        >
          <button
            v-for="site in favoriteSites"
            :key="site.id"
            @click="openSite(site.url)"
            class="flex flex-col items-center gap-2 group/site cursor-pointer"
          >
            <div
              class="w-12 h-12 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 flex items-center justify-center shadow-md group-hover/site:shadow-lg group-hover/site:scale-110 group-hover/site:border-gray-300 dark:group-hover/site:border-gray-500 transition-all duration-200 overflow-hidden"
            >
              <img
                v-if="isFaviconUrl(site.favicon)"
                :src="site.favicon"
                :alt="site.name"
                class="w-6 h-6"
                @error="
                  ($event.target as HTMLImageElement).style.display = 'none'
                "
              />
              <Icon
                v-else
                :icon="site.favicon"
                class="text-xl text-gray-600 dark:text-gray-300"
              />
            </div>
            <span
              class="text-xs text-gray-500 dark:text-gray-400 group-hover/site:text-gray-700 dark:group-hover/site:text-gray-200 transition-colors duration-200 max-w-14 truncate"
            >
              {{ site.name }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </main>
</template>
<style scoped>
/* 搜索框玻璃效果 */
.group input {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.85) 100%
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  outline: none;
}

/* 深色模式搜索框 */
.dark .group input {
  background: linear-gradient(
    135deg,
    rgba(31, 41, 55, 0.95) 0%,
    rgba(31, 41, 55, 0.85) 100%
  );
  border: 1px solid rgba(75, 85, 99, 0.3);
}

/* 去掉输入框聚焦时的默认边框 */
.group input:focus {
  outline: none;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.dark .group input:focus {
  border: 1px solid rgba(75, 85, 99, 0.6);
}

/* 键盘按键样式 */
kbd {
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.1),
    0 2px 0 0 rgba(255, 255, 255, 0.9),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
}

.dark kbd {
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.3),
    0 2px 0 0 rgba(55, 65, 81, 0.9),
    inset 0 1px 0 0 rgba(55, 65, 81, 0.9);
}

/* 时间数字动画 */
h1 {
  font-feature-settings: 'tnum';
  transition: all 0.3s ease;
}

/* 搜索栏位置切换动画 */
.search-slide-enter-active,
.search-slide-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-slide-enter-from,
.search-slide-leave-to {
  opacity: 0;
}

/* 搜索推荐下拉列表动画 */
.suggestions-enter-active,
.suggestions-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestions-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.suggestions-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.suggestions-enter-to,
.suggestions-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
