#!/usr/bin/env node
// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/scripts/fix-react-hooks.js

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

// Fix React hooks exhaustive deps
function fixReactHooks(filePath) {
  log(`Analyzing ${filePath}`);
  
  try {
    const eslintOutput = execSync(`npx eslint ${filePath} --format json`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const eslintResults = JSON.parse(eslintOutput);
    
    if (eslintResults && eslintResults.length > 0) {
      const hookIssues = eslintResults[0].messages.filter(
        message => message.ruleId === 'react-hooks/exhaustive-deps'
      );
      
      if (hookIssues.length > 0) {
        log(`Found ${hookIssues.length} React hook dependency issues in ${filePath}`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let lines = content.split('\n');
        let modified = false;
        
        // For each hook issue, try to fix it
        for (const issue of hookIssues) {
          log(`  Line ${issue.line}: ${issue.message}`);
          
          // Find the useEffect or useMemo or useCallback
          const hookLineIndex = issue.line - 1;
          const hookLine = lines[hookLineIndex];
          
          // Find the dependency array line
          let depArrayLineIndex = -1;
          let depArrayLine = '';
          let indentation = '';
          
          // Look for dependency array in the next few lines
          for (let i = hookLineIndex; i < Math.min(hookLineIndex + 10, lines.length); i++) {
            if (lines[i].includes('[]') || lines[i].match(/\[[^\]]*\]/)) {
              depArrayLineIndex = i;
              depArrayLine = lines[i];
              
              // Extract indentation
              const match = depArrayLine.match(/^(\s*)/);
              if (match) {
                indentation = match[1];
              }
              
              break;
            }
          }
          
          if (depArrayLineIndex !== -1) {
            // Extract missing dependencies from the ESLint message
            const missingDepsMatch = issue.message.match(/Either include (.*?) or remove/);
            if (missingDepsMatch && missingDepsMatch[1]) {
              const missingDeps = missingDepsMatch[1]
                .split(',')
                .map(dep => dep.trim())
                .filter(dep => dep !== 'it' && dep !== 'them'); // Filter out pronouns
              
              // Update dependency array
              if (depArrayLine.includes('[]')) {
                // Empty array
                lines[depArrayLineIndex] = depArrayLine.replace('[]', `[${missingDeps.join(', ')}]`);
              } else {
                // Array with existing dependencies
                const currentDepsMatch = depArrayLine.match(/\[(.*)\]/);
                if (currentDepsMatch) {
                  const currentDeps = currentDepsMatch[1].split(',').map(dep => dep.trim());
                  const updatedDeps = [...new Set([...currentDeps, ...missingDeps])].filter(Boolean);
                  
                  // Format the new dependency array with proper indentation
                  if (updatedDeps.length <= 3) {
                    // For small dependency arrays, keep on one line
                    lines[depArrayLineIndex] = depArrayLine.replace(/\[.*\]/, `[${updatedDeps.join(', ')}]`);
                  } else {
                    // For larger dependency arrays, format nicely with one dependency per line
                    const formattedDeps = updatedDeps.map(dep => `${indentation}  ${dep}`).join(',\n');
                    lines[depArrayLineIndex] = depArrayLine.replace(/\[.*\]/, `[\n${formattedDeps}\n${indentation}]`);
                  }
                }
              }
              
              modified = true;
            }
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, lines.join('\n'));
          log(`Fixed React hook dependencies in ${filePath}`);
          return true;
        }
      }
    }
  } catch (e) {
    log(`Error analyzing ${filePath}: ${e.message}`);
  }
  
  return false;
}

// Fix known files with React hook issues from the build log
function fixKnownHookIssues() {
  const filesToFix = [
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/app/page.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/app/profile/page.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/AyatCard.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/DramaticDoaHeader.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/LazyLoadImage.tsx',
    '/Users/novaherdi/Documents/GitHub/indoquran-web/src/components/PrayerTimesWidget.tsx'
  ];
  
  let fixedCount = 0;
  
  filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      if (fixReactHooks(filePath)) {
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
  log('Starting React hook dependency fixes...');
  
  const fixedCount = fixKnownHookIssues();
  
  log(`Fixed React hook dependencies in ${fixedCount} files`);
  log('For remaining issues, you may need to manually check and fix the files.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
