import { defineStore } from 'pinia'
import { ref } from 'vue'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

export const useSettingsStore = defineStore('settings', () => {
    const updateSetting = ref(false)
    const isSettingsLoaded = ref(false)

    // 主题设置
    const theme = ref<'light' | 'dark' | 'auto'>('light')
    const isDarkMode = ref(false)

    // 背景设置
    const backgroundType = ref<'default' | 'custom'>('default')
    const customBackground = ref('')
    const backgroundOpacity = ref(0.8)

    // 显示设置
    const showTimeDisplay = ref(true)
    const showSearchHints = ref(true)

    // 布局设置
    const searchBarPositionY = ref(50) // Y轴位置百分比 (0-100)

    // 初始化主题
    const initTheme = async () => {
        try {
            // 从存储中读取主题设置
            const result = await browser.storage.local.get(['theme', 'backgroundType', 'customBackground', 'backgroundOpacity', 'showTimeDisplay', 'showSearchHints', 'searchBarPositionY'])

            if (result.theme && typeof result.theme === 'string' && ['light', 'dark', 'auto'].includes(result.theme)) {
                theme.value = result.theme as 'light' | 'dark' | 'auto'
            }
            if (result.backgroundType && typeof result.backgroundType === 'string' && ['default', 'custom'].includes(result.backgroundType)) {
                backgroundType.value = result.backgroundType as 'default' | 'custom'
            }
            if (result.customBackground && typeof result.customBackground === 'string') {
                customBackground.value = result.customBackground
            }
            if (typeof result.backgroundOpacity === 'number' && result.backgroundOpacity >= 0 && result.backgroundOpacity <= 1) {
                backgroundOpacity.value = result.backgroundOpacity
            }
            if (typeof result.showTimeDisplay === 'boolean') {
                showTimeDisplay.value = result.showTimeDisplay
            }
            if (typeof result.showSearchHints === 'boolean') {
                showSearchHints.value = result.showSearchHints
            }
            if (typeof result.searchBarPositionY === 'number' && result.searchBarPositionY >= 0 && result.searchBarPositionY <= 100) {
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

        if (theme.value === 'auto') {
            // 自动模式：根据系统偏好设置
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
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

            // 移除旧的监听器
            mediaQuery.removeEventListener('change', handleChange)
            // 添加新的监听器
            mediaQuery.addEventListener('change', handleChange)
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
    const setBackground = async (type: 'default' | 'custom', customUrl?: string) => {
        backgroundType.value = type
        if (customUrl) {
            customBackground.value = customUrl
        }

        // 保存到存储
        try {
            await browser.storage.local.set({
                backgroundType: type,
                customBackground: customUrl || customBackground.value
            })
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
                backgroundOpacity: clampedOpacity
            })
        } catch (error) {
            console.error('保存背景透明度设置失败:', error)
        }
    }

    // 设置显示选项
    const setDisplayOptions = async (options: { showTimeDisplay?: boolean; showSearchHints?: boolean }) => {
        if (typeof options.showTimeDisplay === 'boolean') {
            showTimeDisplay.value = options.showTimeDisplay
        }
        if (typeof options.showSearchHints === 'boolean') {
            showSearchHints.value = options.showSearchHints
        }

        // 保存到存储
        try {
            const updateData: Record<string, any> = {}
            if (typeof options.showTimeDisplay === 'boolean') {
                updateData.showTimeDisplay = options.showTimeDisplay
            }
            if (typeof options.showSearchHints === 'boolean') {
                updateData.showSearchHints = options.showSearchHints
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

    return {
        updateSetting,
        isSettingsLoaded,
        theme,
        isDarkMode,
        backgroundType,
        customBackground,
        backgroundOpacity,
        showTimeDisplay,
        showSearchHints,
        searchBarPositionY,
        initTheme,
        setTheme,
        setBackground,
        setBackgroundOpacity,
        setDisplayOptions,
        setSearchBarPositionY,
        updateSearchBarPositionY
    }
})