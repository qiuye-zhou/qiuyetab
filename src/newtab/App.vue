<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import MainContent from './components/MainContent.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import TodoList from './components/TodoList.vue'
import { useSettingsStore } from './store/modules/settings'
import { useTodos, parseLocalDate } from '@/composables/useTodos'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const {
  isDarkMode,
  backgroundType,
  customBackground,
  localBackgrounds,
  backgroundOpacity,
} = storeToRefs(settingsStore)

// 设置面板状态
const isSettingsOpen = ref(false)
const settingsPage = ref('')

// 待办弹窗状态
const isTodoOpen = ref(false)

// 最近七天待办
const {
  todos,
  startWatching: startTodoWatching,
  stopWatching: stopTodoWatching,
} = useTodos()

// 日期格式化缓存，避免模板中重复计算
const formatDateLabel = (dateStr: string): string => {
  const date = parseLocalDate(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const upcomingTodos = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

  return todos.value
    .filter((t) => {
      if (t.completed || !t.dueDate) return false
      const due = parseLocalDate(t.dueDate)
      return due >= today && due <= sevenDaysLater
    })
    .sort(
      (a, b) =>
        parseLocalDate(a.dueDate!).getTime() -
        parseLocalDate(b.dueDate!).getTime(),
    )
    .map((t) => ({
      ...t,
      dateLabel: formatDateLabel(t.dueDate!),
    }))
})

// 切换设置面板
const toggleSettings = () => {
  isSettingsOpen.value = !isSettingsOpen.value
}

// 关闭设置面板
const closeSettings = () => {
  isSettingsOpen.value = false
  settingsPage.value = ''
}

// 打开设置面板到指定页面
const openSettingsPage = (page: string) => {
  settingsPage.value = page
  isSettingsOpen.value = true
}

// 计算背景样式
const backgroundStyle = computed(() => {
  // 始终使用主题背景颜色作为基础
  return {
    background: isDarkMode.value
      ? 'linear-gradient(to bottom right, #1f2937, #111827)'
      : 'linear-gradient(to bottom right, #fefefe, #f8f9fa)',
  }
})

const currentLocalBackground = ref<string | null>(null)

// 校验 URL 协议安全性
const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'data:', 'blob:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// 计算背景图片URL和透明度（用于CSS变量）
const backgroundImageUrl = computed(() => {
  if (backgroundType.value === 'custom' && customBackground.value) {
    // 渲染时二次校验 URL 协议，防止存储值被篡改
    if (!isValidImageUrl(customBackground.value)) return 'none'
    return `url('${customBackground.value.replace(/'/g, "\\'")}')`
  }
  if (backgroundType.value === 'local' && currentLocalBackground.value) {
    return `url(${currentLocalBackground.value})`
  }
  return 'none'
})

const backgroundImageOpacity = computed(() => {
  return backgroundOpacity.value
})

// 定时切换背景
let backgroundTimer: number | null = null

const updateLocalBackground = () => {
  if (backgroundType.value === 'local') {
    const randomBackground = settingsStore.getRandomLocalBackground()
    currentLocalBackground.value = randomBackground
  } else {
    currentLocalBackground.value = null
  }
}

const startBackgroundRotation = () => {
  if (backgroundTimer) {
    clearInterval(backgroundTimer)
  }

  // 立即设置一次背景
  updateLocalBackground()

  if (
    backgroundType.value === 'local' &&
    localBackgrounds.value.filter((bg) => bg.enabled).length > 1
  ) {
    backgroundTimer = setInterval(() => {
      updateLocalBackground()
    }, 1000 * 60) as unknown as number
  }
}

const stopBackgroundRotation = () => {
  if (backgroundTimer) {
    clearInterval(backgroundTimer)
    backgroundTimer = null
  }
}

// 监听背景类型变化
watch(backgroundType, (newType) => {
  if (newType === 'local') {
    startBackgroundRotation()
  } else {
    stopBackgroundRotation()
  }
})

