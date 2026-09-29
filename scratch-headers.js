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
  
  if (content.includes('className="flex items-start justify-between"')) {
    content = content.replace(/className=\"flex items-start justify-between\"/g, 'className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"');
    changed = true;
  }
  
  // Specific fix for coupons page
  if (content.includes('className="flex items-center justify-between"') && file.includes('coupons')) {
    content = content.replace(/className=\"flex items-center justify-between\"/g, 'className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated headers ' + file);
  }
}
