<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'
import { defaultFavoriteSites, type FavoriteSite } from '@/config/defaultSites'
import { fetchFavicon, isFaviconUrl } from '@/utils/favicon'

const browser = webExtensionPolyfill

const sites = ref<FavoriteSite[]>([...defaultFavoriteSites])

// 编辑状态
const editingSite = ref<FavoriteSite | null>(null)
const isAddingNew = ref(false)

// 加载常用网站
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

// 保存到存储
const saveSites = async () => {
  try {
    await browser.storage.local.set({ favoriteSites: sites.value })
  } catch (error) {
    console.error('保存常用网站失败:', error)
  }
}

// 添加新网站
const addNewSite = () => {
  isAddingNew.value = true
  editingSite.value = { name: '', url: '', favicon: 'mdi:web' }
}

// 编辑网站
const editSite = (site: FavoriteSite) => {
  isAddingNew.value = false
  editingSite.value = { ...site }
}

// 删除网站
const deleteSite = async (siteId: number) => {
  sites.value = sites.value.filter((s) => s.id !== siteId)
  await saveSites()
}

// 保存编辑
const saveEditedSite = async () => {
  if (!editingSite.value) return

  if (isAddingNew.value) {
    const newId = Math.max(...sites.value.map((s) => s.id), 0) + 1
    sites.value.push({ ...editingSite.value, id: newId } as FavoriteSite)
  } else {
    const index = sites.value.findIndex((s) => s.id === editingSite.value?.id)
    if (index !== -1 && editingSite.value.id) {
      sites.value[index] = { ...editingSite.value, id: editingSite.value.id }
    }
  }

  await saveSites()
  editingSite.value = null
  isAddingNew.value = false
}

// 取消编辑
const cancelEdit = () => {
  editingSite.value = null
  isAddingNew.value = false
}

// 自动获取网站 favicon
const fetchingFavicon = ref(false)
const autoFetchFavicon = async () => {
  if (!editingSite.value?.url) return
  fetchingFavicon.value = true
  try {
    const faviconUrl = await fetchFavicon(editingSite.value.url)
    if (faviconUrl) {
      editingSite.value.favicon = faviconUrl
    }
  } finally {
    fetchingFavicon.value = false
  }
}

onMounted(() => {
  loadSites()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        常用网站
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        管理新标签页中显示的常用网站快捷方式
      </p>
    </div>

    <!-- 网站列表 -->
    <div class="space-y-2">
      <div
        v-for="site in sites"
        :key="site.id"
        class="flex items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
      >
        <div
          class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden"
        >
          <img
            v-if="isFaviconUrl(site.favicon)"
            :src="site.favicon"
            :alt="site.name"
            class="w-5 h-5"
          />
          <Icon
            v-else
            :icon="site.favicon"
            class="text-lg text-gray-600 dark:text-gray-300"
          />
        </div>
        <div class="flex-1 min-w-0 ml-3">
          <div
            class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate"
          >
            {{ site.name }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ site.url }}
          </div>
        </div>
        <div class="flex space-x-1 ml-2">
          <button
            @click="editSite(site)"
            class="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Icon icon="mdi:pencil" class="text-sm" />
          </button>
          <button
            @click="deleteSite(site.id)"
            class="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <Icon icon="mdi:delete" class="text-sm" />
          </button>
        </div>
      </div>

      <div
        v-if="sites.length === 0"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <Icon icon="mdi:bookmark-outline" class="text-3xl mb-2" />
        <div class="text-sm">暂无常用网站</div>
      </div>
    </div>

    <!-- 添加按钮 -->
    <button
      @click="addNewSite"
      class="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
    >
      <Icon icon="mdi:plus" class="text-lg" />
      <span class="text-sm">添加网站</span>
    </button>

    <!-- 编辑/添加 弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="editingSite"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click.self="cancelEdit"
          @keyup.escape="cancelEdit"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md space-y-4"
            @click.stop
          >
            <h4 class="text-base font-semibold text-gray-800 dark:text-gray-200">
              {{ isAddingNew ? '添加网站' : '编辑网站' }}
            </h4>

            <div>
              <label
                class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >网站名称</label
              >
              <input
                v-model="editingSite.name"
                type="text"
                placeholder="输入网站名称"
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >网站地址</label
              >
              <input
                v-model="editingSite.url"
                type="text"
                placeholder="https://example.com"
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >图标</label
              >
              <div class="flex gap-2">
                <input
                  v-model="editingSite.favicon"
                  type="text"
                  placeholder="mdi:web 或自动获取"
                  class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  @click="autoFetchFavicon"
                  :disabled="!editingSite.url || fetchingFavicon"
                  class="px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  {{ fetchingFavicon ? '获取中...' : '自动获取' }}
                </button>
              </div>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                输入图标名称(如 mdi:github) 或点击"自动获取"通过网址获取网站图标
              </p>
            </div>

            <div class="flex space-x-3 pt-2">
              <button
                @click="saveEditedSite"
                :disabled="!editingSite.name || !editingSite.url"
                class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm transition-colors"
              >
                保存
              </button>
              <button
                @click="cancelEdit"
                class="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg text-sm transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
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
