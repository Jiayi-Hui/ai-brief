# AI Brief Site — 大模型与 Agent 前沿双轨智报

个人每日简报站点。由 OpenClaw cron 任务自动维护，每天早上 08:30 推送新简报。

## 快速开始

### 1. 创建 GitHub 仓库

1. 登录 GitHub → New Repository
2. 仓库名：`ai-brief`（或任意）
3. 公开/私有均可（Cloudflare Pages 支持私有仓库）
4. 不要初始化 README，空仓库即可

### 2. 上传文件

把以下文件 push 到仓库根目录：

```
ai-brief/
├── index.html      # 主页面
├── app.js          # 前端渲染
├── briefs.json     # 简报数据
├── scripts/
│   └── add-brief.js  # 更新脚本
└── README.md
```

**方法一：命令行**
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/ai-brief.git
git add .
git commit -m "init"
git push -u origin main
```

**方法二：网页上传**
- GitHub 仓库页面 → "uploading an existing file" → 拖拽上传

### 3. 部署到 Cloudflare Pages

1. 登录 [dash.cloudflare.com](https://dash.cloudflare.com)
2. Workers & Pages → Create application → Pages → Connect to Git
3. 选择 GitHub 授权 → 选中你的 `ai-brief` 仓库
4. 构建设置：
   - **Framework preset:** None
   - **Build command:** 留空
   - **Build output directory:** `/`（根目录）
5. Save and Deploy
6. 约 1 分钟后，获得 `xxx.pages.dev` 域名
7. （可选）绑定自定义域名：Custom domains → 输入你的域名

### 4. 配置自动推送（OpenClaw → GitHub）

OpenClaw 需要权限才能自动 `git push` 更新简报。

#### 获取 GitHub Token

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. 勾选权限：**repo**（完整仓库访问）
4. 生成后复制 token（只显示一次）

#### 配置 OpenClaw

在 OpenClaw 服务器上执行：

```bash
# 进入仓库目录
cd ~/.openclaw/workspace/ai-brief-site

# 初始化 git（如果还没做）
git init
git remote add origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/ai-brief.git

# 测试推送
git add .
git commit -m "init from OpenClaw"
git push -u origin main
```

#### 启用自动推送

在 OpenClaw 的 cron 任务中设置环境变量：

```bash
export GIT_AUTO_PUSH=true
```

或在 `~/.openclaw/workspace/ai-brief-site/scripts/add-brief.js` 同级创建 `.env`：
```
GIT_AUTO_PUSH=true
```

### 5. 修改 Cron 任务

现有 cron 任务 `67862a81-6c88-405b-9e86-3a21ec79105d` 每天发 Telegram。
需要扩展它，让它同时更新网站。

**方法：替换 cron message**

让 cron 任务执行完成后，把生成的简报 JSON 通过管道传给 `add-brief.js`，然后 git push。

编辑命令：
```bash
openclaw cron edit 67862a81-6c88-405b-9e86-3a21ec79105d \
  --message "执行双轨智报任务。生成简报后：1) 发送到 Telegram 2) 更新 ai-brief-site/briefs.json 并 push 到 GitHub"
```

**具体执行逻辑**（cron 的 message 中让模型执行）：
```
1. 检索行业动态，按双轨标准筛选
2. 格式化输出 Telegram 消息
3. 同时生成 JSON 格式简报，写入 ~/.openclaw/workspace/ai-brief-site/briefs.json
4. cd ~/.openclaw/workspace/ai-brief-site && git add . && git commit && git push
```

## 数据结构

`briefs.json` 是一个数组，每个元素是一天的简报：

```json
[
  {
    "date": "2026-05-17",
    "items": [
      {
        "track": 1,
        "company": "Anthropic",
        "title": "具体发布了什么...",
        "detail": "可选补充说明",
        "impact": "行业底层影响..."
      },
      {
        "track": 2,
        "company": "Cursor",
        "title": "做了什么独具一格的事...",
        "detail": "可选补充说明",
        "insight": "硬核数据与洞察..."
      }
    ]
  }
]
```

- `track`: `1` 为巨头风向标，`2` 为异类颠覆者
- `impact`: 轨道一专用字段
- `insight`: 轨道二专用字段
- `detail`: 可选补充说明

## 手动更新

如果你不想等 cron，可以手动添加简报：

```bash
cd ~/.openclaw/workspace/ai-brief-site

# 创建临时 JSON 文件
cat > /tmp/new-brief.json << 'EOF'
{
  "date": "2026-05-18",
  "items": [
    {
      "track": 1,
      "company": "OpenAI",
      "title": "...",
      "impact": "..."
    }
  ]
}
EOF

# 执行更新
cat /tmp/new-brief.json | node scripts/add-brief.js

# 手动推送
git add briefs.json
git commit -m "brief: 2026-05-18"
git push
```

## 自定义域名

1. Cloudflare Pages 项目 → Custom domains
2. 输入你的域名（如 `brief.anna.dev`）
3. 按提示添加 DNS 记录
4. 自动获得 HTTPS

## 故障排查

| 问题 | 解决 |
|------|------|
| 网站白屏 | 检查 `briefs.json` 是否为合法 JSON |
| 推送失败 | 检查 GitHub token 是否有 `repo` 权限；检查 remote URL 是否正确 |
| 数据没更新 | 清除浏览器缓存；检查 Cloudflare Pages 部署状态 |
| 日期导航不显示 | 确认 `briefs.json` 是数组，且每个元素有 `date` 和 `items` |

## 文件说明

| 文件 | 作用 |
|------|------|
| `index.html` | 主页面（含内联 CSS） |
| `app.js` | 前端渲染逻辑，自动加载 briefs.json |
| `briefs.json` | 简报数据，cron 任务自动更新 |
| `scripts/add-brief.js` | 数据追加脚本，去重 + 限制数量 |

---

维护者：Anna (OpenClaw Kiko)
更新频率：每日 08:30 Asia/Shanghai
