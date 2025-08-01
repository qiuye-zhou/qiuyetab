<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'

import BottomOperation from './components/BottomOperation.vue'
import CurrentTab from './components/CurrentTab.vue'

// 使用 browser API
const browser = webExtensionPolyfill

// 版本信息 - 从package.json自动获取
declare const __VERSION__: string
const appVersion = __VERSION__

// 响应式数据
const searchQuery = ref('')
const currentTime = ref('')
const currentDate = ref('')
const quickActions = ref([
  { name: '历史记录', icon: 'mdi:history', action: 'history' },
  { name: '下载', icon: 'mdi:download', action: 'downloads' },
  { name: '书签', icon: 'mdi:bookmark', action: 'bookmarks' },
  { name: '设置', icon: 'mdi:settings', action: 'settings' }
])

const recentSites = ref([
  { id: 1, name: 'GitHub', url: 'https://github.com', favicon: 'mdi:github' },
  { id: 2, name: 'TypeScript', url: 'https://www.typescriptlang.org', favicon: 'simple-icons:typescript' }
])

// 常用网站编辑相关
const showEditSites = ref(false)
const editingSite = ref<{ id?: number; name: string; url: string; favicon: string } | null>(null)
const isAddingNew = ref(false)

// 设置相关
const showSettings = ref(false)
const searchEngines = ref([
  { name: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd={query}' },
  { name: 'Google', value: 'google', url: 'https://www.google.com/search?q={query}' },
  { name: '必应', value: 'bing', url: 'https://www.bing.com/search?q={query}' },
  { name: '搜狗', value: 'sogou', url: 'https://www.sogou.com/web?query={query}' },
  { name: '360搜索', value: '360', url: 'https://www.so.com/s?q={query}' }
])
const selectedEngine = ref('baidu')

// 时间更新
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  })
}

// 搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    const engine = searchEngines.value.find(e => e.value === selectedEngine.value)
    if (engine) {
      const searchUrl = engine.url.replace('{query}', encodeURIComponent(searchQuery.value))
      browser.tabs.create({ url: searchUrl })
      window.close()
    }
  }
}

// 快捷操作
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'history':
      browser.tabs.create({ url: 'chrome://history/' })
      break
    case 'downloads':
      browser.tabs.create({ url: 'chrome://downloads/' })
      break
    case 'bookmarks':
      browser.tabs.create({ url: 'chrome://bookmarks/' })
      break
    case 'settings':
      showSettings.value = true
      break
  }
  if (action !== 'settings') {
    window.close()
  }
}

// 打开网站
const openSite = (url: string) => {
  browser.tabs.create({ url })
  window.close()
}

