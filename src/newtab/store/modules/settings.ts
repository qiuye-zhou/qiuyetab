import { defineStore } from 'pinia'
import { ref } from 'vue'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

// 本地背景图片的类型定义
interface LocalBackground {
  id: string
  name: string
  data: string // base64编码
  enabled: boolean
  createdAt: number
}

const isValidLocalBackground = (item: unknown): item is LocalBackground => {
  if (typeof item !== 'object' || item === null) return false
  const obj = item as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.data === 'string' &&
    typeof obj.enabled === 'boolean' &&
    typeof obj.createdAt === 'number'
  )
}

// 校验 URL 协议安全性
const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'data:', 'blob:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const isSettingsLoaded = ref(false)

  // 主题设置
  const theme = ref<'light' | 'dark' | 'auto'>('light')
  const isDarkMode = ref(false)

  // 系统主题变化监听器引用（用于清理）
  let mediaQueryCleanup: (() => void) | null = null

  // 背景设置
  const backgroundType = ref<'default' | 'custom' | 'local'>('default')
  const customBackground = ref('')
  const localBackgrounds = ref<LocalBackground[]>([])
  const backgroundOpacity = ref(0.8)

  // 显示设置
  const showTimeDisplay = ref(true)

  // 布局设置
  const searchBarPositionY = ref(50) // Y轴位置百分比 (0-100)

  // 初始化主题
  const initTheme = async () => {
    try {
      // 从存储中读取主题设置
      const result = await browser.storage.local.get([
        'theme',
        'backgroundType',
        'customBackground',
        'localBackgrounds',
        'backgroundOpacity',
        'showTimeDisplay',
        'searchBarPositionY',
      ])

      if (
        result.theme &&
        typeof result.theme === 'string' &&
        ['light', 'dark', 'auto'].includes(result.theme)
      ) {
        theme.value = result.theme as 'light' | 'dark' | 'auto'
      }
      if (
        result.backgroundType &&
        typeof result.backgroundType === 'string' &&
        ['default', 'custom', 'local'].includes(result.backgroundType)
      ) {
        backgroundType.value = result.backgroundType as
          | 'default'
          | 'custom'
          | 'local'
      }
      if (
        result.customBackground &&
        typeof result.customBackground === 'string'
      ) {
        // 校验 URL 协议安全性，防止存储值被篡改
        if (isValidImageUrl(result.customBackground)) {
          customBackground.value = result.customBackground
        }
      }
      if (result.localBackgrounds) {
        if (Array.isArray(result.localBackgrounds)) {
          // 直接是数组格式
          const isValidBackgroundArray = result.localBackgrounds.every(
            isValidLocalBackground,
          )
          if (isValidBackgroundArray) {
            localBackgrounds.value = result.localBackgrounds
          }
        } else if (
          typeof result.localBackgrounds === 'object' &&
          result.localBackgrounds !== null
        ) {
          // 可能是对象格式，尝试转换为数组
          const backgroundArray = Object.values(result.localBackgrounds)
          if (
            Array.isArray(backgroundArray) &&
            backgroundArray.every(isValidLocalBackground)
          ) {
            localBackgrounds.value = backgroundArray
          }
        }
      }
      if (
        typeof result.backgroundOpacity === 'number' &&
        result.backgroundOpacity >= 0 &&
        result.backgroundOpacity <= 1
      ) {
        backgroundOpacity.value = result.backgroundOpacity
      }
      if (typeof result.showTimeDisplay === 'boolean') {
        showTimeDisplay.value = result.showTimeDisplay
      }
      if (
        typeof result.searchBarPositionY === 'number' &&
        result.searchBarPositionY >= 0 &&
        result.searchBarPositionY <= 100
      ) {
        searchBarPositionY.value = result.searchBarPositionY
      }

      // 应用主题
      applyTheme()

      // 设置加载完成
      isSettingsLoaded.value = true
    } catch (error) {
      console.error('初始化主题失败:', error)
      // 即使出错也要设置加载完成，避免无限等待
      isSettingsLoaded.value = true
    }
  }

  // 应用主题
  const applyTheme = () => {
    const root = document.documentElement

    // 先清理之前的系统主题监听器
    if (mediaQueryCleanup) {
      mediaQueryCleanup()
      mediaQueryCleanup = null
    }

    if (theme.value === 'auto') {
      // 自动模式：根据系统偏好设置
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
      isDarkMode.value = prefersDark
    } else {
      isDarkMode.value = theme.value === 'dark'
    }

    // 设置HTML类名
    if (isDarkMode.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 监听系统主题变化（仅在自动模式下）
    if (theme.value === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        isDarkMode.value = e.matches
        if (e.matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      // 保存清理函数以便下次移除
      mediaQueryCleanup = () =>
        mediaQuery.removeEventListener('change', handleChange)
    }
  }

  // 设置主题
  const setTheme = async (newTheme: 'light' | 'dark' | 'auto') => {
    theme.value = newTheme

    // 保存到存储
    try {
      await browser.storage.local.set({ theme: newTheme })
    } catch (error) {
      console.error('保存主题设置失败:', error)
    }

    // 应用主题
    applyTheme()
  }

  // 设置背景
  const setBackground = async (
    type: 'default' | 'custom' | 'local',
    customUrl?: string,
  ) => {
    backgroundType.value = type

    // 处理自定义背景URL
    if (customUrl !== undefined) {
      customBackground.value = customUrl
    }

    // 保存到存储
    try {
      const updateData: Record<string, unknown> = {
        backgroundType: type,
      }

      // 总是保存customBackground，即使是空字符串也要保存（用于清除）
      if (customUrl !== undefined) {
        updateData.customBackground = customUrl
      }

      await browser.storage.local.set(updateData)
    } catch (error) {
      console.error('保存背景设置失败:', error)
    }
  }

  // 设置背景透明度
  const setBackgroundOpacity = async (opacity: number) => {
    // 确保透明度在0-1范围内
    const clampedOpacity = Math.max(0, Math.min(1, opacity))
    backgroundOpacity.value = clampedOpacity

    // 保存到存储
    try {
      await browser.storage.local.set({
        backgroundOpacity: clampedOpacity,
      })
    } catch (error) {
      console.error('保存背景透明度设置失败:', error)
    }
  }

  // 添加本地背景
  const addLocalBackground = async (name: string, data: string) => {
    const newBackground: LocalBackground = {
      id: crypto.randomUUID(),
      name,
      data,
      enabled: true,
      createdAt: Date.now(),
    }

    localBackgrounds.value.push(newBackground)

    // 保存到存储
    try {
      const saveData = {
        localBackgrounds: localBackgrounds.value,
      }
      await browser.storage.local.set(saveData)
    } catch (error) {
      // 如果保存失败，回滚
      localBackgrounds.value.pop()
      throw error
    }
  }

  // 删除本地背景
  const removeLocalBackground = async (id: string) => {
    const index = localBackgrounds.value.findIndex((bg) => bg.id === id)
    if (index === -1) return

    // 在移除前保存被移除的元素，以便回滚
    const removedBackground = localBackgrounds.value[index]
    localBackgrounds.value.splice(index, 1)

    // 保存到存储
    try {
      await browser.storage.local.set({
        localBackgrounds: localBackgrounds.value,
      })
    } catch (error) {
      // 如果保存失败，回滚
      if (removedBackground) {
        localBackgrounds.value.splice(index, 0, removedBackground)
      }
      throw error
    }
  }

  // 切换背景启用状态
  const toggleLocalBackground = async (id: string) => {
    const background = localBackgrounds.value.find((bg) => bg.id === id)
    if (!background) return

    background.enabled = !background.enabled

    // 保存到存储
    try {
      await browser.storage.local.set({
        localBackgrounds: localBackgrounds.value,
      })
    } catch (error) {
      // 如果保存失败，回滚
      background.enabled = !background.enabled
      throw error
    }
  }

  // 获取随机启用的背景
  const getRandomLocalBackground = (): string | null => {
    const enabledBackgrounds = localBackgrounds.value.filter((bg) => bg.enabled)
    if (enabledBackgrounds.length === 0) return null

    const randomIndex = Math.floor(Math.random() * enabledBackgrounds.length)
    const selectedBackground = enabledBackgrounds[randomIndex]
    return selectedBackground?.data ?? null
  }

  // 设置显示选项
  const setDisplayOptions = async (options: { showTimeDisplay?: boolean }) => {
    if (typeof options.showTimeDisplay === 'boolean') {
      showTimeDisplay.value = options.showTimeDisplay
    }

    // 保存到存储
    try {
      const updateData: Record<string, unknown> = {}
      if (typeof options.showTimeDisplay === 'boolean') {
        updateData.showTimeDisplay = options.showTimeDisplay
      }
      await browser.storage.local.set(updateData)
    } catch (error) {
      console.error('保存显示设置失败:', error)
    }
  }

  // 设置搜索栏Y轴位置
  const setSearchBarPositionY = async (positionY: number) => {
    // 确保位置在0-100范围内
    const clampedPosition = Math.max(0, Math.min(100, positionY))
    searchBarPositionY.value = clampedPosition

    // 保存到存储
    try {
      await browser.storage.local.set({ searchBarPositionY: clampedPosition })
    } catch (error) {
      console.error('保存搜索栏位置设置失败:', error)
    }
  }

  // 临时更新搜索栏Y轴位置（不保存到存储）
  const updateSearchBarPositionY = (positionY: number) => {
    // 确保位置在0-100范围内
    const clampedPosition = Math.max(0, Math.min(100, positionY))
    searchBarPositionY.value = clampedPosition
  }

  // 清理主题监听器（用于组件卸载时调用）
  const disposeTheme = () => {
    if (mediaQueryCleanup) {
      mediaQueryCleanup()
      mediaQueryCleanup = null
    }
  }

  return {
    isSettingsLoaded,
    theme,
    isDarkMode,
    backgroundType,
    customBackground,
    localBackgrounds,
    backgroundOpacity,
    showTimeDisplay,
    searchBarPositionY,
    initTheme,
    setTheme,
    setBackground,
    setBackgroundOpacity,
    addLocalBackground,
    removeLocalBackground,
    toggleLocalBackground,
    getRandomLocalBackground,
    setDisplayOptions,
    setSearchBarPositionY,
    updateSearchBarPositionY,
    disposeTheme,
  }
})
