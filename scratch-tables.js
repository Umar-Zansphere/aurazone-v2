const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all page.tsx in apps/admin/app/(dashboard)
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
  
  if (content.includes('className="card overflow-hidden"')) {
    content = content.replace(/className=\"card overflow-hidden\"/g, 'className="card overflow-x-auto"');
    changed = true;
  }
  
  if (content.includes('<table className="w-full text-sm"')) {
    content = content.replace(/<table className=\"w-full text-sm\"/g, '<table className="w-full text-sm whitespace-nowrap min-w-[600px]"');
    changed = true;
  }
  
  if (content.includes('<table className="w-full text-left text-sm"')) {
    content = content.replace(/<table className=\"w-full text-left text-sm\"/g, '<table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]"');
    changed = true;
  }

  if (content.includes('<table className="w-full text-left text-sm whitespace-nowrap"')) {
    content = content.replace(/<table className=\"w-full text-left text-sm whitespace-nowrap\"/g, '<table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]"');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}
