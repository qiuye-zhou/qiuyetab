<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'
import { useSettingsStore } from '../store/modules/settings'
import { storeToRefs } from 'pinia'

// 使用 browser API
const browser = webExtensionPolyfill

const settings = useSettingsStore()
const { updateSetting } = storeToRefs(settings)

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

watch(updateSetting, async () => {
    await loadSettings()
})

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
        <div class="text-center mb-12">
            <h1 class="text-5xl font-bold text-gray-600 dark:text-gray-300 mb-4">{{ currentTime }}</h1>
            <p class="text-xl text-gray-500 dark:text-gray-400 mb-2">{{ currentDate }}</p>
            <p class="text-lg text-gray-400 dark:text-gray-500">{{ greeting }}！</p>
        </div>

        <!-- 搜索区域 -->
        <div class="relative mb-8 group max-w-2xl mx-auto">
            <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="搜索或输入网址"
                class="w-full pl-16 pr-16 py-5 text-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 rounded-3xl shadow-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-500 ease-out"
                style="box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.4)" autofocus />

            <!-- 搜索按钮 -->
            <button @click="handleSearch"
                class="absolute cursor-pointer right-5 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 text-white shadow-lg transition-all duration-300">
                <Icon icon="mdi:magnify" class="text-xl" />
            </button>
        </div>

        <!-- 搜索提示 -->
        <div class="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p class="opacity-80">输入关键词搜索，或直接输入网址访问</p>
            <div class="flex items-center justify-center space-x-4 text-xs opacity-60">
                <span class="flex items-center">
                    <kbd
                        class="px-2 py-1 bg-gray-100/50 dark:bg-gray-700/50 rounded text-gray-500 dark:text-gray-400 font-mono">Enter</kbd>
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

/* 深色模式搜索框 */
.dark .group input {
    background:
        linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%);
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
</style>