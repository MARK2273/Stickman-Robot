const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
function makeCrcTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}

const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function encodePNG(width, height, rgbaBuffer) {
  // Raw scanlines with filter byte 0 (None)
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    rawData[y * scanlineLength] = 0; // Filter: None
    rgbaBuffer.copy(rawData, y * scanlineLength + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit per channel
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function drawRobotWarsIcon(size) {
  const buf = Buffer.alloc(size * size * 4);

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (Math.floor(y) * size + Math.floor(x)) * 4;
    const alpha = a / 255;
    const invAlpha = 1 - alpha;
    buf[idx] = Math.min(255, Math.floor(r * alpha + buf[idx] * invAlpha));
    buf[idx + 1] = Math.min(255, Math.floor(g * alpha + buf[idx + 1] * invAlpha));
    buf[idx + 2] = Math.min(255, Math.floor(b * alpha + buf[idx + 2] * invAlpha));
    buf[idx + 3] = Math.min(255, Math.floor(a + buf[idx + 3] * invAlpha));
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

  // 2. Outer Glowing Tech Border
  const borderWidth = Math.max(2, size * 0.02);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nearEdge = x < borderWidth || x >= size - borderWidth || y < borderWidth || y >= size - borderWidth;
      if (nearEdge) {
        setPixel(x, y, 56, 189, 248, 200); // Sky blue neon edge
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
  const lineW = Math.max(3, 7 * scale);

  // Stickman Head (Outer Ring)
  drawCircle(headX, headY, headR, 248, 250, 252, 255, false, lineW);
  // Visor Eye Glow
  drawCircle(headX + 6 * scale, headY - 2 * scale, 4 * scale, 56, 189, 248, 255, true);
  drawLine(headX - 2 * scale, headY - 2 * scale, headX + 12 * scale, headY - 2 * scale, 56, 189, 248, 255, Math.max(2, 3 * scale));

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
  drawLine(laserStartX, laserY, laserStartX + 20 * scale, laserY, 244, 63, 94, 255, Math.max(3, 5 * scale));
  drawCircle(laserStartX + 20 * scale, laserY, 6 * scale, 251, 191, 36, 255, true);

  return encodePNG(size, size, buf);
}

// Generate Icons
const pubDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

console.log('Generating 192x192 PNG...');
const png192 = drawRobotWarsIcon(192);
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), png192);

console.log('Generating 512x512 PNG...');
const png512 = drawRobotWarsIcon(512);
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), png512);

console.log('Generating apple-touch-icon.png...');
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), png192);

console.log('PNG Generation Complete!');
