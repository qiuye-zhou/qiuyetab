<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
    showSettings: Boolean,
    showEditSites: Boolean,
})

const emit = defineEmits(['changeShowSettings'])

const quickActions = ref([
  { name: '历史记录', icon: 'mdi:history', action: 'history' },
  { name: '下载', icon: 'mdi:download', action: 'downloads' },
  { name: '书签', icon: 'mdi:bookmark', action: 'bookmarks' },
  { name: '设置', icon: 'mdi:settings', action: 'settings' }
])

// 快捷操作
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'history':
      browser.tabs.create({ url: 'chrome://history/' })
      break
    case 'downloads':
      browser.tabs.create({ url: 'chrome://downloads/' })
      break
    case 'bookmarks':
      browser.tabs.create({ url: 'chrome://bookmarks/' })
      break
    case 'settings':
      emit('changeShowSettings', true)
      break
  }
  if (action !== 'settings') {
    window.close()
  }
}
</script>
<template>
    <div v-show="!props.showSettings && !props.showEditSites" class="p-4">
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">快捷操作</h3>
        <div class="grid grid-cols-4 gap-3">
            <button v-for="action in quickActions" :key="action.action" @click="handleQuickAction(action.action)"
                class="flex flex-col items-center p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600">
                <Icon :icon="action.icon" class="text-2xl text-gray-400 dark:text-gray-400 mb-1" />
                <span class="text-xs text-gray-600 dark:text-gray-300 text-center">{{ action.name }}</span>
            </button>
        </div>
    </div>
</template>