const fs = require('fs');
const path = require('path');

const source = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\74875281-04f4-4cea-b854-c0335173e4ed\\david_tetteh_portrait_1774862022834.png";
const destDir = "frontend/src/assets/team";
const destFile = path.join(destDir, "david.png");

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(source, destFile);
console.log(`Successfully copied ${source} to ${destFile}`);
