<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import webExtensionPolyfill from 'webextension-polyfill'
import { useGlobalStore } from '../store/modules/global'
import { storeToRefs } from 'pinia'

const global = useGlobalStore()
const { showSettings, showEditSites } = storeToRefs(global)

const emit = defineEmits(['update-settings'])

// 使用 browser API
const browser = webExtensionPolyfill

// 设置相关
const searchEngines = ref([
  { name: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd={query}' },
  { name: 'Google', value: 'google', url: 'https://www.google.com/search?q={query}' },
  { name: '必应', value: 'bing', url: 'https://www.bing.com/search?q={query}' },
  { name: '搜狗', value: 'sogou', url: 'https://www.sogou.com/web?query={query}' },
  { name: '360搜索', value: '360', url: 'https://www.so.com/s?q={query}' }
])
const selectedEngine = ref('baidu')

// 常用网站编辑相关
const editingSite = ref<{ id?: number; name: string; url: string; favicon: string } | null>(null)
const isAddingNew = ref(false)

const recentSites = ref([
  { id: 1, name: 'GitHub', url: 'https://github.com', favicon: 'mdi:github' },
  { id: 2, name: 'TypeScript', url: 'https://www.typescriptlang.org', favicon: 'simple-icons:typescript' }
])

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
      }
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    await browser.storage.local.set({
      searchEngine: selectedEngine.value,
      favoriteSites: recentSites.value
    })

    showSettings.value = false
    console.log('设置已保存')
    emit('update-settings')
  } catch (error) {
    console.error('保存设置失败:', error)
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

// 初始化时加载设置
loadSettings()
</script>

<template>
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
</template> 