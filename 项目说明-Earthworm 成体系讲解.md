# Earthworm 项目成体系讲解

本文档从「项目是什么」「用了什么」「最终效果」「如何实现」四个维度，对 Earthworm 做结构清晰的说明。

---

## 一、项目是什么？最终呈现什么效果？

### 1.1 产品定位

**Earthworm（句乐部）** 是一个**英语学习 Web 应用**，核心方法叫做 **「用连词/成分一步步造句」**：

- 不是背单词，而是从**词 → 短语 → 句子**一步步拼出英文。
- 每个学习单元是一条 **statement**（陈述句成分），包含：中文、英文、音标。
- 课程内容就是大量这样的 statement，按顺序组成「一课」，多课组成「课程包」。

所以「连词造句」体现在：先学 "I"、"like"、"I like"、"the food"，再拼成 "I like the food"，再扩展 "don't like"、"I don't like the food" 等，通过**成分递进**学会整句。

### 1.2 最终用户看到的效果

1. **首页**  
   - 未登录：落地页（Landing），引导注册/登录。  
   - 已登录：Home，进入课程包列表。

2. **课程包列表**  
   - 多个课程包（如不同难度/主题），每个有标题、描述、封面、是否免费。  
   - 点击某个课程包 → 进入该包下的**课程列表**。

3. **课程列表**  
   - 一个课程包里有多个「课」（course），每课包含多条 statement。  
   - 点击某一课 → 进入**学习/做题页**（game 页）。

4. **学习页（核心体验）**  
   - **两种模式**（可切换）：  
     - **中译英**：给出中文（如「我喜欢这个食物」），用户在输入框里按词/空格逐词输入英文（如 `I like the food`），可播放发音、可「显示/隐藏答案」。  
     - **听写**：听英文发音，输入英文（听写模式）。  
   - 每条 statement 可标记为「已掌握」，已掌握的会从当前课的练习中隐藏，进度会保存。  
   - 支持上一句/下一句、暂停、设置、学习计时、分享等。  
   - 学完一课可进入下一课，进度（当前课、当前 statement 下标）会同步到服务器。

5. **其他**  
   - 排行榜（周/月/年完成课程数）。  
   - 个人设置、已掌握元素、隐私政策/条款等。

整体效果就是：**选课程包 → 选课 → 在「中译英/听写」下按句练习、保存进度、可排行**。

---

## 二、技术架构总览：用到了哪些东西？

### 2.1 仓库结构（Monorepo）

项目是 **pnpm workspace** 的 monorepo，根目录 `package.json` 里通过 `pnpm-workspace.yaml` 管理：

