const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cmd = 'dir /s /b d:\\Zansphere\\aurazone-v2\\apps\\admin\\app\\(dashboard)\\page.tsx';

let files = [];
try {
  const output = execSync(cmd).toString();
  files = output.split('\n').map(f => f.trim()).filter(f => f.length > 0);
} catch (e) {
  console.log("No files found or error:", e.message);
}

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1"')) {
    content = content.replace(/className=\"flex items-center gap-1 rounded-lg border border-\[var\(--color-border\)\] bg-\[var\(--color-bg-surface\)\] p-1\"/g, 'className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1 overflow-x-auto"');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated filter buttons ' + file);
  }
}
