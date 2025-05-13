#!/usr/bin/env node

/**
 * This script converts all img tags in the codebase to LazyLoadImage components
 * to improve performance by lazy loading images only when they enter the viewport.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Simple pattern to identify <img> tags
const imgPattern = /<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>/g;

// Import statement to add to files
const importStatement = "import LazyLoadImage from '@/components/LazyLoadImage';";

// Function to process files
async function convertImgToLazyLoad() {
  // Find all files that might contain <img> tags
  const files = glob.sync(path.join(process.cwd(), 'src/**/*.{tsx,jsx}'));
  
  console.log(`Found ${files.length} files to check for img tags`);
  let totalImgsConverted = 0;
  let filesModified = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Check for <img> tags
    const matches = content.matchAll(imgPattern);
    let hasImgTag = false;
    let imgsInFile = 0;
    
    for (const match of matches) {
      hasImgTag = true;
      imgsInFile++;
      
      const imgTag = match[0];
      
      // Extract attributes from the img tag
      const src = imgTag.match(/src=["']([^"']+)["']/)?.[1] || '';
      const alt = imgTag.match(/alt=["']([^"']+)["']/)?.[1] || '';
      const className = imgTag.match(/className=["']([^"']+)["']/)?.[1] || '';
      
      // Estimate width and height based on className if available
      let width = 24;
      let height = 24;
      
      // Try to extract dimensions from classNames like w-6 h-6
      const widthMatch = className.match(/w-(\d+)/);
      const heightMatch = className.match(/h-(\d+)/);
      
      if (widthMatch) width = parseInt(widthMatch[1]) * 4; // Convert Tailwind units to pixels
      if (heightMatch) height = parseInt(heightMatch[1]) * 4;
      
      // Create LazyLoadImage component
      const lazyImgComponent = `<LazyLoadImage src="${src}" alt="${alt}" width={${width}} height={${height}} className="${className}" />`;
      
      // Replace the img tag with LazyLoadImage
      content = content.replace(imgTag, lazyImgComponent);
    }
    
    // If file has img tags, add import if not already present
    if (hasImgTag && !content.includes("import LazyLoadImage")) {
      // Find the last import statement
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        let endOfImports = content.indexOf(';', lastImportIndex) + 1;
        
        // Add our import after the last import
        content = content.substring(0, endOfImports) + 
                 '\n' + importStatement + 
                 content.substring(endOfImports);
      } else {
        // If no imports, add at the beginning (after use client if present)
        const useClientIndex = content.indexOf("'use client';");
        if (useClientIndex !== -1) {
          content = content.substring(0, useClientIndex + 13) + 
                   '\n\n' + importStatement + 
                   content.substring(useClientIndex + 13);
        } else {
          content = importStatement + '\n\n' + content;
        }
      }
      
      // Save the modified content back to the file
      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        filesModified++;
        totalImgsConverted += imgsInFile;
        console.log(`✅ Converted ${imgsInFile} img tags in ${path.basename(file)}`);
      }
    }
  }
  
  console.log(`\nConversion complete! Modified ${filesModified} files and converted ${totalImgsConverted} img tags to LazyLoadImage components.`);
}

// Run the conversion
convertImgToLazyLoad().catch(console.error);
