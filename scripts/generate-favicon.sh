#!/bin/bash

echo "===== Generating Favicon Files ====="
echo "This script will create favicon files in various formats"

# Ensure the favicons directory exists
mkdir -p public/favicons

# Create favicons using ImageMagick if available
if command -v convert &> /dev/null; then
  echo "Using ImageMagick to generate favicons..."
  
  # Copy the SVG source to favicons directory
  cp public/favicon.svg public/favicons/favicon.svg
  
  # Generate various sizes from the SVG source
  convert -background none public/favicon.svg -resize 16x16 public/favicons/favicon-16x16.png
  convert -background none public/favicon.svg -resize 32x32 public/favicons/favicon-32x32.png
  convert -background none public/favicon.svg -resize 48x48 public/favicons/favicon-48x48.png
  convert -background none public/favicon.svg -resize 96x96 public/favicons/favicon-96x96.png
  
  # Create favicon.ico with multiple sizes
  convert -background none public/favicon.svg -define icon:auto-resize=16,32,48 public/favicon.ico
  
  # Copy to the app directory as well
  cp public/favicon.ico src/app/favicon.ico
  
  echo "✅ Favicons generated successfully!"
else
  echo "❌ ImageMagick is not installed. Please install ImageMagick or manually create favicons."
  echo "You can install ImageMagick with: brew install imagemagick"
fi

echo "===== Adding favicon links to layout.tsx ====="
echo "Make sure the following lines are in your layout.tsx metadata:"
echo "icons: {"
echo "  icon: ["
echo "    { url: '/favicon.ico', sizes: '16x16' },"
echo "    { url: '/favicon.svg', sizes: 'any' },"
echo "    { url: '/favicons/favicon-16x16.png', sizes: '16x16' },"
echo "    { url: '/favicons/favicon-32x32.png', sizes: '32x32' },"
echo "  ],"
echo "  apple: '/icons/icon-192x192.png',"
echo "},"
