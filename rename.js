const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    return;
  }
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walk(p);
      }
    } else if (/\.(tsx|ts|js|jsx|css|md|json)$/.test(p)) {
      let content = fs.readFileSync(p, 'utf8');
      const original = content;
      
      // Replace "Shustota AI" with "Oxpecker AI"
      content = content.replace(/Shustota\s+AI/gi, 'Oxpecker AI');
      // Replace capital "Shustota" with "Oxpecker"
      content = content.replace(/Shustota/g, 'Oxpecker');
      // Replace lowercase "shustota" except in ".ai" domain context
      content = content.replace(/shustota(?!\.ai)/g, 'oxpecker');

      if (original !== content) {
        fs.writeFileSync(p, content, 'utf8');
        console.log('Updated:', p);
      }
    }
  }
}

console.log("Starting Rebranding from Shustota AI to Oxpecker AI...");
walk(path.join(__dirname, 'Frontend', 'src'));
console.log("Rebranding completed successfully!");
