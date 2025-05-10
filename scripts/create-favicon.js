const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const inputSvg = path.join(projectRoot, 'public', 'favicon.svg');
const outputPath = path.join(projectRoot, 'src', 'app');

// Make sure the output directory exists
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Convert SVG to PNG first with 2 sizes (16x16 and 32x32)
async function convertToPng() {
  try {
    await sharp(inputSvg)
      .resize(16, 16)
      .png()
      .toFile(path.join(projectRoot, 'public', 'favicon-16x16.png'));
      
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(projectRoot, 'public', 'favicon-32x32.png'));

    // Copy the 32x32 version to be our favicon.ico in src/app
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputPath, 'favicon.ico'));

    console.log('Favicon created successfully');
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
}

convertToPng();
