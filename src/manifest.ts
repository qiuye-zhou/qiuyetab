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
    permissions: ['tabs', 'storage', 'activeTab', 'sidePanel'],
    host_permissions: ['*://*/*'],
    content_security_policy: {
      extension_pages: isDev
        ? // 开发模式下，允许加载未经验证的内容脚本，以方便调试
          `script-src 'self' http://localhost:${port}; object-src 'self'`
        : "script-src 'self'; object-src 'self'",
    },
    web_accessible_resources: [
      {
        resources: ['assets/*'],
        matches: ['<all_urls>'],
      },
    ],
  }

  return manifest
}
