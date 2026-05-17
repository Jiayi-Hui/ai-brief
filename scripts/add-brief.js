const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_FILE = path.join(__dirname, '..', 'briefs.json');
const MAX_BRIEFS = 100; // 保留最近100条

let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const newBrief = JSON.parse(input.trim());
    
    if (!newBrief.date || !Array.isArray(newBrief.items)) {
      throw new Error('Invalid brief format: must have "date" and "items" array');
    }

    let data = [];
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }

    // 去重：如果同一天已存在，替换
    const existingIndex = data.findIndex(b => b.date === newBrief.date);
    if (existingIndex >= 0) {
      data[existingIndex] = newBrief;
      console.log(`Updated brief for ${newBrief.date}`);
    } else {
      data.unshift(newBrief);
      console.log(`Added brief for ${newBrief.date}`);
    }

    // 限制数量
    if (data.length > MAX_BRIEFS) {
      data = data.slice(0, MAX_BRIEFS);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');

    // 可选：自动 Git 提交
    if (process.env.GIT_AUTO_COMMIT === 'true') {
      const cwd = path.join(__dirname, '..');
      try {
        execSync('git add briefs.json', { cwd, stdio: 'ignore' });
        execSync(`git commit -m "brief: ${newBrief.date}"`, { cwd, stdio: 'ignore' });
        console.log('Committed to Git');
      } catch (e) {
        console.log('Git commit skipped (nothing to commit or not a repo)');
      }
    }

    // 可选：自动 Push
    if (process.env.GIT_AUTO_PUSH === 'true') {
      const cwd = path.join(__dirname, '..');
      try {
        execSync('git push', { cwd, stdio: 'ignore' });
        console.log('Pushed to remote');
      } catch (e) {
        console.error('Git push failed:', e.message);
        process.exit(1);
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
});
