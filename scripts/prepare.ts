// 为开发环境的入口生成占位 index.html 文件
import { isDev, r } from './utils';
import fs from 'fs-extra';
import { port, log } from './utils';
import { execSync } from 'node:child_process';
import chokidar from 'chokidar';

// 用于开发环境中 Vite 启动的 index.html 占位文件
async function stubIndexHtml() {
  const views = ['popup', 'newtab']

  for (const view of views) {
    // 确保指定路径的目录存在，如果不存在则自动创建该目录及其所有父级目录
    await fs.ensureDir(r(`extension/dist/${view}`))
    let data = await fs.readFile(r(`src/${view}/index.html`), 'utf-8')
    // 将 index.html 中的 "./main.ts" 替换为开发服务器地址
    // 这样做可以通过vite的热更新加载入口文件
    data = data.replace('"./main.ts"', `"http://localhost:${port}/${view}/main.ts"`)
    // 生成对应的html文件
    await fs.writeFile(r(`extension/dist/${view}/index.html`), data, 'utf-8')
    log('Vite', `${view}: dev server started at http://localhost:${port}/${view}/index.html`)
  }
}

function writeManifest() {
  // stdio: 'inherit' 表示子进程的输出会被直接输出到父进程的控制台
  execSync('npx esno ./scripts/manifest.ts', { stdio: 'inherit' })
}

writeManifest()

if (isDev) {
  stubIndexHtml()
  // 监听html文件变化, 重新生成index.html
  chokidar.watch(r('src/**/*.html')).on('change', () => {
    stubIndexHtml()
  })
  // 监听manifest.ts和package.json变化, 重新生成manifest.json
  chokidar.watch([r('src/manifest.ts'), r('package.json')]).on('change', () => {
    writeManifest()
  })
}
