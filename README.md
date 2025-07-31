# QiuyeTab - 简约风浏览器新标签页插件

一个简约而功能丰富的浏览器新标签页插件，基于 Vue 3 + TypeScript + Tailwind CSS 构建，提供优雅的用户体验和强大的自定义功能。

## ✨ 功能特性

### 🎯 核心功能
- **智能搜索**: 支持多搜索引擎切换（百度、Google、必应、搜狗、360搜索）
- **实时时钟**: 显示当前时间和日期，问候语
- **快捷操作**: 快速访问历史记录、下载、书签、设置等
- **常用网站**: 可自定义的快速访问网站列表
- **标签页管理**: 查看和管理当前打开的标签页

### 🎨 界面设计
- **简约风格**: 清爽的界面设计，减少视觉干扰
- **响应式布局**: 适配不同屏幕尺寸
- **动画效果**: 流畅的交互动画

### ⚙️ 技术特性
- **现代化技术栈**: Vue 3 + TypeScript + Vite
- **跨浏览器兼容**: 支持 Chrome、Firefox、Edge 等主流浏览器
- **本地存储**: 使用浏览器存储API保存用户设置
- **模块化架构**: 清晰的代码结构，易于维护和扩展

## 🚀 快速开始

### 安装方式

#### 方式一：从源码构建（推荐）
```bash
# 克隆项目
git clone https://github.com/your-username/qiuyetab.git
cd qiuyetab

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 打包扩展
pnpm pack
```

### 浏览器安装指南

#### Chrome/Edge
1. 打开浏览器扩展管理页面 (`chrome://extensions/`)
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `extension` 文件夹

#### Firefox
1. 打开浏览器扩展管理页面 (`about:addons`)
2. 点击齿轮图标，选择"从文件安装附加组件"
3. 选择项目的 `extension.xpi` 文件

## 🛠️ 开发指南

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 项目结构
```
qiuyetab/
├── src/
│   ├── newtab/          # 新标签页组件
│   ├── popup/           # 弹出窗口组件
│   ├── manifest.ts      # 扩展清单配置
│   └── style/           # 全局样式
├── scripts/             # 构建脚本
├── extension/           # 构建输出目录
└── public/              # 静态资源
```

### 开发命令
```bash
# 开发模式（热重载）
pnpm dev

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 构建生产版本
pnpm build

# 打包扩展文件
pnpm pack

# 预览构建结果
pnpm preview
```

### 技术栈
- **前端框架**: Vue 3 (Composition API)
- **开发语言**: TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **UI组件**: Reka UI
- **浏览器API**: WebExtension Polyfill

## 📦 构建输出

构建完成后，会在 `extension/` 目录生成以下文件：
- `manifest.json` - 扩展清单文件
- `dist/` - 构建后的资源文件
- `assets/` - 静态资源文件

### 权限说明
- `tabs`: 访问标签页信息
- `storage`: 保存用户设置
- `activeTab`: 访问当前活动标签页

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 提交前运行 `pnpm lint` 和 `pnpm typecheck`

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

