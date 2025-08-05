<script setup lang="ts">
import MainContent from './components/MainContent.vue'

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center" style="background: linear-gradient(to bottom right, #fefefe, #f8f9fa)">
    <!-- 主要内容区域 -->
    <MainContent></MainContent>
  </div>
</template>

<style scoped>
/* 背景装饰 */
.min-h-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 200, 198, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(209, 213, 219, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
