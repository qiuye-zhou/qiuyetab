chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'fetch-url') {
    fetch(message.url, { credentials: 'include' })
      .then(async (res) => {
        sendResponse({ ok: res.ok, status: res.status, text: await res.text() })
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.message })
      })
    return true // 保持消息通道开放以等待异步响应
  }
})
