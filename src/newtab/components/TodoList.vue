<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useTodos, type TodoItem } from '@/composables/useTodos'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const {
  todos,
  loadTodos,
  addTodo,
  toggleTodo,
  removeTodo,
  updateTodo,
  startWatching,
  stopWatching,
} = useTodos()

// 新增待办
const newText = ref('')
const newDueDate = ref('')

// 编辑状态
const editingId = ref<number | null>(null)
const editText = ref('')
const editDueDate = ref('')

// 过滤
type FilterType = 'all' | 'active' | 'completed'
const currentFilter = ref<FilterType>('all')

const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return todos.value.filter((t) => !t.completed)
    case 'completed':
      return todos.value.filter((t) => t.completed)
    default:
      return todos.value
  }
})

const activeCount = computed(
  () => todos.value.filter((t) => !t.completed).length,
)

const handleAdd = async () => {
  if (!newText.value.trim()) return
  await addTodo(newText.value, newDueDate.value || null)
  newText.value = ''
  newDueDate.value = ''
}

const startEdit = (todo: TodoItem) => {
  editingId.value = todo.id
  editText.value = todo.text
  editDueDate.value = todo.dueDate || ''
}

const saveEdit = async () => {
  if (editingId.value === null || !editText.value.trim()) return
  await updateTodo(editingId.value, {
    text: editText.value,
    dueDate: editDueDate.value || null,
  })
  editingId.value = null
  editText.value = ''
  editDueDate.value = ''
}

const cancelEdit = () => {
  editingId.value = null
  editText.value = ''
  editDueDate.value = ''
}

const isOverdue = (todo: TodoItem) => {
  if (!todo.dueDate || todo.completed) return false
  return new Date(todo.dueDate) < new Date(new Date().toDateString())
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (editingId.value !== null) {
      cancelEdit()
    } else {
      emit('close')
    }
  }
}

onMounted(() => {
  loadTodos()
  startWatching()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stopWatching()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]"
          @click.stop
        >
          <!-- 头部 -->
          <div class="flex items-center justify-between p-5 pb-3">
            <div class="flex items-center gap-2">
              <Icon
                icon="mdi:clipboard-check-outline"
                class="text-xl text-blue-500"
              />
              <h3
                class="text-lg font-semibold text-gray-800 dark:text-gray-200"
              >
                待办事项
              </h3>
              <span
                v-if="activeCount > 0"
                class="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full"
              >
                {{ activeCount }} 项未完成
              </span>
            </div>
            <button
              @click="emit('close')"
              class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <Icon
                icon="mdi:close"
                class="text-lg text-gray-500 dark:text-gray-400"
              />
            </button>
          </div>

          <!-- 过滤标签 -->
          <div class="flex gap-1 px-5 pb-3">
            <button
              v-for="filter in [
                { key: 'all', label: '全部' },
                { key: 'active', label: '未完成' },
                { key: 'completed', label: '已完成' },
              ] as const"
              :key="filter.key"
              @click="currentFilter = filter.key"
              :class="[
                'px-3 py-1 text-xs rounded-full transition-colors cursor-pointer',
                currentFilter === filter.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
              ]"
            >
              {{ filter.label }}
            </button>
          </div>

          <!-- 添加待办 -->
          <div class="px-5 pb-3">
            <div class="flex gap-2">
              <input
                v-model="newText"
                @keyup.enter="handleAdd"
                type="text"
                placeholder="添加新待办..."
                class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                v-model="newDueDate"
                type="date"
                title="截止日期"
                class="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                @click="handleAdd"
                :disabled="!newText.trim()"
                class="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
              >
                <Icon icon="mdi:plus" class="text-lg" />
              </button>
            </div>
          </div>

          <!-- 待办列表 -->
          <div class="flex-1 overflow-y-auto px-5 pb-5 space-y-1">
            <div
              v-if="filteredTodos.length === 0"
              class="text-center py-8 text-gray-400 dark:text-gray-500"
            >
              <Icon icon="mdi:clipboard-text-outline" class="text-3xl mb-2" />
              <p class="text-sm">
                {{
                  currentFilter === 'all' ? '暂无待办事项' : '没有匹配的待办'
                }}
              </p>
            </div>

            <div
              v-for="todo in filteredTodos"
              :key="todo.id"
              class="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <!-- 复选框 -->
              <button
                @click="toggleTodo(todo.id)"
                class="mt-0.5 flex-shrink-0 cursor-pointer"
              >
                <Icon
                  :icon="
                    todo.completed
                      ? 'mdi:checkbox-marked-circle'
                      : 'mdi:checkbox-blank-circle-outline'
                  "
                  class="text-xl"
                  :class="
                    todo.completed
                      ? 'text-green-500'
                      : 'text-gray-400 dark:text-gray-500 hover:text-blue-500'
                  "
                />
              </button>

              <!-- 内容 -->
              <div class="flex-1 min-w-0" v-if="editingId !== todo.id">
                <p
                  class="text-sm text-gray-800 dark:text-gray-200 break-words"
                  :class="{
                    'line-through text-gray-400 dark:text-gray-500':
                      todo.completed,
                  }"
                >
                  {{ todo.text }}
                </p>
                <p
                  v-if="todo.dueDate"
                  class="text-xs mt-1"
                  :class="
                    isOverdue(todo)
                      ? 'text-red-500'
                      : 'text-gray-400 dark:text-gray-500'
                  "
                >
                  <Icon icon="mdi:calendar" class="inline text-xs mr-0.5" />
                  {{ formatDate(todo.dueDate) }}
                  <span v-if="isOverdue(todo)">（已过期）</span>
                </p>
              </div>

              <!-- 编辑模式 -->
              <div v-else class="flex-1 space-y-2">
                <input
                  v-model="editText"
                  @keyup.enter="saveEdit"
                  @keyup.escape="cancelEdit"
                  type="text"
                  class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex gap-2">
                  <input
                    v-model="editDueDate"
                    type="date"
                    class="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    @click="saveEdit"
                    class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    保存
                  </button>
                  <button
                    @click="cancelEdit"
                    class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div
                v-if="editingId !== todo.id"
                class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  @click="startEdit(todo)"
                  class="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors cursor-pointer"
                >
                  <Icon icon="mdi:pencil" class="text-sm" />
                </button>
                <button
                  @click="removeTodo(todo.id)"
                  class="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                >
                  <Icon icon="mdi:delete" class="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
