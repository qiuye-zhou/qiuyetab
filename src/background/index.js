// 简单速率限制：每个 sender 每 500ms 最多一次请求
const lastFetchTime = new Map()
const RATE_LIMIT_MS = 500

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

    try {
      const url = new URL(message.url)
      // 仅允许 http/https 协议
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        sendResponse({ ok: false, error: '不允许的协议' })
        return false
      }
    } catch {
      sendResponse({ ok: false, error: '无效的 URL' })
      return false
    }

    fetch(message.url, { credentials: 'omit' })
      .then(async (res) => {
        sendResponse({ ok: res.ok, status: res.status, text: await res.text() })
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.message })
      })
    return true // 保持消息通道开放以等待异步响应
  }
})
