/**
 * 从 URL 获取网站 favicon 的工具函数
 */

import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

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
 * 通过 background service worker 代理 fetch，避免 CORS 限制
 */
function proxyFetch(url: string): Promise<{ ok: boolean; text?: string }> {
  return new Promise((resolve) => {
    // 15秒超时，防止background无响应时永久挂起
    const timer = setTimeout(() => resolve({ ok: false }), 15000)

    browser.runtime.sendMessage({ type: 'fetch-url', url }).then(
      (res) => {
        clearTimeout(timer)
        resolve(res as { ok: boolean; text?: string })
      },
      (err) => {
        clearTimeout(timer)
        console.warn('[favicon] proxyFetch error:', err)
        resolve({ ok: false })
      },
    )
  })
}

/**
 * 从网站获取 favicon URL
 * 先尝试通过 background 解析页面 HTML 中的 <link rel="icon">，找不到则用 /favicon.ico
 */
export async function fetchFavicon(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    const origin = urlObj.origin

    try {
      const res = await proxyFetch(url)
      if (res.ok && res.text) {
        const faviconUrl = parseFaviconFromHtml(res.text, origin)
        if (faviconUrl) return faviconUrl
      }
    } catch {
      // 忽略
    }

    return `${origin}/favicon.ico`
  } catch {
    return ''
  }
}

/**
 * 从 HTML 中解析 <link rel="icon" href="..."> 的 favicon 地址
 * 支持单引号、双引号、无引号，以及属性顺序不固定的情况
 */
function parseFaviconFromHtml(html: string, origin: string): string {
  const patterns = [
    // rel 在 href 前
    /<link[^>]*rel\s*=\s*["'](?:shortcut )?icon["'][^>]*href\s*=\s*["']([^"']+)["']/i,
    // href 在 rel 前
    /<link[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["'](?:shortcut )?icon["']/i,
    // apple-touch-icon
    /<link[^>]*rel\s*=\s*["']apple-touch-icon["'][^>]*href\s*=\s*["']([^"']+)["']/i,
    /<link[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']apple-touch-icon["']/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const href = match[1].trim()
      if (!href) continue
      // data: URL 直接返回
      if (href.startsWith('data:')) return href
      if (href.startsWith('http')) return href
      if (href.startsWith('//')) return `https:${href}`
      if (href.startsWith('/')) return `${origin}${href}`
      // 相对路径：避免双斜杠
      return `${origin}/${href.replace(/^\//, '')}`
    }
  }
  return ''
}