// 保存设置
const saveSettings = async () => {
  try {
    // 只保存到local存储，避免数据格式问题
    await browser.storage.local.set({
      searchEngine: selectedEngine.value,
      favoriteSites: recentSites.value
    })

    showSettings.value = false
    console.log('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}



// 加载设置
const loadSettings = async () => {
  try {
    // 先尝试从local存储加载
    let result = await browser.storage.local.get(['searchEngine', 'favoriteSites'])

    // 如果local存储没有数据，尝试从sync存储加载
    if (!result.searchEngine && !result.favoriteSites) {
      result = await browser.storage.sync.get(['searchEngine', 'favoriteSites'])
    }

    // 加载搜索引擎设置
    if (result.searchEngine && typeof result.searchEngine === 'string') {
      selectedEngine.value = result.searchEngine
    } else {
      selectedEngine.value = 'baidu'
    }

    // 加载常用网站设置
    if (result.favoriteSites) {
      let sitesArray = result.favoriteSites

      // 如果是对象格式，转换为数组
      if (typeof result.favoriteSites === 'object' && !Array.isArray(result.favoriteSites)) {
        sitesArray = Object.values(result.favoriteSites)
      }

      // 验证数组格式并加载
      if (Array.isArray(sitesArray) && sitesArray.length > 0) {
        recentSites.value = sitesArray
      } else {
        recentSites.value = [
          { id: 1, name: 'GitHub', url: 'https://github.com', favicon: 'mdi:github' },
          { id: 2, name: 'TypeScript', url: 'https://www.typescriptlang.org', favicon: 'simple-icons:typescript' }
        ]
      }
    } else {
      recentSites.value = [
        { id: 1, name: 'GitHub', url: 'https://github.com', favicon: 'mdi:github' },
        { id: 2, name: 'TypeScript', url: 'https://www.typescriptlang.org', favicon: 'simple-icons:typescript' }
      ]
    }
  } catch (error) {
    console.error('加载设置失败:', error)
    // 设置默认值
    selectedEngine.value = 'baidu'
    recentSites.value = [
      { id: 1, name: 'GitHub', url: 'https://github.com', favicon: 'mdi:github' },
      { id: 2, name: 'TypeScript', url: 'https://www.typescriptlang.org', favicon: 'simple-icons:typescript' }
    ]
  }
}



// 添加新网站
const addNewSite = () => {
  isAddingNew.value = true
  editingSite.value = { name: '', url: '', favicon: 'mdi:web' }
  showEditSites.value = true
}

// 编辑网站
const editSite = (site: { id: number; name: string; url: string; favicon: string }) => {
  isAddingNew.value = false
  editingSite.value = { ...site }
  showEditSites.value = true
}

// 删除网站
const deleteSite = async (siteId: number) => {
  recentSites.value = recentSites.value.filter(site => site.id !== siteId)

  // 立即保存到存储
  try {
    await browser.storage.local.set({
      favoriteSites: recentSites.value
    })
  } catch (error) {
    console.error('删除网站后保存失败:', error)
  }
}

// 保存编辑的网站
const saveEditedSite = async () => {
  if (!editingSite.value) return

  if (isAddingNew.value) {
    // 添加新网站
    const newId = Math.max(...recentSites.value.map(s => s.id), 0) + 1
    recentSites.value.push({
      ...editingSite.value,
      id: newId
    } as { id: number; name: string; url: string; favicon: string })
  } else {
    // 更新现有网站
    const index = recentSites.value.findIndex(s => s.id === editingSite.value?.id)
    if (index !== -1 && editingSite.value.id) {
      recentSites.value[index] = { ...editingSite.value, id: editingSite.value.id }
    }
  }

  // 立即保存到存储
  try {
    await browser.storage.local.set({
      favoriteSites: recentSites.value
    })
  } catch (error) {
    console.error('编辑网站后保存失败:', error)
  }

  showEditSites.value = false
  editingSite.value = null
  isAddingNew.value = false
}

// 取消编辑
const cancelEdit = () => {
  showEditSites.value = false
  editingSite.value = null
  isAddingNew.value = false
}

// 初始化默认设置
const initializeDefaultSettings = async () => {
  try {
    // 检查local存储
    const localResult = await browser.storage.local.get(['searchEngine', 'favoriteSites'])

    // 检查sync存储
    const syncResult = await browser.storage.sync.get(['searchEngine', 'favoriteSites'])

    // 如果两个存储都没有数据，设置默认值到local存储
    if (!localResult.searchEngine && !localResult.favoriteSites &&
      !syncResult.searchEngine && !syncResult.favoriteSites) {

      const defaultData = {
        searchEngine: 'baidu',
        favoriteSites: [
          { id: 1, name: 'GitHub', url: 'https://github.com', favicon: 'mdi:github' },
          { id: 2, name: 'TypeScript', url: 'https://www.typescriptlang.org', favicon: 'simple-icons:typescript' }
        ]
      }

      await browser.storage.local.set(defaultData)
    }
  } catch (error) {
    console.error('初始化默认设置失败:', error)
  }
}

onMounted(async () => {
  updateTime()
  setInterval(updateTime, 1000)

  // 先初始化默认设置，再加载设置
  await initializeDefaultSettings()
  await loadSettings()
})
</script>

<template>
  <div class="w-96 min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
    style="background: linear-gradient(to bottom right, #fefefe, #f8f9fa)">
    <!-- 设置面板 -->
    <div v-if="showSettings" class="fixed inset-0 bg-white dark:bg-gray-800 z-[9999] flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-bold text-gray-700 dark:text-gray-200">设置</h2>
        <button @click="showSettings = false" class="text-gray-400 hover:text-gray-600">
          <Icon icon="mdi:close" class="text-xl" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-6">
          <!-- 搜索引擎设置 -->
          <div>
            <h3 class="text-md font-medium text-gray-700 dark:text-gray-200 mb-3">搜索引擎</h3>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">默认搜索引擎</label>
              <select v-model="selectedEngine"
                class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <option v-for="engine in searchEngines" :key="engine.value" :value="engine.value">
                  {{ engine.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 常用网站管理 -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-md font-medium text-gray-700 dark:text-gray-200">常用网站</h3>
              <button @click="addNewSite"
                class="text-sm text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Icon icon="mdi:plus" class="text-lg" />
              </button>
            </div>

            <div class="space-y-2">
              <div v-for="site in recentSites" :key="site.id"
                class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <Icon :icon="site.favicon" class="text-lg text-gray-500 dark:text-gray-400 mr-3" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{{ site.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ site.url }}</div>
                </div>
                <div class="flex space-x-1 ml-2">
                  <button @click="editSite(site)" class="p-1 text-gray-400 hover:text-blue-500 rounded">
                    <Icon icon="mdi:pencil" class="text-sm" />
                  </button>
                  <button @click="deleteSite(site.id)" class="p-1 text-gray-400 hover:text-red-500 rounded">
                    <Icon icon="mdi:delete" class="text-sm" />
                  </button>
                </div>
              </div>

              <div v-if="recentSites.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
                <Icon icon="mdi:bookmark-outline" class="text-2xl mb-2" />
                <div class="text-sm">暂无常用网站</div>
              </div>
            </div>
          </div>

          <div class="flex space-x-3 pt-4">
            <button @click="saveSettings"
              class="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium">
              保存
            </button>
            <button @click="showSettings = false"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 px-4 rounded-xl transition-all duration-200 font-medium border border-gray-200">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑常用网站面板 -->
    <div v-if="showEditSites" class="fixed inset-0 bg-white dark:bg-gray-800 z-[9999] flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-bold text-gray-700 dark:text-gray-200">
          {{ isAddingNew ? '添加网站' : '编辑网站' }}
        </h2>
        <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">
          <Icon icon="mdi:close" class="text-xl" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-4" v-if="editingSite">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">网站名称</label>
            <input v-model="editingSite.name" type="text" placeholder="输入网站名称"
              class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">网站地址</label>
            <input v-model="editingSite.url" type="text" placeholder="https://example.com"
              class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">图标</label>
            <input v-model="editingSite.favicon" type="text" placeholder="mdi:web"
              class="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200" />
            <p class="text-xs text-gray-400 mt-1">使用 Material Design Icons 图标名称</p>
          </div>

          <div class="flex space-x-3 pt-4">
            <button @click="saveEditedSite"
              class="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium">
              保存
            </button>
            <button @click="cancelEdit"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 px-4 rounded-xl transition-all duration-200 font-medium border border-gray-200">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 头部区域 -->
    <div v-show="!showSettings && !showEditSites" class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h1 class="text-xl font-bold text-gray-600 dark:text-green-300">新标签页</h1>
            <span
              class="text-xs bg-gray-100 dark:bg-green-800 text-gray-500 dark:text-green-300 px-2 py-1 rounded-full">
              v{{ appVersion }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-green-400">{{ currentDate }}</p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-gray-600 dark:text-green-300">{{ currentTime }}</div>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="relative">
        <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="搜索网络..."
          class="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-green-500 text-gray-600 dark:text-gray-200 placeholder-gray-400" />
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          {{searchEngines.find(e => e.value === selectedEngine)?.name}}
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div v-show="!showSettings && !showEditSites" class="p-4">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">快捷操作</h3>
      <div class="grid grid-cols-4 gap-3">
        <button v-for="action in quickActions" :key="action.action" @click="handleQuickAction(action.action)"
          class="flex flex-col items-center p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600">
          <Icon :icon="action.icon" class="text-2xl text-gray-400 dark:text-gray-400 mb-1" />
          <span class="text-xs text-gray-600 dark:text-gray-300 text-center">{{ action.name }}</span>
        </button>
      </div>
    </div>

    <!-- 常用 -->
    <div v-show="!showSettings && !showEditSites" class="px-4">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">常用</h3>
      <div class="space-y-2">
        <button v-for="site in recentSites" :key="site.id" @click="openSite(site.url)"
          class="w-full flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600">
          <Icon :icon="site.favicon" class="text-lg text-gray-500 dark:text-gray-400 mr-3" />
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ site.name }}</span>
          <Icon icon="mdi:open-in-new" class="text-sm text-gray-400 ml-auto" />
        </button>
      </div>
    </div>

    <!-- 当前标签页 -->
    <CurrentTab :show-settings="showSettings" :show-edit-sites="showEditSites"></CurrentTab>

    <!-- 底部操作 -->
    <BottomOperation :show-settings="showSettings" :show-edit-sites="showEditSites" :app-version="appVersion"
      @open-site="openSite"></BottomOperation>
  </div>
</template>

<style scoped>
/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 深色模式滚动条 */
.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Firefox 滚动条样式 */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.dark * {
  scrollbar-color: #6b7280 #374151;
}

/* 确保设置面板的滚动条样式 */
.overflow-y-auto {
  scrollbar-gutter: stable;
}
</style>
