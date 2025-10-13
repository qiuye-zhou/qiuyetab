# QiuyeTab - 简约风浏览器新标签页插件

一个简约而功能丰富的浏览器新标签页插件，基于 Vue 3 + TypeScript + Tailwind CSS 构建，提供优雅的用户体验和强大的自定义功能。

## 🚀 快速开始

### 安装方式

#### 方式一：从源码构建（推荐）
```bash
# 克隆项目
git clone https://github.com/qiuye-zhou/qiuyetab.git
cd qiuyetab

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build
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

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。
