import { ref } from 'vue'
import { defaultFavoriteSites, type FavoriteSite } from '@/config/defaultSites'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

// 单例模式：所有调用 useFavoriteSites() 的组件共享同一个响应式状态
const sites = ref<FavoriteSite[]>([...defaultFavoriteSites])
let isWatching = false
let loadDebounceTimer: ReturnType<typeof setTimeout> | null = null
let watcherCount = 0

/**
 * 常用网站管理 composable（单例）
 */
export function useFavoriteSites() {
  const loadSites = async () => {
    try {
      let result = await browser.storage.local.get(['favoriteSites'])
      if (!result.favoriteSites) {
        result = await browser.storage.sync.get(['favoriteSites'])
      }

      if (result.favoriteSites) {
        let arr = result.favoriteSites
        if (typeof arr === 'object' && !Array.isArray(arr)) {
          arr = Object.values(arr)
        }
        if (Array.isArray(arr)) {
          // Schema 校验：确保每项都有必要的字段
          const validItems = arr.filter(
            (item: unknown) =>
              typeof item === 'object' &&
              item !== null &&
              'id' in item &&
              'name' in item &&
              'url' in item,
          )
          sites.value = validItems as FavoriteSite[]
        }
      }
    } catch (error) {
      console.error('加载常用网站失败:', error)
    }
  }

  const saveSites = async () => {
    const snapshot = [...sites.value]
    try {
      await browser.storage.local.set({ favoriteSites: sites.value })
    } catch (error) {
      console.error('保存常用网站失败:', error)
      sites.value = snapshot
      throw error
    }
  }

  const handleStorageChange = (
    changes: Record<string, { newValue?: unknown }>,
  ) => {
    if (changes.favoriteSites) {
      // 防抖：避免多标签页并发写入时的竞态条件
      if (loadDebounceTimer) {
        clearTimeout(loadDebounceTimer)
      }
      loadDebounceTimer = setTimeout(() => {
        loadSites()
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
    sites,
    loadSites,
    saveSites,
    startWatching,
    stopWatching,
  }
}
