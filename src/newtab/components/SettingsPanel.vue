<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import SearchSettings from './settings/SearchSettings.vue'
import AppearanceSettings from './settings/AppearanceSettings.vue'
import LayoutSettings from './settings/LayoutSettings.vue'
import GeneralSettings from './settings/GeneralSettings.vue'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// 设置菜单项
const menuItems = ref([
  { id: 'search', name: '搜索引擎', icon: 'mdi:magnify', com: SearchSettings },
  { id: 'appearance', name: '外观', icon: 'mdi:palette', com: AppearanceSettings },
  { id: 'layout', name: '布局', icon: 'mdi:view-grid', com: LayoutSettings },
  { id: 'general', name: '通用', icon: 'mdi:cog', com: GeneralSettings },
])

// 当前选中的设置页面
const currentPage = ref('search')

const currentComponent = computed(() => menuItems.value.find(item => item.id === currentPage.value)?.com)

const handleClose = () => {
  emit('close')
}

const handlePanelClick = (e: Event) => {
  e.stopPropagation()
}

// 切换设置页面
const switchPage = (pageId: string) => {
  currentPage.value = pageId
}
</script>

<template>
  <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
    enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
    leave-to-class="opacity-0">
    <div v-if="isOpen" @click="handleClose" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"></div>
  </Transition>

  <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full"
    enter-to-class="translate-x-0" leave-active-class="transition-transform duration-300 ease-in"
    leave-from-class="translate-x-0" leave-to-class="translate-x-full">
    <div v-if="isOpen" @click="handlePanelClick"
      class="fixed top-0 right-0 h-full w-[600px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl z-50 flex">
      <!-- 左侧菜单 -->
      <div class="w-48 bg-gray-50/80 dark:bg-gray-700/80 border-r border-gray-200 dark:border-gray-600 flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">设置</h2>
            <button @click="handleClose"
              class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200">
              <Icon icon="mdi:close" class="text-lg text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <nav class="flex-1 p-2">
          <ul class="space-y-1">
            <li v-for="item in menuItems" :key="item.id">
              <button @click="switchPage(item.id)"
                class="w-full flex items-center space-x-3 px-3 py-2 cursor-pointer rounded-lg text-left transition-colors duration-200"
                :class="currentPage === item.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'">
                <Icon :icon="item.icon" class="text-lg" />
                <span class="text-sm font-medium">{{ item.name }}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- 右侧内容区域 -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-6">
          <component :is="currentComponent" />
        </div>
      </div>
    </div>
  </Transition>
</template>
