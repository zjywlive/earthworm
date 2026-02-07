# Earthworm 本地版

基于 [cuixueshe/earthworm](https://github.com/cuixueshe/earthworm) 重构的纯本地运行版本，去除了所有后端服务依赖（PostgreSQL、Redis、Logto 认证），仅保留核心英语学习功能。

> **最后更新**: 2026-02-08  
> **原始仓库**: https://github.com/cuixueshe/earthworm  
> **Fork 仓库**: https://github.com/zjywlive/earthworm

---

## 功能

- 课程包列表展示
- 课程选择与导航
- 中译英模式：看中文输入英文
- 听写模式：听英文输入英文
- 已掌握元素标记（自动跳过）
- 学习进度保存与恢复（基于 localStorage）
- 上一句 / 下一句导航
- 游戏暂停、设置、学习计时
- 完成课程自动进入下一课

## 快速开始

### 环境要求

- Node.js >= 20.12.2
- pnpm（`npm install -g pnpm`）

### 一键启动（Windows）

双击项目根目录的 `start.bat` 即可，脚本会自动检测环境、安装依赖并启动。

### 手动启动

```bash
cd earthworm
pnpm install
pnpm dev
```

浏览器访问 `http://localhost:3000` 即可开始学习。

---

## 架构说明

```
数据流向：

JSON 文件 (data/)  -->  API 适配层 (api/)  -->  Pinia Store (store/)  -->  Vue 组件
                             |
                    localStorage (进度/掌握/计时)
```

### 目录结构

```
earthworm/
├── apps/client/               # Nuxt 3 前端（唯一运行入口）
│   ├── data/                  # 课程数据
│   │   ├── course-packs.json  # 课程包元数据（1 个包，55 课）
│   │   └── courses/           # 55 个课程 JSON（01.json ~ 55.json）
│   ├── api/                   # 本地数据适配层（保持原函数签名）
│   ├── services/auth.ts       # 认证 stub（始终返回 true）
│   ├── store/                 # Pinia 状态管理
│   ├── composables/           # 业务逻辑组合函数
│   ├── components/            # Vue 组件
│   ├── pages/                 # 页面路由
│   └── nuxt.config.ts         # Nuxt 配置
├── start.bat                  # Windows 一键启动脚本
├── README-LOCAL.md            # 本文档
└── package.json               # 根项目配置
```

---

## 数据存储

所有用户数据通过 `localStorage` 持久化，使用以下 key：

| Key | 用途 | 格式 |
|-----|------|------|
| `earthworm-progress` | 课程学习进度 | `{ [coursePackId]: { courseId, statementIndex } }` |
| `earthworm-course-history` | 课程完成历史 | `{ [coursePackId:courseId]: completionCount }` |
| `earthworm-mastered-elements` | 已掌握元素 | `MasteredElement[]` |
| `earthworm-learning-time` | 学习时长记录 | `{ date, duration }[]` |
| `earthworm-recent-packs` | 最近学习课程包 | `{ coursePackId, courseId, updatedAt }[]` |
| `learningTime_{userId}_{date}` | 当日学习秒数（组件内部） | `number` |

## 课程数据格式

每个课程 JSON 文件（如 `01.json`）是一个 statement 数组：

```json
[
  {
    "chinese": "我喜欢这个食物",
    "english": "I like the food",
    "soundmark": "/aɪ laɪk ðə fuːd/"
  }
]
```

`course-packs.json` 包含课程包元数据和课程列表索引。

---

## 重构变更记录

### [2026-02-08] 初始重构（9 阶段）

#### 阶段 1：课程数据迁移
- 从 `packages/xingrong-courses/data/courses/` 复制 55 个课程 JSON 到 `apps/client/data/courses/`
- 生成 `apps/client/data/course-packs.json`（包含课程包元数据和 55 课索引）

#### 阶段 2：API 层重写
- 重写 7 个 API 文件（course、course-pack、course-history、user-course-progress、mastered-elements、tool、user-learning-activity），内部改为读取本地 JSON 和操作 localStorage
- 保持所有函数签名不变，使 Store 层改动最小化
- 删除 `api/http.ts`（HTTP 客户端）、`api/rank.ts`（排行榜）、`api/user.ts`（用户 API）
- `fetchDailySentence()` 改为返回内置的 12 条中英名句（按日期轮换）

#### 阶段 3：认证与插件
- `services/auth.ts` 替换为 stub，`isAuthenticated()` 始终返回 `true`
- 删除 `plugins/logto.ts`、`plugins/http.ts`
- 删除 `middleware/auth.ts`

#### 阶段 4：Store 调整
- 重写 `store/user.ts`，使用固定的本地用户（无需登录）
- 重写 `types/models/user.ts`，移除 `@logto/vue` 依赖
- 删除 `types/models/rank.ts`
- 其余 Store（game、course、coursePack、statement、masteredElements）无需改动

#### 阶段 5：Composable 确认
- `learningTimeTracker.ts`：API 已本地化，无需修改
- `summary.ts`：`fetchDailySentence()` 已本地化，无需修改
- `useMastered.ts`：`isAuthenticated()` 始终返回 `true`，无需修改

#### 阶段 6：页面与组件清理
- 删除页面：`callback.vue`、`privacy-policy.vue`、`terms.vue`、`User/Setting.vue`
- 删除组件：`Landing/`（9 个文件）、`icons/`、`UserMenu.vue`、`FoundingMemberNotice.vue`、`CustomShortcutDialog.vue`
- 修改 `pages/index.vue`：始终显示 Home 组件（移除 Landing 分支）
- 修改 `pages/course-pack/index.vue`：所有课程包均可访问（移除付费检查）
- 简化 `layouts/default.vue`：移除 UserMenu 和 FoundingMemberNotice
- 简化 `components/Navbar.vue`：移除登录按钮和 Landing 导航

#### 阶段 7：配置与依赖清理
- 简化 `nuxt.config.ts`：移除 Logto/HTTP 插件、runtimeConfig、Clarity 分析、多余模块
- 精简 `apps/client/package.json`：移除 `@logto/vue`、`ofetch`、`satori`、测试相关依赖等
- 简化根 `package.json`：仅保留 dev/build/preview 命令
- 更新 `pnpm-workspace.yaml`：仅包含 `apps/client`

#### 阶段 8：线上资产清理
- 删除 `apps/api/`（整个后端应用）
- 删除 `packages/`（db、schema、game-data-sdk、xingrong-courses 代码部分）
- 删除 `docker-compose.yml`、`logto_db_init_data.zip`
- 删除 `.github/`（CI/CD）、`scripts/`（发布脚本）
- 删除 `.lintstagedrc.mjs`、`.simple-git-hooks.js`
- 删除 `apps/client/.env.example`、`cypress/`

#### 阶段 9：生成文档
- 创建 `README-LOCAL.md`

---

### [2026-02-08] Bug 修复 #1：NuxtImg 500 错误

**现象**: 点击首页"先学习一课"后，页面显示 500 错误：`<NuxtImg> is provided by @nuxt/image`

**原因**: `CoursePackCard.vue` 使用了 `<NuxtImg>` 组件，但阶段 7 中从 `nuxt.config.ts` 移除了 `@nuxt/image` 模块

**修复**:
- 将 `components/courses/CoursePackCard.vue` 中的 `<NuxtImg>` 替换为原生 `<img>`
- 当 `cover` 为空时显示渐变色占位（首字母）

---

### [2026-02-08] Bug 修复 #2：satori 依赖缺失

**现象**: 进入课程学习页面后，Vite 报错：`Failed to resolve import "satori" from "composables/main/shareImage/share.ts"`

**原因**: 分享打卡图功能依赖 `satori` 库生成 SVG 图片，但阶段 7 中已从 `package.json` 移除该依赖。`Game.vue` 仍然引用了 `<MainShare />` 组件

**修复**:
- 从 `components/main/Game.vue` 移除 `<MainShare />` 组件引用
- 从 `components/main/Summary.vue` 移除"生成打卡图"按钮和 `useShareModal` 引用
- 删除 `components/main/Share.vue` 组件文件
- 删除 `composables/main/shareImage/` 整个目录（share.ts、helper.ts、imageTemplates、tests）

---

### [2026-02-08] Bug 修复 #3：daisyui 缺失

**现象**: `nuxt prepare` 阶段警告 `Cannot find module 'daisyui'`，tailwind.config.js 加载失败

**原因**: `tailwind.config.js` 中 `plugins` 引用了 `require("daisyui")`，但阶段 7 清理依赖时误删了 `daisyui`。项目中多个组件（btn、tabs、card 等）使用了 daisyUI 类名

**修复**:
- 将 `daisyui@^4.6.0` 加回 `apps/client/package.json` 的 devDependencies

---

### [2026-02-08] 新增：排行榜功能移除

**需求**: 本地版不需要排行榜功能

**变更**:
- 从 `components/main/Tool.vue` 移除排行榜按钮和 `useRanking` 引用
- 删除 `composables/rank/` 目录（rankingList.ts、tests）
- 删除 `components/rank/` 目录（RankingBoard.vue 等）

---

### [2026-02-08] 新增：一键启动脚本

**需求**: 用户希望有一个双击即可启动的东西

**变更**:
- 在项目根目录创建 `start.bat`
- 自动检测 Node.js、pnpm 环境
- 首次运行自动安装依赖
- 启动开发服务器

---

## 与原版的区别

| 特性 | 原版 | 本地版 |
|------|------|--------|
| 后端服务 | NestJS + PostgreSQL + Redis | 无（纯前端） |
| 认证 | Logto OAuth/OIDC | 无（始终登录） |
| 数据存储 | PostgreSQL 数据库 | localStorage + JSON 文件 |
| 排行榜 | 支持 | 移除 |
| 分享打卡图 | 支持（satori 生成） | 移除 |
| 用户系统 | 完整注册/登录/设置 | 固定本地用户 |
| 会员系统 | 创始会员/付费课程 | 移除（全部免费） |
| 部署方式 | Docker Compose | `start.bat` 或 `pnpm dev` |

---

## 待办 / 已知问题

> 在此记录后续发现的问题和新需求

（暂无）

---

## 许可证

沿用原项目 [LICENSE](./LICENSE)。
