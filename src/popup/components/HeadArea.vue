<script setup lang="ts">
import { useGlobalStore } from '../store/modules/global'
import { storeToRefs } from 'pinia'
import TimeClock from './TimeClock.vue'

const global = useGlobalStore()
const { appVersion } = storeToRefs(global)
</script>
<template>
  <div class="p-4 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-xl font-bold text-gray-600 dark:text-green-300">
            新标签页
          </h1>
          <span
            class="text-xs bg-gray-100 dark:bg-green-800 text-gray-500 dark:text-green-300 px-2 py-1 rounded-full"
          >
            v{{ appVersion }}
          </span>
        </div>
      </div>
      <TimeClock />
    </div>
  </div>
</template>
