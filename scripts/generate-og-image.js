// Create a simple OG image for social sharing
const canvas = document.createElement('canvas');
canvas.width = 1200;
canvas.height = 630;
const ctx = canvas.getContext('2d');

// Set background
ctx.fillStyle = '#FEF3C7'; // Light amber background
ctx.fillRect(0, 0, 1200, 630);

// Add decorative border
ctx.strokeStyle = '#B45309'; // Amber-800
ctx.lineWidth = 20;
ctx.strokeRect(30, 30, 1140, 570);

// Add title
ctx.fillStyle = '#B45309'; // Amber-800
ctx.font = 'bold 60px Arial';
ctx.textAlign = 'center';
ctx.fillText('Al-Quran Indonesia', 600, 200);

// Add subtitle
ctx.fillStyle = '#92400E'; // Amber-900
ctx.font = '30px Arial';
ctx.fillText('Baca Al-Quran dengan Terjemahan & Tafsir', 600, 280);

// Add decoration
const drawIslamicPattern = () => {
  // Simple Islamic geometric pattern
  ctx.strokeStyle = '#D97706'; // Amber-600
  ctx.lineWidth = 2;
  
  // Draw a star pattern
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.translate(600, 400);
    ctx.rotate(i * Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 100);
    ctx.stroke();
    ctx.restore();
  }
  
  // Draw circles
  ctx.beginPath();
  ctx.arc(600, 400, 50, 0, 2 * Math.PI);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(600, 400, 75, 0, 2 * Math.PI);
  ctx.stroke();
};

drawIslamicPattern();

// Export as PNG
const dataUrl = canvas.toDataURL('image/png');
const img = document.createElement('img');
img.src = dataUrl;
document.body.appendChild(img);

// For download
const link = document.createElement('a');
link.download = 'og-image.png';
link.href = dataUrl;
link.click();
