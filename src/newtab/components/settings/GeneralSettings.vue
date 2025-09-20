<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<template>
  <div class="space-y-8">
    <div class="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
      <div class="flex items-start space-x-2">
        <Icon icon="mdi:information" class="text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <p class="text-sm text-blue-800 dark:text-blue-200 font-medium">功能开发中</p>
          <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">部分通用设置功能正在开发中，敬请期待...</p>
        </div>
      </div>
    </div>
  </div>
</template>
