#!/usr/bin/env node
// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/scripts/simple-fix.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log message with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Get all TypeScript files recursively
function getTypeScriptFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
          fileList = getTypeScriptFiles(filePath, fileList);
        } else if (
          stat.isFile() && 
          (file.endsWith('.ts') || file.endsWith('.tsx')) && 
          !file.endsWith('.d.ts')
        ) {
          fileList.push(filePath);
        }
      } catch (err) {
        log(`Error accessing file ${filePath}: ${err.message}`);
      }
    });
  } catch (err) {
    log(`Error reading directory ${dir}: ${err.message}`);
  }
  
  return fileList;
}

// Fix no-unused-vars by adding an underscore prefix
function fixUnusedVars(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Simple regex patterns to find and fix unused variables
    const patterns = [
      // Find variable declarations with "is defined but never used" comments
      { 
        regex: /(\b(?:const|let|var)\s+)(\w+)(\s*(?::|=).*\/\/.*is defined but never used)/g,
        replace: '$1_$2$3'
      },
      // Find variable declarations with "is assigned a value but never used" comments
      { 
        regex: /(\b(?:const|let|var)\s+)(\w+)(\s*(?::|=).*\/\/.*is assigned a value but never used)/g,
        replace: '$1_$2$3'
      },
      // Find function parameters with "is defined but never used" comments
      { 
        regex: /(\(\s*)(\w+)(\s*:\s*\w+\s*\)\s*\/\/.*is defined but never used)/g,
        replace: '$1_$2$3'
      }
    ];

    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.regex, pattern.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      log(`Fixed unused variables in ${filePath}`);
    }
    
    return modified;
  } catch (err) {
    log(`Error fixing unused vars in ${filePath}: ${err.message}`);
    return false;
  }
}

// Fix explicit any types by using more specific types
function fixExplicitAny(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace 'any' with 'unknown' where appropriate
    const anyPatterns = [
      { regex: /: any(?=\s*[;,)])/g, replace: ': unknown' },
      { regex: /: any\[\]/g, replace: ': unknown[]' },
      { regex: /<any>/g, replace: '<unknown>' },
      { regex: /Record<string, any>/g, replace: 'Record<string, unknown>' }
    ];

    anyPatterns.forEach(pattern => {
      const newContent = content.replace(pattern.regex, pattern.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      log(`Fixed explicit 'any' types in ${filePath}`);
    }
    
    return modified;
  } catch (err) {
    log(`Error fixing any types in ${filePath}: ${err.message}`);
    return false;
  }
}

// Fix unescaped entities in JSX for specific files known to have issues
function fixUnescapedEntities(filePaths) {
  const entityReplacements = [
    { regex: /(['"])([^'"]*?)(['"])/g, test: (str) => str.includes("'") || str.includes('"') },
    { search: "'", replace: "&apos;" },
    { search: '"', replace: "&quot;" }
  ];

  let fixedCount = 0;

  filePaths.forEach(filePath => {
    try {
      if (!fs.existsSync(filePath)) {
        log(`File not found: ${filePath}`);
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Simple replacements within JSX
      if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        // Find JSX text content using a simple heuristic
        const jsxTextRegex = />(.*?)</g;
        let match;
        let newContent = content;
        
        while ((match = jsxTextRegex.exec(content)) !== null) {
          let text = match[1];
          if (text.includes("'")) {
            const newText = text.replace(/'/g, "&apos;");
            if (newText !== text) {
              newContent = newContent.replace(text, newText);
              modified = true;
            }
          }
          if (text.includes('"')) {
            const newText = text.replace(/"/g, "&quot;");
            if (newText !== text) {
              newContent = newContent.replace(text, newText);
              modified = true;
            }
          }
        }
        
        content = newContent;
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`Fixed unescaped entities in ${filePath}`);
        fixedCount++;
      }
    } catch (err) {
      log(`Error fixing unescaped entities in ${filePath}: ${err.message}`);
    }
  });

  return fixedCount;
}

// Main function
async function main() {
  log('Starting simple ESLint issue fixes...');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const tsFiles = getTypeScriptFiles(srcDir);
  
  log(`Found ${tsFiles.length} TypeScript files to process`);
  
  let fixedUnusedVars = 0;
  let fixedExplicitAny = 0;
  
  // Process each file for unused vars and any types
  for (const filePath of tsFiles) {
    log(`Processing ${filePath}`);
    
    if (fixUnusedVars(filePath)) {
      fixedUnusedVars++;
    }
    
    if (fixExplicitAny(filePath)) {
      fixedExplicitAny++;
    }
  }
  
  // Process specific files with known entity issues
  const filesWithEntityIssues = [
    path.join(srcDir, 'app/donasi/page.tsx'),
    path.join(srcDir, 'app/search/page.tsx'),
    path.join(srcDir, 'app/setup/page.tsx'),
    path.join(srcDir, 'app/tentang/page.tsx'),
    path.join(srcDir, 'components/PrayerComponents.tsx'),
    path.join(srcDir, 'components/QuranPages.tsx'),
    path.join(srcDir, 'components/SearchComponents.tsx'),
    path.join(srcDir, 'components/SearchHistory.tsx'),
    path.join(srcDir, 'components/SurahCard.tsx'),
    path.join(srcDir, 'components/TafsirMaudhuiTree.tsx')
  ];
  
  const fixedEntities = fixUnescapedEntities(filesWithEntityIssues);
  
  log('Simple ESLint issue fixes completed:');
  log(`- Fixed unused variables in ${fixedUnusedVars} files`);
  log(`- Fixed explicit 'any' types in ${fixedExplicitAny} files`);
  log(`- Fixed unescaped entities in ${fixedEntities} files`);
  log('Next steps: Run npm run lint:fix to apply standard ESLint fixes');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
