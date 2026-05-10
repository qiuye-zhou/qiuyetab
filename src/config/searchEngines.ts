// 搜索引擎配置
export interface SearchEngine {
  name: string
  value: string
  url: string
}

export const searchEngines: SearchEngine[] = [
  { name: '百度', value: 'baidu', url: 'https://www.baidu.com/s?wd={query}' },
  {
    name: 'Google',
    value: 'google',
    url: 'https://www.google.com/search?q={query}',
  },
  { name: '必应', value: 'bing', url: 'https://www.bing.com/search?q={query}' },
  {
    name: '搜狗',
    value: 'sogou',
    url: 'https://www.sogou.com/web?query={query}',
  },
  { name: '360搜索', value: '360', url: 'https://www.so.com/s?q={query}' },
]

// 获取搜索引擎URL
export const getSearchUrl = (engineValue: string, query: string): string => {
  const engine = searchEngines.find((e) => e.value === engineValue)
  if (!engine) return `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`
  return engine.url.replace('{query}', encodeURIComponent(query))
}