- **apps/api**：后端服务（NestJS）。  
- **apps/client**：前端应用（Nuxt 3 + Vue 3）。  
- **packages/**：共享包，被 api 和 client 或构建脚本使用。

```
earthworm/
├── apps/
│   ├── api/          # 后端
│   └── client/       # 前端
├── packages/
│   ├── schema/       # 数据库表结构（Drizzle ORM）
│   ├── db/           # 数据库连接、迁移
│   ├── game-data-sdk/# 课程包/会员等业务数据逻辑（可被 api 用）
│   ├── xingrong-courses/  # 课程原始数据（JSON + 上传脚本）
│   └── docs/         # 文档站（VitePress）
├── docker-compose.yml
└── package.json
```

### 2.2 前端（apps/client）用到的技术

| 技术 | 作用 |
|------|------|
| **Nuxt 3** | Vue 3 的全栈框架，负责路由、SSR/SPA、构建。 |
| **Vue 3** | 页面与组件。 |
| **Pinia** | 全局状态（课程、课程包、游戏、进度、用户等）。 |
| **Vue Router** | 路由（由 Nuxt 基于 `pages/` 自动生成）。 |
| **@logto/vue** | 登录/登出、获取用户信息，与 Logto 对接。 |
| **TailwindCSS + DaisyUI** | 样式与 UI 组件。 |
| **Vite** | 开发与生产构建（Nuxt 内置）。 |
| **Vitest / Cypress** | 单元测试与 E2E。 |

前端负责：页面、交互、调用后端 API、和 Logto 做 OAuth 登录。

### 2.3 后端（apps/api）用到的技术

| 技术 | 作用 |
|------|------|
| **NestJS** | Node 后端框架，模块化、依赖注入、路由、中间件。 |
| **Drizzle ORM** | 使用 `@earthworm/schema` 定义的表，访问 PostgreSQL。 |
| **PostgreSQL** | 主数据库：课程、用户进度、学习记录、排行榜相关等。 |
| **Redis（ioredis）** | 排行榜计数（按周/月/年统计完成课程数）。 |
| **Logto** | 第三方认证：校验 JWT、拉用户信息，不自己存密码。 |
| **class-validator / class-transformer** | 请求体校验与 DTO 转换。 |
| **Jest** | 单测与 E2E 测试。 |

后端负责：业务逻辑、持久化、鉴权（依赖 Logto 的 token）、排行榜等。

### 2.4 共享包与数据（packages）

| 包/目录 | 作用 |
|--------|------|
| **schema** | 用 Drizzle 定义所有表（course、statement、userCourseProgress、courseHistory、rank 相关、masteredElements、membership、coursePack 等），供 api 和 db 使用。 |
| **db** | 连接 PostgreSQL、执行 Drizzle 迁移（`pnpm db:init`）。 |
| **game-data-sdk** | 课程包、会员等逻辑，可被 api 复用。 |
| **xingrong-courses** | 课程原始数据：`data/courses/*.json` 每课一个 JSON，内容是 statement 数组（chinese, english, soundmark）；`pnpm db:upload` 会把这些数据写入数据库。 |

### 2.5 基础设施（与部署相关）

| 组件 | 作用 |
|------|------|
| **Docker Compose** | 一键起 Postgres、Redis、Logto 及其 Postgres；本地开发常用。 |
| **Logto** | 独立认证服务（Docker 里或 Logto Cloud），负责登录、发 JWT；前端用 @logto/vue 跳转登录，后端用 JWT 认用户。 |

无 Docker 时也可本机装 Postgres + Redis，再用 Logto Cloud，见项目内 `DEPLOY-WITHOUT-DOCKER.md`。

---

## 三、核心数据与业务流程

### 3.1 核心数据模型（简化）

- **course_pack**：课程包，有标题、描述、封面、是否免费等。  
- **course**：一课，属于某个 course_pack，有 order、标题、描述、视频链接等。  
- **statement**：一条学习内容，属于某门 course，有 order、chinese、english、soundmark。  
- **user_course_progress**：用户在某课程包下的进度（当前学到哪一课、哪一条 statement 的 index）。  
- **course_history**：用户在某课上的完成次数（completion_count）。  
- **mastered_elements**：用户标记「已掌握」的 statement（存为 JSON 等）。  
- **rank**：用 Redis 的 Sorted Set 按周/月/年存「完成课程数」，用于排行榜。

### 3.2 用户学习流程（如何实现「最终效果」）

1. **进入课程包列表**  
   - 前端调 API 拉课程包列表 → 来自 `course_pack` 等。  
   - 展示卡片，点击进入某课程包。

2. **进入某课的 game 页**  
   - 路由：`/game/[coursePackId]/[id]`，`id` 为 courseId。  
   - 前端请求「当前课 + 当前用户在该课程包下的进度」（`statementIndex`）。  
   - API：`CourseService.findWithUserProgress(coursePackId, courseId, userId)`：查 course + statements，再查 `user_course_progress` 得到当前 statement 下标。  
   - 若该课已全部掌握，可提示并跳回课程列表。

3. **做题（中译英 / 听写）**  
   - 前端根据 `statementIndex` 取当前 `currentStatement`（中文、英文、音标）。  
   - **中译英**：展示中文，用户在一个「按词分割」的输入框里输入英文（每词一个空格），前端校验与 `currentStatement.english` 是否一致；可播放发音、显示/隐藏答案、标记掌握。  
   - **听写**：播放英文，用户输入整句，同样校验。  
   - 标记「已掌握」会写入后端（mastered_elements），并影响本课内「下一句/上一句」的跳转（跳过已掌握）。

4. **进度保存**  
   - 切换 statement（上一句/下一句）或定时/失焦时，前端会调「更新进度」接口，把当前 courseId + statementIndex 写入 `user_course_progress`。  
   - 这样下次再进同一课程包，会从上次位置继续。

5. **完成一课**  
   - 用户学完当前课最后一条（或达到「完成」条件），前端调「完成课程」接口。  
   - 后端：  
     - 更新/写入 `course_history`（完成次数）；  
     - 更新 `user_course_progress` 到下一课的第一条 statement；  
     - 调用 `RankService.userFinishCourse(userId)` 在 Redis 里给该用户周/月/年完成数 +1。  
   - 前端可跳转到下一课或课程列表。

6. **排行榜**  
   - 前端请求周/月/年排行榜；后端从 Redis 的 Sorted Set 里按分数（完成数）取 top N，并解析 userId 成用户信息返回。

### 3.3 认证流程（Logto）

- 前端：点击登录 → 跳转到 Logto（或 Logto Cloud），登录后带着 code 回跳到 `/callback`，用 @logto/vue 换 token 并保存。  
- 之后请求后端：Header 里带 `Authorization: Bearer <access_token>`。  
- 后端：用 Logto 的 JWT 校验（或调 Logto 接口）拿到 userId，再在业务里用 userId 查进度、写进度、排行等。

---

## 四、前后端如何配合实现「学习页」效果

### 4.1 学习页入口与数据加载

- 路由：`/game/[coursePackId]/[id].vue`。  
- 在 `onMounted` 里：  
  - 若登录，先拉已掌握元素（masteredElements）等；  
  - 再 `courseStore.setup(coursePackId, courseId)`：内部会调 API 拉「当前课 + 当前用户 statementIndex」；  
  - 再 `coursePackStore.setupCoursePack(coursePackId)` 拉课程包信息。  
- 若当前课已全部掌握，可 toaster 提示并跳回课程列表。

### 4.2 题目展示与输入

- **中译英**：`ChineseToEnglishMode.vue` → `Question.vue` 显示 `currentStatement.chinese`，下面接 `MainQuestionInput`。  
- **QuestionInput**：把 `currentStatement.english` 按空格拆成 `words`，每个词一个「格子」；用户输入时按空格或自动切词填入对应格子，实时校验；可「显示答案」「播放声音」「标记掌握」。  
- **听写**：`DictationMode.vue` 类似，但先播放发音，用户输入整句再校验。

### 4.3 状态与进度

- **courseStore**：当前 course、currentStatement、statementIndex、words、上一句/下一句、是否全部掌握等。  
- **statement store / composable**：`statementIndex` 的持久化——防抖 + 定时 + 失焦时调「更新进度」API，把 coursePackId、courseId、statementIndex 发给后端。  
- 后端 `UserCourseProgressService.upsert` 按 userId + coursePackId 唯一更新 courseId 和 statementIndex。

### 4.4 完成一课与排行榜

- 前端在「当前是最后一句且通过」等条件满足时，调「完成课程」API。  
- 后端 `CourseService.completeCourse`：写 course_history、更新 user_course_progress 到下一课、调用 RankService 在 Redis 里增加完成数。  
- 排行榜页从后端取 Redis 中的排名数据并展示。

---

## 五、小结：一张图串起来

```
用户打开网站
  → 未登录：Landing → Logto 登录 → 回调 → 已登录 Home
  → 已登录：Home → 课程包列表（API：coursePack）
       → 点某个包 → 课程列表（API：该包下 courses）
            → 点某课 → /game/[coursePackId]/[id]
                 → API：course + statements + statementIndex（user_course_progress）
                 → 前端：中译英/听写两种模式，按 statement 做题
                 → 切换句子：更新 statementIndex，防抖/定时/失焦时保存进度（API：user_course_progress）
                 → 标记掌握：API mastered_elements
                 → 完成一课：API completeCourse → course_history + 下一课进度 + Redis 排行
  → 排行榜：API 从 Redis 取周/月/年 top N
```

**用到的关键东西再列一遍**：  
Nuxt3 + Vue3 + Pinia（前端）、NestJS + Drizzle + PostgreSQL + Redis（后端）、Logto（认证）、schema/db/xingrong-courses（共享与课程数据）、Docker（可选，本地 Postgres/Redis/Logto）。  

**最终效果**：用户选课程包和课，在「中译英/听写」下按句练习，进度与掌握状态同步到服务器，完成课会计入排行榜；整个学习路径和体验都由上述数据流和模块配合实现。
