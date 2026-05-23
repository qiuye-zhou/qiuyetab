/**
 * 从 URL 获取网站 favicon 的工具函数
 */

/**
 * 判断 favicon 值是否为 URL（而非 Iconify 图标名）
 */
export function isFaviconUrl(favicon: string): boolean {
  return (
    favicon.startsWith('http://') ||
    favicon.startsWith('https://') ||
    favicon.startsWith('data:')
  )
}

/**
 * 从网站获取 favicon URL
 * 先尝试解析页面 HTML 中的 <link rel="icon">，找不到则用 /favicon.ico
 */
export async function fetchFavicon(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    const origin = urlObj.origin

    // 先尝试获取页面 HTML 解析 favicon 链接
    try {
      const response = await fetch(url, { credentials: 'include' })
      if (response.ok) {
        const html = await response.text()
        const faviconUrl = parseFaviconFromHtml(html, origin)
        if (faviconUrl) return faviconUrl
      }
    } catch {
      // 跨域失败，忽略
    }

    // 回退到 /favicon.ico
    return `${origin}/favicon.ico`
  } catch {
    return ''
  }
}

/**
 * 从 HTML 中解析 <link rel="icon" href="..."> 的 favicon 地址
 */
function parseFaviconFromHtml(html: string, origin: string): string {
  const patterns = [
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const href = match[1]
      if (href.startsWith('http')) return href
      if (href.startsWith('//')) return `https:${href}`
      if (href.startsWith('/')) return `${origin}${href}`
      return `${origin}/${href}`
    }
  }
  return ''
}
