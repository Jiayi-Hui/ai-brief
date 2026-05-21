const fs = require('fs');

const dataPath = './briefs.json';
let data = { briefs: [] };
if (fs.existsSync(dataPath)) {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

const newBrief = JSON.parse(fs.readFileSync('/tmp/brief-2026-05-21.json', 'utf8'));

if (!newBrief.date || !newBrief.theme) {
  console.error('Missing required fields: date, theme');
  process.exit(1);
}

data.briefs.unshift(newBrief);
if (data.briefs.length > 30) {
  data.briefs = data.briefs.slice(0, 30);
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Added brief: ${newBrief.date} - ${newBrief.theme}`);
