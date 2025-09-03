<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 响应式数据
const currentTime = ref('')
const currentDate = ref('')

let timeInterval: ReturnType<typeof setInterval>

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

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <div class="text-right">
    <div class="text-2xl font-bold text-gray-600 dark:text-green-300">{{ currentTime }}</div>
    <p class="text-sm text-gray-500 dark:text-green-400">{{ currentDate }}</p>
  </div>
</template>