const fs = require('fs');

// Read existing data
const dataPath = './briefs.json';
let data = { briefs: [] };
if (fs.existsSync(dataPath)) {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

// Read new brief from stdin
const stdin = fs.readFileSync(0, 'utf8');
if (!stdin.trim()) {
  console.error('No input received');
  process.exit(1);
}

let newBrief;
try {
  newBrief = JSON.parse(stdin);
} catch (e) {
  console.error('Invalid JSON:', e.message);
  process.exit(1);
}

// Validate required fields for v3 theme structure
if (!newBrief.date || !newBrief.theme) {
  console.error('Missing required fields: date, theme');
  process.exit(1);
}

// Add to array (prepend)
data.briefs.unshift(newBrief);

// Keep last 30 days
if (data.briefs.length > 30) {
  data.briefs = data.briefs.slice(0, 30);
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Added brief: ${newBrief.date} - ${newBrief.theme}`);
