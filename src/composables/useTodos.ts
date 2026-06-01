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

export function useTodos() {
  const todos = ref<TodoItem[]>([])
  let isWatching = false
  let loadDebounceTimer: ReturnType<typeof setTimeout> | null = null

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
          todos.value = arr
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
    }
  }

  const addTodo = async (text: string, dueDate?: string | null) => {
    const newId = Math.max(...todos.value.map((t) => t.id), 0) + 1
    todos.value.unshift({
      id: newId,
      text: text.trim(),
      completed: false,
      dueDate: dueDate ?? null,
      createdAt: Date.now(),
    })
    await saveTodos()
  }

  const toggleTodo = async (id: number) => {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      await saveTodos()
    }
  }

  const removeTodo = async (id: number) => {
    todos.value = todos.value.filter((t) => t.id !== id)
    await saveTodos()
  }

  const updateTodo = async (
    id: number,
    updates: { text?: string; dueDate?: string | null },
  ) => {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) {
      if (updates.text !== undefined) todo.text = updates.text.trim()
      if (updates.dueDate !== undefined) todo.dueDate = updates.dueDate
      await saveTodos()
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

    let maxId = Math.max(...todos.value.map((t) => t.id), 0)
    const newTodos: TodoItem[] = []

    for (const line of lines) {
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
          createdAt: Date.now(),
        })
      }
    }

    if (newTodos.length > 0) {
      todos.value = [...newTodos, ...todos.value]
      await saveTodos()
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
    if (isWatching) return
    isWatching = true
    browser.storage.onChanged.addListener(handleStorageChange)
  }

  const stopWatching = () => {
    if (!isWatching) return
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
