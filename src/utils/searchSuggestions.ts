/**
 * 搜索推荐预测工具
 */

// 热门搜索词（模拟数据，实际应用中可以从API获取）
const hotSearchKeywords: string[] = []

// 搜索历史记录（存储在浏览器本地存储中）
const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY_COUNT = 10

export interface SearchSuggestion {
  text: string
  type: 'history' | 'hot'
}

/**
 * 获取搜索推荐词
 * @param query 用户输入的查询词
 * @returns 推荐词列表（包含类型信息）
 */
export const getSearchSuggestions = async (
  query: string,
): Promise<SearchSuggestion[]> => {
  if (!query.trim()) {
    // 如果没有输入，返回历史记录和热门搜索
    const history = await getSearchHistory()
    const historyItems: SearchSuggestion[] = history.map((item) => ({
      text: item,
      type: 'history',
    }))
    const hotItems: SearchSuggestion[] = hotSearchKeywords.map((item) => ({
      text: item,
      type: 'hot',
    }))
    return [...historyItems, ...hotItems].slice(0, 10)
  }

  const lowerQuery = query.toLowerCase()

  // 从热门搜索词中筛选匹配的
  const matchedHot = hotSearchKeywords
    .filter((keyword) => keyword.toLowerCase().includes(lowerQuery))
    .map((item) => ({ text: item, type: 'hot' as const }))

  // 从历史记录中筛选匹配的
  const history = await getSearchHistory()
  const matchedHistory = history
    .filter((keyword) => keyword.toLowerCase().includes(lowerQuery))
    .map((item) => ({ text: item, type: 'history' as const }))

  // 合并结果，去重，保持顺序
  const combined = [...matchedHistory, ...matchedHot]
  const unique: SearchSuggestion[] = []
  const seen = new Set<string>()
  for (const item of combined) {
    if (!seen.has(item.text)) {
      seen.add(item.text)
      unique.push(item)
    }
  }

  return unique.slice(0, 8)
}

/**
 * 获取搜索历史记录
 * @returns 搜索历史列表
 */
export const getSearchHistory = async (): Promise<string[]> => {
  try {
    // eslint-disable-next-line no-undef
    const result = await browser.storage.local.get([SEARCH_HISTORY_KEY])
    return (result[SEARCH_HISTORY_KEY] as string[]) || []
  } catch (error) {
    console.error('获取搜索历史失败:', error)
    return []
  }
}

/**
 * 添加搜索历史记录
 * @param query 搜索词
 */
export const addSearchHistory = async (query: string): Promise<void> => {
  try {
    // 过滤空字符串和空白字符
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return
    }

    const history = await getSearchHistory()
    // 移除重复项
    const filtered = history.filter((item) => item !== trimmedQuery)
    // 添加到开头
    filtered.unshift(trimmedQuery)
    // 限制数量
    const limited = filtered.slice(0, MAX_HISTORY_COUNT)
    // eslint-disable-next-line no-undef
    await browser.storage.local.set({ [SEARCH_HISTORY_KEY]: limited })
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

/**
 * 删除单条搜索历史记录
 * @param query 要删除的搜索词
 */
export const removeSearchHistory = async (query: string): Promise<void> => {
  try {
    const history = await getSearchHistory()
    const filtered = history.filter((item) => item !== query)
    // eslint-disable-next-line no-undef
    await browser.storage.local.set({ [SEARCH_HISTORY_KEY]: filtered })
  } catch (error) {
    console.error('删除搜索历史失败:', error)
  }
}

/**
 * 清除搜索历史记录
 */
export const clearSearchHistory = async (): Promise<void> => {
  try {
    // eslint-disable-next-line no-undef
    await browser.storage.local.remove(SEARCH_HISTORY_KEY)
  } catch (error) {
    console.error('清除搜索历史失败:', error)
  }
}
