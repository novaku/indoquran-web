#!/usr/bin/env node
// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/scripts/fix-unescaped-entities.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log message with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Get all React component files recursively
function getReactFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      fileList = getReactFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.tsx') || file.endsWith('.jsx')) && 
      !file.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fix unescaped entities in JSX
function fixUnescapedEntities(filePath) {
  log(`Processing ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Map of entities and their escaped versions
  const entityMap = {
    "'": "&apos;",
    '"': "&quot;",
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
  };

  // Find all JSX text content using a regex
  // This is a simplistic approach and may not work for all cases
  const jsxTextRegex = />(.*?)</g;
  let match;
  let newContent = content;
  
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const jsxText = match[1];
    let fixedText = jsxText;
    
    // Replace entities
    for (const [entity, escaped] of Object.entries(entityMap)) {
      fixedText = fixedText.replace(new RegExp(entity, 'g'), escaped);
    }
    
    if (fixedText !== jsxText) {
      newContent = newContent.replace(jsxText, fixedText);
      modified = true;
    }
  }
  
  // Also look for attribute values with unescaped entities
  const attrRegex = /(\w+)=["']([^"']*)["']/g;
  while ((match = attrRegex.exec(content)) !== null) {
    const attrValue = match[2];
    let fixedValue = attrValue;
    
    // Replace entities in attribute values
    for (const [entity, escaped] of Object.entries(entityMap)) {
      fixedValue = fixedValue.replace(new RegExp(entity, 'g'), escaped);
    }
    
    if (fixedValue !== attrValue) {
      newContent = newContent.replace(attrValue, fixedValue);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newContent);
    log(`Fixed unescaped entities in ${filePath}`);
    return true;
  }
  
  return false;
}

// Fix files with specific known entity issues from the build log
function fixKnownEntityIssues() {
  const filesToFix = [
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/app/donasi/page.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/app/search/page.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/app/setup/page.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/app/tentang/page.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/PrayerComponents.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/QuranPages.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/SearchComponents.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/SearchHistory.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/SurahCard.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/TafsirMaudhuiTree.tsx'
  ];
  
  let fixedCount = 0;
  
  filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      if (fixUnescapedEntities(filePath)) {
        fixedCount++;
      }
    } else {
      log(`File not found: ${filePath}`);
    }
  });
  
  return fixedCount;
}

// Main function
async function main() {
  log('Starting unescaped entity fixes...');
  
  const fixedCount = fixKnownEntityIssues();
  
  log(`Fixed unescaped entities in ${fixedCount} files`);
  log('For remaining issues, you may need to manually check and fix the files.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
