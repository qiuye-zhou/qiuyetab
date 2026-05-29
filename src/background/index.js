chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'fetch-url') {
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