// 监听背景列表变化 — 只在数量变化时重启定时器
watch(
  () => localBackgrounds.value.filter((bg) => bg.enabled).length,
  (newCount, oldCount) => {
    if (backgroundType.value === 'local' && newCount !== oldCount) {
      startBackgroundRotation()
    }
  },
)

// 初始化主题
onMounted(async () => {
  await settingsStore.initTheme()
  // loadTodos 由 TodoList 组件自行加载，此处不重复调用
  startTodoWatching()

  // 如果当前是本地背景模式，启动定时切换
  if (backgroundType.value === 'local') {
    startBackgroundRotation()
  }
})

// 组件卸载时清理定时器和主题监听器
onUnmounted(() => {
  stopBackgroundRotation()
  stopTodoWatching()
  settingsStore.disposeTheme()
})
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center relative transition-colors duration-300"
    :class="isDarkMode ? 'dark' : ''"
    :style="{
      ...backgroundStyle,
      '--bg-image': backgroundImageUrl,
      '--bg-opacity': backgroundImageOpacity,
    }"
    :data-has-bg="backgroundImageUrl ? 'true' : 'false'"
  >
    <!-- 右上角按钮组 -->
    <div class="fixed top-2 right-2 z-50 flex items-center gap-1">
      <button
        @click="isTodoOpen = !isTodoOpen"
        class="p-3 transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <Icon
          icon="mdi:clipboard-check-outline"
          class="text-2xl text-gray-600 dark:text-gray-300"
        />
      </button>
      <button
        @click="toggleSettings"
        class="p-3 transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <Icon
          icon="mdi:cog"
          class="text-2xl text-gray-600 dark:text-gray-300"
        />
      </button>
    </div>

    <!-- 左上角最近七天待办 -->
    <div
      v-if="upcomingTodos.length > 0"
      class="fixed top-2 left-2 z-50 max-w-xs"
    >
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 p-3"
      >
        <div class="flex items-center gap-1.5 mb-2">
          <Icon icon="mdi:calendar-clock" class="text-sm text-blue-500" />
          <span class="text-xs font-medium text-gray-600 dark:text-gray-300"
            >近七天待办</span
          >
        </div>
        <div class="space-y-1.5">
          <div
            v-for="todo in upcomingTodos"
            :key="todo.id"
            class="flex items-center gap-2 text-xs"
          >
            <span
              class="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium"
              :class="
                todo.dateLabel === '今天'
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                  : todo.dateLabel === '明天'
                    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              "
            >
              {{ todo.dateLabel }}
            </span>
            <span class="truncate text-gray-700 dark:text-gray-300">{{
              todo.text
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <MainContent
      @open-favorite-settings="openSettingsPage('favorites')"
    ></MainContent>

    <!-- 设置面板 -->
    <SettingsPanel
      :is-open="isSettingsOpen"
      :default-page="settingsPage"
      @close="closeSettings"
    />

    <!-- 待办事项弹窗 -->
    <TodoList :is-open="isTodoOpen" @close="isTodoOpen = false" />
  </div>
</template>

<style scoped>
/* 自定义背景图片 - 使用伪元素 */
.min-h-screen[data-has-bg='true']::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: var(--bg-opacity);
  z-index: 0;
  pointer-events: none;
}
/* 背景装饰 - 仅在默认背景时显示 */
.min-h-screen[data-has-bg='false']::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      circle at 20% 80%,
      rgba(120, 119, 198, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 119, 198, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      rgba(120, 200, 198, 0.05) 0%,
      transparent 50%
    );
  pointer-events: none;
}

/* 深色模式下的背景装饰 */
.dark .min-h-screen[data-has-bg='false']::before {
  background:
    radial-gradient(
      circle at 20% 80%,
      rgba(120, 119, 198, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 119, 198, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      rgba(120, 200, 198, 0.1) 0%,
      transparent 50%
    );
}
</style>
