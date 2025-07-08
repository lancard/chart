const fs = require('fs');
const path = require('path');

const targetDir = './your-folder-path'; // 실제 경로로 수정

const folders = fs.readdirSync(targetDir)
  .filter(file => {
    const fullPath = path.join(targetDir, file);
    const isDir = fs.statSync(fullPath).isDirectory();
    const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(file);
    return isDir && isDateFormat;
  })
  .sort();

console.log(folders);
