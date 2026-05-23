<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useGlobalStore } from '../store/modules/global'
import { storeToRefs } from 'pinia'

const global = useGlobalStore()
const { appVersion, buildTime } = storeToRefs(global)

const emit = defineEmits(['openSite'])
</script>
<template>
  <div class="p-4 border-t border-gray-200 dark:border-gray-700">
    <div
      class="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
    >
      <span
        class="flex items-center cursor-pointer"
        @click="emit('openSite', 'https://github.com/qiuye-zhou')"
      >
        <Icon icon="mdi:github" class="mr-1" />
        秋叶
      </span>
      <span class="mx-2">|</span>
      <span>v{{ appVersion }}</span>
      <span class="mx-2">|</span>
      <span>{{ new Date(buildTime).toLocaleDateString('zh-CN') }}</span>
    </div>
  </div>
</template>
