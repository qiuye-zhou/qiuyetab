/* global chrome */
// 简单速率限制：每个 sender 每 500ms 最多一次请求
const lastFetchTime = new Map()
const RATE_LIMIT_MS = 500
const CLEANUP_INTERVAL = 10 * 60 * 1000 // 10 分钟清理一次过期记录
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

// 定期清理过期的速率限制记录，防止 Map 无限增长
setInterval(() => {
  const now = Date.now()
  for (const [key, time] of lastFetchTime) {
    if (now - time > CLEANUP_INTERVAL) {
      lastFetchTime.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

// 允许的域名白名单（favicon 和搜索建议服务）
const ALLOWED_DOMAINS = [
  'www.google.com',
  'www.baidu.com',
  'www.bing.com',
  'www.sogou.com',
  'image.baidu.com',
  'api.bing.com',
  'suggestqueries.google.com',
  'completion.baidu.com',
  'suggestion.baidu.com',
]

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'fetch-url') {
    // 速率限制检查
    const senderId = sender.tab?.id ?? sender.id ?? 'unknown'
    const now = Date.now()
    const lastTime = lastFetchTime.get(senderId) ?? 0
    if (now - lastTime < RATE_LIMIT_MS) {
      sendResponse({ ok: false, error: '请求过于频繁' })
      return false
    }
    lastFetchTime.set(senderId, now)

    let url
    try {
      url = new URL(message.url)
      // 仅允许 http/https 协议
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        sendResponse({ ok: false, error: '不允许的协议' })
        return false
      }
    } catch {
      sendResponse({ ok: false, error: '无效的 URL' })
      return false
    }

    // SSRF 防护：域名白名单检查
    // 允许所有域名获取 favicon（这是扩展核心功能），但阻止内网地址
    const hostname = url.hostname
    const isPrivateIP =
      /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|localhost|::1|fe80:)/i.test(
        hostname,
      )
    // 允许白名单域名或非内网地址
    if (isPrivateIP && !ALLOWED_DOMAINS.includes(hostname)) {
      sendResponse({ ok: false, error: '不允许访问内网地址' })
      return false
    }

    fetch(message.url, { credentials: 'omit' })
      .then(async (res) => {
        const contentLength = res.headers.get('content-length')
        if (contentLength) {
          const size = parseInt(contentLength, 10)
          if (!isNaN(size) && size > MAX_SIZE) {
            sendResponse({ ok: false, error: '响应体过大' })
            return
          }
        }
        const reader = res.body?.getReader()
        if (!reader) {
          sendResponse({
            ok: res.ok,
            status: res.status,
            text: await res.text(),
          })
          return
        }
        const chunks = []
        let received = 0
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          received += value.byteLength
          if (received > MAX_SIZE) {
            reader.cancel()
            sendResponse({ ok: false, error: '响应体过大' })
            return
          }
          chunks.push(value)
        }
        const merged = new Uint8Array(received)
        let offset = 0
        for (const chunk of chunks) {
          merged.set(chunk, offset)
          offset += chunk.byteLength
        }
        const text = new TextDecoder().decode(merged)
        sendResponse({ ok: res.ok, status: res.status, text })
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.message })
      })
    return true // 保持消息通道开放以等待异步响应
  }
})
