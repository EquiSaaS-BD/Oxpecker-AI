const fs = require('fs');
const path = require('path');

const targetDir = __dirname;
const ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.gemini'];

function replaceInFile(filePath) {
    const ext = path.extname(filePath);
    // Ignore binary/image files
    if (['.jpg', '.jpeg', '.png', '.gif', '.ico', '.svg', '.mp4', '.zip', '.pdf', '.woff', '.woff2'].includes(ext.toLowerCase())) return;
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        
        // Case-sensitive replacements
        newContent = newContent.replace(/Shustota/g, 'Oxpecker');
        newContent = newContent.replace(/shustota/g, 'oxpecker');
        newContent = newContent.replace(/SHUSTOTA/g, 'OXPECKER');
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${filePath.replace(targetDir, '')}`);
        }
    } catch (err) {
        // Skip files that can't be read/written as utf8 safely
    }
}

function traverseDir(dir) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        return;
    }
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            continue;
        }
        
        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                traverseDir(fullPath);
            }
        } else {
            replaceInFile(fullPath);
        }
    }
}

console.log('Scanning and replacing "Shustota" with "Oxpecker"...');
traverseDir(targetDir);
console.log('Done! All instances of Shustota have been replaced.');
