import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'

import { isDev, port } from '../scripts/utils'

// 生成manifest配置文件
export async function getManifest() {
  const pkg = await fs.readJson('package.json')

  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    action: {
      default_icon: './assets/logo.png',
      default_popup: './dist/popup/index.html',
    },
    chrome_url_overrides: {
      newtab: './dist/newtab/index.html',
    },
    icons: {
      16: './assets/logo.png',
      48: './assets/logo.png',
      128: './assets/logo.png',
    },
    permissions: ['tabs', 'storage', 'activeTab'],
    // 不使用 host_permissions：activeTab 权限已足够打开新标签页
    background: {
      service_worker: './dist/background/index.js',
      type: 'module',
    },
    content_security_policy: {
      extension_pages: isDev
        ? // 开发模式下，允许加载本地开发服务器脚本以方便调试
          `script-src 'self' http://localhost:${port}; object-src 'self'`
        : "script-src 'self'; object-src 'self'",
    },
    web_accessible_resources: [
      {
        resources: ['assets/*'],
        // 仅允许扩展自身页面访问资源，防止外部网站指纹识别
        matches: ['chrome-extension://*/*'],
      },
    ],
  }

  return manifest
}
