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
    <main class="w-full max-w-5xl px-6">
        <!-- 时间显示 -->
        <div class="text-center mb-16">
            <h1 class="text-5xl font-bold text-gray-600 mb-4">{{ currentTime }}</h1>
            <p class="text-xl text-gray-500 mb-2">{{ currentDate }}</p>
            <p class="text-lg text-gray-400">{{ greeting }}！</p>
        </div>

        <!-- 搜索区域 -->
        <div class="relative mb-8 group max-w-4xl mx-auto">
            <div class="absolute left-5 top-1/2 transform -translate-y-1/2 transition-all duration-300">
                <Icon icon="mdi:magnify" class="text-gray-600 text-2xl" />
            </div>
            <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="搜索或输入网址"
                class="w-full pl-16 pr-16 py-7 text-xl bg-white/90 backdrop-blur-md border-0 rounded-3xl shadow-xl text-gray-700 placeholder-gray-400 transition-all duration-500 ease-out"
                style="box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.4)" autofocus />

            <!-- 搜索按钮 -->
            <button @click="handleSearch"
                class="absolute cursor-pointer right-5 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transition-all duration-300">
                <Icon icon="mdi:magnify" class="text-xl" />
            </button>
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
</template>
<style scoped>
/* 搜索框玻璃效果 */
.group input {
    background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    outline: none;
}

/* 去掉输入框聚焦时的默认边框 */
.group input:focus {
    outline: none;
    border: 1px solid rgba(255, 255, 255, 0.6);
}

/* 键盘按键样式 */
kbd {
    box-shadow:
        0 1px 1px rgba(0, 0, 0, 0.1),
        0 2px 0 0 rgba(255, 255, 255, 0.9),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
}

/* 时间数字动画 */
h1 {
    font-feature-settings: 'tnum';
    transition: all 0.3s ease;
}
</style>