const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Directories to process
const srcDir = path.resolve(__dirname, '../src');

// Find all JS and TSX files
function findFiles(dir, extensions) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.includes(path.extname(file))) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Simple pattern to identify <img> tags that might need optimization
const imgPattern = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g;

// Optimize specific files
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for <img> tags
    const matches = content.match(imgPattern);
    
    if (matches && matches.length > 0) {
      console.log(`Found ${matches.length} potential image(s) to optimize in: ${filePath}`);
      matches.forEach(match => console.log(`  ${match.slice(0, 100)}${match.length > 100 ? '...' : ''}`));
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('Scanning for potential image optimizations...');
const files = findFiles(srcDir, ['.js', '.jsx', '.ts', '.tsx']);

console.log(`Found ${files.length} files to check.`);
let count = 0;

files.forEach(file => {
  analyzeFile(file);
  count++;
  if (count % 50 === 0) {
    console.log(`Processed ${count}/${files.length} files...`);
  }
});

console.log(`
Optimization Summary:
---------------------
To optimize images in your Next.js app:

1. Import the Image component:
   import Image from 'next/image';

2. Replace <img> tags with the Image component:
   <Image 
     src="/path/to/image.jpg" 
     alt="Description" 
     width={500}
     height={300}
     priority={isAboveTheFold}
     loading="lazy"
   />

3. For static images in the public directory:
   <Image 
     src="/icon.png" 
     alt="Icon" 
     width={32} 
     height={32} 
   />

4. For external images, add the domain to next.config.js:
   images: {
     domains: ['example.com']
   }

Run: node scripts/optimize-images.js
to help identify images that need optimization.
`);
