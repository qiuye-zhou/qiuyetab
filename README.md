# QiuyeTab

一个简约而功能丰富的浏览器新标签页插件，基于 Vue 3 + TypeScript + Tailwind CSS 构建，提供优雅的用户体验和强大的自定义功能。

## 功能特性

### 新标签页

- **实时时钟与问候语** — 显示当前时间和日期，根据时段自动切换问候语（早上好 / 下午好 / 晚上好 / 夜深了）
- **多搜索引擎** — 支持百度、Google、必应、搜狗、360 搜索，一键切换
- **搜索建议** — 基于搜索历史的自动补全，支持键盘上下键导航
- **搜索历史** — 持久化存储搜索记录，支持添加、删除和清空
- **URL 直接访问** — 识别输入内容是否为 URL，直接打开对应网站
- **常用网站快捷方式** — 可拖拽排序的网站快捷入口，支持 Iconify 图标和自动获取网站 Favicon
- **主题切换** — 浅色 / 深色 / 跟随系统三种模式
- **自定义背景** — 支持渐变背景、自定义图片 URL、本地上传图片三种背景模式
- **本地图片轮播** — 自动每 60 秒切换本地上传的背景图片
- **背景透明度调节** — 自由调整背景图片的透明度
- **搜索栏位置布局** — 自定义搜索栏的垂直位置

### 弹出窗口 (Popup)

- 紧凑的工具栏弹窗，显示时钟和版本信息
- 首次使用自动初始化默认设置

### 设置面板

滑入式右侧设置面板，包含 6 个设置页面：

- 搜索引擎选择
- 外观设置（主题、背景类型、透明度）
- 布局设置（搜索栏位置）
- 常用网站管理（添加 / 编辑 / 删除 / 排序）
- 快捷操作（显示开关）
- 标签页管理

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 开发语言 | TypeScript (strict mode) |
| 构建工具 | Vite |
| 样式框架 | Tailwind CSS v4 |
| 状态管理 | Pinia |
| 图标 | Iconify |
| 浏览器兼容 | WebExtension Polyfill (Chrome / Edge / Firefox) |
| 代码规范 | ESLint v9 + Prettier |
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

### 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm build` | 构建生产版本 |
| `pnpm lint` | ESLint 检查并自动修复 |
| `pnpm format` | Prettier 格式化代码 |
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

## 项目结构

```
qiuyetab/
├── src/
│   ├── newtab/               # 新标签页
│   │   ├── App.vue           # 根组件（背景、设置入口）
│   │   ├── MainContent.vue   # 时钟、搜索栏、快捷方式
│   │   ├── SettingsPanel.vue # 设置面板
│   │   ├── store/            # Pinia 状态管理
│   │   └── components/settings/  # 各设置子页面
│   ├── popup/                # 弹出窗口
│   │   ├── App.vue           # Popup 根组件
│   │   └── components/       # 时钟、头部、底部操作
│   ├── background/           # Service Worker（Fetch 代理）
│   ├── config/               # 搜索引擎、默认网站配置
│   ├── utils/                # 工具函数（存储、图片压缩、Favicon 获取）
│   ├── style/                # 全局样式
│   └── manifest.ts           # Manifest V3 配置
├── scripts/                  # 构建脚本
├── public/                   # 静态资源
└── extension/                # 构建输出目录
```

## 权限说明

| 权限 | 用途 |
|------|------|
| `tabs` | 访问标签页信息 |
| `storage` | 保存用户设置和搜索历史 |
| `activeTab` | 访问当前活动标签页 |
| `host_permissions: *://*/*` | 代理请求获取网站 Favicon |

## 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

本项目基于 [MIT License](LICENSE) 开源。
