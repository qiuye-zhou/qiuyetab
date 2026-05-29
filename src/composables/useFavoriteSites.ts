import { ref } from 'vue'
import { defaultFavoriteSites, type FavoriteSite } from '@/config/defaultSites'
import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

/**
 * 常用网站管理 composable
 * @param options 配置选项
 */
export function useFavoriteSites(_options?: { watchChanges?: boolean }) {
  const sites = ref<FavoriteSite[]>([...defaultFavoriteSites])

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
        if (Array.isArray(arr) && arr.length > 0) {
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
      loadSites()
    }
  }

  const startWatching = () => {
    browser.storage.onChanged.addListener(handleStorageChange)
  }

  const stopWatching = () => {
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
