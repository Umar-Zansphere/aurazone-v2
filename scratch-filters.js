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
  
  if (content.includes('w-72')) {
    content = content.replace(/px-3 py-2 w-72/g, 'px-3 py-2 w-full md:w-72');
    changed = true;
  }
  
  if (content.includes('flex flex-wrap items-center gap-3')) {
    content = content.replace(/flex flex-wrap items-center gap-3/g, 'flex flex-col md:flex-row md:items-center gap-3');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated filters ' + file);
  }
}
