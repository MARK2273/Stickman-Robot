const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function drawRobotWarsPNG(size) {
  const png = new PNG({
    width: size,
    height: size,
    filterType: -1
  });

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (Math.floor(y) * size + Math.floor(x)) * 4;
    const alpha = a / 255;
    const invAlpha = 1 - alpha;
    png.data[idx] = Math.min(255, Math.floor(r * alpha + png.data[idx] * invAlpha));
    png.data[idx + 1] = Math.min(255, Math.floor(g * alpha + png.data[idx + 1] * invAlpha));
    png.data[idx + 2] = Math.min(255, Math.floor(b * alpha + png.data[idx + 2] * invAlpha));
    png.data[idx + 3] = Math.min(255, Math.floor(a + png.data[idx + 3] * invAlpha));
  }

  function drawCircle(cx, cy, radius, r, g, b, a, fill = true, strokeWidth = 1) {
    const minX = Math.max(0, Math.floor(cx - radius - strokeWidth));
    const maxX = Math.min(size - 1, Math.ceil(cx + radius + strokeWidth));
    const minY = Math.max(0, Math.floor(cy - radius - strokeWidth));
    const maxY = Math.min(size - 1, Math.ceil(cy + radius + strokeWidth));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        if (fill) {
          if (d <= radius) {
            setPixel(x, y, r, g, b, a);
          } else if (d < radius + 1) {
            const edgeAlpha = (1 - (d - radius)) * a;
            setPixel(x, y, r, g, b, edgeAlpha);
          }
        } else {
          const diff = Math.abs(d - radius);
          if (diff <= strokeWidth / 2) {
            setPixel(x, y, r, g, b, a);
          } else if (diff < strokeWidth / 2 + 1) {
            const edgeAlpha = (1 - (diff - strokeWidth / 2)) * a;
            setPixel(x, y, r, g, b, edgeAlpha);
          }
        }
      }
    }
  }

  function drawLine(x1, y1, x2, y2, r, g, b, a, thickness = 2) {
    const dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    const steps = Math.ceil(dist * 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      drawCircle(x, y, thickness / 2, r, g, b, a, true);
    }
  }

  function drawRect(x, y, w, h, r, g, b, a) {
    for (let py = Math.floor(y); py < Math.floor(y + h); py++) {
      for (let px = Math.floor(x); px < Math.floor(x + w); px++) {
        setPixel(px, py, r, g, b, a);
      }
    }
  }

  // 1. Dark Cyber Gradient Background
  for (let y = 0; y < size; y++) {
    const grad = y / size;
    const bgR = Math.floor(15 * (1 - grad) + 5 * grad);
    const bgG = Math.floor(23 * (1 - grad) + 5 * grad);
    const bgB = Math.floor(42 * (1 - grad) + 12 * grad);
    for (let x = 0; x < size; x++) {
      setPixel(x, y, bgR, bgG, bgB, 255);
    }
  }

  // 2. Outer Glowing Border
  const borderWidth = Math.max(2, Math.floor(size * 0.025));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x < borderWidth || x >= size - borderWidth || y < borderWidth || y >= size - borderWidth) {
        setPixel(x, y, 56, 189, 248, 240); // Cyan
      }
    }
  }

  // 3. Stickman Dimensions
  const scale = size / 192;
  const headX = 96 * scale;
  const headY = 52 * scale;
  const headR = 18 * scale;
  const spineTop = 70 * scale;
  const spineBottom = 120 * scale;
  const lineW = Math.max(2, 7 * scale);

  // Stickman Head (Outer Ring)
  drawCircle(headX, headY, headR, 248, 250, 252, 255, false, lineW);
  // Visor Glow
  drawCircle(headX + 6 * scale, headY - 2 * scale, Math.max(1, 4 * scale), 56, 189, 248, 255, true);
  drawLine(headX - 2 * scale, headY - 2 * scale, headX + 12 * scale, headY - 2 * scale, 56, 189, 248, 255, Math.max(1, 3 * scale));

  // Spine
  drawLine(headX, spineTop, headX, spineBottom, 248, 250, 252, 255, lineW);

  // Left Leg & Right Leg
  drawLine(headX, spineBottom, 72 * scale, 162 * scale, 248, 250, 252, 255, lineW);
  drawLine(headX, spineBottom, 122 * scale, 162 * scale, 248, 250, 252, 255, lineW);

  // Arms
  drawLine(headX, 85 * scale, 62 * scale, 102 * scale, 248, 250, 252, 255, lineW * 0.85);
  drawLine(headX, 85 * scale, 135 * scale, 92 * scale, 248, 250, 252, 255, lineW);

  // Heavy Sci-Fi Blaster
  const gunX = 130 * scale;
  const gunY = 84 * scale;
  const gunW = 32 * scale;
  const gunH = 16 * scale;
  drawRect(gunX, gunY, gunW, gunH, 2, 132, 199, 255);
  drawRect(gunX, gunY, gunW, Math.max(1, 2 * scale), 56, 189, 248, 255);

  // Laser Beam & Flare
  const laserStartX = gunX + gunW;
  const laserY = 91 * scale;
  drawLine(laserStartX, laserY, laserStartX + 20 * scale, laserY, 244, 63, 94, 255, Math.max(2, 5 * scale));
  drawCircle(laserStartX + 20 * scale, laserY, Math.max(2, 6 * scale), 251, 191, 36, 255, true);

  return PNG.sync.write(png);
}

const pubDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

// All standard web and mobile icon resolutions
const resolutions = [48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512, 1024];

resolutions.forEach(res => {
  console.log(`Generating icon-${res}x${res}.png...`);
  const buf = drawRobotWarsPNG(res);
  fs.writeFileSync(path.join(pubDir, `icon-${res}x${res}.png`), buf);
  
  if (res === 192) {
    fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), buf);
    fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), buf);
  }
  if (res === 512) {
    fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), buf);
  }
  if (res === 180) {
    fs.writeFileSync(path.join(pubDir, 'apple-touch-icon-180x180.png'), buf);
  }
  if (res === 48) {
    fs.writeFileSync(path.join(pubDir, 'favicon.png'), buf);
  }
});

console.log('All resolution PNG icons created successfully!');
