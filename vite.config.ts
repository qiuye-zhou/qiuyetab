import { defineConfig } from 'vite'
import { dirname, relative } from 'node:path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'

import { port } from './script/utils'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [
      vue(),
      tailwindcss(),
      AutoImport({
      imports: [
        'vue',
        {
          'webextension-polyfill': [['=', 'browser']],
        },
      ],
    }),
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(/"\/assets\//g, `"${relative(dirname(path), '/assets')}/`)
      },
    },
  ],
  optimizeDeps: {
    include: [
      'vue',
      'webextension-polyfill',
    ],
  },
  base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    port,
    hmr: {
      host: 'localhost',
    },
    origin: `http://localhost:${port}`,
    proxy: {
      '/api': {
        target: 'http://wallpaper.xyu.fan/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}))
