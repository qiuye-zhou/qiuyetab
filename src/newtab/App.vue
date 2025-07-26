<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'

// 使用 browser API
const browser = webExtensionPolyfill

// 响应式数据
const searchQuery = ref('')
const currentTime = ref('')
const currentDate = ref('')
const greeting = ref('')

// 搜索引擎配置
const searchEngines = ref([
  { name: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd={query}' },
  { name: 'Google', value: 'google', url: 'https://www.google.com/search?q={query}' },
  { name: '必应', value: 'bing', url: 'https://www.bing.com/search?q={query}' },
  { name: '搜狗', value: 'sogou', url: 'https://www.sogou.com/web?query={query}' },
  { name: '360搜索', value: '360', url: 'https://www.so.com/s?q={query}' }
])
const selectedEngine = ref('baidu')

let timeInterval: ReturnType<typeof setInterval>

// 时间更新
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  
  // 设置问候语
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

// 搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 检查是否是URL
    if (searchQuery.value.includes('.') && !searchQuery.value.includes(' ')) {
      const url = searchQuery.value.startsWith('http') 
        ? searchQuery.value 
        : `https://${searchQuery.value}`
      window.open(url, '_self')
    } else {
      // 使用自定义搜索引擎
      const engine = searchEngines.value.find(e => e.value === selectedEngine.value)
      if (engine) {
        const searchUrl = engine.url.replace('{query}', encodeURIComponent(searchQuery.value))
        window.open(searchUrl, '_self')
      }
    }
  }
}

// 加载设置
const loadSettings = async () => {
  try {
    // 优先从 local 读取
    let result = await browser.storage.local.get(['searchEngine'])
    if (!result.searchEngine) {
      // local 没有再从 sync 兜底
      result = await browser.storage.sync.get(['searchEngine'])
    }
    if (result.searchEngine && typeof result.searchEngine === 'string') {
      selectedEngine.value = result.searchEngine
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  loadSettings()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center" style="background: linear-gradient(to bottom right, #fefefe, #f8f9fa)">
    <!-- 主要内容区域 -->
    <main class="w-full max-w-5xl px-6">
      <!-- 时间显示 -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-gray-600 mb-4">{{ currentTime }}</h1>
        <p class="text-xl text-gray-500 mb-2">{{ currentDate }}</p>
        <p class="text-lg text-gray-400">{{ greeting }}！</p>
      </div>

      <!-- 搜索区域 -->
      <div class="relative mb-8 group max-w-4xl mx-auto">
        <div class="absolute left-5 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:text-gray-700">
          <Icon 
            icon="mdi:magnify" 
            class="text-gray-600 text-2xl" 
          />
        </div>
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          @focus="($event.target as HTMLInputElement)?.select()"
          type="text"
          placeholder="搜索或输入网址"
          class="w-full pl-16 pr-8 py-7 text-xl bg-white/90 backdrop-blur-md border-0 rounded-3xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-200/50 text-gray-700 placeholder-gray-400 transition-all duration-500 ease-out"
          style="box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.4)"
          autofocus
        />
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-pink-50/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>

      <!-- 搜索提示 -->
      <div class="text-center text-sm text-gray-500 space-y-2">
        <p class="opacity-80">输入关键词搜索，或直接输入网址访问</p>
        <div class="flex items-center justify-center space-x-4 text-xs opacity-60">
          <span class="flex items-center">
            <kbd class="px-2 py-1 bg-gray-100/50 rounded text-gray-500 font-mono">Enter</kbd>
            <span class="ml-1">搜索</span>
          </span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 输入框聚焦动画 */
input:focus {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

input:hover {
  transform: translateY(-1px);
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.12);
}

/* 搜索框玻璃效果 */
.group input {
  background: 
    linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 搜索框内部发光效果 */
.group:focus-within input {
  background: 
    linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

/* 键盘按键样式 */
kbd {
  box-shadow: 
    0 1px 1px rgba(0, 0, 0, 0.1),
    0 2px 0 0 rgba(255, 255, 255, 0.9),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
}

/* 背景装饰 */
.min-h-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 200, 198, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* 时间数字动画 */
h1 {
  font-feature-settings: 'tnum';
  transition: all 0.3s ease;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(209, 213, 219, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
