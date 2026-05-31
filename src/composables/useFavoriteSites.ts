import { ref } from 'vue'
import { defaultFavoriteSites, type FavoriteSite } from '@/config/defaultSites'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

/**
 * 常用网站管理 composable
 * @param options 配置选项
 */
export function useFavoriteSites() {
  const sites = ref<FavoriteSite[]>([...defaultFavoriteSites])
  let isWatching = false
  let loadDebounceTimer: ReturnType<typeof setTimeout> | null = null

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
          sites.value = arr
        }
      }
    } catch (error) {
      console.error('加载常用网站失败:', error)
    }
  }

  const saveSites = async () => {
    try {
      await browser.storage.local.set({ favoriteSites: sites.value })
    } catch (error) {
      console.error('保存常用网站失败:', error)
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
    // 防止重复注册监听器
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
    sites,
    loadSites,
    saveSites,
    startWatching,
    stopWatching,
  }
}
