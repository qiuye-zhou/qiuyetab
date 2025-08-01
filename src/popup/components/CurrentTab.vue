<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'

const props = defineProps({
    showSettings: Boolean,
    showEditSites: Boolean,
})

// 使用 browser API
const browser = webExtensionPolyfill

interface TabInfo {
    id?: number
    title?: string
    favIconUrl?: string
    url?: string
    active?: boolean
}

const tabs = ref<TabInfo[]>([])

// 获取当前标签页信息
const getCurrentTabs = async () => {
    try {
        const currentTabs = await browser.tabs.query({ currentWindow: true })
        tabs.value = currentTabs.slice(0, 5) // 只显示前5个标签页
    } catch (error) {
        console.error('获取标签页失败:', error)
    }
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    if (target) {
        target.style.display = 'none'
    }
}

// 切换到指定标签页
const switchToTab = (tabId: number | undefined) => {
    if (tabId) {
        browser.tabs.update(tabId, { active: true })
        window.close()
    }
}

// 关闭标签页
const closeTab = (tabId: number | undefined, event: Event) => {
    event.stopPropagation()
    if (tabId) {
        browser.tabs.remove(tabId)
        getCurrentTabs()
    }
}

onMounted(() => {
    getCurrentTabs()
})
</script>
<template>
    <div class="px-4 py-3" v-show="tabs.length > 0 && !props.showSettings && !props.showEditSites">
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">当前窗口标签</h3>
        <div class="space-y-2 max-h-32 overflow-y-auto">
            <div v-for="tab in tabs" :key="tab.id" @click="switchToTab(tab.id)"
                class="flex items-center p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer border border-gray-200 dark:border-gray-600 group">
                <div class="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
                    <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="w-4 h-4" :alt="tab.title"
                        @error="handleImageError" />
                    <Icon v-else icon="mdi:web" class="w-4 h-4 text-gray-400" />
                </div>
                <span class="text-xs text-gray-700 dark:text-gray-200 truncate flex-1">{{ tab.title }}</span>
                <button @click="closeTab(tab.id, $event)"
                    class="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-all duration-200">
                    <Icon icon="mdi:close" class="text-xs text-red-500" />
                </button>
            </div>
        </div>
    </div>
</template>