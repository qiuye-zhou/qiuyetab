<script setup lang="ts">
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'
import { useGlobalStore } from '../store/modules/global'
import { storeToRefs } from 'pinia'

const global = useGlobalStore()

const { appVersion, showSettings, showEditSites } = storeToRefs(global)

const emit = defineEmits(['openSite'])


// 使用 browser API
const browser = webExtensionPolyfill

// 打开新标签页
const openNewTab = () => {
    browser.tabs.create({ url: 'chrome://newtab/' })
    window.close()
}
</script>
<template>
    <div v-show="!showSettings && !showEditSites"
        class="p-4 border-t border-gray-200 dark:border-gray-700 mt-4">
        <button @click="openNewTab"
            class="w-full flex items-center justify-center p-3 bg-gray-400 hover:bg-gray-500 text-white rounded-xl transition-colors duration-200 mb-3">
            <Icon icon="mdi:plus" class="mr-2" />
            新建标签页
        </button>

        <!-- 版本信息 -->
        <div class="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
            <Icon icon="mdi:information-outline" class="mr-1" />
            <span class="flex items-center justify-center cursor-pointer"
                @click="emit('openSite', 'https://github.com/qiuye-zhou')">
                <Icon icon="mdi:github"></Icon>秋叶
            </span>
            <span class="mx-2">|</span>
            <span>新标签页 v{{ appVersion }}</span>
        </div>
    </div>
</template>