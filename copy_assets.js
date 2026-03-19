const fs = require('fs');
const path = require('path');

const files = [
  ['C:\\Users\\HP\\.gemini\\antigravity\\brain\\b774cd3e-fbfb-428e-9a1e-fc865d4ffb07\\acme_financial_logo_1773653654610.png', 'c:\\Users\\HP\\Desktop\\h\\frontend\\src\\assets\\logo.png'],
  ['C:\\Users\\HP\\.gemini\\antigravity\\brain\\b774cd3e-fbfb-428e-9a1e-fc865d4ffb07\\hero_background_1773701678255.png', 'c:\\Users\\HP\\Desktop\\h\\frontend\\src\\assets\\hero_bg.png'],
  ['C:\\Users\\HP\\.gemini\\antigravity\\brain\\b774cd3e-fbfb-428e-9a1e-fc865d4ffb07\\ceo_portrait_1773701770164.png', 'c:\\Users\\HP\\Desktop\\h\\frontend\\src\\assets\\ceo.png'],
  ['C:\\Users\\HP\\.gemini\\antigravity\\brain\\b774cd3e-fbfb-428e-9a1e-fc865d4ffb07\\operations_head_portrait_1773702277648.png', 'c:\\Users\\HP\\Desktop\\h\\frontend\\src\\assets\\operations.png'],
  ['C:\\Users\\HP\\.gemini\\antigravity\\brain\\b774cd3e-fbfb-428e-9a1e-fc865d4ffb07\\cto_portrait_1773702827975.png', 'c:\\Users\\HP\\Desktop\\h\\frontend\\src\\assets\\cto.png']
];

files.forEach(([src, dest]) => {
  try {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`Error copying ${src}: ${err.message}`);
  }
});
