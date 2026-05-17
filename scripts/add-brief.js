#!/usr/bin/env node
/**
 * 追加简报到 briefs.json
 * 用法: echo '{"date":"2026-05-17","entries":[...]}' | node scripts/add-brief.js
 */

const fs = require('fs');
const path = require('path');

const BRIEFS_PATH = path.join(__dirname, '..', 'briefs.json');

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    try {
      const newBrief = JSON.parse(input);
      if (!newBrief.date || !Array.isArray(newBrief.entries)) {
        console.error('格式错误: 需要 { date: "YYYY-MM-DD", entries: [...] }');
        process.exit(1);
      }

      let briefs = [];
      if (fs.existsSync(BRIEFS_PATH)) {
        briefs = JSON.parse(fs.readFileSync(BRIEFS_PATH, 'utf8'));
      }

      // 去重：同一天只保留最新
      briefs = briefs.filter(b => b.date !== newBrief.date);
      briefs.unshift(newBrief);

      // 只保留最近 60 天
      briefs = briefs.slice(0, 60);

      fs.writeFileSync(BRIEFS_PATH, JSON.stringify(briefs, null, 2));
      console.log(`已追加 ${newBrief.date}，共 ${newBrief.entries.length} 条`);
    } catch (err) {
      console.error('解析失败:', err.message);
      process.exit(1);
    }
  });
}

main();
