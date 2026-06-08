# QiuyeTab

一个简约而功能丰富的浏览器新标签页扩展

基于 Vue 3 + TypeScript + Tailwind CSS 构建，提供优雅的用户体验和强大的自定义功能。

## 功能特性

### 新标签页

- **实时时钟与问候语** — 显示当前时间和日期，根据时段自动切换问候语（凌晨好 / 早上好 / 下午好 / 晚上好 / 夜深了），支持开关控制
- **多搜索引擎** — 支持百度、Google、必应、搜狗、360 搜索，一键切换
- **搜索建议** — 基于搜索历史的自动补全，200ms 防抖，支持键盘上下键导航（↑↓ 选择 / Enter 确认 / Esc 关闭）
- **搜索历史** — 持久化存储最近 10 条搜索记录，使用 Promise 链式锁防止并发写入丢失
- **URL 直接访问** — 智能识别输入内容是否为 URL（支持协议头和常见顶级域名），直接打开对应网站
- **常用网站快捷方式** — 可拖拽排序的网站快捷入口，支持 Iconify 图标和自动获取网站 Favicon
- **主题切换** — 浅色 / 深色 / 跟随系统三种模式，通过 `matchMedia` 实时监听系统主题变化
- **自定义背景** — 三种背景模式：
  - 默认渐变背景（带装饰性径向模糊）
  - 自定义图片 URL（仅允许 http/https，内置 XSS 防护）
  - 本地上传图片（自动压缩至 1920×1080、80% JPEG 质量）
- **本地图片轮播** — 自动每 60 秒切换本地上传的背景图片
- **背景透明度调节** — 自由调整背景图片的透明度（0% ~ 100%）
- **搜索栏位置布局** — 自定义搜索栏的垂直位置（0% ~ 100%）

### 待办事项

- **待办管理** — 支持添加、编辑、删除待办事项，可设置截止日期
- **智能筛选** — 按全部 / 进行中 / 已完成 筛选，按截止日期排序，自动检测逾期
- **即将到来提醒** — 左上角卡片展示未来 7 天内未完成的待办，颜色标记区分（今天=红色、明天=橙色）
- **Markdown 导入/导出** — 支持 `[x]` / `[ ]` 格式的 Markdown 文件导入导出（单次上限 1000 行）
- **跨标签页同步** — 监听 `chrome.storage.onChanged` 事件，多标签页实时同步

### 弹出窗口 (Popup)

- 紧凑的工具栏弹窗，显示实时时钟和版本信息
- 首次使用自动初始化默认设置（搜索引擎 + 常用网站）
- 展示构建日期和作者信息

### 设置面板

滑入式右侧设置面板，包含 6 个设置页面（使用 `defineAsyncComponent` 懒加载）：

| 页面 | 功能 |
|------|------|
| 搜索引擎 | 在 5 个搜索引擎之间单选切换 |
| 外观设置 | 主题选择、背景类型切换、本地背景管理（添加/删除/开关）、存储用量显示、透明度滑块 |
| 布局设置 | 搜索栏垂直位置滑块 |
| 常用网站 | 网站快捷方式的增删改查、拖拽排序、自动获取 Favicon |
| 快捷操作 | 时间显示开关 |
| 标签页管理 | 列出当前窗口所有标签页，支持切换和关闭（监听 `tabs.onRemoved` 和 `tabs.onUpdated`） |

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 开发语言 | TypeScript (strict mode) |
| 构建工具 | Vite 7 |
| 样式框架 | Tailwind CSS v4（`@tailwindcss/vite` 插件） |
| 状态管理 | Pinia 3 |
| 图标方案 | Iconify (`@iconify/vue`) |
| 浏览器兼容 | WebExtension Polyfill (Chrome / Edge / Firefox) |
| 代码规范 | ESLint v9 + Prettier（自定义 `eslint-config-qiuye`） |
| Git Hooks | Husky + lint-staged |
| 自动导入 | unplugin-auto-import（Vue API + `browser` 全局导入） |
| 包管理器 | pnpm |

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装与构建

```bash
# 克隆项目
git clone https://github.com/qiuye-zhou/qiuyetab.git
cd qiuyetab

# 安装依赖
pnpm install

# 构建生产版本
pnpm build
```

### 开发模式

开发服务器默认运行在 **端口 2233**（可通过 `PORT` 环境变量修改）：

```bash
# 构建脚本会自动生成指向 Vite 开发服务器的 HTML 模板
# 并监听 manifest、HTML、静态资源、background 脚本的变更
pnpm build
```

### 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm build` | 构建生产版本（清理 → Vite 构建 → 生成 manifest + 复制资源） |
| `pnpm lint` | ESLint 检查并自动修复 |
| `pnpm format` | Prettier 格式化代码 |
| `pnpm format:check` | Prettier 格式检查（不修改文件） |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm preview` | 预览构建产物 |

### 浏览器安装

#### Chrome / Edge

1. 构建完成后，打开浏览器扩展管理页面 (`chrome://extensions/`)
2. 开启 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择项目根目录下的 `extension` 文件夹

#### Firefox

1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击 **临时加载附加组件**
3. 选择 `extension` 文件夹中的 `manifest.json`


## 权限说明

| 权限 | 用途 |
|------|------|
| `tabs` | 标签页管理（列出、切换、关闭当前窗口的标签页） |
| `storage` | 持久化用户设置、搜索历史、待办事项和本地背景图片 |
| `activeTab` | 访问当前活动标签页信息 |
| `host_permissions: *://*/*` | 代理请求获取网站 Favicon 和页面内容 |


## 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 开发规范

- 使用 `pnpm format` 格式化代码
- 使用 `pnpm lint` 检查代码规范
- 使用 `pnpm typecheck` 确保类型安全
- Git 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

## 许可证

本项目基于 [MIT License](LICENSE) 开源。
