import { defineStore } from 'pinia'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

export const useSettingsStore = defineStore('settings', () => {
    const updateSetting = ref(false)

    // 主题设置
    const theme = ref<'light' | 'dark' | 'auto'>('light')
    const isDarkMode = ref(false)

    // 背景设置
    const backgroundType = ref<'default' | 'custom'>('default')
    const customBackground = ref('')

    // 初始化主题
    const initTheme = async () => {
        try {
            // 从存储中读取主题设置
            const result = await browser.storage.local.get(['theme', 'backgroundType', 'customBackground'])

            if (result.theme && typeof result.theme === 'string' && ['light', 'dark', 'auto'].includes(result.theme)) {
                theme.value = result.theme as 'light' | 'dark' | 'auto'
            }
            if (result.backgroundType && typeof result.backgroundType === 'string' && ['default', 'custom'].includes(result.backgroundType)) {
                backgroundType.value = result.backgroundType as 'default' | 'custom'
            }
            if (result.customBackground && typeof result.customBackground === 'string') {
                customBackground.value = result.customBackground
            }

            // 应用主题
            applyTheme()
        } catch (error) {
            console.error('初始化主题失败:', error)
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

    return {
        updateSetting,
        theme,
        isDarkMode,
        backgroundType,
        customBackground,
        initTheme,
        setTheme,
        setBackground
    }
})