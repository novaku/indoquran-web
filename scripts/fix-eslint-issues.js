#!/usr/bin/env node
// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/scripts/fix-eslint-issues.js

import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

// Log message with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Get all TypeScript files recursively
function getTypeScriptFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      fileList = getTypeScriptFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.ts') || file.endsWith('.tsx')) && 
      !file.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fix no-unused-vars by adding an underscore prefix
function fixUnusedVars(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let modified = false;

  // Regular expression to find variable declarations followed by "is defined but never used" or "is assigned a value but never used"
  const unusedVarRegex = /['"](.+?)['"] is (defined|assigned a value) but never used/g;
  
  // Find all variables marked as unused in the ESLint output
  const unusedVars = [];
  let match;
  const eslintOutput = execSync(`npx eslint ${filePath} --format json`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  
  try {
    const eslintResults = JSON.parse(eslintOutput);
    if (eslintResults && eslintResults.length > 0) {
      eslintResults[0].messages.forEach(message => {
        if (message.ruleId === '@typescript-eslint/no-unused-vars') {
          const varNameMatch = message.message.match(/['"](.+?)['"] is (defined|assigned a value) but never used/);
          if (varNameMatch && varNameMatch[1]) {
            unusedVars.push(varNameMatch[1]);
          }
        }
      });
    }
  } catch (e) {
    // If parsing fails, continue with an empty array
  }

  // Fix each unused variable by adding an underscore prefix
  unusedVars.forEach(varName => {
    for (let i = 0; i < lines.length; i++) {
      // Look for variable declarations
      const declarationRegex = new RegExp(`\\b(const|let|var|function)\\s+(${varName})\\b`);
      const paramRegex = new RegExp(`\\b(${varName})\\s*:[^,)]*`);
      
      if (declarationRegex.test(lines[i])) {
        lines[i] = lines[i].replace(declarationRegex, `$1 _$2`);
        modified = true;
      } else if (paramRegex.test(lines[i])) {
        // For function parameters
        lines[i] = lines[i].replace(paramRegex, `_$1:$2`);
        modified = true;
      }
    }
  });

  if (modified) {
    writeFileSync(filePath, lines.join('\n'));
    log(`Fixed unused variables in ${filePath}`);
  }
  
  return modified;
}

// Fix explicit any types by using more specific types
function fixExplicitAny(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace common patterns of any with more specific types
  const replacements = [
    // Function parameters that are any
    { from: /(function\s+\w+\s*\([^)]*?): any(\s*[,)])/g, to: '$1: unknown$2' },
    // Variable declarations with any
    { from: /(const|let|var)\s+\w+\s*:\s*any\s*=/g, to: '$1 $2: unknown =' },
    // Array of any
    { from: /: any\[\]/g, to: ': unknown[]' },
    // Record with any
    { from: /Record<string, any>/g, to: 'Record<string, unknown>' },
    // Generic with any
    { from: /<any>/g, to: '<unknown>' },
    // Function return type any
    { from: /\): any {/g, to: '): unknown {' },
  ];

  replacements.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  if (modified) {
    writeFileSync(filePath, content);
    log(`Fixed explicit 'any' types in ${filePath}`);
  }
  
  return modified;
}

// Fix unescaped entities in JSX
function fixUnescapedEntities(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace common unescaped entities
  const replacements = [
    { from: /([^\\])'/g, to: '$1\\\'', },  // Single quotes
    { from: /([^\\])"/g, to: '$1\\"', },  // Double quotes
  ];

  // Only apply to JSX/TSX files
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    replacements.forEach(({ from, to }) => {
      // Only replace within JSX elements
      // This is a simplified approach and might need refinement
      const jsxRegex = /<[a-zA-Z0-9].*?>(.*?)<\/[a-zA-Z0-9].*?>/gs;
      let match;
      
      let newContent = content;
      while ((match = jsxRegex.exec(content)) !== null) {
        const jsxContent = match[1];
        const fixedJsxContent = jsxContent.replace(from, to);
        
        if (fixedJsxContent !== jsxContent) {
          newContent = newContent.replace(jsxContent, fixedJsxContent);
          modified = true;
        }
      }
      
      content = newContent;
    });
  }

  if (modified) {
    writeFileSync(filePath, content);
    log(`Fixed unescaped entities in ${filePath}`);
  }
  
  return modified;
}

// Fix React hooks exhaustive deps
function fixReactHooks(filePath) {
  // This is a complex task that requires understanding the component's logic
  // We'll just identify files with hook dependency issues for manual review
  
  try {
    const eslintOutput = execSync(`npx eslint ${filePath} --format json`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const eslintResults = JSON.parse(eslintOutput);
    
    if (eslintResults && eslintResults.length > 0) {
      const hookIssues = eslintResults[0].messages.filter(
        message => message.ruleId === 'react-hooks/exhaustive-deps'
      );
      
      if (hookIssues.length > 0) {
        log(`Found ${hookIssues.length} React hook dependency issues in ${filePath} - requires manual review`);
        hookIssues.forEach(issue => {
          log(`  Line ${issue.line}: ${issue.message}`);
        });
        return true;
      }
    }
  } catch (e) {
    // If the command fails, continue
  }
  
  return false;
}

// Main function
async function main() {
  log('Starting ESLint issue fixes...');
  
  const srcDir = join(__dirname, '..', 'src');
  const tsFiles = getTypeScriptFiles(srcDir);
  
  log(`Found ${tsFiles.length} TypeScript files to process`);
  
  let fixedUnusedVars = 0;
  let fixedExplicitAny = 0;
  let fixedUnescapedEntities = 0;
  let filesWithHookIssues = 0;
  
  // Process each file
  for (const filePath of tsFiles) {
    log(`Processing ${filePath}`);
    
    if (fixUnusedVars(filePath)) {
      fixedUnusedVars++;
    }
    
    if (fixExplicitAny(filePath)) {
      fixedExplicitAny++;
    }
    
    if (fixUnescapedEntities(filePath)) {
      fixedUnescapedEntities++;
    }
    
    if (fixReactHooks(filePath)) {
      filesWithHookIssues++;
    }
  }
  
  log('ESLint issue fixes completed:');
  log(`- Fixed unused variables in ${fixedUnusedVars} files`);
  log(`- Fixed explicit 'any' types in ${fixedExplicitAny} files`);
  log(`- Fixed unescaped entities in ${fixedUnescapedEntities} files`);
  log(`- Identified ${filesWithHookIssues} files with React hook dependency issues for manual review`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
