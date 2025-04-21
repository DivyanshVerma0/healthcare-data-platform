// This script fixes the missing @emotion/weak-memoize module
const fs = require('fs');
const path = require('path');

// Create the directory structure if it doesn't exist
const targetDir = path.join(__dirname, 'node_modules', '@emotion', 'weak-memoize', 'dist');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy our local weak-memoize file to the node_modules directory
const sourceFile = path.join(__dirname, 'src', 'emotion-weak-memoize.js');
const targetFile = path.join(targetDir, 'weak-memoize.js');

fs.copyFileSync(sourceFile, targetFile);

console.log('Fixed @emotion/weak-memoize module by copying the file to:', targetFile); 