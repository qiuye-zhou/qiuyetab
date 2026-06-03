import { ref } from 'vue'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

export interface TodoItem {
  id: number
  text: string
  completed: boolean
  dueDate: string | null
  createdAt: number
}

const STORAGE_KEY = 'todos'
const MAX_IMPORT_LINES = 1000

// 解析 YYYY-MM-DD 日期字符串为本地时间 Date（避免时区偏移）
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return new Date(dateStr)
  const y = Number(parts[0])
  const m = Number(parts[1])
  const d = Number(parts[2])
  // 校验年月日范围
  if (isNaN(y) || isNaN(m) || isNaN(d)) return new Date(dateStr)
  if (m < 1 || m > 12 || d < 1 || d > 31) return new Date(dateStr)
  return new Date(y, m - 1, d)
}

// 校验单个 TodoItem 的基本结构
function isValidTodoItem(item: unknown): item is TodoItem {
  if (typeof item !== 'object' || item === null) return false
  const obj = item as Record<string, unknown>
  return (
    typeof obj.id === 'number' &&
    typeof obj.text === 'string' &&
    typeof obj.completed === 'boolean' &&
    (obj.dueDate === null || typeof obj.dueDate === 'string') &&
    typeof obj.createdAt === 'number'
  )
}

// 单例模式：所有调用 useTodos() 的组件共享同一个响应式状态
const todos = ref<TodoItem[]>([])
let isWatching = false
let loadDebounceTimer: ReturnType<typeof setTimeout> | null = null
let watcherCount = 0

export function useTodos() {
  const loadTodos = async () => {
    try {
      let result = await browser.storage.local.get([STORAGE_KEY])
      if (!result[STORAGE_KEY]) {
        result = await browser.storage.sync.get([STORAGE_KEY])
      }

      if (result[STORAGE_KEY]) {
        let arr = result[STORAGE_KEY]
        if (typeof arr === 'object' && !Array.isArray(arr)) {
          arr = Object.values(arr)
        }
        if (Array.isArray(arr)) {
          // Schema 校验：过滤掉不合法的数据
          const validItems = arr.filter(isValidTodoItem)
          todos.value = validItems
        }
      }
    } catch (error) {
      console.error('加载待办事项失败:', error)
    }
  }

  const saveTodos = async () => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: todos.value })
    } catch (error) {
      console.error('保存待办事项失败:', error)
      throw error
    }
  }

  const addTodo = async (text: string, dueDate?: string | null) => {
    const newId = todos.value.reduce((max, t) => Math.max(max, t.id), 0) + 1
    const newTodo: TodoItem = {
      id: newId,
      text: text.trim(),
      completed: false,
      dueDate: dueDate ?? null,
      createdAt: Date.now(),
    }
    // 写入前快照，失败时回滚
    const snapshot = [...todos.value]
    todos.value.unshift(newTodo)
    try {
      await saveTodos()
    } catch {
      todos.value = snapshot
    }
  }

  const toggleTodo = async (id: number) => {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) {
      const prev = todo.completed
      todo.completed = !todo.completed
      try {
        await saveTodos()
      } catch {
        todo.completed = prev
      }
    }
  }

  const removeTodo = async (id: number) => {
    const snapshot = [...todos.value]
    todos.value = todos.value.filter((t) => t.id !== id)
    try {
      await saveTodos()
    } catch {
      todos.value = snapshot
    }
  }

  const updateTodo = async (
    id: number,
    updates: { text?: string; dueDate?: string | null },
  ) => {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) {
      const prevText = todo.text
      const prevDueDate = todo.dueDate
      if (updates.text !== undefined) todo.text = updates.text.trim()
      if (updates.dueDate !== undefined) todo.dueDate = updates.dueDate
      try {
        await saveTodos()
      } catch {
        todo.text = prevText
        todo.dueDate = prevDueDate
      }
    }
  }

  const exportToMarkdown = (): string => {
    if (todos.value.length === 0) return ''
    return todos.value
      .map((t) => {
        const check = t.completed ? '[x]' : '[ ]'
        const date = t.dueDate ? ` 📅 ${t.dueDate}` : ''
        return `- ${check} ${t.text}${date}`
      })
      .join('\n')
  }

  const importFromMarkdown = async (content: string) => {
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    // 限制导入行数，防止性能问题
    if (lines.length > MAX_IMPORT_LINES) {
      throw new Error(`导入内容超过 ${MAX_IMPORT_LINES} 行限制`)
    }

    let maxId = todos.value.reduce((max, t) => Math.max(max, t.id), 0)
    const newTodos: TodoItem[] = []
    const baseTime = Date.now()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let text = line
      let completed = false
      let dueDate: string | null = null

      // 解析 markdown checkbox: - [x] text 或 - [ ] text
      const checkboxMatch = line.match(/^-\s*\[([ xX])\]\s*(.+)$/)
      if (checkboxMatch) {
        completed = checkboxMatch[1] !== ' '
        text = checkboxMatch[2]
      } else if (line.startsWith('- ')) {
        // 普通列表项: - text
        text = line.slice(2)
      }

      // 解析截止日期: 📅 YYYY-MM-DD
      const dateMatch = text.match(/\s*📅\s*(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) {
        dueDate = dateMatch[1]
        text = text.replace(dateMatch[0], '').trim()
      }

      if (text) {
        newTodos.push({
          id: ++maxId,
          text,
          completed,
          dueDate,
          createdAt: baseTime + i, // 每项递增 1ms，避免全部相同
        })
      }
    }

    if (newTodos.length > 0) {
      const snapshot = [...todos.value]
      todos.value = [...newTodos, ...todos.value]
      try {
        await saveTodos()
      } catch {
        todos.value = snapshot
      }
    }

    return newTodos.length
  }

  const handleStorageChange = (
    changes: Record<string, { newValue?: unknown }>,
  ) => {
    if (changes[STORAGE_KEY]) {
      if (loadDebounceTimer) {
        clearTimeout(loadDebounceTimer)
      }
      loadDebounceTimer = setTimeout(() => {
        loadTodos()
      }, 100)
    }
  }

  const startWatching = () => {
    watcherCount++
    if (isWatching) return
    isWatching = true
    browser.storage.onChanged.addListener(handleStorageChange)
  }

  const stopWatching = () => {
    watcherCount = Math.max(0, watcherCount - 1)
    // 只有当没有组件在使用时才真正移除监听器
    if (watcherCount > 0) return
    isWatching = false
    if (loadDebounceTimer) {
      clearTimeout(loadDebounceTimer)
      loadDebounceTimer = null
    }
    browser.storage.onChanged.removeListener(handleStorageChange)
  }

  return {
    todos,
    loadTodos,
    saveTodos,
    addTodo,
    toggleTodo,
    removeTodo,
    updateTodo,
    exportToMarkdown,
    importFromMarkdown,
    startWatching,
    stopWatching,
  }
}
