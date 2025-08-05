<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'
import { useGlobalStore } from '../store/modules/global'
import { storeToRefs } from 'pinia'

const global = useGlobalStore()

const { appVersion, showSettings, showEditSites } = storeToRefs(global)


// 使用 browser API
const browser = webExtensionPolyfill

const props = defineProps({
    updateSettings: Boolean,
})


// 响应式数据
const currentTime = ref('')
const currentDate = ref('')
const searchQuery = ref('')

const searchEngines = ref([
    { name: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd={query}' },
    { name: 'Google', value: 'google', url: 'https://www.google.com/search?q={query}' },
    { name: '必应', value: 'bing', url: 'https://www.bing.com/search?q={query}' },
    { name: '搜狗', value: 'sogou', url: 'https://www.sogou.com/web?query={query}' },
    { name: '360搜索', value: '360', url: 'https://www.so.com/s?q={query}' }
])
const selectedEngine = ref('baidu')

// 时间更新
const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    })
    currentDate.value = now.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
    })
}

// 搜索功能
const handleSearch = () => {
    if (searchQuery.value.trim()) {
        const engine = searchEngines.value.find(e => e.value === selectedEngine.value)
        if (engine) {
            const searchUrl = engine.url.replace('{query}', encodeURIComponent(searchQuery.value))
            browser.tabs.create({ url: searchUrl })
            window.close()
        }
    }
}

// 加载设置
const loadSettings = async () => {
    try {
        // 先尝试从local存储加载
        let result = await browser.storage.local.get(['searchEngine'])

        // 如果local存储没有数据，尝试从sync存储加载
        if (!result.searchEngine && !result.favoriteSites) {
            result = await browser.storage.sync.get(['searchEngine'])
        }

        // 加载搜索引擎设置
        if (result.searchEngine && typeof result.searchEngine === 'string') {
            selectedEngine.value = result.searchEngine
        } else {
            selectedEngine.value = 'baidu'
        }

    } catch (error) {
        console.error('加载设置失败:', error)
        // 设置默认值
        selectedEngine.value = 'baidu'
    }
}

watch(() => props.updateSettings, async () => {
    await loadSettings()
})

onMounted(async () => {
    updateTime()
    setInterval(updateTime, 1000)

    loadSettings()
})
</script>
<template>
    <div v-show="!showSettings && !showEditSites" class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <h1 class="text-xl font-bold text-gray-600 dark:text-green-300">新标签页</h1>
                    <span
                        class="text-xs bg-gray-100 dark:bg-green-800 text-gray-500 dark:text-green-300 px-2 py-1 rounded-full">
                        v{{ appVersion }}
                    </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-green-400">{{ currentDate }}</p>
            </div>
            <div class="text-right">
                <div class="text-2xl font-bold text-gray-600 dark:text-green-300">{{ currentTime }}</div>
            </div>
        </div>

        <!-- 搜索框 -->
        <div class="relative">
            <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="搜索网络..."
                class="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-green-500 text-gray-600 dark:text-gray-200 placeholder-gray-400" />
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {{searchEngines.find(e => e.value === selectedEngine)?.name}}
            </div>
        </div>
    </div>
</template>