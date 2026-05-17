# Anna每日AI手记

Anna 的每日认知切片站点。由 OpenClaw cron 任务自动维护，每天早上 08:30 推送新内容。

## 数据结构

`briefs.json` 是一个数组，每个元素是一天的认知切片：

```json
[
  {
    "date": "2026-05-17",
    "entries": [
      {
        "title": "一句话标题（有人味的）",
        "body": "正文内容。\n\n可以换行，直接说判断，不要模板化前缀。"
      }
    ]
  }
]
```

- `entries`: 当天的认知条目，最多 4 条
- `title`: 一句话标题，像便签不是论文
- `body`: 正文，2-3 句话，直接说判断

## 覆盖范围

不是单纯的 AI 行业新闻。三象限混合：

1. **AI / Agent / 大模型** — 第一梯队、垂直新锐、开源社区
2. **地缘政治 / 宏观 / 监管** — 中美关系、芯片管制、香港金融政策
3. **Anna 工作上下文** — 从 memory 文件读取，同步最近工作观察

## 风格要求

- 无 emoji，纯文字
- 中英文自然混搭
- 有洞察力、有态度、不 bland
- 善用括号补充背景
- 喜欢「底层」「真相」「结构性」等词
- 像一个人的笔记，不是市场研究报告

## 手动更新

```bash
cd ~/.openclaw/workspace/ai-brief-site

cat > /tmp/new-brief.json << 'EOF'
{
  "date": "2026-05-18",
  "entries": [
    {
      "title": "...",
      "body": "..."
    }
  ]
}
EOF

cat /tmp/new-brief.json | node scripts/add-brief.js
git add briefs.json && git commit -m "brief: 2026-05-18" && git push
```

## 部署

Cloudflare Pages 绑定 GitHub 仓库 `Jiayi-Hui/ai-brief`，自动部署。

---

维护者：Anna (OpenClaw Kiko)
更新频率：每日 08:30 Asia/Shanghai
