/**
 * generate-icons.js
 *
 * Generates simple placeholder PNG icons for the Chrome extension.
 * Uses a minimal valid PNG encoder (no dependencies).
 *
 * Run:  node generate-icons.js
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createPNG(size) {
  const radius = Math.round(size * 0.1875); // ~24/128 ratio
  const bg = [26, 26, 26]; // #1a1a1a
  const fg = [255, 255, 255]; // white

  // Build raw pixel data (each row prefixed with filter byte 0)
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 3 + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      if (isInsideRoundedRect(x, y, size, size, radius)) {
        // Simple "H" letter for small sizes
        if (isLetterH(x, y, size)) {
          raw[px] = fg[0];
          raw[px + 1] = fg[1];
          raw[px + 2] = fg[2];
        } else {
          raw[px] = bg[0];
          raw[px + 1] = bg[1];
          raw[px + 2] = bg[2];
        }
      } else {
        // Transparent-ish (white bg for simplicity since we can't do alpha in RGB)
        raw[px] = 255;
        raw[px + 1] = 255;
        raw[px + 2] = 255;
      }
    }
  }

  // Use RGBA for transparency
  const rawRGBA = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    rawRGBA[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 4;
      if (isInsideRoundedRect(x, y, size, size, radius)) {
        if (isLetterH(x, y, size)) {
          rawRGBA[px] = fg[0];
          rawRGBA[px + 1] = fg[1];
          rawRGBA[px + 2] = fg[2];
        } else {
          rawRGBA[px] = bg[0];
          rawRGBA[px + 1] = bg[1];
          rawRGBA[px + 2] = bg[2];
        }
        rawRGBA[px + 3] = 255;
      } else {
        rawRGBA[px] = 0;
        rawRGBA[px + 1] = 0;
        rawRGBA[px + 2] = 0;
        rawRGBA[px + 3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(rawRGBA);

  // Build PNG file
  const chunks = [];

  // Signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(makeChunk("IHDR", ihdr));

  // IDAT
  chunks.push(makeChunk("IDAT", compressed));

  // IEND
  chunks.push(makeChunk("IEND", Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeB, data]);
  const crc = crc32(crcData);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, typeB, data, crcB]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return c ^ 0xffffffff;
}

function isInsideRoundedRect(x, y, w, h, r) {
  // Check if point is inside a rounded rectangle
  if (x >= r && x < w - r) return y >= 0 && y < h;
  if (y >= r && y < h - r) return x >= 0 && x < w;
  // Check corners
  const corners = [
    [r, r],
    [w - r - 1, r],
    [r, h - r - 1],
    [w - r - 1, h - r - 1],
  ];
  for (const [cx, cy] of corners) {
    const dx = x - cx;
    const dy = y - cy;
    if (
      dx * dx + dy * dy <= r * r &&
      ((x < r && y < r) ||
        (x >= w - r && y < r) ||
        (x < r && y >= h - r) ||
        (x >= w - r && y >= h - r))
    ) {
      return true;
    }
  }
  if (x < r && y < r) return false;
  if (x >= w - r && y < r) return false;
  if (x < r && y >= h - r) return false;
  if (x >= w - r && y >= h - r) return false;
  return true;
}

function isLetterH(x, y, size) {
  // Draw a simple "H" in the center
  const margin = Math.round(size * 0.28);
  const barW = Math.max(Math.round(size * 0.14), 2);
  const midY = Math.round(size * 0.5);
  const halfBar = Math.round(barW / 2);

  // Within vertical bounds
  if (y < margin || y >= size - margin) return false;

  // Left stroke
  if (x >= margin && x < margin + barW) return true;
  // Right stroke
  if (x >= size - margin - barW && x < size - margin) return true;
  // Middle crossbar
  if (
    y >= midY - halfBar &&
    y < midY + halfBar &&
    x >= margin &&
    x < size - margin
  )
    return true;

  return false;
}

// Generate icons
const outDir = path.join(__dirname, "icons");
for (const size of [16, 48, 128]) {
  const png = createPNG(size);
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), png);
  console.log(`✓ icons/icon${size}.png (${png.length} bytes)`);
}
