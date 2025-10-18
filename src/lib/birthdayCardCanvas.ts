interface BirthdayCardData {
  name?: string;
  age: number;
  birthDate: string;
  message: string;
}

export const generateBirthdayCardImage = async (data: BirthdayCardData): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  // Set canvas size (social media friendly - 1080x1080)
  canvas.width = 1080;
  canvas.height = 1080;

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#FF6B9D');
  gradient.addColorStop(0.5, '#C06C84');
  gradient.addColorStop(1, '#6C5B7B');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add decorative elements (confetti dots)
  const confettiColors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#7FFF00', '#FF1493'];
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 15 + 5;
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Add white content box
  const boxPadding = 80;
  const boxX = boxPadding;
  const boxY = 150;
  const boxWidth = canvas.width - (boxPadding * 2);
  const boxHeight = canvas.height - 300;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 30);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Title
  ctx.fillStyle = '#FF6B9D';
  ctx.font = 'bold 80px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const titleText = data.name ? `Happy Birthday ${data.name}!` : 'Happy Birthday!';
  ctx.fillText(titleText, canvas.width / 2, boxY + 60);

  // Age badge
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, boxY + 200, 70, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#333';
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.fillText(data.age.toString(), canvas.width / 2, boxY + 170);

  // Birth date
  ctx.fillStyle = '#666';
  ctx.font = '36px Arial, sans-serif';
  const birthDateFormatted = new Date(data.birthDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  ctx.fillText(`Born on ${birthDateFormatted}`, canvas.width / 2, boxY + 300);

  // AI-generated message
  ctx.fillStyle = '#333';
  ctx.font = '32px Arial, sans-serif';
  ctx.textAlign = 'center';
  
  // Word wrap the message
  const maxWidth = boxWidth - 100;
  const words = data.message.split(' ');
  let line = '';
  let y = boxY + 380;
  const lineHeight = 45;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, canvas.width / 2, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, canvas.width / 2, y);

  // Decorative bottom elements
  ctx.fillStyle = '#FF6B9D';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.fillText('🎉 🎂 🎈', canvas.width / 2, boxY + boxHeight - 80);

  // Watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('aiagecalc.com', canvas.width / 2, canvas.height - 50);

  // Convert canvas to data URL
  return canvas.toDataURL('image/png', 1.0);
};
